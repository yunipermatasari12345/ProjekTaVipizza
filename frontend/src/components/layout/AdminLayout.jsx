import React, { useState, useEffect, useRef } from 'react';
import { Outlet, Link, useLocation, useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Swal from 'sweetalert2';
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
  Users,
  User,
  Layers,
  MessageSquare,
  Star,
  Image,
} from 'lucide-react';

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, token, isLoading } = useAuth();
  const [jumlahPesananBaru, setJumlahPesananBaru] = useState(0);
  const [jumlahPesanPelanggan, setJumlahPesanPelanggan] = useState(0);
  const prevPesananRef = useRef(0);
  const prevPesanRef = useRef(0);
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

  // Polling: cek pesanan baru & pesan pelanggan belum dibaca setiap 30 detik
  useEffect(() => {
    if (!token || !user || user.peran !== 'admin') return;
    const headers = { 'Authorization': `Bearer ${token}` };

    const cekNotifikasi = async () => {
      try {
        const [ordRes, pesanRes] = await Promise.all([
          fetch('https://power-payee-annex.ngrok-free.dev/api/orders', { headers }),
          fetch('https://power-payee-annex.ngrok-free.dev/api/pesan-pelanggan', { headers }),
        ]);
        if (ordRes.ok) {
          const orders = await ordRes.json();
          const menunygu = Array.isArray(orders)
            ? orders.filter(o => o.status === 'menunggu_pembayaran' || o.status === 'menunggu_validasi').length
            : 0;
          if (menunygu > prevPesananRef.current) {
            Swal.fire({
              icon: 'info',
              title: '🍕 Pesanan Baru!',
              text: `Ada ${menunygu} pesanan yang perlu diproses.`,
              toast: true,
              position: 'top-end',
              showConfirmButton: false,
              timer: 5000,
              timerProgressBar: true,
            });
          }
          prevPesananRef.current = menunygu;
          setJumlahPesananBaru(menunygu);
        }
        if (pesanRes.ok) {
          const pesanList = await pesanRes.json();
          const belumDibalas = Array.isArray(pesanList)
            ? pesanList.filter(p => !p.balasan).length
            : 0;
          if (belumDibalas > prevPesanRef.current) {
            Swal.fire({
              icon: 'info',
              title: '💬 Pesan Baru!',
              text: `Ada ${belumDibalas} pertanyaan pelanggan belum dibalas.`,
              toast: true,
              position: 'top-end',
              showConfirmButton: false,
              timer: 4000,
              timerProgressBar: true,
            });
          }
          prevPesanRef.current = belumDibalas;
          setJumlahPesanPelanggan(belumDibalas);
        }
      } catch { /* backend offline */ }
    };

    cekNotifikasi();
    const interval = setInterval(cekNotifikasi, 30000);
    return () => clearInterval(interval);
  }, [token, user]);

  // Tampilkan loading spinner saat auth masih divalidasi
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-500 font-medium">Memeriksa sesi...</p>
        </div>
      </div>
    );
  }

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
      label: 'MASTER DATA',
      items: [
        { to: '/admin/kelola-menu', icon: Pizza, label: 'Data Menu' },
        { to: '/admin/kelola-kategori', icon: Layers, label: 'Kategori Menu' },
        { to: '/admin/kelola-promo', icon: Tag, label: 'Kode Promo' },
        { to: '/admin/galeri', icon: Image, label: 'Galeri Foto' },
      ],
    },
    {
      label: 'TRANSAKSI',
      items: [
        { to: '/admin/pesanan', icon: ShoppingBag, label: 'Data Pesanan', badge: jumlahPesananBaru },
        { to: '/admin/laporan', icon: FileText, label: 'Laporan Penjualan' },
      ],
    },
    {
      label: 'LAINNYA',
      items: [
        { to: '/admin/pelanggan', icon: Users, label: 'Pelanggan' },
        { to: '/admin/ulasan', icon: Star, label: 'Data Ulasan' },
        { to: '/admin/pesan-pelanggan', icon: MessageSquare, label: 'Pesan Pelanggan', badge: jumlahPesanPelanggan },
        { to: '/admin/profil', icon: User, label: 'Profil' },
        { to: '/', icon: Home, label: 'Lihat Website' },
      ],
    },
  ];

  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/admin') return 'Dashboard';
    if (path.includes('kelola-menu')) return 'Data Menu';
    if (path.includes('kelola-kategori')) return 'Kategori Menu';
    if (path.includes('kelola-promo')) return 'Kode Promo';
    if (path.includes('pesanan')) return 'Data Pesanan';
    if (path.includes('laporan')) return 'Laporan Penjualan';
    if (path.includes('pesan-pelanggan')) return 'Pesan Pelanggan';
    if (path.includes('pelanggan')) return 'Pelanggan';
    if (path.includes('profil')) return 'Profil';
    return 'Admin Panel';
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
              {group.items.map(({ to, icon: Icon, label, badge }) => (
                <Link
                  key={to}
                  to={to}
                  title={!sidebarOpen ? label : undefined}
                  className={`admin-sidebar__link ${aktif(to) ? 'admin-sidebar__link--active' : ''}`}
                >
                  <Icon className="admin-sidebar__link-icon" />
                  {sidebarOpen && <span className="admin-sidebar__link-text">{label}</span>}
                  {badge > 0 && sidebarOpen && (
                    <span className="ml-auto bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                      {badge}
                    </span>
                  )}
                  {badge > 0 && !sidebarOpen && (
                    <span className="absolute right-1 top-1 w-2 h-2 rounded-full bg-red-500" />
                  )}
                  {sidebarOpen && !badge && aktif(to) && <ChevronRight className="ml-auto w-3.5 h-3.5 opacity-70" />}
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
            <Link to="/admin/pesanan" className="admin-topbar__icon-btn relative" title="Pesanan Menunggu">
              <Bell className="w-4.5 h-4.5" />
              {jumlahPesananBaru > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
                  {jumlahPesananBaru}
                </span>
              )}
            </Link>
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
