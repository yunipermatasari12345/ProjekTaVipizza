import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, Leaf } from 'lucide-react';

export default function Footer() {
  return (
    <footer style={{ backgroundColor: '#2C1810' }} className="text-white/80">
      <div className="max-w-7xl mx-auto px-6 py-14 grid grid-cols-1 md:grid-cols-4 gap-10 text-sm">
        
        {/* Brand */}
        <div className="md:col-span-2">
          <h3 className="font-black text-2xl text-white tracking-tight uppercase mb-1">VIPIZZA</h3>
          <p style={{ color: '#F4A261' }} className="text-xs tracking-widest uppercase mb-4">Homemade Padang</p>
          <p className="text-white/60 text-xs leading-relaxed max-w-xs">
            UMKM pizza rumahan di Kota Padang. Pizza dipanggang segar dengan keju mozzarella lumer — 
            pesan online, kami antar hangat ke rumah Anda.
          </p>
        </div>

        {/* Navigasi */}
        <div>
          <h4 className="font-bold text-white text-sm mb-5 uppercase tracking-widest">Navigasi</h4>
          <div className="flex flex-col gap-3 text-xs text-white/60">
            <Link to="/" className="hover:text-white transition-colors">Home</Link>
            <Link to="/menu" className="hover:text-white transition-colors">Menu Pizza</Link>
            <Link to="/promo" className="hover:text-white transition-colors">Promo</Link>
            <Link to="/tentang" className="hover:text-white transition-colors">Tentang Kami</Link>
            <Link to="/kontak" className="hover:text-white transition-colors">Kontak</Link>
          </div>
        </div>

        {/* Kontak */}
        <div>
          <h4 className="font-bold text-white text-sm mb-5 uppercase tracking-widest">Kontak</h4>
          <div className="flex flex-col gap-3 text-xs text-white/60">
            <p className="flex items-start gap-2">
              <MapPin className="w-4 h-4 shrink-0 mt-0.5" style={{ color: '#F4A261' }} />
              Komplek Taruko I Blok L No. 29, Korong Gadang, Kec. Kuranji, Kota Padang
            </p>
            <p className="flex items-center gap-2">
              <Phone className="w-4 h-4 shrink-0" style={{ color: '#F4A261' }} />
              0823-4567-8901
            </p>
            <p className="flex items-center gap-2">
              <Mail className="w-4 h-4 shrink-0" style={{ color: '#F4A261' }} />
              info@vipizza.com
            </p>
          </div>
        </div>
      </div>

      <div style={{ backgroundColor: '#1A0E09' }} className="border-t border-white/10 py-5 text-center text-xs text-white/40">
        © 2026 VIPizza Homemade Padang — Sistem Informasi Pemesanan &amp; Penjualan
      </div>
    </footer>
  );
}
