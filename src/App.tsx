import { RedditOutlined } from '@ant-design/icons';
import { Layout, Menu, MenuProps } from 'antd';
import { useMemo } from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Link, Outlet } from 'react-router-dom';
import './App.css';
import { DefaultRoutes } from './config/route';

// 创建一个 client
const queryClient = new QueryClient();
const { Header, Content } = Layout;

type MenuItem = Required<MenuProps>['items'][number];

function App() {
  const items: MenuItem[] = useMemo(() => {
    const pathList = DefaultRoutes[0].children.map(({ path, name }) => ({ path, name }));
    return pathList.map(({ path, name }) => ({
      label: (
        <Link key={path} to={path}>
          {name}
        </Link>
      ),
      key: path
    }));
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <Layout className="h-screen">
        <Header className="flex items-center gap-3 bg-white">
          <RedditOutlined className="text-3xl" />
          <Menu
            mode="horizontal"
            defaultSelectedKeys={['2']}
            items={items}
            style={{ flex: 1, minWidth: 0 }}
          />
        </Header>
        <Content>
          <Outlet />
        </Content>
      </Layout>
    </QueryClientProvider>
  );
}

export default App;
