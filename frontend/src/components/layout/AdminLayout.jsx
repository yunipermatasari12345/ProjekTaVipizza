import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Pizza,
  ShoppingBag,
  FileText,
  LogOut,
  Home,
  Tag,
  ChevronRight,
  Menu,
  X,
  Bell,
  Settings,
} from 'lucide-react';

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, token } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 768);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (!token || !user) return <Navigate to="/masuk" replace />;
  if (user.peran !== 'admin') return <Navigate to="/menu" replace />;

  const aktif = (path) =>
    path === '/admin'
      ? location.pathname === '/admin'
      : location.pathname.includes(path);

  const handleLogout = () => {
    logout();
    navigate('/masuk');
  };

  const menuGroups = [
    {
      label: 'UTAMA',
      items: [
        { to: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
      ],
    },
    {
      label: 'MANAJEMEN',
      items: [
        { to: '/admin/kelola-menu', icon: Pizza, label: 'Kelola Menu' },
        { to: '/admin/kelola-promo', icon: Tag, label: 'Kelola Promo' },
        { to: '/admin/validasi-pesanan', icon: ShoppingBag, label: 'Pesanan Masuk' },
        { to: '/admin/laporan', icon: FileText, label: 'Laporan' },
      ],
    },
    {
      label: 'LAINNYA',
      items: [
        { to: '/', icon: Home, label: 'Lihat Website', external: true },
      ],
    },
  ];

  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/admin') return 'Dashboard';
    if (path.includes('kelola-menu')) return 'Kelola Menu';
    if (path.includes('kelola-promo')) return 'Kelola Promo';
    if (path.includes('validasi-pesanan')) return 'Pesanan Masuk';
    if (path.includes('laporan')) return 'Laporan';
    return 'Admin Panel';
  };

  return (
    <div className="admin-shell">
      {/* === SIDEBAR === */}
      <aside className={`admin-sidebar ${sidebarOpen ? 'admin-sidebar--open' : 'admin-sidebar--closed'}`}>
        {/* Brand */}
        <div className="admin-sidebar__brand">
          <div className="admin-sidebar__brand-logo">
            <Pizza className="w-5 h-5 text-white" />
          </div>
          {sidebarOpen && (
            <div>
              <span className="admin-sidebar__brand-name">VIPIZZA</span>
              <p className="admin-sidebar__brand-sub">Admin Panel</p>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="admin-sidebar__nav">
          {menuGroups.map((group) => (
            <div key={group.label} className="admin-sidebar__group">
              {sidebarOpen && (
                <p className="admin-sidebar__group-label">{group.label}</p>
              )}
              {group.items.map(({ to, icon: Icon, label }) => (
                <Link
                  key={to}
                  to={to}
                  title={!sidebarOpen ? label : undefined}
                  className={`admin-sidebar__link ${aktif(to) ? 'admin-sidebar__link--active' : ''}`}
                >
                  <Icon className="admin-sidebar__link-icon" />
                  {sidebarOpen && <span className="admin-sidebar__link-text">{label}</span>}
                  {sidebarOpen && aktif(to) && <ChevronRight className="ml-auto w-3.5 h-3.5 opacity-70" />}
                </Link>
              ))}
            </div>
          ))}
        </nav>

        {/* Logout */}
        <div className="admin-sidebar__footer">
          {sidebarOpen && (
            <div className="admin-sidebar__user">
              <div className="admin-sidebar__user-avatar">
                {user?.nama?.[0]?.toUpperCase() || 'A'}
              </div>
              <div className="admin-sidebar__user-info">
                <p className="admin-sidebar__user-name">{user?.nama || 'Admin'}</p>
                <p className="admin-sidebar__user-role">Administrator</p>
              </div>
            </div>
          )}
          <button
            onClick={handleLogout}
            title="Keluar"
            className="admin-sidebar__logout"
          >
            <LogOut className="w-4 h-4" />
            {sidebarOpen && <span>Keluar</span>}
          </button>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="admin-sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* === MAIN AREA === */}
      <div className={`admin-main ${sidebarOpen ? 'admin-main--sidebar-open' : 'admin-main--sidebar-closed'}`}>
        {/* Topbar */}
        <header className="admin-topbar">
          <div className="admin-topbar__left">
            <button
              className="admin-topbar__toggle"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <div className="admin-topbar__breadcrumb hidden sm:flex">
              <span className="admin-topbar__breadcrumb-root">Admin</span>
              <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
              <span className="admin-topbar__breadcrumb-current">{getPageTitle()}</span>
            </div>
          </div>
          <div className="admin-topbar__right">
            <button className="admin-topbar__icon-btn" title="Notifikasi">
              <Bell className="w-4.5 h-4.5" />
              <span className="admin-topbar__notif-dot" />
            </button>
            <div className="admin-topbar__user">
              <div className="admin-topbar__user-avatar">
                {user?.nama?.[0]?.toUpperCase() || 'A'}
              </div>
              <div className="admin-topbar__user-info hidden sm:block">
                <p className="admin-topbar__user-name">{user?.nama || 'Admin User'}</p>
                <p className="admin-topbar__user-role">Administrator</p>
              </div>
              <LogOut
                onClick={handleLogout}
                className="w-4 h-4 text-gray-400 hover:text-red-500 cursor-pointer ml-1 transition-colors"
                title="Keluar"
              />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="admin-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
