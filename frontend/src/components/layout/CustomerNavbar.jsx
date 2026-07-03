import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { ShoppingCart, Menu as MenuIcon, X } from 'lucide-react';

// Navbar front-end ala Bootstrap TA kating — teal gelap, menu horizontal
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
    `text-sm font-medium transition-colors px-1 py-2 border-b-2 ${
      aktif(path)
        ? 'text-white border-white'
        : 'text-white/80 border-transparent hover:text-white'
    }`;

  return (
    <header className="bg-[#0b5345] sticky top-0 z-50 shadow-md">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">

        <Link to="/" className="flex items-center gap-2 shrink-0">
          <div className="w-9 h-9 rounded-full bg-white/15 flex items-center justify-center text-lg">
            🍕
          </div>
          <div className="text-left leading-tight">
            <span className="font-bold text-white text-sm block">VIPIZZA</span>
            <span className="text-white/60 text-[10px] block">Homemade Padang</span>
          </div>
        </Link>

        <nav className="hidden lg:flex items-center gap-6">
          <Link to="/" className={linkClass('/')}>Home</Link>
          <Link to="/menu" className={linkClass('/menu')}>Menu</Link>
          <Link to="/promo" className={linkClass('/promo')}>🏷️ Promo</Link>
          <Link to="/tentang" className={linkClass('/tentang')}>Tentang Kami</Link>
          <Link to="/kontak" className={linkClass('/kontak')}>Kontak</Link>
        </nav>

        <div className="flex items-center gap-2">
          <Link to="/keranjang" className="relative p-2 text-white/80 hover:text-white transition-colors">
            <ShoppingCart className="w-5 h-5" />
            {totalItem > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-white text-[#0b5345] text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {totalItem}
              </span>
            )}
          </Link>

          {user?.peran === 'admin' ? (
            <Link
              to="/admin"
              className="hidden sm:inline-block bg-white text-[#0b5345] text-xs font-semibold px-4 py-1.5 rounded hover:bg-white/90 transition-colors"
            >
              Dashboard
            </Link>
          ) : user?.peran === 'pelanggan' ? (
            <div className="hidden sm:flex items-center gap-2">
              <Link to="/dashboard" className="bg-white text-[#0b5345] text-xs font-semibold px-4 py-1.5 rounded hover:bg-white/90 transition-colors">
                Dashboard
              </Link>
              <Link to="/riwayat" className="text-xs text-white/80 hover:text-white">Pesanan Saya</Link>
              <button onClick={handleLogout} className="text-xs text-white/60 hover:text-red-300 ml-1">
                Keluar
              </button>
            </div>
          ) : (
            <>
              <Link
                to="/masuk"
                className="hidden sm:inline-block bg-white text-[#0b5345] text-xs font-semibold px-4 py-1.5 rounded hover:bg-white/90 transition-colors"
              >
                Login
              </Link>
              <Link
                to="/daftar"
                className="hidden md:inline-block border border-white/50 text-white text-xs font-medium px-4 py-1.5 rounded hover:bg-white/10 transition-colors"
              >
                Register
              </Link>
            </>
          )}

          <button
            className="lg:hidden p-2 text-white"
            onClick={() => setMenuBuka(!menuBuka)}
          >
            {menuBuka ? <X className="w-5 h-5" /> : <MenuIcon className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {menuBuka && (
        <div className="lg:hidden border-t border-white/10 bg-[#094a40] px-6 py-4 flex flex-col gap-2">
          <Link to="/" onClick={() => setMenuBuka(false)} className="text-sm text-white py-1">Home</Link>
          <Link to="/menu" onClick={() => setMenuBuka(false)} className="text-sm text-white py-1">Menu</Link>
          <Link to="/promo" onClick={() => setMenuBuka(false)} className="text-sm text-white py-1">🏷️ Promo</Link>
          <Link to="/tentang" onClick={() => setMenuBuka(false)} className="text-sm text-white py-1">Tentang Kami</Link>
          <Link to="/kontak" onClick={() => setMenuBuka(false)} className="text-sm text-white py-1">Kontak</Link>
          <Link to="/keranjang" onClick={() => setMenuBuka(false)} className="text-sm text-white py-1">Keranjang</Link>
          {user ? (
            <>
              <Link to="/riwayat" onClick={() => setMenuBuka(false)} className="text-sm text-white py-1">Pesanan Saya</Link>
              <button onClick={() => { handleLogout(); setMenuBuka(false); }} className="text-sm text-red-300 text-left py-1">Keluar</button>
            </>
          ) : (
            <>
              <Link to="/masuk" onClick={() => setMenuBuka(false)} className="text-sm text-white font-semibold py-1">Login</Link>
              <Link to="/daftar" onClick={() => setMenuBuka(false)} className="text-sm text-white/80 py-1">Register</Link>
            </>
          )}
        </div>
      )}
    </header>
  );
}
