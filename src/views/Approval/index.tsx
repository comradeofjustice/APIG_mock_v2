/**
 * 审批与规则控制 - 审批管理主入口
 * 
 * 本模块包含三个主要功能页面：
 * 1. 审批规则管理 (/approval/rules)
 * 2. 审批任务中心 (/approval/task-center)  
 * 3. 我的申请 (/approval/my-applications)
 * 
 * 技术栈：React 17 + antd 4.17
 */

export { default as ApprovalRuleManage } from './ApprovalRuleManage';
export { default as ApprovalTaskCenter } from './ApprovalTaskCenter';
export { default as MyApplications } from './MyApplications';
export { default as ApprovalLayout } from './ApprovalLayout';

// 组件（components 目录）
export { default as ApprovalDetailDrawer } from './components/ApprovalDetailDrawer';
export { default as RuleFormModal } from './components/RuleFormModal';

// 类型定义
export type { ApprovalRule, ApprovalTask, ApprovalRecord, ApprovalFlow, ApprovalStatus, ExecutionStatus } from './types';

// 状态常量
export { APPROVAL_STATUS_MAP, EXECUTION_STATUS_MAP, OPERATION_TYPE_MAP } from './constants';
