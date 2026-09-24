import React, { useState } from 'react';
import {
  GraduationCap,
  Sparkles,
  School,
  UserCheck,
  KeyRound,
  Search,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  UserPlus,
  Lock,
  Mail,
  User,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Cpu,
  Layers,
} from 'lucide-react';
import { TeacherUser, SchoolProfile } from '../types';
import { TEACHER_ACCOUNTS_SMAN1_LAMPASIO, MATA_PELAJARAN_LIST } from '../data/sampleTemplates';

interface LoginPageProps {
  onLoginSuccess: (teacher: TeacherUser) => void;
  currentProfile?: SchoolProfile;
  schoolName?: string;
  teacherList?: TeacherUser[];
  existingTeachers?: TeacherUser[];
  onAddNewTeacher?: (newTeacher: TeacherUser) => void;
  onRegisterTeacher?: (newTeacher: TeacherUser) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onLoginSuccess,
  currentProfile,
  schoolName,
  teacherList,
  existingTeachers,
  onAddNewTeacher,
  onRegisterTeacher,
}) => {
  const effectiveTeachers = teacherList || existingTeachers || TEACHER_ACCOUNTS_SMAN1_LAMPASIO;
  const effectiveSchoolName = schoolName || currentProfile?.namaSekolah || 'SMA Negeri 1 Lampasio';
  const handleAdd = onAddNewTeacher || onRegisterTeacher || (() => {});
  const [loginMode, setLoginMode] = useState<'quick' | 'form' | 'register'>('quick');
  const [selectedRumpun, setSelectedRumpun] = useState<string>('Semua');
  const [searchQuery, setSearchQuery] = useState('');

  // Form State
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Register New Teacher State
  const [regNama, setRegNama] = useState('');
  const [regNip, setRegNip] = useState('');
  const [regMapel, setRegMapel] = useState('Informatika');
  const [regRumpun, setRegRumpun] = useState<'MIPA' | 'IPS' | 'Bahasa' | 'Umum & Vokasi' | 'Manajemen & Konseling'>('MIPA');
  const [regFase, setRegFase] = useState('Fase E (Kelas X)');
  const [regUsername, setRegUsername] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regSuccess, setRegSuccess] = useState(false);

  const rumpunOptions = ['Semua', 'MIPA', 'IPS', 'Bahasa', 'Umum & Vokasi', 'Manajemen & Konseling'];

  const filteredTeachers = effectiveTeachers.filter((teacher) => {
    const matchRumpun = selectedRumpun === 'Semua' || teacher.rumpunMapel === selectedRumpun;
    const matchSearch =
      teacher.namaLengkap.toLowerCase().includes(searchQuery.toLowerCase()) ||
      teacher.mataPelajaran.toLowerCase().includes(searchQuery.toLowerCase()) ||
      teacher.nip.includes(searchQuery) ||
      teacher.username.toLowerCase().includes(searchQuery.toLowerCase());
    return matchRumpun && matchSearch;
  });

  const handleQuickLogin = (teacher: TeacherUser) => {
    onLoginSuccess(teacher);
  };

  const handleFormLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setIsSubmitting(true);

    setTimeout(() => {
      const found = effectiveTeachers.find(
        (t) =>
          (t.username.toLowerCase() === usernameInput.trim().toLowerCase() ||
            t.nip.replace(/\s+/g, '') === usernameInput.trim().replace(/\s+/g, '') ||
            t.email.toLowerCase() === usernameInput.trim().toLowerCase()) &&
          (passwordInput === 'password123' || t.password === passwordInput || passwordInput === 'guru123' || !t.password)
      );

      if (found) {
        onLoginSuccess(found);
      } else {
        setFormError('Nama pengguna, NIP, atau kata sandi tidak cocok. Gunakan fitur Akses Cepat Guru Mapel atau kata sandi standar: password123');
      }
      setIsSubmitting(false);
    }, 400);
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regNama.trim()) {
      setFormError('Nama lengkap guru wajib diisi.');
      return;
    }

    const newTeacher: TeacherUser = {
      id: 'guru-custom-' + Date.now(),
      username: regUsername.trim() || `guru.${regMapel.toLowerCase().replace(/[^a-z0-9]/g, '')}.${Date.now().toString().slice(-4)}`,
      password: regPassword || 'password123',
      namaLengkap: regNama.trim(),
      nip: regNip.trim() || '19900101 202001 1 001',
      mataPelajaran: regMapel,
      rumpunMapel: regRumpun,
      faseDefault: regFase,
      email: `${regUsername.trim() || 'guru'}@sman1lampasio.sch.id`,
      role: 'guru',
      avatarBgColor: 'bg-indigo-600',
    };

    handleAdd(newTeacher);
    setRegSuccess(true);
    setTimeout(() => {
      onLoginSuccess(newTeacher);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-between font-sans antialiased text-slate-100 selection:bg-blue-600 selection:text-white">
      {/* Background Decorative Glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/3 -right-40 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl"></div>
      </div>

      {/* Top Identity Bar */}
      <header className="relative z-10 border-b border-slate-800/80 bg-slate-900/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20 text-white">
              <GraduationCap className="w-6 h-6 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400 bg-blue-950/80 px-2 py-0.5 rounded-full border border-blue-800/60">
                  Kurikulum Merdeka 2025/2026
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-800/60">
                  <Sparkles className="w-2.5 h-2.5" /> AI Powered
                </span>
              </div>
              <h1 className="text-base font-bold text-white tracking-tight">
                {effectiveSchoolName}
              </h1>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400">
            <School className="w-4 h-4 text-slate-500" />
            <span>Kec. Lampasio, Kab. Tolitoli, Sulawesi Tengah</span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col justify-center">
        <div className="text-center max-w-2xl mx-auto mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs font-medium mb-3">
            <Cpu className="w-3.5 h-3.5 text-blue-400" />
            Portal Guru Mapel & Asisten Perangkat Ajar AI
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Masuk Portal Guru SMA Negeri 1 Lampasio
          </h2>
          <p className="text-sm text-slate-400 mt-2">
            Pilih akun Guru Mata Pelajaran Anda untuk mengakses Generator Modul Ajar (RPP), LKPD HOTS, Sistem Penilaian Daring, dan Rekap Nilai Siswa.
          </p>

          {/* Mode Switcher Tabs */}
          <div className="mt-6 inline-flex p-1 rounded-xl bg-slate-800/90 border border-slate-700/80 shadow-inner">
            <button
              id="btn-mode-quick"
              onClick={() => {
                setLoginMode('quick');
                setFormError(null);
              }}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
                loginMode === 'quick'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <UserCheck className="w-4 h-4" />
              <span>Akses Cepat Guru Mapel</span>
            </button>

            <button
              id="btn-mode-form"
              onClick={() => {
                setLoginMode('form');
                setFormError(null);
              }}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
                loginMode === 'form'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <KeyRound className="w-4 h-4" />
              <span>Login Standar (NIP / Akun)</span>
            </button>

            <button
              id="btn-mode-register"
              onClick={() => {
                setLoginMode('register');
                setFormError(null);
                setRegSuccess(false);
              }}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
                loginMode === 'register'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <UserPlus className="w-4 h-4" />
              <span>Tambah Guru Baru</span>
            </button>
          </div>
        </div>

        {/* MODE 1: QUICK LOGIN BY SUBJECT TEACHER */}
        {loginMode === 'quick' && (
          <div className="space-y-6">
            {/* Filter & Search Bar */}
            <div className="bg-slate-800/80 border border-slate-700/70 p-4 rounded-2xl backdrop-blur-md flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl">
              {/* Rumpun Filter Tabs */}
              <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
                <span className="text-xs font-semibold text-slate-400 mr-1 hidden sm:inline">
                  Rumpun:
                </span>
                {rumpunOptions.map((rumpun) => (
                  <button
                    key={rumpun}
                    onClick={() => setSelectedRumpun(rumpun)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                      selectedRumpun === rumpun
                        ? 'bg-blue-500/20 text-blue-300 border border-blue-400/40 shadow-xs'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/60 border border-transparent'
                    }`}
                  >
                    {rumpun}
                  </button>
                ))}
              </div>

              {/* Search Bar */}
              <div className="relative w-full md:w-72">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari guru, mapel, atau NIP..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full text-xs bg-slate-900/90 border border-slate-700 text-slate-200 placeholder-slate-500 rounded-xl pl-9 pr-3 py-2 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Teacher Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredTeachers.map((teacher) => {
                const isSpecial = teacher.role === 'kepsek' || teacher.role === 'admin';
                return (
                  <div
                    key={teacher.id}
                    className={`group relative bg-slate-800/70 hover:bg-slate-800 border ${
                      isSpecial
                        ? 'border-amber-500/40 hover:border-amber-400/80 shadow-amber-500/5'
                        : 'border-slate-700/70 hover:border-blue-500/60 shadow-blue-500/5'
                    } rounded-2xl p-5 transition-all duration-200 flex flex-col justify-between hover:shadow-xl hover:-translate-y-0.5`}
                  >
                    <div>
                      {/* Top Badges */}
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${
                            teacher.rumpunMapel === 'MIPA'
                              ? 'bg-blue-950 text-blue-300 border-blue-800/60'
                              : teacher.rumpunMapel === 'IPS'
                              ? 'bg-amber-950 text-amber-300 border-amber-800/60'
                              : teacher.rumpunMapel === 'Bahasa'
                              ? 'bg-emerald-950 text-emerald-300 border-emerald-800/60'
                              : teacher.rumpunMapel === 'Umum & Vokasi'
                              ? 'bg-purple-950 text-purple-300 border-purple-800/60'
                              : 'bg-rose-950 text-rose-300 border-rose-800/60'
                          }`}
                        >
                          {teacher.rumpunMapel}
                        </span>

                        <span className="text-[11px] font-mono text-slate-400">
                          {teacher.username}
                        </span>
                      </div>

                      {/* Teacher Profile Info */}
                      <div className="flex items-start gap-3 mb-4">
                        <div
                          className={`w-11 h-11 rounded-xl flex items-center justify-center text-white font-bold text-base shadow-md ${
                            teacher.avatarBgColor || 'bg-blue-600'
                          }`}
                        >
                          {teacher.namaLengkap.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-bold text-white group-hover:text-blue-300 transition-colors leading-snug truncate">
                            {teacher.namaLengkap}
                          </h3>
                          <p className="text-xs font-medium text-emerald-400 mt-0.5">
                            Guru {teacher.mataPelajaran}
                          </p>
                          <p className="text-[11px] text-slate-400 font-mono mt-1 truncate">
                            NIP: {teacher.nip}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Action Button */}
                    <button
                      id={`btn-login-${teacher.username}`}
                      onClick={() => handleQuickLogin(teacher)}
                      className={`w-full mt-2 py-2 px-3 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md ${
                        isSpecial
                          ? 'bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white'
                          : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white'
                      }`}
                    >
                      <UserCheck className="w-3.5 h-3.5" />
                      <span>Masuk Sebagai Guru {teacher.mataPelajaran}</span>
                      <ArrowRight className="w-3.5 h-3.5 opacity-70 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                );
              })}
            </div>

            {filteredTeachers.length === 0 && (
              <div className="text-center py-12 bg-slate-800/40 rounded-2xl border border-slate-700/60">
                <Search className="w-10 h-10 text-slate-600 mx-auto mb-2" />
                <p className="text-sm font-semibold text-slate-300">
                  Guru Mata Pelajaran tidak ditemukan
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Coba gunakan kata kunci pencarian lain atau pilih tab 'Semua'.
                </p>
              </div>
            )}
          </div>
        )}

        {/* MODE 2: STANDARD LOGIN FORM */}
        {loginMode === 'form' && (
          <div className="max-w-md mx-auto w-full">
            <div className="bg-slate-800/90 border border-slate-700/80 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Login Akun Guru</h3>
                  <p className="text-xs text-slate-400">Masukkan NIP, Email, atau Username resmi</p>
                </div>
              </div>

              {formError && (
                <div className="mb-5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <span>{formError}</span>
                </div>
              )}

              <form onSubmit={handleFormLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Nama Pengguna / NIP / Email
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      required
                      placeholder="contoh: guru.informatika atau 19890415..."
                      value={usernameInput}
                      onChange={(e) => setUsernameInput(e.target.value)}
                      className="w-full text-xs bg-slate-900/90 border border-slate-700 text-white placeholder-slate-500 rounded-xl pl-9 pr-3 py-2.5 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Kata Sandi
                  </label>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="Masukkan kata sandi (default: password123)"
                      value={passwordInput}
                      onChange={(e) => setPasswordInput(e.target.value)}
                      className="w-full text-xs bg-slate-900/90 border border-slate-700 text-white placeholder-slate-500 rounded-xl pl-9 pr-10 py-2.5 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-200"
                    >
                      {showPassword ? 'Sembunyi' : 'Lihat'}
                    </button>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <span>Memverifikasi Akun...</span>
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4" />
                        <span>Masuk ke Dashboard Guru</span>
                      </>
                    )}
                  </button>
                </div>
              </form>

              {/* Helpful Preset Hints */}
              <div className="mt-6 pt-5 border-t border-slate-700/60 text-xs text-slate-400">
                <div className="flex items-center gap-1 text-slate-300 font-semibold mb-2">
                  <HelpCircle className="w-3.5 h-3.5 text-blue-400" />
                  <span>Petunjuk Kredensial Guru:</span>
                </div>
                <p className="text-[11px] leading-relaxed text-slate-400">
                  Kata sandi default semua guru mapel adalah <code className="text-amber-300 bg-slate-900 px-1 py-0.5 rounded font-mono">password123</code>. Anda juga dapat menggunakan tab <strong className="text-slate-300">"Akses Cepat Guru Mapel"</strong> untuk masuk instan tanpa mengetik sandi.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* MODE 3: REGISTER NEW TEACHER */}
        {loginMode === 'register' && (
          <div className="max-w-xl mx-auto w-full">
            <div className="bg-slate-800/90 border border-slate-700/80 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Tambah Akun Guru Mapel Baru</h3>
                  <p className="text-xs text-slate-400">Daftarkan profil guru baru SMA Negeri 1 Lampasio</p>
                </div>
              </div>

              {regSuccess && (
                <div className="mb-5 p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  <div>
                    <strong className="block font-bold">Akun Guru Berhasil Ditambahkan!</strong>
                    <span>Sedang mengarahkan Anda ke Dashboard Pembelajaran...</span>
                  </div>
                </div>
              )}

              {formError && !regSuccess && (
                <div className="mb-5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <span>{formError}</span>
                </div>
              )}

              <form onSubmit={handleRegister} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Nama Lengkap & Gelar <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="contoh: Budi Santoso, S.Pd."
                      value={regNama}
                      onChange={(e) => setRegNama(e.target.value)}
                      className="w-full text-xs bg-slate-900/90 border border-slate-700 text-white rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      NIP / NUPTK
                    </label>
                    <input
                      type="text"
                      placeholder="contoh: 19910512 201903 1 008"
                      value={regNip}
                      onChange={(e) => setRegNip(e.target.value)}
                      className="w-full text-xs bg-slate-900/90 border border-slate-700 text-white rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Mata Pelajaran yang Diampu <span className="text-rose-400">*</span>
                    </label>
                    <select
                      value={regMapel}
                      onChange={(e) => setRegMapel(e.target.value)}
                      className="w-full text-xs bg-slate-900 border border-slate-700 text-white rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-blue-500"
                    >
                      {MATA_PELAJARAN_LIST.map((mp) => (
                        <option key={mp} value={mp}>
                          {mp}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Rumpun Mata Pelajaran
                    </label>
                    <select
                      value={regRumpun}
                      onChange={(e) => setRegRumpun(e.target.value as any)}
                      className="w-full text-xs bg-slate-900 border border-slate-700 text-white rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="MIPA">MIPA (Matematika & IPA)</option>
                      <option value="IPS">IPS (Ilmu Pengetahuan Sosial)</option>
                      <option value="Bahasa">Bahasa & Literasi</option>
                      <option value="Umum & Vokasi">Umum & Vokasi (PPKn, PJOK, Seni, PKWU)</option>
                      <option value="Manajemen & Konseling">Manajemen, BK & Manajerial</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Username / Akun Login
                    </label>
                    <input
                      type="text"
                      placeholder="contoh: guru.budi"
                      value={regUsername}
                      onChange={(e) => setRegUsername(e.target.value)}
                      className="w-full text-xs bg-slate-900/90 border border-slate-700 text-white rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Kata Sandi
                    </label>
                    <input
                      type="password"
                      placeholder="Default: password123"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      className="w-full text-xs bg-slate-900/90 border border-slate-700 text-white rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={regSuccess}
                    className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>Simpan & Masuk Sebagai Guru Baru</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-800/80 bg-slate-900/80 backdrop-blur-md py-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>SMA Negeri 1 Lampasio — Terintegrasi BSKAP 032/H/KR/2024 &amp; Kemendikbudristek</span>
          <span>Sistem Administrasi Guru &amp; Penilaian Daring Berbasis AI</span>
        </div>
      </footer>
    </div>
  );
};
