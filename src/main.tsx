import React from 'react';
import { render } from 'react-dom';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/lib/locale/zh_CN';
import 'antd/dist/antd.css';

import EnterpriseLayout from './layouts/EnterpriseLayout';
import { routes } from './config/routes';

const router = createBrowserRouter([
  {
    element: <EnterpriseLayout />,
    children: routes,
  },
]);

render(
  <React.StrictMode>
    <ConfigProvider locale={zhCN}>
      <RouterProvider router={router} />
    </ConfigProvider>
  </React.StrictMode>,
  document.getElementById('root')
);
