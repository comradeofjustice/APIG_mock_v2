import React, { useState, useEffect } from 'react';
import { Card, Form, Input, Button, Space, Descriptions, Tag, Alert, Spin, Empty, message } from 'antd';
import { PlayCircleOutlined, ReloadOutlined, ClockCircleOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import type { ApiDefinition, DebugResponse } from './types';
import { mockApiList } from './mockData';

const ApiDebugPage: React.FC = () => {
  const [form] = Form.useForm();
  const [apiData, setApiData] = useState<ApiDefinition | null>(null);
  const [loading, setLoading] = useState(false);
  const [debugResult, setDebugResult] = useState<DebugResponse | null>(null);
  const [error, setError] = useState<string>('');

  // 从URL获取API ID
  useEffect(() => {
    const hash = window.location.hash;
    const match = hash.match(/\/sql-to-api\/debug\/(\w+)/);
    
    if (match) {
      const apiId = match[1];
      // TODO: 替换为真实API调用
      // const api = await getApiDetail(apiId);
      const api = mockApiList.find((item) => item.id === apiId);
      
      if (api) {
        setApiData(api || null);
      } else {
        setError('API不存在');
      }
    }
  }, []);

  // 执行调试
  const handleDebug = async () => {
    if (!apiData) return;

    setLoading(true);
    setError('');
    setDebugResult(null);

    try {
      await form.validateFields();
      
      // TODO: 替换为真实API调用
      // const response = await debugApi(apiData.id, form.getFieldsValue());
      
      // 模拟延迟
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      // 模拟响应
      const mockResponse: DebugResponse = {
        success: true,
        data: [
          { id: 1, name: '张三', status: 'active', createTime: '2026-05-20 10:30:00' },
          { id: 2, name: '李四', status: 'active', createTime: '2026-05-21 14:20:00' },
        ],
        total: 2,
        executionTime: 156,
      };

      setDebugResult(mockResponse);
      message.success('调试成功');
    } catch (err: any) {
      setError(err.message || '调试失败');
    } finally {
      setLoading(false);
    }
  };

  // 重置表单
  const handleReset = () => {
    form.resetFields();
    setDebugResult(null);
    setError('');
  };

  if (!apiData) {
    return (
      <div style={{ padding: 24, background: '#F7FAFD', minHeight: '100vh' }}>
        <Card style={{ borderRadius: 9 }}>
          <Empty description="API不存在或已删除" />
        </Card>
      </div>
    );
  }

  return (
    <div style={{ padding: 24, background: '#F7FAFD', minHeight: '100vh' }}>
      {/* API信息 */}
      <Card 
        title="API信息" 
        style={{ marginBottom: 16, borderRadius: 9 }}
        extra={
          <Tag color={apiData.httpMethod === 'GET' ? 'blue' : 'purple'}>
            {apiData.httpMethod}
          </Tag>
        }
      >
        <Descriptions column={3} size="small">
          <Descriptions.Item label="API名称">{apiData.name}</Descriptions.Item>
          <Descriptions.Item label="API路径">{apiData.apiUrl}</Descriptions.Item>
          <Descriptions.Item label="安全等级">
            <Tag color={
              apiData.securityLevel === 'high' ? 'red' :
              apiData.securityLevel === 'medium' ? 'orange' : 'green'
            }>
              {apiData.securityLevel === 'high' ? '高' : apiData.securityLevel === 'medium' ? '中' : '低'}风险
            </Tag>
          </Descriptions.Item>
        </Descriptions>
      </Card>

      <div style={{ display: 'flex', gap: 16 }}>
        {/* 左侧: 参数输入 */}
        <Card 
          title="请求参数" 
          style={{ flex: 1, borderRadius: 9 }}
          extra={
            <Space>
              <Button icon={<ReloadOutlined />} onClick={handleReset}>
                重置
              </Button>
              <Button 
                type="primary" 
                icon={<PlayCircleOutlined />}
                loading={loading}
                onClick={handleDebug}
              >
                发送请求
              </Button>
            </Space>
          }
        >
          <Form form={form} layout="vertical">
            {apiData.parameters && apiData.parameters.length > 0 ? (
              apiData.parameters.map((param) => (
                <Form.Item
                  key={param.name}
                  label={
                    <Space>
                      <span>{param.name}</span>
                      <Tag color="blue">{param.type}</Tag>
                      {param.required && <Tag color="red">必填</Tag>}
                    </Space>
                  }
                  name={param.name}
                  rules={[
                    param.required ? { required: true, message: `请输入${param.name}` } : {},
                  ].filter(Boolean)}
                  extra={param.description}
                  initialValue={param.defaultValue}
                >
                  <Input placeholder={`请输入${param.name}`} />
                </Form.Item>
              ))
            ) : (
              <Alert
                message="无需参数"
                description="该API不需要输入参数,直接点击发送请求即可"
                type="info"
                showIcon
              />
            )}
          </Form>
        </Card>

        {/* 右侧: 响应结果 */}
        <Card 
          title="响应结果" 
          style={{ flex: 1, borderRadius: 9 }}
        >
          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px 0' }}>
              <Spin size="large" tip="请求中..." />
            </div>
          ) : error ? (
            <Alert
              message="请求失败"
              description={error}
              type="error"
              showIcon
              icon={<CloseCircleOutlined />}
            />
          ) : debugResult ? (
            <div>
              {/* 性能指标 */}
              <Space style={{ marginBottom: 16 }}>
                <Tag color="green" icon={<CheckCircleOutlined />}>
                  状态: {debugResult.success ? '成功' : '失败'}
                </Tag>
                <Tag icon={<ClockCircleOutlined />}>
                  耗时: {debugResult.executionTime}ms
                </Tag>
                <Tag>数据量: {debugResult.total || debugResult.data.length} 条</Tag>
              </Space>

              {/* JSON响应 */}
              <Card size="small" style={{ background: '#fafafa' }}>
                <pre style={{ 
                  margin: 0, 
                  fontSize: 12, 
                  overflow: 'auto',
                  maxHeight: 400,
                }}>
                  {JSON.stringify(debugResult, null, 2)}
                </pre>
              </Card>
            </div>
          ) : (
            <Empty description='点击"发送请求"查看结果' />
          )}
        </Card>
      </div>
    </div>
  );
};

export default ApiDebugPage;
