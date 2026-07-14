import React, { useState, useEffect } from 'react';
import { FileText, Printer, Download, TrendingUp } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Reports() {
  const { token } = useAuth();
  const [tanggalAwal, setTanggalAwal] = useState(new Date(Date.now() - 30 * 24 * 3600000).toISOString().split('T')[0]);
  const [tanggalAkhir, setTanggalAkhir] = useState(new Date().toISOString().split('T')[0]);
  const [pdfLoading, setPdfLoading] = useState(false);

  const [pesananSelesai, setPesananSelesai] = useState([]);
  const [ringkasanProduk, setRingkasanProduk] = useState([]);
  const [totalPendapatan, setTotalPendapatan] = useState(0);

  useEffect(() => {
    hitungLaporan();
  }, [tanggalAwal, tanggalAkhir]);

  const hitungLaporan = async () => {
    try {
      const params = new URLSearchParams({
        tanggal_awal: tanggalAwal,
        tanggal_akhir: tanggalAkhir,
      });

      const response = await fetch(`http://localhost:9000/api/reports/json?${params.toString()}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Gagal memuat laporan');
      
      const data = await response.json();
      
      setTotalPendapatan(data.total_pendapatan || 0);
      setRingkasanProduk(data.ringkasan_produk || []);
      setPesananSelesai(data.pesanan_detail || []);
      
    } catch (error) {
      console.error(error);
    }
  };

  const handleCetakLaporan = () => {
    window.print();
  };

  const handleUnduhPDF = async () => {
    if (!token || token === 'mock_jwt_token_vipizza') {
      alert('Fitur ini hanya tersedia saat backend aktif dan Anda sudah login sebagai admin.');
      return;
    }

    setPdfLoading(true);
    try {
      const params = new URLSearchParams({
        tanggal_awal: tanggalAwal,
        tanggal_akhir: tanggalAkhir,
      });

      const response = await fetch(`http://localhost:9000/api/reports/pdf?${params.toString()}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => null);
        throw new Error(errData?.error || 'Gagal mengunduh file PDF');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Laporan_Vipizza_${tanggalAkhir}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('PDF download error:', error);
      alert(error.message || 'Gagal mengunduh file PDF. Pastikan backend berjalan.');
    } finally {
      setPdfLoading(false);
    }
  };

  return (
    <div className="text-left print:p-0 print:bg-white">
      <div className="mb-8 print:hidden">
        <p className="text-[#0b5345] font-semibold text-xs uppercase tracking-wider">Laporan</p>
        <h2 className="page-title mt-1">Laporan Penjualan</h2>
        <p className="page-subtitle">Rekap transaksi pizza homemade UMKM Padang</p>
      </div>
      <div className="flex gap-3 mb-8 print:hidden">
          <button className="btn-secondary text-xs py-2.5 px-4 flex items-center gap-1.5" onClick={handleCetakLaporan}>
            <Printer className="w-4 h-4" /> Cetak
          </button>
          <button
            className="btn-primary text-xs py-2.5 px-4 flex items-center gap-1.5"
            onClick={handleUnduhPDF}
            disabled={pdfLoading}
          >
            <Download className="w-4 h-4" /> {pdfLoading ? 'Mengunduh...' : 'Unduh PDF'}
          </button>
      </div>

      {/* Filter Kontrol - Disembunyikan saat Cetak/Print */}
      <div className="border border-slate-200/50 shadow-sm bg-white rounded-2xl p-6 mb-8 print:hidden flex flex-col sm:flex-row items-center gap-6 text-left w-full">
        
        <div className="flex flex-col gap-1 text-xs text-slate-500 text-left">
          <span className="font-bold text-slate-700">Pilih Tanggal Awal</span>
          <input 
            type="date"
            value={tanggalAwal}
            onChange={(e) => setTanggalAwal(e.target.value)}
            className="border border-slate-200 rounded-xl p-2.5 bg-slate-50 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 font-bold"
          />
        </div>

        <div className="flex flex-col gap-1 text-xs text-slate-500 text-left">
          <span className="font-bold text-slate-700">Pilih Tanggal Akhir</span>
          <input 
            type="date"
            value={tanggalAkhir}
            onChange={(e) => setTanggalAkhir(e.target.value)}
            className="border border-slate-200 rounded-xl p-2.5 bg-slate-50 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 font-bold"
          />
        </div>

        <div className="text-slate-400 text-xs leading-relaxed max-w-sm mt-4 sm:mt-0 text-left">
          💡 Laporan penjualan hanya menghitung pesanan yang berstatus <span className="font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">Selesai</span>. Pesanan dibatalkan atau tertunda tidak dimasukkan ke dalam neraca pendapatan.
        </div>

      </div>

      {/* ================= AREA LAPORAN UNTUK DICETAK ================= */}
      <div id="printableArea" className="bg-white border border-slate-200 p-8 rounded-3xl shadow-sm print:border-none print:shadow-none print:p-0">
        
        {/* Kertas Kop Cetak Laporan */}
        <div className="text-center flex flex-col items-center gap-2 mb-6">
          <h2 className="font-extrabold text-[#0b5345] text-2xl tracking-wide uppercase">
            VIPIZZA HOMEMADE PADANG
          </h2>
          <p className="text-slate-500 text-[10px] leading-relaxed -mt-1 font-semibold">
            Sistem Informasi Penjualan & Pemesanan Online Kuliner Kota Padang
          </p>
          <p className="text-slate-400 text-[9px] -mt-1">
            Jl. Khatib Sulaiman No. 12, Lolong Belanti, Padang Utara, Padang, Sumatera Barat
          </p>
          <div className="h-0.5 bg-pink-500 w-full my-2" />
        </div>

        {/* Sub-Header Dokumen */}
        <div className="flex justify-between items-start mb-6 text-xs text-slate-600">
          <div>
            <p className="font-bold text-slate-800 text-sm">
              LAPORAN PENJUALAN KULINER
            </p>
            <p className="mt-1">
              <span className="font-semibold">Periode Laporan:</span> {tanggalAwal} s/d {tanggalAkhir}
            </p>
          </div>
          <div className="text-right">
            <p><span className="font-semibold">Tanggal Cetak:</span> {new Date().toLocaleDateString('id-ID', {
              day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
            })} WIB</p>
            <p><span className="font-semibold">Status Data:</span> Selesai Terkirim</p>
          </div>
        </div>

        {/* Ringkasan Neraca KPI */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="p-4 border border-slate-100 bg-pink-500/5 rounded-2xl flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-pink-100 flex items-center justify-center text-pink-600 shrink-0">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-semibold block uppercase leading-none">Total Pendapatan Bersih</span>
              <span className="font-extrabold text-pink-600 text-lg block mt-1">
                Rp {totalPendapatan.toLocaleString('id-ID')}
              </span>
            </div>
          </div>

          <div className="p-4 border border-slate-100 bg-slate-50 rounded-2xl flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-200/80 flex items-center justify-center text-slate-600 shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-semibold block uppercase leading-none">Jumlah Transaksi Berhasil</span>
              <span className="font-extrabold text-slate-800 text-lg block mt-1">
                {pesananSelesai.length} Transaksi Selesai
              </span>
            </div>
          </div>
        </div>

        {/* Bagian 1: Ringkasan Produk Terjual */}
        <h4 className="font-bold text-slate-800 text-sm mb-3">
          1. Rincian Kuantitas Pizza / Menu Terjual
        </h4>
        
        {ringkasanProduk.length > 0 ? (
          <div className="border border-slate-200/50 shadow-sm bg-white rounded-2xl p-2 overflow-x-auto mb-8">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-xs font-bold uppercase tracking-wider text-slate-400">
                  <th className="px-5 py-4">NO</th>
                  <th className="px-5 py-4">NAMA HIDANGAN</th>
                  <th className="px-5 py-4 text-center">KUANTITAS TERJUAL</th>
                  <th className="px-5 py-4 text-right">TOTAL PENDAPATAN</th>
                </tr>
              </thead>
              <tbody>
                {ringkasanProduk.map((item, idx) => (
                  <tr key={idx} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                    <td className="px-5 py-4 w-10">{idx + 1}</td>
                    <td className="px-5 py-4 font-bold text-slate-800">{item.menu_nama}</td>
                    <td className="px-5 py-4 text-center font-bold text-slate-700">{item.jumlah_terjual} Porsi</td>
                    <td className="px-5 py-4 text-right font-extrabold text-pink-600">
                      Rp {item.total_uang.toLocaleString('id-ID')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-center text-xs text-slate-400 py-8 border border-slate-200 rounded-2xl mb-8">
            Belum ada penjualan menu yang tercatat pada periode ini.
          </p>
        )}

        {/* Bagian 2: Transaksi Rinci */}
        <h4 className="font-bold text-slate-800 text-sm mb-3">
          2. Rincian Rekapitulasi Transaksi Selesai
        </h4>
        
        {pesananSelesai.length > 0 ? (
          <div className="border border-slate-200/50 shadow-sm bg-white rounded-2xl p-2 overflow-x-auto mb-8">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-xs font-bold uppercase tracking-wider text-slate-400">
                  <th className="px-5 py-4">ID TRANSAKSI</th>
                  <th className="px-5 py-4">METODE BAYAR</th>
                  <th className="px-5 py-4">NO TELEPON</th>
                  <th className="px-5 py-4 text-right">TOTAL BELANJA</th>
                </tr>
              </thead>
              <tbody>
                {pesananSelesai.map((pes) => (
                  <tr key={pes.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                    <td className="px-5 py-4 font-bold text-slate-800">#{pes.id}</td>
                    <td className="px-5 py-4 uppercase text-xs font-semibold text-slate-500">{pes.metode_pembayaran}</td>
                    <td className="px-5 py-4 text-slate-600 text-xs">{pes.pengguna?.telepon || '-'}</td>
                    <td className="px-5 py-4 text-right font-extrabold text-pink-600">
                      Rp {pes.total_harga.toLocaleString('id-ID')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-center text-xs text-slate-400 py-8 border border-slate-200 rounded-2xl mb-8">
            Tidak ada data transaksi masuk.
          </p>
        )}

        {/* Footer Tanda Tangan */}
        <div className="mt-16 flex justify-between items-center text-xs text-slate-700">
          <div>
            <p className="italic">Vipizza Homemade Padang System</p>
            <p className="text-[10px] text-slate-400 mt-1">Dicetak otomatis dari Dashboard Admin</p>
          </div>
          <div className="text-right flex flex-col items-end gap-12">
            <div>
              <p>Padang, {new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
              <p className="font-semibold text-slate-800 mt-0.5">Pemilik UMKM Vipizza</p>
            </div>
            <div>
              <p className="font-bold text-slate-800 border-t border-slate-400 pt-1 px-4">Management Team</p>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
