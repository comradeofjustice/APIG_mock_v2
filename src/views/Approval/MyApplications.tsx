/**
 * 我的申请页面
 * 
 * 功能：
 * - 我的申请记录列表
 * - 按状态筛选
 * - 查看详情
 * - 撤回申请（仅 pending/in_progress 状态）
 */

import { useState, useEffect, useCallback } from 'react';
import {
  Table,
  Button,
  Space,
  Card,
  Tag,
  message,
  Select,
  Popconfirm,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { MyApplication, ApprovalStatus } from './types';
import { queryMyApplications, recallMyApplication } from './services';
import ApprovalDetailDrawer from './components/ApprovalDetailDrawer';
import { APPROVAL_STATUS_MAP, MODULE_LIST } from './constants';

export default function MyApplications() {
  // 状态
  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState<MyApplication[]>([]);
  const [statusFilter, setStatusFilter] = useState<ApprovalStatus | undefined>();
  const [moduleFilter, setModuleFilter] = useState<string | undefined>();
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 0,
  });

  // 详情抽屉
  const [detailVisible, setDetailVisible] = useState(false);
  const [detailTaskId, setDetailTaskId] = useState<number | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // 加载数据
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await queryMyApplications({
        currentPage: pagination.current,
        pageSize: pagination.pageSize,
        status: statusFilter,
        moduleCode: moduleFilter,
      });
      setDataSource(res.data);
      setPagination(prev => ({
        ...prev,
        total: res.totalCount,
      }));
    } catch {
      message.error('加载数据失败');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, moduleFilter, pagination.current, pagination.pageSize]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // 状态筛选变化
  const handleStatusChange = (value: ApprovalStatus | undefined) => {
    setStatusFilter(value);
    setPagination(prev => ({ ...prev, current: 1 }));
  };

  // 模块筛选变化
  const handleModuleChange = (value: string | undefined) => {
    setModuleFilter(value);
    setPagination(prev => ({ ...prev, current: 1 }));
  };

  // 表格变化
  const handleTableChange = (paginationConfig: any) => {
    setPagination({
      current: paginationConfig.current,
      pageSize: paginationConfig.pageSize,
      total: pagination.total,
    });
  };

  // 查看详情
  const handleViewDetail = (record: MyApplication) => {
    setDetailTaskId(record.taskId);
    setDetailVisible(true);
    setDetailLoading(true);
    // 模拟加载
    setTimeout(() => {
      setDetailLoading(false);
    }, 500);
  };

  // 撤回申请
  const handleRecall = async (record: MyApplication) => {
    try {
      await recallMyApplication(record.taskId);
      message.success('已撤回申请');
      loadData();
    } catch {
      message.error('撤回失败');
    }
  };

  // 渲染状态标签
  const renderStatusTag = (status: ApprovalStatus) => {
    const config = APPROVAL_STATUS_MAP[status];
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  // 判断是否可以撤回
  const canRecall = (status: ApprovalStatus) => {
    return status === 'pending' || status === 'in_progress';
  };

  // 表格列定义
  const columns: ColumnsType<MyApplication> = [
    {
      title: '申请ID',
      dataIndex: 'taskId',
      key: 'taskId',
      width: 100,
    },
    {
      title: '业务模块',
      dataIndex: 'moduleName',
      key: 'moduleName',
      width: 120,
    },
    {
      title: '操作类型',
      dataIndex: 'operationName',
      key: 'operationName',
      width: 100,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: renderStatusTag,
    },
    {
      title: '当前节点',
      key: 'currentNode',
      width: 150,
      render: (_, record) => {
        if (record.status === 'approved' || record.status === 'rejected' || record.status === 'recalled') {
          return <span style={{ color: '#666' }}>已完成</span>;
        }
        if (record.currentApproverNames && record.currentApproverNames.length > 0) {
          return (
            <Space direction="vertical" size={0}>
              <span>待{record.currentApproverNames[0]}处理</span>
              {record.currentApproverNames.length > 1 && (
                <span style={{ color: '#999', fontSize: 12 }}>
                  等{record.currentApproverNames.length}人
                </span>
              )}
            </Space>
          );
        }
        return '-';
      },
    },
    {
      title: '申请时间',
      dataIndex: 'createTime',
      key: 'createTime',
      width: 180,
      render: (time: number) => new Date(time).toLocaleString(),
    },
    {
      title: '操作',
      key: 'action',
      width: 180,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            onClick={() => handleViewDetail(record)}
          >
            详情
          </Button>
          {canRecall(record.status) && (
            <Popconfirm
              title="确定撤回该申请？撤回后审批流程将终止"
              onConfirm={() => handleRecall(record)}
              okText="确定"
              cancelText="取消"
            >
              <Button
                type="link"
                size="small"
                danger
              >
                撤回
              </Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  // 状态选项
  const statusOptions = Object.entries(APPROVAL_STATUS_MAP).map(([value, config]) => ({
    label: config.text,
    value,
  }));

  return (
    <div className="my-applications-page">
      <Card>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
          <Space>
            <Select
              placeholder="审批状态"
              allowClear
              style={{ width: 120 }}
              onChange={handleStatusChange}
              options={statusOptions}
            />
            <Select
              placeholder="业务模块"
              allowClear
              style={{ width: 150 }}
              onChange={handleModuleChange}
              options={MODULE_LIST.map(m => ({ label: m.name, value: m.code }))}
            />
          </Space>
        </div>
        <Table
          rowKey="taskId"
          columns={columns}
          dataSource={dataSource}
          loading={loading}
          pagination={{
            ...pagination,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条`,
          }}
          onChange={handleTableChange}
          scroll={{ x: 1000 }}
        />
      </Card>

      {/* 详情抽屉 */}
      <ApprovalDetailDrawer
        visible={detailVisible}
        taskId={detailTaskId ?? undefined}
        loading={detailLoading}
        onClose={() => {
          setDetailVisible(false);
          setDetailTaskId(null);
        }}
      />
    </div>
  );
}
