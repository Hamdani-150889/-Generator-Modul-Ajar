import React, { useState, useEffect } from 'react';
import { X, UserCheck, Check, Shield, Lock, Mail, GraduationCap } from 'lucide-react';
import { TeacherUser } from '../types';
import { MATA_PELAJARAN_LIST } from '../data/sampleTemplates';

interface AddEditTeacherModalProps {
  isOpen: boolean;
  onClose: () => void;
  teacherData?: TeacherUser | null;
  onSaveTeacher: (teacher: TeacherUser) => void;
}

export const AddEditTeacherModal: React.FC<AddEditTeacherModalProps> = ({
  isOpen,
  onClose,
  teacherData,
  onSaveTeacher,
}) => {
  const [namaLengkap, setNamaLengkap] = useState('');
  const [nip, setNip] = useState('');
  const [mataPelajaran, setMataPelajaran] = useState('Informatika');
  const [rumpunMapel, setRumpunMapel] = useState<'MIPA' | 'IPS' | 'Bahasa' | 'Umum & Vokasi' | 'Manajemen & Konseling'>('MIPA');
  const [faseDefault, setFaseDefault] = useState('Fase E (Kelas X)');
  const [statusKepegawaian, setStatusKepegawaian] = useState<'PNS' | 'PPPK' | 'GTT / Honorer' | 'Guru Penggerak'>('PNS');
  const [role, setRole] = useState<'guru' | 'kepsek' | 'admin'>('guru');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('password123');
  const [avatarBgColor, setAvatarBgColor] = useState('bg-blue-600');

  useEffect(() => {
    if (teacherData) {
      setNamaLengkap(teacherData.namaLengkap);
      setNip(teacherData.nip);
      setMataPelajaran(teacherData.mataPelajaran);
      setRumpunMapel(teacherData.rumpunMapel);
      setFaseDefault(teacherData.faseDefault || 'Fase E (Kelas X)');
      setStatusKepegawaian(teacherData.statusKepegawaian || 'PNS');
      setRole(teacherData.role || 'guru');
      setEmail(teacherData.email);
      setUsername(teacherData.username);
      setPassword(teacherData.password || 'password123');
      setAvatarBgColor(teacherData.avatarBgColor || 'bg-blue-600');
    } else {
      setNamaLengkap('');
      setNip('');
      setMataPelajaran('Informatika');
      setRumpunMapel('MIPA');
      setFaseDefault('Fase E (Kelas X)');
      setStatusKepegawaian('PNS');
      setRole('guru');
      setEmail('');
      setUsername('');
      setPassword('password123');
      setAvatarBgColor('bg-blue-600');
    }
  }, [teacherData, isOpen]);

  if (!isOpen) return null;

  // Auto detect rumpun when mapel changes
  const handleMapelChange = (mapel: string) => {
    setMataPelajaran(mapel);
    if (['Informatika', 'Matematika', 'Fisika', 'Kimia', 'Biologi'].includes(mapel)) {
      setRumpunMapel('MIPA');
    } else if (['Geografi', 'Ekonomi', 'Sosiologi', 'Sejarah'].includes(mapel)) {
      setRumpunMapel('IPS');
    } else if (['Bahasa Indonesia', 'Bahasa Inggris'].includes(mapel)) {
      setRumpunMapel('Bahasa');
    } else if (['Bimbingan Konseling (BK)', 'Kepala Sekolah / Manajerial', 'Administrator Kurikulum Merdeka'].includes(mapel)) {
      setRumpunMapel('Manajemen & Konseling');
    } else {
      setRumpunMapel('Umum & Vokasi');
    }
  };

  const handleNameChange = (name: string) => {
    setNamaLengkap(name);
    if (!teacherData && !username) {
      // Auto generate friendly username
      const clean = name.toLowerCase().replace(/[^a-z0-9]/g, '.').replace(/\.+/g, '.').replace(/^\.|\.$/g, '');
      setUsername('guru.' + clean.slice(0, 15));
      setEmail(clean.slice(0, 15) + '@sman1lampasio.sch.id');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!namaLengkap.trim()) return;

    const finalNip = nip.trim() || '19900101 ' + Math.floor(201001 + Math.random() * 90000) + ' 1 001';
    const finalUsername = username.trim() || 'guru.' + Math.floor(1000 + Math.random() * 9000);
    const finalEmail = email.trim() || `${finalUsername}@sman1lampasio.sch.id`;

    const updatedOrNewTeacher: TeacherUser = {
      id: teacherData?.id || 'guru-' + Date.now(),
      namaLengkap: namaLengkap.trim(),
      nip: finalNip,
      mataPelajaran,
      rumpunMapel,
      faseDefault,
      statusKepegawaian,
      role,
      email: finalEmail,
      username: finalUsername,
      password: password.trim() || 'password123',
      avatarBgColor,
    };

    onSaveTeacher(updatedOrNewTeacher);
    onClose();
  };

  const colors = [
    { name: 'Biru', val: 'bg-blue-600' },
    { name: 'Indigo', val: 'bg-indigo-600' },
    { name: 'Emerald', val: 'bg-emerald-600' },
    { name: 'Teal', val: 'bg-teal-600' },
    { name: 'Sky', val: 'bg-sky-600' },
    { name: 'Purple', val: 'bg-purple-600' },
    { name: 'Rose', val: 'bg-rose-600' },
    { name: 'Amber', val: 'bg-amber-600' },
    { name: 'Orange', val: 'bg-orange-600' },
    { name: 'Dark Slate', val: 'bg-slate-800' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl border border-slate-200 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-indigo-700 via-purple-800 to-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center text-white">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                {teacherData ? 'Edit Data Guru & Tenaga Pendidik' : 'Tambah Guru & Tendik Baru'}
              </h3>
              <p className="text-xs text-indigo-100">SMA Negeri 1 Lampasio — Administrasi Kepegawaian Guru</p>
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
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nama Lengkap &amp; Gelar Guru <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="contoh: Muhammad Ilham, S.Pd., M.Pd."
                value={namaLengkap}
                onChange={(e) => handleNameChange(e.target.value)}
                className="w-full text-xs font-bold rounded-xl border border-slate-300 px-3 py-2 bg-white text-slate-800 focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                NIP / NUPTK Guru
              </label>
              <input
                type="text"
                placeholder="19890415 201503 1 004"
                value={nip}
                onChange={(e) => setNip(e.target.value)}
                className="w-full text-xs font-mono rounded-xl border border-slate-300 px-3 py-2 bg-white text-slate-800 focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Status Kepegawaian
              </label>
              <select
                value={statusKepegawaian}
                onChange={(e) => setStatusKepegawaian(e.target.value as any)}
                className="w-full text-xs rounded-xl border border-slate-300 px-3 py-2 bg-white text-slate-800"
              >
                <option value="PNS">Pegawai Negeri Sipil (PNS)</option>
                <option value="PPPK">Pegawai Pemerintah dg Perjanjian Kerja (PPPK)</option>
                <option value="GTT / Honorer">Guru Tidak Tetap (GTT) / Honorer</option>
                <option value="Guru Penggerak">Guru Penggerak / Fasilitator</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Mata Pelajaran yang Diampu <span className="text-rose-500">*</span>
              </label>
              <select
                value={mataPelajaran}
                onChange={(e) => handleMapelChange(e.target.value)}
                className="w-full text-xs font-bold rounded-xl border border-slate-300 px-3 py-2 bg-white text-slate-800 focus:ring-2 focus:ring-indigo-500"
              >
                {MATA_PELAJARAN_LIST.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
                <option value="Bimbingan Konseling (BK)">Bimbingan Konseling (BK)</option>
                <option value="Kepala Sekolah / Manajerial">Kepala Sekolah / Manajerial</option>
                <option value="Administrator Kurikulum Merdeka">Administrator Kurikulum Merdeka</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Rumpun Mata Pelajaran
              </label>
              <select
                value={rumpunMapel}
                onChange={(e) => setRumpunMapel(e.target.value as any)}
                className="w-full text-xs rounded-xl border border-slate-300 px-3 py-2 bg-white text-slate-800"
              >
                <option value="MIPA">MIPA (Matematika &amp; Sains)</option>
                <option value="IPS">IPS (Sosial Humaniora)</option>
                <option value="Bahasa">Bahasa &amp; Sastra</option>
                <option value="Umum & Vokasi">Umum &amp; Vokasi / Seni / PJOK</option>
                <option value="Manajemen & Konseling">Manajemen &amp; Konseling (BK / Tendik)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Fase / Tingkat Mengajar Default
              </label>
              <select
                value={faseDefault}
                onChange={(e) => setFaseDefault(e.target.value)}
                className="w-full text-xs rounded-xl border border-slate-300 px-3 py-2 bg-white text-slate-800"
              >
                <option value="Fase E (Kelas X)">Fase E (Kelas X)</option>
                <option value="Fase F (Kelas XI)">Fase F (Kelas XI)</option>
                <option value="Fase F (Kelas XII)">Fase F (Kelas XII)</option>
                <option value="Fase E & F">Fase E &amp; F (Semua Jenjang)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Hak Akses / Peran Akun (Role)
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as any)}
                className="w-full text-xs font-bold rounded-xl border border-slate-300 px-3 py-2 bg-white text-slate-800"
              >
                <option value="guru">Guru Mata Pelajaran</option>
                <option value="admin">Administrator / Tim Kurikulum</option>
                <option value="kepsek">Kepala Sekolah</option>
              </select>
            </div>

            {/* Credential Section */}
            <div className="sm:col-span-2 pt-2 border-t border-slate-100">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5 mb-2">
                <Lock className="w-3.5 h-3.5 text-indigo-600" />
                Informasi Login &amp; Kredensial Akun
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Username Login <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="misal: guru.ahmad"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full text-xs font-mono rounded-xl border border-slate-300 px-3 py-2 bg-white text-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Password Akun
              </label>
              <input
                type="text"
                placeholder="password123"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full text-xs font-mono rounded-xl border border-slate-300 px-3 py-2 bg-white text-slate-800"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Email Resmi SMAN 1 Lampasio
              </label>
              <input
                type="email"
                placeholder="nama.guru@sman1lampasio.sch.id"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full text-xs rounded-xl border border-slate-300 px-3 py-2 bg-white text-slate-800"
              />
            </div>

            {/* Avatar Badge Color */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Warna Identitas Avatar
              </label>
              <div className="flex flex-wrap gap-2">
                {colors.map((c) => (
                  <button
                    key={c.val}
                    type="button"
                    onClick={() => setAvatarBgColor(c.val)}
                    className={`w-7 h-7 rounded-xl flex items-center justify-center text-white transition-all ${c.val} ${
                      avatarBgColor === c.val ? 'ring-3 ring-slate-800 scale-110' : 'opacity-80 hover:opacity-100'
                    }`}
                  >
                    {avatarBgColor === c.val && <Check className="w-3.5 h-3.5" />}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Footer Action Buttons */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>{teacherData ? 'Simpan Perubahan Guru' : 'Tambahkan Guru Baru'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
