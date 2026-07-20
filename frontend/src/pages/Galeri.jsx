import React, { useState, useEffect } from 'react';
import { Camera, Image as ImageIcon, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Swal from 'sweetalert2';

export default function Galeri() {
  const [galeri, setGaleri] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, token } = useAuth();
  const [selectedImage, setSelectedImage] = useState(null); // State Lightbox
  
  // State Upload
  const [modalBuka, setModalBuka] = useState(false);
  const [fileObj, setFileObj] = useState(null);
  const [preview, setPreview] = useState('');
  const [judul, setJudul] = useState('');
  const [deskripsi, setDeskripsi] = useState('');
  const [uploading, setUploading] = useState(false);

  const muatGaleri = () => {
    fetch('http://localhost:9000/api/galeri')
      .then(res => res.json())
      .then(data => {
        setGaleri(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    muatGaleri();
  }, []);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!fileObj) {
      Swal.fire('Oops!', 'Pilih foto dulu ya.', 'warning');
      return;
    }
    
    setUploading(true);
    const formData = new FormData();
    formData.append('judul', judul || `Momen ${user.nama}`);
    formData.append('deskripsi', deskripsi);
    formData.append('gambar', fileObj);

    try {
      const res = await fetch('http://localhost:9000/api/galeri', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      if (res.ok) {
        Swal.fire('Berhasil!', 'Momen serumu berhasil diunggah!', 'success');
        setModalBuka(false);
        setFileObj(null);
        setPreview('');
        setJudul('');
        setDeskripsi('');
        muatGaleri();
      } else {
        Swal.fire('Gagal', 'Terjadi kesalahan saat mengunggah.', 'error');
      }
    } catch (err) {
      Swal.fire('Error', 'Gagal terhubung ke server.', 'error');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF6F1] pt-24 pb-16 px-6 font-['Plus_Jakarta_Sans']">
      <div className="max-w-7xl mx-auto">
        
        {/* Header Galeri */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center p-3 bg-amber-100 text-amber-600 rounded-full mb-4">
            <Camera className="w-8 h-8" />
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-[#2C1810] mb-4 font-['Outfit']">
            Galeri VIPizza
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto mb-6">
            Intip berbagai momen keseruan pelanggan dan koleksi foto menarik dari VIPizza. 
            Pizza hangat yang baru keluar dari oven hingga senyum pelanggan setia kami!
          </p>
          
          {user && (
            <button 
              onClick={() => setModalBuka(true)}
              className="bg-[#8B3A0F] text-white font-bold px-6 py-2.5 rounded-full shadow hover:-translate-y-0.5 transition-all flex items-center gap-2 mx-auto"
            >
              <Camera className="w-4 h-4" /> Unggah Momen Anda
            </button>
          )}
        </div>

        {/* Masonry Layout (Grid) */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8B3A0F]"></div>
          </div>
        ) : galeri.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-[#E8DDD5]">
            <ImageIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-400">Belum Ada Foto</h3>
            <p className="text-gray-400">Nantikan momen-momen seru kami segera!</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
            {galeri.map((item) => (
              <div 
                key={item.id} 
                onClick={() => setSelectedImage(item)}
                className="rounded-2xl overflow-hidden bg-white shadow-sm hover:shadow-xl transition-all duration-500 border border-[#E8DDD5] group relative aspect-square cursor-pointer"
              >
                <img 
                  src={`http://localhost:9000${item.gambar_url}`} 
                  alt={item.judul}
                  className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                  loading="lazy"
                />
                
                {/* Overlay Text */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#2C1810]/90 via-[#2C1810]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                  <h3 className="text-white font-bold text-xl mb-1 translate-y-4 group-hover:translate-y-0 transition-transform duration-300">{item.judul || 'Momen Spesial'}</h3>
                  {item.deskripsi && (
                    <p className="text-gray-200 text-sm line-clamp-2 translate-y-4 group-hover:translate-y-0 transition-transform duration-300 delay-75">
                      {item.deskripsi}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal Upload */}
      {modalBuka && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden p-6 relative">
            <button onClick={() => setModalBuka(false)} className="absolute top-4 right-4 text-gray-400 hover:text-red-500">
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-2xl font-bold mb-4 font-['Outfit'] text-[#2C1810]">Unggah Foto Anda</h2>
            <form onSubmit={handleUpload} className="flex flex-col gap-4">
              <div>
                <label className="text-sm font-semibold mb-1 block">Pilih Foto *</label>
                <input 
                  type="file" accept="image/*" required
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      setFileObj(file);
                      const reader = new FileReader();
                      reader.onloadend = () => setPreview(reader.result);
                      reader.readAsDataURL(file);
                    }
                  }}
                  className="w-full text-sm border p-2 rounded-lg"
                />
                {preview && (
                  <div className="mt-2 w-full aspect-square rounded-lg overflow-hidden border border-gray-200">
                    <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
              <div>
                <label className="text-sm font-semibold mb-1 block">Judul Foto (Opsional)</label>
                <input 
                  type="text" value={judul} onChange={e => setJudul(e.target.value)}
                  className="w-full border rounded-lg p-2.5 text-sm" placeholder={`Misal: Momen ${user.nama}`}
                />
              </div>
              <button type="submit" disabled={uploading} className="bg-[#8B3A0F] text-white font-bold py-3 rounded-xl hover:opacity-90 disabled:opacity-50">
                {uploading ? 'Mengunggah...' : 'Unggah Sekarang'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal Detail Gambar (Lightbox) */}
      {selectedImage && (
        <div 
          className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in" 
          onClick={() => setSelectedImage(null)}
        >
          <button 
            onClick={() => setSelectedImage(null)} 
            className="absolute top-6 right-6 text-white/70 hover:text-white transition"
          >
            <X className="w-8 h-8" />
          </button>
          
          <div className="max-w-4xl w-full flex flex-col items-center animate-in zoom-in-95 duration-300" onClick={e => e.stopPropagation()}>
            <img 
              src={`http://localhost:9000${selectedImage.gambar_url}`} 
              alt={selectedImage.judul}
              className="max-h-[70vh] w-auto object-contain rounded-xl shadow-2xl mb-6"
            />
            <div className="text-center text-white">
              <h2 className="text-2xl md:text-3xl font-bold font-['Outfit'] mb-3">{selectedImage.judul || 'Momen Spesial'}</h2>
              {selectedImage.deskripsi && (
                <p className="text-white/80 max-w-xl text-sm md:text-base leading-relaxed">
                  {selectedImage.deskripsi}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
