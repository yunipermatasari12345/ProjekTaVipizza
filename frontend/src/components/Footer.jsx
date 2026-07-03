import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#0b5345] text-white/80">
      <div className="max-w-6xl mx-auto px-6 py-10 grid grid-cols-1 md:grid-cols-3 gap-8 text-sm">
        <div>
          <h3 className="font-bold text-white text-base mb-3">VIPIZZA Homemade</h3>
          <p className="text-white/70 text-xs leading-relaxed">
            UMKM pizza rumahan di Kota Padang. Pizza dipanggang segar dengan keju mozzarella lumer —
            pesan online, kami antar hangat ke rumah Anda.
          </p>
        </div>

        <div>
          <h3 className="font-bold text-white text-base mb-3">Menu Navigasi</h3>
          <div className="flex flex-col gap-2 text-xs">
            <Link to="/" className="hover:text-white transition-colors">Home</Link>
            <Link to="/menu" className="hover:text-white transition-colors">Menu Pizza</Link>
            <Link to="/tentang" className="hover:text-white transition-colors">Tentang Kami</Link>
            <Link to="/kontak" className="hover:text-white transition-colors">Kontak</Link>
            <Link to="/masuk" className="hover:text-white transition-colors">Login</Link>
          </div>
        </div>

        <div>
          <h3 className="font-bold text-white text-base mb-3">Kontak Kami</h3>
          <div className="flex flex-col gap-2.5 text-xs">
            <p className="flex items-start gap-2">
              <MapPin className="w-4 h-4 shrink-0 mt-0.5" />
              Jl. Khatib Sulaiman, Kota Padang, Sumatera Barat
            </p>
            <p className="flex items-center gap-2">
              <Phone className="w-4 h-4 shrink-0" />
              0823-4567-8901
            </p>
            <p className="flex items-center gap-2">
              <Mail className="w-4 h-4 shrink-0" />
              info@vipizza.com
            </p>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10 py-4 text-center text-xs text-white/50">
        © 2026 Vipizza Homemade Padang — Sistem Informasi Pemesanan & Penjualan (Tugas Akhir)
      </div>
    </footer>
  );
}
