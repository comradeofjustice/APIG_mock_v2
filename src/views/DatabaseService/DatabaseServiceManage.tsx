/**
 * 数据库服务管理页面
 * 
 * 功能：
 * - 数据库服务列表展示
 * - 搜索筛选（名称、类型、状态）
 * - 新增/删除/批量操作
 * - 启用/停用 Switch 切换
 * - 连接测试
 * - 跳转到 API 管理
 * - 分页
 */

import { useState, useEffect, useCallback } from 'react';
import {
  Card,
  Table,
  Button,
  Input,
  Select,
  Space,
  Tag,
  Switch,
  Popconfirm,
  message,
  Pagination,
} from 'antd';
import {
  SearchOutlined,
  PlusOutlined,
  DeleteOutlined,
  ReloadOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useNavigate } from 'react-router-dom';

const { Option } = Select;

// 类型定义
interface DbService {
  id: string;
  name: string;
  type: 'MySQL' | 'Oracle' | 'PostgreSQL' | 'SQLServer';
  host: string;
  port: number;
  database: string;
  apiCount: number;
  sensitiveApiCount: number;
  enabled: boolean;
  status: '正常' | '连接异常' | '已停用';
  updateTime: string;
}

// Mock 数据
const mockData: DbService[] = [
  {
    id: '1',
    name: '订单数据服务',
    type: 'MySQL',
    host: '10.50.20.18',
    port: 3306,
    database: 'order_center',
    apiCount: 6,
    sensitiveApiCount: 1,
    enabled: true,
    status: '正常',
    updateTime: '2026-05-19 14:30',
  },
  {
    id: '2',
    name: '客户画像库',
    type: 'Oracle',
    host: '10.50.21.9',
    port: 1521,
    database: 'Service Name: CRM_PDB',
    apiCount: 3,
    sensitiveApiCount: 1,
    enabled: true,
    status: '连接异常',
    updateTime: '2026-05-18 19:02',
  },
];

// 状态 Tag 映射
const STATUS_TAG: Record<string, { color: string; text: string }> = {
  '正常': { color: 'success', text: '启用' },
  '连接异常': { color: 'warning', text: '连接异常' },
  '已停用': { color: 'default', text: '已停用' },
};

// 类型 Tag 映射
const TYPE_TAG: Record<string, string> = {
  MySQL: 'blue',
  Oracle: 'purple',
  PostgreSQL: 'green',
  SQLServer: 'orange',
};

export default function DatabaseServiceManage() {
  const navigate = useNavigate();

  // 列表状态
  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState<DbService[]>([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 0,
  });

  // 筛选状态
  const [filters, setFilters] = useState({
    name: '',
    type: undefined as string | undefined,
    status: undefined as string | undefined,
  });

  // 加载数据
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // TODO: 替换为真实 API
      await new Promise((resolve) => setTimeout(resolve, 500));
      
      // 模拟筛选
      let filteredData = [...mockData];
      if (filters.name) {
        filteredData = filteredData.filter((item) =>
          item.name.toLowerCase().includes(filters.name.toLowerCase())
        );
      }
      if (filters.type) {
        filteredData = filteredData.filter((item) => item.type === filters.type);
      }
      if (filters.status) {
        filteredData = filteredData.filter((item) => item.status === filters.status);
      }

      setDataSource(filteredData);
      setPagination((prev) => ({
        ...prev,
        total: filteredData.length,
      }));
    } catch (error) {
      message.error('加载数据失败');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // 查询
  const handleSearch = () => {
    setPagination((prev) => ({ ...prev, current: 1 }));
    fetchData();
  };

  // 重置
  const handleReset = () => {
    setFilters({ name: '', type: undefined, status: undefined });
    setPagination((prev) => ({ ...prev, current: 1 }));
  };

  // 删除
  const handleDelete = async (id: string) => {
    try {
      // TODO: 替换为真实 API
      await new Promise((resolve) => setTimeout(resolve, 300));
      setDataSource((prev) => prev.filter((item) => item.id !== id));
      message.success('删除成功');
    } catch (error) {
      message.error('删除失败');
    }
  };

  // 批量删除
  const handleBatchDelete = async () => {
    if (selectedRowKeys.length === 0) {
      message.warning('请选择要删除的数据');
      return;
    }
    try {
      // TODO: 替换为真实 API
      await new Promise((resolve) => setTimeout(resolve, 500));
      setDataSource((prev) =>
        prev.filter((item) => !selectedRowKeys.includes(item.id))
      );
      setSelectedRowKeys([]);
      message.success(`已删除 ${selectedRowKeys.length} 条数据`);
    } catch (error) {
      message.error('批量删除失败');
    }
  };

  // 启用/停用切换
  const handleToggleEnabled = async (record: DbService) => {
    try {
      // TODO: 替换为真实 API
      await new Promise((resolve) => setTimeout(resolve, 300));
      setDataSource((prev) =>
        prev.map((item) =>
          item.id === record.id
            ? {
                ...item,
                enabled: !item.enabled,
                status: !item.enabled ? '正常' : '已停用',
              }
            : item
        )
      );
      message.success(record.enabled ? '已停用' : '已启用');
    } catch (error) {
      message.error('操作失败');
    }
  };

  // 连接测试
  const handleTestConnection = async (record: DbService) => {
    const hide = message.loading(`正在测试 ${record.name} 连接...`, 0);
    try {
      // TODO: 替换为真实 API
      await new Promise((resolve) => setTimeout(resolve, 1500));
      hide();
      message.success(`${record.name} 连接正常`);
    } catch (error) {
      hide();
      message.error(`${record.name} 连接失败`);
    }
  };

  // 新增
  const handleAdd = () => {
    message.info('新增数据库服务（待实现）');
    // TODO: 打开新增抽屉或弹窗
  };

  // 配置
  const handleConfig = (record: DbService) => {
    message.info(`配置 ${record.name}（待实现）`);
    // TODO: 打开配置抽屉或弹窗
  };

  // 表格列定义
  const columns: ColumnsType<DbService> = [
    {
      title: '数据库服务名称',
      dataIndex: 'name',
      key: 'name',
      width: 150,
    },
    {
      title: '服务类型',
      dataIndex: 'type',
      key: 'type',
      width: 100,
      render: (type: string) => (
        <Tag color={TYPE_TAG[type] || 'default'}>{type}</Tag>
      ),
    },
    {
      title: '主机',
      dataIndex: 'host',
      key: 'host',
      width: 120,
    },
    {
      title: '端口',
      dataIndex: 'port',
      key: 'port',
      width: 80,
    },
    {
      title: '数据库/实例',
      dataIndex: 'database',
      key: 'database',
      width: 160,
      ellipsis: true,
    },
    {
      title: 'API数量',
      key: 'apiCount',
      width: 140,
      render: (_, record) => (
        <span style={{ color: '#666', fontSize: 12 }}>
          关联API: {record.apiCount}  敏感API: {record.sensitiveApiCount}
        </span>
      ),
    },
    {
      title: '启用/停用',
      key: 'enabled',
      width: 100,
      align: 'center',
      render: (_, record) => (
        <Switch
          checked={record.enabled}
          onChange={() => handleToggleEnabled(record)}
        />
      ),
    },
    {
      title: '状态',
      key: 'status',
      width: 100,
      render: (_, record) => {
        const tag = STATUS_TAG[record.status] || { color: 'default', text: record.status };
        return <Tag color={tag.color}>{tag.text}</Tag>;
      },
    },
    {
      title: '更新时间',
      dataIndex: 'updateTime',
      key: 'updateTime',
      width: 140,
    },
    {
      title: '操作',
      key: 'action',
      fixed: 'right',
      width: 200,
      render: (_, record) => (
        <Space size={8}>
          <Button type="link" size="small" onClick={() => handleConfig(record)}>
            配置
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => handleTestConnection(record)}
          >
            连接测试
          </Button>
          <Popconfirm
            title="确定删除该数据库服务吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button type="link" size="small" danger>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // 行选择配置
  const rowSelection = {
    selectedRowKeys,
    onChange: (newSelectedRowKeys: React.Key[]) => {
      setSelectedRowKeys(newSelectedRowKeys as string[]);
    },
  };

  return (
    <div style={{ padding: 24, background: '#FFFFFF', minHeight: '100%' }}>
      {/* 筛选区 */}
      <div style={{ marginBottom: 16 }}>
        <Space size={12} wrap>
          <Input
            placeholder="请输入数据库服务名称"
            prefix={<SearchOutlined style={{ color: '#BFBFBF' }} />}
            value={filters.name}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, name: e.target.value }))
            }
            onPressEnter={handleSearch}
            style={{ width: 200 }}
          />
          <Select
            placeholder="数据库服务类型：全部"
            value={filters.type}
            onChange={(value) =>
              setFilters((prev) => ({ ...prev, type: value }))
            }
            allowClear
            style={{ width: 160 }}
          >
            <Option value="MySQL">MySQL</Option>
            <Option value="Oracle">Oracle</Option>
            <Option value="PostgreSQL">PostgreSQL</Option>
            <Option value="SQLServer">SQLServer</Option>
          </Select>
          <Select
            placeholder="状态：全部"
            value={filters.status}
            onChange={(value) =>
              setFilters((prev) => ({ ...prev, status: value }))
            }
            allowClear
            style={{ width: 120 }}
          >
            <Option value="正常">正常</Option>
            <Option value="连接异常">连接异常</Option>
            <Option value="已停用">已停用</Option>
          </Select>
          <Button type="primary" onClick={handleSearch}>
            查询
          </Button>
          <Button onClick={handleReset}>重置</Button>
        </Space>
      </div>

      {/* 表格区 */}
      <Card bordered={false} style={{ borderRadius: 8 }} bodyStyle={{ padding: 0 }}>
        {/* 操作按钮区 */}
        <div
          style={{
            padding: '16px 0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Space size={8}>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
              新增数据库服务
            </Button>
            <Popconfirm
              title="确定删除选中的数据吗？"
              onConfirm={handleBatchDelete}
              disabled={selectedRowKeys.length === 0}
              okText="确定"
              cancelText="取消"
            >
              <Button danger disabled={selectedRowKeys.length === 0}>
                删除
              </Button>
            </Popconfirm>
            <Button>批量操作 ▾</Button>
          </Space>
          <Space size={8}>
            <Button icon={<ReloadOutlined />} onClick={fetchData}>
              刷新
            </Button>
            <Button icon={<SettingOutlined />}>
              列设置
            </Button>
          </Space>
        </div>

        {/* 表格 */}
        <Table
          columns={columns}
          dataSource={dataSource}
          loading={loading}
          rowKey="id"
          rowSelection={rowSelection}
          pagination={false}
          scroll={{ x: 1200 }}
        />

        {/* 分页 */}
        <div
          style={{
            padding: '12px 16px',
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'center',
          }}
        >
          <Pagination
            current={pagination.current}
            pageSize={pagination.pageSize}
            total={pagination.total}
            showSizeChanger
            showQuickJumper
            showTotal={(total) => `共 ${total} 条`}
            onChange={(current, pageSize) =>
              setPagination({ current, pageSize, total: pagination.total })
            }
          />
        </div>
      </Card>
    </div>
  );
}
