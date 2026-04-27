/**
 * 审批任务中心页面
 * 
 * 功能：
 * - 待我审批 / 我的已处理 Tab 切换
 * - 审批任务列表
 * - 批量审批
 * - 查看详情
 */

import { useState, useEffect, useCallback } from 'react';
import {
  Table,
  Button,
  Space,
  Tabs,
  Select,
  Card,
  Tag,
  message,
  Modal,
  Input,
  Divider,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { ApprovalTaskListItem } from './types';
import {
  queryApprovalTasks,
  approveTask,
  rejectTask,
  batchApproveTasks,
  batchRejectTasks,
} from './services';
import ApprovalDetailDrawer from './components/ApprovalDetailDrawer';
import { APPROVAL_STATUS_MAP, MODULE_LIST } from './constants';

const { TextArea } = Input;

export default function ApprovalTaskCenter() {
  // 状态
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'todo' | 'done'>('todo');
  const [moduleFilter, setModuleFilter] = useState<string | undefined>();
  const [dataSource, setDataSource] = useState<ApprovalTaskListItem[]>([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 0,
  });
  
  // 选中行
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  
  // 详情抽屉
  const [detailVisible, setDetailVisible] = useState(false);
  const [detailTaskId, setDetailTaskId] = useState<number | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  
  // 审批意见弹窗
  const [opinionModalVisible, setOpinionModalVisible] = useState(false);
  const [opinionModalType, setOpinionModalType] = useState<'approve' | 'reject'>('approve');
  const [opinionModalTaskId, setOpinionModalTaskId] = useState<number | null>(null);
  const [opinion, setOpinion] = useState('');
  const [opinionLoading, setOpinionLoading] = useState(false);

  // 加载数据
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await queryApprovalTasks({
        currentPage: pagination.current,
        pageSize: pagination.pageSize,
        tabKey: activeTab,
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
  }, [activeTab, moduleFilter, pagination.current, pagination.pageSize]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Tab 切换
  const handleTabChange = (key: string) => {
    setActiveTab(key as 'todo' | 'done');
    setPagination(prev => ({ ...prev, current: 1 }));
    setSelectedRowKeys([]);
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

  // 选择变化
  const handleSelectionChange = (keys: React.Key[]) => {
    setSelectedRowKeys(keys);
  };

  // 查看详情
  const handleViewDetail = (record: ApprovalTaskListItem) => {
    setDetailTaskId(record.id);
    setDetailVisible(true);
    setDetailLoading(true);
    // TODO: 调用 API 获取详情
    setTimeout(() => {
      setDetailLoading(false);
    }, 500);
  };

  // 打开审批意见弹窗
  const handleOpenOpinion = (type: 'approve' | 'reject', taskId?: number) => {
    setOpinionModalType(type);
    setOpinionModalTaskId(taskId || null);
    setOpinion('');
    setOpinionModalVisible(true);
  };

  // 批量审批
  const handleBatchApproval = async () => {
    if (selectedRowKeys.length === 0) {
      message.warning('请先选择要审批的任务');
      return;
    }
    
    handleOpenOpinion(opinionModalType);
  };
  
  // 批量审批 - 暂未使用
  void handleBatchApproval;

  // 确认审批意见
  const handleConfirmOpinion = async () => {
    if (!opinion.trim()) {
      message.warning('请输入审批意见');
      return;
    }
    
    setOpinionLoading(true);
    try {
      if (opinionModalTaskId) {
        // 单个审批
        if (opinionModalType === 'approve') {
          await approveTask(opinionModalTaskId, { opinion });
          message.success('审批通过');
        } else {
          await rejectTask(opinionModalTaskId, { opinion });
          message.success('已拒绝');
        }
      } else {
        // 批量审批
        const taskIds = selectedRowKeys as number[];
        if (opinionModalType === 'approve') {
          await batchApproveTasks({ taskIds, opinion });
          message.success(`批量通过 ${taskIds.length} 个任务`);
        } else {
          await batchRejectTasks({ taskIds, opinion });
          message.success(`批量拒绝 ${taskIds.length} 个任务`);
        }
        setSelectedRowKeys([]);
      }
      
      setOpinionModalVisible(false);
      loadData();
    } catch {
      message.error('操作失败');
    } finally {
      setOpinionLoading(false);
    }
  };

  // 渲染状态标签
  const renderStatusTag = (status: ApprovalTaskListItem['status']) => {
    const config = APPROVAL_STATUS_MAP[status];
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  // 表格列定义
  const columns: ColumnsType<ApprovalTaskListItem> = [
    {
      title: '任务ID',
      dataIndex: 'id',
      key: 'id',
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
      title: '申请人',
      dataIndex: 'applicantName',
      key: 'applicantName',
      width: 100,
    },
    {
      title: '当前层级',
      key: 'level',
      width: 120,
      render: (_, record) => (
        <span>
          第{record.currentLevel}级
          {record.totalLevels && ` / 共${record.totalLevels}级`}
        </span>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: renderStatusTag,
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      key: 'createTime',
      width: 180,
      render: (time: number) => new Date(time).toLocaleString(),
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
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
          {(record.status === 'pending' || record.status === 'in_progress') && (
            <>
              <Button
                type="link"
                size="small"
                onClick={() => handleOpenOpinion('approve', record.id)}
              >
                通过
              </Button>
              <Button
                type="link"
                size="small"
                danger
                onClick={() => handleOpenOpinion('reject', record.id)}
              >
                拒绝
              </Button>
            </>
          )}
        </Space>
      ),
    },
  ];

  // Row Selection
  const rowSelection = activeTab === 'todo' ? {
    selectedRowKeys,
    onChange: handleSelectionChange,
  } : undefined;

  return (
    <div className="approval-task-center-page">
      <Card>
        <Tabs
          activeKey={activeTab}
          onChange={handleTabChange}
        >
          <Tabs.TabPane tab="待我审批" key="todo" />
          <Tabs.TabPane tab="我的已处理" key="done" />
        </Tabs>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <Space>
            {activeTab === 'todo' && (
              <>
                <Button
                  type="primary"
                  onClick={() => handleOpenOpinion('approve')}
                  disabled={selectedRowKeys.length === 0}
                >
                  批量通过
                </Button>
                <Button
                  danger
                  onClick={() => handleOpenOpinion('reject')}
                  disabled={selectedRowKeys.length === 0}
                >
                  批量拒绝
                </Button>
              </>
            )}
          </Space>
          <Select
            placeholder="业务模块"
            allowClear
            style={{ width: 150 }}
            onChange={handleModuleChange}
            options={MODULE_LIST.map(m => ({ label: m.name, value: m.code }))}
          />
        </div>

        <Table
          rowKey="id"
          columns={columns}
          dataSource={dataSource}
          loading={loading}
          rowSelection={rowSelection}
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

      {/* 审批详情抽屉 */}
      <ApprovalDetailDrawer
        visible={detailVisible}
        taskId={detailTaskId || undefined}
        loading={detailLoading}
        onClose={() => setDetailVisible(false)}
      />

      {/* 审批意见弹窗 */}
      <Modal
        title={
          opinionModalType === 'approve' 
            ? (opinionModalTaskId ? '审批通过' : '批量通过')
            : (opinionModalTaskId ? '审批拒绝' : '批量拒绝')
        }
        visible={opinionModalVisible}
        onCancel={() => setOpinionModalVisible(false)}
        onOk={handleConfirmOpinion}
        okText="确认"
        cancelText="取消"
        okButtonProps={{ loading: opinionLoading, danger: opinionModalType === 'reject' }}
      >
        <Space direction="vertical" style={{ width: '100%' }} size="middle">
          <p>
            {opinionModalType === 'approve' ? '确认通过' : '确认拒绝'}
            {opinionModalTaskId
              ? `任务 ${opinionModalTaskId}`
              : ` ${selectedRowKeys.length} 个任务`
            }
          </p>
          <TextArea
            rows={3}
            placeholder="请输入审批意见（必填）"
            value={opinion}
            onChange={(e) => setOpinion(e.target.value)}
          />
          {opinionModalType === 'approve' ? (
            <>
              <Divider style={{ margin: '4px 0' }} />
              <div>
                <span style={{ color: '#666', fontSize: 12, marginRight: 8 }}>通过建议：</span>
                <Space wrap size={4}>
                  <Button size="small" onClick={() => setOpinion('同意上线')}>同意上线</Button>
                  <Button size="small" onClick={() => setOpinion('风险可控，予以通过')}>风险可控</Button>
                  <Button size="small" onClick={() => setOpinion('已确认，同意执行')}>已确认</Button>
                </Space>
              </div>
            </>
          ) : (
            <>
              <Divider style={{ margin: '4px 0' }} />
              <div>
                <span style={{ color: '#666', fontSize: 12, marginRight: 8 }}>驳回建议：</span>
                <Space wrap size={4}>
                  <Button size="small" danger onClick={() => setOpinion('不符合规范')}>不符合规范</Button>
                  <Button size="small" danger onClick={() => setOpinion('风险过高，拒绝执行')}>风险过高</Button>
                  <Button size="small" danger onClick={() => setOpinion('信息不完整，请补充后重新提交')}>信息不完整</Button>
                </Space>
              </div>
            </>
          )}
        </Space>
      </Modal>
    </div>
  );
}
