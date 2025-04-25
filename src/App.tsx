import { RedditOutlined } from '@ant-design/icons';
import { Layout, Menu, MenuProps } from 'antd';
import { useEffect, useMemo } from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Link, Outlet } from 'react-router-dom';
import './App.css';
import OnlineInfoIcon from './components/online-info-icon';
import UsersDrawer from './components/users-drawer';
import { DefaultRoutes } from './config/route';
import { socket } from './socket';

// 创建一个 client
const queryClient = new QueryClient();
const { Header, Content } = Layout;

type MenuItem = Required<MenuProps>['items'][number];

function App() {
  const items: MenuItem[] = useMemo(() => {
    // item is T 明确告知编译器过滤后的类型
    const pathList = DefaultRoutes[0].children.filter(
      (x): x is { path: string; name: string; element: JSX.Element; index?: undefined } =>
        !!x?.path && !!x?.name
    );

    return pathList.map(({ path, name }) => ({
      label: (
        <Link key={path} to={path}>
          {name}
        </Link>
      ),
      key: path
    }));
  }, []);

  useEffect(() => {
    return () => {
      socket?.disconnect();
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <Layout className="h-screen">
        <Header className="flex items-center gap-3 bg-white">
          <RedditOutlined className="text-3xl" />
          <Menu mode="horizontal" items={items} style={{ flex: 1, minWidth: 0 }} />
          <UsersDrawer>
            <OnlineInfoIcon />
          </UsersDrawer>
        </Header>
        <Content>
          <Outlet />
        </Content>
      </Layout>
    </QueryClientProvider>
  );
}

export default App;
