import { QueryClient, QueryClientProvider } from 'react-query';
import { Outlet } from 'react-router-dom';
import './App.css';
import Layout from './components/layout';
// 创建一个 client
const queryClient = new QueryClient();

function App() {
  return (
    <>
      <QueryClientProvider client={queryClient}>
        <div className="h-full w-full">
          <Outlet />
        </div>
        <div className="fixed bottom-8 left-2 z-10">
          <Layout />
        </div>
      </QueryClientProvider>
    </>
  );
}

export default App;
