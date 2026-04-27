/**
 * 审批与规则控制 - Mock API 服务
 * 
 * 所有接口使用 Mock 数据模拟，包含完整的数据流转
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
  addMockRule,
  updateMockRule,
  deleteMockRule,
  toggleMockRule,
  approveMockTask,
  rejectMockTask,
  recallMockApplication,
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
  data: ApprovalRuleForm
): Promise<{ id: number }> {
  await delay(500);
  return addMockRule(data);
}

/**
 * 更新审批规则
 */
export async function updateApprovalRule(
  id: number,
  data: ApprovalRuleForm
): Promise<void> {
  await delay(500);
  updateMockRule(id, data);
}

/**
 * 删除审批规则
 */
export async function deleteApprovalRule(id: number): Promise<void> {
  await delay(300);
  deleteMockRule(id);
}

/**
 * 启用/禁用审批规则
 */
export async function toggleApprovalRule(
  id: number,
  enabled: boolean
): Promise<void> {
  await delay(300);
  toggleMockRule(id, enabled);
}

// ========== 审批任务 API ==========

/**
 * 查询审批任务
 */
export async function queryApprovalTasks(
  params: ApprovalTaskQuery
): Promise<PageResponse<ApprovalTaskListItem>> {
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
  await delay(200);
  
  return MOCK_TASKS_TODO.length;
}

/**
 * 获取任务详情
 */
export async function getTaskDetail(
  taskId: number
): Promise<TaskDetailResponse> {
  await delay(300);
  
  return { ...MOCK_TASK_DETAIL, id: taskId };
}

/**
 * 审批通过
 */
export async function approveTask(
  taskId: number,
  _data: ApprovalActionRequest
): Promise<void> {
  await delay(500);
  approveMockTask(taskId);
}

/**
 * 审批拒绝
 */
export async function rejectTask(
  taskId: number,
  _data: ApprovalActionRequest
): Promise<void> {
  await delay(500);
  rejectMockTask(taskId);
}

/**
 * 批量通过
 */
export async function batchApproveTasks(
  data: BatchApprovalRequest
): Promise<void> {
  await delay(800);
  data.taskIds.forEach(id => approveMockTask(id));
}

/**
 * 批量拒绝
 */
export async function batchRejectTasks(
  data: BatchApprovalRequest
): Promise<void> {
  await delay(800);
  data.taskIds.forEach(id => rejectMockTask(id));
}

// ========== 我的申请 API ==========

/**
 * 查询我的申请
 */
export async function queryMyApplications(
  params: MyApplicationQuery
): Promise<PageResponse<MyApplication>> {
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
export async function recallMyApplication(taskId: number): Promise<void> {
  await delay(500);
  recallMockApplication(taskId);
}

// ========== 辅助 API ==========

/**
 * 获取用户字典
 */
export async function getUserList(): Promise<UserItem[]> {
  await delay(200);
  
  return MOCK_USERS;
}
