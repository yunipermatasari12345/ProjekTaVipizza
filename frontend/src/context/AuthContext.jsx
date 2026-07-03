import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('vipizza_token'));

  // Ambil user dari localStorage jika ada saat reload
  useEffect(() => {
    const savedUser = localStorage.getItem('vipizza_user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem('vipizza_user');
      }
    }
  }, []);

  // Real login with mock fallback
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
          setUser(res.user);
          setToken(res.token);
          localStorage.setItem('vipizza_user', JSON.stringify(res.user));
          localStorage.setItem('vipizza_token', res.token);
          return res.user;
        }
      }
    } catch (err) {
      console.warn("Backend API offline, falling back to mock login simulation:", err.message);
    }

    // Fallback Mock simulation
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

    setUser(mockUser);
    setToken("mock_jwt_token_vipizza");
    localStorage.setItem('vipizza_user', JSON.stringify(mockUser));
    localStorage.setItem('vipizza_token', "mock_jwt_token_vipizza");
    return mockUser;
  };

  // Real register with mock fallback
  const registerSimulasi = async (nama, email, telepon, alamat, password = "pelangganvipizza") => {
    try {
      const response = await fetch('http://localhost:8080/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nama, email, password, telepon, alamat })
      });

      if (response.ok) {
        // Otomatis login setelah registrasi sukses
        return loginSimulasi(email, password);
      }
    } catch (err) {
      console.warn("Backend API offline, falling back to mock register simulation:", err.message);
    }

    // Fallback Mock simulation
    const mockUser = {
      id: Math.floor(Math.random() * 1000) + 10,
      nama,
      email,
      peran: "pelanggan",
      telepon,
      alamat
    };
    setUser(mockUser);
    setToken("mock_jwt_token_vipizza");
    localStorage.setItem('vipizza_user', JSON.stringify(mockUser));
    localStorage.setItem('vipizza_token', "mock_jwt_token_vipizza");
    return mockUser;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('vipizza_user');
    localStorage.removeItem('vipizza_token');
  };

  // Helper untuk beralih peran dengan cepat (sangat berguna untuk demo Tugas Akhir!)
  const alihkanPeran = () => {
    if (!user) return;
    const peranBaru = user.peran === 'admin' ? 'pelanggan' : 'admin';
    const userBaru = {
      ...user,
      nama: peranBaru === 'admin' ? "Admin Vipizza" : "Budi Santoso",
      email: peranBaru === 'admin' ? "admin@vipizza.com" : "budi@gmail.com",
      peran: peranBaru,
    };
    setUser(userBaru);
    localStorage.setItem('vipizza_user', JSON.stringify(userBaru));
  };

  return (
    <AuthContext.Provider value={{ user, token, login: loginSimulasi, register: registerSimulasi, logout, alihkanPeran }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
