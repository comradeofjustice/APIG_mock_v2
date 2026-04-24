/**
 * 审批与规则控制 - API 服务
 * 
 * TODO: 替换为真实后端 API 调用
 */

import type {
  ApprovalRule,
  ApprovalRuleQuery,
  ApprovalRuleForm,
  ApprovalTaskListItem,
  ApprovalTaskQuery,
  MyApplication,
  MyApplicationQuery,
  TaskDetailResponse,
  ApprovalActionRequest,
  BatchApprovalRequest,
  PageResponse,
  UserItem,
} from './types';

import {
  MOCK_RULES,
  MOCK_TASKS_TODO,
  MOCK_TASKS_DONE,
  MOCK_MY_APPLICATIONS,
  MOCK_TASK_DETAIL,
  MOCK_USERS,
} from './mockData';

// 模拟延迟
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// ========== 审批规则 API ==========

/**
 * 分页查询审批规则
 */
export async function queryApprovalRules(
  params: ApprovalRuleQuery
): Promise<PageResponse<ApprovalRule>> {
  // TODO: 替换为真实 API
  await delay(300);
  
  const { nameKeyword, currentPage, pageSize } = params;
  let filtered = MOCK_RULES;
  
  if (nameKeyword) {
    filtered = filtered.filter(rule => 
      rule.ruleName.includes(nameKeyword)
    );
  }
  
  const start = (currentPage - 1) * pageSize;
  const data = filtered.slice(start, start + pageSize);
  
  return {
    totalCount: filtered.length,
    currentPage,
    pageSize,
    data,
  };
}

/**
 * 新增审批规则
 */
export async function createApprovalRule(
  _data: ApprovalRuleForm
): Promise<{ id: number }> {
  // TODO: 替换为真实 API
  await delay(500);
  
  return { id: Date.now() };
}

/**
 * 更新审批规则
 */
export async function updateApprovalRule(
  _id: number,
  _data: ApprovalRuleForm
): Promise<void> {
  // TODO: 替换为真实 API
  await delay(500);
}

/**
 * 删除审批规则
 */
export async function deleteApprovalRule(_id: number): Promise<void> {
  // TODO: 替换为真实 API
  await delay(300);
}

/**
 * 启用/禁用审批规则
 */
export async function toggleApprovalRule(
  _id: number,
  _enabled: boolean
): Promise<void> {
  // TODO: 替换为真实 API
  await delay(300);
}

// ========== 审批任务 API ==========

/**
 * 查询审批任务
 */
export async function queryApprovalTasks(
  params: ApprovalTaskQuery
): Promise<PageResponse<ApprovalTaskListItem>> {
  // TODO: 替换为真实 API
  await delay(300);
  
  const { tabKey, moduleCode, currentPage, pageSize } = params;
  
  let data = tabKey === 'todo' ? MOCK_TASKS_TODO : MOCK_TASKS_DONE;
  
  if (moduleCode) {
    data = data.filter(task => task.moduleCode === moduleCode);
  }
  
  const start = (currentPage - 1) * pageSize;
  const pageData = data.slice(start, start + pageSize);
  
  return {
    totalCount: data.length,
    currentPage,
    pageSize,
    data: pageData,
  };
}

/**
 * 获取待审批任务数量
 */
export async function getPendingTaskCount(): Promise<number> {
  // TODO: 替换为真实 API
  await delay(200);
  
  return MOCK_TASKS_TODO.length;
}

/**
 * 获取任务详情
 */
export async function getTaskDetail(
  taskId: number
): Promise<TaskDetailResponse> {
  // TODO: 替换为真实 API
  await delay(300);
  
  return { ...MOCK_TASK_DETAIL, id: taskId };
}

/**
 * 审批通过
 */
export async function approveTask(
  _taskId: number,
  _data: ApprovalActionRequest
): Promise<void> {
  // TODO: 替换为真实 API
  await delay(500);
}

/**
 * 审批拒绝
 */
export async function rejectTask(
  _taskId: number,
  _data: ApprovalActionRequest
): Promise<void> {
  // TODO: 替换为真实 API
  await delay(500);
}

/**
 * 批量通过
 */
export async function batchApproveTasks(
  _data: BatchApprovalRequest
): Promise<void> {
  // TODO: 替换为真实 API
  await delay(800);
}

/**
 * 批量拒绝
 */
export async function batchRejectTasks(
  _data: BatchApprovalRequest
): Promise<void> {
  // TODO: 替换为真实 API
  await delay(800);
}

// ========== 我的申请 API ==========

/**
 * 查询我的申请
 */
export async function queryMyApplications(
  params: MyApplicationQuery
): Promise<PageResponse<MyApplication>> {
  // TODO: 替换为真实 API
  await delay(300);
  
  const { status, moduleCode, currentPage, pageSize } = params;
  let data = [...MOCK_MY_APPLICATIONS];
  
  if (status) {
    data = data.filter(app => app.status === status);
  }
  
  if (moduleCode) {
    data = data.filter(app => app.moduleCode === moduleCode);
  }
  
  const start = (currentPage - 1) * pageSize;
  const pageData = data.slice(start, start + pageSize);
  
  return {
    totalCount: data.length,
    currentPage,
    pageSize,
    data: pageData,
  };
}

/**
 * 撤回申请
 */
export async function recallMyApplication(_taskId: number): Promise<void> {
  // TODO: 替换为真实 API
  await delay(500);
}

// ========== 辅助 API ==========

/**
 * 获取用户字典
 */
export async function getUserList(): Promise<UserItem[]> {
  // TODO: 替换为真实 API
  await delay(200);
  
  return MOCK_USERS;
}
