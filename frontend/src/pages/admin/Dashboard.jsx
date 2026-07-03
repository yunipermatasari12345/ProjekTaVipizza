import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  DollarSign, ClipboardList, Users, CheckCircle2,
  Eye, X, FileSearch, TrendingUp, Clock, RefreshCw,
  Search, Wallet, CreditCard
} from 'lucide-react';

const STATUS_CONFIG = {
  menunggu_pembayaran: { label: 'Menunggu Bayar', color: '#ffc107', bg: '#fff8e1', text: '#856404' },
  diproses:            { label: 'Diproses',       color: '#0d6efd', bg: '#e7f1ff', text: '#0a58ca' },
  sedang_diantar:      { label: 'Sedang Diantar', color: '#6f42c1', bg: '#f3edff', text: '#5a32a3' },
  selesai:             { label: 'Selesai',         color: '#198754', bg: '#d1e7dd', text: '#0a5432' },
  dibatalkan:          { label: 'Dibatalkan',      color: '#dc3545', bg: '#f8d7da', text: '#842029' },
};

export default function Dashboard() {
  const { token } = useAuth();
  const [pesananList, setPesananList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pesananTerpilih, setPesananTerpilih] = useState(null);
  const [catatanPenolakan, setCatatanPenolakan] = useState('');
  const [modalBuka, setModalBuka] = useState(false);
  const [filterStatus, setFilterStatus] = useState('semua');
  const [searchQ, setSearchQ] = useState('');

  const muatPesanan = useCallback(async () => {
    try {
      const res = await fetch('http://localhost:8080/api/orders', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setPesananList(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.warn('Gagal muat pesanan:', err);
    }
    setLoading(false);
  }, [token]);

  useEffect(() => { muatPesanan(); }, [muatPesanan]);

  const handleUpdateStatus = async (id, statusBaru) => {
    try {
      await fetch(`http://localhost:8080/api/orders/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: statusBaru })
      });
      muatPesanan();
    } catch (err) {
      console.warn('Gagal update status:', err);
    }
    setModalBuka(false);
    setPesananTerpilih(null);
  };

  const handleUpdatePembayaran = async (id, statusPembayaran) => {
    try {
      await fetch(`http://localhost:8080/api/orders/${id}/payment-status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status_pembayaran: statusPembayaran })
      });
      muatPesanan();
    } catch (err) {
      console.warn('Gagal update status pembayaran:', err);
    }
  };

  const totalPendapatan = pesananList.filter(p => p.status === 'selesai').reduce((s, p) => s + (p.total_harga || 0), 0);
  const totalMenunggu  = pesananList.filter(p => p.status === 'menunggu_pembayaran').length;
  const totalDiproses  = pesananList.filter(p => p.status === 'diproses' || p.status === 'sedang_diantar').length;
  const totalSelesai   = pesananList.filter(p => p.status === 'selesai').length;

  const statCards = [
    { icon: DollarSign, label: 'Total Pendapatan', value: `Rp ${totalPendapatan.toLocaleString('id-ID')}`, iconBg: '#d1e7dd', iconColor: '#198754' },
    { icon: Wallet, label: 'Belum Dibayar', value: `${pesananList.filter(p => p.status_pembayaran === 'belum_dibayar' && p.status !== 'dibatalkan').length} Pesanan`, iconBg: '#fff3cd', iconColor: '#ffc107' },
    { icon: Clock, label: 'Sedang Diproses', value: `${totalDiproses} Pesanan`, iconBg: '#cfe2ff', iconColor: '#0d6efd' },
    { icon: CheckCircle2, label: 'Selesai', value: `${totalSelesai} Pesanan`, iconBg: '#e0cffc', iconColor: '#6f42c1' },
  ];

  const pesananFiltered = pesananList.filter(p => {
    const matchStatus = filterStatus === 'semua' || p.status === filterStatus;
    const matchSearch = searchQ === '' || String(p.id).includes(searchQ) || (p.alamat_pengiriman || '').toLowerCase().includes(searchQ.toLowerCase());
    return matchStatus && matchSearch;
  });

  const StatusBadge = ({ status }) => {
    const cfg = STATUS_CONFIG[status] || { label: status, bg: '#f0f0f0', text: '#555' };
    return <span style={{ backgroundColor: cfg.bg, color: cfg.text }} className="admin-badge">{cfg.label}</span>;
  };

  const aksiTombol = (pes) => {
    const btn = (label, color, onClick) => (
      <button key={label} className={`admin-btn-sm admin-btn-sm--${color}`} onClick={onClick}>{label}</button>
    );

    const btns = [];

    if (pes.status === 'menunggu_pembayaran') {
      if (pes.metode_pembayaran !== 'midtrans') {
        btns.push(btn('Proses', 'success', () => handleUpdateStatus(pes.id, 'diproses')));
      }
      btns.push(btn('Batalkan', 'danger', () => handleUpdateStatus(pes.id, 'dibatalkan')));
    }
    if (pes.status === 'diproses') {
      btns.push(btn('Antar', 'primary', () => handleUpdateStatus(pes.id, 'sedang_diantar')));
      btns.push(btn('Batalkan', 'danger', () => handleUpdateStatus(pes.id, 'dibatalkan')));
    }
    if (pes.status === 'sedang_diantar') {
      btns.push(btn('Selesai', 'success', () => handleUpdateStatus(pes.id, 'selesai')));
    }

    if (pes.status_pembayaran === 'belum_dibayar' && pes.metode_pembayaran === 'tunai') {
      btns.push(btn('Lunas', 'success', () => handleUpdatePembayaran(pes.id, 'lunas')));
    }

    return btns;
  };

  if (loading) {
    return <div className="admin-page flex items-center justify-center py-20 text-slate-400 font-bold">Memuat data...</div>;
  }

  return (
    <div className="admin-page">
      <div className="admin-page__header">
        <div>
          <p className="admin-page__header-eyebrow">PANEL ADMIN</p>
          <h2 className="admin-page__header-title">Dashboard</h2>
          <p className="admin-page__header-subtitle">Ringkasan data pesanan Vipizza Homemade Padang</p>
        </div>
        <button onClick={muatPesanan} className="admin-btn-outline">
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      <div className="admin-stats-grid">
        {statCards.map(({ icon: Icon, label, value, iconBg, iconColor }) => (
          <div key={label} className="admin-stat-card windows-tile">
            <div className="admin-stat-card__body">
              <div>
                <p className="admin-stat-card__label">{label}</p>
                <p className="admin-stat-card__value">{value}</p>
              </div>
              <div className="admin-stat-card__icon-wrap" style={{ backgroundColor: iconBg }}>
                <Icon className="w-5 h-5" style={{ color: iconColor }} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="admin-table-card">
        <div className="admin-table-card__header">
          <div>
            <h3 className="admin-table-card__title">Data Pesanan Masuk</h3>
            <p className="admin-table-card__subtitle">{pesananFiltered.length} dari {pesananList.length} pesanan</p>
          </div>
          <div className="admin-table-card__actions">
            <div className="admin-search-wrap">
              <Search className="admin-search-icon" />
              <input type="text" placeholder="Cari ID atau alamat..." value={searchQ} onChange={e => setSearchQ(e.target.value)} className="admin-search-input" />
            </div>
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="admin-select">
              <option value="semua">Semua Status</option>
              {Object.entries(STATUS_CONFIG).map(([key, { label }]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>No. Pesanan</th>
                <th>Pelanggan</th>
                <th>Alamat</th>
                <th>Total</th>
                <th>Bayar</th>
                <th>Status</th>
                <th className="text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {pesananFiltered.length === 0 ? (
                <tr>
                  <td colSpan="7" className="admin-table__empty">
                    <FileSearch className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                    <p>Tidak ada pesanan ditemukan</p>
                  </td>
                </tr>
              ) : (
                pesananFiltered.map((pes) => (
                  <tr key={pes.id}>
                    <td><span className="admin-table__id">#{pes.id}</span></td>
                    <td className="text-xs font-semibold text-slate-700">{pes.nama_penerima || pes.pengguna?.nama || '-'}</td>
                    <td className="admin-table__addr text-xs">{pes.alamat_pengiriman}</td>
                    <td className="admin-table__price">Rp {(pes.total_harga || 0).toLocaleString('id-ID')}</td>
                    <td>
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase ${pes.status_pembayaran === 'lunas' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                        {pes.status_pembayaran === 'lunas' ? 'Lunas' : 'Belum'}
                      </span>
                      <span className="block text-[9px] text-slate-400 mt-0.5">
                        {pes.metode_pembayaran === 'midtrans' ? 'Midtrans' : 'Tunai'}
                      </span>
                    </td>
                    <td><StatusBadge status={pes.status} /></td>
                    <td>
                      <div className="admin-table__actions flex-wrap gap-1">
                        <button className="admin-btn-sm admin-btn-sm--outline" onClick={() => { setPesananTerpilih(pes); setModalBuka(true); }}>
                          <Eye className="w-3.5 h-3.5" /> Detail
                        </button>
                        {aksiTombol(pes)}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {modalBuka && pesananTerpilih && (
        <div className="admin-modal-overlay" onClick={() => { setModalBuka(false); setPesananTerpilih(null); }}>
          <div className="admin-modal" onClick={e => e.stopPropagation()}>
            <div className="admin-modal__header">
              <div>
                <h3 className="admin-modal__title">Detail Pesanan</h3>
                <p className="admin-modal__id">#{pesananTerpilih.id}</p>
              </div>
              <div className="flex items-center gap-3">
                <StatusBadge status={pesananTerpilih.status} />
                <button onClick={() => { setModalBuka(false); setPesananTerpilih(null); }} className="admin-modal__close">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="admin-modal__body">
              <div className="admin-modal__section">
                <p className="admin-modal__section-title">Informasi Pesanan</p>
                <div className="admin-modal__info-list">
                  <div className="admin-modal__info-row">
                    <span>Pelanggan</span>
                    <span className="font-semibold">{pesananTerpilih.nama_penerima || pesananTerpilih.pengguna?.nama || '-'}</span>
                  </div>
                  <div className="admin-modal__info-row">
                    <span>Telepon</span>
                    <span>{pesananTerpilih.telepon}</span>
                  </div>
                  <div className="admin-modal__info-row">
                    <span>Alamat</span>
                    <span className="text-xs">{pesananTerpilih.alamat_pengiriman}</span>
                  </div>
                  <div className="admin-modal__info-row">
                    <span>Metode</span>
                    <span className="font-semibold uppercase text-xs">{pesananTerpilih.metode_pembayaran}</span>
                  </div>
                  <div className="admin-modal__info-row">
                    <span>Status Bayar</span>
                    <span className={`font-semibold ${pesananTerpilih.status_pembayaran === 'lunas' ? 'text-emerald-600' : 'text-amber-600'}`}>
                      {pesananTerpilih.status_pembayaran === 'lunas' ? 'Lunas' : 'Belum Dibayar'}
                    </span>
                  </div>
                  {pesananTerpilih.catatan && (
                    <div className="admin-modal__info-row">
                      <span>Catatan</span>
                      <span className="text-xs italic">{pesananTerpilih.catatan}</span>
                    </div>
                  )}
                </div>

                <p className="admin-modal__section-title mt-4">Menu Dipesan</p>
                <div className="admin-modal__menu-list">
                  {(pesananTerpilih.item_pesanan || []).map((item, i) => (
                    <div key={i} className="admin-modal__menu-item">
                      <span>{item.menu?.nama || 'Pizza'} <span className="text-gray-400">×{item.jumlah}</span></span>
                      <span>Rp {((item.jumlah || 0) * (item.harga || 0)).toLocaleString('id-ID')}</span>
                    </div>
                  ))}
                  <div className="admin-modal__menu-total">
                    <span>Total</span>
                    <span>Rp {(pesananTerpilih.total_harga || 0).toLocaleString('id-ID')}</span>
                  </div>
                </div>

                {/* Aksi */}
                <div className="admin-modal__action-area mt-4">
                  <div className="flex gap-2 flex-wrap">
                    {pesananTerpilih.status === 'menunggu_pembayaran' && (
                      <>
                        {pesananTerpilih.metode_pembayaran !== 'midtrans' && (
                          <button className="admin-btn-success flex-1" onClick={() => handleUpdateStatus(pesananTerpilih.id, 'diproses')}>
                            <CheckCircle2 className="w-4 h-4" /> Proses Pesanan
                          </button>
                        )}
                        <button className="admin-btn-danger" onClick={() => handleUpdateStatus(pesananTerpilih.id, 'dibatalkan')}>
                          <X className="w-4 h-4" /> Batalkan
                        </button>
                      </>
                    )}
                    {pesananTerpilih.status === 'diproses' && (
                      <>
                        <button className="admin-btn-primary" onClick={() => handleUpdateStatus(pesananTerpilih.id, 'sedang_diantar')}>
                          Kirim
                        </button>
                        <button className="admin-btn-danger" onClick={() => handleUpdateStatus(pesananTerpilih.id, 'dibatalkan')}>
                          Batalkan
                        </button>
                      </>
                    )}
                    {pesananTerpilih.status === 'sedang_diantar' && (
                      <button className="admin-btn-success flex-1" onClick={() => handleUpdateStatus(pesananTerpilih.id, 'selesai')}>
                        <CheckCircle2 className="w-4 h-4" /> Selesai
                      </button>
                    )}
                    {pesananTerpilih.status_pembayaran === 'belum_dibayar' && pesananTerpilih.metode_pembayaran === 'tunai' && (
                      <button className="admin-btn-success flex-1" onClick={() => handleUpdatePembayaran(pesananTerpilih.id, 'lunas')}>
                        <Wallet className="w-4 h-4" /> Tandai Lunas
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
