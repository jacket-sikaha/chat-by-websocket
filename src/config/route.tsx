import { Suspense, lazy } from 'react';
import App from '../App.tsx';
import Home from '../pages/home/index';
// import Theme from "../pages/theme/index";

// const Home = () => import("../pages/home.tsx");
// react router6 + react lazy 延迟加载的正确写法
const Theme = lazy(() => import('../pages/theme'));

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
        path: 'theme',
        name: '多种主题切换',
        element: (
          <Suspense fallback={<h1>loading</h1>}>
            {/* 这里的Suspense就是只对Theme起作用 */}
            <Theme />
          </Suspense>
        )
      }
    ]
  }
];
