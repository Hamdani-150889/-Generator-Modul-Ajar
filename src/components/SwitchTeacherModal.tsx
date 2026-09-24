import React, { useState } from 'react';
import { X, UserCheck, Search, ArrowRight, GraduationCap } from 'lucide-react';
import { TeacherUser } from '../types';

interface SwitchTeacherModalProps {
  isOpen: boolean;
  onClose: () => void;
  teacherList: TeacherUser[];
  currentTeacher: TeacherUser | null;
  onSelectTeacher: (teacher: TeacherUser) => void;
}

export const SwitchTeacherModal: React.FC<SwitchTeacherModalProps> = ({
  isOpen,
  onClose,
  teacherList,
  currentTeacher,
  onSelectTeacher,
}) => {
  const [search, setSearch] = useState('');
  const [selectedRumpun, setSelectedRumpun] = useState('Semua');

  if (!isOpen) return null;

  const rumpunOptions = ['Semua', 'MIPA', 'IPS', 'Bahasa', 'Umum & Vokasi', 'Manajemen & Konseling'];

  const filtered = teacherList.filter((t) => {
    const matchRumpun = selectedRumpun === 'Semua' || t.rumpunMapel === selectedRumpun;
    const matchSearch =
      t.namaLengkap.toLowerCase().includes(search.toLowerCase()) ||
      t.mataPelajaran.toLowerCase().includes(search.toLowerCase()) ||
      t.nip.includes(search);
    return matchRumpun && matchSearch;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl border border-slate-200 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-blue-700 to-indigo-800 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center text-white">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Ganti Guru Mata Pelajaran</h3>
              <p className="text-xs text-blue-100">Beralih akun guru SMAN 1 Lampasio</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter & Search */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 space-y-3 shrink-0">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari nama guru atau mata pelajaran..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full text-xs rounded-xl border border-slate-300 pl-9 pr-3 py-2 bg-white text-slate-800 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex flex-wrap gap-1">
            {rumpunOptions.map((r) => (
              <button
                key={r}
                onClick={() => setSelectedRumpun(r)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                  selectedRumpun === r
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        {/* Teacher List */}
        <div className="p-4 overflow-y-auto space-y-2.5 flex-1">
          {filtered.map((t) => {
            const isCurrent = currentTeacher?.id === t.id;
            return (
              <div
                key={t.id}
                onClick={() => {
                  onSelectTeacher(t);
                  onClose();
                }}
                className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 cursor-pointer ${
                  isCurrent
                    ? 'bg-blue-50 border-blue-300 ring-2 ring-blue-400'
                    : 'bg-white border-slate-200 hover:border-blue-300 hover:bg-slate-50 shadow-xs'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-xs ${
                      t.avatarBgColor || 'bg-blue-600'
                    }`}
                  >
                    {t.namaLengkap.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-xs">{t.namaLengkap}</span>
                      {isCurrent && (
                        <span className="text-[10px] font-bold bg-blue-600 text-white px-2 py-0.5 rounded-full">
                          Aktif Sekarang
                        </span>
                      )}
                    </div>
                    <p className="text-xs font-semibold text-blue-700">Guru {t.mataPelajaran}</p>
                    <p className="text-[11px] text-slate-500 font-mono">NIP: {t.nip}</p>
                  </div>
                </div>

                <button
                  type="button"
                  className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all flex items-center gap-1 ${
                    isCurrent
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 hover:bg-blue-600 hover:text-white text-slate-700'
                  }`}
                >
                  <span>{isCurrent ? 'Aktif' : 'Pilih'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
