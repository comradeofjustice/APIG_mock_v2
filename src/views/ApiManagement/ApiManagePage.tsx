/**
 * API 管理列表页
 *
 * 功能：
 * - API 列表展示
 * - 搜索筛选
 * - 点击查看 API 定义抽屉
 * - 点击调试跳转到调试页面
 */

import { useState, useEffect, useCallback } from 'react';
import {
  Card,
  Table,
  Button,
  Input,
  Space,
  Tag,
  message,
} from 'antd';
import {
  SearchOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useNavigate } from 'react-router-dom';
import type { ApiListItem } from './types';
import { queryApiList } from './services';
import ApiDefinitionDrawer from './components/ApiDefinitionDrawer';

const API_STATUS_TAG: Record<string, { color: string; text: string }> = {
  online: { color: 'success', text: '已上线' },
  offline: { color: 'default', text: '已下线' },
  deprecated: { color: 'warning', text: '已弃用' },
};

export default function ApiManagePage() {
  const navigate = useNavigate();

  // 列表状态
  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState<ApiListItem[]>([]);
  const [keyword, setKeyword] = useState('');
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 0,
  });

  // 抽屉状态
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [selectedApiId, setSelectedApiId] = useState<number | undefined>();

  // 加载数据
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await queryApiList({
        keyword: keyword || undefined,
        currentPage: pagination.current,
        pageSize: pagination.pageSize,
      });
      setDataSource(res.data);
      setPagination(prev => ({ ...prev, total: res.totalCount }));
    } catch {
      message.error('加载 API 列表失败');
    } finally {
      setLoading(false);
    }
  }, [keyword, pagination.current, pagination.pageSize]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // 搜索
  const handleSearch = (value: string) => {
    setKeyword(value);
    setPagination(prev => ({ ...prev, current: 1 }));
  };

  // 查看定义
  const handleViewDefinition = (record: ApiListItem) => {
    setSelectedApiId(record.id);
    setDrawerVisible(true);
  };

  // 调试
  const handleDebug = (record: ApiListItem) => {
    navigate(`/api-management/debug?apiId=${record.id}`);
  };

  // 编辑
  const handleEdit = (_apiId: number) => {
    // TODO: 打开编辑弹窗
    message.info('编辑功能待实现');
  };

  // 表格列
  const columns: ColumnsType<ApiListItem> = [
    {
      title: 'API 名称',
      dataIndex: 'apiName',
      key: 'apiName',
      ellipsis: true,
      render: (text: string) => <span style={{ fontWeight: 500 }}>{text}</span>,
    },
    {
      title: 'Path',
      dataIndex: 'path',
      key: 'path',
      ellipsis: true,
      render: (text: string) => <Tag style={{ fontFamily: 'monospace' }}>{text}</Tag>,
    },
    {
      title: 'Method',
      dataIndex: 'httpMethod',
      key: 'httpMethod',
      width: 80,
      render: (method: string) => {
        const color =
          method === 'GET'
            ? 'green'
            : method === 'POST'
            ? 'blue'
            : method === 'PUT'
            ? 'orange'
            : 'red';
        return <Tag color={color}>{method}</Tag>;
      },
    },
    {
      title: '状态',
      dataIndex: 'apiStatus',
      key: 'apiStatus',
      width: 90,
      render: (status: string) => {
        const config = API_STATUS_TAG[status];
        return <Tag color={config?.color}>{config?.text || status}</Tag>;
      },
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: '更新时间',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      width: 170,
    },
    {
      title: '操作',
      key: 'action',
      width: 180,
      fixed: 'right',
      render: (_: unknown, record: ApiListItem) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            onClick={() => handleViewDefinition(record)}
          >
            定义
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => handleDebug(record)}
          >
            调试
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="api-manage-page">
      <Card>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 16,
          }}
        >
          <Space>
            <Button type="primary" icon={<PlusOutlined />}>
              新增 API
            </Button>
          </Space>
          <Input.Search
            placeholder="搜索 API 名称 / Path / 描述"
            allowClear
            style={{ width: 320 }}
            prefix={<SearchOutlined />}
            onSearch={handleSearch}
          />
        </div>

        <Table
          rowKey="id"
          columns={columns}
          dataSource={dataSource}
          loading={loading}
          pagination={{
            ...pagination,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: total => `共 ${total} 条`,
          }}
          onChange={pag => {
            setPagination(prev => ({
              ...prev,
              current: pag.current || 1,
              pageSize: pag.pageSize || 20,
            }));
          }}
          scroll={{ x: 1000 }}
        />
      </Card>

      {/* API 定义抽屉 */}
      <ApiDefinitionDrawer
        visible={drawerVisible}
        apiId={selectedApiId}
        onClose={() => {
          setDrawerVisible(false);
          setSelectedApiId(undefined);
        }}
        onEdit={handleEdit}
      />
    </div>
  );
}
