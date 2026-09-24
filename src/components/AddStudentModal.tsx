import React, { useState } from 'react';
import { X, UserPlus, Sparkles, Check, Users } from 'lucide-react';
import { DataNilaiSiswa } from '../types';

interface AddStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddStudent: (student: DataNilaiSiswa) => void;
  currentClassList?: string[];
}

export const AddStudentModal: React.FC<AddStudentModalProps> = ({
  isOpen,
  onClose,
  onAddStudent,
  currentClassList = ['X-A', 'X-B', 'X-C', 'XI-MIPA 1', 'XI-MIPA 2', 'XI-IPS 1', 'XI-IPS 2', 'XII-MIPA', 'XII-IPS'],
}) => {
  const [nama, setNama] = useState('');
  const [nisn, setNisn] = useState('');
  const [kelas, setKelas] = useState('X-A');
  const [customKelas, setCustomKelas] = useState('');
  const [nilaiFormatif, setNilaiFormatif] = useState(80);
  const [nilaiLKPD, setNilaiLKPD] = useState(85);
  const [nilaiSumatif, setNilaiSumatif] = useState(80);
  const [catatanGuru, setCatatanGuru] = useState('');

  if (!isOpen) return null;

  const calculateFinal = (f: number, l: number, s: number) => {
    return Math.round(f * 0.3 + l * 0.3 + s * 0.4);
  };

  const getStatus = (score: number) => {
    if (score >= 89) return 'Sangat Tuntas (Pengayaan)';
    if (score >= 75) return 'Tuntas (Cakap)';
    if (score >= 61) return 'Cukup (Layak)';
    return 'Belum Tuntas (Perlu Remedial)';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nama.trim()) return;

    const selectedClass = kelas === 'custom' ? (customKelas.trim() || 'X-A') : kelas;
    const finalGrade = calculateFinal(nilaiFormatif, nilaiLKPD, nilaiSumatif);
    const status = getStatus(finalGrade);

    const newStudent: DataNilaiSiswa = {
      id: 'siswa-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
      nisn: nisn.trim() || '00' + Math.floor(10000000 + Math.random() * 90000000),
      nama: nama.trim(),
      kelas: selectedClass,
      nilaiFormatif: Number(nilaiFormatif),
      nilaiLKPD: Number(nilaiLKPD),
      nilaiSumatif: Number(nilaiSumatif),
      nilaiAkhir: finalGrade,
      statusKetercapaian: status,
      catatanGuru: catatanGuru.trim() || 'Peserta didik aktif dalam kegiatan pembelajaran',
    };

    onAddStudent(newStudent);
    onClose();

    // Reset form
    setNama('');
    setNisn('');
    setCatatanGuru('');
    setNilaiFormatif(80);
    setNilaiLKPD(85);
    setNilaiSumatif(80);
  };

  const currentFinal = calculateFinal(nilaiFormatif, nilaiLKPD, nilaiSumatif);
  const currentStatus = getStatus(currentFinal);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-blue-700 to-indigo-800 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center text-white">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Tambah Data Siswa Baru</h3>
              <p className="text-xs text-blue-100">Buku Nilai & Rekapitulasi SMAN 1 Lampasio</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nama Lengkap Siswa <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="contoh: Muhammad Rizky Lampasio"
                value={nama}
                onChange={(e) => setNama(e.target.value)}
                className="w-full text-xs rounded-lg border border-slate-300 px-3 py-2 bg-white text-slate-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                NISN (Nomor Induk Siswa Nasional)
              </label>
              <input
                type="text"
                placeholder="10 digit (opsional/auto)"
                value={nisn}
                onChange={(e) => setNisn(e.target.value)}
                className="w-full text-xs font-mono rounded-lg border border-slate-300 px-3 py-2 bg-white text-slate-800 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Kelas / Rombel <span className="text-rose-500">*</span>
              </label>
              <select
                value={kelas}
                onChange={(e) => setKelas(e.target.value)}
                className="w-full text-xs rounded-lg border border-slate-300 px-3 py-2 bg-white text-slate-800 focus:ring-2 focus:ring-blue-500"
              >
                {currentClassList.map((cls) => (
                  <option key={cls} value={cls}>
                    Kelas {cls}
                  </option>
                ))}
                <option value="custom">+ Kelas Lainnya...</option>
              </select>
            </div>

            {kelas === 'custom' && (
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nama Kelas Kustom
                </label>
                <input
                  type="text"
                  placeholder="misal: X-D atau XII-Bahasa"
                  value={customKelas}
                  onChange={(e) => setCustomKelas(e.target.value)}
                  className="w-full text-xs rounded-lg border border-slate-300 px-3 py-2 bg-white text-slate-800"
                />
              </div>
            )}
          </div>

          {/* Nilai Input Grid */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800">Komponen Penilaian (0-100)</span>
              <span className="text-[11px] text-slate-500">Bobot: 30% Formatif + 30% LKPD + 40% Sumatif</span>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Formatif (30%)
                </label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={nilaiFormatif}
                  onChange={(e) => setNilaiFormatif(Math.max(0, Math.min(100, Number(e.target.value))))}
                  className="w-full text-center text-xs font-bold rounded-lg border border-slate-300 py-1.5 bg-white text-slate-800"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  LKPD (30%)
                </label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={nilaiLKPD}
                  onChange={(e) => setNilaiLKPD(Math.max(0, Math.min(100, Number(e.target.value))))}
                  className="w-full text-center text-xs font-bold rounded-lg border border-slate-300 py-1.5 bg-white text-slate-800"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Sumatif (40%)
                </label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={nilaiSumatif}
                  onChange={(e) => setNilaiSumatif(Math.max(0, Math.min(100, Number(e.target.value))))}
                  className="w-full text-center text-xs font-bold rounded-lg border border-slate-300 py-1.5 bg-white text-slate-800"
                />
              </div>
            </div>

            {/* Live Calculation Preview */}
            <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs">
              <span className="text-slate-600 font-medium">Kalkulasi Nilai Akhir:</span>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-blue-700 text-sm">{currentFinal}</span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    currentFinal >= 75
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-rose-100 text-rose-800'
                  }`}
                >
                  {currentStatus}
                </span>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Catatan / Refleksi Guru Terhadap Siswa
            </label>
            <input
              type="text"
              placeholder="contoh: Sangat aktif dalam presentasi dan pengerjaan LKPD"
              value={catatanGuru}
              onChange={(e) => setCatatanGuru(e.target.value)}
              className="w-full text-xs rounded-lg border border-slate-300 px-3 py-2 bg-white text-slate-800"
            />
          </div>

          {/* Footer Action Buttons */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>Simpan Siswa ke Buku Nilai</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
