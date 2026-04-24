/**
 * 审批与规则控制 - 状态常量定义
 */

// 审批状态
export const APPROVAL_STATUS_MAP = {
  pending: { text: '待审批', color: 'warning' },
  in_progress: { text: '审批中', color: 'warning' },
  approved: { text: '已通过', color: 'success' },
  rejected: { text: '已拒绝', color: 'error' },
  recalled: { text: '已撤回', color: 'default' },
} as const;

// 执行状态
export const EXECUTION_STATUS_MAP = {
  pending: { text: '待执行', color: 'default' },
  executing: { text: '执行中', color: 'processing' },
  success: { text: '执行成功', color: 'success' },
  failed: { text: '执行失败', color: 'error' },
} as const;

// 操作类型
export const OPERATION_TYPE_MAP = {
  add: '新增',
  change: '变更',
  delete: '删除',
  enable: '启用',
  disable: '禁用',
} as const;

// 审批流程层级状态
export const LEVEL_STATUS_MAP = {
  done: { text: '已完成', color: 'success' },
  current: { text: '进行中', color: 'processing' },
  pending: { text: '未开始', color: 'default' },
  rejected: { text: '已拒绝', color: 'error' },
} as const;

// 业务模块
export const MODULE_LIST = [
  { code: 'service', name: '服务', operations: ['新增', '变更', '删除'], tooltip: '服务的创建、修改与删除操作需审批' },
  { code: 'api', name: 'API', operations: ['新增', '变更', '导入', '删除'], tooltip: 'API接口的增删改及导入操作需审批' },
  { code: 'certificate', name: '证书', operations: ['新增', '变更', '删除'], tooltip: '证书的上传、修改与删除操作需审批' },
  { code: 'data_tag', name: '数据标签', operations: ['修改', '删除'], tooltip: '数据标签的修改与删除操作需审批' },
  { code: 'desensitization_rule', name: '脱敏规则', operations: ['新增', '变更', '删除'], tooltip: '脱敏规则的增删改操作需审批' },
  { code: 'watermark_rule', name: '水印规则', operations: ['变更'], tooltip: '水印规则的变更操作需审批' },
  { code: 'security_rule_group', name: '安全规则组', operations: ['新增', '配置', '变更', '删除'], tooltip: '安全规则组的增删改及配置操作需审批' },
  { code: 'access_control', name: '访问控制', operations: ['新增', '变更', '删除'], tooltip: '访问控制的增删改操作需审批' },
  { code: 'whitelist', name: '白名单', operations: ['新增', '变更', '删除'], tooltip: '白名单的增删改操作需审批' },
  { code: 'ai_policy', name: 'AI合规策略', operations: ['新增', '变更', '删除'], tooltip: 'AI合规策略的增删改操作需审批' },
] as const;

// 基础操作类型
export const BASE_OPERATIONS = ['新增', '变更', '删除'] as const;
