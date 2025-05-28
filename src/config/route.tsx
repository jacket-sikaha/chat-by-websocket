import { Spin } from 'antd';
import { Suspense, lazy } from 'react';
import App from '../App.tsx';
import ChatPage from '../pages/index';

// react router6 + react lazy 延迟加载的正确写法
const History = lazy(() => import('@/pages/history/index'));

export const DefaultRoutes = [
  {
    path: '/',
    element: <App />,
    children: [
      {
        index: true, // renders at "/"
        name: '主页',
        element: <ChatPage />
      },
      {
        path: 'history',
        name: '我收到的信息',
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
