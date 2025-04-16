import { Spin } from 'antd';
import { Suspense, lazy } from 'react';
import App from '../App.tsx';
import Home from '../pages/home/index';

// react router6 + react lazy 延迟加载的正确写法
const Chat = lazy(() => import('../pages/index'));

export const DefaultRoutes = [
  {
    path: '/',
    element: <App />,
    children: [
      {
        path: 'home',
        name: '主页',
        element: <Home />
      },
      {
        path: 'index',
        name: '主页',
        element: (
          <Suspense
            fallback={<Spin size="large" className="flex justify-center items-center h-screen" />}
          >
            {/* 这里的Suspense就是只对Theme起作用 */}
            <Chat />
          </Suspense>
        )
      },
      {
        path: 'history',
        name: '历史记录',
        element: (
          <Suspense
            fallback={<Spin size="large" className="flex justify-center items-center h-screen" />}
          >
            <Chat />
          </Suspense>
        )
      }
    ]
  }
];
