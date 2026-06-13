import { useMemo, useState } from 'react';
import {
  Tabs,
  Card,
  Space,
  Input,
  Table,
  Tag,
  Empty,
  Spin,
  Result,
  Button,
  message,
  Tooltip,
  Modal,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { CopyOutlined, ReloadOutlined } from '@ant-design/icons';

type VerifyMode = 'multimodal' | 'text';

type HistoryRow = {
  id: string;
  verifyAt: string; // 已格式化时间字符串
  completionAt: string; // 已格式化时间字符串
  contentSummary: string;
  direction: '入' | '出';
  isSafe: 0 | 1;
  md5: string;
  violations: string[]; // 违规类型列表：展示前2个，剩余用 +x 且 Tooltip 展示
  taskStatus: '已完成' | '进行中' | '已取消';

  // 详情页展示字段（与输入/输出检测接口响应字段同构）
  requestId: string;
  action: number;
  hitType: string;
  hitSubType: string;
  contentDescription?: string;
  raw: Record<string, unknown>;
};

function safeTag(isSafe: 0 | 1) {
  return isSafe === 1 ? (
    <Tag color="#52c41a" style={{ fontWeight: 600 }}>
      合规
    </Tag>
  ) : (
    <Tag color="#f5222d" style={{ fontWeight: 600 }}>
      不合规
    </Tag>
  );
}

function statusTag(status: HistoryRow['taskStatus']) {
  if (status === '已完成') return <Tag color="#87d068">{status}</Tag>;
  if (status === '进行中') return <Tag color="#1890ff">{status}</Tag>;
  return <Tag color="#d9d9d9">{status}</Tag>;
}

function md5Cell(md5: string) {
  return (
    <Space size={8}>
      <Tooltip title={md5}>
        <span style={{ maxWidth: 120, display: 'inline-block', overflow: 'hidden', textOverflow: 'ellipsis' }}>{md5}</span>
      </Tooltip>
      <Button
        size="small"
        icon={<CopyOutlined />}
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(md5);
            message.success('MD5 已复制');
          } catch {
            message.warning('复制失败（浏览器权限限制）');
          }
        }}
      />
    </Space>
  );
}

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

type CodeLogRow = {
  id: string;
  detectAt: string;
  service: string;
  file: string;
  category: string;
  level: string;
  action: string;
  detail: string;
};

export default function VerificationHistory() {
  const [mode, setMode] = useState<VerifyMode>('multimodal');
  const [search, setSearch] = useState<string>('');

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [detailVisible, setDetailVisible] = useState<boolean>(false);
  const [detailRow, setDetailRow] = useState<HistoryRow | null>(null);

  const directionLabel = (d: HistoryRow['direction']) => (d === '入' ? '输入' : '输出');

  const violationsCell = (vs: string[]) => {
    const safe = vs ?? [];
    if (safe.length <= 1) return <span>{safe[0] ?? ''}</span>;
    const firstTwo = safe.slice(0, 2);
    const rest = safe.slice(2);
    const title = safe.join('，');
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, maxWidth: 210 }}>
        {firstTwo.map((v, idx) => (
          <span
            // eslint-disable-next-line react/no-array-index-key
            key={idx}
            style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
          >
            {v}
          </span>
        ))}
        {rest.length > 0 && (
          <Tooltip title={title}>
            <span style={{ whiteSpace: 'nowrap' }}>+{rest.length}</span>
          </Tooltip>
        )}
      </div>
    );
  };

  const baseRows: HistoryRow[] = useMemo(() => {
    const multimodal: HistoryRow[] = [
      {
        id: '1',
        verifyAt: '2026-03-18 15:23:12',
        completionAt: '2026-03-18 15:23:12',
        contentSummary: '身份证图片 + 输入文本“张明”',
        direction: '入',
        isSafe: 1,
        md5: '7d8f9e3a2b1c5d4e6f7a8b9c0d1e2f3a',
        violations: ['无违规'],
        taskStatus: '已完成',
        requestId: '20260318_152312_img001',
        action: 0,
        hitType: 'security',
        hitSubType: 'normal',
        contentDescription: '检测结果：输入内容为安全输入。',
        raw: {
          code: '0',
          message: '成功',
          data: {
            requestId: '20260318_152312_img001',
            isSafe: 1,
            action: 0,
            hitType: 'security',
            subHitType: 'normal',
            contentDescription: '检测结果：输入内容为安全输入。',
          },
          time: '2026-03-18 15:23:25',
        },
      },
      {
        id: '2',
        verifyAt: '2026-03-18 14:45:30',
        completionAt: '2026-03-18 14:45:30',
        contentSummary: '合同文档 + 输入文本“50000元”',
        direction: '入',
        isSafe: 1,
        md5: 'a1b2c3d4e5f67890abcdef1234567890',
        violations: ['无违规'],
        taskStatus: '已完成',
        requestId: '20260318_144530_doc002',
        action: 0,
        hitType: 'security',
        hitSubType: 'normal',
        contentDescription: '检测结果：合同内容符合安全规范。',
        raw: {
          code: '0',
          message: '成功',
          data: {
            requestId: '20260318_144530_doc002',
            isSafe: 1,
            action: 0,
            hitType: 'security',
            subHitType: 'normal',
            contentDescription: '检测结果：合同内容符合安全规范。',
          },
          time: '2026-03-18 14:45:40',
        },
      },
      {
        id: '3',
        verifyAt: '2026-03-18 11:20:15',
        completionAt: '2026-03-18 11:20:15',
        contentSummary: '敏感人物图片 + 输入文本',
        direction: '入',
        isSafe: 0,
        md5: '9bc8c7d6e5d4a3b2c1d0e9f8a7b6c5d4',
        violations: ['违规人物（负面）', '违规人物（负面）', '违规人物（负面）'],
        taskStatus: '已完成',
        requestId: '20260318_112015_img003',
        action: 1,
        hitType: 'security',
        hitSubType: 'normal',
        contentDescription: '检测结果：命中违规人物特征（多项）。',
        raw: {
          code: '0',
          message: '成功',
          data: {
            requestId: '20260318_112015_img003',
            isSafe: 0,
            action: 1,
            hitType: 'security',
            subHitType: 'normal',
            contentDescription: '检测结果：命中违规人物特征（多项）。',
          },
          time: '2026-03-18 11:20:20',
        },
      },
      {
        id: '4',
        verifyAt: '2026-03-17 16:38:22',
        completionAt: '2026-03-17 16:38:22',
        contentSummary: '身份证 + 申请表 + 验证文本',
        direction: '入',
        isSafe: 1,
        md5: '3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b',
        violations: ['无违规'],
        taskStatus: '已完成',
        requestId: '20260317_163822_img004',
        action: 0,
        hitType: 'security',
        hitSubType: 'normal',
        contentDescription: '检测结果：输入为安全输入。',
        raw: {
          code: '0',
          message: '成功',
          data: {
            requestId: '20260317_163822_img004',
            isSafe: 1,
            action: 0,
            hitType: 'security',
            subHitType: 'normal',
            contentDescription: '检测结果：输入为安全输入。',
          },
          time: '2026-03-17 16:38:33',
        },
      },
      {
        id: '5',
        verifyAt: '2026-03-17 14:22:10',
        completionAt: '2026-03-17 14:22:10',
        contentSummary: '合同文件 + PDF + 输入文本“违约金”',
        direction: '入',
        isSafe: 0,
        md5: 'f1e2d3c4b5a6f7890edcb9876543210',
        violations: ['违规条例', '违规条例'],
        taskStatus: '已完成',
        requestId: '20260317_142210_doc005',
        action: 1,
        hitType: 'security',
        hitSubType: 'normal',
        contentDescription: '检测结果：合同文本命中违规条例（2项）。',
        raw: {
          code: '0',
          message: '成功',
          data: {
            requestId: '20260317_142210_doc005',
            isSafe: 0,
            action: 1,
            hitType: 'security',
            subHitType: 'normal',
            contentDescription: '检测结果：合同文本命中违规条例（2项）。',
          },
          time: '2026-03-17 14:22:18',
        },
      },
      {
        id: '6',
        verifyAt: '2026-03-17 09:30:00',
        completionAt: '-',
        contentSummary: '证件图片 + 输入文本（异步处理中）',
        direction: '入',
        isSafe: 1,
        md5: 'd4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9',
        violations: ['无违规'],
        taskStatus: '进行中',
        requestId: '20260317_093000_img006',
        action: 0,
        hitType: 'security',
        hitSubType: 'normal',
        contentDescription: '检测结果：处理中（示例）。',
        raw: {
          code: '0',
          message: '成功',
          data: {
            requestId: '20260317_093000_img006',
            isSafe: 1,
            action: 0,
            hitType: 'security',
            subHitType: 'normal',
            contentDescription: '检测结果：处理中（示例）。',
          },
          time: '2026-03-17 09:30:05',
        },
      },
    ];

    const text: HistoryRow[] = [
      {
        id: 't1',
        verifyAt: '2026-03-12 13:48:47',
        completionAt: '2026-03-12 13:48:47',
        contentSummary: 'A 文本：online_test_template.xlsx',
        direction: '入',
        isSafe: 1,
        md5: '7d8f9e3a2b1c5d4e6f7a8b9c0d1e2f3a',
        violations: ['无违规'],
        taskStatus: '已完成',
        requestId: '20260312_134847_txt101',
        action: 0,
        hitType: 'security',
        hitSubType: 'normal',
        contentDescription: '检测结果：文本为安全输入。',
        raw: {
          code: '0',
          message: '成功',
          data: {
            requestId: '20260312_134847_txt101',
            isSafe: 1,
            action: 0,
            hitType: 'security',
            subHitType: 'normal',
            contentDescription: '检测结果：文本为安全输入。',
          },
          time: '2026-03-12 13:48:55',
        },
      },
      {
        id: 't2',
        verifyAt: '2025-11-06 13:40:42',
        completionAt: '2025-11-06 13:40:42',
        contentSummary: 'A 文本：online_test_template (1).xlsx',
        direction: '入',
        isSafe: 0,
        md5: 'a1b2c3d4e5f67890abcdef1234567890',
        violations: Array.from({ length: 15 }, () => '违规人物（负面）'),
        taskStatus: '已完成',
        requestId: '20251106_134042_txt102',
        action: 1,
        hitType: 'security',
        hitSubType: 'normal',
        contentDescription: '检测结果：文本命中违规人物特征（15项）。',
        raw: {
          code: '0',
          message: '成功',
          data: {
            requestId: '20251106_134042_txt102',
            isSafe: 0,
            action: 1,
            hitType: 'security',
            subHitType: 'normal',
            contentDescription: '检测结果：文本命中违规人物特征（15项）。',
          },
          time: '2025-11-06 13:40:50',
        },
      },
    ];

    return mode === 'multimodal' ? multimodal : text;
  }, [mode]);

  const codeLogRows: CodeLogRow[] = useMemo(
    () => [
      {
        id: 'c1',
        detectAt: '2026-06-13 10:42:15',
        service: 'payment-gateway',
        file: 'AuthSignService.ts:18',
        category: '不安全的加密识别策略',
        level: '高危',
        action: '阻断发布',
        detail: '命中 MD5 黑名单算法，已按高危加密策略记录并外送整改通知。',
      },
      {
        id: 'c2',
        detectAt: '2026-06-13 10:42:15',
        service: 'payment-gateway',
        file: 'deploy.sh:05',
        category: '权限提升识别策略',
        level: '高危',
        action: '安全告警',
        detail: '检测到 sudo + 服务重启链路，已写入提权风险日志并通知安全运营。',
      },
      {
        id: 'c3',
        detectAt: '2026-06-13 10:42:15',
        service: 'payment-gateway',
        file: 'TokenUtil.ts:27',
        category: '数据泄露的识别策略',
        level: '中危',
        action: '生成工单',
        detail: '发现 accessToken 日志打印，已按敏感字段泄露规则外送整改工单。',
      },
      {
        id: 'c4',
        detectAt: '2026-06-13 10:42:15',
        service: 'payment-gateway',
        file: 'RandomCode.js:42',
        category: '代码弱风险检测规则',
        level: '中危',
        action: '记录审计',
        detail: '命中弱随机数规则，已关联代码风险分类规则并输出结构化结果。',
      },
    ],
    []
  );

  const codeLogColumns: ColumnsType<CodeLogRow> = useMemo(
    () => [
      {
        title: '检测时间',
        dataIndex: 'detectAt',
        key: 'detectAt',
        width: 160,
      },
      {
        title: '服务',
        dataIndex: 'service',
        key: 'service',
        width: 150,
      },
      {
        title: '文件位置',
        dataIndex: 'file',
        key: 'file',
        width: 180,
        render: (value: string) => <span style={{ fontWeight: 600 }}>{value}</span>,
      },
      {
        title: '检测策略',
        dataIndex: 'category',
        key: 'category',
        width: 180,
      },
      {
        title: '等级',
        dataIndex: 'level',
        key: 'level',
        width: 100,
        render: (value: string) => (
          <Tag color={value === '高危' ? '#f5222d' : '#faad14'} style={{ fontWeight: 600 }}>
            {value}
          </Tag>
        ),
      },
      {
        title: '外送动作',
        dataIndex: 'action',
        key: 'action',
        width: 120,
      },
      {
        title: '检测日志',
        dataIndex: 'detail',
        key: 'detail',
      },
    ],
    []
  );

  const filteredRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return baseRows;
    return baseRows.filter((r) => r.contentSummary.toLowerCase().includes(q) || r.md5.toLowerCase().includes(q));
  }, [baseRows, search]);

  const columns: ColumnsType<HistoryRow> = useMemo(
    () => [
      {
        title: '验证时间',
        dataIndex: 'verifyAt',
        key: 'verifyAt',
        width: 150,
      },
      {
        title: '完成时间',
        dataIndex: 'completionAt',
        key: 'completionAt',
        width: 150,
        render: (v: string) => <span style={{ color: v === '-' ? 'rgba(0,0,0,0.45)' : undefined }}>{v}</span>,
      },
      {
        title: '检测内容',
        dataIndex: 'contentSummary',
        key: 'contentSummary',
        render: (v: string) => <span style={{ fontWeight: 600 }}>{v}</span>,
      },
      {
        title: '方向',
        dataIndex: 'direction',
        key: 'direction',
        width: 90,
        render: (d: HistoryRow['direction']) => <Tag>{directionLabel(d)}</Tag>,
      },
      {
        title: '是否合规',
        dataIndex: 'isSafe',
        key: 'isSafe',
        width: 110,
        render: (v: 0 | 1) => safeTag(v),
      },
      {
        title: '文件MD5',
        dataIndex: 'md5',
        key: 'md5',
        render: (v: string) => md5Cell(v),
      },
      {
        title: '违规类型',
        dataIndex: 'violations',
        key: 'violations',
        render: (_: string[], row: HistoryRow) => violationsCell(row.violations),
      },
      {
        title: '任务状态',
        dataIndex: 'taskStatus',
        key: 'taskStatus',
        width: 110,
        render: (v: HistoryRow['taskStatus']) => statusTag(v),
      },
      {
        title: '操作',
        key: 'view',
        width: 90,
        render: (_: unknown, row: HistoryRow) => (
          <Button
            size="small"
            type="default"
            onClick={() => {
              setDetailRow(row);
              setDetailVisible(true);
            }}
          >
            查看
          </Button>
        ),
      },
    ],
    [directionLabel, violationsCell]
  );

  const doSearch = async () => {
    setError(null);
    setLoading(true);
    try {
      // demo：模拟搜索请求延迟
      await new Promise((r) => setTimeout(r, 450));
      message.success('已更新搜索结果');
    } catch (e) {
      setError(e instanceof Error ? e.message : '搜索失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="verification-history-page" style={{ display: 'flex', flexDirection: 'column', gap: 16, minHeight: '100%', background: '#f5f6fa' }}>
      <Card
        bordered={false}
        style={{ background: '#ffffff', borderRadius: 12 }}
        bodyStyle={{ padding: 16 }}
      >
        <Space direction="vertical" size={12} style={{ width: '100%' }}>
          <Space style={{ justifyContent: 'space-between', width: '100%' }} align="center">
            <div style={{ fontSize: 18, fontWeight: 700 }}>验证历史记录</div>
            <Input.Search
              allowClear
              style={{ width: 320 }}
              placeholder="搜索文件名、MD5..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onSearch={() => doSearch()}
            />
          </Space>

          <Tabs
            activeKey={mode}
            onChange={(k) => {
              setMode(k as VerifyMode);
              setError(null);
              setSearch('');
            }}
          >
            <Tabs.TabPane tab="多模态验证" key="multimodal" />
            <Tabs.TabPane tab="文本检测" key="text" />
          </Tabs>

          {error ? (
            <Result
              status="error"
              title="获取验证历史失败"
              subTitle={error}
              extra={
                <Button
                  type="primary"
                  icon={<ReloadOutlined />}
                  onClick={() => {
                    setError(null);
                    doSearch();
                  }}
                >
                  重试
                </Button>
              }
            />
          ) : (
            <div>
              {loading ? (
                <div style={{ minHeight: 260, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Spin />
                </div>
              ) : (
                <Table
                  rowKey="id"
                  columns={columns}
                  dataSource={filteredRows}
                  pagination={{
                    pageSize: 5,
                    showSizeChanger: false,
                    position: ['bottomCenter'],
                  }}
                />
              )}

              {!loading && filteredRows.length === 0 && <Empty style={{ marginTop: 24 }} description="暂无匹配的验证记录" />}
            </div>
          )}
        </Space>
      </Card>

      <Card
        bordered={false}
        style={{ background: '#ffffff', borderRadius: 12 }}
        bodyStyle={{ padding: 16 }}
      >
        <Space direction="vertical" size={12} style={{ width: '100%' }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 700 }}>代码检测日志</div>
            <div style={{ marginTop: 6, color: 'rgba(0,0,0,0.45)', fontSize: 13 }}>
              展示代码弱风险检测规则、不安全的加密识别策略、权限提升识别策略、数据泄露识别策略，以及代码风险分类、风险等级判定和结构化输出模板相关的外送日志。
            </div>
          </div>

          <Table
            rowKey="id"
            columns={codeLogColumns}
            dataSource={codeLogRows}
            pagination={false}
          />
        </Space>
      </Card>

      <Modal
        visible={detailVisible}
        title="验证结果详情"
        footer={null}
        onCancel={() => setDetailVisible(false)}
        width={760}
      >
        {detailRow ? (
          <Space direction="vertical" size={12} style={{ width: '100%' }}>
            <Space align="start" style={{ justifyContent: 'space-between', width: '100%' }}>
              <div style={{ fontWeight: 700, fontSize: 16 }}>安全状态：{detailRow.isSafe === 1 ? '安全' : '不安全'}</div>
              {safeTag(detailRow.isSafe)}
            </Space>

            <div style={{ padding: 12, border: '1px solid #f0f0f0', borderRadius: 10 }}>
              <div style={{ marginBottom: 8 }}>
                <span style={{ color: 'rgba(0,0,0,0.45)' }}>命中类型：</span>
                <span style={{ fontWeight: 600 }}>{detailRow.hitType}</span>
              </div>
              <div style={{ marginBottom: 8 }}>
                <span style={{ color: 'rgba(0,0,0,0.45)' }}>二级类型：</span>
                <span style={{ fontWeight: 600 }}>{detailRow.hitSubType}</span>
              </div>
              <div style={{ marginBottom: 8 }}>
                <span style={{ color: 'rgba(0,0,0,0.45)' }}>检测方向：</span>
                <Tag>{directionLabel(detailRow.direction)}</Tag>
              </div>
              {detailRow.contentDescription ? (
                <div style={{ marginBottom: 0 }}>
                  <span style={{ color: 'rgba(0,0,0,0.45)' }}>内容：</span>
                  <span>{detailRow.contentDescription}</span>
                </div>
              ) : null}
            </div>

            <div style={{ padding: 12, border: '1px solid #f0f0f0', borderRadius: 10 }}>
              <div style={{ color: 'rgba(0,0,0,0.45)', marginBottom: 8 }}>违规类型</div>
              {violationsCell(detailRow.violations)}
            </div>

            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <Button
                size="small"
                onClick={() => {
                  downloadJson(`verification_${detailRow.requestId}.json`, detailRow.raw);
                }}
              >
                原始 JSON
              </Button>
              <Button size="small" type="primary" onClick={() => setDetailVisible(false)}>
                关闭
              </Button>
            </div>
          </Space>
        ) : null}
      </Modal>
    </div>
  );
}
