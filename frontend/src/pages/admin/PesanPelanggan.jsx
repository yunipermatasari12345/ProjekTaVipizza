import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { MessageSquare, CheckCircle2, Clock, Send, RefreshCw, Search, User, X } from 'lucide-react';
import Swal from 'sweetalert2';

export default function PesanPelanggan() {
  const { token } = useAuth();
  const [pesanList, setPesanList]   = useState([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState('');
  const [filter, setFilter]         = useState('semua'); // 'semua' | 'belum' | 'sudah'
  const [modalBalas, setModalBalas] = useState(null);  // pesan yang sedang dibalas
  const [balasanText, setBalasanText] = useState('');
  const [mengirim, setMengirim]     = useState(false);

  const headers = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };

  const muatPesan = async (isAutoRefresh = false) => {
    if (!isAutoRefresh) setLoading(true);
    try {
      const res = await fetch('https://optimum-setting-incidence-barn.trycloudflare.com/api/pesan-pelanggan', { headers });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setPesanList(data);
          // Sinkronisasi ke localStorage sebagai backup
          localStorage.setItem('vipizza_pesan_kontak', JSON.stringify(data));
          setLoading(false);
          return;
        }
      }
    } catch { /* fallback localStorage */ }

    // Fallback: baca dari localStorage
    const local = JSON.parse(localStorage.getItem('vipizza_pesan_kontak') || '[]');
    setPesanList(local);
    setLoading(false);
  };

  useEffect(() => { 
    muatPesan(); 
    const interval = setInterval(() => {
      muatPesan(true);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleBalas = async () => {
    if (!balasanText.trim()) {
      Swal.fire({ icon: 'warning', title: 'Perhatian', text: 'Balasan tidak boleh kosong!' });
      return;
    }

    setMengirim(true);
    const pesanId = modalBalas.id;

    // Coba kirim ke backend
    let berhasil = false;
    try {
      const res = await fetch(`https://optimum-setting-incidence-barn.trycloudflare.com/api/pesan-pelanggan/${pesanId}/balas`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ balasan: balasanText }),
      });
      berhasil = res.ok;
    } catch { /* fallback localStorage */ }

    // Update localStorage
    const semuaPesan = JSON.parse(localStorage.getItem('vipizza_pesan_kontak') || '[]');
    const updated = semuaPesan.map(p =>
      p.id === pesanId ? { ...p, balasan: balasanText, waktu_balas: new Date().toISOString() } : p
    );
    localStorage.setItem('vipizza_pesan_kontak', JSON.stringify(updated));

    setMengirim(false);
    setModalBalas(null);
    setBalasanText('');
    Swal.fire({
      icon: 'success', title: 'Balasan Terkirim!',
      text: 'Pelanggan akan melihat balasan Anda.',
      timer: 2000, showConfirmButton: false,
    });
    muatPesan();
  };

  const handleHapus = (id) => {
    Swal.fire({
      title: 'Hapus pesan ini?',
      text: 'Data pesan akan dihapus permanen.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#aaa',
      confirmButtonText: 'Ya, hapus!',
      cancelButtonText: 'Batal',
    }).then(async (result) => {
      if (!result.isConfirmed) return;

      try {
        await fetch(`https://optimum-setting-incidence-barn.trycloudflare.com/api/pesan-pelanggan/${id}`, { method: 'DELETE', headers });
      } catch { /* ignore */ }

      const lokal = JSON.parse(localStorage.getItem('vipizza_pesan_kontak') || '[]');
      const filtered = lokal.filter(p => p.id !== id);
      localStorage.setItem('vipizza_pesan_kontak', JSON.stringify(filtered));

      Swal.fire({ icon: 'success', title: 'Terhapus!', timer: 1500, showConfirmButton: false });
      muatPesan();
    });
  };

  const filtered = pesanList.filter(p => {
    const cocokSearch = p.nama?.toLowerCase().includes(search.toLowerCase()) ||
                        p.email?.toLowerCase().includes(search.toLowerCase()) ||
                        p.pertanyaan?.toLowerCase().includes(search.toLowerCase());
    const cocokFilter = filter === 'semua' || (filter === 'belum' && !p.balasan) || (filter === 'sudah' && !!p.balasan);
    return cocokSearch && cocokFilter;
  });

  const belumDibalasCnt = pesanList.filter(p => !p.balasan).length;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-lg font-bold text-gray-800 uppercase flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-blue-600" />
            Pesan Pelanggan
          </h1>
          {belumDibalasCnt > 0 && (
            <p className="text-xs text-amber-600 font-semibold mt-0.5">
              ⚠️ {belumDibalasCnt} pesan belum dibalas
            </p>
          )}
        </div>
        <button onClick={muatPesan} className="border border-gray-300 rounded px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-100 flex items-center gap-1.5">
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </div>

      {/* Filter & Search */}
      <div className="flex flex-wrap gap-3 items-center mb-5">
        <div className="relative w-56">
          <input
            type="text"
            placeholder="Cari nama, email, pertanyaan..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full border border-gray-300 rounded pl-3 pr-8 py-1.5 text-sm outline-none focus:border-blue-400"
          />
          <Search className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        </div>
        <div className="flex gap-1">
          {[
            { val: 'semua', label: `Semua (${pesanList.length})` },
            { val: 'belum', label: `Belum Dibalas (${belumDibalasCnt})` },
            { val: 'sudah', label: `Sudah Dibalas (${pesanList.length - belumDibalasCnt})` },
          ].map(({ val, label }) => (
            <button key={val} onClick={() => setFilter(val)}
              className={`text-[10px] font-bold px-2.5 py-1.5 rounded border transition-colors ${filter === val ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-300 hover:border-gray-400'}`}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* List Pesan */}
      {loading ? (
        <div className="text-center py-12 text-gray-400">Memuat pesan...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 flex flex-col items-center gap-3">
          <MessageSquare className="w-12 h-12 text-gray-200" />
          <p className="text-gray-400 font-semibold">Belum ada pesan dari pelanggan.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {filtered.map((pesan) => (
            <div key={pesan.id}
              className={`bg-white border rounded-xl shadow-sm p-5 flex flex-col gap-3 ${!pesan.balasan ? 'border-l-4 border-l-amber-400' : 'border-l-4 border-l-emerald-400'}`}>

              {/* Header Pesan */}
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                    <User className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-800 text-sm">{pesan.nama}</p>
                    <p className="text-xs text-gray-400">{pesan.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${!pesan.balasan ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                    {!pesan.balasan ? '⏳ Belum Dibalas' : '✅ Sudah Dibalas'}
                  </span>
                  <span className="text-[10px] text-gray-400 flex items-center gap-0.5">
                    <Clock className="w-3 h-3" />
                    {pesan.waktu ? new Date(pesan.waktu).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-'}
                  </span>
                </div>
              </div>

              {/* Isi Pertanyaan */}
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs font-bold text-gray-500 uppercase mb-1">Pertanyaan:</p>
                <p className="text-sm text-gray-800 leading-relaxed">{pesan.pertanyaan}</p>
              </div>

              {/* Balasan (jika ada) */}
              {pesan.balasan && (
                <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-3 flex gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[10px] font-bold text-emerald-700 mb-0.5">Balasan Admin:</p>
                    <p className="text-sm text-gray-700 leading-relaxed">{pesan.balasan}</p>
                    {pesan.waktu_balas && (
                      <p className="text-[10px] text-gray-400 mt-1">
                        {new Date(pesan.waktu_balas).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Tombol Aksi */}
              <div className="flex gap-2 justify-end">
                {!pesan.balasan && (
                  <button onClick={() => { setModalBalas(pesan); setBalasanText(''); }}
                    className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors">
                    <Send className="w-3.5 h-3.5" /> Balas
                  </button>
                )}
                {pesan.balasan && (
                  <button onClick={() => { setModalBalas(pesan); setBalasanText(pesan.balasan); }}
                    className="flex items-center gap-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold px-4 py-2 rounded-lg transition-colors">
                    Edit Balasan
                  </button>
                )}
                <button onClick={() => handleHapus(pesan.id)}
                  className="flex items-center gap-1.5 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold px-4 py-2 rounded-lg transition-colors">
                  Hapus
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Balas */}
      {modalBalas && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setModalBalas(null)}>
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-gray-800 flex items-center gap-2">
                <Send className="w-4 h-4 text-blue-600" /> Balas Pertanyaan
              </h3>
              <button onClick={() => setModalBalas(null)} className="p-1 hover:bg-gray-100 rounded">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-gray-50 rounded-lg p-3 mb-4">
              <p className="text-[10px] font-bold text-gray-500 mb-1">Pertanyaan dari {modalBalas.nama}:</p>
              <p className="text-sm text-gray-700">{modalBalas.pertanyaan}</p>
            </div>

            <div className="mb-4">
              <label className="text-sm font-semibold text-gray-700 block mb-1">Balasan Anda:</label>
              <textarea
                value={balasanText}
                onChange={e => setBalasanText(e.target.value)}
                rows={4}
                className="w-full border border-gray-300 rounded-lg p-3 text-sm outline-none focus:border-blue-400 resize-none"
                placeholder="Tulis balasan Anda di sini..."
              />
            </div>

            <div className="flex gap-2 justify-end">
              <button onClick={() => setModalBalas(null)}
                className="border border-gray-300 text-gray-600 text-sm font-semibold px-4 py-2 rounded-lg hover:bg-gray-50">
                Batal
              </button>
              <button onClick={handleBalas} disabled={mengirim}
                className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold px-5 py-2 rounded-lg transition-colors disabled:opacity-60">
                <Send className="w-4 h-4" />
                {mengirim ? 'Mengirim...' : 'Kirim Balasan'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
