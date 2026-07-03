import React, { useState } from 'react';
import PageHero from '../components/layout/PageHero';
import { MapPin, Phone, Mail, Send } from 'lucide-react';

export default function Kontak() {
  const [nama, setNama] = useState('');
  const [email, setEmail] = useState('');
  const [pertanyaan, setPertanyaan] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!nama || !email || !pertanyaan) {
      alert('Mohon isi seluruh field!');
      return;
    }
    alert('Pertanyaan Anda telah terkirim. Admin akan membalas melalui email.');
    setNama('');
    setEmail('');
    setPertanyaan('');
  };

  const faq = [
    { q: 'Bagaimana cara memesan pizza?', a: 'Daftar akun, pilih menu di halaman Menu, tambahkan ke keranjang, lalu checkout.' },
    { q: 'Metode pembayaran apa saja?', a: 'Transfer bank dan QRIS. Upload bukti pembayaran setelah checkout.' },
    { q: 'Area pengantaran?', a: 'Seluruh wilayah Kota Padang. Ongkir disesuaikan jarak alamat.' },
  ];

  return (
    <div>
      <PageHero
        title="Kontak"
        breadcrumbs={[{ label: 'Home', to: '/' }, { label: 'Kontak' }]}
      />

      <section className="py-12 bg-[#f8f9fa]">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* Info kontak */}
          <div>
            <h2 className="text-xl font-bold text-[#212529] mb-6">Hubungi Kami</h2>
            <div className="space-y-4">
              {[
                { icon: MapPin, label: 'Alamat', value: 'Jl. Khatib Sulaiman, Kota Padang, Sumatera Barat' },
                { icon: Phone, label: 'Telepon / WhatsApp', value: '0823-4567-8901' },
                { icon: Mail, label: 'Email', value: 'info@vipizza.com' },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-start gap-3 card-bs p-4">
                  <Icon className="w-5 h-5 text-[#0b5345] shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-semibold text-[#212529]">{label}</p>
                    <p className="text-sm text-[#6c757d] mt-0.5">{value}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8">
              <h3 className="font-bold text-[#212529] mb-4">FAQ</h3>
              <div className="space-y-3">
                {faq.map(({ q, a }) => (
                  <div key={q} className="card-bs p-4">
                    <p className="font-semibold text-sm text-[#212529]">{q}</p>
                    <p className="text-xs text-[#6c757d] mt-1 leading-relaxed">{a}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Form pertanyaan */}
          <div className="card-bs p-6">
            <h2 className="text-xl font-bold text-[#212529] mb-1">Kirim Pertanyaan</h2>
            <p className="text-[#6c757d] text-xs mb-6">Isi form di bawah untuk menghubungi admin Vipizza</p>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="text-sm font-medium text-[#212529] block mb-1">Nama</label>
                <input
                  type="text"
                  value={nama}
                  onChange={(e) => setNama(e.target.value)}
                  className="input-bs"
                  placeholder="Nama lengkap"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium text-[#212529] block mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-bs"
                  placeholder="email@contoh.com"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium text-[#212529] block mb-1">Pertanyaan</label>
                <textarea
                  value={pertanyaan}
                  onChange={(e) => setPertanyaan(e.target.value)}
                  rows={4}
                  className="input-bs resize-none"
                  placeholder="Tulis pertanyaan Anda..."
                  required
                />
              </div>
              <button type="submit" className="btn-primary flex items-center justify-center gap-2 py-2.5">
                <Send className="w-4 h-4" />
                Kirim Pertanyaan
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
