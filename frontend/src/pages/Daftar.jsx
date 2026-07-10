import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserPlus, Eye, EyeOff } from 'lucide-react';
import Swal from 'sweetalert2';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [nama, setNama] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [konfirmasiPassword, setKonfirmasiPassword] = useState('');
  const [telepon, setTelepon] = useState('');
  const [alamat, setAlamat] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showKonfirmasiPassword, setShowKonfirmasiPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nama || !email || !password || !konfirmasiPassword || !telepon || !alamat) {
      Swal.fire({ icon: 'warning', title: 'Perhatian', text: 'Mohon isi seluruh data pendaftaran!' });
      return;
    }

    if (password !== konfirmasiPassword) {
      Swal.fire({ icon: 'warning', title: 'Password Beda', text: 'Password dan Konfirmasi Password tidak cocok!' });
      return;
    }

    setLoading(true);
    try {
      const userBaru = await register(nama, email, telepon, alamat, password);
      if (!userBaru) {
        Swal.fire({ icon: 'error', title: 'Registrasi Gagal', text: 'Gagal mendaftar di server. Coba lagi.' });
        setLoading(false);
        return;
      }
      setLoading(false);
      Swal.fire({ icon: 'success', title: 'Registrasi Berhasil', text: 'Selamat datang di Vipizza!', timer: 2000, showConfirmButton: false });
      navigate('/dashboard');
    } catch {
      setLoading(false);
      Swal.fire({ icon: 'error', title: 'Registrasi Gagal', text: 'Terjadi kesalahan. Pastikan password minimal 6 karakter.' });
    }
  };

  return (
    <div className="min-h-[90vh] flex items-center justify-center px-6 py-12 bg-[#f8f9fa]">
      <div className="w-full max-w-lg card-bs p-8">

        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-full bg-[#e8f5f2] flex items-center justify-center text-2xl mx-auto mb-3">
            🍕
          </div>
          <h2 className="font-bold text-[#212529] text-xl">Register</h2>
          <p className="text-[#6c757d] text-xs mt-1">Buat akun baru untuk memesan pizza</p>
        </div>

        <form className="flex flex-col gap-3.5" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="text-sm font-medium text-[#212529] block mb-1">Nama Lengkap</label>
              <input type="text" placeholder="Budi Santoso" value={nama} onChange={(e) => setNama(e.target.value)} className="input-bs" required />
            </div>
            <div>
              <label className="text-sm font-medium text-[#212529] block mb-1">Email</label>
              <input type="email" placeholder="budi@gmail.com" value={email} onChange={(e) => setEmail(e.target.value)} className="input-bs" required />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="text-sm font-medium text-[#212529] block mb-1">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-bs pr-10 w-full"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-800 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-[#212529] block mb-1">Konfirmasi Password</label>
              <div className="relative">
                <input
                  type={showKonfirmasiPassword ? 'text' : 'password'}
                  value={konfirmasiPassword}
                  onChange={(e) => setKonfirmasiPassword(e.target.value)}
                  className="input-bs pr-10 w-full"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowKonfirmasiPassword(!showKonfirmasiPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-800 transition-colors"
                >
                  {showKonfirmasiPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-[#212529] block mb-1">Nomor WhatsApp</label>
            <input type="text" placeholder="081234567890" value={telepon} onChange={(e) => setTelepon(e.target.value)} className="input-bs" required />
          </div>

          <div>
            <label className="text-sm font-medium text-[#212529] block mb-1">Alamat Pengiriman</label>
            <textarea
              placeholder="Alamat lengkap di Kota Padang..."
              value={alamat}
              onChange={(e) => setAlamat(e.target.value)}
              rows={2}
              className="input-bs resize-none"
              required
            />
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full py-2.5 flex items-center justify-center gap-2 text-sm mt-2">
            <UserPlus className="w-4 h-4" />
            {loading ? 'Mendaftar...' : 'Register'}
          </button>
        </form>

        <p className="text-xs text-[#6c757d] text-center mt-5">
          Sudah punya akun?{' '}
          <Link to="/masuk" className="text-[#0b5345] font-semibold hover:underline">Login</Link>
        </p>
      </div>
    </div>
  );
}
