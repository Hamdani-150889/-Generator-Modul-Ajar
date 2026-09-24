import React, { useState, useEffect } from 'react';
import {
  CheckSquare,
  Sparkles,
  Download,
  Printer,
  Copy,
  Check,
  RefreshCw,
  Wand2,
  Users,
  Award,
  Play,
  FileSpreadsheet,
  AlertCircle,
  HelpCircle,
  BarChart3,
  BookCheck,
  Plus,
  Trash2,
  ShieldCheck,
  Search,
  Filter,
  Upload,
  UserPlus,
  CheckCircle2,
  GraduationCap,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import {
  AsesmenDaringPackage,
  DataNilaiSiswa,
  RppModulAjar,
  SchoolProfile,
  SoalPenilaian,
  DataKelas,
} from '../types';
import {
  MATA_PELAJARAN_LIST,
  FASE_LIST,
  SAMPLE_ASESMEN_DARING,
  MASTER_STUDENTS_SMAN1_LAMPASIO,
  MASTER_KELAS_SMAN1_LAMPASIO,
} from '../data/sampleTemplates';
import { printDocument } from '../utils/pdfExport';
import { AddStudentModal } from './AddStudentModal';
import { BatchImportStudentsModal } from './BatchImportStudentsModal';

interface OnlineAssessmentProps {
  profile: SchoolProfile;
  currentAsesmen: AsesmenDaringPackage;
  setCurrentAsesmen: (asesmen: AsesmenDaringPackage) => void;
  activeRpp: RppModulAjar | null;
  onSaveToArchive: (asesmen: AsesmenDaringPackage) => void;
  classList?: DataKelas[];
}

export const OnlineAssessment: React.FC<OnlineAssessmentProps> = ({
  profile,
  currentAsesmen,
  setCurrentAsesmen,
  activeRpp,
  onSaveToArchive,
  classList = MASTER_KELAS_SMAN1_LAMPASIO,
}) => {
  // Generator States
  const [mataPelajaran, setMataPelajaran] = useState(currentAsesmen.mataPelajaran || profile.mataPelajaranDefault);
  const [faseKelas, setFaseKelas] = useState(currentAsesmen.faseKelas || 'Fase E (Kelas X)');
  const [topik, setTopik] = useState(currentAsesmen.title || '');
  const [jumlahPG, setJumlahPG] = useState(5);
  const [jumlahUraian, setJumlahUraian] = useState(2);
  const [tingkatKesulitan, setTingkatKesulitan] = useState('Kombinasi HOTS (C4-C6) dan MOTS (C3)');

  // Sub-tabs: 'kisi_soal' | 'cbt_quiz' | 'rekap_nilai'
  const [subTab, setSubTab] = useState<'kisi_soal' | 'cbt_quiz' | 'rekap_nilai'>('rekap_nilai');

  // CBT Interactive Quiz State for Student Simulation
  const [userAnswers, setUserAnswers] = useState<{ [key: number]: string }>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState<number | null>(null);

  // Gradebook / Student List State
  const [studentList, setStudentList] = useState<DataNilaiSiswa[]>(() => {
    if (currentAsesmen.daftarSiswaSMAN1Lampasio && currentAsesmen.daftarSiswaSMAN1Lampasio.length > 0) {
      return currentAsesmen.daftarSiswaSMAN1Lampasio;
    }
    const savedMaster = localStorage.getItem('sman1_lampasio_master_students');
    if (savedMaster) {
      try {
        return JSON.parse(savedMaster);
      } catch (e) {}
    }
    return MASTER_STUDENTS_SMAN1_LAMPASIO;
  });

  // Quick Add Student Inline Form State
  const [quickNama, setQuickNama] = useState('');
  const [quickNisn, setQuickNisn] = useState('');
  const [quickKelas, setQuickKelas] = useState('X-A');
  const [quickFormatif, setQuickFormatif] = useState(80);
  const [quickLkpd, setQuickLkpd] = useState(85);
  const [quickSumatif, setQuickSumatif] = useState(80);

  // Filter & Search Students State
  const [studentSearch, setStudentSearch] = useState('');
  const [filterKelas, setFilterKelas] = useState('Semua');

  // Notification Toast State
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modals State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  // UI States
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Keep state synchronized with currentAsesmen when prop changes
  useEffect(() => {
    if (currentAsesmen.daftarSiswaSMAN1Lampasio && currentAsesmen.daftarSiswaSMAN1Lampasio.length > 0) {
      setStudentList(currentAsesmen.daftarSiswaSMAN1Lampasio);
    }
  }, [currentAsesmen.id]);

  // Update profile default mata pelajaran if current teacher changes
  useEffect(() => {
    if (profile.mataPelajaranDefault) {
      setMataPelajaran(profile.mataPelajaranDefault);
    }
  }, [profile.mataPelajaranDefault]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const syncWithRpp = () => {
    if (activeRpp) {
      setMataPelajaran(activeRpp.mataPelajaran);
      setFaseKelas(activeRpp.fase);
      setTopik(activeRpp.topik);
      showToast(`Data materi berhasil disinkronkan dengan RPP ${activeRpp.topik}`);
    }
  };

  const handleGenerateAsesmen = async () => {
    if (!topik.trim()) {
      setError('Silakan masukkan topik / materi asesmen daring.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/generate-asesmen', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mataPelajaran,
          faseKelas,
          topik,
          tujuanPembelajaran: activeRpp ? activeRpp.tujuanPembelajaran : undefined,
          jumlahPilihanGanda: jumlahPG,
          jumlahUraian: jumlahUraian,
          tingkatKesulitan,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Gagal membuat asesmen');
      }

      const data: AsesmenDaringPackage = await res.json();
      // Keep existing students if user already added students
      const finalStudents = studentList.length > 0 ? studentList : (data.daftarSiswaSMAN1Lampasio || MASTER_STUDENTS_SMAN1_LAMPASIO);
      data.daftarSiswaSMAN1Lampasio = finalStudents;

      setCurrentAsesmen(data);
      setStudentList(finalStudents);
      setUserAnswers({});
      setQuizSubmitted(false);
      setQuizScore(null);
      onSaveToArchive(data);
      showToast('Paket Soal & Asesmen Daring berhasil digenerate oleh AI!');

      try {
        confetti({
          particleCount: 45,
          spread: 55,
          origin: { y: 0.6 },
        });
      } catch (e) {}
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Terjadi kesalahan saat membuat paket asesmen daring.');
    } finally {
      setIsLoading(false);
    }
  };

  // CBT Quiz Actions
  const handleSelectAnswer = (qNo: number, optKey: string) => {
    if (quizSubmitted) return;
    setUserAnswers({ ...userAnswers, [qNo]: optKey });
  };

  const handleSubmitQuiz = () => {
    let totalScore = 0;
    let maxScore = 0;

    currentAsesmen.soalKuis.forEach((soal) => {
      if (soal.tipe === 'pilihan_ganda') {
        maxScore += soal.bobot;
        if (userAnswers[soal.no] === soal.kunciJawaban) {
          totalScore += soal.bobot;
        }
      }
    });

    const finalCalculated = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;
    setQuizScore(finalCalculated);
    setQuizSubmitted(true);

    try {
      confetti({ particleCount: 30, spread: 40 });
    } catch (e) {}
  };

  const handleResetQuiz = () => {
    setUserAnswers({});
    setQuizSubmitted(false);
    setQuizScore(null);
  };

  // Gradebook / Rekap Nilai Calculations
  const calculateFinalGrade = (formatif: number, lkpd: number, sumatif: number) => {
    // Formula Kurikulum Merdeka SMAN 1 Lampasio: 30% Formatif + 30% LKPD + 40% Sumatif
    return Math.round(formatif * 0.3 + lkpd * 0.3 + sumatif * 0.4);
  };

  const getKKTPStatus = (score: number) => {
    if (score >= 89) return { text: 'Sangat Tuntas (Pengayaan)', color: 'bg-emerald-100 text-emerald-800' };
    if (score >= 75) return { text: 'Tuntas (Cakap)', color: 'bg-blue-100 text-blue-800' };
    if (score >= 61) return { text: 'Cukup (Layak)', color: 'bg-amber-100 text-amber-800' };
    return { text: 'Belum Tuntas (Perlu Remedial)', color: 'bg-rose-100 text-rose-800' };
  };

  const handleUpdateStudentGrade = (id: string, field: 'nilaiFormatif' | 'nilaiLKPD' | 'nilaiSumatif', val: number) => {
    const safeVal = Math.max(0, Math.min(100, isNaN(val) ? 0 : val));
    const updated = studentList.map((s) => {
      if (s.id === id) {
        const newObj = { ...s, [field]: safeVal };
        const na = calculateFinalGrade(
          field === 'nilaiFormatif' ? safeVal : s.nilaiFormatif,
          field === 'nilaiLKPD' ? safeVal : s.nilaiLKPD,
          field === 'nilaiSumatif' ? safeVal : s.nilaiSumatif
        );
        newObj.nilaiAkhir = na;
        newObj.statusKetercapaian = getKKTPStatus(na).text;
        return newObj;
      }
      return s;
    });

    setStudentList(updated);
    const updatedAsesmen = { ...currentAsesmen, daftarSiswaSMAN1Lampasio: updated };
    setCurrentAsesmen(updatedAsesmen);
    localStorage.setItem('sman1_lampasio_master_students', JSON.stringify(updated));
  };

  // Quick Add Student Handler
  const handleQuickAddStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickNama.trim()) {
      showToast('Nama siswa wajib diisi!');
      return;
    }

    const na = calculateFinalGrade(quickFormatif, quickLkpd, quickSumatif);
    const status = getKKTPStatus(na).text;

    const newStudent: DataNilaiSiswa = {
      id: 'siswa-' + Date.now(),
      nisn: quickNisn.trim() || '00' + Math.floor(10000000 + Math.random() * 90000000),
      nama: quickNama.trim(),
      kelas: quickKelas,
      nilaiFormatif: Number(quickFormatif),
      nilaiLKPD: Number(quickLkpd),
      nilaiSumatif: Number(quickSumatif),
      nilaiAkhir: na,
      statusKetercapaian: status,
      catatanGuru: 'Peserta didik aktif dalam kegiatan pembelajaran',
    };

    const updated = [newStudent, ...studentList];
    setStudentList(updated);
    const updatedAsesmen = { ...currentAsesmen, daftarSiswaSMAN1Lampasio: updated };
    setCurrentAsesmen(updatedAsesmen);
    onSaveToArchive(updatedAsesmen);
    localStorage.setItem('sman1_lampasio_master_students', JSON.stringify(updated));

    // Reset quick inputs
    setQuickNama('');
    setQuickNisn('');
    showToast(`Siswa "${newStudent.nama}" berhasil ditambahkan ke buku nilai!`);
  };

  // Full Modal Add Student Handler
  const handleAddStudentFromModal = (newStudent: DataNilaiSiswa) => {
    const updated = [newStudent, ...studentList];
    setStudentList(updated);
    const updatedAsesmen = { ...currentAsesmen, daftarSiswaSMAN1Lampasio: updated };
    setCurrentAsesmen(updatedAsesmen);
    onSaveToArchive(updatedAsesmen);
    localStorage.setItem('sman1_lampasio_master_students', JSON.stringify(updated));
    showToast(`Siswa "${newStudent.nama}" berhasil disimpan ke buku nilai!`);
  };

  // Batch Import Handler
  const handleImportStudents = (imported: DataNilaiSiswa[]) => {
    // Merge or append
    const updated = [...imported, ...studentList.filter((s) => !imported.some((imp) => imp.nisn === s.nisn))];
    setStudentList(updated);
    const updatedAsesmen = { ...currentAsesmen, daftarSiswaSMAN1Lampasio: updated };
    setCurrentAsesmen(updatedAsesmen);
    onSaveToArchive(updatedAsesmen);
    localStorage.setItem('sman1_lampasio_master_students', JSON.stringify(updated));
    showToast(`Berhasil memuat ${imported.length} data siswa rombel ke buku nilai!`);
  };

  const handleDeleteStudent = (id: string, nama: string) => {
    if (window.confirm(`Hapus data siswa "${nama}" dari daftar penilaian?`)) {
      const updated = studentList.filter((s) => s.id !== id);
      setStudentList(updated);
      const updatedAsesmen = { ...currentAsesmen, daftarSiswaSMAN1Lampasio: updated };
      setCurrentAsesmen(updatedAsesmen);
      onSaveToArchive(updatedAsesmen);
      localStorage.setItem('sman1_lampasio_master_students', JSON.stringify(updated));
      showToast(`Data siswa "${nama}" berhasil dihapus.`);
    }
  };

  // Filtered student list for table
  const displayedStudents = studentList.filter((s) => {
    const matchSearch =
      s.nama.toLowerCase().includes(studentSearch.toLowerCase()) ||
      s.nisn.includes(studentSearch) ||
      s.kelas.toLowerCase().includes(studentSearch.toLowerCase());
    const matchClass = filterKelas === 'Semua' || s.kelas.startsWith(filterKelas);
    return matchSearch && matchClass;
  });

  // Export CSV for Spreadsheets
  const handleExportCSV = () => {
    const headers = ['No', 'NISN', 'Nama Siswa', 'Kelas', 'Nilai Formatif (30%)', 'Nilai LKPD (30%)', 'Nilai Sumatif (40%)', 'Nilai Akhir', 'Status KKTP', 'Catatan Guru'];
    const rows = studentList.map((s, i) => {
      const na = s.nilaiAkhir || calculateFinalGrade(s.nilaiFormatif, s.nilaiLKPD, s.nilaiSumatif);
      const kktp = s.statusKetercapaian || getKKTPStatus(na).text;
      return [
        i + 1,
        `"${s.nisn}"`,
        `"${s.nama}"`,
        `"${s.kelas}"`,
        s.nilaiFormatif,
        s.nilaiLKPD,
        s.nilaiSumatif,
        na,
        `"${kktp}"`,
        `"${s.catatanGuru || '-'}"`,
      ];
    });

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Rekap_Nilai_SMAN1_Lampasio_${mataPelajaran.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Berkas CSV Rekap Nilai berhasil diunduh!');
  };

  const handlePrintAssessment = () => {
    printDocument('printable-assessment-document');
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl border border-slate-700 flex items-center gap-3 animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Generator Top Card */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-900 px-5 sm:px-6 py-4 text-white">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="bg-white/20 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full backdrop-blur-xs border border-white/20 uppercase tracking-wider">
                  Asesmen &amp; CBT Daring
                </span>
                <span className="text-blue-100 text-xs font-medium">Kurikulum Merdeka 2025/2026</span>
              </div>
              <h2 className="text-lg sm:text-xl font-black mt-1 text-white tracking-tight">
                Sistem Penilaian Daring, Buku Nilai &amp; Bank Soal CBT
              </h2>
              <p className="text-xs text-blue-100 mt-0.5">
                Kelola Data Nilai Siswa SMAN 1 Lampasio (Formatif, LKPD, Sumatif) &amp; Butir Soal HOTS Otomatis
              </p>
            </div>
            {activeRpp && (
              <button
                id="btn-sync-rpp-assessment"
                onClick={syncWithRpp}
                className="self-start sm:self-auto text-xs font-semibold bg-white/15 hover:bg-white/25 text-white px-3 py-1.5 rounded-xl border border-white/20 transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Sinkron dari RPP: {activeRpp.topik.substring(0, 22)}...</span>
              </button>
            )}
          </div>
        </div>

        {/* Form Inputs */}
        <div className="p-5 sm:p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Mata Pelajaran <span className="text-rose-500">*</span>
              </label>
              <select
                id="select-asesmen-mapel"
                value={mataPelajaran}
                onChange={(e) => setMataPelajaran(e.target.value)}
                className="w-full text-xs font-medium rounded-xl border border-slate-200 bg-slate-50/60 px-3 py-2 text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600 transition-all"
              >
                {MATA_PELAJARAN_LIST.map((mp) => (
                  <option key={mp} value={mp}>
                    {mp}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Fase &amp; Kelas
              </label>
              <select
                value={faseKelas}
                onChange={(e) => setFaseKelas(e.target.value)}
                className="w-full text-xs font-medium rounded-xl border border-slate-200 bg-slate-50/60 px-3 py-2 text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600 transition-all"
              >
                {FASE_LIST.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Topik / Materi Pembelajaran <span className="text-rose-500">*</span>
              </label>
              <input
                id="input-asesmen-topik"
                type="text"
                value={topik}
                onChange={(e) => setTopik(e.target.value)}
                placeholder="misal: Berpikir Komputasional, Algoritma Percabangan"
                className="w-full text-xs sm:text-sm font-semibold rounded-xl border border-slate-300/90 bg-white px-3.5 py-2 text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600 transition-all shadow-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 pt-1 border-t border-slate-100">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Jumlah Soal Pilihan Ganda (PG)
              </label>
              <select
                value={jumlahPG}
                onChange={(e) => setJumlahPG(Number(e.target.value))}
                className="w-full text-xs font-medium rounded-xl border border-slate-200 bg-slate-50/60 px-3 py-2 text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600 transition-all"
              >
                <option value={3}>3 Butir Soal PG</option>
                <option value={5}>5 Butir Soal PG (Standar)</option>
                <option value={10}>10 Butir Soal PG</option>
                <option value={15}>15 Butir Soal PG</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Jumlah Soal Uraian / HOTS
              </label>
              <select
                value={jumlahUraian}
                onChange={(e) => setJumlahUraian(Number(e.target.value))}
                className="w-full text-xs font-medium rounded-xl border border-slate-200 bg-slate-50/60 px-3 py-2 text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600 transition-all"
              >
                <option value={1}>1 Soal Uraian</option>
                <option value={2}>2 Soal Uraian (Standar)</option>
                <option value={3}>3 Soal Uraian Kasus Nyata</option>
                <option value={5}>5 Soal Uraian Lengkap</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Tingkat Kognitif / Taksonomi Bloom
              </label>
              <select
                value={tingkatKesulitan}
                onChange={(e) => setTingkatKesulitan(e.target.value)}
                className="w-full text-xs font-medium rounded-xl border border-slate-200 bg-slate-50/60 px-3 py-2 text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600 transition-all"
              >
                <option value="Kombinasi HOTS (C4-C6) dan MOTS (C3)">Kombinasi HOTS &amp; MOTS (Direkomendasikan)</option>
                <option value="Dominan HOTS (Analisis C4, Evaluasi C5, Kreasi C6)">Dominan HOTS (Tingkat Tinggi)</option>
                <option value="Konseptual Dasar & Penerapan (C2-C3)">Konseptual &amp; Penerapan (C2-C3)</option>
              </select>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100">
            <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Terintegrasi Interval Predikat KKTP &amp; Rekap Buku Nilai Kurikulum Merdeka</span>
            </div>

            <button
              id="btn-generate-assessment"
              onClick={handleGenerateAsesmen}
              disabled={isLoading}
              className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs sm:text-sm font-bold rounded-xl shadow-md shadow-blue-600/20 hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-white" />
                  <span>Menyusun Butir Soal &amp; Asesmen AI...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Generate Paket Asesmen &amp; Soal CBT</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Sub-Navigation Tabs Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 bg-white p-2 rounded-2xl border border-slate-200/90 shadow-xs">
        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
          <button
            id="subtab-rekap-nilai"
            onClick={() => setSubTab('rekap_nilai')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              subTab === 'rekap_nilai'
                ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/20 ring-1 ring-blue-600'
                : 'text-slate-600 hover:text-blue-700 hover:bg-blue-50/70'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Buku Nilai Siswa ({studentList.length})</span>
          </button>

          <button
            id="subtab-kisi-soal"
            onClick={() => setSubTab('kisi_soal')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              subTab === 'kisi_soal'
                ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/20 ring-1 ring-blue-600'
                : 'text-slate-600 hover:text-blue-700 hover:bg-blue-50/70'
            }`}
          >
            <BookCheck className="w-3.5 h-3.5" />
            <span>Bank Soal &amp; Kunci</span>
          </button>

          <button
            id="subtab-cbt-quiz"
            onClick={() => setSubTab('cbt_quiz')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              subTab === 'cbt_quiz'
                ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/20 ring-1 ring-blue-600'
                : 'text-slate-600 hover:text-blue-700 hover:bg-blue-50/70'
            }`}
          >
            <Play className="w-3.5 h-3.5" />
            <span>Simulasi Ujian CBT</span>
          </button>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-xl border border-emerald-200 transition-colors cursor-pointer"
            title="Ekspor Rekapitulasi ke Excel (.csv)"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span>Excel / CSV</span>
          </button>

          <button
            onClick={handlePrintAssessment}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl border border-slate-200 transition-colors cursor-pointer"
            title="Cetak Berkas Asesmen / PDF"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Cetak PDF</span>
          </button>
        </div>
      </div>

      {/* VIEW 1: REKAP PENILAIAN SISWA DARING SMAN 1 LAMPASIO */}
      {subTab === 'rekap_nilai' && (
        <div className="space-y-4">
          {/* Header Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/90 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">Total Siswa</span>
                <p className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5">{studentList.length} <span className="text-xs font-semibold text-slate-400">Siswa</span></p>
              </div>
              <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
                <Users className="w-4 h-4" />
              </div>
            </div>

            <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/90 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">Rata-Rata Nilai</span>
                <p className="text-xl sm:text-2xl font-black text-blue-600 mt-0.5">
                  {studentList.length > 0
                    ? Math.round(
                        studentList.reduce(
                          (acc, s) => acc + (s.nilaiAkhir || calculateFinalGrade(s.nilaiFormatif, s.nilaiLKPD, s.nilaiSumatif)),
                          0
                        ) / studentList.length
                      )
                    : 0}
                </p>
              </div>
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
                <BarChart3 className="w-4 h-4" />
              </div>
            </div>

            <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/90 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">Tuntas KKTP</span>
                <p className="text-xl sm:text-2xl font-black text-emerald-600 mt-0.5">
                  {
                    studentList.filter((s) => {
                      const na = s.nilaiAkhir || calculateFinalGrade(s.nilaiFormatif, s.nilaiLKPD, s.nilaiSumatif);
                      return na >= 75;
                    }).length
                  }{' '}
                  <span className="text-xs font-semibold text-slate-400">Siswa</span>
                </p>
              </div>
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>

            <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/90 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">Remedial (&lt;75)</span>
                <p className="text-xl sm:text-2xl font-black text-rose-600 mt-0.5">
                  {
                    studentList.filter((s) => {
                      const na = s.nilaiAkhir || calculateFinalGrade(s.nilaiFormatif, s.nilaiLKPD, s.nilaiSumatif);
                      return na < 75;
                    }).length
                  }{' '}
                  <span className="text-xs font-semibold text-slate-400">Siswa</span>
                </p>
              </div>
              <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center font-bold">
                <AlertCircle className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* Student Grade Table Container */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
            {/* Top Management Bar */}
            <div className="p-4 bg-slate-50/80 border-b border-slate-200/80 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h4 className="font-black text-slate-900 text-sm flex items-center gap-2">
                    <span>Buku Nilai Formatif, LKPD, &amp; Sumatif</span>
                    <span className="text-[11px] font-semibold text-slate-500 bg-slate-200/60 px-2 py-0.5 rounded-md">
                      Formula: 30% F + 30% L + 40% S
                    </span>
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Mata Pelajaran: <strong className="text-slate-800">{mataPelajaran}</strong> • Pengampu: <strong className="text-slate-800">{profile.namaGuru}</strong>
                  </p>
                </div>

                {/* Primary Action Buttons */}
                <div className="flex items-center gap-2">
                  <button
                    id="btn-open-add-student-modal"
                    onClick={() => setIsAddModalOpen(true)}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>+ Tambah Siswa</span>
                  </button>

                  <button
                    id="btn-open-import-modal"
                    onClick={() => setIsImportModalOpen(true)}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Import Rombel</span>
                  </button>
                </div>
              </div>

              {/* Quick Add Bar Form */}
              <form
                onSubmit={handleQuickAddStudent}
                className="bg-white p-3 rounded-xl border border-slate-200 shadow-inner flex flex-wrap items-center gap-2"
              >
                <span className="text-xs font-bold text-slate-700 flex items-center gap-1">
                  <Plus className="w-3.5 h-3.5 text-blue-600" /> Tambah Cepat:
                </span>

                <input
                  type="text"
                  required
                  placeholder="Nama Lengkap Siswa *"
                  value={quickNama}
                  onChange={(e) => setQuickNama(e.target.value)}
                  className="text-xs rounded-lg border border-slate-300 px-3 py-1.5 bg-white text-slate-800 flex-1 min-w-44 focus:ring-1 focus:ring-blue-500"
                />

                <input
                  type="text"
                  placeholder="NISN (opsional)"
                  value={quickNisn}
                  onChange={(e) => setQuickNisn(e.target.value)}
                  className="text-xs font-mono rounded-lg border border-slate-300 px-2.5 py-1.5 bg-white text-slate-800 w-32"
                />

                <select
                  value={quickKelas}
                  onChange={(e) => setQuickKelas(e.target.value)}
                  className="text-xs rounded-lg border border-slate-300 px-2.5 py-1.5 bg-white text-slate-800"
                >
                  {classList.map((c) => (
                    <option key={c.id} value={c.namaKelas}>
                      Kelas {c.namaKelas}
                    </option>
                  ))}
                </select>

                <div className="flex items-center gap-1 text-[11px] text-slate-600">
                  <span>F:</span>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={quickFormatif}
                    onChange={(e) => setQuickFormatif(Number(e.target.value))}
                    className="w-12 text-center text-xs font-bold border border-slate-300 rounded px-1 py-1"
                    title="Nilai Formatif"
                  />
                  <span>L:</span>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={quickLkpd}
                    onChange={(e) => setQuickLkpd(Number(e.target.value))}
                    className="w-12 text-center text-xs font-bold border border-slate-300 rounded px-1 py-1"
                    title="Nilai LKPD"
                  />
                  <span>S:</span>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={quickSumatif}
                    onChange={(e) => setQuickSumatif(Number(e.target.value))}
                    className="w-12 text-center text-xs font-bold border border-slate-300 rounded px-1 py-1"
                    title="Nilai Sumatif"
                  />
                </div>

                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-xs transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tambahkan</span>
                </button>
              </form>

              {/* Filter & Search Bar */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-slate-500 font-semibold">Filter Rombel:</span>
                  {['Semua', 'X-A', 'X-B', 'XI', 'XII'].map((k) => (
                    <button
                      key={k}
                      onClick={() => setFilterKelas(k)}
                      className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
                        filterKelas === k
                          ? 'bg-blue-100 text-blue-800 border border-blue-200'
                          : 'text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {k}
                    </button>
                  ))}
                </div>

                <div className="relative w-64">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Cari nama, NISN, atau kelas..."
                    value={studentSearch}
                    onChange={(e) => setStudentSearch(e.target.value)}
                    className="w-full text-xs bg-white border border-slate-300 text-slate-800 placeholder-slate-400 rounded-lg pl-8 pr-2 py-1.5 focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="bg-slate-100/80 text-slate-700 font-bold border-b border-slate-200">
                    <th className="p-3 w-10 text-center">No</th>
                    <th className="p-3">NISN</th>
                    <th className="p-3">Nama Peserta Didik</th>
                    <th className="p-3 w-24">Kelas</th>
                    <th className="p-3 w-28 text-center bg-blue-50/50">Formatif (30%)</th>
                    <th className="p-3 w-28 text-center bg-emerald-50/50">LKPD (30%)</th>
                    <th className="p-3 w-28 text-center bg-purple-50/50">Sumatif (40%)</th>
                    <th className="p-3 w-24 text-center font-extrabold text-blue-900 bg-slate-200/50">
                      Nilai Akhir
                    </th>
                    <th className="p-3">Status Ketercapaian KKTP</th>
                    <th className="p-3">Catatan Perkembangan Siswa</th>
                    <th className="p-3 w-12 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {displayedStudents.map((student, idx) => {
                    const finalVal =
                      student.nilaiAkhir ||
                      calculateFinalGrade(student.nilaiFormatif, student.nilaiLKPD, student.nilaiSumatif);
                    const statusInfo = getKKTPStatus(finalVal);

                    return (
                      <tr key={student.id} className="hover:bg-slate-50/90 transition-colors">
                        <td className="p-3 text-center text-slate-500 font-semibold">{idx + 1}</td>
                        <td className="p-3 font-mono text-[11px] text-slate-600">{student.nisn}</td>
                        <td className="p-3 font-bold text-slate-900">{student.nama}</td>
                        <td className="p-3">
                          <span className="font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                            {student.kelas}
                          </span>
                        </td>

                        {/* Formatif Input */}
                        <td className="p-2 text-center bg-blue-50/20">
                          <input
                            type="number"
                            min={0}
                            max={100}
                            value={student.nilaiFormatif}
                            onChange={(e) =>
                              handleUpdateStudentGrade(student.id, 'nilaiFormatif', Number(e.target.value))
                            }
                            className="w-16 text-center text-xs font-bold p-1 border border-slate-300 rounded-md bg-white focus:ring-1 focus:ring-blue-500 shadow-xs"
                          />
                        </td>

                        {/* LKPD Input */}
                        <td className="p-2 text-center bg-emerald-50/20">
                          <input
                            type="number"
                            min={0}
                            max={100}
                            value={student.nilaiLKPD}
                            onChange={(e) =>
                              handleUpdateStudentGrade(student.id, 'nilaiLKPD', Number(e.target.value))
                            }
                            className="w-16 text-center text-xs font-bold p-1 border border-slate-300 rounded-md bg-white focus:ring-1 focus:ring-blue-500 shadow-xs"
                          />
                        </td>

                        {/* Sumatif Input */}
                        <td className="p-2 text-center bg-purple-50/20">
                          <input
                            type="number"
                            min={0}
                            max={100}
                            value={student.nilaiSumatif}
                            onChange={(e) =>
                              handleUpdateStudentGrade(student.id, 'nilaiSumatif', Number(e.target.value))
                            }
                            className="w-16 text-center text-xs font-bold p-1 border border-slate-300 rounded-md bg-white focus:ring-1 focus:ring-blue-500 shadow-xs"
                          />
                        </td>

                        {/* Final Grade */}
                        <td className="p-3 text-center font-extrabold text-sm text-blue-900 bg-slate-100/50">
                          {finalVal}
                        </td>

                        {/* KKTP Status */}
                        <td className="p-3">
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold ${statusInfo.color}`}
                          >
                            {statusInfo.text}
                          </span>
                        </td>

                        {/* Teacher Notes */}
                        <td className="p-3 text-[11px] text-slate-500 max-w-xs truncate">
                          {student.catatanGuru || 'Sangat baik dalam pembelajaran'}
                        </td>

                        {/* Action Delete */}
                        <td className="p-3 text-center">
                          <button
                            onClick={() => handleDeleteStudent(student.id, student.nama)}
                            className="text-slate-400 hover:text-rose-600 transition-colors p-1.5 rounded hover:bg-rose-50 cursor-pointer"
                            title="Hapus Data Siswa"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {displayedStudents.length === 0 && (
                <div className="p-8 text-center text-slate-500 text-xs">
                  <Users className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <p className="font-semibold">Tidak ada data siswa yang cocok dengan filter / pencarian.</p>
                  <p className="mt-1">Gunakan tombol "+ Tambah Siswa Baru" atau "Import Rombel" di atas.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: KISI-KISI SOAL, KUNCI JAWABAN & KKTP */}
      {subTab === 'kisi_soal' && (
        <div className="space-y-6">
          {/* KKTP Standard Box */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <h4 className="text-sm font-bold text-slate-900 mb-2 flex items-center gap-2">
              <Award className="w-4 h-4 text-purple-600" />
              <span>Kriteria Ketercapaian Tujuan Pembelajaran (KKTP) — Interval Nilai</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              {currentAsesmen.kktpInterval.map((interval, i) => (
                <div key={i} className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="flex items-center justify-between font-bold text-slate-800 mb-1">
                    <span>
                      {interval.batasBawah} - {interval.batasAtas}
                    </span>
                    <span className="text-purple-700 text-[11px] bg-purple-100 px-2 py-0.5 rounded">
                      {interval.predikat}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600">{interval.intervensi}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Question List */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Daftar Butir Soal Asesmen HOTS &amp; Pembahasan
                </h3>
                <p className="text-xs text-slate-500">
                  Mata Pelajaran: {currentAsesmen.mataPelajaran} • {currentAsesmen.faseKelas}
                </p>
              </div>
              <span className="text-xs font-semibold bg-purple-50 text-purple-700 px-3 py-1 rounded-full border border-purple-200">
                Total {currentAsesmen.soalKuis.length} Butir Soal
              </span>
            </div>

            <div className="space-y-6">
              {currentAsesmen.soalKuis.map((soal) => (
                <div
                  key={soal.id}
                  className="p-5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-purple-600 text-white text-xs font-bold flex items-center justify-center">
                        {soal.no}
                      </span>
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-600 bg-slate-200 px-2 py-0.5 rounded">
                        {soal.tipe === 'pilihan_ganda' ? 'Pilihan Ganda' : 'Uraian / Analisis HOTS'}
                      </span>
                      <span className="text-xs font-medium text-slate-500">Bobot: {soal.bobot} Poin</span>
                    </div>
                  </div>

                  <p className="text-sm font-semibold text-slate-900 leading-relaxed">
                    {soal.pertanyaan}
                  </p>

                  {/* Multiple Choice Options */}
                  {soal.pilihan && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-xs">
                      {soal.pilihan.map((opt) => (
                        <div
                          key={opt.key}
                          className={`p-2.5 rounded-lg border ${
                            opt.key === soal.kunciJawaban
                              ? 'bg-emerald-50 border-emerald-300 font-semibold text-emerald-900'
                              : 'bg-white border-slate-200 text-slate-700'
                          }`}
                        >
                          <strong className="mr-2">{opt.key}.</strong>
                          <span>{opt.text}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Solution & Explanation */}
                  <div className="p-3 bg-white rounded-lg border border-slate-200 text-xs space-y-1.5">
                    <div className="flex items-center gap-2 text-emerald-700 font-bold">
                      <Check className="w-3.5 h-3.5" />
                      <span>Kunci Jawaban: {soal.kunciJawaban}</span>
                    </div>
                    <p className="text-slate-600 leading-relaxed">
                      <strong>Pembahasan &amp; Analisis:</strong> {soal.pembahasan}
                    </p>
                    <p className="text-[11px] text-slate-400">
                      <strong>TP Terkait:</strong> {soal.tujuanPembelajaranTerkait}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* VIEW 3: SIMULASI CBT DARING INTERAKTIF */}
      {subTab === 'cbt_quiz' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200 pb-4">
            <div>
              <span className="text-[11px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md">
                Computer-Based Test (CBT) Simulation
              </span>
              <h3 className="text-lg font-bold text-slate-900 mt-1">
                Simulasi Pengerjaan Asesmen Daring Siswa
              </h3>
              <p className="text-xs text-slate-500">
                Pilih jawaban untuk menguji sistem koreksi otomatis dan pembobotan skor CBT.
              </p>
            </div>

            {quizSubmitted && quizScore !== null && (
              <div className="text-right">
                <span className="text-xs text-slate-500">Skor Akhir CBT:</span>
                <div className="text-3xl font-extrabold text-purple-700">{quizScore} / 100</div>
              </div>
            )}
          </div>

          {/* Quiz Questions */}
          <div className="space-y-6">
            {currentAsesmen.soalKuis.map((soal) => {
              if (soal.tipe !== 'pilihan_ganda') return null;

              const isAnswered = !!userAnswers[soal.no];
              const isCorrect = userAnswers[soal.no] === soal.kunciJawaban;

              return (
                <div
                  key={soal.id}
                  className={`p-5 rounded-xl border transition-all ${
                    quizSubmitted
                      ? isCorrect
                        ? 'bg-emerald-50/60 border-emerald-300'
                        : 'bg-rose-50/60 border-rose-300'
                      : 'bg-slate-50/50 border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-purple-700 bg-purple-100 px-2.5 py-0.5 rounded-full">
                      Soal No. {soal.no}
                    </span>
                    {quizSubmitted && (
                      <span
                        className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                          isCorrect ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {isCorrect ? '✓ Benar' : '✗ Salah'}
                      </span>
                    )}
                  </div>

                  <p className="text-sm font-semibold text-slate-900 mb-3">{soal.pertanyaan}</p>

                  <div className="space-y-2">
                    {soal.pilihan?.map((opt) => {
                      const isSelected = userAnswers[soal.no] === opt.key;
                      return (
                        <button
                          key={opt.key}
                          disabled={quizSubmitted}
                          onClick={() => handleSelectAnswer(soal.no, opt.key)}
                          className={`w-full text-left p-3 rounded-xl border text-xs flex items-center gap-3 transition-all ${
                            isSelected
                              ? 'bg-purple-600 text-white border-purple-600 font-semibold shadow-xs'
                              : 'bg-white text-slate-700 border-slate-200 hover:bg-purple-50 hover:border-purple-200'
                          }`}
                        >
                          <span
                            className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                              isSelected ? 'bg-white text-purple-700' : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {opt.key}
                          </span>
                          <span>{opt.text}</span>
                        </button>
                      );
                    })}
                  </div>

                  {quizSubmitted && (
                    <div className="mt-3 p-3 bg-white rounded-lg border border-slate-200 text-xs">
                      <p className="font-bold text-slate-800 mb-1">
                        Kunci Jawaban: {soal.kunciJawaban}
                      </p>
                      <p className="text-slate-600">{soal.pembahasan}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Action Button */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
            <button
              onClick={handleResetQuiz}
              className="text-xs text-slate-600 hover:text-slate-900 font-semibold cursor-pointer"
            >
              Reset Jawaban Ujian
            </button>

            {!quizSubmitted ? (
              <button
                id="btn-submit-cbt"
                onClick={handleSubmitQuiz}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl shadow-md transition-colors flex items-center gap-2 cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>Kirim &amp; Periksa Skor Ujian</span>
              </button>
            ) : (
              <button
                onClick={handleResetQuiz}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl shadow-md transition-colors cursor-pointer"
              >
                Coba Ujian Kembali
              </button>
            )}
          </div>
        </div>
      )}

      {/* Hidden Printable Document for PDF Export */}
      <div id="printable-assessment-document" className="hidden print:block">
        <div className="text-center pb-4 border-b-2 border-black mb-6">
          <h2 className="text-base font-bold uppercase">{profile.namaSekolah}</h2>
          <p className="text-xs">{profile.alamat}</p>
          <p className="text-xs">{profile.kabupaten}, {profile.provinsi}</p>
          <h3 className="text-sm font-bold uppercase mt-3 underline">
            REKAPITULASI NILAI &amp; BANK SOAL ASESMEN KURIKULUM MERDEKA
          </h3>
          <p className="text-xs">
            Mata Pelajaran: {mataPelajaran} • Tahun Pelajaran: {profile.tahunPelajaran} ({profile.semester})
          </p>
        </div>

        <h4 className="font-bold text-xs mb-2">I. DAFTAR NILAI SISWA</h4>
        <table className="w-full text-[10px] border-collapse border border-black mb-6">
          <thead>
            <tr className="bg-slate-100">
              <th className="border border-black p-1">No</th>
              <th className="border border-black p-1">NISN</th>
              <th className="border border-black p-1">Nama Siswa</th>
              <th className="border border-black p-1">Kelas</th>
              <th className="border border-black p-1">Formatif</th>
              <th className="border border-black p-1">LKPD</th>
              <th className="border border-black p-1">Sumatif</th>
              <th className="border border-black p-1">Nilai Akhir</th>
              <th className="border border-black p-1">Status KKTP</th>
            </tr>
          </thead>
          <tbody>
            {studentList.map((s, i) => (
              <tr key={s.id}>
                <td className="border border-black p-1 text-center">{i + 1}</td>
                <td className="border border-black p-1">{s.nisn}</td>
                <td className="border border-black p-1 font-bold">{s.nama}</td>
                <td className="border border-black p-1 text-center">{s.kelas}</td>
                <td className="border border-black p-1 text-center">{s.nilaiFormatif}</td>
                <td className="border border-black p-1 text-center">{s.nilaiLKPD}</td>
                <td className="border border-black p-1 text-center">{s.nilaiSumatif}</td>
                <td className="border border-black p-1 text-center font-bold">
                  {s.nilaiAkhir || calculateFinalGrade(s.nilaiFormatif, s.nilaiLKPD, s.nilaiSumatif)}
                </td>
                <td className="border border-black p-1">{s.statusKetercapaian}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Signature Columns */}
        <div className="grid grid-cols-2 gap-8 pt-8 text-xs text-center">
          <div>
            <p>Mengetahui,</p>
            <p>Kepala {profile.namaSekolah}</p>
            <div className="h-16"></div>
            <p className="font-bold underline">{profile.namaKepalaSekolah}</p>
            <p>NIP. {profile.nipKepalaSekolah}</p>
          </div>
          <div>
            <p>Lampasio, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
            <p>Guru Mata Pelajaran</p>
            <div className="h-16"></div>
            <p className="font-bold underline">{profile.namaGuru}</p>
            <p>NIP. {profile.nipGuru}</p>
          </div>
        </div>
      </div>

      {/* Add Student Modal */}
      <AddStudentModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddStudent={handleAddStudentFromModal}
      />

      {/* Batch Import Students Modal */}
      <BatchImportStudentsModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImportStudents={handleImportStudents}
      />
    </div>
  );
};
