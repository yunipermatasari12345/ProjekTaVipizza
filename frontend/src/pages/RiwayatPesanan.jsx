import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Eye, ShoppingBag } from 'lucide-react';

export default function RiwayatPesanan() {
  const { token } = useAuth();
  const [pesananList, setPesananList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token || token === "mock_jwt_token_vipizza") {
      setLoading(false);
      return;
    }

    fetch('http://localhost:8080/api/orders/my', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setPesananList(data);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [token]);

  const labelStatus = (status) => {
    const map = {
      menunggu_pembayaran: 'Menunggu Bayar',
      diproses: 'Diproses',
      sedang_diantar: 'Sedang Diantar',
      selesai: 'Selesai',
      dibatalkan: 'Dibatalkan',
    };
    return map[status] || status;
  };

  const warnaStatus = (status) => {
    const map = {
      menunggu_pembayaran: 'bg-amber-100 text-amber-700',
      diproses: 'bg-blue-100 text-blue-700',
      sedang_diantar: 'bg-purple-100 text-purple-700',
      selesai: 'bg-emerald-100 text-emerald-700',
      dibatalkan: 'bg-red-100 text-red-700',
    };
    return map[status] || 'bg-slate-100 text-slate-700';
  };

  if (loading) {
    return <div className="py-20 text-center text-slate-500 font-bold">Memuat data...</div>;
  }

  return (
    <div className="page-wrap min-h-screen text-left">
      <div className="mb-8">
        <p className="text-brand-orange font-semibold text-xs uppercase tracking-wider">Pesanan Saya</p>
        <h1 className="page-title mt-1">Riwayat Pemesanan</h1>
        <p className="page-subtitle">Semua pesanan pizza Vipizza yang pernah Anda buat</p>
      </div>

      {pesananList.length > 0 ? (
        <div className="flex flex-col gap-4">
          {pesananList.map((pes) => (
            <div key={pes.id} className="card-fe-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5">
              <div>
                <p className="font-serif font-bold text-brand-brown text-lg">Pesanan #{pes.id}</p>
                <p className="text-brand-brown-light text-xs mt-1">
                  {new Date(pes.tanggal_pesanan || pes.created_at).toLocaleDateString('id-ID', {
                    day: 'numeric', month: 'long', year: 'numeric',
                  })}
                  {' · '}
                  {pes.metode_pembayaran === 'midtrans' ? 'Midtrans' : 'Tunai'}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <span className={`inline-block text-[10px] font-bold uppercase px-2.5 py-1 rounded-full ${warnaStatus(pes.status)}`}>
                    {labelStatus(pes.status)}
                  </span>
                  <span className={`inline-block text-[10px] font-bold uppercase px-2.5 py-1 rounded-full ${pes.status_pembayaran === 'lunas' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                    {pes.status_pembayaran === 'lunas' ? 'Lunas' : 'Belum Dibayar'}
                  </span>
                </div>
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
          <ShoppingBag className="w-12 h-12 text-slate-300" />
          <h3 className="font-serif font-bold text-brand-brown text-lg">Belum Ada Pesanan</h3>
          <p className="text-brand-brown-light text-sm">Pesan pizza homemade favoritmu sekarang!</p>
          <Link to="/menu" className="btn-primary text-sm mt-2">Lihat Menu Pizza</Link>
        </div>
      )}
    </div>
  );
}
