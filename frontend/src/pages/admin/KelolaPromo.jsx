import React, { useState, useEffect } from 'react';
import { Plus, Edit3, Trash2, Save, Tag } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function KelolaPromo() {
  const { token } = useAuth();
  const [promos, setPromos] = useState([]);
  const [formBuka, setFormBuka] = useState(false);
  const [promoTerpilih, setPromoTerpilih] = useState(null);
  const [loading, setLoading] = useState(false);

  // Form state
  const [judul, setJudul] = useState('');
  const [deskripsi, setDeskripsi] = useState('');
  const [diskon, setDiskon] = useState('');
  const [kodePromo, setKodePromo] = useState('');
  const [tanggalMulai, setTanggalMulai] = useState('');
  const [tanggalAkhir, setTanggalAkhir] = useState('');
  const [aktif, setAktif] = useState(true);
  const [fileObj, setFileObj] = useState(null);
  const [previewBanner, setPreviewBanner] = useState('');

  useEffect(() => { muatPromo(); }, []);

  const muatPromo = () => {
    fetch('http://localhost:8080/api/promo/admin', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => { if (!res.ok) throw new Error(); return res.json(); })
      .then(data => { if (Array.isArray(data)) setPromos(data); })
      .catch(() => alert('Gagal memuat promo. Pastikan backend berjalan.'));
  };

  const handleBukaTambah = () => {
    setPromoTerpilih(null);
    setJudul(''); setDeskripsi(''); setDiskon(''); setKodePromo('');
    setTanggalMulai(''); setTanggalAkhir(''); setAktif(true);
    setFileObj(null); setPreviewBanner('');
    setFormBuka(true);
  };

  const handleBukaEdit = (promo) => {
    setPromoTerpilih(promo);
    setJudul(promo.judul);
    setDeskripsi(promo.deskripsi || '');
    setDiskon(promo.diskon?.toString() || '0');
    setKodePromo(promo.kode_promo || '');
    setTanggalMulai(promo.tanggal_mulai?.split('T')[0] || '');
    setTanggalAkhir(promo.tanggal_akhir?.split('T')[0] || '');
    setAktif(promo.aktif);
    setFileObj(null);
    setPreviewBanner(promo.banner_url ? `http://localhost:8080${promo.banner_url}` : '');
    setFormBuka(true);
  };

  const handleSimpan = async (e) => {
    e.preventDefault();
    if (!judul || !tanggalAkhir) { alert('Judul dan Tanggal Akhir wajib diisi!'); return; }
    setLoading(true);

    const formData = new FormData();
    formData.append('judul', judul);
    formData.append('deskripsi', deskripsi);
    formData.append('diskon', diskon || '0');
    formData.append('kode_promo', kodePromo);
    formData.append('tanggal_mulai', tanggalMulai || new Date().toISOString().split('T')[0]);
    formData.append('tanggal_akhir', tanggalAkhir);
    formData.append('aktif', aktif ? 'true' : 'false');
    if (fileObj) formData.append('banner', fileObj);

    const url = promoTerpilih
      ? `http://localhost:8080/api/promo/${promoTerpilih.id}`
      : 'http://localhost:8080/api/promo';
    const method = promoTerpilih ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      if (!res.ok) throw new Error(await res.text());
      alert(promoTerpilih ? 'Promo berhasil diperbarui!' : 'Promo berhasil ditambahkan!');
      muatPromo();
      setFormBuka(false);
    } catch (err) {
      alert('Gagal menyimpan promo: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleHapus = (id) => {
    if (!window.confirm('Hapus promo ini secara permanen?')) return;
    fetch(`http://localhost:8080/api/promo/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => { if (!res.ok) throw new Error(); return res.json(); })
      .then(() => { alert('Promo berhasil dihapus!'); muatPromo(); })
      .catch(() => alert('Gagal menghapus promo.'));
  };

  const formatTanggal = (tgl) => {
    if (!tgl) return '-';
    return new Date(tgl).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });
  };

  if (formBuka) {
    return (
      <div className="max-w-2xl mx-auto text-left">
        <div className="card-bs">
          <div className="px-6 py-4 border-b border-[#dee2e6]">
            <h2 className="text-[#212529] text-lg font-bold">
              {promoTerpilih ? 'Edit Promo' : 'Tambah Promo Baru'}
            </h2>
          </div>
          <div className="p-6">
            <form onSubmit={handleSimpan} className="flex flex-col gap-4">

              <div>
                <label className="text-sm font-medium text-[#212529] block mb-1">Judul Promo *</label>
                <input type="text" value={judul} onChange={e => setJudul(e.target.value)}
                  placeholder="Contoh: Promo Akhir Tahun - Diskon 20%"
                  className="input-bs" required />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-[#212529] block mb-1">Diskon (%)</label>
                  <input type="number" min="0" max="100" value={diskon}
                    onChange={e => setDiskon(e.target.value)} placeholder="0"
                    className="input-bs" />
                </div>
                <div>
                  <label className="text-sm font-medium text-[#212529] block mb-1">Kode Promo</label>
                  <input type="text" value={kodePromo} onChange={e => setKodePromo(e.target.value)}
                    placeholder="Contoh: PIZZA20"
                    className="input-bs uppercase" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-[#212529] block mb-1">Tanggal Mulai</label>
                  <input type="date" value={tanggalMulai} onChange={e => setTanggalMulai(e.target.value)}
                    className="input-bs" />
                </div>
                <div>
                  <label className="text-sm font-medium text-[#212529] block mb-1">Tanggal Akhir *</label>
                  <input type="date" value={tanggalAkhir} onChange={e => setTanggalAkhir(e.target.value)}
                    className="input-bs" required />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-[#212529] block mb-1">Deskripsi Promo</label>
                <textarea value={deskripsi} onChange={e => setDeskripsi(e.target.value)}
                  rows={3} placeholder="Syarat dan ketentuan promo..."
                  className="input-bs resize-none" />
              </div>

              <div>
                <label className="text-sm font-medium text-[#212529] block mb-1">Banner Promo (Gambar)</label>
                <input type="file" accept="image/*"
                  onChange={e => {
                    const f = e.target.files[0];
                    if (f) {
                      setFileObj(f);
                      const reader = new FileReader();
                      reader.onloadend = () => setPreviewBanner(reader.result);
                      reader.readAsDataURL(f);
                    }
                  }}
                  className="input-bs" />
                {previewBanner && (
                  <img src={previewBanner} alt="Preview Banner"
                    className="mt-2 rounded h-24 object-cover border border-[#dee2e6]" />
                )}
              </div>

              <div className="flex items-center gap-3">
                <input type="checkbox" id="aktifChk" checked={aktif} onChange={e => setAktif(e.target.checked)}
                  className="w-4 h-4 accent-[#0b5345]" />
                <label htmlFor="aktifChk" className="text-sm font-medium text-[#212529]">
                  Promo Aktif (tampil di halaman publik)
                </label>
              </div>

              <div className="flex gap-3 justify-end pt-2">
                <button type="button" onClick={() => setFormBuka(false)} className="btn-secondary text-sm">
                  Kembali
                </button>
                <button type="submit" disabled={loading} className="btn-blue text-sm flex items-center gap-2">
                  <Save className="w-4 h-4" />
                  {loading ? 'Menyimpan...' : 'Simpan Promo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="text-left">
      <div className="flex justify-between items-center mb-5">
        <div>
          <p className="text-[#0b5345] font-semibold text-xs uppercase tracking-wider">Kelola Data</p>
          <h2 className="page-title mt-1">Data Promo</h2>
        </div>
        <button className="btn-primary text-sm py-2 px-4 flex items-center gap-2" onClick={handleBukaTambah}>
          <Plus className="w-4 h-4" /> Tambah Promo
        </button>
      </div>

      {promos.length === 0 ? (
        <div className="card-bs text-center py-16">
          <Tag className="w-10 h-10 text-[#adb5bd] mx-auto mb-3" />
          <p className="text-[#6c757d] text-sm font-medium">Belum ada promo.</p>
          <p className="text-[#adb5bd] text-xs mt-1">Klik "Tambah Promo" untuk membuat promo pertama.</p>
        </div>
      ) : (
        <div className="card-bs overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="table-bs">
              <thead>
                <tr>
                  <th>Promo</th>
                  <th>Diskon</th>
                  <th>Kode</th>
                  <th>Berlaku</th>
                  <th>Status</th>
                  <th className="text-center">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {promos.map(promo => (
                  <tr key={promo.id}>
                    <td>
                      <div className="flex items-center gap-3">
                        {promo.banner_url ? (
                          <div className="w-12 h-12 rounded overflow-hidden border border-[#dee2e6] shrink-0">
                            <img src={`http://localhost:8080${promo.banner_url}`} alt={promo.judul}
                              className="w-full h-full object-cover" />
                          </div>
                        ) : (
                          <div className="w-12 h-12 rounded bg-[#e8f5f2] flex items-center justify-center shrink-0">
                            <Tag className="w-5 h-5 text-[#0b5345]" />
                          </div>
                        )}
                        <div>
                          <span className="font-semibold text-[#212529] text-sm block">{promo.judul}</span>
                          <span className="text-[11px] text-[#6c757d] line-clamp-1">{promo.deskripsi}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      {promo.diskon > 0 ? (
                        <span className="bg-red-100 text-red-700 text-xs font-bold px-2 py-1 rounded">
                          {promo.diskon}%
                        </span>
                      ) : <span className="text-[#6c757d] text-xs">-</span>}
                    </td>
                    <td>
                      {promo.kode_promo ? (
                        <code className="bg-[#f8f9fa] border border-[#dee2e6] text-[#0b5345] text-xs px-2 py-1 rounded font-mono font-bold">
                          {promo.kode_promo}
                        </code>
                      ) : <span className="text-[#6c757d] text-xs">-</span>}
                    </td>
                    <td className="text-xs text-[#6c757d]">
                      <span>{formatTanggal(promo.tanggal_mulai)}</span>
                      <br />
                      <span className="text-[#0b5345] font-medium">s/d {formatTanggal(promo.tanggal_akhir)}</span>
                    </td>
                    <td>
                      {promo.aktif ? (
                        <span className="bg-emerald-100 text-emerald-700 text-[11px] font-semibold px-2 py-0.5 rounded">Aktif</span>
                      ) : (
                        <span className="bg-gray-100 text-gray-500 text-[11px] font-semibold px-2 py-0.5 rounded">Nonaktif</span>
                      )}
                    </td>
                    <td>
                      <div className="flex justify-center gap-2">
                        <button className="btn-blue text-xs py-1 px-2.5 flex items-center gap-1"
                          onClick={() => handleBukaEdit(promo)}>
                          <Edit3 className="w-3.5 h-3.5" /> Edit
                        </button>
                        <button
                          className="bg-red-500 hover:bg-red-600 text-white text-xs py-1 px-2.5 rounded flex items-center gap-1"
                          onClick={() => handleHapus(promo.id)}>
                          <Trash2 className="w-3.5 h-3.5" /> Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
