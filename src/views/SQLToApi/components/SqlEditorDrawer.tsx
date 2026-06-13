import React, { useState, useEffect } from 'react';
import { Drawer, Form, Input, Select, Button, Table, Tag, message, Alert, Divider } from 'antd';
import { SaveOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import type { ApiDefinition, Parameter, SecurityLevel } from '../types';

const { TextArea } = Input;
const { Option } = Select;

interface SqlEditorDrawerProps {
  visible: boolean;
  apiData?: ApiDefinition;
  onClose: () => void;
  onSave: () => void;
}

const SqlEditorDrawer: React.FC<SqlEditorDrawerProps> = ({
  visible,
  apiData,
  onClose,
  onSave,
}) => {
  const [form] = Form.useForm();
  const [sqlValue, setSqlValue] = useState('');
  const [parameters, setParameters] = useState<Parameter[]>([]);
  const [saving, setSaving] = useState(false);
  const [securityLevel, setSecurityLevel] = useState<SecurityLevel>('low');
  const [sqlError, setSqlError] = useState<string>('');

  // 初始化表单
  useEffect(() => {
    if (apiData) {
      form.setFieldsValue({
        name: apiData.name,
        apiUrl: apiData.apiUrl,
        httpMethod: apiData.httpMethod,
        description: apiData.description,
      });
      setSqlValue(apiData.sqlStatement);
      setParameters(apiData.parameters || []);
      setSecurityLevel(apiData.securityLevel);
    } else {
      form.resetFields();
      setSqlValue('');
      setParameters([]);
      setSecurityLevel('low');
    }
    setSqlError('');
  }, [apiData, visible]);

  // SQL变更时自动提取参数
  const handleSqlChange = (value: string) => {
    setSqlValue(value);
    setSqlError('');
    
    // 简单正则提取 ${paramName}
    const paramRegex = /\$\{(\w+)\}/g;
    const matches = [...value.matchAll(paramRegex)];
    
    const extractedParams: Parameter[] = matches.map((match) => {
      const paramName = match[1];
      const existingParam = parameters.find((p) => p.name === paramName);
      
      return (
        existingParam || {
          name: paramName,
          type: 'string',
          required: true,
          location: form.getFieldValue('httpMethod') === 'GET' ? 'query' : 'body',
        }
      );
    });

    setParameters(extractedParams);
    
    // 简单SQL校验
    if (!value.trim()) {
      setSqlError('SQL语句不能为空');
    } else if (!/^(SELECT|INSERT|UPDATE|DELETE)/i.test(value.trim())) {
      setSqlError('SQL语句必须以 SELECT/INSERT/UPDATE/DELETE 开头');
    }
  };

  // 评估安全等级
  useEffect(() => {
    if (!sqlValue) {
      setSecurityLevel('low');
      return;
    }

    const sql = sqlValue.toUpperCase();
    if (sql.startsWith('DELETE') || sql.startsWith('DROP') || sql.startsWith('TRUNCATE')) {
      setSecurityLevel('high');
    } else if (sql.startsWith('UPDATE') || sql.includes(' JOIN ') || sql.includes(' GROUP BY ')) {
      setSecurityLevel('medium');
    } else {
      setSecurityLevel('low');
    }
  }, [sqlValue]);

  // 保存API
  const handleSave = async () => {
    try {
      await form.validateFields();
      
      if (!sqlValue) {
        message.error('请输入SQL语句');
        return;
      }

      if (sqlError) {
        message.error('SQL语句存在错误,请修正后保存');
        return;
      }

      setSaving(true);
      
      // TODO: 替换为真实API调用
      // if (apiData) {
      //   await updateApi(apiData.id, { ...form.getFieldsValue(), sqlStatement: sqlValue, parameters });
      // } else {
      //   await createApi({ ...form.getFieldsValue(), sqlStatement: sqlValue, parameters });
      // }
      
      await new Promise((resolve) => setTimeout(resolve, 500));
      message.success('保存成功');
      onSave();
    } catch (error) {
      message.error('保存失败');
    } finally {
      setSaving(false);
    }
  };

  // 更新参数
  const handleParameterChange = (index: number, field: keyof Parameter, value: any) => {
    const newParams = [...parameters];
    newParams[index] = { ...newParams[index], [field]: value };
    setParameters(newParams);
  };

  // 参数表格列
  const parameterColumns = [
    {
      title: '参数名',
      dataIndex: 'name',
      key: 'name',
      width: 120,
      render: (text: string) => <Tag color="blue">${text}</Tag>,
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      width: 100,
      render: (text: string, _: any, index: number) => (
        <Select
          value={text}
          style={{ width: '100%' }}
          onChange={(value) => handleParameterChange(index, 'type', value)}
        >
          <Option value="string">String</Option>
          <Option value="number">Number</Option>
          <Option value="boolean">Boolean</Option>
          <Option value="array">Array</Option>
        </Select>
      ),
    },
    {
      title: '必填',
      dataIndex: 'required',
      key: 'required',
      width: 80,
      render: (checked: boolean, _: any, index: number) => (
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => handleParameterChange(index, 'required', e.target.checked)}
        />
      ),
    },
    {
      title: '默认值',
      dataIndex: 'defaultValue',
      key: 'defaultValue',
      width: 120,
      render: (text: string, _: any, index: number) => (
        <Input
          value={text}
          placeholder="可选"
          onChange={(e) => handleParameterChange(index, 'defaultValue', e.target.value)}
        />
      ),
    },
    {
      title: '说明',
      dataIndex: 'description',
      key: 'description',
      render: (text: string, _: any, index: number) => (
        <Input
          value={text}
          placeholder="参数说明"
          onChange={(e) => handleParameterChange(index, 'description', e.target.value)}
        />
      ),
    },
  ];

  // 安全等级提示
  const renderSecurityAlert = () => {
    if (securityLevel === 'high') {
      return (
        <Alert
          message="高风险操作"
          description="该SQL包含DELETE/UPDATE等危险操作,保存后需要管理员审批才能发布。"
          type="warning"
          icon={<ExclamationCircleOutlined />}
          showIcon
          style={{ marginBottom: 16 }}
        />
      );
    }
    return null;
  };

  return (
    <Drawer
      title={apiData ? '编辑API' : '创建API'}
      width={720}
      visible={visible}
      onClose={onClose}
      destroyOnClose
      footer={
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <Button onClick={onClose}>取消</Button>
          <Button 
            type="primary" 
            icon={<SaveOutlined />}
            loading={saving}
            onClick={handleSave}
          >
            保存
          </Button>
        </div>
      }
    >
      <Form form={form} layout="vertical">
        {/* SQL编辑器 */}
        <Form.Item label="SQL语句" required>
          <TextArea
            value={sqlValue}
            onChange={(e) => handleSqlChange(e.target.value)}
            placeholder="请输入SQL语句,例如: SELECT * FROM users WHERE status = ${status}"
            rows={8}
            style={{ fontFamily: 'monospace', fontSize: 14 }}
          />
          {sqlError && (
            <Alert
              message={sqlError}
              type="error"
              showIcon
              style={{ marginTop: 8 }}
            />
          )}
        </Form.Item>

        {/* 安全等级提示 */}
        {renderSecurityAlert()}

        <Divider>API配置</Divider>

        {/* API基础信息 */}
        <Form.Item
          label="API名称"
          name="name"
          rules={[{ required: true, message: '请输入API名称' }, { max: 50, message: '最多50个字符' }]}
        >
          <Input placeholder="例如: 查询用户列表" />
        </Form.Item>

        <Form.Item
          label="API路径"
          name="apiUrl"
          rules={[{ required: true, message: '请输入API路径' }]}
        >
          <Input placeholder="例如: /api/v1/users/query" />
        </Form.Item>

        <Form.Item
          label="请求方法"
          name="httpMethod"
          rules={[{ required: true, message: '请选择请求方法' }]}
        >
          <Select placeholder="请选择">
            <Option value="GET">GET (查询)</Option>
            <Option value="POST">POST (新增)</Option>
          </Select>
        </Form.Item>

        <Form.Item label="API描述" name="description">
          <TextArea rows={2} placeholder="可选,最多200字符" maxLength={200} />
        </Form.Item>

        <Divider>参数列表 ({parameters.length})</Divider>

        {/* 参数配置表格 */}
        {parameters.length > 0 ? (
          <Table
            rowKey="name"
            columns={parameterColumns}
            dataSource={parameters}
            pagination={false}
            size="small"
            scroll={{ y: 300 }}
          />
        ) : (
          <Alert
            message="暂无参数"
            description="在SQL语句中使用 ${参数名} 格式可自动提取参数"
            type="info"
            showIcon
          />
        )}
      </Form>
    </Drawer>
  );
};

export default SqlEditorDrawer;
