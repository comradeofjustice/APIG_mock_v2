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
  Alert,
  Checkbox,
  Tooltip,
} from 'antd';
import {
  PlusOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import type { ApprovalRule, ApprovalRuleForm, UserItem, ApprovalFlow } from '../types';
import { MODULE_LIST } from '../constants';
import { createApprovalRule, updateApprovalRule } from '../services';
import ApprovalFlowChart from './ApprovalFlowChart';

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
  // 已选模块列表（受控）
  const [selectedModules, setSelectedModules] = useState<string[]>([]);

  // 初始化
  useEffect(() => {
    if (visible) {
      if (editingRule) {
        const scopeKeys = Object.keys(editingRule.scopeJson || {});
        form.setFieldsValue({
          ruleName: editingRule.ruleName,
          ruleDesc: editingRule.ruleDesc,
          enabled: editingRule.enabled,
          priority: editingRule.priority,
          scopeJson: editingRule.scopeJson,
        });
        setSelectedModules(scopeKeys);
        setApprovalFlow(editingRule.approvalFlow);
      } else {
        form.resetFields();
        form.setFieldsValue({
          enabled: true,
          priority: 50,
          scopeJson: {},
        });
        setSelectedModules([]);
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

        <Divider orientation="left">适用模块与操作</Divider>
        
        <Alert
          message="选择该规则生效的模块和操作类型"
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />

        <Form.Item label="适用模块">
          <Checkbox.Group
            value={selectedModules}
            onChange={(checkedValues) => {
              const newModules = checkedValues as string[];
              setSelectedModules(newModules);
              // 清理取消勾选模块的 scopeJson 数据
              const currentScope = form.getFieldValue('scopeJson') || {};
              const newScope: Record<string, string[]> = {};
              newModules.forEach(key => {
                newScope[key] = currentScope[key] || [];
              });
              form.setFieldsValue({ scopeJson: newScope });
            }}
            style={{ width: '100%' }}
          >
            <Space wrap size={[8, 12]}>
              {MODULE_LIST.map((module) => (
                <Tooltip key={module.code} title={module.tooltip}>
                  <Checkbox value={module.code}>{module.name}</Checkbox>
                </Tooltip>
              ))}
            </Space>
          </Checkbox.Group>
        </Form.Item>

        {selectedModules.length > 0 && (
          <div style={{ marginTop: 8, marginBottom: 16 }}>
            {selectedModules.map((moduleCode) => {
              const moduleDef = MODULE_LIST.find(m => m.code === moduleCode);
              if (!moduleDef) return null;
              return (
                <div
                  key={moduleCode}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    marginBottom: 8,
                    padding: '8px 12px',
                    background: '#fafbfc',
                    borderRadius: 6,
                    border: '1px solid #f0f0f0',
                  }}
                >
                  <span style={{ width: 100, flexShrink: 0, fontWeight: 500 }}>
                    {moduleDef.name}
                  </span>
                  <Form.Item
                    name={['scopeJson', moduleCode]}
                    noStyle
                  >
                    <Select
                      mode="multiple"
                      placeholder={`选择${moduleDef.name}需审批的操作类型`}
                      style={{ flex: 1 }}
                      allowClear
                      options={moduleDef.operations.map((op) => ({
                        label: op,
                        value: op,
                      }))}
                    />
                  </Form.Item>
                </div>
              );
            })}
          </div>
        )}

        <Divider orientation="left">审批流程</Divider>

        <Alert
          message="最多支持4级审批层级，支持或签（任一审批人通过即可）和会签（全部审批人通过）"
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />

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
                  icon={<DeleteOutlined />}
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
          icon={<PlusOutlined />}
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
