import React from 'react';

export default function Logo({ className = "w-12 h-12" }) {
  return (
    <svg 
      viewBox="0 0 200 200" 
      className={`${className} select-none`}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* 1. Lingkaran Dasar Kuning & Border Hitam Tebal */}
      <circle cx="100" cy="100" r="92" fill="#FFC72C" stroke="#000000" strokeWidth="8" />
      <circle cx="100" cy="100" r="80" fill="none" stroke="#000000" strokeWidth="2" strokeDasharray="4 4" />

      {/* 2. Jalur Teks Melengkung (Kurva Atas & Bawah) */}
      <path 
        id="topCurve" 
        d="M 28 100 A 72 72 0 1 1 172 100" 
        fill="none" 
        stroke="none"
      />
      <path 
        id="bottomCurve" 
        d="M 172 100 A 72 72 0 0 1 28 100" 
        fill="none" 
        stroke="none"
      />

      {/* 3. Teks Melengkung Atas: V.I.Pizza */}
      <text fill="#000000" fontSize="23" fontFamily="Courier New, monospace" fontWeight="900" letterSpacing="2">
        <textPath href="#topCurve" startOffset="50%" textAnchor="middle">
          V.I.PIZZA
        </textPath>
      </text>

      {/* Tanda Pagar Kiri dan Kanan */}
      <text x="18" y="106" fill="#000000" fontSize="22" fontWeight="900" fontFamily="Courier New">#</text>
      <text x="168" y="106" fill="#000000" fontSize="22" fontWeight="900" fontFamily="Courier New">#</text>

      {/* 4. Teks Melengkung Bawah: from home for you */}
      <text fill="#000000" fontSize="15" fontFamily="Courier New, monospace" fontWeight="900" letterSpacing="0.5">
        <textPath href="#bottomCurve" startOffset="50%" textAnchor="middle">
          from home for you
        </textPath>
      </text>

      {/* 5. Gambar Pizza di Tengah */}
      <g transform="translate(100, 100) scale(0.9)">
        {/* Lingkaran Piring Pizza Merah (Saus) */}
        <circle cx="0" cy="0" r="54" fill="#C2410C" stroke="#000000" strokeWidth="4" />
        
        {/* Adonan Dasar Kuning Keemasan */}
        <circle cx="0" cy="0" r="48" fill="#FBBF24" />

        {/* Slice Pizza Yang Terpotong / Keluar */}
        {/* Crust Pizza */}
        <path d="M -35 22 C -10 50, 10 50, 35 22 L 0 -45 Z" fill="#D97706" stroke="#000000" strokeWidth="3" />
        {/* Keju Lumer */}
        <path d="M -30 20 C -8 42, 8 42, 30 20 L 0 -40 Z" fill="#FCD34D" />

        {/* Topping Pepperoni (Bulatan Merah) */}
        <circle cx="0" cy="-10" r="8" fill="#DC2626" stroke="#000000" strokeWidth="1.5" />
        <circle cx="-12" cy="12" r="7" fill="#DC2626" stroke="#000000" strokeWidth="1.5" />
        <circle cx="12" cy="12" r="7" fill="#DC2626" stroke="#000000" strokeWidth="1.5" />

        {/* Topping Jamur / Zaitun (Bulatan Hitam & Putih Kecil) */}
        <circle cx="-5" cy="-28" r="3" fill="#1E293B" />
        <circle cx="15" cy="-12" r="3.5" fill="#FFFFFF" stroke="#1E293B" strokeWidth="1" />
        <circle cx="-18" cy="-5" r="3" fill="#1E293B" />
        <circle cx="0" cy="25" r="3.5" fill="#FFFFFF" stroke="#1E293B" strokeWidth="1" />

        {/* Daun Basil Hijau */}
        <path d="M -15 0 C -20 -8, -12 -8, -12 -5 Z" fill="#15803D" />
        <path d="M 12 -20 C 18 -15, 12 -12, 10 -15 Z" fill="#15803D" />
      </g>
    </svg>
  );
}
