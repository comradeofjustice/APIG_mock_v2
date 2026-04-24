import { useMemo, useState } from 'react';
import {
  Upload,
  Button,
  Card,
  Space,
  Input,
  Empty,
  Spin,
  Result,
  message,
} from 'antd';
import type { UploadFile } from 'antd/lib/upload/interface';
import { DownloadOutlined, ReloadOutlined } from '@ant-design/icons';

type Direction = 'input' | 'output';

type VerificationResult = {
  safeStatus: '安全' | '不安全';
  requestId?: string;
  action?: number;
  hitType: string;
  hitSubType: string;
  contentDescription?: string;
  direction: Direction;
  // 用于“下载原始 JSON”
  raw: Record<string, unknown>;
};

function downloadJson(filename: string, data: unknown) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

async function postJson(url: string, body: unknown) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  const text = await res.text();
  if (!text) throw new Error(`接口返回空内容：${res.status}`);

  try {
    const json = JSON.parse(text);
    return { ok: res.ok, status: res.status, json };
  } catch {
    throw new Error(`接口返回非 JSON：HTTP ${res.status}，body=${text.slice(0, 200)}`);
  }
}

function toVerificationResult(params: {
  apiJson: Record<string, unknown>;
  direction: Direction;
}): VerificationResult {
  const { apiJson, direction } = params;
  const data = apiJson?.data as Record<string, unknown> | undefined;
  const isSafeRaw = data?.isSafe ?? apiJson['isSafe'];
  const actionRaw = data?.action ?? apiJson['action'];
  const hitTypeRaw = data?.hitType ?? apiJson['hitType'];
  const subHitTypeRaw = data?.subHitType ?? apiJson['subHitType'];
  const requestIdRaw = data?.requestId ?? apiJson['requestId'];
  const contentDescriptionRaw = data?.contentDescription ?? apiJson['contentDescription'];

  const safeStatus: '安全' | '不安全' = Number(isSafeRaw) === 1 ? '安全' : '不安全';

  return {
    safeStatus,
    requestId: typeof requestIdRaw === 'string' ? requestIdRaw : undefined,
    action: typeof actionRaw === 'number' ? actionRaw : Number(actionRaw),
    hitType: String(hitTypeRaw ?? ''),
    hitSubType: String(subHitTypeRaw ?? ''),
    contentDescription: typeof contentDescriptionRaw === 'string' ? contentDescriptionRaw : undefined,
    direction,
    raw: apiJson,
  };
}

async function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

function getFileExtLower(file: File) {
  const name = file.name ?? '';
  const idx = name.lastIndexOf('.');
  return idx >= 0 ? name.slice(idx + 1).toLowerCase() : '';
}

function isImageExt(ext: string) {
  return ['png', 'jpg', 'jpeg', 'gif'].includes(ext);
}

async function extractTextFromDocx(buffer: ArrayBuffer): Promise<string> {
  const mammothMod = await import('mammoth');
  const mammoth = (mammothMod as any).default ?? mammothMod;

  const tryExtractRawText = async () => {
    const result = await mammoth.extractRawText({ arrayBuffer: buffer });
    return String(result.value ?? '').trim();
  };

  const rawText = await tryExtractRawText();
  if (rawText.length >= 5) return rawText;

  // Fallback：有些 DOCX 的“可提取文本”在 extractRawText 下为空，
  // 此时尝试转 HTML 再去标签得到尽力文本（仍可能为空）。
  try {
    const htmlRes = await mammoth.convertToHtml({ arrayBuffer: buffer });
    const html = String(htmlRes.value ?? '');
    const stripped = html
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, ' ')
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, ' ')
      .replace(/<\/?[^>]+>/g, ' ')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/\s+/g, ' ')
      .trim();
    return stripped;
  } catch {
    return rawText;
  }
}

async function extractTextFromPdf(file: File): Promise<string> {
  const pdfjsLib = await import('pdfjs-dist/legacy/build/pdf.mjs');
  try {
    const workerSrc = new URL('pdfjs-dist/legacy/build/pdf.worker.min.mjs', import.meta.url).toString();
    (pdfjsLib as any).GlobalWorkerOptions.workerSrc = workerSrc;
  } catch {
    // ignore
  }

  const arrayBuffer = await file.arrayBuffer();
  const getDoc = (pdfjsLib as any).getDocument ?? (pdfjsLib as any).default?.getDocument;
  const loadingTask = getDoc({ data: arrayBuffer });
  const pdf = await loadingTask.promise;

  const maxPages = Math.min(pdf.numPages ?? 0, 3);
  let text = '';
  for (let pageNum = 1; pageNum <= maxPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const content = await page.getTextContent();
    const strings = content.items?.map((it: any) => String(it.str ?? '')).filter(Boolean) ?? [];
    text += strings.join(' ') + '\n';
  }
  return text.trim();
}

async function extractTextFromDocument(file: File): Promise<string> {
  const ext = getFileExtLower(file);
  if (ext === 'pdf') return extractTextFromPdf(file);
  if (ext === 'docx') return extractTextFromDocx(await file.arrayBuffer());
  if (ext === 'doc') {
    // mammoth 对 .doc 支持不稳定：这里保底用 mammoth 尝试提取
    // 若失败，返回空串并由上层提示
    const buf = await file.arrayBuffer();
    try {
      return extractTextFromDocx(buf);
    } catch {
      return '';
    }
  }
  throw new Error(`不支持的文档扩展名：.${ext}`);
}

export default function MultimodalValidation() {
  const [direction, setDirection] = useState<Direction>('input');
  const [textValue, setTextValue] = useState<string>('');
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  const [verifying, setVerifying] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<VerificationResult | null>(null);

  const { Dragger } = Upload;

  // 上传支持：图片 + 文档；文档类型将前端解析为 OCR 文本再传给接口。
  const acceptExt = useMemo(() => '.png,.jpg,.jpeg,.gif,.docx,.doc,.pdf', []);

  const hasAnyInput = fileList.length > 0 || textValue.trim().length > 0;

  const verifyInputByApi = async (): Promise<VerificationResult> => {
    // 输入检测接口（你已提供契约）
    const messages: Array<Record<string, unknown>> = [];

    for (const f of fileList) {
      const originFile = f.originFileObj;
      if (!originFile) continue;

      const file = originFile as File;
      const ext = getFileExtLower(file);
      const fileName = f.name;
      const fileSize = typeof file.size === 'number' ? file.size : undefined;

      const isImage = file.type.startsWith('image/') || isImageExt(ext);

      if (isImage) {
        // 图片：转换为 image_url（Base64 dataURL）
        const dataUrl = await fileToDataUrl(file);
        messages.push({
          type: 'image_url',
          image_url: { url: dataUrl },
          fileName,
          fileSize,
        });
        continue;
      }

      // 文档：提取 OCR 文本后以 text 发送
      let ocrText = '';
      try {
        ocrText = await extractTextFromDocument(file);
      } catch (e) {
        message.warning(
          `文档解析失败，将发送输入框文本为主：${e instanceof Error ? e.message : String(e)}`
        );
        ocrText = '';
      }

      const ocrPayloadText =
        ocrText.trim().length > 0
          ? `[OCR] ${ocrText.trim()}`
          : '[OCR] （文档未解析到可用文字；可能为扫描图片版本）';

      messages.push({
        type: 'text',
        text: ocrPayloadText,
        fileName,
        fileSize,
      });
    }

    const text = textValue.trim();
    if (text.length > 0) {
      messages.push({ type: 'text', text });
    }

    const now = new Date();
    const requestIdMock = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(
      now.getDate()
    ).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(
      2,
      '0'
    )}_${fileList[0]?.name ? 'file' : 'img'}001`;

    const mockedJson: Record<string, unknown> = {
      code: '0',
      message: '成功',
      data: {
        requestId: requestIdMock,
        isSafe: 1,
        action: 0,
        hitType: 'security',
        subHitType: 'normal',
        contentDescription:
          '图片/文档内容已通过输入检测（当前为前端 mock）。可用于检查 isSafe/action/hitType/subHitType/requestId 等字段渲染。',
      },
      time: now.toISOString().replace('T', ' ').replace('Z', ''),
    };

    // 尝试真实调用输入检测接口；失败则回退 mock
    try {
      const apiResp = await postJson('/api/v1/multimodal/image/input/analyze', { messages });
      const apiJson = apiResp.json as Record<string, unknown>;
      const data = apiJson?.data as Record<string, unknown> | undefined;
      if (!data || typeof data.requestId !== 'string') {
        throw new Error('输入检测响应缺少 data.requestId');
      }
      // 若后端返回 code != 0，也回退
      const code = apiJson?.code;
      if (code !== undefined && code !== '0' && code !== 0) {
        throw new Error(`接口返回失败：code=${String(code)}, message=${String(apiJson?.message ?? '')}`);
      }
      return toVerificationResult({ apiJson, direction });
    } catch (e) {
      // 内网环境可能尚未连通：回退 mock 以继续跑通 UI
      message.warning(`输入检测真实请求失败，已回退 mock：${e instanceof Error ? e.message : String(e)}`);
      await new Promise((r) => setTimeout(r, 300));
      return toVerificationResult({ apiJson: mockedJson, direction });
    }
  };

  const verifyOutputByApi = async (): Promise<VerificationResult> => {
    // 输出检测必须先调用输入检测拿到 requestId，并作为 reqId 传入。
    const inputRes = await verifyInputByApi();
    const reqId = inputRes.requestId;
    if (!reqId) {
      throw new Error('输入检测返回缺少 requestId，无法继续输出检测');
    }

    const now = new Date();
    const mockedJson: Record<string, unknown> = {
      code: '0',
      message: '成功',
      data: {
        requestId: `${reqId}_out`,
        isSafe: 1,
        action: 0,
        hitType: 'security',
        subHitType: 'normal',
        contentDescription: '大模型生成的图片/内容通过输出检测（当前为前端 mock）。',
        // 额外携带：展示 reqId 在链路中的传递
        reqIdUsed: reqId,
      },
      time: now.toISOString().replace('T', ' ').replace('Z', ''),
    };

    // 尝试真实调用输出检测接口；失败则回退 mock
    try {
      const apiResp = await postJson('/api/v1/multimodal/image/output/analyze', { reqId });
      const apiJson = apiResp.json as Record<string, unknown>;
      const data = apiJson?.data as Record<string, unknown> | undefined;
      if (!data || typeof data.requestId !== 'string') {
        throw new Error('输出检测响应缺少 data.requestId');
      }
      const code = apiJson?.code;
      if (code !== undefined && code !== '0' && code !== 0) {
        throw new Error(`接口返回失败：code=${String(code)}, message=${String(apiJson?.message ?? '')}`);
      }
      return toVerificationResult({ apiJson, direction });
    } catch (e) {
      message.warning(`输出检测真实请求失败，已回退 mock：${e instanceof Error ? e.message : String(e)}`);
      await new Promise((r) => setTimeout(r, 300));
      return toVerificationResult({ apiJson: mockedJson, direction });
    }
  };

  const onVerify = async () => {
    if (!hasAnyInput) {
      message.error('请先上传图片/文档或输入文本内容');
      setError('未提供输入（图片或文本）');
      setResult(null);
      return;
    }

    if (direction === 'output') {
      setError(null);
      setResult(null);
      setVerifying(true);
      try {
        const r = await verifyOutputByApi();
        setResult(r);
        setFileList([]);
        message.success('输出检测完成');
      } catch {
        setError('输出检测失败');
        message.error('输出检测失败');
      } finally {
        setVerifying(false);
      }
      return;
    }

    setError(null);
    setResult(null);
    setVerifying(true);
    try {
      const r = await verifyInputByApi();
      setResult(r);
      setFileList([]);
      message.success('验证完成');
    } catch {
      setError('验证失败');
      message.error('验证失败');
    } finally {
      setVerifying(false);
    }
  };

  const onReset = () => {
    setDirection('input');
    setTextValue('');
    setFileList([]);
    setVerifying(false);
    setError(null);
    setResult(null);
    message.info('已重置');
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        minHeight: '100%',
        background: '#f5f6fa',
      }}
    >
      <Card
        bordered={false}
        style={{
          background: '#ffffff',
          borderRadius: 9,
          overflow: 'hidden',
        }}
      >
        <div style={{ display: 'flex', gap: 16, alignItems: 'stretch' }}>
          {/* Left: input */}
          <div style={{ flex: 1, minWidth: 360 }}>
            <Space direction="vertical" size={16} style={{ width: '100%' }}>
              <div>
                <Button.Group>
                  <Button
                    type={direction === 'input' ? 'primary' : 'default'}
                    onClick={() => setDirection('input')}
                  >
                    输入检测
                  </Button>
                  <Button
                    type={direction === 'output' ? 'primary' : 'default'}
                    onClick={() => setDirection('output')}
                  >
                    输出检测
                  </Button>
                </Button.Group>
              </div>

              <Dragger
                accept={acceptExt}
                fileList={fileList}
                beforeUpload={(file) => {
                  setFileList([
                    {
                      uid: file.uid,
                      name: file.name,
                      status: 'done',
                      originFileObj: file,
                    } as UploadFile,
                  ]);
                  return false;
                }}
                onRemove={() => {
                  setFileList([]);
                }}
                style={{ padding: 16, borderRadius: 8 }}
              >
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontWeight: 600, marginBottom: 8 }}>拖拽或点击上传图片/文档</div>
                  <div style={{ color: 'rgba(0,0,0,0.45)', marginBottom: 8 }}>PNG · JPG · GIF · DOCX · DOC · PDF</div>
                  <Button size="small">选择文件</Button>
                </div>
              </Dragger>

              <div style={{ color: 'rgba(0,0,0,0.45)', minHeight: 24 }}>
                {fileList.length === 0 ? '暂无文件' : `已选择：${fileList[0].name}`}
              </div>

              <div>
                <div style={{ fontWeight: 600, marginBottom: 8 }}>文本内容输入</div>
                <Input.TextArea
                  rows={4}
                  value={textValue}
                  onChange={(e) => setTextValue(e.target.value)}
                  placeholder="请输入要验证的文本内容..."
                />
              </div>

              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <Button type="primary" onClick={onVerify} disabled={verifying}>
                  验证
                </Button>
                <Button onClick={onReset} icon={<ReloadOutlined />} disabled={verifying}>
                  重置
                </Button>
              </div>
            </Space>
          </div>

          {/* Right: result */}
          <div style={{ width: 420 }}>
            <Card
              title="响应结果（检测结果）"
              style={{
                borderRadius: 12,
                background: '#ffffff',
              }}
            >
              {verifying ? (
                <div style={{ minHeight: 220, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Spin />
                </div>
              ) : error ? (
                <Result status="error" title="验证失败" subTitle={error} />
              ) : result ? (
                <Space direction="vertical" size={12} style={{ width: '100%' }}>
                  <Button
                    icon={<DownloadOutlined />}
                    onClick={() => downloadJson('multimodal-verify.json', result.raw)}
                    type="default"
                  >
                    原始 JSON
                  </Button>

                  <div
                    style={{
                      border: '1px solid rgba(0,0,0,0.08)',
                      borderRadius: 10,
                      padding: 14,
                      background: '#fbfcff',
                    }}
                  >
                    <div style={{ fontWeight: 700, marginBottom: 10 }}>=== 检测结果 ===</div>
                    <div style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, Liberation Mono, monospace' }}>
                      <div>安全状态：{result.safeStatus}</div>
                      <div>命中类型：{result.hitType}</div>
                      <div>二级类型：{result.hitSubType}</div>
                      {typeof result.action === 'number' && <div>动作：{result.action}</div>}
                      {typeof result.requestId === 'string' && <div>请求ID：{result.requestId}</div>}
                      {typeof result.contentDescription === 'string' && <div>内容描述：{result.contentDescription}</div>}
                      <div>方向属性：{result.direction}</div>
                    </div>
                  </div>
                </Space>
              ) : (
                <div style={{ minHeight: 220 }}>
                  <Empty description="暂无检测结果" />
                </div>
              )}
            </Card>
          </div>
        </div>
      </Card>
    </div>
  );
}

