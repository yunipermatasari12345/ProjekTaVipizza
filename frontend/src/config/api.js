// ============================================================
// KONFIGURASI API - File: frontend/src/config/api.js
// ============================================================
// URL dasar backend Go. Ubah jika backend di port/host berbeda.
// ============================================================

export const API_BASE_URL = 'http://localhost:8080/api';
export const UPLOAD_BASE_URL = 'http://localhost:8080';

// Helper fetch dengan token JWT otomatis
export async function apiFetch(endpoint, options = {}, token = null) {
  const headers = {
    ...options.headers,
  };

  // Jangan set Content-Type untuk FormData (browser set otomatis)
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = headers['Content-Type'] || 'application/json';
  }

  if (token && token !== 'mock_jwt_token_vipizza') {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  return response;
}

// Nomor WhatsApp admin UMKM (untuk link wa.me fallback di frontend)
export const ADMIN_WA = '6281234567890';
