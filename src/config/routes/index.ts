import React from 'react';
import type { RouteObject } from 'react-router-dom';

import Home from '@/views/Home';
import MultimodalValidation from '@/views/MultimodalValidation';
import VerificationHistory from '@/views/VerificationHistory';
import { ApprovalLayout, ApprovalRuleManage, ApprovalTaskCenter, MyApplications } from '@/views/Approval';
import { ApiManagePage, ApiDebugPage as ApiManagementDebugPage } from '@/views/ApiManagement';
import DatabaseServiceManage from '@/views/DatabaseService/DatabaseServiceManage';
import { DatabaseDebugPage } from '@/views/DatabaseService';
import SQLToApi from '@/views/SQLToApi';
import SqlApiDebugPage from '@/views/SQLToApi/ApiDebugPage';

/**
 * 路由注册集中在此文件（与 project_description.md 中「路由注册文件」一致）。
 * 使用 `element` 字段，便于与 React Router v6 及 Stage4「element/component 自适配」对齐。
 */
export const routes: RouteObject[] = [
  {
    path: '/',
    element: React.createElement(Home),
  },
  {
    path: '/multimodal-validation',
    element: React.createElement(MultimodalValidation),
  },
  {
    path: '/verification-history',
    element: React.createElement(VerificationHistory),
  },
  // ========== API 管理模块 ==========
  {
    path: '/api-management',
    element: React.createElement(ApiManagePage),
  },
  {
    path: '/api-management/debug',
    element: React.createElement(ApiManagementDebugPage),
  },
  // ========== 数据库服务管理模块 ==========
  {
    path: '/database-service/manage',
    element: React.createElement(DatabaseServiceManage),
  },
  {
    path: '/database-service/debug',
    element: React.createElement(DatabaseDebugPage, { mode: 'page' }),
  },
  // ========== SQL转API模块 ==========
  {
    path: '/sql-to-api',
    element: React.createElement(SQLToApi),
  },
  {
    path: '/sql-to-api/debug/:id',
    element: React.createElement(SqlApiDebugPage),
  },
  // ========== 审批与规则控制模块 ==========
  {
    path: '/approval',
    element: React.createElement(ApprovalLayout),
    children: [
      {
        path: 'rules',
        element: React.createElement(ApprovalRuleManage),
      },
      {
        path: 'task-center',
        element: React.createElement(ApprovalTaskCenter),
      },
      {
        path: 'my-applications',
        element: React.createElement(MyApplications),
      },
      {
        index: true,
        element: React.createElement(ApprovalRuleManage),
      },
    ],
  },
];
