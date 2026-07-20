import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';

import CustomerLayout from './components/layout/CustomerLayout';
import AdminLayout from './components/layout/AdminLayout';
import PelangganDashboardLayout from './components/layout/PelangganDashboardLayout';

// Halaman Pelanggan (Indonesian Names)
import Beranda from './pages/Beranda';
import Menu from './pages/Menu';
import TentangKami from './pages/TentangKami';
import Kontak from './pages/Kontak';
import Keranjang from './pages/Keranjang';
import LacakPesanan from './pages/LacakPesanan';
import RiwayatPesanan from './pages/RiwayatPesanan';
import DashboardPelanggan from './pages/DashboardPelanggan';
import ProfilPelanggan from './pages/ProfilPelanggan';
import Masuk from './pages/Masuk';
import Daftar from './pages/Daftar';

// Halaman Admin (Indonesian Names)
import Dashboard from './pages/admin/Dashboard';
import KelolaMenu from './pages/admin/KelolaMenu';
import KelolaKategori from './pages/admin/KelolaKategori';
import KelolaPromo from './pages/admin/KelolaPromo';
import KelolaPesanan from './pages/admin/KelolaPesanan';
import DataPelanggan from './pages/admin/DataPelanggan';
import Profil from './pages/admin/Profil';
import Laporan from './pages/admin/Laporan';
import PesanPelanggan from './pages/admin/PesanPelanggan';
import KelolaUlasan from './pages/admin/KelolaUlasan';
import KelolaGaleri from './pages/admin/KelolaGaleri';

// Halaman Publik Promo & Galeri
import Promo from './pages/Promo';
import Galeri from './pages/Galeri';

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
            <Route path="/galeri" element={<Galeri />} />
            <Route path="/kontak" element={<Kontak />} />
            <Route path="/masuk" element={<Masuk />} />
            <Route path="/daftar" element={<Daftar />} />
            <Route path="/login" element={<Masuk />} />
            <Route path="/register" element={<Daftar />} />
          </Route>

          {/* Rute Akun Pelanggan (Menggunakan Sidebar Dashboard) */}
          <Route element={<PelangganDashboardLayout />}>
            <Route path="/dashboard" element={<DashboardPelanggan />} />
            <Route path="/keranjang" element={<Keranjang />} />
            <Route path="/track/:id" element={<LacakPesanan />} />
            <Route path="/riwayat" element={<RiwayatPesanan />} />
            <Route path="/profil" element={<ProfilPelanggan />} />
          </Route>

          {/* Rute Administrator menggunakan AdminLayout */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="kelola-menu" element={<KelolaMenu />} />
            <Route path="kelola-kategori" element={<KelolaKategori />} />
            <Route path="kelola-promo" element={<KelolaPromo />} />
            <Route path="kelola-ulasan" element={<KelolaUlasan />} />
            <Route path="pesanan" element={<KelolaPesanan />} />
            <Route path="pelanggan" element={<DataPelanggan />} />
            <Route path="galeri" element={<KelolaGaleri />} />
            <Route path="data-pelanggan" element={<DataPelanggan />} />
            <Route path="profil" element={<Profil />} />
            <Route path="laporan" element={<Laporan />} />
            <Route path="pesan-pelanggan" element={<PesanPelanggan />} />
            <Route path="ulasan" element={<KelolaUlasan />} />
          </Route>
        </Routes>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
