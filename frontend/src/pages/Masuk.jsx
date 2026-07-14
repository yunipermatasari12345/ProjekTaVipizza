import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn, Eye, EyeOff } from 'lucide-react';
import Swal from 'sweetalert2';

export default function Masuk() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // State untuk Lupa Password
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      Swal.fire({ icon: 'warning', title: 'Perhatian', text: 'Mohon isi email dan password!' });
      return;
    }

    setLoading(true);
    try {
      const userLogin = await login(email, password);
      if (!userLogin) {
        Swal.fire({ icon: 'error', title: 'Login Gagal', text: 'Periksa email dan password Anda.' });
        setLoading(false);
        return;
      }
      if (userLogin.peran === 'admin') {
        Swal.fire({ icon: 'success', title: 'Login Berhasil', text: 'Selamat datang Admin!', timer: 1500, showConfirmButton: false });
        navigate('/admin');
      } else {
        Swal.fire({ icon: 'success', title: 'Login Berhasil', text: 'Selamat datang di Vipizza!', timer: 1500, showConfirmButton: false });
        navigate('/dashboard');
      }
    } catch {
      Swal.fire({ icon: 'error', title: 'Login Gagal', text: 'Periksa email dan password Anda.' });
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!forgotEmail) {
      Swal.fire({ icon: 'warning', title: 'Perhatian', text: 'Mohon isi email Anda!' });
      return;
    }

    setForgotLoading(true);
    try {
      const response = await fetch('http://localhost:9000/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail })
      });
      const data = await response.json();

      if (response.ok) {
        Swal.fire({ icon: 'success', title: 'Berhasil', text: data.message });
        setShowForgotModal(false);
        setForgotEmail('');
      } else {
        Swal.fire({ icon: 'error', title: 'Gagal', text: data.error || 'Terjadi kesalahan saat reset password.' });
      }
    } catch (err) {
      // Fallback jika backend mati
      Swal.fire({ icon: 'info', title: 'Simulasi', text: 'Permintaan reset password berhasil (Simulasi Demo).' });
      setShowForgotModal(false);
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-6 py-12 bg-[#f8f9fa]">
      <div className="w-full max-w-md card-bs p-8">

        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-full bg-[#e8f5f2] flex items-center justify-center text-2xl mx-auto mb-3">
            🍕
          </div>
          <h2 className="font-bold text-[#212529] text-xl">Login</h2>
          <p className="text-[#6c757d] text-xs mt-1">Masuk ke akun Vipizza Homemade Padang</p>
        </div>

        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <div>
            <label className="text-sm font-medium text-[#212529] block mb-1">Email</label>
            <input
              type="email"
              placeholder="budi@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-bs"
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium text-[#212529] block mb-1">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Masukkan password..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-bs pr-10 w-full"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-800 transition-colors"
                title={showPassword ? "Sembunyikan password" : "Tampilkan password"}
              >
                {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
              </button>
            </div>
            <div className="flex justify-end mt-2">
              <button 
                type="button" 
                onClick={() => setShowForgotModal(true)}
                className="text-xs text-[#0b5345] hover:underline font-medium"
              >
                Lupa Password?
              </button>
            </div>
          </div>

          <div className="p-3 bg-[#e8f5f2] border border-[#0b5345]/20 text-[#212529] text-[11px] rounded">
            <span className="font-bold block mb-1">Akun Demo:</span>
            <span className="block">Admin: admin@vipizza.com / adminvipizza</span>
            <span className="block">Pelanggan: budi@vipizza.com / pelangganvipizza</span>
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full py-2.5 flex items-center justify-center gap-2 text-sm">
            <LogIn className="w-4 h-4" />
            {loading ? 'Menghubungkan...' : 'Login'}
          </button>
        </form>

        <p className="text-xs text-[#6c757d] text-center mt-5">
          Belum punya akun?{' '}
          <Link to="/daftar" className="text-[#0b5345] font-semibold hover:underline">Register</Link>
        </p>
      </div>

      {/* Modal Lupa Password */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-sm shadow-xl relative">
            <h3 className="font-bold text-lg mb-2 text-[#212529]">Lupa Password</h3>
            <p className="text-sm text-gray-500 mb-4">
              Masukkan email yang terdaftar. Password baru akan dikirimkan ke WhatsApp Anda.
            </p>
            <form onSubmit={handleForgotPassword} className="flex flex-col gap-3">
              <input
                type="email"
                placeholder="budi@vipizza.com"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                className="input-bs"
                required
              />
              <div className="flex gap-2 justify-end mt-2">
                <button
                  type="button"
                  onClick={() => setShowForgotModal(false)}
                  className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={forgotLoading}
                  className="btn-primary px-4 py-2 text-sm flex items-center gap-2"
                >
                  {forgotLoading ? 'Mengirim...' : 'Kirim Password Baru'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
