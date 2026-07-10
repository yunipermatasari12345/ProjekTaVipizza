import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { ShoppingCart, Menu as MenuIcon, X, User } from 'lucide-react';

// ===================================================
// WARNA BRAND VIPIZZA (Konsisten di semua halaman)
// Primary: #8B3A0F (Pizza coklat tua / rust)
// Secondary: #FAF6F1 (Krem hangat)
// Dark: #2C1810 (Coklat gelap)
// ===================================================

export default function CustomerNavbar() {
  const { user, logout } = useAuth();
  const { hitungTotalItem } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuBuka, setMenuBuka] = useState(false);

  const totalItem = hitungTotalItem();
  const aktif = (path) => location.pathname === path;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const linkClass = (path) =>
    `text-sm transition-colors px-2 py-1 ${
      aktif(path)
        ? 'text-black font-black border-b-2 border-black'
        : 'text-black/80 hover:text-black font-bold'
    }`;

  return (
    <header className="sticky top-0 z-50 bg-[#FAF6F1] border-b border-[#E8DDD5] shadow-sm">
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-[72px]">

        {/* LOGO */}
        <Link to="/" className="flex items-center gap-3 shrink-0 leading-none group">
          <img 
            src="/logo-vipizza.jpg" 
            alt="VIPIZZA Logo" 
            className="w-11 h-11 object-contain rounded-full shadow-sm group-hover:rotate-12 transition-transform duration-300"
          />
          <div className="flex flex-col text-left">
            <span className="font-black text-2xl tracking-tight text-[#2C1810] uppercase">VIPIZZA</span>
            <span className="text-[9px] text-[#8B3A0F] tracking-[3px] uppercase font-semibold">Homemade Padang</span>
          </div>
        </Link>

        {/* DESKTOP NAV */}
        <nav className="hidden lg:flex items-center gap-8">
          <Link to="/" className={linkClass('/')}>Home</Link>
          <Link to="/menu" className={linkClass('/menu')}>Menu</Link>
          <Link to="/promo" className={linkClass('/promo')}>Promo</Link>
          <Link to="/tentang" className={linkClass('/tentang')}>Tentang</Link>
          <Link to="/kontak" className={linkClass('/kontak')}>Kontak</Link>
        </nav>

        {/* RIGHT ACTIONS */}
        <div className="flex items-center gap-4">
          {/* Cart */}
          <Link to="/keranjang" className="relative text-[#5C3D2E] hover:text-[#8B3A0F] transition-colors">
            <ShoppingCart className="w-5 h-5" />
            {totalItem > 0 && (
              <span className="absolute -top-2 -right-2 bg-[#8B3A0F] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {totalItem}
              </span>
            )}
          </Link>

          {/* Auth */}
          {user?.peran === 'admin' ? (
            <Link to="/admin" className="hidden sm:inline-flex items-center gap-1.5 bg-[#2C1810] hover:bg-[#8B3A0F] text-white text-xs font-bold px-5 py-2.5 rounded-full transition-colors">
              <User className="w-3.5 h-3.5" /> Dashboard Admin
            </Link>
          ) : user?.peran === 'pelanggan' ? (
            <div className="hidden sm:flex items-center gap-3">
              <Link to="/dashboard" className="text-xs font-semibold text-[#5C3D2E] hover:text-[#8B3A0F] transition-colors">Dashboard Saya</Link>
              <button onClick={handleLogout} className="bg-[#2C1810] hover:bg-[#8B3A0F] text-white text-xs font-bold px-5 py-2.5 rounded-full transition-colors">
                Keluar
              </button>
            </div>
          ) : (
            <Link to="/masuk" className="hidden sm:inline-block bg-black hover:bg-gray-900 text-white text-sm font-extrabold px-6 py-3 rounded-full transition-colors shadow-md">
              Order Now
            </Link>
          )}

          {/* Mobile Toggle */}
          <button className="lg:hidden text-[#2C1810] p-1" onClick={() => setMenuBuka(!menuBuka)}>
            {menuBuka ? <X className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* MOBILE MENU */}
      {menuBuka && (
        <div className="lg:hidden border-t border-[#E8DDD5] bg-[#FAF6F1] px-6 py-3 flex flex-col shadow-lg absolute w-full top-full">
          {[
            { to: '/', label: 'Home' },
            { to: '/menu', label: 'Menu' },
            { to: '/promo', label: 'Promo' },
            { to: '/tentang', label: 'Tentang' },
            { to: '/kontak', label: 'Kontak' },
            { to: '/keranjang', label: 'Keranjang 🛒' },
          ].map(({ to, label }) => (
            <Link key={to} to={to} onClick={() => setMenuBuka(false)} className="text-sm font-bold text-[#2C1810] py-3 border-b border-[#E8DDD5] last:border-0">
              {label}
            </Link>
          ))}
          {user ? (
            <>
              <Link to="/dashboard" onClick={() => setMenuBuka(false)} className="text-sm font-bold text-[#2C1810] py-3 border-b border-[#E8DDD5]">Dashboard Saya</Link>
              <button onClick={() => { handleLogout(); setMenuBuka(false); }} className="text-sm font-bold text-red-600 text-left py-3">Keluar</button>
            </>
          ) : (
            <Link to="/masuk" onClick={() => setMenuBuka(false)} className="text-sm font-bold text-[#8B3A0F] py-3">Login / Register →</Link>
          )}
        </div>
      )}
    </header>
  );
}
