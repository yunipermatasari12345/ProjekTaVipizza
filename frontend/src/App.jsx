import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';

import CustomerLayout from './components/layout/CustomerLayout';
import AdminLayout from './components/layout/AdminLayout';

// Halaman Pelanggan (Indonesian Names)
import Beranda from './pages/Beranda';
import Menu from './pages/Menu';
import TentangKami from './pages/TentangKami';
import Kontak from './pages/Kontak';
import Keranjang from './pages/Keranjang';
import LacakPesanan from './pages/LacakPesanan';
import RiwayatPesanan from './pages/RiwayatPesanan';
import DashboardPelanggan from './pages/DashboardPelanggan';
import Masuk from './pages/Masuk';
import Daftar from './pages/Daftar';

// Halaman Admin (Indonesian Names)
import Dashboard from './pages/admin/Dashboard';
import KelolaMenu from './pages/admin/KelolaMenu';
import KelolaPromo from './pages/admin/KelolaPromo';
import Laporan from './pages/admin/Laporan';

// Halaman Publik Promo
import Promo from './pages/Promo';

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Routes>
          {/* Rute Pelanggan menggunakan CustomerLayout */}
          <Route element={<CustomerLayout />}>
            <Route path="/" element={<Beranda />} />
            <Route path="/menu" element={<Menu />} />
            <Route path="/promo" element={<Promo />} />
            <Route path="/tentang" element={<TentangKami />} />
            <Route path="/kontak" element={<Kontak />} />
            <Route path="/keranjang" element={<Keranjang />} />
            <Route path="/lacak/:id" element={<LacakPesanan />} />
            <Route path="/track/:id" element={<LacakPesanan />} />
            <Route path="/riwayat" element={<RiwayatPesanan />} />
            <Route path="/dashboard" element={<DashboardPelanggan />} />
            <Route path="/masuk" element={<Masuk />} />
            <Route path="/daftar" element={<Daftar />} />
            {/* Alias route agar /login dan /register tetap bisa diakses */}
            <Route path="/login" element={<Masuk />} />
            <Route path="/register" element={<Daftar />} />
          </Route>

          {/* Rute Administrator menggunakan AdminLayout */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="kelola-menu" element={<KelolaMenu />} />
            <Route path="kelola-promo" element={<KelolaPromo />} />
            <Route path="validasi-pesanan" element={<Dashboard />} />
            <Route path="laporan" element={<Laporan />} />
          </Route>
        </Routes>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
