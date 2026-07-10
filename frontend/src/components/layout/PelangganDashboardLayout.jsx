import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import {
  Home,
  Pizza,
  ShoppingCart,
  ShoppingBag,
  ClipboardList,
  Clock,
  User,
  LogOut,
  ChevronRight,
  Menu,
  X,
  CreditCard
} from 'lucide-react';

export default function PelangganDashboardLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, token, isLoading } = useAuth();
  const { hitungTotalItem } = useCart();
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 768);
  const totalItem = hitungTotalItem();

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

  // Tampilkan spinner saat auth masih divalidasi (mencegah flash redirect ke login)
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF6F1]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-[#8B3A0F] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-[#5C3D2E] font-medium">Memeriksa sesi...</p>
        </div>
      </div>
    );
  }

  // Jika belum login, lempar ke login
  if (!token || !user) return <Navigate to="/masuk" replace />;

  const aktif = (path, label) => {
    if (path === '/dashboard') return location.pathname === '/dashboard';
    if (path === '/menu') return location.pathname === '/menu';
    if (path === '/keranjang') return location.pathname === '/keranjang';
    if (path === '/riwayat') return location.pathname.startsWith('/riwayat') || location.pathname.startsWith('/track');
    if (path === '/profil') return location.pathname === '/profil';
    return location.pathname.startsWith(path);
  };

  const handleLogout = () => {
    logout();
    navigate('/masuk');
  };

  // Menu Dashboard Pelanggan (sesuai spesifikasi TA)
  const menuGroups = [
    {
      label: 'MENU UTAMA',
      items: [
        { to: '/dashboard', icon: Home, label: 'Beranda' },
        { to: '/menu', icon: Pizza, label: 'Katalog Menu' },
        { to: '/keranjang', icon: ShoppingCart, label: 'Keranjang Belanja', badge: totalItem > 0 ? totalItem : null },
        { to: '/riwayat', icon: ClipboardList, label: 'Riwayat Pesanan' },
        { to: '/profil', icon: User, label: 'Profil' },
      ],
    },
  ];

  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/dashboard') return 'Beranda';
    if (path.includes('menu')) return 'Katalog Menu';
    if (path.includes('keranjang')) return 'Keranjang Belanja';
    if (path.includes('track')) return 'Tracking Pesanan';
    if (path.includes('riwayat')) return 'Riwayat Pesanan';
    if (path.includes('profil')) return 'Profil';
    return 'Panel Pelanggan';
  };

  return (
    <div className="admin-shell">
      {/* === SIDEBAR === */}
      <aside className={`admin-sidebar ${sidebarOpen ? 'admin-sidebar--open' : 'admin-sidebar--closed'}`}>
        {/* Brand */}
        <div className="admin-sidebar__brand">
          <img 
            src="/logo-vipizza.jpg" 
            alt="Logo" 
            className="w-12 h-12 rounded-full object-cover border-2 border-amber-500 shadow-md hover:rotate-12 transition-transform duration-300 cursor-pointer"
            onClick={() => navigate('/')}
          />
          {sidebarOpen && (
            <div>
              <span className="admin-sidebar__brand-name">VIPIZZA</span>
              <p className="admin-sidebar__brand-sub">Panel Pelanggan</p>
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
              {group.items.map((item) => (
                <Link
                  key={item.to + '-' + item.label}
                  to={item.to}
                  title={!sidebarOpen ? item.label : undefined}
                  className={`admin-sidebar__link ${aktif(item.to, item.label) ? 'admin-sidebar__link--active' : ''}`}
                  style={aktif(item.to, item.label) ? { background: '#8B3A0F', color: '#ffffff' } : {}}
                >
                  <item.icon className="admin-sidebar__link-icon" />
                  {sidebarOpen && <span className="admin-sidebar__link-text">{item.label}</span>}
                  {item.badge && sidebarOpen && (
                    <span className="bg-[#FAF6F1] text-[#8B3A0F] text-[10px] font-bold px-2 py-0.5 rounded-full">
                      {item.badge}
                    </span>
                  )}
                  {item.badge && !sidebarOpen && (
                    <span className="absolute right-2 top-2 w-2 h-2 rounded-full bg-[#FAF6F1]" />
                  )}
                </Link>
              ))}
            </div>
          ))}
        </nav>

        {/* Footer Sidebar */}
        <div className="admin-sidebar__footer">
          {sidebarOpen && (
            <div className="admin-sidebar__user">
              <div className="admin-sidebar__user-avatar" style={{ background: '#8B3A0F' }}>
                {user?.nama?.[0]?.toUpperCase() || 'P'}
              </div>
              <div className="admin-sidebar__user-info">
                <p className="admin-sidebar__user-name">{user?.nama || 'Pelanggan'}</p>
                <p className="admin-sidebar__user-role">{user?.peran === 'admin' ? 'Administrator' : 'Pelanggan'}</p>
              </div>
            </div>
          )}
          <button onClick={handleLogout} title="Keluar" className="admin-sidebar__logout">
            <LogOut className="w-4 h-4" />
            {sidebarOpen && <span>Keluar</span>}
          </button>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="admin-sidebar-overlay lg:hidden fixed inset-0 bg-black/50 z-20"
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
              <span className="admin-topbar__breadcrumb-root">Akun Saya</span>
              <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
              <span className="admin-topbar__breadcrumb-current">{getPageTitle()}</span>
            </div>
          </div>
          <div className="admin-topbar__right">
            
            {user?.peran === 'admin' && (
              <Link to="/admin" className="hidden sm:inline-flex items-center gap-1.5 bg-[#2C1810] hover:bg-[#8B3A0F] text-white text-xs font-bold px-4 py-2 rounded-full transition-colors mr-2">
                <User className="w-3.5 h-3.5" /> Dashboard Admin
              </Link>
            )}

            <Link to="/keranjang" className="admin-topbar__icon-btn relative" title="Keranjang">
              <ShoppingCart className="w-4.5 h-4.5" />
              {totalItem > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#8B3A0F] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {totalItem}
                </span>
              )}
            </Link>

            <div className="admin-topbar__user">
              <div className="admin-topbar__user-avatar" style={{ background: '#8B3A0F' }}>
                {user?.nama?.[0]?.toUpperCase() || 'P'}
              </div>
              <div className="admin-topbar__user-info hidden sm:block">
                <p className="admin-topbar__user-name">{user?.nama}</p>
                <p className="admin-topbar__user-role text-[#8B3A0F]">{user?.peran}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="admin-content bg-[#FAF6F1]">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
