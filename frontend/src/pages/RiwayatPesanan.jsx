import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Eye } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function RiwayatPesanan() {
  const { token } = useAuth();
  const [pesananSaya, setPesananSaya] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }
    fetch('https://8a49cf3c307c57.lhr.life/api/orders/my', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data && Array.isArray(data)) {
          setPesananSaya(data);
        }
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, [token]);

  const labelStatus = (status) => {
    const map = {
      menunggu_pembayaran: 'Menunggu Bayar',
      menunggu_validasi: 'Validasi Admin',
      diproses: 'Diproses',
      dikirim: 'Dikirim',
      selesai: 'Selesai',
      dibatalkan: 'Dibatalkan',
    };
    return map[status] || status;
  };

  return (
    <div className="page-wrap min-h-screen text-left">
      <div className="mb-8">
        <p className="text-brand-orange font-semibold text-xs uppercase tracking-wider">Pesanan Saya</p>
        <h1 className="page-title mt-1">Riwayat Pemesanan</h1>
        <p className="page-subtitle">Semua pesanan pizza Vipizza yang pernah Anda buat</p>
      </div>

      {loading ? (
        <div className="card-fe text-center py-16 flex justify-center items-center">
          <div className="w-8 h-8 border-4 border-brand-orange border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : pesananSaya.length > 0 ? (
        <div className="flex flex-col gap-4">
          {pesananSaya.map((pes) => (
            <div key={pes.id} className="card-fe-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5">
              <div>
                <p className="font-serif font-bold text-brand-brown text-lg">Pesanan #{pes.id}</p>
                <p className="text-brand-brown-light text-xs mt-1">
                  {new Date(pes.tanggal_pesanan).toLocaleDateString('id-ID', {
                    day: 'numeric', month: 'long', year: 'numeric',
                  })}
                  {' · '}
                  {(pes.metode_pembayaran || '').replace('_', ' ').toUpperCase()}
                </p>
                <span className="inline-block mt-2 text-[10px] font-bold uppercase bg-brand-orange-light text-brand-orange px-2.5 py-1 rounded-full">
                  {labelStatus(pes.status)}
                </span>
              </div>
              <div className="flex items-center gap-4">
                <span className="font-bold text-brand-orange text-lg">
                  Rp {(pes.total_harga || 0).toLocaleString('id-ID')}
                </span>
                <Link
                  to={`/track/${pes.id}`}
                  className="btn-secondary text-xs py-2 px-4 inline-flex items-center gap-1.5"
                >
                  <Eye className="w-3.5 h-3.5" />
                  Lacak
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card-fe text-center py-16 flex flex-col items-center gap-4 max-w-md mx-auto">
          <span className="text-4xl">🍕</span>
          <h3 className="font-serif font-bold text-brand-brown text-lg">Belum Ada Pesanan</h3>
          <p className="text-brand-brown-light text-sm">Pesan pizza homemade favoritmu sekarang dan pantau prosesnya di sini!</p>
          <Link to="/menu" className="btn-primary text-sm mt-2">Pesan Pizza Sekarang</Link>
        </div>
      )}
    </div>
  );
}
