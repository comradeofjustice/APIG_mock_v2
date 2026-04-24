/**
 * 审批模块布局组件
 * 
 * 简洁布局，仅包含主内容区
 */

import { Outlet } from 'react-router-dom';

export default function ApprovalLayout() {
  return (
    <div
      style={{
        background: '#F7FAFD',
        minHeight: '100vh',
      }}
    >
      <Outlet />
    </div>
  );
}
