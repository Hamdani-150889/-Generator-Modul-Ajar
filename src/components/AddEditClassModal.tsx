import React, { useState, useEffect } from 'react';
import { X, School, Check, Layers, UserCheck } from 'lucide-react';
import { DataKelas, TeacherUser } from '../types';

interface AddEditClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  classData?: DataKelas | null;
  onSaveClass: (kelas: DataKelas) => void;
  teacherList: TeacherUser[];
  tahunAjaranDefault?: string;
}

export const AddEditClassModal: React.FC<AddEditClassModalProps> = ({
  isOpen,
  onClose,
  classData,
  onSaveClass,
  teacherList,
  tahunAjaranDefault = '2025/2026',
}) => {
  const [namaKelas, setNamaKelas] = useState('');
  const [tingkat, setTingkat] = useState<'X' | 'XI' | 'XII'>('X');
  const [fase, setFase] = useState<'Fase E (Kelas X)' | 'Fase F (Kelas XI)' | 'Fase F (Kelas XII)' | 'Fase E & F'>('Fase E (Kelas X)');
  const [jurusan, setJurusan] = useState<'Umum / Fondasi' | 'MIPA' | 'IPS' | 'Bahasa' | 'Pilihan Vokasi'>('Umum / Fondasi');
  const [waliKelasId, setWaliKelasId] = useState('');
  const [jumlahSiswa, setJumlahSiswa] = useState(32);
  const [ruangKelas, setRuangKelas] = useState('Gedung A - R. 101');
  const [tahunAjaran, setTahunAjaran] = useState(tahunAjaranDefault);
  const [keterangan, setKeterangan] = useState('');

  useEffect(() => {
    if (classData) {
      setNamaKelas(classData.namaKelas);
      setTingkat(classData.tingkat);
      setFase(classData.fase);
      setJurusan(classData.jurusan);
      // find matching teacher
      const matchingTeacher = teacherList.find(t => t.namaLengkap === classData.waliKelas || t.nip === classData.nipWaliKelas);
      setWaliKelasId(matchingTeacher ? matchingTeacher.id : '');
      setJumlahSiswa(classData.jumlahSiswa || 32);
      setRuangKelas(classData.ruangKelas || '');
      setTahunAjaran(classData.tahunAjaran || tahunAjaranDefault);
      setKeterangan(classData.keterangan || '');
    } else {
      setNamaKelas('');
      setTingkat('X');
      setFase('Fase E (Kelas X)');
      setJurusan('Umum / Fondasi');
      setWaliKelasId(teacherList[0]?.id || '');
      setJumlahSiswa(32);
      setRuangKelas('Gedung A - R. 101');
      setTahunAjaran(tahunAjaranDefault);
      setKeterangan('Rombongan belajar reguler Kurikulum Merdeka');
    }
  }, [classData, isOpen, teacherList, tahunAjaranDefault]);

  if (!isOpen) return null;

  const handleTingkatChange = (newTingkat: 'X' | 'XI' | 'XII') => {
    setTingkat(newTingkat);
    if (newTingkat === 'X') {
      setFase('Fase E (Kelas X)');
      setJurusan('Umum / Fondasi');
      if (!classData && !namaKelas) setNamaKelas('X-D');
      if (!classData) setRuangKelas('Gedung A - R. 104');
    } else if (newTingkat === 'XI') {
      setFase('Fase F (Kelas XI)');
      setJurusan('MIPA');
      if (!classData && !namaKelas) setNamaKelas('XI-MIPA 3');
      if (!classData) setRuangKelas('Gedung B - R. 204');
    } else {
      setFase('Fase F (Kelas XII)');
      setJurusan('MIPA');
      if (!classData && !namaKelas) setNamaKelas('XII-MIPA 2');
      if (!classData) setRuangKelas('Gedung C - R. 303');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!namaKelas.trim()) return;

    const selectedTeacher = teacherList.find(t => t.id === waliKelasId);

    const updatedOrNewClass: DataKelas = {
      id: classData?.id || 'kelas-' + Date.now(),
      namaKelas: namaKelas.trim().toUpperCase(),
      tingkat,
      fase,
      jurusan,
      waliKelas: selectedTeacher?.namaLengkap || 'Belum Ditentukan',
      nipWaliKelas: selectedTeacher?.nip || '-',
      jumlahSiswa: Number(jumlahSiswa) || 30,
      ruangKelas: ruangKelas.trim() || 'Ruang Belajar',
      tahunAjaran: tahunAjaran.trim() || '2025/2026',
      keterangan: keterangan.trim(),
    };

    onSaveClass(updatedOrNewClass);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-xl w-full overflow-hidden shadow-2xl border border-slate-200">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-blue-700 via-indigo-700 to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center text-white">
              <School className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                {classData ? 'Edit Data Kelas & Rombel' : 'Tambah Data Kelas Baru'}
              </h3>
              <p className="text-xs text-blue-100">SMA Negeri 1 Lampasio — Administrasi Rombel</p>
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
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tingkat Kelas <span className="text-rose-500">*</span>
              </label>
              <select
                value={tingkat}
                onChange={(e) => handleTingkatChange(e.target.value as 'X' | 'XI' | 'XII')}
                className="w-full text-xs font-bold rounded-xl border border-slate-300 px-3 py-2 bg-white text-slate-800 focus:ring-2 focus:ring-blue-500"
              >
                <option value="X">Kelas X (Sepuluh)</option>
                <option value="XI">Kelas XI (Sebelas)</option>
                <option value="XII">Kelas XII (Dua Belas)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nama Kelas / Rombel <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="contoh: X-A atau XI-MIPA 1"
                value={namaKelas}
                onChange={(e) => setNamaKelas(e.target.value)}
                className="w-full text-xs font-bold rounded-xl border border-slate-300 px-3 py-2 bg-white text-slate-800 focus:ring-2 focus:ring-blue-500 uppercase"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Fase Kurikulum Merdeka
              </label>
              <select
                value={fase}
                onChange={(e) => setFase(e.target.value as any)}
                className="w-full text-xs rounded-xl border border-slate-300 px-3 py-2 bg-white text-slate-800"
              >
                <option value="Fase E (Kelas X)">Fase E (Kelas X)</option>
                <option value="Fase F (Kelas XI)">Fase F (Kelas XI)</option>
                <option value="Fase F (Kelas XII)">Fase F (Kelas XII)</option>
                <option value="Fase E & F">Fase E &amp; F</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Jurusan / Program Peminatan
              </label>
              <select
                value={jurusan}
                onChange={(e) => setJurusan(e.target.value as any)}
                className="w-full text-xs rounded-xl border border-slate-300 px-3 py-2 bg-white text-slate-800"
              >
                <option value="Umum / Fondasi">Umum / Fondasi (Kelas X)</option>
                <option value="MIPA">Peminatan MIPA (Sains &amp; Matematika)</option>
                <option value="IPS">Peminatan IPS (Sosial Humaniora)</option>
                <option value="Bahasa">Peminatan Bahasa &amp; Budaya</option>
                <option value="Pilihan Vokasi">Pilihan Vokasi &amp; Terapan</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Wali Kelas (Pilih Guru)
              </label>
              <select
                value={waliKelasId}
                onChange={(e) => setWaliKelasId(e.target.value)}
                className="w-full text-xs rounded-xl border border-slate-300 px-3 py-2 bg-white text-slate-800 focus:ring-2 focus:ring-blue-500"
              >
                <option value="">-- Pilih Guru Sebagai Wali Kelas --</option>
                {teacherList.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.namaLengkap} — Guru {t.mataPelajaran} (NIP: {t.nip})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Jumlah Siswa (Kapasitas Rombel)
              </label>
              <input
                type="number"
                min={1}
                max={50}
                value={jumlahSiswa}
                onChange={(e) => setJumlahSiswa(Number(e.target.value))}
                className="w-full text-xs font-bold rounded-xl border border-slate-300 px-3 py-2 bg-white text-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Ruang Kelas / Gedung
              </label>
              <input
                type="text"
                placeholder="misal: Gedung A - R. 101"
                value={ruangKelas}
                onChange={(e) => setRuangKelas(e.target.value)}
                className="w-full text-xs rounded-xl border border-slate-300 px-3 py-2 bg-white text-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tahun Ajaran
              </label>
              <input
                type="text"
                placeholder="2025/2026"
                value={tahunAjaran}
                onChange={(e) => setTahunAjaran(e.target.value)}
                className="w-full text-xs rounded-xl border border-slate-300 px-3 py-2 bg-white text-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Keterangan / Catatan Rombel
              </label>
              <input
                type="text"
                placeholder="misal: Kelas Unggulan Sains"
                value={keterangan}
                onChange={(e) => setKeterangan(e.target.value)}
                className="w-full text-xs rounded-xl border border-slate-300 px-3 py-2 bg-white text-slate-800"
              />
            </div>
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
              <Check className="w-4 h-4" />
              <span>{classData ? 'Simpan Perubahan Kelas' : 'Tambahkan Kelas Baru'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
