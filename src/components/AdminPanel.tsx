import React, { useState } from 'react';
import {
  School,
  Users,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  Download,
  Upload,
  RotateCcw,
  CheckCircle2,
  UserCheck,
  ShieldCheck,
  GraduationCap,
  BookOpen,
  ArrowRight,
  Sparkles,
  Layers,
  Building2,
  LogIn,
  Info,
  KeyRound,
  FileSpreadsheet,
  Printer
} from 'lucide-react';
import { DataKelas, TeacherUser, SchoolProfile, TabType } from '../types';
import { AddEditClassModal } from './AddEditClassModal';
import { AddEditTeacherModal } from './AddEditTeacherModal';

interface AdminPanelProps {
  classList: DataKelas[];
  teacherList: TeacherUser[];
  schoolProfile: SchoolProfile;
  currentTeacher: TeacherUser;
  onSaveClassList: (classes: DataKelas[]) => void;
  onSaveTeacherList: (teachers: TeacherUser[]) => void;
  onSwitchTeacher: (teacher: TeacherUser) => void;
  onNavigateTab: (tab: TabType) => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  classList,
  teacherList,
  schoolProfile,
  currentTeacher,
  onSaveClassList,
  onSaveTeacherList,
  onSwitchTeacher,
  onNavigateTab,
}) => {
  const [activeAdminSubTab, setActiveAdminSubTab] = useState<'kelas' | 'guru' | 'rekap' | 'profil'>('kelas');

  // Search & Filters for Kelas
  const [searchKelas, setSearchKelas] = useState('');
  const [filterTingkatKelas, setFilterTingkatKelas] = useState<'ALL' | 'X' | 'XI' | 'XII'>('ALL');
  const [filterJurusanKelas, setFilterJurusanKelas] = useState<string>('ALL');

  // Search & Filters for Guru
  const [searchGuru, setSearchGuru] = useState('');
  const [filterRumpunGuru, setFilterRumpunGuru] = useState<string>('ALL');
  const [filterRoleGuru, setFilterRoleGuru] = useState<string>('ALL');

  // Modals state
  const [isClassModalOpen, setIsClassModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<DataKelas | null>(null);

  const [isTeacherModalOpen, setIsTeacherModalOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<TeacherUser | null>(null);

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // --- Handlers for Kelas ---
  const handleOpenAddClass = () => {
    setEditingClass(null);
    setIsClassModalOpen(true);
  };

  const handleOpenEditClass = (item: DataKelas) => {
    setEditingClass(item);
    setIsClassModalOpen(true);
  };

  const handleSaveClass = (item: DataKelas) => {
    const exists = classList.some((c) => c.id === item.id);
    let updated: DataKelas[];
    if (exists) {
      updated = classList.map((c) => (c.id === item.id ? item : c));
      showToast(`Data kelas ${item.namaKelas} berhasil diperbarui!`);
    } else {
      updated = [item, ...classList];
      showToast(`Kelas baru ${item.namaKelas} berhasil ditambahkan!`);
    }
    onSaveClassList(updated);
  };

  const handleDeleteClass = (id: string, nama: string) => {
    if (window.confirm(`Apakah Anda yakin ingin menghapus data kelas ${nama}?`)) {
      const updated = classList.filter((c) => c.id !== id);
      onSaveClassList(updated);
      showToast(`Kelas ${nama} telah dihapus.`);
    }
  };

  // --- Handlers for Guru ---
  const handleOpenAddTeacher = () => {
    setEditingTeacher(null);
    setIsTeacherModalOpen(true);
  };

  const handleOpenEditTeacher = (item: TeacherUser) => {
    setEditingTeacher(item);
    setIsTeacherModalOpen(true);
  };

  const handleSaveTeacher = (item: TeacherUser) => {
    const exists = teacherList.some((t) => t.id === item.id);
    let updated: TeacherUser[];
    if (exists) {
      updated = teacherList.map((t) => (t.id === item.id ? item : t));
      showToast(`Data guru ${item.namaLengkap} berhasil diperbarui!`);
    } else {
      updated = [item, ...teacherList];
      showToast(`Guru baru ${item.namaLengkap} berhasil didaftarkan!`);
    }
    onSaveTeacherList(updated);
  };

  const handleDeleteTeacher = (id: string, nama: string) => {
    if (id === currentTeacher.id) {
      alert('Anda tidak dapat menghapus akun Anda sendiri yang sedang aktif login.');
      return;
    }
    if (window.confirm(`Apakah Anda yakin ingin menghapus data guru ${nama}? Akun login dan data terkait guru ini akan dinonaktifkan.`)) {
      const updated = teacherList.filter((t) => t.id !== id);
      onSaveTeacherList(updated);
      showToast(`Data guru ${nama} telah dihapus.`);
    }
  };

  // Quick switch / Impersonate teacher
  const handleDirectLoginAsTeacher = (t: TeacherUser) => {
    onSwitchTeacher(t);
    showToast(`Berhasil beralih sesi login sebagai ${t.namaLengkap} (${t.mataPelajaran})`);
  };

  // Export Kelas CSV
  const handleExportKelasCSV = () => {
    const headers = ['ID', 'Nama Kelas', 'Tingkat', 'Fase', 'Jurusan', 'Wali Kelas', 'NIP Wali Kelas', 'Jumlah Siswa', 'Ruang Kelas', 'Tahun Ajaran'];
    const rows = classList.map((c) => [
      c.id,
      `"${c.namaKelas}"`,
      `"${c.tingkat}"`,
      `"${c.fase}"`,
      `"${c.jurusan}"`,
      `"${c.waliKelas}"`,
      `"${c.nipWaliKelas}"`,
      c.jumlahSiswa,
      `"${c.ruangKelas}"`,
      `"${c.tahunAjaran}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `DATA_ROMBEL_KELAS_SMAN1_LAMPASIO_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Data Rombel Kelas berhasil diekspor ke CSV!');
  };

  // Export Guru CSV
  const handleExportGuruCSV = () => {
    const headers = ['ID', 'Nama Lengkap', 'NIP', 'Mata Pelajaran', 'Rumpun Mapel', 'Fase Default', 'Status Kepegawaian', 'Email', 'Username', 'Role'];
    const rows = teacherList.map((t) => [
      t.id,
      `"${t.namaLengkap}"`,
      `"${t.nip}"`,
      `"${t.mataPelajaran}"`,
      `"${t.rumpunMapel}"`,
      `"${t.faseDefault}"`,
      `"${t.statusKepegawaian || 'PNS'}"`,
      `"${t.email}"`,
      `"${t.username}"`,
      `"${t.role}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `DATA_GURU_SMAN1_LAMPASIO_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Data Guru & Tendik berhasil diekspor ke CSV!');
  };

  // Filtered Kelas
  const filteredKelas = classList.filter((c) => {
    const matchSearch =
      c.namaKelas.toLowerCase().includes(searchKelas.toLowerCase()) ||
      c.waliKelas.toLowerCase().includes(searchKelas.toLowerCase()) ||
      c.ruangKelas.toLowerCase().includes(searchKelas.toLowerCase());
    const matchTingkat = filterTingkatKelas === 'ALL' || c.tingkat === filterTingkatKelas;
    const matchJurusan = filterJurusanKelas === 'ALL' || c.jurusan === filterJurusanKelas;
    return matchSearch && matchTingkat && matchJurusan;
  });

  // Filtered Guru
  const filteredGuru = teacherList.filter((t) => {
    const matchSearch =
      t.namaLengkap.toLowerCase().includes(searchGuru.toLowerCase()) ||
      t.nip.toLowerCase().includes(searchGuru.toLowerCase()) ||
      t.mataPelajaran.toLowerCase().includes(searchGuru.toLowerCase()) ||
      t.email.toLowerCase().includes(searchGuru.toLowerCase()) ||
      t.username.toLowerCase().includes(searchGuru.toLowerCase());
    const matchRumpun = filterRumpunGuru === 'ALL' || t.rumpunMapel === filterRumpunGuru;
    const matchRole = filterRoleGuru === 'ALL' || t.role === filterRoleGuru;
    return matchSearch && matchRumpun && matchRole;
  });

  // Calculations for Rekap
  const totalSiswaRombel = classList.reduce((acc, c) => acc + (c.jumlahSiswa || 0), 0);
  const countKelasX = classList.filter((c) => c.tingkat === 'X').length;
  const countKelasXI = classList.filter((c) => c.tingkat === 'XI').length;
  const countKelasXII = classList.filter((c) => c.tingkat === 'XII').length;

  const countGuruMIPA = teacherList.filter((t) => t.rumpunMapel === 'MIPA').length;
  const countGuruIPS = teacherList.filter((t) => t.rumpunMapel === 'IPS').length;
  const countGuruBahasa = teacherList.filter((t) => t.rumpunMapel === 'Bahasa').length;
  const countGuruUmum = teacherList.filter((t) => t.rumpunMapel === 'Umum & Vokasi').length;
  const countManajemen = teacherList.filter((t) => t.rumpunMapel === 'Manajemen & Konseling').length;

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-slate-700 animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span className="text-sm font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Admin Banner & Sub-Navigation */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-100">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-700 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black text-slate-900 tracking-tight">Panel Administrasi &amp; Data Master</h1>
                <span className="px-2.5 py-0.5 rounded-full text-2xs font-black bg-blue-100 text-blue-800 uppercase tracking-wider border border-blue-200">
                  Admin SMAN 1 Lampasio
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-0.5">
                Kelola data master rombongan belajar (kelas), data guru pengampu, akun login, dan profil sekolah secara terpusat.
              </p>
            </div>
          </div>

          {/* Quick Metrics Header */}
          <div className="flex items-center gap-3 bg-slate-50 p-2.5 rounded-2xl border border-slate-200/80">
            <div className="text-center px-3 border-r border-slate-200">
              <div className="text-lg font-black text-blue-700">{classList.length}</div>
              <div className="text-2xs font-bold text-slate-500 uppercase">Total Kelas</div>
            </div>
            <div className="text-center px-3 border-r border-slate-200">
              <div className="text-lg font-black text-indigo-700">{teacherList.length}</div>
              <div className="text-2xs font-bold text-slate-500 uppercase">Total Guru</div>
            </div>
            <div className="text-center px-3">
              <div className="text-lg font-black text-emerald-700">{totalSiswaRombel}</div>
              <div className="text-2xs font-bold text-slate-500 uppercase">Kapasitas Siswa</div>
            </div>
          </div>
        </div>

        {/* Sub Menu Navigation Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-4">
          <button
            onClick={() => setActiveAdminSubTab('kelas')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeAdminSubTab === 'kelas'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200/80'
            }`}
          >
            <School className="w-4 h-4" />
            <span>Data Master Kelas &amp; Rombel ({classList.length})</span>
          </button>

          <button
            onClick={() => setActiveAdminSubTab('guru')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeAdminSubTab === 'guru'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200/80'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Data Master Guru &amp; Tendik ({teacherList.length})</span>
          </button>

          <button
            onClick={() => setActiveAdminSubTab('rekap')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeAdminSubTab === 'rekap'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-500/20'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200/80'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Rekapitulasi &amp; Statistik Sekolah</span>
          </button>
        </div>
      </div>

      {/* SUB-TAB 1: MANAJEMEN DATA KELAS */}
      {activeAdminSubTab === 'kelas' && (
        <div className="space-y-4 animate-fadeIn">
          {/* Controls Bar */}
          <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3 flex-1">
              {/* Search Bar */}
              <div className="relative flex-1 min-w-[200px]">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Cari nama kelas, wali kelas, ruang..."
                  value={searchKelas}
                  onChange={(e) => setSearchKelas(e.target.value)}
                  className="w-full text-xs font-medium pl-9 pr-3 py-2 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Filter Tingkat */}
              <div className="flex items-center gap-1.5">
                <span className="text-2xs font-bold text-slate-500 uppercase">Tingkat:</span>
                <select
                  value={filterTingkatKelas}
                  onChange={(e) => setFilterTingkatKelas(e.target.value as any)}
                  className="text-xs font-semibold rounded-xl border border-slate-300 px-2.5 py-2 bg-white text-slate-700"
                >
                  <option value="ALL">Semua Tingkat</option>
                  <option value="X">Kelas X (Fase E)</option>
                  <option value="XI">Kelas XI (Fase F)</option>
                  <option value="XII">Kelas XII (Fase F)</option>
                </select>
              </div>

              {/* Filter Jurusan */}
              <div className="flex items-center gap-1.5">
                <span className="text-2xs font-bold text-slate-500 uppercase">Peminatan:</span>
                <select
                  value={filterJurusanKelas}
                  onChange={(e) => setFilterJurusanKelas(e.target.value)}
                  className="text-xs font-semibold rounded-xl border border-slate-300 px-2.5 py-2 bg-white text-slate-700"
                >
                  <option value="ALL">Semua Jurusan</option>
                  <option value="Umum / Fondasi">Umum / Fondasi</option>
                  <option value="MIPA">MIPA</option>
                  <option value="IPS">IPS</option>
                  <option value="Bahasa">Bahasa</option>
                  <option value="Pilihan Vokasi">Pilihan Vokasi</option>
                </select>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleExportKelasCSV}
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
                title="Ekspor daftar kelas ke format CSV"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                <span>Export CSV</span>
              </button>

              <button
                onClick={handleOpenAddClass}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Kelas Baru</span>
              </button>
            </div>
          </div>

          {/* Grid / Table of Kelas */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredKelas.map((k) => (
              <div
                key={k.id}
                className="bg-white rounded-2xl p-5 shadow-xs border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="w-10 h-10 rounded-xl bg-blue-100 text-blue-800 font-black text-sm flex items-center justify-center border border-blue-200">
                        {k.namaKelas}
                      </span>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-2xs font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                            Kelas {k.tingkat}
                          </span>
                          <span
                            className={`text-2xs font-bold px-2 py-0.5 rounded-md ${
                              k.jurusan === 'MIPA'
                                ? 'bg-emerald-100 text-emerald-800'
                                : k.jurusan === 'IPS'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-indigo-100 text-indigo-800'
                            }`}
                          >
                            {k.jurusan}
                          </span>
                        </div>
                        <span className="text-2xs text-slate-500 font-medium block mt-0.5">
                          {k.fase}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEditClass(k)}
                        className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit data kelas"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteClass(k.id, k.namaKelas)}
                        className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Hapus kelas"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Class Info Details */}
                  <div className="space-y-2 py-2 border-t border-slate-100 text-xs">
                    <div className="flex items-center justify-between text-slate-700">
                      <span className="text-slate-500 text-2xs uppercase font-bold">Wali Kelas:</span>
                      <span className="font-semibold truncate max-w-[180px] text-right" title={k.waliKelas}>
                        {k.waliKelas}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-slate-700">
                      <span className="text-slate-500 text-2xs uppercase font-bold">Kapasitas Siswa:</span>
                      <span className="font-bold text-slate-800">{k.jumlahSiswa} Siswa</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-700">
                      <span className="text-slate-500 text-2xs uppercase font-bold">Ruang Belajar:</span>
                      <span className="text-slate-700 font-medium">{k.ruangKelas}</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-700">
                      <span className="text-slate-500 text-2xs uppercase font-bold">Tahun Ajaran:</span>
                      <span className="text-slate-600 font-mono text-2xs">{k.tahunAjaran}</span>
                    </div>
                    {k.keterangan && (
                      <p className="text-2xs text-slate-500 italic bg-slate-50 p-2 rounded-lg mt-1 border border-slate-100">
                        "{k.keterangan}"
                      </p>
                    )}
                  </div>
                </div>

                {/* Footer Quick Action */}
                <div className="pt-3 mt-2 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-2xs text-slate-600">SMAN 1 Lampasio</span>
                  <button
                    onClick={() => {
                      onNavigateTab('asesmen');
                      showToast(`Membuka Buku Penilaian untuk rombel ${k.namaKelas}`);
                    }}
                    className="text-2xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 hover:underline cursor-pointer"
                  >
                    <span>Buka Penilaian</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {filteredKelas.length === 0 && (
            <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
              <School className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-800">Tidak ada kelas yang cocok</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-4">
                Pencarian atau filter yang Anda pilih tidak menemukan rombel kelas.
              </p>
              <button
                onClick={() => {
                  setSearchKelas('');
                  setFilterTingkatKelas('ALL');
                  setFilterJurusanKelas('ALL');
                }}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors"
              >
                Reset Filter Pencarian
              </button>
            </div>
          )}
        </div>
      )}

      {/* SUB-TAB 2: MANAJEMEN DATA GURU */}
      {activeAdminSubTab === 'guru' && (
        <div className="space-y-4 animate-fadeIn">
          {/* Controls Bar */}
          <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3 flex-1">
              {/* Search Bar */}
              <div className="relative flex-1 min-w-[200px]">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Cari nama guru, NIP, mapel, email, username..."
                  value={searchGuru}
                  onChange={(e) => setSearchGuru(e.target.value)}
                  className="w-full text-xs font-medium pl-9 pr-3 py-2 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Filter Rumpun */}
              <div className="flex items-center gap-1.5">
                <span className="text-2xs font-bold text-slate-500 uppercase">Rumpun:</span>
                <select
                  value={filterRumpunGuru}
                  onChange={(e) => setFilterRumpunGuru(e.target.value)}
                  className="text-xs font-semibold rounded-xl border border-slate-300 px-2.5 py-2 bg-white text-slate-700"
                >
                  <option value="ALL">Semua Rumpun</option>
                  <option value="MIPA">MIPA</option>
                  <option value="IPS">IPS</option>
                  <option value="Bahasa">Bahasa</option>
                  <option value="Umum & Vokasi">Umum &amp; Vokasi</option>
                  <option value="Manajemen & Konseling">Manajemen &amp; BK</option>
                </select>
              </div>

              {/* Filter Role */}
              <div className="flex items-center gap-1.5">
                <span className="text-2xs font-bold text-slate-500 uppercase">Role:</span>
                <select
                  value={filterRoleGuru}
                  onChange={(e) => setFilterRoleGuru(e.target.value)}
                  className="text-xs font-semibold rounded-xl border border-slate-300 px-2.5 py-2 bg-white text-slate-700"
                >
                  <option value="ALL">Semua Role</option>
                  <option value="guru">Guru Mapel</option>
                  <option value="admin">Admin Kurikulum</option>
                  <option value="kepsek">Kepala Sekolah</option>
                </select>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleExportGuruCSV}
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
                title="Ekspor daftar guru ke format CSV"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                <span>Export CSV</span>
              </button>

              <button
                onClick={handleOpenAddTeacher}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Guru Baru</span>
              </button>
            </div>
          </div>

          {/* Grid / Cards of Teachers */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredGuru.map((t) => {
              const isSelf = t.id === currentTeacher.id;
              return (
                <div
                  key={t.id}
                  className={`bg-white rounded-2xl p-5 shadow-xs border transition-all flex flex-col justify-between ${
                    isSelf
                      ? 'border-indigo-400 ring-2 ring-indigo-200 bg-gradient-to-b from-indigo-50/30 to-white'
                      : 'border-slate-200 hover:border-indigo-300 hover:shadow-md'
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-11 h-11 rounded-2xl ${
                            t.avatarBgColor || 'bg-indigo-600'
                          } text-white font-bold text-sm flex items-center justify-center shadow-xs shrink-0`}
                        >
                          {t.namaLengkap
                            .split(' ')
                            .filter((_, i) => i < 2)
                            .map((w) => w[0])
                            .join('')
                            .toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h4 className="text-xs font-bold text-slate-900 leading-snug line-clamp-1" title={t.namaLengkap}>
                              {t.namaLengkap}
                            </h4>
                            {isSelf && (
                              <span className="px-1.5 py-0.5 rounded-full text-3xs font-black bg-indigo-600 text-white">
                                ANDA
                              </span>
                            )}
                          </div>
                          <span className="text-2xs font-semibold text-indigo-700 block mt-0.5">
                            Guru {t.mataPelajaran}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => handleOpenEditTeacher(t)}
                          className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          title="Edit data guru"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        {!isSelf && (
                          <button
                            onClick={() => handleDeleteTeacher(t.id, t.namaLengkap)}
                            className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Hapus guru"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Guru Attributes */}
                    <div className="space-y-1.5 py-2 border-t border-slate-100 text-xs">
                      <div className="flex items-center justify-between text-slate-700">
                        <span className="text-slate-500 text-2xs uppercase font-bold">NIP / NUPTK:</span>
                        <span className="font-mono text-2xs font-semibold text-slate-800">{t.nip}</span>
                      </div>
                      <div className="flex items-center justify-between text-slate-700">
                        <span className="text-slate-500 text-2xs uppercase font-bold">Rumpun:</span>
                        <span className="font-semibold text-2xs text-slate-700">{t.rumpunMapel}</span>
                      </div>
                      <div className="flex items-center justify-between text-slate-700">
                        <span className="text-slate-500 text-2xs uppercase font-bold">Status Pegawai:</span>
                        <span className="font-semibold text-2xs text-slate-800">{t.statusKepegawaian || 'PNS'}</span>
                      </div>
                      <div className="flex items-center justify-between text-slate-700">
                        <span className="text-slate-500 text-2xs uppercase font-bold">Role Akun:</span>
                        <span
                          className={`text-3xs font-black uppercase px-2 py-0.5 rounded-md ${
                            t.role === 'admin'
                              ? 'bg-blue-100 text-blue-800'
                              : t.role === 'kepsek'
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-slate-100 text-slate-800'
                          }`}
                        >
                          {t.role}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-slate-700 pt-1">
                        <span className="text-slate-500 text-2xs uppercase font-bold">Username Login:</span>
                        <span className="font-mono text-2xs text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md font-semibold">
                          {t.username}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Direct Login As Button */}
                  <div className="pt-3 mt-2 border-t border-slate-100">
                    {isSelf ? (
                      <div className="text-center py-1 text-2xs font-bold text-indigo-700 bg-indigo-50 rounded-xl">
                        Sesi Login Aktif Saat Ini
                      </div>
                    ) : (
                      <button
                        onClick={() => handleDirectLoginAsTeacher(t)}
                        className="w-full py-2 bg-slate-100 hover:bg-indigo-600 hover:text-white text-slate-700 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                        title="Masuk langsung sebagai guru ini untuk membuat RPP/LKPD"
                      >
                        <LogIn className="w-3.5 h-3.5" />
                        <span>Masuk Sesi Guru Ini</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {filteredGuru.length === 0 && (
            <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
              <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-800">Tidak ada data guru yang cocok</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-4">
                Pencarian atau filter yang Anda pilih tidak menemukan data tenaga pendidik.
              </p>
              <button
                onClick={() => {
                  setSearchGuru('');
                  setFilterRumpunGuru('ALL');
                  setFilterRoleGuru('ALL');
                }}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors"
              >
                Reset Filter Pencarian
              </button>
            </div>
          )}
        </div>
      )}

      {/* SUB-TAB 3: REKAPITULASI & STATISTIK SEKOLAH */}
      {activeAdminSubTab === 'rekap' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Top Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-blue-600 mb-2">
                <span className="text-xs font-bold text-slate-500 uppercase">Rombel Kelas X</span>
                <School className="w-5 h-5" />
              </div>
              <div className="text-2xl font-black text-slate-900">{countKelasX} Rombel</div>
              <p className="text-2xs text-slate-500 mt-1">Fase E — Pondasi &amp; Orientasi</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-indigo-600 mb-2">
                <span className="text-xs font-bold text-slate-500 uppercase">Rombel Kelas XI</span>
                <School className="w-5 h-5" />
              </div>
              <div className="text-2xl font-black text-slate-900">{countKelasXI} Rombel</div>
              <p className="text-2xs text-slate-500 mt-1">Fase F — Peminatan MIPA / IPS</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-purple-600 mb-2">
                <span className="text-xs font-bold text-slate-500 uppercase">Rombel Kelas XII</span>
                <School className="w-5 h-5" />
              </div>
              <div className="text-2xl font-black text-slate-900">{countKelasXII} Rombel</div>
              <p className="text-2xs text-slate-500 mt-1">Fase F — Kelulusan &amp; UTBK/SNBP</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-emerald-600 mb-2">
                <span className="text-xs font-bold text-slate-500 uppercase">Daya Tampung Siswa</span>
                <Users className="w-5 h-5" />
              </div>
              <div className="text-2xl font-black text-slate-900">{totalSiswaRombel} Siswa</div>
              <p className="text-2xs text-slate-500 mt-1">Rata-rata {(totalSiswaRombel / (classList.length || 1)).toFixed(0)} siswa/rombel</p>
            </div>
          </div>

          {/* Teacher Distribution & School Info */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Rumpun Mapel Breakdown */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-indigo-600" />
                  Distribusi Guru per Rumpun Mata Pelajaran
                </h3>
                <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg">
                  Total {teacherList.length} Guru
                </span>
              </div>

              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-slate-700">MIPA (Matematika &amp; Sains)</span>
                    <span className="text-blue-700 font-bold">{countGuruMIPA} Guru ({((countGuruMIPA / teacherList.length) * 100).toFixed(0)}%)</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-600 rounded-full" style={{ width: `${(countGuruMIPA / teacherList.length) * 100}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-slate-700">IPS (Sosial Humaniora)</span>
                    <span className="text-amber-700 font-bold">{countGuruIPS} Guru ({((countGuruIPS / teacherList.length) * 100).toFixed(0)}%)</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-500 rounded-full" style={{ width: `${(countGuruIPS / teacherList.length) * 100}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-slate-700">Bahasa &amp; Sastra</span>
                    <span className="text-rose-700 font-bold">{countGuruBahasa} Guru ({((countGuruBahasa / teacherList.length) * 100).toFixed(0)}%)</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-rose-500 rounded-full" style={{ width: `${(countGuruBahasa / teacherList.length) * 100}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-slate-700">Umum, Vokasi &amp; Seni</span>
                    <span className="text-emerald-700 font-bold">{countGuruUmum} Guru ({((countGuruUmum / teacherList.length) * 100).toFixed(0)}%)</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${(countGuruUmum / teacherList.length) * 100}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-slate-700">Manajemen &amp; Bimbingan Konseling</span>
                    <span className="text-purple-700 font-bold">{countManajemen} Pegawai ({((countManajemen / teacherList.length) * 100).toFixed(0)}%)</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-purple-600 rounded-full" style={{ width: `${(countManajemen / teacherList.length) * 100}%` }} />
                  </div>
                </div>
              </div>
            </div>

            {/* School Profile Summary Card */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-blue-600" />
                  Identitas &amp; Legalisasi Satuan Pendidikan
                </h3>
                <span className="text-xs font-bold text-blue-800 bg-blue-50 px-2 py-0.5 rounded-md">
                  NPSN {schoolProfile.npsn}
                </span>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-2.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Nama Sekolah:</span>
                  <span className="font-bold text-slate-900">{schoolProfile.namaSekolah}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Daerah / Wilayah:</span>
                  <span className="font-semibold text-slate-800">{schoolProfile.kabupaten}, {schoolProfile.provinsi}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Kepala Sekolah:</span>
                  <span className="font-semibold text-slate-800">{schoolProfile.namaKepalaSekolah}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">NIP Kepala Sekolah:</span>
                  <span className="font-mono text-2xs text-slate-700">{schoolProfile.nipKepalaSekolah}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Tahun Ajaran Aktif:</span>
                  <span className="font-bold text-blue-700">{schoolProfile.tahunPelajaran} ({schoolProfile.semester})</span>
                </div>
                <div className="pt-2 border-t border-slate-200 text-2xs text-slate-500">
                  📍 {schoolProfile.alamat}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={handleExportKelasCSV}
                  className="flex-1 py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>Download Rekap Rombel</span>
                </button>
                <button
                  onClick={handleExportGuruCSV}
                  className="flex-1 py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>Download Rekap Guru</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Tambah / Edit Kelas */}
      <AddEditClassModal
        isOpen={isClassModalOpen}
        onClose={() => {
          setIsClassModalOpen(false);
          setEditingClass(null);
        }}
        classData={editingClass}
        onSaveClass={handleSaveClass}
        teacherList={teacherList}
        tahunAjaranDefault={schoolProfile.tahunPelajaran}
      />

      {/* MODAL: Tambah / Edit Guru */}
      <AddEditTeacherModal
        isOpen={isTeacherModalOpen}
        onClose={() => {
          setIsTeacherModalOpen(false);
          setEditingTeacher(null);
        }}
        teacherData={editingTeacher}
        onSaveTeacher={handleSaveTeacher}
      />
    </div>
  );
};
