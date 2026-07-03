import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn } from 'lucide-react';

export default function Masuk() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      alert('Mohon isi email dan password!');
      return;
    }

    setLoading(true);
    try {
      const userLogin = await login(email, password);
      if (userLogin.peran === 'admin') {
        navigate('/admin');
      } else {
        navigate('/menu');
      }
    } catch {
      alert('Login gagal. Periksa email dan password Anda.');
    } finally {
      setLoading(false);
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
            <input
              type="password"
              placeholder="Masukkan password..."
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-bs"
              required
            />
          </div>

          <div className="p-3 bg-[#e8f5f2] border border-[#0b5345]/20 text-[#212529] text-[11px] rounded">
            <span className="font-bold block mb-1">Akun Demo:</span>
            <span className="block">Admin: admin@vipizza.com / adminvipizza</span>
            <span className="block">Pelanggan: budi@gmail.com / pelangganvipizza</span>
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
    </div>
  );
}
