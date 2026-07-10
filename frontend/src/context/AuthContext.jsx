import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

const STORAGE_USER_KEY = 'vipizza_user';
const STORAGE_TOKEN_KEY = 'vipizza_token';

// Ambil data langsung dari localStorage (sinkron) agar tidak flash ke login saat refresh
function ambilUserAwal() {
  try {
    const saved = localStorage.getItem(STORAGE_USER_KEY);
    return saved ? JSON.parse(saved) : null;
  } catch { return null; }
}
function ambilTokenAwal() {
  return localStorage.getItem(STORAGE_TOKEN_KEY) || null;
}

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(ambilUserAwal);
  const [token, setToken]     = useState(ambilTokenAwal);
  const [isLoading, setIsLoading] = useState(true); // false setelah validasi selesai

  // Validasi token ke backend saat pertama load (background)
  useEffect(() => {
    const savedUser  = localStorage.getItem(STORAGE_USER_KEY);
    const savedToken = localStorage.getItem(STORAGE_TOKEN_KEY);

    if (!savedUser || !savedToken) {
      setIsLoading(false);
      return;
    }

    // Token "mock" tidak perlu divalidasi ke backend
    if (savedToken === 'mock_jwt_token_vipizza') {
      setIsLoading(false);
      return;
    }

    fetch('http://localhost:8080/api/auth/me', {
      headers: { 'Authorization': `Bearer ${savedToken}` }
    })
      .then(res => {
        if (!res.ok) {
          // Token kadaluarsa/invalid → bersihkan
          bersihkanSession();
        }
        // Jika ok, user & token sudah di-set dari useState awal, tidak perlu set ulang
      })
      .catch(() => {
        // Backend offline → tetap pertahankan session (demo mode)
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const simpanSession = (userData, tokenData) => {
    setUser(userData);
    setToken(tokenData);
    localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(userData));
    localStorage.setItem(STORAGE_TOKEN_KEY, tokenData);
  };

  const bersihkanSession = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem(STORAGE_USER_KEY);
    localStorage.removeItem(STORAGE_TOKEN_KEY);
  };

  // Login dengan real backend, fallback ke mock jika offline
  const loginSimulasi = async (email, password) => {
    try {
      const response = await fetch('http://localhost:8080/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      if (response.ok) {
        const res = await response.json();
        if (res && res.token && res.user) {
          simpanSession(res.user, res.token);
          return res.user;
        }
      }
      return null;
    } catch (err) {
      console.warn("Backend offline, fallback ke mock login:", err.message);
    }

    // Fallback mock (hanya jika backend offline)
    let mockUser = {
      id: 2,
      nama: "Budi Santoso",
      email: email,
      peran: "pelanggan",
      telepon: "082345678901",
      alamat: "Jl. Khatib Sulaiman No. 12, Padang Utara, Padang"
    };

    if (email.includes('admin') || password === 'adminvipizza') {
      mockUser = {
        id: 1,
        nama: "Admin Vipizza",
        email: "admin@vipizza.com",
        peran: "admin",
        telepon: "081234567890",
        alamat: "Kantor Pusat Vipizza, Kota Padang"
      };
    }

    simpanSession(mockUser, 'mock_jwt_token_vipizza');
    return mockUser;
  };

  // Register dengan real backend, fallback ke mock jika offline
  const registerSimulasi = async (nama, email, telepon, alamat, password = "pelangganvipizza") => {
    try {
      const response = await fetch('http://localhost:8080/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nama, email, password, telepon, alamat })
      });

      if (response.ok) {
        return loginSimulasi(email, password);
      }
      return null;
    } catch (err) {
      console.warn("Backend offline, fallback ke mock register:", err.message);
    }

    const mockUser = {
      id: Math.floor(Math.random() * 1000) + 10,
      nama, email, peran: "pelanggan", telepon, alamat
    };
    simpanSession(mockUser, 'mock_jwt_token_vipizza');
    return mockUser;
  };

  const logout = () => {
    bersihkanSession();
  };

  const alihkanPeran = () => {
    if (!user) return;
    const peranBaru = user.peran === 'admin' ? 'pelanggan' : 'admin';
    const userBaru = {
      ...user,
      nama: peranBaru === 'admin' ? "Admin Vipizza" : "Budi Santoso",
      email: peranBaru === 'admin' ? "admin@vipizza.com" : "budi@vipizza.com",
      peran: peranBaru,
    };
    simpanSession(userBaru, token);
  };

  const updateUser = (userData) => {
    setUser(userData);
    localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(userData));
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login: loginSimulasi, register: registerSimulasi, logout, alihkanPeran, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
