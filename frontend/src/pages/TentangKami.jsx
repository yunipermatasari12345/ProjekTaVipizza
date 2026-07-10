import React from 'react';
import { Link } from 'react-router-dom';
import PageHero from '../components/layout/PageHero';
import { MapPin, Phone, Mail, Clock, CheckCircle2, Target, Star } from 'lucide-react';

export default function TentangKami() {
  return (
    <div>

      {/* ===== PROFIL SINGKAT + FOTO OWNER ===== */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

            {/* Foto Owner — Kiri */}
            <div className="flex flex-col items-center gap-5">
              <div className="relative w-full max-w-sm mx-auto">
                {/* Badge dekoratif */}
                <div className="absolute -top-4 -left-4 w-20 h-20 bg-[#8B3A0F]/10 rounded-full z-0" />
                <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-[#FAF6F1] rounded-full z-0" />
                <div className="relative z-10 rounded-2xl overflow-hidden shadow-2xl border-4 border-[#FAF6F1]">
                  <img
                    src={`/owner-vipizza.png?v=${new Date().getTime()}`}
                    alt="Owner Vipizza"
                    className="w-full h-auto object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://images.unsplash.com/photo-1607631568010-a87245c0daf8?auto=format&fit=crop&q=80&w=400';
                    }}
                  />
                </div>
                {/* Label nama owner */}
                <div className="relative z-10 mt-4 text-center">
                  <div className="inline-block bg-[#8B3A0F] text-white px-5 py-2 rounded-full shadow-lg">
                    <p className="font-black text-sm tracking-wide">Pendiri & Owner</p>
                    <p className="font-bold text-xs text-amber-200 mt-0.5">Vipizza Homemade Padang</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Profil + Visi Misi — Kanan */}
            <div className="flex flex-col gap-7">

              {/* Profil Singkat */}
              <div>
                <span className="text-[10px] font-black text-[#8B3A0F] tracking-widest uppercase">Profil Singkat</span>
                <h2 className="text-2xl font-black text-[#2C1810] mt-1 mb-3 leading-tight">
                  Vipizza Homemade Padang 🍕
                </h2>
                <p className="text-[#5C3D2E] text-sm leading-relaxed">
                  Vipizza Homemade Padang adalah Usaha Mikro Kecil Menengah (UMKM) yang bergerak
                  di bidang kuliner pizza rumahan. Berlokasi di Kota Padang, Vipizza menyajikan pizza
                  homemade dengan cita rasa autentik, bahan berkualitas, dan keju mozzarella lumer
                  sebagai ciri khas produk.
                </p>
                <p className="text-[#5C3D2E] text-sm leading-relaxed mt-3">
                  Melalui sistem informasi pemesanan online ini, pelanggan dapat memesan pizza secara
                  praktis, melakukan pembayaran transfer/QRIS, dan melacak status pesanan hingga
                  pengantaran ke alamat tujuan.
                </p>
              </div>

              {/* Visi */}
              <div className="bg-[#FAF6F1] border border-[#E8DDD5] rounded-2xl p-5 flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-[#8B3A0F] flex items-center justify-center shrink-0 shadow-md">
                  <Target className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-black text-[#2C1810] text-base mb-1">Visi</h3>
                  <p className="text-[#5C3D2E] text-sm leading-relaxed">
                    Menjadi UMKM pizza homemade terpercaya di Kota Padang yang mampu melayani
                    pelanggan secara digital dengan kualitas produk terbaik.
                  </p>
                </div>
              </div>

              {/* Misi */}
              <div className="bg-[#FAF6F1] border border-[#E8DDD5] rounded-2xl p-5 flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-[#2C1810] flex items-center justify-center shrink-0 shadow-md">
                  <Star className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <h3 className="font-black text-[#2C1810] text-base mb-2">Misi</h3>
                  <ul className="flex flex-col gap-2">
                    {[
                      'Menyajikan pizza homemade berkualitas dengan bahan segar',
                      'Memberikan layanan pemesanan online yang mudah dan cepat',
                      'Mengantar pesanan hangat ke seluruh wilayah Kota Padang',
                    ].map((m, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-[#5C3D2E]">
                        <CheckCircle2 className="w-4 h-4 text-[#8B3A0F] shrink-0 mt-0.5" />
                        {m}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* ===== INFORMASI USAHA ===== */}
      <section className="py-14 bg-[#f8f9fa]">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-8">
            <span className="text-[10px] font-black text-[#8B3A0F] tracking-widest uppercase">Detail Kontak</span>
            <h2 className="text-xl font-black text-[#2C1810] mt-1">Informasi Usaha</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { icon: MapPin, label: 'Alamat', value: 'Komplek Taruko I Blok L No. 29, Korong Gadang, Kec. Kuranji, Kota Padang', color: '#8B3A0F' },
              { icon: Phone, label: 'Telepon / WhatsApp', value: '0823-4567-8901', color: '#2C1810' },
              { icon: Mail, label: 'Email', value: 'info@vipizza.com', color: '#8B3A0F' },
              { icon: Clock, label: 'Jam Operasional', value: 'Senin – Minggu, 10.00 – 21.00 WIB', color: '#2C1810' },
            ].map(({ icon: Icon, label, value, color }) => (
              <div key={label} className="bg-white rounded-2xl border border-[#E8DDD5] shadow-sm p-5 flex items-start gap-4 hover:shadow-md transition-shadow">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm" style={{ backgroundColor: color + '15' }}>
                  <Icon className="w-5 h-5" style={{ color }} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-[#8B3A0F] uppercase tracking-wider">{label}</p>
                  <p className="text-sm text-[#2C1810] font-semibold mt-0.5 leading-relaxed">{value}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-10">
            <Link to="/kontak"
              className="inline-flex items-center gap-2 bg-[#8B3A0F] hover:bg-[#2C1810] text-white font-bold text-sm px-8 py-3.5 rounded-full shadow-lg hover:shadow-xl transition-all duration-300">
              💬 Hubungi Kami
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

