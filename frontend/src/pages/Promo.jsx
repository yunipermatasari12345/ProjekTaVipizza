import React, { useState, useEffect } from 'react';
import { Tag, Clock, Copy, CheckCheck } from 'lucide-react';
import PageHero from '../components/layout/PageHero';

export default function Promo() {
  const [promos, setPromos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [kopiId, setKopiId] = useState(null);

  useEffect(() => {
    fetch('http://localhost:9000/api/promo')
      .then(res => { if (!res.ok) throw new Error(); return res.json(); })
      .then(data => { if (Array.isArray(data)) setPromos(data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSalinKode = (kode, id) => {
    navigator.clipboard.writeText(kode);
    setKopiId(id);
    setTimeout(() => setKopiId(null), 2000);
  };

  const sisaHari = (tanggalAkhir) => {
    const selisih = new Date(tanggalAkhir) - new Date();
    return Math.max(0, Math.ceil(selisih / (1000 * 60 * 60 * 24)));
  };

  const formatTanggal = (tgl) => {
    if (!tgl) return '';
    return new Date(tgl).toLocaleDateString('id-ID', {
      day: '2-digit', month: 'long', year: 'numeric',
    });
  };

  return (
    <div>

      <section className="py-12 bg-[#f8f9fa]">
        <div className="max-w-6xl mx-auto px-6">


          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 border-4 border-[#0b5345] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : promos.length === 0 ? (
            <div className="card-bs text-center py-16 max-w-md mx-auto">
              <Tag className="w-10 h-10 text-[#adb5bd] mx-auto mb-3" />
              <h3 className="font-bold text-[#212529] text-base">Belum Ada Promo Aktif</h3>
              <p className="text-[#6c757d] text-sm mt-2">
                Pantau terus halaman ini ya! Promo menarik akan segera hadir. 🍕
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {promos.map(promo => {
                const sisa = sisaHari(promo.tanggal_akhir);
                const hampirHabis = sisa <= 3;
                return (
                  <div key={promo.id}
                    className="card-bs overflow-hidden flex flex-col relative group hover:shadow-lg transition-shadow duration-300">
                    {/* Badge diskon */}
                    {promo.diskon > 0 && (
                      <div className="absolute top-3 right-3 z-10 bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow">
                        -{promo.diskon}%
                      </div>
                    )}

                    {/* Banner */}
                    <div className="h-56 bg-gradient-to-br from-[#0b5345] to-[#1a7a61] relative overflow-hidden">
                      {promo.banner_url ? (
                        <img
                          src={`http://localhost:9000${promo.banner_url}`}
                          alt={promo.judul}
                          className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-5xl">🍕</span>
                        </div>
                      )}
                    </div>

                    {/* Konten */}
                    <div className="p-4 flex flex-col flex-1">
                      <h3 className="font-bold text-[#212529] text-base leading-snug mb-1">
                        {promo.judul}
                      </h3>
                      {promo.deskripsi && (
                        <p className="text-[#6c757d] text-xs leading-relaxed mb-3 line-clamp-2 flex-1">
                          {promo.deskripsi}
                        </p>
                      )}

                      {/* Tanggal berlaku */}
                      <div className={`flex items-center gap-1.5 text-xs mb-3 ${hampirHabis ? 'text-red-500' : 'text-[#6c757d]'}`}>
                        <Clock className="w-3.5 h-3.5" />
                        <span>
                          {hampirHabis
                            ? `Berakhir dalam ${sisa} hari!`
                            : `Berlaku s/d ${formatTanggal(promo.tanggal_akhir)}`}
                        </span>
                      </div>

                      {/* Kode promo */}
                      {promo.kode_promo && (
                        <button
                          onClick={() => handleSalinKode(promo.kode_promo, promo.id)}
                          className="flex items-center justify-between w-full border-2 border-dashed border-[#0b5345]/40 bg-[#e8f5f2] rounded-lg px-3 py-2 hover:border-[#0b5345] transition-colors group/kode">
                          <code className="text-[#0b5345] font-mono font-bold text-sm tracking-widest">
                            {promo.kode_promo}
                          </code>
                          {kopiId === promo.id ? (
                            <CheckCheck className="w-4 h-4 text-emerald-600" />
                          ) : (
                            <Copy className="w-4 h-4 text-[#0b5345] opacity-60 group-hover/kode:opacity-100" />
                          )}
                        </button>
                      )}
                      {promo.kode_promo && (
                        <p className="text-[10px] text-[#6c757d] mt-1.5 text-center">
                          {kopiId === promo.id ? '✓ Kode disalin!' : 'Klik untuk salin kode'}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
