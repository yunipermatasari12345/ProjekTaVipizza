import React, { createContext, useState, useContext, useEffect } from 'react';
import Swal from 'sweetalert2';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [keranjang, setKeranjang] = useState([]);

  // Ambil data keranjang dari localStorage saat reload
  useEffect(() => {
    const savedCart = localStorage.getItem('vipizza_cart');
    if (savedCart) {
      try {
        const parsed = JSON.parse(savedCart);
        if (Array.isArray(parsed)) {
          // Bersihkan data sampah/rusak: pastikan item memiliki .menu dan .menu.harga
          const validCart = parsed.filter(item => item && item.menu && typeof item.menu.harga === 'number');
          setKeranjang(validCart);
          localStorage.setItem('vipizza_cart', JSON.stringify(validCart));
        } else {
          localStorage.removeItem('vipizza_cart');
        }
      } catch (e) {
        localStorage.removeItem('vipizza_cart');
      }
    }
  }, []);

  // Simpan data keranjang ke localStorage setiap ada perubahan
  const simpanKeranjang = (baru) => {
    setKeranjang(baru);
    localStorage.setItem('vipizza_cart', JSON.stringify(baru));
  };

  const tambahKeKeranjang = (menu, jumlah = 1, catatan = '') => {
    const indeksAda = keranjang.findIndex(item => item.menu.id === menu.id);

    if (indeksAda > -1) {
      const baru = [...keranjang];
      const jumlahBaru = baru[indeksAda].jumlah + jumlah;
      
      // Validasi Stok
      if (jumlahBaru > menu.stok) {
        Swal.fire({ icon: 'warning', title: 'Stok Terbatas', text: `Maaf, stok pizza '${menu.nama}' tidak cukup. Maksimal pembelian: ${menu.stok}` });
        return false;
      }

      baru[indeksAda].jumlah = jumlahBaru;
      if (catatan) baru[indeksAda].catatan = catatan;
      simpanKeranjang(baru);
    } else {
      // Validasi Stok
      if (jumlah > menu.stok) {
        Swal.fire({ icon: 'warning', title: 'Stok Terbatas', text: `Maaf, stok pizza '${menu.nama}' tidak cukup. Maksimal pembelian: ${menu.stok}` });
        return false;
      }
      simpanKeranjang([...keranjang, { menu, jumlah, catatan }]);
    }
    return true;
  };

  const hapusDariKeranjang = (menuId) => {
    const baru = keranjang.filter(item => item.menu.id !== menuId);
    simpanKeranjang(baru);
  };

  const ubahJumlahItem = (menuId, jumlah) => {
    if (jumlah <= 0) {
      hapusDariKeranjang(menuId);
      return;
    }

    const baru = keranjang.map(item => {
      if (item.menu.id === menuId) {
        if (jumlah > item.menu.stok) {
          Swal.fire({ icon: 'warning', title: 'Stok Terbatas', text: `Maaf, stok pizza '${item.menu.nama}' hanya tersedia ${item.menu.stok} porsi.` });
          return item;
        }
        return { ...item, jumlah };
      }
      return item;
    });
    simpanKeranjang(baru);
  };

  const ubahCatatanItem = (menuId, catatan) => {
    const baru = keranjang.map(item => {
      if (item.menu.id === menuId) {
        return { ...item, catatan };
      }
      return item;
    });
    simpanKeranjang(baru);
  };

  const kosongkanKeranjang = () => {
    simpanKeranjang([]);
  };

  const hitungTotalHarga = () => {
    return keranjang.reduce((total, item) => {
      if (!item || !item.menu || typeof item.menu.harga !== 'number') return total;
      return total + (item.menu.harga * item.jumlah);
    }, 0);
  };

  const hitungTotalItem = () => {
    return keranjang.reduce((total, item) => total + item.jumlah, 0);
  };

  return (
    <CartContext.Provider value={{
      keranjang,
      tambahKeKeranjang,
      hapusDariKeranjang,
      ubahJumlahItem,
      ubahCatatanItem,
      kosongkanKeranjang,
      hitungTotalHarga,
      hitungTotalItem
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
