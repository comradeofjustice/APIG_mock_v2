/**
 * 审批与规则控制 - 类型定义
 */

// ========== 审批规则 ==========

/** 审批规则 */
export interface ApprovalRule {
  id: number;
  ruleName: string;
  ruleDesc?: string;
  enabled: boolean;
  priority: number;
  scopeJson: ScopeJson;
  approvalFlow: ApprovalFlow[];
  createTime: number;
  updateTime?: number;
}

/** 适用范围 JSON */
export interface ScopeJson {
  [moduleCode: string]: string[];
}

/** 审批流程层级 */
export interface ApprovalFlow {
  level: number;
  mode: 'or' | 'and'; // or: 或签, and: 会签
  approvers: string[];
}

/** 审批规则表单 */
export interface ApprovalRuleForm {
  ruleName: string;
  ruleDesc?: string;
  enabled?: boolean;
  priority?: number;
  scopeJson: ScopeJson;
  approvalFlow: ApprovalFlow[];
}

// ========== 审批任务 ==========

/** 审批状态 */
export type ApprovalStatus = 'pending' | 'in_progress' | 'approved' | 'rejected' | 'recalled';

/** 执行状态 */
export type ExecutionStatus = 'pending' | 'executing' | 'success' | 'failed';

/** 审批任务 */
export interface ApprovalTask {
  id: number;
  moduleCode: string;
  operationCode: string;
  status: ApprovalStatus;
  applicantId: string;
  currentLevel: number;
  approvalFlow: ApprovalFlow[];
  changeSnapshot: ChangeSnapshot;
  executionStatus?: ExecutionStatus;
  createTime: number;
  updateTime?: number;
}

/** 变更快照 */
export interface ChangeSnapshot {
  beforeData?: Record<string, unknown>;
  afterData?: Record<string, unknown>;
}

/** 审批任务列表项 */
export interface ApprovalTaskListItem extends ApprovalTask {
  // 额外展示字段（由后端关联计算）
  moduleName?: string;
  operationName?: string;
  applicantName?: string;
  currentApproverNames?: string[];
  totalLevels?: number;
}

/** 层级状态映射 */
export interface LevelStatusMap {
  [level: number]: 'done' | 'current' | 'pending' | 'rejected';
}

// ========== 审批记录 ==========

/** 审批动作 */
export type ApprovalAction = 'approve' | 'reject' | 'recall';

/** 审批记录 */
export interface ApprovalRecord {
  id: number;
  taskId: number;
  level: number;
  approverId: string;
  approverName?: string;
  action: ApprovalAction;
  opinion?: string;
  createTime: number;
}

/** 时间线记录 */
export interface TimelineRecord {
  time: string;
  operatorId: string;
  operatorName?: string;
  action: string;
  opinion?: string;
}

// ========== 我的申请 ==========

/** 我的申请记录 */
export interface MyApplication {
  taskId: number;
  moduleCode: string;
  moduleName?: string;
  operationCode: string;
  operationName?: string;
  status: ApprovalStatus;
  currentApproverIds?: string[];
  currentApproverNames?: string[];
  createTime: number;
  updateTime?: number;
}

// ========== API 请求/响应 ==========

/** 分页请求 */
export interface PageRequest {
  currentPage: number;
  pageSize: number;
}

/** 分页响应 */
export interface PageResponse<T> {
  totalCount: number;
  currentPage: number;
  pageSize: number;
  data: T[];
}

/** 审批规则查询 */
export interface ApprovalRuleQuery extends PageRequest {
  nameKeyword?: string;
}

/** 审批任务查询 */
export interface ApprovalTaskQuery extends PageRequest {
  tabKey: 'todo' | 'done';
  moduleCode?: string;
}

/** 我的申请查询 */
export interface MyApplicationQuery extends PageRequest {
  status?: ApprovalStatus;
  moduleCode?: string;
}

/** 审批操作请求 */
export interface ApprovalActionRequest {
  opinion: string;
}

/** 批量审批请求 */
export interface BatchApprovalRequest {
  taskIds: number[];
  opinion: string;
}

/** 任务详情响应 */
export interface TaskDetailResponse extends ApprovalTask {
  moduleName: string;
  operationName: string;
  applicantName: string;
  totalLevels: number;
  levelStatusMap: LevelStatusMap;
  timeline: TimelineRecord[];
  records: ApprovalRecord[];
  currentApproverNames?: string[];
}

/** 用户字典项 */
export interface UserItem {
  userId: string;
  userName: string;
}
