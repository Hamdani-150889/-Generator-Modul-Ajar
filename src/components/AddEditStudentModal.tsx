import React, { useState, useEffect } from 'react';
import { X, UserPlus, Check, User, Hash, GraduationCap } from 'lucide-react';
import { DataNilaiSiswa, DataKelas } from '../types';

interface AddEditStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentData?: DataNilaiSiswa | null;
  classList: DataKelas[];
  onSaveStudent: (student: DataNilaiSiswa) => void;
}

export const AddEditStudentModal: React.FC<AddEditStudentModalProps> = ({
  isOpen,
  onClose,
  studentData,
  classList,
  onSaveStudent,
}) => {
  const [nama, setNama] = useState('');
  const [nisn, setNisn] = useState('');
  const [kelas, setKelas] = useState('');
  const [nilaiFormatif, setNilaiFormatif] = useState(80);
  const [nilaiLKPD, setNilaiLKPD] = useState(85);
  const [nilaiSumatif, setNilaiSumatif] = useState(80);
  const [catatanGuru, setCatatanGuru] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (studentData) {
      setNama(studentData.nama);
      setNisn(studentData.nisn);
      setKelas(studentData.kelas);
      setNilaiFormatif(studentData.nilaiFormatif);
      setNilaiLKPD(studentData.nilaiLKPD);
      setNilaiSumatif(studentData.nilaiSumatif);
      setCatatanGuru(studentData.catatanGuru || '');
    } else {
      setNama('');
      setNisn(`00${Math.floor(10000000 + Math.random() * 90000000)}`);
      setKelas(classList[0]?.namaKelas || 'X-A');
      setNilaiFormatif(80);
      setNilaiLKPD(85);
      setNilaiSumatif(80);
      setCatatanGuru('Peserta didik aktif dan kooperatif');
    }
    setError(null);
  }, [studentData, isOpen, classList]);

  if (!isOpen) return null;

  // Final grade calculation: 30% Formatif + 30% LKPD + 40% Sumatif
  const hitungNilaiAkhir = Math.round(nilaiFormatif * 0.3 + nilaiLKPD * 0.3 + nilaiSumatif * 0.4);

  const getStatusKKTP = (score: number) => {
    if (score >= 89) return 'Sangat Tuntas (Pengayaan)';
    if (score >= 75) return 'Tuntas (Cakap)';
    if (score >= 61) return 'Cukup (Layak)';
    return 'Belum Tuntas (Perlu Remedial)';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nama.trim()) {
      setError('Nama peserta didik wajib diisi.');
      return;
    }

    const calculatedAkhir = hitungNilaiAkhir;
    const finalStudent: DataNilaiSiswa = {
      id: studentData ? studentData.id : `s-${Date.now()}`,
      nama: nama.trim(),
      nisn: nisn.trim() || `00${Math.floor(10000000 + Math.random() * 90000000)}`,
      kelas: kelas || classList[0]?.namaKelas || 'X-A',
      nilaiFormatif: Number(nilaiFormatif),
      nilaiLKPD: Number(nilaiLKPD),
      nilaiSumatif: Number(nilaiSumatif),
      nilaiAkhir: calculatedAkhir,
      statusKetercapaian: getStatusKKTP(calculatedAkhir),
      catatanGuru: catatanGuru.trim() || 'Aktif mengikuti kegiatan pembelajaran',
    };

    onSaveStudent(finalStudent);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center text-white">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                {studentData ? 'Edit Data Peserta Didik' : 'Tambah Peserta Didik Baru'}
              </h3>
              <p className="text-xs text-blue-100">Administrasi Data Siswa SMAN 1 Lampasio</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-semibold">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Nama Lengkap Peserta Didik <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                required
                placeholder="contoh: Andi Muh. Rizky Pratama"
                value={nama}
                onChange={(e) => setNama(e.target.value)}
                className="w-full text-xs rounded-xl border border-slate-300 pl-9 pr-3 py-2.5 bg-white text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                NISN (Nomor Induk Siswa Nasional)
              </label>
              <div className="relative">
                <Hash className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="contoh: 0078129011"
                  value={nisn}
                  onChange={(e) => setNisn(e.target.value)}
                  className="w-full text-xs font-mono rounded-xl border border-slate-300 pl-9 pr-3 py-2.5 bg-white text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Rombel / Kelas <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <GraduationCap className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <select
                  value={kelas}
                  onChange={(e) => setKelas(e.target.value)}
                  className="w-full text-xs rounded-xl border border-slate-300 pl-9 pr-3 py-2.5 bg-white text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                >
                  {classList.map((c) => (
                    <option key={c.id} value={c.namaKelas}>
                      Kelas {c.namaKelas} ({c.fase})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Grades Input */}
          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800">Nilai Awal & Status Ketercapaian:</span>
              <span className="text-xs font-black text-blue-700 bg-blue-100 px-2 py-0.5 rounded-md">
                Nilai Akhir: {hitungNilaiAkhir}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-[10px] font-bold text-slate-600 mb-1">
                  Formatif (30%)
                </label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={nilaiFormatif}
                  onChange={(e) => setNilaiFormatif(Number(e.target.value))}
                  className="w-full text-center text-xs font-bold rounded-lg border border-slate-300 py-1.5 bg-white text-slate-900 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-600 mb-1">
                  LKPD (30%)
                </label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={nilaiLKPD}
                  onChange={(e) => setNilaiLKPD(Number(e.target.value))}
                  className="w-full text-center text-xs font-bold rounded-lg border border-slate-300 py-1.5 bg-white text-slate-900 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-600 mb-1">
                  Sumatif (40%)
                </label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={nilaiSumatif}
                  onChange={(e) => setNilaiSumatif(Number(e.target.value))}
                  className="w-full text-center text-xs font-bold rounded-lg border border-slate-300 py-1.5 bg-white text-slate-900 focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <p className="text-[11px] text-slate-500 font-medium">
              Predikat: <strong className="text-slate-800">{getStatusKKTP(hitungNilaiAkhir)}</strong>
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Catatan Perkembangan Siswa
            </label>
            <textarea
              rows={2}
              placeholder="Catatan guru terhadap keaktifan, kendala, atau prestasi siswa..."
              value={catatanGuru}
              onChange={(e) => setCatatanGuru(e.target.value)}
              className="w-full text-xs rounded-xl border border-slate-300 p-3 bg-white text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md shadow-blue-500/20 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
              <span>{studentData ? 'Simpan Perubahan' : 'Tambahkan Siswa'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
