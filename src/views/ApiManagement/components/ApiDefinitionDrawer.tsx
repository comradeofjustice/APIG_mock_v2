/**
 * API 定义抽屉组件
 *
 * 重新设计后：
 * - 保留：请求基础定义、后端服务信息（不可修改）
 * - 移除：Path参数、请求Headers、请求Query、常量参数、自定义系统参数
 * - 导出：导出API文档-OpenApi / 导出API文档-Word
 * - 保留：返回结果、错误码定义
 */

import { useEffect, useState } from 'react';
import {
  Drawer,
  Descriptions,
  Table,
  Button,
  Space,
  Tag,
  Spin,
  Typography,
  Card,
  Dropdown,
  Menu,
  Tabs,
  Form,
  Input,
  Select,
  InputNumber,
  Popconfirm,
} from 'antd';
import {
  PlusOutlined,
} from '@ant-design/icons';
import type { ApiDefinition, ApiParameter, ApiParamType, ErrorCodeItem } from '../types';
import { getApiDetail, exportOpenApiDoc, exportWordDoc } from '../services';

const { Text } = Typography;

// API参数区域小组件
interface ApiParamSectionProps {
  title: string;
  params: ApiParameter[];
  paramType: ApiParamType;
  editing: boolean;
  columns: any[];
}

function ApiParamSection({ title, params, paramType, editing, columns }: ApiParamSectionProps) {
  return (
    <div style={{ marginBottom: 16 }}>
      <Text strong style={{ fontSize: 13, marginBottom: 8, display: 'block' }}>
        {title} ({params.length})
      </Text>
      <Table
        size="small"
        dataSource={params}
        rowKey={(record) => record.id || record.name}
        pagination={false}
        columns={columns}
        locale={{
          emptyText: (
            <div style={{ padding: 16 }}>
              <Text type="secondary">暂无参数</Text>
            </div>
          ),
        }}
      />
    </div>
  );
}

interface ApiDefinitionDrawerProps {
  visible: boolean;
  apiId?: number;
  onClose: () => void;
  onEdit?: (apiId: number) => void;
  width?: number | string;
}

/** API 状态 -> Tag 颜色映射 */
const API_STATUS_TAG_COLOR: Record<string, string> = {
  online: 'success',
  offline: 'default',
  deprecated: 'warning',
};

const API_STATUS_TEXT: Record<string, string> = {
  online: '已上线',
  offline: '已下线',
  deprecated: '已弃用',
};

export default function ApiDefinitionDrawer({
  visible,
  apiId,
  onClose,
  onEdit,
  width = 980,
}: ApiDefinitionDrawerProps) {
  const [detail, setDetail] = useState<ApiDefinition | null>(null);
  const [loading, setLoading] = useState(false);
  const [exportingOpenApi, setExportingOpenApi] = useState(false);
  const [exportingWord, setExportingWord] = useState(false);
  const [editing, setEditing] = useState(false);
  const [errorCodes, setErrorCodes] = useState<ErrorCodeItem[]>([]);
  const [form] = Form.useForm();

  // 加载 API 详情
  useEffect(() => {
    if (visible && apiId) {
      setLoading(true);
      getApiDetail(apiId)
        .then(data => setDetail(data))
        .catch(() => {
          // TODO: 错误处理
        })
        .finally(() => setLoading(false));
    } else if (!visible) {
      // 关闭抽屉时重置编辑状态
      setEditing(false);
      setErrorCodes([]);
      form.resetFields();
    }
  }, [visible, apiId]);

  // 当进入编辑模式时,初始化表单数据
  useEffect(() => {
    if (editing && detail) {
      const codes = detail.errorCodes || [];
      setErrorCodes(codes);
      form.setFieldsValue({
        returnType: detail.returnType,
        successResponseExample: detail.successResponseExample,
        failureResponseExample: detail.failureResponseExample,
        errorCodes: codes,
        parameters: detail.parameters || { path: [], header: [], query: [] },
      });
    }
  }, [editing, detail]);

  // 导出 OpenAPI 文档
  const handleExportOpenApi = async () => {
    if (!apiId) return;
    setExportingOpenApi(true);
    try {
      await exportOpenApiDoc(apiId);
      // 模拟下载
      console.log('导出 OpenAPI 文档');
    } finally {
      setExportingOpenApi(false);
    }
  };

  // 导出 Word 文档
  const handleExportWord = async () => {
    if (!apiId) return;
    setExportingWord(true);
    try {
      await exportWordDoc(apiId);
      // 模拟下载
      console.log('导出 Word 文档');
    } finally {
      setExportingWord(false);
    }
  };

  // 保存编辑
  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      console.log('保存编辑:', values);
      // TODO: 调用保存API
      setEditing(false);
      // 重新加载详情
      if (apiId) {
        const data = await getApiDetail(apiId);
        setDetail(data);
      }
    } catch (error) {
      console.error('验证失败:', error);
    }
  };

  // 取消编辑
  const handleCancelEdit = () => {
    setEditing(false);
    setErrorCodes([]);
    form.resetFields();
  };

  // 渲染代码块
  const renderCodeBlock = (code: string) => (
    <pre
      style={{
        margin: 0,
        padding: 12,
        background: '#1e1e1e',
        color: '#d4d4d4',
        borderRadius: 6,
        fontSize: 12,
        lineHeight: 1.6,
        overflow: 'auto',
        maxHeight: 240,
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-all',
      }}
    >
      {code || '-'}
    </pre>
  );

  // 错误码表格列
  const errorCodeColumns = [
    {
      title: '错误码',
      dataIndex: 'code',
      key: 'code',
      width: 100,
      render: editing
        ? (code: string, record: ErrorCodeItem, index: number) => (
            <Form.Item name={['errorCodes', index, 'code']} style={{ margin: 0 }}>
              <Input />
            </Form.Item>
          )
        : (code: string) => <Tag color="error">{code}</Tag>,
    },
    {
      title: '错误信息',
      dataIndex: 'message',
      key: 'message',
      width: 160,
      render: editing
        ? (message: string, record: ErrorCodeItem, index: number) => (
            <Form.Item name={['errorCodes', index, 'message']} style={{ margin: 0 }}>
              <Input />
            </Form.Item>
          )
        : (message: string) => message,
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      render: editing
        ? (description: string, record: ErrorCodeItem, index: number) => (
            <Form.Item name={['errorCodes', index, 'description']} style={{ margin: 0 }}>
              <Input />
            </Form.Item>
          )
        : (description: string) => description || '-',
    },
    ...(editing
      ? [
          {
            title: '操作',
            key: 'action',
            width: 80,
            render: (_: any, record: ErrorCodeItem, index: number) => (
              <Popconfirm
                title="确定删除此错误码?"
                onConfirm={() => {
                  const newCodes = errorCodes.filter((_, i) => i !== index);
                  setErrorCodes(newCodes);
                  form.setFieldsValue({ errorCodes: newCodes });
                }}
              >
                <Button type="link" danger size="small">
                  删除
                </Button>
              </Popconfirm>
            ),
          },
        ]
      : []),
  ];

  // API参数表格列 - 创建函数
  const createApiParamColumns = (paramType: ApiParamType) => [
    {
      title: '参数名',
      dataIndex: 'name',
      key: 'name',
      width: 160,
      ellipsis: true,
      render: editing
        ? (_: any, record: ApiParameter, index: number) => (
            <Form.Item name={['parameters', paramType, index, 'name']} style={{ margin: 0 }}>
              <Input />
            </Form.Item>
          )
        : (name: string) => name,
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      width: 100,
      render: editing
        ? (_: any, record: ApiParameter, index: number) => (
            <Form.Item name={['parameters', paramType, index, 'type']} style={{ margin: 0 }}>
              <Select>
                <Select.Option value="String">String</Select.Option>
                <Select.Option value="Number">Number</Select.Option>
                <Select.Option value="Boolean">Boolean</Select.Option>
                <Select.Option value="Object">Object</Select.Option>
                <Select.Option value="Array">Array</Select.Option>
              </Select>
            </Form.Item>
          )
        : (type: string) => <Tag>{type}</Tag>,
    },
    {
      title: '默认值',
      dataIndex: 'defaultValue',
      key: 'defaultValue',
      width: 150,
      ellipsis: true,
      render: editing
        ? (_: any, record: ApiParameter, index: number) => (
            <Form.Item name={['parameters', paramType, index, 'defaultValue']} style={{ margin: 0 }}>
              <Input />
            </Form.Item>
          )
        : (defaultValue: string) => defaultValue || '-',
    },
    {
      title: '示例',
      dataIndex: 'example',
      key: 'example',
      width: 200,
      ellipsis: true,
      render: editing
        ? (_: any, record: ApiParameter, index: number) => (
            <Form.Item name={['parameters', paramType, index, 'example']} style={{ margin: 0 }}>
              <Input />
            </Form.Item>
          )
        : (example: string) => example || '-',
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
      render: editing
        ? (_: any, record: ApiParameter, index: number) => (
            <Form.Item name={['parameters', paramType, index, 'description']} style={{ margin: 0 }}>
              <Input />
            </Form.Item>
          )
        : (description: string) => description || '-',
    },
  ];

  // 渲染API参数表格
  const renderApiParamTable = (params: ApiParameter[], paramType: ApiParamType) => (
    <Table
      size="small"
      dataSource={params}
      rowKey={(record) => record.id || record.name}
      pagination={false}
      columns={createApiParamColumns(paramType)}
      locale={{
        emptyText: (
          <div style={{ padding: 16 }}>
            <Text type="secondary">暂无参数</Text>
          </div>
        ),
      }}
    />
  );

  return (
    <Drawer
      title="API 定义"
      placement="right"
      width={width}
      visible={visible}
      onClose={onClose}
      extra={
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Space size="small">
            <Dropdown
              overlay={
                <Menu>
                  <Menu.Item key="openapi" onClick={handleExportOpenApi}>
                    导出 OpenAPI 文档
                  </Menu.Item>
                  <Menu.Item key="word" onClick={handleExportWord}>
                    导出 Word 文档
                  </Menu.Item>
                </Menu>
              }
            >
              <Button>
                导出文档
              </Button>
            </Dropdown>
            {!editing && (
              <Button
                type="primary"
                onClick={() => setEditing(true)}
              >
                编辑
              </Button>
            )}
          </Space>
        </div>
      }
      footer={
        editing ? (
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Space>
              <Button onClick={handleCancelEdit}>取消</Button>
              <Button type="primary" onClick={handleSave}>
                保存
              </Button>
            </Space>
          </div>
        ) : null
      }
    >
      <Spin spinning={loading}>
        {detail ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* ===== 一、请求基础定义（保留，不可修改） ===== */}
            <Card size="small" title="请求基础定义">
              <Descriptions column={2} bordered size="small">
                <Descriptions.Item label="API 名称">
                  <Text strong>{detail.apiName}</Text>
                </Descriptions.Item>
                <Descriptions.Item label="Path">
                  <Text code>{detail.path}</Text>
                </Descriptions.Item>
                <Descriptions.Item label="HTTP Method">
                  <Tag color="processing">{detail.httpMethod}</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="API 状态">
                  <Tag color={API_STATUS_TAG_COLOR[detail.apiStatus]}>
                    {API_STATUS_TEXT[detail.apiStatus]}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="描述" span={2}>
                  {detail.description || '-'}
                </Descriptions.Item>
                <Descriptions.Item label="请求模式">
                  {detail.requestMode}
                </Descriptions.Item>
                <Descriptions.Item label="更新时间">
                  {detail.updatedAt}
                </Descriptions.Item>
              </Descriptions>
            </Card>

            {/* ===== 二、后端服务信息（保留，不可修改） ===== */}
            <Card size="small" title="后端服务信息">
              <Descriptions column={2} bordered size="small">
                <Descriptions.Item label="服务类型">
                  <Tag>{detail.serviceType}</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="服务名称">
                  {detail.serviceName}
                </Descriptions.Item>
                <Descriptions.Item label="服务地址" span={2}>
                  <Text code>{detail.serviceAddress}</Text>
                </Descriptions.Item>
                <Descriptions.Item label="后端超时">
                  {detail.backendTimeout}
                </Descriptions.Item>
              </Descriptions>
            </Card>

            {/* ===== 三、API参数（新增） ===== */}
            <Card size="small" title="API参数">
              <ApiParamSection
                title="Path"
                params={detail?.parameters?.path || []}
                paramType="path"
                editing={editing}
                columns={createApiParamColumns('path')}
              />
              <ApiParamSection
                title="Header"
                params={detail?.parameters?.header || []}
                paramType="header"
                editing={editing}
                columns={createApiParamColumns('header')}
              />
              <ApiParamSection
                title="Query"
                params={detail?.parameters?.query || []}
                paramType="query"
                editing={editing}
                columns={createApiParamColumns('query')}
              />
            </Card>

            {/* ===== 三、返回结果（保留） ===== */}
            <Card
              size="small"
              title={
                <Space>
                  <span>返回结果</span>
                  <Tag color="blue">{detail.returnType}</Tag>
                </Space>
              }
            >
              {editing ? (
                <Form form={form} layout="vertical">
                  <Form.Item label="返回类型" name="returnType">
                    <Select>
                      <Select.Option value="JSON">JSON</Select.Option>
                      <Select.Option value="XML">XML</Select.Option>
                      <Select.Option value="TEXT">TEXT</Select.Option>
                    </Select>
                  </Form.Item>
                  <Form.Item label="成功返回结果示例" name="successResponseExample">
                    <Input.TextArea rows={6} />
                  </Form.Item>
                  <Form.Item label="失败返回结果示例" name="failureResponseExample">
                    <Input.TextArea rows={6} />
                  </Form.Item>
                </Form>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div>
                    <Text strong style={{ fontSize: 13, marginBottom: 4, display: 'block' }}>
                      成功返回结果示例
                    </Text>
                    {renderCodeBlock(detail.successResponseExample)}
                  </div>
                  <div>
                    <Text strong style={{ fontSize: 13, marginBottom: 4, display: 'block' }}>
                      失败返回结果示例
                    </Text>
                    {renderCodeBlock(detail.failureResponseExample)}
                  </div>
                </div>
              )}
            </Card>

            {/* ===== 四、错误码定义（保留） ===== */}
            <Card
              size="small"
              title={
                <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                  <span>错误码定义</span>
                  {editing && (
                    <Button
                      type="dashed"
                      size="small"
                      icon={<PlusOutlined />}
                      onClick={() => {
                        const newCodes = [...errorCodes, { code: '', message: '', description: '' }];
                        setErrorCodes(newCodes);
                        form.setFieldsValue({ errorCodes: newCodes });
                      }}
                    >
                      添加错误码
                    </Button>
                  )}
                </Space>
              }
            >
              <Table
                size="small"
                dataSource={editing ? errorCodes : detail.errorCodes}
                rowKey={(record, index) => record.code || `new-${index}`}
                pagination={false}
                columns={errorCodeColumns}
                locale={{
                  emptyText: (
                    <div style={{ padding: 16 }}>
                      <Text type="secondary">暂无错误码定义</Text>
                    </div>
                  ),
                }}
              />
            </Card>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: 48, color: '#999' }}>
            请选择一个 API 查看定义
          </div>
        )}
      </Spin>
    </Drawer>
  );
}
