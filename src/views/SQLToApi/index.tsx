import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Input, Select, Space, Tag, message, Modal } from 'antd';
import { PlusOutlined, SearchOutlined, ReloadOutlined, DeleteOutlined, PlayCircleOutlined } from '@ant-design/icons';
import SqlEditorDrawer from './components/SqlEditorDrawer';
import type { ApiDefinition, ApiStatus, SecurityLevel } from './types';
import { mockApiList } from './mockData';

const { Option } = Select;

const SQLToApi: React.FC = () => {
  const [apiList, setApiList] = useState<ApiDefinition[]>([]);
  const [loading, setLoading] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [editingApi, setEditingApi] = useState<ApiDefinition | undefined>(undefined);
  const [searchParams, setSearchParams] = useState<{ keyword: string; status: ApiStatus | undefined }>({
    keyword: '',
    status: undefined,
  });
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  // 加载API列表
  useEffect(() => {
    fetchApiList();
  }, []);

  const fetchApiList = async () => {
    setLoading(true);
    try {
      // TODO: 替换为真实API调用
      // const response = await getApiList(searchParams);
      // setApiList(response.data);
      
      // 模拟延迟
      await new Promise(resolve => setTimeout(resolve, 500));
      setApiList(mockApiList);
    } catch (error) {
      message.error('加载API列表失败');
    } finally {
      setLoading(false);
    }
  };

  // 搜索
  const handleSearch = () => {
    fetchApiList();
  };

  // 重置
  const handleReset = () => {
    setSearchParams({ keyword: '', status: undefined });
    fetchApiList();
  };

  // 创建API
  const handleCreate = () => {
    setEditingApi(undefined);
    setDrawerVisible(true);
  };

  // 编辑API
  const handleEdit = (record: ApiDefinition) => {
    setEditingApi(record);
    setDrawerVisible(true);
  };

  // 删除API
  const handleDelete = (record: ApiDefinition) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除API"${record.name}"吗?此操作不可恢复。`,
      okText: '确定',
      cancelText: '取消',
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          // TODO: 替换为真实API调用
          // await deleteApi(record.id);
          message.success('删除成功');
          fetchApiList();
        } catch (error) {
          message.error('删除失败');
        }
      },
    });
  };

  // 批量删除
  const handleBatchDelete = () => {
    Modal.confirm({
      title: '确认批量删除',
      content: `确定要删除选中的${selectedRowKeys.length}个API吗?此操作不可恢复。`,
      okText: '确定',
      cancelText: '取消',
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          // TODO: 替换为真实API调用
          // await batchDeleteApis(selectedRowKeys);
          message.success('批量删除成功');
          setSelectedRowKeys([]);
          fetchApiList();
        } catch (error) {
          message.error('批量删除失败');
        }
      },
    });
  };

  // 抽屉保存回调
  const handleDrawerSave = () => {
    setDrawerVisible(false);
    fetchApiList();
  };

  // 状态标签渲染
  const renderStatusTag = (status: ApiStatus) => {
    const statusMap: Record<ApiStatus, { color: string; text: string }> = {
      draft: { color: 'gold', text: '草稿' },
      active: { color: 'green', text: '已发布' },
      deprecated: { color: 'default', text: '已停用' },
      pending_approval: { color: 'blue', text: '审批中' },
    };
    const config = statusMap[status];
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  // 安全等级标签渲染
  const renderSecurityTag = (level: SecurityLevel) => {
    const levelMap: Record<SecurityLevel, { color: string; text: string }> = {
      low: { color: 'green', text: '低' },
      medium: { color: 'orange', text: '中' },
      high: { color: 'red', text: '高' },
    };
    const config = levelMap[level];
    return <Tag color={config.color}>{config.text}风险</Tag>;
  };

  // 表格列定义
  const columns = [
    {
      title: 'API名称',
      dataIndex: 'name',
      key: 'name',
      width: 200,
      ellipsis: true,
      render: (text: string, record: ApiDefinition) => (
        <a onClick={() => handleEdit(record)}>{text}</a>
      ),
    },
    {
      title: 'API路径',
      dataIndex: 'apiUrl',
      key: 'apiUrl',
      width: 250,
      ellipsis: true,
    },
    {
      title: '请求方法',
      dataIndex: 'httpMethod',
      key: 'httpMethod',
      width: 100,
      render: (method: string) => (
        <Tag color={method === 'GET' ? 'blue' : 'purple'}>{method}</Tag>
      ),
    },
    {
      title: '安全等级',
      dataIndex: 'securityLevel',
      key: 'securityLevel',
      width: 100,
      render: renderSecurityTag,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: renderStatusTag,
    },
    {
      title: '创建人',
      dataIndex: 'creator',
      key: 'creator',
      width: 100,
    },
    {
      title: '更新时间',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      width: 180,
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      fixed: 'right' as const,
      render: (_: any, record: ApiDefinition) => (
        <Space>
          <Button type="link" size="small" onClick={() => handleEdit(record)}>
            编辑
          </Button>
          <Button 
            type="link" 
            size="small" 
            icon={<PlayCircleOutlined />}
            onClick={() => window.location.hash = `#/sql-to-api/debug/${record.id}`}
          >
            调试
          </Button>
          <Button 
            type="link" 
            size="small" 
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record)}
          >
            删除
          </Button>
        </Space>
      ),
    },
  ];

  // 行选择配置
  const rowSelection = {
    selectedRowKeys,
    onChange: (selectedKeys: React.Key[]) => {
      setSelectedRowKeys(selectedKeys);
    },
  };

  return (
    <div style={{ padding: 24, background: '#F7FAFD', minHeight: '100vh' }}>
      {/* 搜索和操作区 */}
      <Card 
        style={{ 
          marginBottom: 16, 
          borderRadius: 9,
        }}
        bodyStyle={{ paddingBottom: 0 }}
      >
        <div style={{ padding: '16px 24px', borderBottom: '1px solid #f0f0f0' }}>
          <Space style={{ marginBottom: 16 }}>
            <Button 
              type="primary" 
              icon={<PlusOutlined />}
              onClick={handleCreate}
            >
              创建API
            </Button>
            {selectedRowKeys.length > 0 && (
              <Button 
                danger
                icon={<DeleteOutlined />}
                onClick={handleBatchDelete}
              >
                批量删除 ({selectedRowKeys.length})
              </Button>
            )}
          </Space>
        </div>
        
        <div style={{ padding: 16 }}>
          <Space>
            <Input
              placeholder="搜索API名称/路径/创建人"
              prefix={<SearchOutlined />}
              style={{ width: 300 }}
              value={searchParams.keyword}
              onChange={(e) => setSearchParams({ ...searchParams, keyword: e.target.value })}
              onPressEnter={handleSearch}
            />
            <Select
              placeholder="状态筛选"
              style={{ width: 120 }}
              allowClear
              value={searchParams.status}
              onChange={(value) => setSearchParams({ ...searchParams, status: value })}
            >
              <Option value="draft">草稿</Option>
              <Option value="active">已发布</Option>
              <Option value="deprecated">已停用</Option>
              <Option value="pending_approval">审批中</Option>
            </Select>
            <Button icon={<ReloadOutlined />} onClick={handleReset}>
              重置
            </Button>
          </Space>
        </div>
      </Card>

      {/* 表格区 */}
      <Card 
        style={{ 
          borderRadius: 9,
        }}
        bodyStyle={{ padding: 0 }}
      >
        <Table
          rowKey="id"
          columns={columns}
          dataSource={apiList}
          loading={loading}
          rowSelection={rowSelection}
          scroll={{ x: 1200 }}
          pagination={{
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条`,
            pageSizeOptions: ['10', '20', '50', '100'],
          }}
        />
      </Card>

      {/* 创建/编辑抽屉 */}
      <SqlEditorDrawer
        visible={drawerVisible}
        apiData={editingApi}
        onClose={() => setDrawerVisible(false)}
        onSave={handleDrawerSave}
      />
    </div>
  );
};

export default SQLToApi;
