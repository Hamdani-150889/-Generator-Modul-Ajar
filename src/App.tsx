import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  FileText,
  CheckSquare,
  FolderArchive,
  Sparkles,
  School,
  FileDown,
  Layers,
  GraduationCap,
  Award,
  Calendar,
  Settings,
  HelpCircle,
  ChevronRight,
  Info,
  UserCheck,
  LogOut,
} from 'lucide-react';
import {
  TabType,
  RppModulAjar,
  LKPDDocument,
  AsesmenDaringPackage,
  SchoolProfile,
  TeacherUser,
  DataKelas,
} from './types';
import {
  DEFAULT_SMAN1_LAMPASIO_PROFILE,
  SAMPLE_RPP_INFORMATIKA,
  SAMPLE_LKPD_INFORMATIKA,
  SAMPLE_ASESMEN_DARING,
  TEACHER_ACCOUNTS_SMAN1_LAMPASIO,
  MASTER_KELAS_SMAN1_LAMPASIO,
} from './data/sampleTemplates';
import { Header } from './components/Header';
import { LoginPage } from './components/LoginPage';
import { SwitchTeacherModal } from './components/SwitchTeacherModal';
import { RppGenerator } from './components/RppGenerator';
import { LkpdGenerator } from './components/LkpdGenerator';
import { OnlineAssessment } from './components/OnlineAssessment';
import { DocumentArchive } from './components/DocumentArchive';
import { AdminPanel } from './components/AdminPanel';
import { SchoolSettingsModal } from './components/SchoolSettingsModal';
import { AIRefineModal } from './components/AIRefineModal';

export function App() {
  // Authentication & Teacher Management State
  const [teacherList, setTeacherList] = useState<TeacherUser[]>(() => {
    const saved = localStorage.getItem('sman1_lampasio_teachers');
    return saved ? JSON.parse(saved) : TEACHER_ACCOUNTS_SMAN1_LAMPASIO;
  });

  // Master Class / Rombel State
  const [classList, setClassList] = useState<DataKelas[]>(() => {
    const saved = localStorage.getItem('sman1_lampasio_classes');
    return saved ? JSON.parse(saved) : MASTER_KELAS_SMAN1_LAMPASIO;
  });

  const [currentTeacher, setCurrentTeacher] = useState<TeacherUser | null>(() => {
    const saved = localStorage.getItem('sman1_lampasio_logged_in_teacher');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    // Default to the first teacher (Pak Rahmat Hidayat - Informatika) for easy instant access
    return TEACHER_ACCOUNTS_SMAN1_LAMPASIO[0];
  });

  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    const saved = localStorage.getItem('sman1_lampasio_logged_in_teacher');
    return !!saved || true; // true by default with sample user or login screen toggle
  });

  const [isSwitchTeacherModalOpen, setIsSwitchTeacherModalOpen] = useState(false);

  // Navigation State
  const [activeTab, setActiveTab] = useState<TabType>('rpp');

  // School & Teacher Profile State
  const [profile, setProfile] = useState<SchoolProfile>(() => {
    const saved = localStorage.getItem('sman1_lampasio_profile');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return DEFAULT_SMAN1_LAMPASIO_PROFILE;
  });

  // Active Documents State
  const [currentRpp, setCurrentRpp] = useState<RppModulAjar>(() => {
    const saved = localStorage.getItem('sman1_active_rpp');
    return saved ? JSON.parse(saved) : SAMPLE_RPP_INFORMATIKA;
  });

  const [currentLkpd, setCurrentLkpd] = useState<LKPDDocument>(() => {
    const saved = localStorage.getItem('sman1_active_lkpd');
    return saved ? JSON.parse(saved) : SAMPLE_LKPD_INFORMATIKA;
  });

  const [currentAsesmen, setCurrentAsesmen] = useState<AsesmenDaringPackage>(() => {
    const saved = localStorage.getItem('sman1_active_asesmen');
    return saved ? JSON.parse(saved) : SAMPLE_ASESMEN_DARING;
  });

  // Archive Lists State
  const [rppList, setRppList] = useState<RppModulAjar[]>(() => {
    const saved = localStorage.getItem('sman1_archive_rpp');
    return saved ? JSON.parse(saved) : [SAMPLE_RPP_INFORMATIKA];
  });

  const [lkpdList, setLkpdList] = useState<LKPDDocument[]>(() => {
    const saved = localStorage.getItem('sman1_archive_lkpd');
    return saved ? JSON.parse(saved) : [SAMPLE_LKPD_INFORMATIKA];
  });

  const [asesmenList, setAsesmenList] = useState<AsesmenDaringPackage[]>(() => {
    const saved = localStorage.getItem('sman1_archive_asesmen');
    return saved ? JSON.parse(saved) : [SAMPLE_ASESMEN_DARING];
  });

  // Modals State
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [refineModalData, setRefineModalData] = useState<{
    isOpen: boolean;
    targetText: string;
    sectionName: string;
    onRefined: (text: string) => void;
  }>({
    isOpen: false,
    targetText: '',
    sectionName: '',
    onRefined: () => {},
  });

  // Sync Teacher changes into Profile & LocalStorage
  const handleSelectTeacher = (teacher: TeacherUser) => {
    setCurrentTeacher(teacher);
    setIsLoggedIn(true);
    localStorage.setItem('sman1_lampasio_logged_in_teacher', JSON.stringify(teacher));

    setProfile((prev) => ({
      ...prev,
      namaGuru: teacher.namaLengkap,
      nipGuru: teacher.nip,
      mataPelajaranDefault: teacher.mataPelajaran,
    }));
  };

  const handleRegisterNewTeacher = (newTeacher: TeacherUser) => {
    const updatedList = [...teacherList, newTeacher];
    setTeacherList(updatedList);
    localStorage.setItem('sman1_lampasio_teachers', JSON.stringify(updatedList));
    handleSelectTeacher(newTeacher);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentTeacher(null);
    localStorage.removeItem('sman1_lampasio_logged_in_teacher');
  };

  // Local Storage Synchronizers
  useEffect(() => {
    localStorage.setItem('sman1_lampasio_profile', JSON.stringify(profile));
  }, [profile]);

  useEffect(() => {
    localStorage.setItem('sman1_lampasio_teachers', JSON.stringify(teacherList));
  }, [teacherList]);

  useEffect(() => {
    localStorage.setItem('sman1_lampasio_classes', JSON.stringify(classList));
  }, [classList]);

  useEffect(() => {
    localStorage.setItem('sman1_active_rpp', JSON.stringify(currentRpp));
  }, [currentRpp]);

  useEffect(() => {
    localStorage.setItem('sman1_active_lkpd', JSON.stringify(currentLkpd));
  }, [currentLkpd]);

  useEffect(() => {
    localStorage.setItem('sman1_active_asesmen', JSON.stringify(currentAsesmen));
  }, [currentAsesmen]);

  useEffect(() => {
    localStorage.setItem('sman1_archive_rpp', JSON.stringify(rppList));
  }, [rppList]);

  useEffect(() => {
    localStorage.setItem('sman1_archive_lkpd', JSON.stringify(lkpdList));
  }, [lkpdList]);

  useEffect(() => {
    localStorage.setItem('sman1_archive_asesmen', JSON.stringify(asesmenList));
  }, [asesmenList]);

  // Document Handlers
  const handleSaveRppToArchive = (newRpp: RppModulAjar) => {
    setRppList((prev) => {
      const exists = prev.some((r) => r.id === newRpp.id);
      if (exists) {
        return prev.map((r) => (r.id === newRpp.id ? newRpp : r));
      }
      return [newRpp, ...prev];
    });
  };

  const handleSaveLkpdToArchive = (newLkpd: LKPDDocument) => {
    setLkpdList((prev) => {
      const exists = prev.some((l) => l.id === newLkpd.id);
      if (exists) {
        return prev.map((l) => (l.id === newLkpd.id ? newLkpd : l));
      }
      return [newLkpd, ...prev];
    });
  };

  const handleSaveAsesmenToArchive = (newAsesmen: AsesmenDaringPackage) => {
    setAsesmenList((prev) => {
      const exists = prev.some((a) => a.id === newAsesmen.id);
      if (exists) {
        return prev.map((a) => (a.id === newAsesmen.id ? newAsesmen : a));
      }
      return [newAsesmen, ...prev];
    });
  };

  // Cross-module linking
  const handleGenerateLinkedLkpd = (rpp: RppModulAjar) => {
    setCurrentLkpd({
      ...currentLkpd,
      rppRefId: rpp.id,
      mataPelajaran: rpp.mataPelajaran,
      faseKelas: rpp.fase,
      title: `LKPD: ${rpp.topik}`,
      tujuanAktivitas: rpp.tujuanPembelajaran,
      namaGuru: profile.namaGuru,
      nipGuru: profile.nipGuru,
    });
    setActiveTab('lkpd');
  };

  const handleGenerateLinkedAssessment = (rpp: RppModulAjar) => {
    setCurrentAsesmen({
      ...currentAsesmen,
      rppRefId: rpp.id,
      mataPelajaran: rpp.mataPelajaran,
      faseKelas: rpp.fase,
      title: `Asesmen Daring: ${rpp.topik}`,
    });
    setActiveTab('asesmen');
  };

  const handleOpenAIRefine = (
    targetText: string,
    onRefined: (text: string) => void,
    sectionName: string
  ) => {
    setRefineModalData({
      isOpen: true,
      targetText,
      sectionName,
      onRefined,
    });
  };

  // If user is not logged in, render Login Page
  if (!isLoggedIn || !currentTeacher) {
    return (
      <LoginPage
        onLoginSuccess={handleSelectTeacher}
        onRegisterTeacher={handleRegisterNewTeacher}
        existingTeachers={teacherList}
        schoolName={profile.namaSekolah}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-900 antialiased selection:bg-blue-600 selection:text-white">
      {/* Official Header with Active Teacher & Switch User */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        profile={profile}
        currentTeacher={currentTeacher}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenSwitchTeacher={() => setIsSwitchTeacherModalOpen(true)}
        onLogout={handleLogout}
      />

      {/* Sleek Sub-Header Status Bar */}
      <div className="bg-white/80 border-b border-slate-200/70 backdrop-blur-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2 text-slate-600 flex-wrap">
              <span className="inline-flex items-center gap-1.5 font-bold text-slate-800 bg-slate-100/90 px-2.5 py-0.5 rounded-lg border border-slate-200">
                <School className="w-3.5 h-3.5 text-blue-600" />
                {profile.namaSekolah}
              </span>
              <span className="hidden sm:inline text-slate-300">•</span>
              <span className="text-slate-600 text-[11px]">
                Pengampu: <strong className="text-slate-800">{currentTeacher?.namaLengkap || profile.namaGuru}</strong> (
                <span className="text-blue-700 font-semibold">{currentTeacher?.mataPelajaran || profile.mataPelajaranDefault}</span>)
              </span>
              <span className="hidden sm:inline text-slate-300">•</span>
              <span className="text-slate-500 text-[11px]">
                Tahun Ajaran <strong className="text-slate-700">{profile.tahunPelajaran}</strong> ({profile.semester})
              </span>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              <div className="inline-flex items-center gap-1.5 text-emerald-700 bg-emerald-50/80 px-2.5 py-0.5 rounded-md border border-emerald-200/70 text-[11px] font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>AI Gemini 2.5 Active</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main App Content View Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-5">
        {/* TAB 1: RPP & MODUL AJAR */}
        {activeTab === 'rpp' && (
          <RppGenerator
            profile={profile}
            currentRpp={currentRpp}
            setCurrentRpp={setCurrentRpp}
            onSaveToArchive={handleSaveRppToArchive}
            onGenerateLinkedLkpd={handleGenerateLinkedLkpd}
            onGenerateLinkedAssessment={handleGenerateLinkedAssessment}
            onOpenAIRefine={handleOpenAIRefine}
          />
        )}

        {/* TAB 2: LKPD */}
        {activeTab === 'lkpd' && (
          <LkpdGenerator
            profile={profile}
            currentLkpd={currentLkpd}
            setCurrentLkpd={setCurrentLkpd}
            activeRpp={currentRpp}
            onSaveToArchive={handleSaveLkpdToArchive}
            onOpenAIRefine={handleOpenAIRefine}
          />
        )}

        {/* TAB 3: ASESMEN & SISTEM PENILAIAN DARING */}
        {activeTab === 'asesmen' && (
          <OnlineAssessment
            profile={profile}
            currentAsesmen={currentAsesmen}
            setCurrentAsesmen={setCurrentAsesmen}
            activeRpp={currentRpp}
            onSaveToArchive={handleSaveAsesmenToArchive}
            classList={classList}
          />
        )}

        {/* TAB 4: ARSIP DOKUMEN */}
        {activeTab === 'arsip' && (
          <DocumentArchive
            profile={profile}
            rppList={rppList}
            lkpdList={lkpdList}
            asesmenList={asesmenList}
            onSelectRpp={(rpp) => {
              setCurrentRpp(rpp);
              setActiveTab('rpp');
            }}
            onSelectLkpd={(lkpd) => {
              setCurrentLkpd(lkpd);
              setActiveTab('lkpd');
            }}
            onSelectAsesmen={(asesmen) => {
              setCurrentAsesmen(asesmen);
              setActiveTab('asesmen');
            }}
            onDeleteRpp={(id) => setRppList(rppList.filter((r) => r.id !== id))}
            onDeleteLkpd={(id) => setLkpdList(lkpdList.filter((l) => l.id !== id))}
            onDeleteAsesmen={(id) => setAsesmenList(asesmenList.filter((a) => a.id !== id))}
          />
        )}

        {/* TAB 5: ADMIN PANEL (DATA KELAS & GURU) */}
        {activeTab === 'admin' && (
          <AdminPanel
            classList={classList}
            teacherList={teacherList}
            schoolProfile={profile}
            currentTeacher={currentTeacher}
            onSaveClassList={(updated) => setClassList(updated)}
            onSaveTeacherList={(updated) => setTeacherList(updated)}
            onSwitchTeacher={handleSelectTeacher}
            onNavigateTab={(tab) => setActiveTab(tab)}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-12 py-6 text-slate-500 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-blue-700" />
            <span className="font-bold text-slate-700">
              Sistem Administrasi Guru AI — {profile.namaSekolah}
            </span>
          </div>
          <p className="text-center sm:text-right text-slate-400">
            Terintegrasi Kurikulum Merdeka &amp; BSKAP No. 032/H/KR/2024 • Ekspor Instan Word (.docx) &amp; PDF • Kab. Tolitoli, Sulteng
          </p>
        </div>
      </footer>

      {/* School Settings Profile Modal */}
      <SchoolSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        profile={profile}
        onSave={(updated) => setProfile(updated)}
      />

      {/* Switch Teacher Modal */}
      <SwitchTeacherModal
        isOpen={isSwitchTeacherModalOpen}
        onClose={() => setIsSwitchTeacherModalOpen(false)}
        teacherList={teacherList}
        currentTeacher={currentTeacher}
        onSelectTeacher={handleSelectTeacher}
      />

      {/* AI Refine Modal */}
      <AIRefineModal
        isOpen={refineModalData.isOpen}
        onClose={() => setRefineModalData({ ...refineModalData, isOpen: false })}
        targetText={refineModalData.targetText}
        sectionName={refineModalData.sectionName}
        onApply={(refined) => {
          refineModalData.onRefined(refined);
        }}
      />
    </div>
  );
}

export default App;
