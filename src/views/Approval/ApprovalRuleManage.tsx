/**
 * 审批规则管理页面
 * 
 * 功能：
 * - 审批规则列表展示
 * - 新增/编辑/删除规则
 * - 启用/禁用规则
 * - 审批流程配置（最多4级）
 */

import { useState, useEffect, useCallback } from 'react';
import {
  Table,
  Button,
  Input,
  Switch,
  Space,
  Popconfirm,
  message,
  Tag,
  Card,
  Tooltip,
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { ApprovalRule, UserItem } from './types';
import {
  queryApprovalRules,
  deleteApprovalRule,
  toggleApprovalRule,
  getUserList,
} from './services';
import RuleFormModal from './components/RuleFormModal';
import { MODULE_LIST } from './constants';

const { Search } = Input;

export default function ApprovalRuleManage() {
  // 状态
  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState<ApprovalRule[]>([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 0,
  });
  const [searchKeyword, setSearchKeyword] = useState('');
  
  // 弹窗状态
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRule, setEditingRule] = useState<ApprovalRule | null>(null);
  
  // 用户字典
  const [userList, setUserList] = useState<UserItem[]>([]);

  // 加载用户字典
  const loadUserList = useCallback(async () => {
    try {
      const users = await getUserList();
      setUserList(users);
    } catch {
      message.error('加载用户列表失败');
    }
  }, []);

  // 加载数据
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await queryApprovalRules({
        currentPage: pagination.current,
        pageSize: pagination.pageSize,
        nameKeyword: searchKeyword || undefined,
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
  }, [pagination.current, pagination.pageSize, searchKeyword]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    loadUserList();
  }, [loadUserList]);

  // 搜索
  const handleSearch = (value: string) => {
    setSearchKeyword(value);
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

  // 新增规则
  const handleAdd = () => {
    setEditingRule(null);
    setModalVisible(true);
  };

  // 编辑规则
  const handleEdit = (record: ApprovalRule) => {
    setEditingRule(record);
    setModalVisible(true);
  };

  // 删除规则
  const handleDelete = async (record: ApprovalRule) => {
    try {
      await deleteApprovalRule(record.id);
      message.success('删除成功');
      loadData();
    } catch {
      message.error('删除失败');
    }
  };

  // 启用/禁用
  const handleToggle = async (record: ApprovalRule, checked: boolean) => {
    try {
      await toggleApprovalRule(record.id, checked);
      message.success(checked ? '已启用' : '已禁用');
      loadData();
    } catch {
      message.error('操作失败');
    }
  };

  // 弹窗关闭
  const handleModalClose = () => {
    setModalVisible(false);
    setEditingRule(null);
  };

  // 弹窗保存成功
  const handleModalSuccess = () => {
    handleModalClose();
    loadData();
  };

  // 渲染适用模块
  const renderScope = (scopeJson: ApprovalRule['scopeJson']) => {
    const moduleCodes = Object.keys(scopeJson);
    const moduleNames = moduleCodes.map(
      code => MODULE_LIST.find(m => m.code === code)?.name || code
    );
    
    if (moduleNames.length <= 3) {
      return (
        <Space size={4}>
          {moduleNames.map((name, idx) => (
            <Tag key={moduleCodes[idx]}>{name}</Tag>
          ))}
        </Space>
      );
    }
    
    const visibleNames = moduleNames.slice(0, 3);
    const restNames = moduleNames.slice(3);
    return (
      <Space size={4}>
        {visibleNames.map((name, idx) => (
          <Tag key={moduleCodes[idx]}>{name}</Tag>
        ))}
        <Tooltip title={restNames.join('、')}>
          <Tag>+{restNames.length}</Tag>
        </Tooltip>
      </Space>
    );
  };

  // 表格列定义
  const columns: ColumnsType<ApprovalRule> = [
    {
      title: '规则名称',
      dataIndex: 'ruleName',
      key: 'ruleName',
      width: 200,
      ellipsis: true,
    },
    {
      title: '描述',
      dataIndex: 'ruleDesc',
      key: 'ruleDesc',
      width: 180,
      ellipsis: true,
    },
    {
      title: '启用',
      dataIndex: 'enabled',
      key: 'enabled',
      width: 80,
      render: (enabled: boolean, record) => (
        <Switch
          checked={enabled}
          onChange={(checked) => handleToggle(record, checked)}
        />
      ),
    },
    {
      title: '优先级',
      dataIndex: 'priority',
      key: 'priority',
      width: 80,
    },
    {
      title: '适用模块',
      dataIndex: 'scopeJson',
      key: 'scopeJson',
      width: 280,
      render: renderScope,
    },
    // {
    //   title: '审批流程',
    //   dataIndex: 'approvalFlow',
    //   key: 'approvalFlow',
    //   width: 320,
    //   render: renderApprovalFlow,
    // },
    {
      title: '操作',
      key: 'action',
      width: 150,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定删除该规则？删除后不可恢复"
            onConfirm={() => handleDelete(record)}
            okText="确定"
            cancelText="取消"
          >
            <Button
              type="link"
              size="small"
              danger
            >
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="approval-rule-manage-page">
      <Card
        title="审批规则管理"
        extra={
          <Space>
            <Search
              placeholder="搜索规则名称"
              allowClear
              style={{ width: 240 }}
              onSearch={handleSearch}
              prefix={<SearchOutlined />}
            />
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleAdd}
            >
              新增规则
            </Button>
          </Space>
        }
        style={{ padding: 0 }}
      >
        <Table
          rowKey="id"
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
          scroll={{ x: 1200 }}
        />
      </Card>

      <RuleFormModal
        visible={modalVisible}
        editingRule={editingRule}
        userList={userList}
        onClose={handleModalClose}
        onSuccess={handleModalSuccess}
      />
    </div>
  );
}
