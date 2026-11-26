import React, { Suspense, lazy } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

// Tách hoàn toàn bundle của Admin & Mini-Game khỏi trang Thị Trấn chính
const AdminPage = lazy(() => import('./pages/AdminPage.jsx'));
const MiniGameRouterPage = lazy(() => import('./pages/MiniGameRouterPage.jsx'));

const isAdminRoute = () => {
  if (typeof window === 'undefined') return false;
  const host = window.location.hostname.toLowerCase();
  // Truy cập trang quản trị qua subdomain manunit.<domain> (ví dụ: manunit.domain0 hoặc manunit.localhost)
  return host === 'manunit' || host.startsWith('manunit.');
};

const isMiniGameRoute = () => {
  if (typeof window === 'undefined') return false;
  const path = window.location.pathname.toLowerCase();
  return path === '/minigame' || path.startsWith('/minigame/');
};

function RouteLoading() {
  return (
    <div className="min-h-screen bg-[#FFFDF9] flex items-center justify-center text-[#593A47] font-extrabold text-sm">
      ✨ Đang tải...
    </div>
  );
}

function RootRouter() {
  if (isAdminRoute()) {
    return (
      <Suspense fallback={<RouteLoading />}>
        <AdminPage />
      </Suspense>
    );
  }
  if (isMiniGameRoute()) {
    return (
      <Suspense fallback={<RouteLoading />}>
        <MiniGameRouterPage />
      </Suspense>
    );
  }
  return <App />;
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RootRouter />
  </React.StrictMode>
);
