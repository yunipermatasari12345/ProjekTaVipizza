import React, { useState, useEffect } from 'react';
import { Plus, Edit3, Trash2, Save, Star, TrendingUp } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Swal from 'sweetalert2';
import { getImageUrl } from '../../utils/imageUrl';

export default function ManageMenu() {
  const { token } = useAuth();
  const [menus, setMenus] = useState([]);
  const [formBuka, setFormBuka] = useState(false);
  const [menuTerpilih, setMenuTerpilih] = useState(null);

  // Form State
  const [nama, setNama] = useState('');
  const [deskripsi, setDeskripsi] = useState('');
  const [harga, setHarga] = useState('');
  const [hargaMedium, setHargaMedium] = useState('');
  const [hargaLarge, setHargaLarge] = useState('');
  const [stok, setStok] = useState('');
  const [kategori, setKategori] = useState('pizza');
  const [gambarUrl, setGambarUrl] = useState('');
  const [fileObj, setFileObj] = useState(null);
  const [isFavorit, setIsFavorit] = useState(false);
  const [isBestSeller, setIsBestSeller] = useState(false);

  useEffect(() => { muatMenu(); }, []);

  const muatMenu = () => {
    fetch('https://8a49cf3c307c57.lhr.life/api/menus')
      .then(res => {
        if (!res.ok) throw new Error('Gagal load API');
        return res.json();
      })
      .then(data => {
        if (data && Array.isArray(data)) setMenus(data);
      })
      .catch(() => {
        Swal.fire({ icon: 'error', title: 'Oops', text: 'Gagal memuat data menu. Pastikan backend berjalan.' });
      });
  };

  const resetForm = () => {
    setMenuTerpilih(null);
    setNama(''); setDeskripsi(''); setHarga('');
    setHargaMedium(''); setHargaLarge(''); setStok('');
    setKategori('pizza'); setGambarUrl(''); setFileObj(null);
    setIsFavorit(false); setIsBestSeller(false);
  };

  const handleBukaTambah = () => { resetForm(); setFormBuka(true); };

  const handleBukaEdit = (menu) => {
    setMenuTerpilih(menu);
    setNama(menu.nama);
    setDeskripsi(menu.deskripsi);
    setHarga(menu.harga.toString());
    setHargaMedium((menu.harga_medium || menu.harga).toString());
    setHargaLarge((menu.harga_large || menu.harga_medium + 15000 || menu.harga + 15000).toString());
    setStok(menu.stok.toString());
    setKategori(menu.kategori);
    setGambarUrl(getImageUrl(menu.gambar_url));
    setFileObj(null);
    setIsFavorit(menu.is_favorit || false);
    setIsBestSeller(menu.is_best_seller || false);
    setFormBuka(true);
  };

  const handleTutupForm = () => { setFormBuka(false); resetForm(); };

  const handleSimpanMenu = (e) => {
    e.preventDefault();

    if (!nama || !harga || !stok) {
      Swal.fire({ icon: 'warning', title: 'Perhatian', text: 'Mohon isi seluruh field wajib!' });
      return;
    }

    const hargaMediumInt = parseInt(hargaMedium) || 35000;
    const hargaLargeInt  = parseInt(hargaLarge) || hargaMediumInt + 15000;
    const stokInt        = parseInt(stok);

    const formData = new FormData();
    formData.append('nama', nama);
    formData.append('deskripsi', deskripsi);
    // Set `harga` using `hargaMediumInt` to satisfy the database model constraint.
    formData.append('harga', hargaMediumInt.toString());
    formData.append('harga_medium', hargaMediumInt.toString());
    formData.append('harga_large', hargaLargeInt.toString());
    formData.append('stok', stokInt.toString());
    formData.append('kategori', kategori);
    formData.append('is_favorit', isFavorit.toString());
    formData.append('is_best_seller', isBestSeller.toString());
    if (fileObj) formData.append('gambar', fileObj);

    const apiURL    = menuTerpilih ? `https://8a49cf3c307c57.lhr.life/api/menus/${menuTerpilih.id}` : 'https://8a49cf3c307c57.lhr.life/api/menus';
    const apiMethod = menuTerpilih ? 'PUT' : 'POST';

    fetch(apiURL, {
      method: apiMethod,
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    })
      .then(res => { if (!res.ok) throw new Error('Gagal menyimpan'); return res.json(); })
      .then(() => {
        Swal.fire({ icon: 'success', title: 'Berhasil', text: menuTerpilih ? 'Menu berhasil diperbarui!' : 'Menu baru berhasil ditambahkan!', timer: 2000, showConfirmButton: false });
        muatMenu();
        handleTutupForm();
      })
      .catch(err => {
        Swal.fire({ icon: 'error', title: 'Gagal', text: 'Gagal menyimpan menu: ' + err.message });
      });
  };

  const handleHapusMenu = (id) => {
    Swal.fire({
      title: 'Apakah kamu yakin?',
      text: 'Data menu ini akan dihapus secara permanen!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Ya, Hapus!'
    }).then((result) => {
      if (result.isConfirmed) {
        fetch(`https://8a49cf3c307c57.lhr.life/api/menus/${id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        })
          .then(res => { if (!res.ok) throw new Error('Gagal menghapus'); return res.json(); })
          .then(() => {
            Swal.fire({ icon: 'success', title: 'Dihapus!', text: 'Menu berhasil dihapus.', timer: 1500, showConfirmButton: false });
            muatMenu();
          })
          .catch(err => {
            Swal.fire({ icon: 'error', title: 'Gagal', text: 'Gagal menghapus menu: ' + err.message });
          });
      }
    });
  };

  // ================= FORM TAMBAH/EDIT =================
  if (formBuka) {
    return (
      <div className="max-w-3xl text-left">
        <div className="card-bs">
          <div className="px-6 py-4 border-b border-[#dee2e6]">
            <h2 className="text-[#212529] text-lg font-bold">
              {menuTerpilih ? 'Edit Menu Pizza' : 'Tambah Menu Pizza'}
            </h2>
          </div>

          <div className="p-6">
            <form onSubmit={handleSimpanMenu} className="flex flex-col gap-4">

              <div>
                <label className="text-sm font-medium text-[#212529] block mb-1">Nama Menu</label>
                <input type="text" value={nama} onChange={(e) => setNama(e.target.value)} className="input-bs" required />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-[#212529] block mb-1">Harga Medium (Rp)</label>
                  <input type="number" value={hargaMedium} onChange={(e) => setHargaMedium(e.target.value)} placeholder={harga || '35000'} className="input-bs" />
                </div>
                <div>
                  <label className="text-sm font-medium text-[#212529] block mb-1">Harga Large (Rp)</label>
                  <input type="number" value={hargaLarge} onChange={(e) => setHargaLarge(e.target.value)} placeholder={hargaMedium ? (parseInt(hargaMedium) + 15000).toString() : '50000'} className="input-bs" />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-[#212529] block mb-1">Stok</label>
                <input type="number" value={stok} onChange={(e) => setStok(e.target.value)} className="input-bs" required />
              </div>

              <div>
                <label className="text-sm font-medium text-[#212529] block mb-1">Gambar Menu</label>
                <div className="flex gap-3">
                  <input
                    type="text"
                    placeholder="URL gambar..."
                    value={gambarUrl}
                    onChange={(e) => setGambarUrl(e.target.value)}
                    className="input-bs flex-1"
                  />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        setFileObj(file);
                        const reader = new FileReader();
                        reader.onloadend = () => setGambarUrl(reader.result);
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="input-bs w-auto"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-[#212529] block mb-1">Deskripsi</label>
                <textarea value={deskripsi} onChange={(e) => setDeskripsi(e.target.value)} rows={3} className="input-bs resize-none" />
              </div>

              {/* ===== OPSI TAMPILAN MENU ===== */}
              <div className="border border-[#dee2e6] rounded-lg p-4 bg-[#f8f9fa]">
                <p className="text-sm font-semibold text-[#212529] mb-3">⚙️ Opsi Tampilan di Dashboard Pelanggan</p>
                <div className="flex flex-col gap-3">

                  {/* Checkbox Menu Favorit */}
                  <label className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${isFavorit ? 'border-amber-400 bg-amber-50' : 'border-[#dee2e6] bg-white hover:border-amber-200'}`}>
                    <input
                      type="checkbox"
                      checked={isFavorit}
                      onChange={(e) => setIsFavorit(e.target.checked)}
                      className="w-4 h-4 accent-amber-500 cursor-pointer"
                    />
                    <div className="flex items-center gap-2 flex-1">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isFavorit ? 'bg-amber-100' : 'bg-[#e9ecef]'}`}>
                        <Star className={`w-4 h-4 ${isFavorit ? 'text-amber-500' : 'text-[#adb5bd]'}`} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-[#212529]">Menu Favorit ⭐</p>
                        <p className="text-[11px] text-[#6c757d]">Tampil di seksi "Menu Favorit" pada dashboard pelanggan</p>
                      </div>
                    </div>
                    {isFavorit && (
                      <span className="text-[10px] font-bold bg-amber-400 text-white px-2 py-0.5 rounded-full">AKTIF</span>
                    )}
                  </label>

                  {/* Checkbox Best Seller */}
                  <label className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${isBestSeller ? 'border-orange-400 bg-orange-50' : 'border-[#dee2e6] bg-white hover:border-orange-200'}`}>
                    <input
                      type="checkbox"
                      checked={isBestSeller}
                      onChange={(e) => setIsBestSeller(e.target.checked)}
                      className="w-4 h-4 accent-orange-500 cursor-pointer"
                    />
                    <div className="flex items-center gap-2 flex-1">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isBestSeller ? 'bg-orange-100' : 'bg-[#e9ecef]'}`}>
                        <TrendingUp className={`w-4 h-4 ${isBestSeller ? 'text-orange-500' : 'text-[#adb5bd]'}`} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-[#212529]">Best Seller 🔥</p>
                        <p className="text-[11px] text-[#6c757d]">Tampil di seksi "Best Seller" pada halaman beranda</p>
                      </div>
                    </div>
                    {isBestSeller && (
                      <span className="text-[10px] font-bold bg-orange-500 text-white px-2 py-0.5 rounded-full">AKTIF</span>
                    )}
                  </label>

                </div>
              </div>

              <div className="flex gap-3 justify-end pt-2">
                <button type="button" onClick={handleTutupForm} className="btn-secondary text-sm">
                  Kembali
                </button>
                <button type="submit" className="btn-blue text-sm flex items-center gap-2">
                  <Save className="w-4 h-4" />
                  Simpan Menu
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // ================= TABEL DATA MENU =================
  return (
    <div className="text-left">
      <div className="flex justify-between items-center mb-5">
        <div>
          <p className="text-[#0b5345] font-semibold text-xs uppercase tracking-wider">Kelola Data</p>
          <h2 className="page-title mt-1">Data Menu Pizza</h2>
        </div>
        <button className="btn-primary text-sm py-2 px-4 flex items-center gap-2" onClick={handleBukaTambah}>
          <Plus className="w-4 h-4" /> Tambah Menu
        </button>
      </div>

      <div className="card-bs overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="table-bs">
            <thead>
              <tr>
                <th>Menu</th>
                <th>Medium</th>
                <th>Large</th>
                <th>Stok</th>
                <th>Label</th>
                <th>Status</th>
                <th className="text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {menus.map((menu) => (
                <tr key={menu.id}>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded overflow-hidden border border-[#dee2e6] shrink-0">
                        <img src={getImageUrl(menu.gambar_url)} alt={menu.nama} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <span className="font-semibold text-[#212529] text-sm block">{menu.nama}</span>
                        <span className="text-[11px] text-[#6c757d] line-clamp-1 max-w-[200px]">{menu.deskripsi}</span>
                      </div>
                    </div>
                  </td>
                  <td className="font-semibold text-sm text-blue-600">Rp {(menu.harga_medium || menu.harga).toLocaleString('id-ID')}</td>
                  <td className="font-semibold text-sm text-purple-600">Rp {(menu.harga_large || menu.harga_medium + 15000 || menu.harga + 15000).toLocaleString('id-ID')}</td>
                  <td className="text-sm">{menu.stok} Pcs</td>
                  <td>
                    <div className="flex flex-col gap-1">
                      {menu.is_favorit && (
                        <span className="flex items-center gap-1 bg-amber-100 text-amber-700 text-[10px] font-bold px-2 py-0.5 rounded-full w-fit">
                          <Star className="w-3 h-3" /> Favorit
                        </span>
                      )}
                      {menu.is_best_seller && (
                        <span className="flex items-center gap-1 bg-orange-100 text-orange-700 text-[10px] font-bold px-2 py-0.5 rounded-full w-fit">
                          <TrendingUp className="w-3 h-3" /> Best Seller
                        </span>
                      )}
                      {!menu.is_favorit && !menu.is_best_seller && (
                        <span className="text-[10px] text-[#adb5bd]">—</span>
                      )}
                    </div>
                  </td>
                  <td>
                    {menu.tersedia ? (
                      <span className="bg-emerald-100 text-emerald-700 text-[11px] font-semibold px-2 py-0.5 rounded">Tersedia</span>
                    ) : (
                      <span className="bg-red-100 text-red-700 text-[11px] font-semibold px-2 py-0.5 rounded">Habis</span>
                    )}
                  </td>
                  <td>
                    <div className="flex justify-center gap-2">
                      <button
                        className="btn-blue text-xs py-1 px-2.5 flex items-center gap-1"
                        onClick={() => handleBukaEdit(menu)}
                      >
                        <Edit3 className="w-3.5 h-3.5" /> Edit
                      </button>
                      <button
                        className="bg-red-500 hover:bg-red-600 text-white text-xs py-1 px-2.5 rounded flex items-center gap-1"
                        onClick={() => handleHapusMenu(menu.id)}
                      >
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
    </div>
  );
}
