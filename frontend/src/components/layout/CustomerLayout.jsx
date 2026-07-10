import React from 'react';
import { Outlet } from 'react-router-dom';
import CustomerNavbar from './CustomerNavbar';
import Footer from '../Footer';

// Layout khusus halaman PEMBELI (beranda, menu, dll)
export default function CustomerLayout() {
  return (
    <div className="flex flex-col min-h-screen bg-[#f8f9fa]">
      <CustomerNavbar />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

