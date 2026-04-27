/**
 * 审批与规则控制 - Mock 数据
 */

import type {
  ApprovalRule,
  ApprovalTaskListItem,
  MyApplication,
  UserItem,
  TaskDetailResponse,
} from './types';

// ========== 用户字典 ==========

export const MOCK_USERS: UserItem[] = [
  { userId: 'u1001', userName: '张三' },
  { userId: 'u1002', userName: '李四' },
  { userId: 'u2001', userName: '王五' },
  { userId: 'u3001', userName: '赵主管' },
  { userId: 'u3002', userName: '刘总监' },
  { userId: 'u4001', userName: '周经理' },
  { userId: 'u5001', userName: '高主管' },
];

// 用户 ID -> 名称映射
export const userNameMap: Record<string, string> = MOCK_USERS.reduce(
  (acc, user) => {
    acc[user.userId] = user.userName;
    return acc;
  },
  {} as Record<string, string>
);

// ========== 审批规则 Mock ==========

export let MOCK_RULES: ApprovalRule[] = [
  {
    id: 1,
    ruleName: '生产高危API删除规则',
    ruleDesc: '生产环境API删除需审批',
    enabled: true,
    priority: 95,
    scopeJson: {
      api: ['delete'],
    },
    approvalFlow: [
      { level: 1, mode: 'or', approvers: ['u1001', 'u1002'] },
      { level: 2, mode: 'and', approvers: ['u2001'] },
    ],
    createTime: 1708243200000,
    updateTime: 1708329600000,
  },
  {
    id: 2,
    ruleName: '核心服务禁用规则',
    ruleDesc: '服务禁用必须审批',
    enabled: true,
    priority: 88,
    scopeJson: {
      service: ['disable'],
    },
    approvalFlow: [
      { level: 1, mode: 'or', approvers: ['u3001'] },
    ],
    createTime: 1708156800000,
    updateTime: 1708243200000,
  },
  {
    id: 3,
    ruleName: '敏感数据标签变更规则',
    ruleDesc: '敏感数据标签修改需二级审批',
    enabled: true,
    priority: 75,
    scopeJson: {
      data_tag: ['change', 'delete'],
    },
    approvalFlow: [
      { level: 1, mode: 'or', approvers: ['u1001'] },
      { level: 2, mode: 'and', approvers: ['u3001', 'u3002'] },
    ],
    createTime: 1708070400000,
  },
  {
    id: 4,
    ruleName: '白名单新增审批规则',
    ruleDesc: '新增白名单需审批',
    enabled: false,
    priority: 60,
    scopeJson: {
      whitelist: ['add'],
    },
    approvalFlow: [
      { level: 1, mode: 'or', approvers: ['u1002'] },
    ],
    createTime: 1707984000000,
  },
];

// ========== 审批任务 Mock（待我审批） ==========

export let MOCK_TASKS_TODO: ApprovalTaskListItem[] = [
  {
    id: 1000,
    moduleCode: 'certificate',
    moduleName: '证书',
    operationCode: 'add',
    operationName: '新增',
    status: 'in_progress',
    applicantId: 'u5001',
    applicantName: '高主管',
    currentLevel: 1,
    approvalFlow: [{ level: 1, mode: 'or', approvers: ['u5001'] }],
    changeSnapshot: {
      beforeData: { count: 10 },
      afterData: { count: 11 },
    },
    executionStatus: 'pending',
    createTime: 1708243200000,
    updateTime: 1708246800000,
  },
  {
    id: 1001,
    moduleCode: 'api',
    moduleName: 'API',
    operationCode: 'delete',
    operationName: '删除',
    status: 'pending',
    applicantId: 'u1001',
    applicantName: '张三',
    currentLevel: 1,
    approvalFlow: [
      { level: 1, mode: 'or', approvers: ['u1001', 'u1002'] },
      { level: 2, mode: 'and', approvers: ['u2001'] },
    ],
    changeSnapshot: {
      beforeData: { version: 'v1' },
      afterData: { deleted: true },
    },
    executionStatus: 'pending',
    createTime: 1708250400000,
    totalLevels: 2,
  },
  {
    id: 1002,
    moduleCode: 'service',
    moduleName: '服务',
    operationCode: 'disable',
    operationName: '禁用',
    status: 'approved',
    applicantId: 'u3001',
    applicantName: '赵主管',
    currentLevel: 2,
    approvalFlow: [
      { level: 1, mode: 'or', approvers: ['u3001'] },
      { level: 2, mode: 'or', approvers: ['u3002'] },
    ],
    changeSnapshot: {
      beforeData: { status: 'enabled' },
      afterData: { status: 'disabled' },
    },
    executionStatus: 'success',
    createTime: 1708236000000,
    updateTime: 1708243200000,
    totalLevels: 2,
  },
  {
    id: 1003,
    moduleCode: 'api',
    moduleName: 'API',
    operationCode: 'change',
    operationName: '变更',
    status: 'in_progress',
    applicantId: 'u4001',
    applicantName: '周经理',
    currentLevel: 2,
    approvalFlow: [
      { level: 1, mode: 'or', approvers: ['u4001'] },
      { level: 2, mode: 'and', approvers: ['u4001', 'u5001'] },
    ],
    changeSnapshot: {
      beforeData: { timeout: 30 },
      afterData: { timeout: 60 },
    },
    executionStatus: 'pending',
    createTime: 1708264800000,
    totalLevels: 2,
  },
];

// ========== 审批任务 Mock（我的已处理） ==========

export let MOCK_TASKS_DONE: ApprovalTaskListItem[] = [
  {
    id: 2000,
    moduleCode: 'service',
    moduleName: '服务',
    operationCode: 'add',
    operationName: '新增',
    status: 'approved',
    applicantId: 'u1001',
    applicantName: '张三',
    currentLevel: 1,
    approvalFlow: [{ level: 1, mode: 'or', approvers: ['u2001'] }],
    changeSnapshot: {},
    executionStatus: 'success',
    createTime: 1708156800000,
    updateTime: 1708160400000,
  },
  {
    id: 2001,
    moduleCode: 'api',
    moduleName: 'API',
    operationCode: 'change',
    operationName: '变更',
    status: 'rejected',
    applicantId: 'u1002',
    applicantName: '李四',
    currentLevel: 1,
    approvalFlow: [{ level: 1, mode: 'or', approvers: ['u2001'] }],
    changeSnapshot: {},
    executionStatus: 'pending',
    createTime: 1708070400000,
    updateTime: 1708077600000,
  },
];

// ========== 我的申请 Mock ==========

export let MOCK_MY_APPLICATIONS: MyApplication[] = [
  {
    taskId: 1000,
    moduleCode: 'certificate',
    moduleName: '证书',
    operationCode: 'add',
    operationName: '新增',
    status: 'in_progress',
    currentApproverIds: ['u5001'],
    currentApproverNames: ['高主管'],
    createTime: 1708243200000,
    updateTime: 1708246800000,
  },
  {
    taskId: 1001,
    moduleCode: 'api',
    moduleName: 'API',
    operationCode: 'delete',
    operationName: '删除',
    status: 'pending',
    currentApproverIds: ['u1001', 'u1002'],
    currentApproverNames: ['张三', '李四'],
    createTime: 1708250400000,
  },
  {
    taskId: 2000,
    moduleCode: 'service',
    moduleName: '服务',
    operationCode: 'add',
    operationName: '新增',
    status: 'approved',
    currentApproverIds: ['u2001'],
    currentApproverNames: ['王五'],
    createTime: 1708156800000,
    updateTime: 1708160400000,
  },
  {
    taskId: 2001,
    moduleCode: 'api',
    moduleName: 'API',
    operationCode: 'change',
    operationName: '变更',
    status: 'rejected',
    createTime: 1708070400000,
    updateTime: 1708077600000,
  },
];

// ========== 任务详情 Mock ==========

export let MOCK_TASK_DETAIL: TaskDetailResponse = {
  id: 1001,
  moduleCode: 'api',
  moduleName: 'API',
  operationCode: 'delete',
  operationName: '删除',
  status: 'pending',
  applicantId: 'u1001',
  applicantName: '张三',
  currentLevel: 1,
  totalLevels: 2,
  approvalFlow: [
    { level: 1, mode: 'or', approvers: ['u1001', 'u1002'] },
    { level: 2, mode: 'and', approvers: ['u2001'] },
  ],
  levelStatusMap: {
    1: 'current',
    2: 'pending',
  },
  changeSnapshot: {
    beforeData: { version: 'v1', path: '/api/user' },
    afterData: { deleted: true },
  },
  executionStatus: 'pending',
  createTime: 1708250400000,
  timeline: [
    {
      time: '2026-04-22 09:30:00',
      operatorId: 'u1001',
      operatorName: '张三',
      action: 'submit',
      opinion: '',
    },
  ],
  records: [],
  currentApproverNames: ['张三', '李四'],
};

// ========== Mock 数据池变更操作 ==========

/**
 * 检查是否与当前层级审批人匹配（模拟当前用户为所有审批人）
 */
export function isCurrentApprover(/* _task: ApprovalTask */): boolean {
  return true; // Demo 模式下当前用户对所有待审批任务都有权限
}

/**
 * 审批任务通过 - 更新数据池
 */
export function approveMockTask(taskId: number): void {
  const idx = MOCK_TASKS_TODO.findIndex(t => t.id === taskId);
  if (idx !== -1) {
    const task = MOCK_TASKS_TODO[idx];
    task.status = 'approved';
    task.executionStatus = 'success';
    task.updateTime = Date.now();
    // 移除并添加到已处理
    MOCK_TASKS_TODO.splice(idx, 1);
    MOCK_TASKS_DONE.push(task);
  }
  // 同步更新我的申请
  updateApplicationStatus(taskId, 'approved');
}

/**
 * 审批任务拒绝 - 更新数据池
 */
export function rejectMockTask(taskId: number): void {
  const idx = MOCK_TASKS_TODO.findIndex(t => t.id === taskId);
  if (idx !== -1) {
    const task = MOCK_TASKS_TODO[idx];
    task.status = 'rejected';
    task.updateTime = Date.now();
    MOCK_TASKS_TODO.splice(idx, 1);
    MOCK_TASKS_DONE.push(task);
  }
  updateApplicationStatus(taskId, 'rejected');
}

/**
 * 同步更新我的申请状态
 */
function updateApplicationStatus(taskId: number, status: MyApplication['status']): void {
  const app = MOCK_MY_APPLICATIONS.find(a => a.taskId === taskId);
  if (app) {
    app.status = status;
    app.updateTime = Date.now();
  }
}

/**
 * 模拟撤回申请 - 更新数据池
 */
export function recallMockApplication(taskId: number): void {
  const app = MOCK_MY_APPLICATIONS.find(a => a.taskId === taskId);
  if (app) {
    app.status = 'recalled';
    app.updateTime = Date.now();
  }
  // 同步更新任务状态
  const todoIdx = MOCK_TASKS_TODO.findIndex(t => t.id === taskId);
  if (todoIdx !== -1) {
    MOCK_TASKS_TODO[todoIdx].status = 'recalled';
    MOCK_TASKS_TODO.splice(todoIdx, 1);
  }
}

/**
 * 新增规则 - 更新数据池
 */
export function addMockRule(data: { ruleName: string; ruleDesc?: string; enabled?: boolean; priority?: number; scopeJson: Record<string, string[]>; approvalFlow: { level: number; mode: 'or' | 'and'; approvers: string[] }[] }): { id: number } {
  const maxId = Math.max(...MOCK_RULES.map(r => r.id), 0);
  const newRule: ApprovalRule = {
    id: maxId + 1,
    ruleName: data.ruleName,
    ruleDesc: data.ruleDesc,
    enabled: data.enabled ?? true,
    priority: data.priority ?? 50,
    scopeJson: data.scopeJson,
    approvalFlow: data.approvalFlow,
    createTime: Date.now(),
  };
  MOCK_RULES.push(newRule);
  return { id: newRule.id };
}

/**
 * 更新规则 - 更新数据池
 */
export function updateMockRule(id: number, data: { ruleName?: string; ruleDesc?: string; enabled?: boolean; priority?: number; scopeJson?: Record<string, string[]>; approvalFlow?: { level: number; mode: 'or' | 'and'; approvers: string[] }[] }): void {
  const rule = MOCK_RULES.find(r => r.id === id);
  if (rule) {
    Object.assign(rule, data, { updateTime: Date.now() });
  }
}

/**
 * 删除规则 - 更新数据池
 */
export function deleteMockRule(id: number): void {
  const idx = MOCK_RULES.findIndex(r => r.id === id);
  if (idx !== -1) {
    MOCK_RULES.splice(idx, 1);
  }
}

/**
 * 启用/禁用规则 - 更新数据池
 */
export function toggleMockRule(id: number, enabled: boolean): void {
  const rule = MOCK_RULES.find(r => r.id === id);
  if (rule) {
    rule.enabled = enabled;
    rule.updateTime = Date.now();
  }
}
