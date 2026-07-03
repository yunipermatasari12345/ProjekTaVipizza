import React, { useState, useEffect } from 'react';
import { Plus, Edit3, Trash2, Save } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function ManageMenu() {
  const { token } = useAuth();
  const [menus, setMenus] = useState([]);
  const [formBuka, setFormBuka] = useState(false);
  const [menuTerpilih, setMenuTerpilih] = useState(null);

  // Form State
  const [nama, setNama] = useState('');
  const [deskripsi, setDeskripsi] = useState('');
  const [harga, setHarga] = useState('');
  const [stok, setStok] = useState('');
  const [kategori, setKategori] = useState('pizza');
  const [gambarUrl, setGambarUrl] = useState('');
  const [fileObj, setFileObj] = useState(null);

  // Load Menu dari local database / mock
  useEffect(() => {
    muatMenu();
  }, []);

  const muatMenu = () => {
    fetch('http://localhost:8080/api/menus')
      .then(res => {
        if (!res.ok) throw new Error('Gagal load API');
        return res.json();
      })
      .then(data => {
        if (data && Array.isArray(data)) setMenus(data);
      })
      .catch(() => {
        alert('Gagal memuat data menu. Pastikan backend berjalan.');
      });
  };

  const handleBukaTambah = () => {
    setMenuTerpilih(null);
    setNama('');
    setDeskripsi('');
    setHarga('');
    setStok('');
    setKategori('pizza');
    setGambarUrl('');
    setFileObj(null);
    setFormBuka(true);
  };

  const handleBukaEdit = (menu) => {
    setMenuTerpilih(menu);
    setNama(menu.nama);
    setDeskripsi(menu.deskripsi);
    setHarga(menu.harga.toString());
    setStok(menu.stok.toString());
    setKategori(menu.kategori);
    setGambarUrl(menu.gambar_url);
    setFileObj(null);
    setFormBuka(true);
  };

  const handleTutupForm = () => {
    setFormBuka(false);
    setMenuTerpilih(null);
  };

  const handleSimpanMenu = (e) => {
    e.preventDefault();

    if (!nama || !harga || !stok) {
      alert('Mohon isi seluruh field wajib!');
      return;
    }

    const hargaInt = parseInt(harga);
    const stokInt = parseInt(stok);

    const formData = new FormData();
    formData.append('nama', nama);
    formData.append('deskripsi', deskripsi);
    formData.append('harga', hargaInt.toString());
    formData.append('stok', stokInt.toString());
    formData.append('kategori', kategori);
    if (fileObj) {
      formData.append('gambar', fileObj);
    }

    const apiURL = menuTerpilih
      ? `http://localhost:8080/api/menus/${menuTerpilih.id}`
      : 'http://localhost:8080/api/menus';
    const apiMethod = menuTerpilih ? 'PUT' : 'POST';

    fetch(apiURL, {
      method: apiMethod,
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    })
      .then(res => {
        if (!res.ok) throw new Error('Gagal menyimpan');
        return res.json();
      })
      .then(() => {
        alert(menuTerpilih ? 'Menu berhasil diperbarui!' : 'Menu baru berhasil ditambahkan!');
        muatMenu();
        handleTutupForm();
      })
      .catch(err => {
        alert('Gagal menyimpan menu: ' + err.message + '\nPastikan Anda sudah login sebagai Admin dan backend berjalan.');
      });
  };

  const handleHapusMenu = (id) => {
    if (window.confirm('Apakah kamu yakin? Data ini akan dihapus secara permanen.')) {
      fetch(`http://localhost:8080/api/menus/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
        .then(res => {
          if (!res.ok) throw new Error('Gagal menghapus');
          return res.json();
        })
        .then(() => {
          alert('Menu berhasil dihapus!');
          muatMenu();
        })
        .catch(err => {
          alert('Gagal menghapus menu: ' + err.message);
        });
    }
  };

  // ================= FORM TAMBAH/EDIT — ala TA kating =================
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
                  <label className="text-sm font-medium text-[#212529] block mb-1">Harga (Rp)</label>
                  <input type="number" value={harga} onChange={(e) => setHarga(e.target.value)} className="input-bs" required />
                </div>
                <div>
                  <label className="text-sm font-medium text-[#212529] block mb-1">Stok</label>
                  <input type="number" value={stok} onChange={(e) => setStok(e.target.value)} className="input-bs" required />
                </div>
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
                <textarea value={deskripsi} onChange={(e) => setDeskripsi(e.target.value)} rows={4} className="input-bs resize-none" />
              </div>

              <div className="flex gap-3 justify-end pt-2">
                <button type="button" onClick={handleTutupForm} className="btn-secondary text-sm">
                  Kembali
                </button>
                <button type="submit" className="btn-blue text-sm flex items-center gap-2">
                  <Save className="w-4 h-4" />
                  Simpan
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
                <th>Harga</th>
                <th>Stok</th>
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
                        <img src={menu.gambar_url} alt={menu.nama} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <span className="font-semibold text-[#212529] text-sm block">{menu.nama}</span>
                        <span className="text-[11px] text-[#6c757d] line-clamp-1 max-w-[200px]">{menu.deskripsi}</span>
                      </div>
                    </div>
                  </td>
                  <td className="font-semibold text-sm">Rp {menu.harga.toLocaleString('id-ID')}</td>
                  <td className="text-sm">{menu.stok} Pcs</td>
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
