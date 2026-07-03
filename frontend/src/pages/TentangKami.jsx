import React from 'react';
import { Link } from 'react-router-dom';
import PageHero from '../components/layout/PageHero';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';

export default function TentangKami() {
  return (
    <div>
      <PageHero
        title="Tentang Kami"
        breadcrumbs={[{ label: 'Home', to: '/' }, { label: 'Tentang Kami' }]}
      />

      <section className="py-12 bg-white">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-xl font-bold text-[#212529] mb-4">Profil Singkat</h2>
          <p className="text-[#6c757d] text-sm leading-relaxed text-left">
            Vipizza Homemade Padang adalah Usaha Mikro Kecil Menengah (UMKM) yang bergerak di
            bidang kuliner pizza rumahan. Berlokasi di Kota Padang, Vipizza menyajikan pizza
            homemade dengan cita rasa autentik, bahan berkualitas, dan keju mozzarella lumer
            sebagai ciri khas produk.
          </p>
          <p className="text-[#6c757d] text-sm leading-relaxed text-left mt-4">
            Melalui sistem informasi pemesanan online ini, pelanggan dapat memesan pizza secara
            praktis, melakukan pembayaran transfer/QRIS, dan melacak status pesanan hingga
            pengantaran ke alamat tujuan.
          </p>
        </div>
      </section>

      <section className="py-12 bg-[#f8f9fa]">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="card-bs p-6">
            <h3 className="font-bold text-[#212529] mb-3">Visi</h3>
            <p className="text-[#6c757d] text-sm leading-relaxed">
              Menjadi UMKM pizza homemade terpercaya di Kota Padang yang mampu melayani
              pelanggan secara digital dengan kualitas produk terbaik.
            </p>
          </div>
          <div className="card-bs p-6">
            <h3 className="font-bold text-[#212529] mb-3">Misi</h3>
            <ul className="text-[#6c757d] text-sm leading-relaxed list-disc list-inside space-y-1">
              <li>Menyajikan pizza homemade berkualitas dengan bahan segar</li>
              <li>Memberikan layanan pemesanan online yang mudah dan cepat</li>
              <li>Mengantar pesanan hangat ke seluruh wilayah Kota Padang</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="py-12 bg-white">
        <div className="max-w-3xl mx-auto px-6">
          <div className="section-heading">
            <h2>Informasi Usaha</h2>
          </div>
          <div className="card-bs divide-y divide-[#dee2e6]">
            {[
              { icon: MapPin, label: 'Alamat', value: 'Jl. Khatib Sulaiman, Kota Padang, Sumatera Barat' },
              { icon: Phone, label: 'Telepon / WhatsApp', value: '0823-4567-8901' },
              { icon: Mail, label: 'Email', value: 'info@vipizza.com' },
              { icon: Clock, label: 'Jam Operasional', value: 'Senin – Minggu, 10.00 – 21.00 WIB' },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-start gap-4 p-4">
                <Icon className="w-5 h-5 text-[#0b5345] shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold text-[#212529]">{label}</p>
                  <p className="text-sm text-[#6c757d] mt-0.5">{value}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link to="/kontak" className="btn-primary text-sm">Hubungi Kami</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
