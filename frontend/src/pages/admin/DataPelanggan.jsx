import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Search, Eye, X, Phone, Mail, MapPin, ShoppingBag, Edit, Trash2, Plus, ShieldCheck, Users } from 'lucide-react';
import Swal from 'sweetalert2';

export default function DataPelanggan() {
  const { token, user } = useAuth();
  const [penggunaList, setPenggunaList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQ, setSearchQ] = useState('');
  
  // Modal states
  const [detail, setDetail] = useState(null);
  const [riwayat, setRiwayat] = useState([]);
  const [modalFormBuka, setModalFormBuka] = useState(false);
  const [formMode, setFormMode] = useState('tambah'); // 'tambah' atau 'edit'
  
  const [formData, setFormData] = useState({
    id: null, nama: '', email: '', telepon: '', alamat: '', password: '', peran: 'pelanggan'
  });

  const API = 'http://localhost:9000/api';
  const headers = { 'Authorization': `Bearer ${token}` };

  const ambilData = async () => {
    try {
      const res = await fetch(`${API}/users`, { headers });
      if (res.ok) {
        const data = await res.json();
        setPenggunaList(data);
      }
    } catch (e) {
      console.warn('Gagal ambil data pengguna:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    ambilData();
  }, []);

  const lihatDetail = async (id) => {
    try {
      const res = await fetch(`${API}/users/${id}`, { headers });
      if (res.ok) {
        const data = await res.json();
        setDetail(data.pelanggan);
        setRiwayat(data.riwayat || []);
      }
    } catch (e) {
      console.warn(e);
    }
  };

  const handleBukaForm = (mode, data = null, peranDefault = 'pelanggan') => {
    setFormMode(mode);
    if (mode === 'edit' && data) {
      setFormData({
        id: data.id, nama: data.nama, email: data.email, telepon: data.telepon, 
        alamat: data.alamat, password: '', peran: data.peran
      });
    } else {
      setFormData({
        id: null, nama: '', email: '', telepon: '', alamat: '', password: '', peran: peranDefault
      });
    }
    setModalFormBuka(true);
  };

  const handleSubmitForm = async (e) => {
    e.preventDefault();
    try {
      if (formMode === 'tambah') {
        const res = await fetch(`${API}/users?peran=${formData.peran}`, {
          method: 'POST',
          headers: { ...headers, 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
        if (res.ok) {
          Swal.fire('Berhasil!', `Data ${formData.peran} berhasil ditambahkan.`, 'success');
          setModalFormBuka(false);
          ambilData();
        } else {
          const err = await res.json();
          Swal.fire('Gagal!', err.error || 'Gagal menambahkan data.', 'error');
        }
      } else {
        const res = await fetch(`${API}/users/${formData.id}`, {
          method: 'PUT',
          headers: { ...headers, 'Content-Type': 'application/json' },
          body: JSON.stringify({ nama: formData.nama, telepon: formData.telepon, alamat: formData.alamat })
        });
        if (res.ok) {
          Swal.fire('Berhasil!', 'Data berhasil diperbarui.', 'success');
          setModalFormBuka(false);
          ambilData();
        }
      }
    } catch (err) {
      Swal.fire('Error', 'Terjadi kesalahan jaringan.', 'error');
    }
  };

  const handleDelete = async (id, nama) => {
    if (id === user?.id) {
      Swal.fire('Akses Ditolak', 'Anda tidak dapat menghapus akun Anda sendiri yang sedang login.', 'warning');
      return;
    }
    Swal.fire({
      title: 'Hapus Pengguna?',
      text: `Apakah Anda yakin ingin menghapus ${nama}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Ya, Hapus!'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await fetch(`${API}/users/${id}`, {
            method: 'DELETE', headers
          });
          if (res.ok) {
            Swal.fire('Terhapus!', 'Pengguna telah dihapus.', 'success');
            ambilData();
          }
        } catch (e) {
          Swal.fire('Gagal', 'Gagal menghapus pengguna.', 'error');
        }
      }
    });
  };

  const filteredData = penggunaList.filter(p =>
    p.nama?.toLowerCase().includes(searchQ.toLowerCase()) ||
    p.email?.toLowerCase().includes(searchQ.toLowerCase())
  );

  const adminList = filteredData.filter(p => p.peran === 'admin');
  const customerList = filteredData.filter(p => p.peran === 'pelanggan');

  const formatRp = (v) => `Rp ${(v || 0).toLocaleString('id-ID')}`;

  const renderTable = (data, judul, icon, tipePeran) => (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-4 bg-gray-50 p-3 border border-gray-200 rounded-t">
        <h2 className="font-bold text-gray-700 flex items-center gap-2">
          {icon} Daftar {judul}
        </h2>
        <button 
          onClick={() => handleBukaForm('tambah', null, tipePeran)} 
          className="bg-[#0b5345] hover:bg-[#083c32] text-white px-3 py-1.5 rounded text-sm font-semibold flex items-center gap-1 transition-colors"
        >
          <Plus className="w-4 h-4" /> Tambah {judul}
        </button>
      </div>
      <div className="bg-white border-x border-b border-gray-300 rounded-b overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-white border-b border-gray-300">
              <tr>
                <th className="py-3 px-4 font-semibold text-gray-700 w-12 text-center">NO</th>
                <th className="py-3 px-4 font-semibold text-gray-700">NAMA</th>
                <th className="py-3 px-4 font-semibold text-gray-700">EMAIL</th>
                <th className="py-3 px-4 font-semibold text-gray-700 text-center">ROLE</th>
                <th className="py-3 px-4 font-semibold text-gray-700 text-center w-40">AKSI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr><td colSpan="5" className="text-center py-4 text-gray-500">Memuat data...</td></tr>
              ) : data.length === 0 ? (
                <tr><td colSpan="5" className="text-center py-4 text-gray-500">Tidak ada {judul.toLowerCase()}.</td></tr>
              ) : (
                data.map((p, i) => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="py-3 px-4 text-center font-medium text-gray-600">{i + 1}</td>
                    <td className="py-3 px-4 font-medium text-gray-800">{p.nama}</td>
                    <td className="py-3 px-4 text-gray-600">{p.email}</td>
                    <td className="py-3 px-4 text-center">
                      <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider text-white ${p.peran === 'admin' ? 'bg-blue-500' : 'bg-indigo-500'}`}>
                        {p.peran}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex justify-center gap-1.5">
                        {p.peran === 'pelanggan' && (
                          <button onClick={() => lihatDetail(p.id)} className="p-1.5 border border-blue-200 text-blue-600 rounded hover:bg-blue-50" title="Detail Riwayat">
                            <Eye className="w-4 h-4" />
                          </button>
                        )}
                        <button onClick={() => handleBukaForm('edit', p, p.peran)} className="p-1.5 border border-yellow-300 text-yellow-600 rounded hover:bg-yellow-50" title="Edit Profil">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(p.id, p.nama)} className="p-1.5 border border-red-300 text-red-500 rounded hover:bg-red-50" title="Hapus">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-bold text-gray-800 uppercase tracking-wider">Manajemen User</h1>
        <div className="relative w-64">
          <input type="text" placeholder="Search..." value={searchQ} onChange={(e) => setSearchQ(e.target.value)} className="w-full border border-gray-300 rounded pl-3 pr-8 py-2 text-sm outline-none focus:border-[#0b5345]" />
          <Search className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        </div>
      </div>

      {renderTable(adminList, 'Admin', <ShieldCheck className="w-5 h-5 text-blue-600"/>, 'admin')}
      {renderTable(customerList, 'Customer', <Users className="w-5 h-5 text-indigo-600"/>, 'pelanggan')}

      {/* Modal Form Tambah/Edit */}
      {modalFormBuka && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-lg w-full max-w-md p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-4 pb-3 border-b border-gray-200">
              <h3 className="font-bold text-lg text-gray-800">
                {formMode === 'tambah' ? `Tambah ${formData.peran === 'admin' ? 'Admin' : 'Customer'}` : 'Edit Profil Pengguna'}
              </h3>
              <button onClick={() => setModalFormBuka(false)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmitForm} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Nama Lengkap</label>
                <input required type="text" value={formData.nama} onChange={e => setFormData({...formData, nama: e.target.value})} className="w-full border border-gray-300 rounded px-3 py-2 text-sm outline-none focus:border-brand-orange" />
              </div>
              {formMode === 'tambah' && (
                <>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
                    <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full border border-gray-300 rounded px-3 py-2 text-sm outline-none focus:border-brand-orange" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Password</label>
                    <input required minLength={6} type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full border border-gray-300 rounded px-3 py-2 text-sm outline-none focus:border-brand-orange" />
                  </div>
                </>
              )}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">No. Telepon</label>
                <input required type="text" value={formData.telepon} onChange={e => setFormData({...formData, telepon: e.target.value})} className="w-full border border-gray-300 rounded px-3 py-2 text-sm outline-none focus:border-brand-orange" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Alamat</label>
                <textarea required rows={2} value={formData.alamat} onChange={e => setFormData({...formData, alamat: e.target.value})} className="w-full border border-gray-300 rounded px-3 py-2 text-sm outline-none focus:border-brand-orange"></textarea>
              </div>
              <div className="pt-3">
                <button type="submit" className="w-full bg-[#0b5345] text-white py-2 rounded font-bold hover:bg-[#083c32] transition-colors">
                  {formMode === 'tambah' ? 'Simpan Data' : 'Update Profil'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Detail */}
      {detail && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setDetail(null)}>
          <div className="bg-white rounded-xl w-full max-w-lg p-6 shadow-xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-gray-800 flex items-center gap-2">
                <Phone className="w-4 h-4 text-brand-orange" /> Detail Customer
              </h3>
              <button onClick={() => setDetail(null)} className="p-1 hover:bg-gray-100 rounded"><X className="w-5 h-5" /></button>
            </div>
            
            <div className="flex items-center gap-3 mb-4 p-3 bg-gray-50 rounded-lg">
              <div className="w-12 h-12 rounded-full bg-brand-orange text-white flex items-center justify-center text-lg font-bold">
                {detail.nama?.[0]?.toUpperCase() || '?'}
              </div>
              <div>
                <p className="font-bold text-gray-800">{detail.nama}</p>
                <p className="text-xs text-gray-500">{detail.email}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-2 text-sm mb-4">
              <div className="flex items-center gap-2"><Phone className="w-4 h-4 text-gray-400" /> <span>{detail.telepon || '-'}</span></div>
              <div className="flex items-center gap-2"><Mail className="w-4 h-4 text-gray-400" /> <span>{detail.email}</span></div>
              <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-gray-400" /> <span>{detail.alamat || '-'}</span></div>
            </div>

            {/* Riwayat Transaksi */}
            <div>
              <h4 className="font-bold text-gray-700 text-sm flex items-center gap-1.5 mb-3">
                <ShoppingBag className="w-4 h-4 text-brand-orange" /> Riwayat Transaksi ({riwayat.length})
              </h4>
              {riwayat.length === 0 ? (
                <p className="text-xs text-gray-400">Belum ada transaksi.</p>
              ) : (
                <div className="flex flex-col gap-2">
                  {riwayat.map((r) => (
                    <div key={r.id} className="border border-gray-200 rounded-lg p-3 text-xs">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-gray-700">#{r.id}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${r.status === 'selesai' ? 'bg-green-50 text-green-700' : r.status === 'diproses' ? 'bg-blue-50 text-blue-700' : r.status === 'dikirim' ? 'bg-purple-50 text-purple-700' : 'bg-yellow-50 text-yellow-700'}`}>{r.status}</span>
                      </div>
                      <div className="flex justify-between mt-1 text-gray-500">
                        <span>{new Date(r.tanggal_pesanan || r.created_at).toLocaleDateString('id-ID')}</span>
                        <span className="font-bold text-gray-700">{formatRp(r.total_harga)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
