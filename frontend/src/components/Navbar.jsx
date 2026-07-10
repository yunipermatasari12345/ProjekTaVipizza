import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import Logo from './Logo';
import { ShoppingCart, LogOut, RefreshCw, ClipboardList, Settings, Menu as MenuIcon, X, ChevronDown } from 'lucide-react';

export default function Navbar() {
  const { user, logout, alihkanPeran } = useAuth();
  const { hitungTotalItem } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [mobileMenuTerbuka, setMobileMenuTerbuka] = useState(false);
  const [dropdownTerbuka, setDropdownTerbuka] = useState(false);
  const dropdownRef = useRef(null);

  const totalItem = hitungTotalItem();
  const aktif = (path) => location.pathname === path;

  // Tutup dropdown jika mengklik di luar area
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownTerbuka(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav className="bg-white/95 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-50 shadow-sm transition-all duration-300">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        
        {/* Kiri: Brand & Logo */}
        <div className="flex items-center">
          <Link to="/" className="flex items-center gap-3 group">
            <img 
              src="/logo-vipizza.jpg" 
              alt="VIPIZZA Logo" 
              className="w-10 h-10 object-contain rounded-full shadow-sm group-hover:rotate-12 transition-transform duration-300"
            />
            <div className="flex flex-col text-left">
              <span className="font-serif font-bold text-lg md:text-xl tracking-tight text-slate-800 leading-none">
                VIPIZZA
              </span>
              <span className="text-[9px] tracking-widest text-[#8B3A0F] font-bold uppercase leading-none mt-1">
                Homemade Padang
              </span>
            </div>
          </Link>
        </div>

        {/* Tengah: Navigasi Menu Desktop */}
        <div className="hidden md:flex items-center gap-8">
          {user?.peran === 'admin' ? (
            // Menu Admin
            <>
              <Link 
                to="/admin" 
                className={`text-sm font-semibold transition-all duration-200 py-1.5 border-b-2 ${
                  aktif('/admin') ? 'border-pink-500 text-pink-500' : 'border-transparent text-slate-600 hover:text-pink-500'
                }`}
              >
                Dashboard
              </Link>
              <Link 
                to="/admin/kelola-menu" 
                className={`text-sm font-semibold transition-all duration-200 py-1.5 border-b-2 ${
                  aktif('/admin/kelola-menu') ? 'border-pink-500 text-pink-500' : 'border-transparent text-slate-600 hover:text-pink-500'
                }`}
              >
                Kelola Menu
              </Link>
              <Link 
                to="/admin/validasi-pesanan" 
                className={`text-sm font-semibold transition-all duration-200 py-1.5 border-b-2 ${
                  aktif('/admin/validasi-pesanan') ? 'border-pink-500 text-pink-500' : 'border-transparent text-slate-600 hover:text-pink-500'
                }`}
              >
                Validasi Pesanan
              </Link>
              <Link 
                to="/admin/laporan" 
                className={`text-sm font-semibold transition-all duration-200 py-1.5 border-b-2 ${
                  aktif('/admin/laporan') ? 'border-pink-500 text-pink-500' : 'border-transparent text-slate-600 hover:text-pink-500'
                }`}
              >
                Laporan
              </Link>
            </>
          ) : (
            // Menu Pelanggan / Publik
            <>
              <Link 
                to="/" 
                className={`text-sm font-semibold transition-all duration-200 py-1.5 border-b-2 ${
                  aktif('/') ? 'border-pink-500 text-pink-500' : 'border-transparent text-slate-600 hover:text-pink-500'
                }`}
              >
                Beranda
              </Link>
              <Link 
                to="/menu" 
                className={`text-sm font-semibold transition-all duration-200 py-1.5 border-b-2 ${
                  aktif('/menu') ? 'border-pink-500 text-pink-500' : 'border-transparent text-slate-600 hover:text-pink-500'
                }`}
              >
                Katalog Menu
              </Link>
              <Link 
                to="/promo" 
                className={`text-sm font-semibold transition-all duration-200 py-1.5 border-b-2 ${
                  aktif('/promo') ? 'border-pink-500 text-pink-500' : 'border-transparent text-slate-600 hover:text-pink-500'
                }`}
              >
                Promo Diskon
              </Link>
              {user && (
                <>
                  <Link 
                    to="/dashboard" 
                    className={`text-sm font-semibold transition-all duration-200 py-1.5 border-b-2 ${
                      aktif('/dashboard') ? 'border-pink-500 text-pink-500' : 'border-transparent text-slate-600 hover:text-pink-500'
                    }`}
                  >
                    Dashboard
                  </Link>
                  <Link 
                    to="/riwayat" 
                    className={`text-sm font-semibold transition-all duration-200 py-1.5 border-b-2 ${
                      aktif('/riwayat') ? 'border-pink-500 text-pink-500' : 'border-transparent text-slate-600 hover:text-pink-500'
                    }`}
                  >
                    Pesanan Saya
                  </Link>
                </>
              )}
            </>
          )}
        </div>

        {/* Kanan: Keranjang, Peran Quick Toggle, dan Avatar */}
        <div className="flex items-center gap-3">
          
          {/* Quick Toggle Peran (Demo TA) */}
          {user && (
            <button
              className="hidden sm:flex items-center gap-1.5 font-bold text-[11px] bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-300 rounded-full px-3 py-1.5 transition-colors cursor-pointer"
              onClick={alihkanPeran}
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Ke {user.peran === 'admin' ? 'Pelanggan' : 'Admin'}
            </button>
          )}

          {/* Keranjang Belanja */}
          {user?.peran !== 'admin' && (
            <Link to="/keranjang" className="relative p-2 rounded-full hover:bg-pink-50 transition-colors">
              <ShoppingCart className="w-6 h-6 text-slate-600 hover:text-pink-500" />
              {totalItem > 0 && (
                <span className="absolute top-0 right-0 bg-red-500 text-white font-extrabold text-[10px] w-5 h-5 rounded-full flex items-center justify-center border-2 border-white animate-bounce">
                  {totalItem}
                </span>
              )}
            </Link>
          )}

          {/* Profil Dropdown / Tombol Masuk */}
          {user ? (
            <div className="relative" ref={dropdownRef}>
              <button 
                className="flex items-center gap-1.5 ring-2 ring-pink-500 rounded-full p-0.5 cursor-pointer focus:outline-none"
                onClick={() => setDropdownTerbuka(!dropdownTerbuka)}
              >
                <div className="w-8 h-8 rounded-full bg-pink-500 text-white flex items-center justify-center font-bold text-sm overflow-hidden">
                  {user.peran === 'admin' ? (
                    <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100" alt={user.nama} className="w-full h-full object-cover" />
                  ) : (
                    user.nama.split(' ')[0][0]
                  )}
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
              </button>

              {/* Menu Dropdown Portal */}
              {dropdownTerbuka && (
                <div className="absolute right-0 mt-2.5 w-52 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 p-2 text-left">
                  <div className="px-3 py-2 border-b border-slate-100 flex flex-col gap-0.5">
                    <p className="text-[10px] text-slate-400 font-semibold leading-none">Masuk sebagai</p>
                    <p className="font-bold text-slate-800 text-sm truncate mt-0.5">{user.nama}</p>
                    <span className="inline-block self-start mt-1 px-2 py-0.5 text-[9px] font-bold bg-pink-100 text-pink-700 rounded-full uppercase leading-none">
                      {user.peran}
                    </span>
                  </div>

                  <div className="py-1 flex flex-col">
                    {user.peran === 'admin' ? (
                      <Link 
                        to="/admin" 
                        onClick={() => setDropdownTerbuka(false)}
                        className="px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-pink-500 rounded-lg flex items-center gap-2"
                      >
                        <Settings className="w-4 h-4" />
                        Dashboard Admin
                      </Link>
                    ) : (
                      <Link 
                        to="/dashboard" 
                        onClick={() => setDropdownTerbuka(false)}
                        className="px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-pink-500 rounded-lg flex items-center gap-2"
                      >
                        <ClipboardList className="w-4 h-4" />
                        Dashboard
                      </Link>
                      <Link 
                        to="/riwayat" 
                        onClick={() => setDropdownTerbuka(false)}
                        className="px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-pink-500 rounded-lg flex items-center gap-2"
                      >
                        <ClipboardList className="w-4 h-4" />
                        Pesanan Saya
                      </Link>
                    )}

                    <button 
                      onClick={() => {
                        setDropdownTerbuka(false);
                        logout();
                        navigate('/');
                      }}
                      className="px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-lg flex items-center gap-2 w-full text-left cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      Keluar Akun
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link 
              to="/masuk" 
              className="bg-brand-pink text-white hover:bg-brand-pink-dark font-extrabold rounded-full px-5 py-2 text-xs shadow-md shadow-pink-200 transition-colors"
            >
              Masuk Akun
            </Link>
          )}

          {/* Toggle Menu Mobile */}
          <button 
            className="md:hidden p-2 text-slate-600 hover:text-pink-500 hover:bg-slate-50 rounded-full cursor-pointer"
            onClick={() => setMobileMenuTerbuka(!mobileMenuTerbuka)}
          >
            {mobileMenuTerbuka ? <X className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
          </button>

        </div>

      </div>

      {/* Menu Navigasi Mobile */}
      {mobileMenuTerbuka && (
        <div className="md:hidden border-t border-slate-100 bg-white/95 px-6 py-4 flex flex-col gap-3 text-left">
          {user?.peran === 'admin' ? (
            <>
              <Link 
                to="/admin" 
                onClick={() => setMobileMenuTerbuka(false)}
                className={`text-sm font-bold block py-2 ${aktif('/admin') ? 'text-pink-500' : 'text-slate-600'}`}
              >
                Dashboard
              </Link>
              <Link 
                to="/admin/kelola-menu" 
                onClick={() => setMobileMenuTerbuka(false)}
                className={`text-sm font-bold block py-2 ${aktif('/admin/kelola-menu') ? 'text-pink-500' : 'text-slate-600'}`}
              >
                Kelola Menu
              </Link>
              <Link 
                to="/admin/validasi-pesanan" 
                onClick={() => setMobileMenuTerbuka(false)}
                className={`text-sm font-bold block py-2 ${aktif('/admin/validasi-pesanan') ? 'text-pink-500' : 'text-slate-600'}`}
              >
                Validasi Pesanan
              </Link>
              <Link 
                to="/admin/laporan" 
                onClick={() => setMobileMenuTerbuka(false)}
                className={`text-sm font-bold block py-2 ${aktif('/admin/laporan') ? 'text-pink-500' : 'text-slate-600'}`}
              >
                Laporan
              </Link>
            </>
          ) : (
            <>
              <Link 
                to="/" 
                onClick={() => setMobileMenuTerbuka(false)}
                className={`text-sm font-bold block py-2 ${aktif('/') ? 'text-pink-500' : 'text-slate-600'}`}
              >
                Beranda
              </Link>
              <Link 
                to="/menu" 
                onClick={() => setMobileMenuTerbuka(false)}
                className={`text-sm font-bold block py-2 ${aktif('/menu') ? 'text-pink-500' : 'text-slate-600'}`}
              >
                Katalog Menu
              </Link>
              <Link 
                to="/promo" 
                onClick={() => setMobileMenuTerbuka(false)}
                className={`text-sm font-bold block py-2 ${aktif('/promo') ? 'text-pink-500' : 'text-slate-600'}`}
              >
                Promo Diskon
              </Link>
              {user && (
                <>
                  <Link 
                    to="/dashboard" 
                    onClick={() => setMobileMenuTerbuka(false)}
                    className={`text-sm font-bold block py-2 ${aktif('/dashboard') ? 'text-pink-500' : 'text-slate-600'}`}
                  >
                    Dashboard
                  </Link>
                  <Link 
                    to="/riwayat" 
                    onClick={() => setMobileMenuTerbuka(false)}
                    className={`text-sm font-bold block py-2 ${aktif('/riwayat') ? 'text-pink-500' : 'text-slate-600'}`}
                  >
                    Pesanan Saya
                  </Link>
                </>
              )}
            </>
          )}

          {/* Quick Toggle Peran (Demo Mobile) */}
          {user && (
            <button
              className="w-full justify-center flex items-center gap-1.5 font-bold text-xs mt-2 bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-300 rounded-full px-4 py-2 cursor-pointer"
              onClick={() => {
                alihkanPeran();
                setMobileMenuTerbuka(false);
              }}
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Beralih ke {user.peran === 'admin' ? 'Pelanggan' : 'Admin'}
            </button>
          )}
        </div>
      )}
    </nav>
  );
}
