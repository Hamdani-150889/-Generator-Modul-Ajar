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
  Printer,
  FolderArchive,
  FileText,
  CheckSquare,
  ExternalLink,
  UserPlus,
  AlertTriangle
} from 'lucide-react';
import {
  DataKelas,
  TeacherUser,
  SchoolProfile,
  TabType,
  DataNilaiSiswa,
  RppModulAjar,
  LKPDDocument,
  AsesmenDaringPackage
} from '../types';
import { AddEditClassModal } from './AddEditClassModal';
import { AddEditTeacherModal } from './AddEditTeacherModal';
import { AddEditStudentModal } from './AddEditStudentModal';
import { MASTER_STUDENTS_SMAN1_LAMPASIO } from '../data/sampleTemplates';

interface AdminPanelProps {
  classList: DataKelas[];
  teacherList: TeacherUser[];
  studentList?: DataNilaiSiswa[];
  schoolProfile: SchoolProfile;
  currentTeacher: TeacherUser;
  rppList?: RppModulAjar[];
  lkpdList?: LKPDDocument[];
  asesmenList?: AsesmenDaringPackage[];
  onSaveClassList: (classes: DataKelas[]) => void;
  onSaveTeacherList: (teachers: TeacherUser[]) => void;
  onSaveStudentList?: (students: DataNilaiSiswa[]) => void;
  onDeleteRpp?: (id: string) => void;
  onDeleteLkpd?: (id: string) => void;
  onDeleteAsesmen?: (id: string) => void;
  onSwitchTeacher: (teacher: TeacherUser) => void;
  onNavigateTab: (tab: TabType) => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  classList,
  teacherList,
  studentList,
  schoolProfile,
  currentTeacher,
  rppList = [],
  lkpdList = [],
  asesmenList = [],
  onSaveClassList,
  onSaveTeacherList,
  onSaveStudentList,
  onDeleteRpp,
  onDeleteLkpd,
  onDeleteAsesmen,
  onSwitchTeacher,
  onNavigateTab,
}) => {
  const [activeAdminSubTab, setActiveAdminSubTab] = useState<'kelas' | 'guru' | 'siswa' | 'arsip' | 'rekap'>('kelas');

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

  // --- Effective Master Student List ---
  const effectiveStudents: DataNilaiSiswa[] = studentList && studentList.length > 0 ? studentList : MASTER_STUDENTS_SMAN1_LAMPASIO;

  // Search & Filter for Siswa
  const [searchSiswa, setSearchSiswa] = useState('');
  const [filterKelasSiswa, setFilterKelasSiswa] = useState('ALL');

  // Modals state for Siswa
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<DataNilaiSiswa | null>(null);

  // Quick Add Student Inline Form State
  const [quickNama, setQuickNama] = useState('');
  const [quickNisn, setQuickNisn] = useState('');
  const [quickKelas, setQuickKelas] = useState(classList[0]?.namaKelas || 'X-A');
  const [quickFormatif, setQuickFormatif] = useState(80);
  const [quickLkpd, setQuickLkpd] = useState(85);
  const [quickSumatif, setQuickSumatif] = useState(80);

  // Search & Filter for Arsip
  const [searchArsip, setSearchArsip] = useState('');
  const [filterTipeArsip, setFilterTipeArsip] = useState<'ALL' | 'rpp' | 'lkpd' | 'asesmen'>('ALL');

  // --- Handlers for Siswa (Add, Edit, Delete) ---
  const handleOpenAddStudent = () => {
    setEditingStudent(null);
    setIsStudentModalOpen(true);
  };

  const handleOpenEditStudent = (item: DataNilaiSiswa) => {
    setEditingStudent(item);
    setIsStudentModalOpen(true);
  };

  const handleSaveStudent = (item: DataNilaiSiswa) => {
    const exists = effectiveStudents.some((s) => s.id === item.id);
    let updated: DataNilaiSiswa[];
    if (exists) {
      updated = effectiveStudents.map((s) => (s.id === item.id ? item : s));
      showToast(`Data peserta didik ${item.nama} berhasil diperbarui!`);
    } else {
      updated = [item, ...effectiveStudents];
      showToast(`Peserta didik ${item.nama} berhasil ditambahkan!`);
    }
    if (onSaveStudentList) {
      onSaveStudentList(updated);
    }
    localStorage.setItem('sman1_lampasio_master_students', JSON.stringify(updated));
  };

  const handleDeleteStudent = (id: string, nama: string) => {
    if (window.confirm(`Apakah Anda yakin ingin menghapus data siswa ${nama}? Data nilai dan riwayat peserta didik ini akan dihapus.`)) {
      const updated = effectiveStudents.filter((s) => s.id !== id);
      if (onSaveStudentList) {
        onSaveStudentList(updated);
      }
      localStorage.setItem('sman1_lampasio_master_students', JSON.stringify(updated));
      showToast(`Data siswa ${nama} berhasil dihapus.`);
    }
  };

  const handleQuickAddStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickNama.trim()) {
      showToast('Nama peserta didik wajib diisi.');
      return;
    }
    const akhir = Math.round(Number(quickFormatif) * 0.3 + Number(quickLkpd) * 0.3 + Number(quickSumatif) * 0.4);
    const getStatus = (sc: number) => {
      if (sc >= 89) return 'Sangat Tuntas (Pengayaan)';
      if (sc >= 75) return 'Tuntas (Cakap)';
      if (sc >= 61) return 'Cukup (Layak)';
      return 'Belum Tuntas (Perlu Remedial)';
    };

    const newStudent: DataNilaiSiswa = {
      id: `s-${Date.now()}`,
      nisn: quickNisn.trim() || `00${Math.floor(10000000 + Math.random() * 90000000)}`,
      nama: quickNama.trim(),
      kelas: quickKelas || classList[0]?.namaKelas || 'X-A',
      nilaiFormatif: Number(quickFormatif),
      nilaiLKPD: Number(quickLkpd),
      nilaiSumatif: Number(quickSumatif),
      nilaiAkhir: akhir,
      statusKetercapaian: getStatus(akhir),
      catatanGuru: 'Peserta didik aktif mengikuti pembelajaran.',
    };

    const updated = [newStudent, ...effectiveStudents];
    if (onSaveStudentList) {
      onSaveStudentList(updated);
    }
    localStorage.setItem('sman1_lampasio_master_students', JSON.stringify(updated));
    showToast(`Peserta didik ${newStudent.nama} berhasil ditambahkan!`);
    setQuickNama('');
    setQuickNisn('');
  };

  const handleDeleteAllFilteredStudents = () => {
    if (filteredSiswa.length === 0) return;
    if (window.confirm(`PERINGATAN: Apakah Anda yakin ingin menghapus SEMUA ${filteredSiswa.length} data siswa yang sedang ditampilkan? Tindakan ini tidak dapat dibatalkan.`)) {
      const filteredIds = new Set(filteredSiswa.map((s) => s.id));
      const remaining = effectiveStudents.filter((s) => !filteredIds.has(s.id));
      if (onSaveStudentList) {
        onSaveStudentList(remaining);
      }
      localStorage.setItem('sman1_lampasio_master_students', JSON.stringify(remaining));
      showToast(`${filteredSiswa.length} data siswa berhasil dihapus.`);
    }
  };

  const handleExportSiswaCSV = () => {
    const headers = ['ID', 'NISN', 'Nama Siswa', 'Kelas', 'Nilai Formatif (30%)', 'Nilai LKPD (30%)', 'Nilai Sumatif (40%)', 'Nilai Akhir', 'Status KKTP', 'Catatan'];
    const rows = filteredSiswa.map((s) => [
      s.id,
      `"${s.nisn}"`,
      `"${s.nama}"`,
      `"${s.kelas}"`,
      s.nilaiFormatif,
      s.nilaiLKPD,
      s.nilaiSumatif,
      s.nilaiAkhir || 0,
      `"${s.statusKetercapaian || ''}"`,
      `"${s.catatanGuru || ''}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `DATA_SISWA_SMAN1_LAMPASIO_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Data Siswa berhasil diekspor ke CSV!');
  };

  // --- Handlers for Document Archive Deletion ---
  const handleDeleteRppDoc = (id: string, title: string) => {
    if (window.confirm(`Hapus dokumen RPP "${title}" dari arsip sekolah?`)) {
      if (onDeleteRpp) onDeleteRpp(id);
      showToast(`Modul Ajar RPP "${title}" telah dihapus dari arsip.`);
    }
  };

  const handleDeleteLkpdDoc = (id: string, title: string) => {
    if (window.confirm(`Hapus LKPD HOTS "${title}" dari arsip sekolah?`)) {
      if (onDeleteLkpd) onDeleteLkpd(id);
      showToast(`LKPD "${title}" telah dihapus dari arsip.`);
    }
  };

  const handleDeleteAsesmenDoc = (id: string, title: string) => {
    if (window.confirm(`Hapus Asesmen Daring "${title}" dari arsip sekolah?`)) {
      if (onDeleteAsesmen) onDeleteAsesmen(id);
      showToast(`Paket Asesmen "${title}" telah dihapus dari arsip.`);
    }
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

  // Filtered Siswa
  const filteredSiswa = effectiveStudents.filter((s) => {
    const matchSearch =
      s.nama.toLowerCase().includes(searchSiswa.toLowerCase()) ||
      s.nisn.toLowerCase().includes(searchSiswa.toLowerCase()) ||
      s.kelas.toLowerCase().includes(searchSiswa.toLowerCase());
    const matchKelas = filterKelasSiswa === 'ALL' || s.kelas === filterKelasSiswa;
    return matchSearch && matchKelas;
  });

  // Filtered Documents
  const filteredRppDocs = rppList.filter(
    (r) =>
      searchArsip === '' ||
      r.topik.toLowerCase().includes(searchArsip.toLowerCase()) ||
      r.mataPelajaran.toLowerCase().includes(searchArsip.toLowerCase())
  );
  const filteredLkpdDocs = lkpdList.filter(
    (l) =>
      searchArsip === '' ||
      l.topik.toLowerCase().includes(searchArsip.toLowerCase()) ||
      l.mataPelajaran.toLowerCase().includes(searchArsip.toLowerCase())
  );
  const filteredAsesmenDocs = asesmenList.filter(
    (a) =>
      searchArsip === '' ||
      a.title.toLowerCase().includes(searchArsip.toLowerCase()) ||
      a.mataPelajaran.toLowerCase().includes(searchArsip.toLowerCase())
  );
  const totalSchoolDocs = rppList.length + lkpdList.length + asesmenList.length;

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

      {/* Admin Privilege Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white rounded-3xl p-5 sm:p-6 shadow-xl border border-blue-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-600/30 border border-blue-400/40 flex items-center justify-center text-amber-300 shadow-inner shrink-0">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-extrabold text-white tracking-tight">
                Hak Akses Administrator Aktif: SMAN 1 Lampasio
              </h2>
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-300 bg-amber-950/80 px-2 py-0.5 rounded-full border border-amber-800/60">
                Full CRUD Admin
              </span>
            </div>
            <p className="text-xs text-blue-100/90 mt-1 leading-relaxed">
              Anda memiliki wewenang penuh untuk <strong>menambah</strong> dan <strong>menghapus</strong> data Rombel/Kelas, Data Guru &amp; Tendik, Data Master Siswa, serta membersihkan berkas Arsip Dokumen Pembelajaran.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="bg-white/10 backdrop-blur-md px-3.5 py-2 rounded-xl border border-white/15 text-right">
            <div className="text-[10px] text-blue-200 uppercase font-semibold">Sesi Admin</div>
            <div className="text-xs font-bold text-white truncate max-w-[160px]">
              {currentTeacher?.namaLengkap || 'Tim Kurikulum'}
            </div>
          </div>
        </div>
      </div>

      {/* Admin Panel Header & Sub-Navigation */}
      <div className="bg-white rounded-3xl p-6 shadow-xs border border-slate-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-100">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-700 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black text-slate-900 tracking-tight">Pusat Kelola Data Satuan Pendidikan</h1>
                <span className="px-2.5 py-0.5 rounded-full text-2xs font-black bg-blue-100 text-blue-800 uppercase tracking-wider border border-blue-200">
                  SMAN 1 Lampasio
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-0.5">
                Kelola data master rombongan belajar (kelas), guru pengampu, data siswa, serta arsip modul secara mandiri.
              </p>
            </div>
          </div>

          {/* Quick Metrics Header */}
          <div className="flex items-center gap-2 sm:gap-3 bg-slate-50 p-2.5 rounded-2xl border border-slate-200/80 overflow-x-auto">
            <div className="text-center px-3 border-r border-slate-200 shrink-0">
              <div className="text-lg font-black text-blue-700">{classList.length}</div>
              <div className="text-2xs font-bold text-slate-500 uppercase">Kelas</div>
            </div>
            <div className="text-center px-3 border-r border-slate-200 shrink-0">
              <div className="text-lg font-black text-indigo-700">{teacherList.length}</div>
              <div className="text-2xs font-bold text-slate-500 uppercase">Guru</div>
            </div>
            <div className="text-center px-3 border-r border-slate-200 shrink-0">
              <div className="text-lg font-black text-emerald-700">{effectiveStudents.length}</div>
              <div className="text-2xs font-bold text-slate-500 uppercase">Siswa</div>
            </div>
            <div className="text-center px-3 shrink-0">
              <div className="text-lg font-black text-purple-700">{totalSchoolDocs}</div>
              <div className="text-2xs font-bold text-slate-500 uppercase">Arsip</div>
            </div>
          </div>
        </div>

        {/* Sub Menu Navigation Pills (5 Sub-tabs) */}
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
            <span>Data Master Kelas ({classList.length})</span>
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
            <span>Data Master Guru ({teacherList.length})</span>
          </button>

          <button
            onClick={() => setActiveAdminSubTab('siswa')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeAdminSubTab === 'siswa'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/20'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200/80'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            <span>Data Master Siswa ({effectiveStudents.length})</span>
          </button>

          <button
            onClick={() => setActiveAdminSubTab('arsip')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeAdminSubTab === 'arsip'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-500/20'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200/80'
            }`}
          >
            <FolderArchive className="w-4 h-4" />
            <span>Kelola Arsip Dokumen ({totalSchoolDocs})</span>
          </button>

          <button
            onClick={() => setActiveAdminSubTab('rekap')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeAdminSubTab === 'rekap'
                ? 'bg-amber-600 text-white shadow-md shadow-amber-500/20'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200/80'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Rekapitulasi &amp; Profil Sekolah</span>
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

      {/* SUB-TAB 3: MANAJEMEN DATA MASTER SISWA */}
      {activeAdminSubTab === 'siswa' && (
        <div className="space-y-4 animate-fadeIn">
          {/* Controls Bar */}
          <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3 flex-1">
              {/* Search Bar */}
              <div className="relative flex-1 min-w-[220px]">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Cari nama siswa, NISN, atau kelas..."
                  value={searchSiswa}
                  onChange={(e) => setSearchSiswa(e.target.value)}
                  className="w-full text-xs font-medium pl-9 pr-3 py-2 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Filter Kelas */}
              <div className="flex items-center gap-1.5">
                <span className="text-2xs font-bold text-slate-500 uppercase">Kelas:</span>
                <select
                  value={filterKelasSiswa}
                  onChange={(e) => setFilterKelasSiswa(e.target.value)}
                  className="text-xs font-semibold py-2 px-3 rounded-xl border border-slate-300 bg-slate-50 text-slate-800 focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="ALL">Semua Kelas ({effectiveStudents.length})</option>
                  {classList.map((c) => (
                    <option key={c.id} value={c.namaKelas}>
                      Kelas {c.namaKelas}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleExportSiswaCSV}
                className="px-3.5 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                title="Ekspor CSV Data Siswa"
              >
                <Download className="w-3.5 h-3.5 text-slate-600" />
                <span className="hidden sm:inline">Ekspor CSV</span>
              </button>

              {filteredSiswa.length > 0 && (
                <button
                  onClick={handleDeleteAllFilteredStudents}
                  className="px-3 py-2 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                  title="Hapus data siswa terfilter"
                >
                  <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                  <span className="hidden md:inline">Hapus Terpilih ({filteredSiswa.length})</span>
                </button>
              )}

              <button
                onClick={handleOpenAddStudent}
                className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md shadow-emerald-500/20 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Siswa Baru</span>
              </button>
            </div>
          </div>

          {/* Quick Add Student Inline Form (Admin Instant Insert) */}
          <div className="bg-emerald-50/60 border border-emerald-200/80 rounded-2xl p-4 shadow-xs">
            <div className="flex items-center gap-2 mb-3">
              <UserPlus className="w-4 h-4 text-emerald-700" />
              <h3 className="text-xs font-bold text-emerald-950">
                Tambah Cepat Peserta Didik (Entri Langsung):
              </h3>
            </div>
            <form onSubmit={handleQuickAddStudent} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-2.5 items-end">
              <div className="lg:col-span-2">
                <label className="block text-[10px] font-bold text-slate-700 mb-1">
                  Nama Lengkap Siswa *
                </label>
                <input
                  type="text"
                  required
                  placeholder="contoh: Rahmat Hidayatullah"
                  value={quickNama}
                  onChange={(e) => setQuickNama(e.target.value)}
                  className="w-full text-xs py-1.5 px-3 rounded-xl border border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-700 mb-1">
                  NISN Siswa
                </label>
                <input
                  type="text"
                  placeholder="0078129011"
                  value={quickNisn}
                  onChange={(e) => setQuickNisn(e.target.value)}
                  className="w-full text-xs font-mono py-1.5 px-3 rounded-xl border border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-700 mb-1">
                  Rombel / Kelas
                </label>
                <select
                  value={quickKelas}
                  onChange={(e) => setQuickKelas(e.target.value)}
                  className="w-full text-xs py-1.5 px-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-emerald-500"
                >
                  {classList.map((c) => (
                    <option key={c.id} value={c.namaKelas}>
                      {c.namaKelas}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-700 mb-1">
                  Formatif (30%)
                </label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={quickFormatif}
                  onChange={(e) => setQuickFormatif(Number(e.target.value))}
                  className="w-full text-xs text-center font-bold py-1.5 px-2 rounded-xl border border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-700 mb-1">
                  Sumatif (40%)
                </label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={quickSumatif}
                  onChange={(e) => setQuickSumatif(Number(e.target.value))}
                  className="w-full text-xs text-center font-bold py-1.5 px-2 rounded-xl border border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <button
                  type="submit"
                  className="w-full py-1.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Simpan</span>
                </button>
              </div>
            </form>
          </div>

          {/* Master Students Table */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-800">Daftar Master Siswa:</span>
                <span className="text-xs font-black text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                  {filteredSiswa.length} Peserta Didik
                </span>
              </div>
              <span className="text-2xs text-slate-500">
                Formula KKTP: 30% Formatif + 30% LKPD + 40% Sumatif
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold text-2xs uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-3.5 text-center w-12">No</th>
                    <th className="py-3 px-3.5">NISN</th>
                    <th className="py-3 px-3.5">Nama Lengkap Siswa</th>
                    <th className="py-3 px-3.5 text-center">Kelas</th>
                    <th className="py-3 px-3 text-center">Formatif</th>
                    <th className="py-3 px-3 text-center">LKPD</th>
                    <th className="py-3 px-3 text-center">Sumatif</th>
                    <th className="py-3 px-3.5 text-center">Nilai Akhir</th>
                    <th className="py-3 px-3.5">Status KKTP</th>
                    <th className="py-3 px-3.5 text-right w-24">Aksi Kelola</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredSiswa.map((siswa, idx) => {
                    const score = siswa.nilaiAkhir || Math.round(siswa.nilaiFormatif * 0.3 + siswa.nilaiLKPD * 0.3 + siswa.nilaiSumatif * 0.4);
                    const isTuntas = score >= 75;
                    return (
                      <tr key={siswa.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-3.5 text-center text-slate-400 font-medium">
                          {idx + 1}
                        </td>
                        <td className="py-3 px-3.5 font-mono text-slate-600 text-2xs">
                          {siswa.nisn}
                        </td>
                        <td className="py-3 px-3.5 font-bold text-slate-900">
                          {siswa.nama}
                        </td>
                        <td className="py-3 px-3.5 text-center">
                          <span className="px-2 py-0.5 rounded-md font-bold text-2xs bg-blue-50 text-blue-800 border border-blue-100">
                            {siswa.kelas}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-center text-slate-700 font-semibold">
                          {siswa.nilaiFormatif}
                        </td>
                        <td className="py-3 px-3 text-center text-slate-700 font-semibold">
                          {siswa.nilaiLKPD}
                        </td>
                        <td className="py-3 px-3 text-center text-slate-700 font-semibold">
                          {siswa.nilaiSumatif}
                        </td>
                        <td className="py-3 px-3.5 text-center">
                          <span
                            className={`font-black text-xs px-2 py-0.5 rounded-lg ${
                              score >= 85
                                ? 'bg-emerald-100 text-emerald-800'
                                : score >= 75
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {score}
                          </span>
                        </td>
                        <td className="py-3 px-3.5">
                          <span
                            className={`inline-flex items-center gap-1 text-[11px] font-semibold ${
                              isTuntas ? 'text-emerald-700' : 'text-rose-600'
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                isTuntas ? 'bg-emerald-500' : 'bg-rose-500'
                              }`}
                            ></span>
                            <span>{siswa.statusKetercapaian || (isTuntas ? 'Tuntas' : 'Perlu Remedial')}</span>
                          </span>
                        </td>
                        <td className="py-3 px-3.5 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => handleOpenEditStudent(siswa)}
                              className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                              title="Edit data siswa"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteStudent(siswa.id, siswa.nama)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                              title="Hapus data siswa"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {filteredSiswa.length === 0 && (
              <div className="text-center py-12 p-6">
                <GraduationCap className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h4 className="text-sm font-bold text-slate-700">Tidak ada data peserta didik yang cocok</h4>
                <p className="text-xs text-slate-500 mt-1">
                  Ubah kata kunci pencarian atau gunakan tombol "Tambah Siswa Baru" di atas.
                </p>
                <button
                  onClick={() => {
                    setSearchSiswa('');
                    setFilterKelasSiswa('ALL');
                  }}
                  className="mt-3 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                >
                  Reset Filter
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SUB-TAB 4: KELOLA & HAPUS ARSIP DOKUMEN SEKOLAH */}
      {activeAdminSubTab === 'arsip' && (
        <div className="space-y-4 animate-fadeIn">
          {/* Controls Bar */}
          <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3 flex-1">
              <div className="relative flex-1 min-w-[220px]">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Cari arsip dokumen berdasarkan judul atau mapel..."
                  value={searchArsip}
                  onChange={(e) => setSearchArsip(e.target.value)}
                  className="w-full text-xs font-medium pl-9 pr-3 py-2 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-purple-500"
                />
              </div>

              {/* Filter Tipe Dokumen */}
              <div className="flex items-center gap-1.5">
                <span className="text-2xs font-bold text-slate-500 uppercase">Tipe:</span>
                <select
                  value={filterTipeArsip}
                  onChange={(e) => setFilterTipeArsip(e.target.value as any)}
                  className="text-xs font-semibold py-2 px-3 rounded-xl border border-slate-300 bg-slate-50 text-slate-800 focus:ring-2 focus:ring-purple-500"
                >
                  <option value="ALL">Semua Dokumen ({totalSchoolDocs})</option>
                  <option value="rpp">Modul RPP ({rppList.length})</option>
                  <option value="lkpd">LKPD HOTS ({lkpdList.length})</option>
                  <option value="asesmen">Asesmen Daring ({asesmenList.length})</option>
                </select>
              </div>
            </div>

            <div className="text-xs font-semibold text-slate-500">
              Admin berhak menghapus berkas arsip yang sudah usang atau duplikat.
            </div>
          </div>

          {/* Document Archive Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* RPP Documents */}
            {(filterTipeArsip === 'ALL' || filterTipeArsip === 'rpp') &&
              filteredRppDocs.map((rpp) => (
                <div
                  key={rpp.id}
                  className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden"
                >
                  <div className="absolute top-0 left-0 right-0 h-1 bg-blue-600"></div>
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="px-2 py-0.5 rounded-md text-2xs font-bold bg-blue-50 text-blue-700 border border-blue-100 flex items-center gap-1">
                        <FileText className="w-3 h-3" />
                        Modul Ajar RPP
                      </span>
                      <span className="text-2xs font-mono text-slate-400">
                        {rpp.tanggal || 'Aktif'}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-slate-900 leading-snug line-clamp-2 mt-1">
                      {rpp.topik}
                    </h4>
                    <p className="text-xs text-slate-600 mt-1">
                      <strong>Mapel:</strong> {rpp.mataPelajaran} ({rpp.fase})
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      <strong>Penyusun:</strong> {rpp.namaGuru}
                    </p>
                  </div>

                  <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                    <button
                      onClick={() => onNavigateTab('rpp')}
                      className="text-xs font-semibold text-blue-700 hover:text-blue-900 flex items-center gap-1 cursor-pointer"
                    >
                      <span>Buka Modul</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>

                    <button
                      onClick={() => handleDeleteRppDoc(rpp.id, rpp.topik)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      title="Hapus RPP ini"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}

            {/* LKPD Documents */}
            {(filterTipeArsip === 'ALL' || filterTipeArsip === 'lkpd') &&
              filteredLkpdDocs.map((lkpd) => (
                <div
                  key={lkpd.id}
                  className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden"
                >
                  <div className="absolute top-0 left-0 right-0 h-1 bg-emerald-600"></div>
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="px-2 py-0.5 rounded-md text-2xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-100 flex items-center gap-1">
                        <BookOpen className="w-3 h-3" />
                        LKPD HOTS
                      </span>
                      <span className="text-2xs font-mono text-slate-400">
                        {lkpd.tanggal || 'Aktif'}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-slate-900 leading-snug line-clamp-2 mt-1">
                      {lkpd.topik}
                    </h4>
                    <p className="text-xs text-slate-600 mt-1">
                      <strong>Mapel:</strong> {lkpd.mataPelajaran} ({lkpd.fase})
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      <strong>Penyusun:</strong> {lkpd.namaGuru}
                    </p>
                  </div>

                  <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                    <button
                      onClick={() => onNavigateTab('lkpd')}
                      className="text-xs font-semibold text-emerald-700 hover:text-emerald-900 flex items-center gap-1 cursor-pointer"
                    >
                      <span>Buka LKPD</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>

                    <button
                      onClick={() => handleDeleteLkpdDoc(lkpd.id, lkpd.topik)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      title="Hapus LKPD ini"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}

            {/* Asesmen Documents */}
            {(filterTipeArsip === 'ALL' || filterTipeArsip === 'asesmen') &&
              filteredAsesmenDocs.map((ase) => (
                <div
                  key={ase.id}
                  className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden"
                >
                  <div className="absolute top-0 left-0 right-0 h-1 bg-purple-600"></div>
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="px-2 py-0.5 rounded-md text-2xs font-bold bg-purple-50 text-purple-700 border border-purple-100 flex items-center gap-1">
                        <CheckSquare className="w-3 h-3" />
                        Asesmen Daring
                      </span>
                      <span className="text-2xs font-mono text-slate-400">
                        {ase.soalKuis.length} Butir
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-slate-900 leading-snug line-clamp-2 mt-1">
                      {ase.title}
                    </h4>
                    <p className="text-xs text-slate-600 mt-1">
                      <strong>Mapel:</strong> {ase.mataPelajaran} ({ase.faseKelas})
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      <strong>Tingkat:</strong> {ase.tingkatKesulitan}
                    </p>
                  </div>

                  <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                    <button
                      onClick={() => onNavigateTab('asesmen')}
                      className="text-xs font-semibold text-purple-700 hover:text-purple-900 flex items-center gap-1 cursor-pointer"
                    >
                      <span>Buka Ujian</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>

                    <button
                      onClick={() => handleDeleteAsesmenDoc(ase.id, ase.title)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      title="Hapus Asesmen ini"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
          </div>

          {filteredRppDocs.length === 0 && filteredLkpdDocs.length === 0 && filteredAsesmenDocs.length === 0 && (
            <div className="text-center py-12 bg-white rounded-3xl border border-slate-200 p-8">
              <FolderArchive className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h4 className="text-sm font-bold text-slate-700">Tidak ada arsip dokumen yang sesuai filter</h4>
              <p className="text-xs text-slate-500 mt-1">
                Gunakan tab RPP, LKPD, atau Asesmen Daring untuk menghasilkan modul baru.
              </p>
            </div>
          )}
        </div>
      )}

      {/* SUB-TAB 5: REKAPITULASI & STATISTIK SEKOLAH */}
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

      {/* MODAL: Tambah / Edit Siswa */}
      <AddEditStudentModal
        isOpen={isStudentModalOpen}
        onClose={() => {
          setIsStudentModalOpen(false);
          setEditingStudent(null);
        }}
        studentData={editingStudent}
        classList={classList}
        onSaveStudent={handleSaveStudent}
      />
    </div>
  );
};
