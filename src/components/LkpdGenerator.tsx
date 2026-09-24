import React, { useState } from 'react';
import {
  FileText,
  Sparkles,
  Download,
  Printer,
  Copy,
  Check,
  RefreshCw,
  Wand2,
  Eye,
  EyeOff,
  Link,
  Edit3,
  CheckCircle2,
  Users,
  Award,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { LKPDDocument, RppModulAjar, SchoolProfile } from '../types';
import {
  MATA_PELAJARAN_LIST,
  FASE_LIST,
  SAMPLE_LKPD_INFORMATIKA,
} from '../data/sampleTemplates';
import { exportLkpdToDocx } from '../utils/docxExport';
import { printDocument } from '../utils/pdfExport';

interface LkpdGeneratorProps {
  profile: SchoolProfile;
  currentLkpd: LKPDDocument;
  setCurrentLkpd: (lkpd: LKPDDocument) => void;
  activeRpp: RppModulAjar | null;
  onSaveToArchive: (lkpd: LKPDDocument) => void;
  onOpenAIRefine: (targetText: string, onRefined: (text: string) => void, sectionName: string) => void;
}

export const LkpdGenerator: React.FC<LkpdGeneratorProps> = ({
  profile,
  currentLkpd,
  setCurrentLkpd,
  activeRpp,
  onSaveToArchive,
  onOpenAIRefine,
}) => {
  // Form States
  const [mataPelajaran, setMataPelajaran] = useState(currentLkpd.mataPelajaran || profile.mataPelajaranDefault);
  const [faseKelas, setFaseKelas] = useState(currentLkpd.faseKelas || 'Fase E (Kelas X)');
  const [topik, setTopik] = useState(currentLkpd.title || '');
  const [tipeAktivitas, setTipeAktivitas] = useState('Diskusi Kelompok & Analisis Kasus Kontekstual');
  const [konteksLokal, setKonteksLokal] = useState('Kasus nyata potensi pertanian/perkebunan dan kemasyarakatan Lampasio Tolitoli');

  // UI States
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [showTeacherKey, setShowTeacherKey] = useState(true);

  // Sync from current RPP
  const syncWithRpp = () => {
    if (activeRpp) {
      setMataPelajaran(activeRpp.mataPelajaran);
      setFaseKelas(activeRpp.fase);
      setTopik(activeRpp.topik);
    }
  };

  const handleGenerateLkpd = async () => {
    if (!topik.trim()) {
      setError('Silakan masukkan topik / materi pokok LKPD.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/generate-lkpd', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mataPelajaran,
          faseKelas,
          topik,
          tujuanPembelajaran: activeRpp ? activeRpp.tujuanPembelajaran : undefined,
          modelPembelajaran: activeRpp?.modelPembelajaran || tipeAktivitas,
          tipeAktivitas,
          konteksLokal,
          rppRef: activeRpp?.id,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Gagal membuat LKPD');
      }

      const data: LKPDDocument = await res.json();
      const enriched: LKPDDocument = {
        ...data,
        namaGuru: profile.namaGuru,
        nipGuru: profile.nipGuru,
      };

      setCurrentLkpd(enriched);
      onSaveToArchive(enriched);

      try {
        confetti({
          particleCount: 40,
          spread: 50,
          origin: { y: 0.6 },
        });
      } catch (e) {}
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Terjadi kesalahan saat memproses pembuatan LKPD dengan AI.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportDocx = async () => {
    try {
      await exportLkpdToDocx(currentLkpd, profile);
    } catch (e) {
      console.error('Export docx error', e);
      alert('Gagal mengekspor dokumen LKPD ke Word. Silakan coba kembali.');
    }
  };

  const handlePrintPdf = () => {
    printDocument('printable-lkpd-document');
  };

  const handleCopyText = () => {
    const textContent = `
LEMBAR KERJA PESERTA DIDIK (LKPD)
${profile.namaSekolah.toUpperCase()}
Mata Pelajaran: ${currentLkpd.mataPelajaran}
Kelas/Fase: ${currentLkpd.faseKelas}
Judul LKPD: ${currentLkpd.title}

A. PETUNJUK BELAJAR
${currentLkpd.petunjukBelajar.map((p, i) => `${i + 1}. ${p}`).join('\n')}

B. STIMULUS MATERI / STUDI KASUS
${currentLkpd.stimulusMateri}

C. PERTANYAAN DISKUSI & ANALISIS
${currentLkpd.pertanyaanDiskusi.map((q) => `No ${q.no} [Skor: ${q.skorMaks}]: ${q.pertanyaan}\nJawaban: ${q.ruangJawaban}\n`).join('\n')}

D. KESIMPULAN
${currentLkpd.kesimpulanPanduan}
    `.trim();

    navigator.clipboard.writeText(textContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-5">
      {/* Top Generator Card */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="bg-gradient-to-r from-blue-700 via-teal-700 to-indigo-800 px-5 sm:px-6 py-4 text-white">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="bg-white/20 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full backdrop-blur-xs border border-white/20 uppercase tracking-wider">
                  LKPD Otomatis HOTS
                </span>
                <span className="text-teal-100 text-xs font-medium">Kurikulum Merdeka 2025/2026</span>
              </div>
              <h2 className="text-lg sm:text-xl font-black mt-1 text-white tracking-tight">
                Generator Lembar Kerja Peserta Didik (LKPD) AI
              </h2>
              <p className="text-xs text-teal-100 mt-0.5">
                Dilengkapi Rubrik Penskoran, Studi Kasus Kontekstual Tolitoli, &amp; Kunci Jawaban Pengampu
              </p>
            </div>
            {activeRpp && (
              <button
                id="btn-sync-rpp"
                onClick={syncWithRpp}
                className="self-start sm:self-auto text-xs font-semibold bg-white/15 hover:bg-white/25 text-white px-3 py-1.5 rounded-xl border border-white/20 transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Link className="w-3.5 h-3.5 text-white" />
                <span>Sinkron dari RPP: {activeRpp.topik.substring(0, 24)}...</span>
              </button>
            )}
          </div>
        </div>

        {/* Input Form */}
        <div className="p-5 sm:p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            {/* Mata Pelajaran */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Mata Pelajaran <span className="text-rose-500">*</span>
              </label>
              <select
                id="select-lkpd-mapel"
                value={mataPelajaran}
                onChange={(e) => setMataPelajaran(e.target.value)}
                className="w-full text-xs font-medium rounded-xl border border-slate-200 bg-slate-50/60 px-3 py-2 text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-600/30 focus:border-emerald-600 transition-all"
              >
                {MATA_PELAJARAN_LIST.map((mp) => (
                  <option key={mp} value={mp}>
                    {mp}
                  </option>
                ))}
              </select>
            </div>

            {/* Fase / Kelas */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Fase &amp; Jenjang Kelas <span className="text-rose-500">*</span>
              </label>
              <select
                id="select-lkpd-fase"
                value={faseKelas}
                onChange={(e) => setFaseKelas(e.target.value)}
                className="w-full text-xs font-medium rounded-xl border border-slate-200 bg-slate-50/60 px-3 py-2 text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-600/30 focus:border-emerald-600 transition-all"
              >
                {FASE_LIST.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Tipe Aktivitas */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Model Aktivitas Siswa
              </label>
              <select
                id="select-lkpd-aktivitas"
                value={tipeAktivitas}
                onChange={(e) => setTipeAktivitas(e.target.value)}
                className="w-full text-xs font-medium rounded-xl border border-slate-200 bg-slate-50/60 px-3 py-2 text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-600/30 focus:border-emerald-600 transition-all"
              >
                <option value="Diskusi Kelompok & Analisis Kasus Kontekstual">
                  Diskusi Kelompok &amp; Analisis Kasus (PBL)
                </option>
                <option value="Eksperimen / Praktikum Penyelidikan Sederhana">
                  Eksperimen / Praktikum Penyelidikan
                </option>
                <option value="Tugas Proyek Mini & Perancangan Solusi">
                  Tugas Proyek Mini (PjBL)
                </option>
                <option value="Eksplorasi Mandiri & Pengamatan Lapangan">
                  Eksplorasi &amp; Pengamatan Lapangan
                </option>
              </select>
            </div>
          </div>

          {/* Topik LKPD */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Topik / Judul Aktivitas LKPD <span className="text-rose-500">*</span>
            </label>
            <input
              id="input-lkpd-topik"
              type="text"
              value={topik}
              onChange={(e) => setTopik(e.target.value)}
              placeholder="Contoh: Pemecahan Masalah Algoritma Petani Lampasio / Analisis Ekosistem"
              className="w-full text-xs sm:text-sm font-semibold rounded-xl border border-slate-300/90 bg-white px-3.5 py-2.5 text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-600/30 focus:border-emerald-600 transition-all shadow-xs"
            />
          </div>

          {/* Konteks Lokal Tolitoli */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Konteks Nyata / Muatan Lokal (Lampasio - Tolitoli)
            </label>
            <input
              id="input-lkpd-konteks"
              type="text"
              value={konteksLokal}
              onChange={(e) => setKonteksLokal(e.target.value)}
              placeholder="misal: perkebunan cengkeh/kakao/kelapa Lampasio, pesisir maritim Tolitoli"
              className="w-full text-xs font-medium rounded-xl border border-slate-200 bg-slate-50/60 px-3 py-2 text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-600/30 focus:border-emerald-600 transition-all"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              AI otomatis merancang stimulus kasus kontekstual lingkungan siswa di Tolitoli dan sekitarnya.
            </p>
          </div>

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-semibold">
              {error}
            </div>
          )}

          {/* Submit Button */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-100">
            <button
              id="btn-load-sample-lkpd"
              type="button"
              onClick={() => setCurrentLkpd(SAMPLE_LKPD_INFORMATIKA)}
              className="text-xs text-slate-600 hover:text-emerald-700 font-semibold cursor-pointer underline"
            >
              Muat Contoh LKPD Siap Pakai (Informatika)
            </button>

            <button
              id="btn-generate-lkpd"
              onClick={handleGenerateLkpd}
              disabled={isLoading}
              className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 text-white text-xs sm:text-sm font-bold rounded-xl shadow-md shadow-teal-600/20 hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-white" />
                  <span>Menyusun LKPD Interaktif dengan AI...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-emerald-300" />
                  <span>Hasilkan LKPD Kurikulum Merdeka</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Action Toolbar */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-3 sm:p-4 shadow-xs flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200/80">
            <FileText className="w-3.5 h-3.5 text-emerald-600" />
            LKPD: {currentLkpd.mataPelajaran} ({currentLkpd.faseKelas})
          </span>
          <button
            onClick={() => setShowTeacherKey(!showTeacherKey)}
            className={`flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-lg border transition-colors cursor-pointer ${
              showTeacherKey
                ? 'bg-amber-50 text-amber-900 border-amber-300'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            {showTeacherKey ? <Eye className="w-3.5 h-3.5 text-amber-600" /> : <EyeOff className="w-3.5 h-3.5 text-slate-500" />}
            <span>{showTeacherKey ? 'Kunci Jawaban: Tampil' : 'Kunci Jawaban: Sembunyi'}</span>
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          <button
            id="btn-export-lkpd-docx"
            onClick={handleExportDocx}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs transition-colors cursor-pointer"
            title="Download Dokumen Microsoft Word (.docx) Resmi"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Word (.docx)</span>
          </button>

          <button
            id="btn-print-lkpd-pdf"
            onClick={handlePrintPdf}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-xs transition-colors cursor-pointer"
            title="Cetak atau Simpan LKPD ke PDF"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Cetak / PDF</span>
          </button>

          <button
            id="btn-copy-lkpd"
            onClick={handleCopyText}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl border border-slate-200 transition-colors cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
            <span>{copied ? 'Tersalin' : 'Salin'}</span>
          </button>
        </div>
      </div>

      {/* Official LKPD Document Preview Frame */}
      <div className="bg-slate-200/70 p-3 sm:p-8 rounded-2xl border border-slate-300/80">
        <div
          id="printable-lkpd-document"
          className="max-w-[850px] mx-auto bg-white shadow-xl rounded-sm p-6 sm:p-14 text-slate-900 border border-slate-200 transition-all font-serif text-[13.5px] leading-relaxed"
        >
          {/* Kop Surat SMAN 1 Lampasio */}
          <div className="kop-surat text-center border-b-4 border-double border-slate-900 pb-3 mb-6">
            <h4 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-800 m-0">
              Pemerintah Provinsi Sulawesi Tengah
            </h4>
            <h3 className="text-sm sm:text-base font-bold uppercase text-slate-900 m-0">
              Dinas Pendidikan dan Kebudayaan
            </h3>
            <h2 className="text-base sm:text-xl font-extrabold uppercase text-slate-900 tracking-wide mt-0.5 mb-0.5">
              {profile.namaSekolah}
            </h2>
            <p className="text-[11px] sm:text-xs italic text-slate-700 m-0">
              {profile.alamat} | NPSN: {profile.npsn} | Kab. Tolitoli, Sulawesi Tengah
            </p>
          </div>

          {/* LKPD Title */}
          <div className="doc-title text-center mb-6">
            <h2 className="text-base sm:text-lg font-bold underline uppercase text-slate-900">
              LEMBAR KERJA PESERTA DIDIK (LKPD)
            </h2>
            <p className="text-xs sm:text-sm font-bold text-slate-800 mt-1 uppercase">
              {currentLkpd.title}
            </p>
          </div>

          {/* Student Identitas Table */}
          <div className="mb-6">
            <table className="w-full text-xs sm:text-sm border border-slate-400 border-collapse">
              <tbody>
                <tr>
                  <td className="p-2 border border-slate-400 font-semibold w-1/4 bg-slate-50">Mata Pelajaran</td>
                  <td className="p-2 border border-slate-400 w-1/4">{currentLkpd.mataPelajaran}</td>
                  <td className="p-2 border border-slate-400 font-semibold w-1/4 bg-slate-50">Nama Kelompok</td>
                  <td className="p-2 border border-slate-400 w-1/4">......................................</td>
                </tr>
                <tr>
                  <td className="p-2 border border-slate-400 font-semibold bg-slate-50">Fase / Kelas</td>
                  <td className="p-2 border border-slate-400">{currentLkpd.faseKelas}</td>
                  <td className="p-2 border border-slate-400 font-semibold bg-slate-50" rowSpan={3}>
                    Anggota Kelompok
                  </td>
                  <td className="p-2 border border-slate-400 text-xs" rowSpan={3}>
                    1. ........................................<br />
                    2. ........................................<br />
                    3. ........................................<br />
                    4. ........................................<br />
                    5. ........................................
                  </td>
                </tr>
                <tr>
                  <td className="p-2 border border-slate-400 font-semibold bg-slate-50">Alokasi Waktu</td>
                  <td className="p-2 border border-slate-400">{currentLkpd.alokasiWaktu || '45 Menit'}</td>
                </tr>
                <tr>
                  <td className="p-2 border border-slate-400 font-semibold bg-slate-50">Guru Pengampu</td>
                  <td className="p-2 border border-slate-400">{currentLkpd.namaGuru || profile.namaGuru}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* A. Petunjuk Belajar */}
          <div className="mb-6">
            <h3 className="text-sm sm:text-base font-bold text-slate-900 border-b border-slate-200 pb-1 mb-2 font-sans">
              A. PETUNJUK BELAJAR
            </h3>
            <ul className="list-decimal pl-5 space-y-1 text-slate-800 text-xs sm:text-sm">
              {currentLkpd.petunjukBelajar.map((p, i) => (
                <li key={i}>{p}</li>
              ))}
            </ul>
          </div>

          {/* B. Tujuan Aktivitas */}
          <div className="mb-6">
            <h3 className="text-sm sm:text-base font-bold text-slate-900 border-b border-slate-200 pb-1 mb-2 font-sans">
              B. TUJUAN AKTIVITAS PEMBELAJARAN
            </h3>
            <ul className="list-disc pl-5 space-y-1 text-slate-800 text-xs sm:text-sm">
              {currentLkpd.tujuanAktivitas.map((t, i) => (
                <li key={i}>{t}</li>
              ))}
            </ul>
          </div>

          {/* C. Stimulus Kasus Kontekstual */}
          <div className="mb-6 bg-amber-50/60 p-4 rounded-xl border border-amber-200">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm sm:text-base font-bold text-amber-950 font-sans">
                C. STIMULUS / STUDI KASUS KONTEKSTUAL TOLITOLI
              </h3>
              <button
                onClick={() =>
                  onOpenAIRefine(
                    currentLkpd.stimulusMateri,
                    (newTxt) => setCurrentLkpd({ ...currentLkpd, stimulusMateri: newTxt }),
                    'Stimulus Kasus LKPD'
                  )
                }
                className="text-[11px] text-amber-800 hover:text-amber-950 flex items-center gap-1 font-sans font-semibold"
              >
                <Sparkles className="w-3 h-3" /> Sesuaikan Cerita AI
              </button>
            </div>
            <p className="text-justify text-slate-900 leading-relaxed text-xs sm:text-sm">
              {currentLkpd.stimulusMateri}
            </p>
          </div>

          {/* D. Langkah Kerja */}
          <div className="mb-6">
            <h3 className="text-sm sm:text-base font-bold text-slate-900 border-b border-slate-200 pb-1 mb-2 font-sans">
              D. LANGKAH KERJA & PENYELIDIKAN
            </h3>
            <ol className="list-decimal pl-5 space-y-1 text-slate-800 text-xs sm:text-sm">
              {currentLkpd.langkahKerja.map((l, i) => (
                <li key={i}>{l}</li>
              ))}
            </ol>
          </div>

          {/* E. Pertanyaan Diskusi & Lembar Jawaban */}
          <div className="mb-6">
            <div className="flex items-center justify-between border-b border-slate-200 pb-1 mb-3">
              <h3 className="text-sm sm:text-base font-bold text-slate-900 font-sans">
                E. PERTANYAAN ANALISIS & LEMBAR JAWABAN
              </h3>
            </div>

            <div className="space-y-5">
              {currentLkpd.pertanyaanDiskusi.map((q) => (
                <div key={q.no} className="border border-slate-300 rounded-lg p-3 bg-slate-50/50">
                  <div className="flex justify-between items-start gap-2 mb-2">
                    <p className="font-bold text-slate-900 text-xs sm:text-sm">
                      Soal No. {q.no}: {q.pertanyaan}
                    </p>
                    <span className="shrink-0 text-[11px] font-semibold bg-blue-100 text-blue-900 px-2 py-0.5 rounded font-sans">
                      Maks: {q.skorMaks} Poin
                    </span>
                  </div>

                  <div className="mt-2">
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1 font-sans">
                      Lembar Jawaban Siswa / Kelompok:
                    </label>
                    <div className="bg-white border border-dashed border-slate-300 p-2.5 rounded text-xs sm:text-sm text-slate-800 min-h-[60px] whitespace-pre-wrap">
                      {q.ruangJawaban}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* F. Kesimpulan */}
          <div className="mb-6">
            <h3 className="text-sm sm:text-base font-bold text-slate-900 border-b border-slate-200 pb-1 mb-2 font-sans">
              F. KESIMPULAN HASIL BELAJAR
            </h3>
            <div className="border border-dashed border-slate-300 p-3 rounded-lg bg-slate-50 text-xs sm:text-sm text-slate-800">
              {currentLkpd.kesimpulanPanduan}
            </div>
          </div>

          {/* G. Rubrik Penilaian LKPD */}
          <div className="mb-6">
            <h3 className="text-sm sm:text-base font-bold text-slate-900 border-b border-slate-200 pb-1 mb-2 font-sans">
              G. RUBRIK PENILAIAN KINERJA LKPD
            </h3>
            <table className="w-full text-xs border border-slate-300 border-collapse">
              <thead>
                <tr className="bg-slate-100">
                  <th className="border border-slate-300 p-2 text-left w-1/3">Aspek Penilaian</th>
                  <th className="border border-slate-300 p-2 text-left">Kriteria Ketercapaian</th>
                  <th className="border border-slate-300 p-2 text-center w-24">Skor Maks</th>
                </tr>
              </thead>
              <tbody>
                {currentLkpd.rubrikPenilaianLKPD.map((r, i) => (
                  <tr key={i} className="border-b border-slate-200">
                    <td className="border border-slate-300 p-2 font-semibold text-slate-800">{r.aspek}</td>
                    <td className="border border-slate-300 p-2 text-slate-700">{r.kriteria}</td>
                    <td className="border border-slate-300 p-2 text-center font-bold text-blue-900">{r.skorMaks}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Teacher Answer Key Box */}
          {showTeacherKey && currentLkpd.kunciJawabanDanPedomanPenskoran && (
            <div className="mt-8 p-4 bg-emerald-50 rounded-xl border border-emerald-300 text-xs text-emerald-950">
              <div className="flex items-center gap-1.5 font-bold mb-1 font-sans text-sm text-emerald-900">
                <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                <span>Pedoman Guru & Kunci Penskoran:</span>
              </div>
              <p className="whitespace-pre-wrap">{currentLkpd.kunciJawabanDanPedomanPenskoran}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
