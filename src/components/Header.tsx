import React, { useState } from 'react';
import {
  BookOpen,
  FileText,
  CheckSquare,
  FolderArchive,
  Settings,
  Sparkles,
  GraduationCap,
  LogOut,
  UserCheck,
  ChevronDown,
  ShieldCheck,
  Compass,
} from 'lucide-react';
import { SchoolProfile, TabType, TeacherUser } from '../types';

interface HeaderProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  profile: SchoolProfile;
  currentTeacher: TeacherUser | null;
  onOpenSettings: () => void;
  onOpenSwitchTeacher: () => void;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  profile,
  currentTeacher,
  onOpenSettings,
  onOpenSwitchTeacher,
  onLogout,
}) => {
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const tabs: { id: TabType; label: string; shortLabel: string; icon: React.FC<{ className?: string }>; badge?: string }[] = [
    { id: 'rpp', label: 'RPP / Modul Ajar', shortLabel: 'Modul Ajar', icon: BookOpen },
    { id: 'lkpd', label: 'LKPD Siswa HOTS', shortLabel: 'LKPD', icon: FileText },
    { id: 'asesmen', label: 'Penilaian & Buku Nilai', shortLabel: 'Asesmen & Nilai', icon: CheckSquare },
    { id: 'arsip', label: 'Bank Dokumen', shortLabel: 'Arsip', icon: FolderArchive },
    { id: 'admin', label: 'Data Kelas & Guru', shortLabel: 'Admin', icon: ShieldCheck, badge: 'Master' },
  ];

  return (
    <header className="bg-white/95 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-40 transition-all">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        {/* Top Navbar Row */}
        <div className="flex items-center justify-between h-16 gap-3">
          {/* Logo & School Identity */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-700 via-indigo-700 to-slate-900 flex items-center justify-center text-white shadow-xs shrink-0 ring-1 ring-black/5">
              <GraduationCap className="w-5 h-5 text-amber-300" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight truncate">
                  {profile.namaSekolah}
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-700 bg-blue-50/80 px-2 py-0.5 rounded-md border border-blue-100/80">
                  <Sparkles className="w-2.5 h-2.5 text-blue-600" /> Kurikulum Merdeka
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium truncate hidden sm:block">
                AI Generator Modul Ajar, LKPD HOTS &amp; Buku Nilai Terpadu Tolitoli
              </p>
            </div>
          </div>

          {/* Quick Actions & Teacher Profile */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Quick Switch Button */}
            <button
              onClick={onOpenSwitchTeacher}
              className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl border border-slate-200/80 transition-colors cursor-pointer"
              title="Ganti Guru Mapel Cepat"
            >
              <UserCheck className="w-3.5 h-3.5 text-blue-600" />
              <span>Ganti Guru</span>
            </button>

            {/* School Profile Settings Button */}
            <button
              id="btn-school-settings"
              onClick={onOpenSettings}
              className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl border border-slate-200/80 transition-colors cursor-pointer"
              title="Pengaturan Identitas Satuan Pendidikan"
            >
              <Settings className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden lg:inline">Profil Sekolah</span>
            </button>

            {/* Active Teacher Badge / Dropdown */}
            <div className="relative">
              <button
                id="btn-user-dropdown"
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 p-1 sm:pl-1.5 sm:pr-2.5 sm:py-1 rounded-xl border border-slate-200/90 bg-slate-50/80 hover:bg-slate-100 hover:border-slate-300 transition-all text-left cursor-pointer"
              >
                <div
                  className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center text-white font-bold text-xs shadow-xs ${
                    currentTeacher?.avatarBgColor || 'bg-blue-600'
                  }`}
                >
                  {(currentTeacher?.namaLengkap || profile.namaGuru).charAt(0)}
                </div>
                <div className="hidden md:block leading-none pr-1">
                  <div className="text-xs font-bold text-slate-800 truncate max-w-[140px]">
                    {currentTeacher?.namaLengkap || profile.namaGuru}
                  </div>
                  <div className="text-[10px] font-semibold text-blue-700 mt-0.5">
                    {currentTeacher?.mataPelajaran || profile.mataPelajaranDefault}
                  </div>
                </div>
                <ChevronDown className="w-3 h-3 text-slate-400 hidden sm:block" />
              </button>

              {/* Dropdown Menu */}
              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200/90 py-2 z-50 animate-fadeIn">
                  <div className="px-4 py-2.5 border-b border-slate-100 bg-slate-50/50">
                    <p className="text-xs font-bold text-slate-900 leading-snug">
                      {currentTeacher?.namaLengkap || profile.namaGuru}
                    </p>
                    <p className="text-[11px] text-blue-600 font-semibold mt-0.5">
                      Guru {currentTeacher?.mataPelajaran || profile.mataPelajaranDefault}
                    </p>
                    <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                      NIP: {currentTeacher?.nip || profile.nipGuru}
                    </p>
                  </div>

                  <div className="py-1">
                    <button
                      id="btn-switch-teacher"
                      onClick={() => {
                        setUserDropdownOpen(false);
                        onOpenSwitchTeacher();
                      }}
                      className="w-full text-left px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                    >
                      <UserCheck className="w-4 h-4 text-blue-600" />
                      <span>Ganti Guru Pengampu</span>
                    </button>

                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        setActiveTab('admin');
                      }}
                      className="w-full text-left px-4 py-2 text-xs font-semibold text-indigo-700 hover:bg-indigo-50 flex items-center gap-2 cursor-pointer"
                    >
                      <ShieldCheck className="w-4 h-4 text-indigo-600" />
                      <span>Data Master Kelas &amp; Guru</span>
                    </button>

                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        onOpenSettings();
                      }}
                      className="w-full text-left px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                    >
                      <Settings className="w-4 h-4 text-slate-500" />
                      <span>Profil Sekolah &amp; Guru</span>
                    </button>
                  </div>

                  <div className="border-t border-slate-100 pt-1">
                    <button
                      id="btn-logout"
                      onClick={() => {
                        setUserDropdownOpen(false);
                        onLogout();
                      }}
                      className="w-full text-left px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 flex items-center gap-2 cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Keluar Sesi (Logout)</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Clean Segmented Navigation Tab Bar */}
        <div className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto py-1.5 border-t border-slate-100 no-scrollbar">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`tab-${tab.id}`}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 sm:gap-2 px-3.5 sm:px-4 py-2 text-xs font-bold rounded-xl transition-all whitespace-nowrap cursor-pointer shrink-0 ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/25 ring-1 ring-blue-600'
                    : 'text-slate-600 hover:text-blue-700 hover:bg-blue-50/70'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden">{tab.shortLabel}</span>
                {tab.badge && (
                  <span
                    className={`text-[9px] font-black uppercase px-1.5 py-0.2 rounded-full ${
                      isActive ? 'bg-white/25 text-white' : 'bg-blue-100 text-blue-700'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};

