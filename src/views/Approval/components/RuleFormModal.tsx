/**
 * 审批规则表单弹窗
 * 
 * 功能：
 * - 新增/编辑审批规则
 * - 配置适用范围（模块 + 操作）
 * - 配置审批流程（最多4级）
 */

import { useEffect, useState, useMemo } from 'react';
import {
  Modal,
  Form,
  Input,
  InputNumber,
  Switch,
  Select,
  Button,
  Space,
  message,
  Divider,
  Tooltip,
} from 'antd';
import {
  InfoCircleOutlined,
} from '@ant-design/icons';
import type { ApprovalRule, ApprovalRuleForm, UserItem, ApprovalFlow } from '../types';
import { createApprovalRule, updateApprovalRule } from '../services';
import ApprovalFlowChart from './ApprovalFlowChart';
import ModuleScopeSelector from './ModuleScopeSelector';

const { TextArea } = Input;

interface RuleFormModalProps {
  visible: boolean;
  editingRule: ApprovalRule | null;
  userList: UserItem[];
  onClose: () => void;
  onSuccess: () => void;
}

export default function RuleFormModal({
  visible,
  editingRule,
  userList,
  onClose,
  onSuccess,
}: RuleFormModalProps) {
  const [form] = Form.useForm<ApprovalRuleForm>();
  const [loading, setLoading] = useState(false);
  const [approvalFlow, setApprovalFlow] = useState<ApprovalFlow[]>([
    { level: 1, mode: 'or', approvers: [] },
  ]);

  // 初始化
  useEffect(() => {
    if (visible) {
      if (editingRule) {
        form.setFieldsValue({
          ruleName: editingRule.ruleName,
          ruleDesc: editingRule.ruleDesc,
          enabled: editingRule.enabled,
          priority: editingRule.priority,
          scopeJson: editingRule.scopeJson,
        });
        setApprovalFlow(editingRule.approvalFlow);
      } else {
        form.resetFields();
        form.setFieldsValue({
          enabled: true,
          priority: 50,
          scopeJson: {},
        });
        setApprovalFlow([{ level: 1, mode: 'or', approvers: [] }]);
      }
    }
  }, [visible, editingRule, form]);

  // 添加审批层级
  const handleAddLevel = () => {
    if (approvalFlow.length >= 4) {
      message.warning('最多支持4级审批');
      return;
    }
    setApprovalFlow([
      ...approvalFlow,
      { level: approvalFlow.length + 1, mode: 'or', approvers: [] },
    ]);
  };

  // 删除审批层级
  const handleRemoveLevel = (index: number) => {
    if (approvalFlow.length <= 1) {
      message.warning('至少需要1级审批');
      return;
    }
    const newFlow = approvalFlow.filter((_, i) => i !== index);
    // 重新编号
    setApprovalFlow(newFlow.map((level, i) => ({ ...level, level: i + 1 })));
  };

  // 更新审批层级
  const handleUpdateLevel = (index: number, field: keyof ApprovalFlow, value: any) => {
    const newFlow = [...approvalFlow];
    newFlow[index] = { ...newFlow[index], [field]: value };
    setApprovalFlow(newFlow);
  };

  // 提交
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      // 校验审批人
      for (let i = 0; i < approvalFlow.length; i++) {
        if (!approvalFlow[i].approvers.length) {
          message.error(`第${i + 1}级审批人不能为空`);
          return;
        }
      }
      
      // 校验适用范围
      const scopeEntries = Object.entries(values.scopeJson || {});
      if (scopeEntries.length === 0) {
        message.error('请选择至少一个适用模块');
        return;
      }

      setLoading(true);
      
      const data: ApprovalRuleForm = {
        ...values,
        approvalFlow,
      };

      if (editingRule) {
        await updateApprovalRule(editingRule.id, data);
        message.success('保存成功');
      } else {
        await createApprovalRule(data);
        message.success('创建成功');
      }
      
      onSuccess();
    } catch {
      message.error('操作失败');
    } finally {
      setLoading(false);
    }
  };

  // 流程预览的用户映射
  const flowUserNameMap = useMemo(() => {
    const map: Record<string, string> = {};
    userList.forEach(u => {
      map[u.userId] = u.userName;
    });
    return map;
  }, [userList]);

  // 渲染审批流程预览
  const renderFlowPreview = () => (
    <div style={{ background: '#fafbfc', padding: 16, borderRadius: 8 }}>
      <ApprovalFlowChart
        approvalFlow={approvalFlow}
        userNameMap={flowUserNameMap}
        height={200}
      />
    </div>
  );

  return (
    <Modal
      title={editingRule ? '编辑规则' : '新增规则'}
      visible={visible}
      onCancel={onClose}
      width={1000}
      footer={
        <Space>
          <Button onClick={onClose}>取消</Button>
          <Button type="primary" loading={loading} onClick={handleSubmit}>
            保存
          </Button>
        </Space>
      }
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="ruleName"
          label="规则名称"
          rules={[{ required: true, message: '请输入规则名称' }]}
        >
          <Input placeholder="请输入规则名称" maxLength={128} />
        </Form.Item>

        <Form.Item name="ruleDesc" label="描述">
          <TextArea rows={2} placeholder="请输入规则描述" maxLength={256} />
        </Form.Item>

        <Form.Item name="enabled" label="启用状态" valuePropName="checked">
          <Switch />
        </Form.Item>

        <Form.Item
          name="priority"
          label="优先级"
          rules={[{ required: true, message: '请输入优先级' }]}
        >
          <InputNumber min={1} max={100} style={{ width: 120 }} />
        </Form.Item>

        <Divider orientation="left">
          适用模块与操作
          <Tooltip title="选择该规则生效的模块和操作类型">
            <InfoCircleOutlined style={{ marginLeft: 8, color: '#999', cursor: 'help' }} />
          </Tooltip>
        </Divider>

        <Form.Item label="适用模块" name="scopeJson">
          <ModuleScopeSelector />
        </Form.Item>

        <Divider orientation="left">
          审批流程
          <Tooltip title="最多支持4级审批层级，支持或签（任一审批人通过即可）和会签（全部审批人通过）">
            <InfoCircleOutlined style={{ marginLeft: 8, color: '#999', cursor: 'help' }} />
          </Tooltip>
        </Divider>

        {approvalFlow.map((level, index) => (
          <div
            key={level.level}
            style={{
              border: '1px solid #eaeef2',
              borderRadius: 8,
              padding: 16,
              marginBottom: 12,
              background: '#fff',
            }}
          >
            <Space style={{ marginBottom: 12 }}>
              <span style={{ fontWeight: 500 }}>第{level.level}级</span>
              <Select
                value={level.mode}
                onChange={(value) => handleUpdateLevel(index, 'mode', value)}
                style={{ width: 100 }}
                options={[
                  { label: '或签', value: 'or' },
                  { label: '会签', value: 'and' },
                ]}
              />
              <span style={{ color: '#666' }}>
                {level.mode === 'or' ? '任一审批人通过即可' : '全部审批人通过'}
              </span>
              {approvalFlow.length > 1 && (
                <Button
                  type="text"
                  danger
                  onClick={() => handleRemoveLevel(index)}
                >
                  删除
                </Button>
              )}
            </Space>

            <Select
              mode="multiple"
              placeholder="请选择审批人"
              value={level.approvers}
              onChange={(value) => handleUpdateLevel(index, 'approvers', value)}
              style={{ width: '100%' }}
              options={userList.map((user) => ({
                label: user.userName,
                value: user.userId,
              }))}
            />
          </div>
        ))}

        <Button
          type="dashed"
          onClick={handleAddLevel}
          disabled={approvalFlow.length >= 4}
          block
        >
          增加审批层级
        </Button>

        <Divider orientation="left">流程预览</Divider>
        {renderFlowPreview()}
      </Form>
    </Modal>
  );
}
