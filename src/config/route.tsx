import { Spin } from 'antd';
import { Suspense, lazy } from 'react';
import { Navigate } from 'react-router-dom';
import App from '../App.tsx';
import ChatPage from '../pages/index';

// react router6 + react lazy 延迟加载的正确写法
const History = lazy(() => import('@/pages/history/index'));

export const DefaultRoutes = [
  {
    path: '/',
    element: <App />,
    children: [
      // 添加 index 路由自动跳转到 home
      {
        index: true, // 关键属性
        element: <Navigate to="home" replace /> // 自动重定向
      },
      {
        path: 'home',
        name: '主页',
        element: <ChatPage />
      },
      {
        path: 'history',
        name: '历史记录',
        element: (
          <Suspense
            fallback={<Spin size="large" className="flex h-screen items-center justify-center" />}
          >
            <History />
          </Suspense>
        )
      }
    ]
  }
];
