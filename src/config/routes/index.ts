import React from 'react';
import type { RouteObject } from 'react-router-dom';

import Home from '@/views/Home';
import MultimodalValidation from '@/views/MultimodalValidation';
import VerificationHistory from '@/views/VerificationHistory';
import { ApprovalLayout, ApprovalRuleManage, ApprovalTaskCenter, MyApplications } from '@/views/Approval';

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
