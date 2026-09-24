import React, { useState } from 'react';
import {
  Sparkles,
  Download,
  Printer,
  Copy,
  Check,
  Edit3,
  Save,
  ArrowRight,
  BookOpen,
  HelpCircle,
  Wand2,
  RefreshCw,
  Plus,
  Trash2,
  Layers,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { RppModulAjar, SchoolProfile } from '../types';
import {
  MATA_PELAJARAN_LIST,
  FASE_LIST,
  MODEL_PEMBELAJARAN_LIST,
  PROFIL_PELAJAR_PANCASILA_LIST,
  SAMPLE_RPP_INFORMATIKA,
} from '../data/sampleTemplates';
import { exportRppToDocx } from '../utils/docxExport';
import { printDocument } from '../utils/pdfExport';

interface RppGeneratorProps {
  profile: SchoolProfile;
  currentRpp: RppModulAjar;
  setCurrentRpp: (rpp: RppModulAjar) => void;
  onSaveToArchive: (rpp: RppModulAjar) => void;
  onGenerateLinkedLkpd: (rpp: RppModulAjar) => void;
  onGenerateLinkedAssessment: (rpp: RppModulAjar) => void;
  onOpenAIRefine: (targetText: string, onRefined: (text: string) => void, sectionName: string) => void;
}

export const RppGenerator: React.FC<RppGeneratorProps> = ({
  profile,
  currentRpp,
  setCurrentRpp,
  onSaveToArchive,
  onGenerateLinkedLkpd,
  onGenerateLinkedAssessment,
  onOpenAIRefine,
}) => {
  // Form States
  const [mataPelajaran, setMataPelajaran] = useState(currentRpp.mataPelajaran || profile.mataPelajaranDefault);
  const [faseKelas, setFaseKelas] = useState(currentRpp.fase || 'Fase E (Kelas X)');
  const [topik, setTopik] = useState(currentRpp.topik || '');
  const [alokasiWaktu, setAlokasiWaktu] = useState(currentRpp.alokasiWaktu || '2 x 45 Menit (1 Pertemuan)');
  const [modelPembelajaran, setModelPembelajaran] = useState(currentRpp.modelPembelajaran || 'Problem Based Learning (PBL)');
  const [selectedPancasila, setSelectedPancasila] = useState<string[]>(
    currentRpp.profilPelajarPancasila || ['Bernalar Kritis', 'Kreatif', 'Bergotong Royong']
  );
  const [diferensiasiFokus, setDiferensiasiFokus] = useState('Diferensiasi Proses dan Produk');
  const [konteksLokal, setKonteksLokal] = useState('Potensi perkebunan cengkeh/kakao dan lingkungan pesisir Tolitoli');
  const [catatanGuru, setCatatanGuru] = useState('');

  // UI States
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [showAdvancedParams, setShowAdvancedParams] = useState(false);

  const togglePancasila = (dimensi: string) => {
    if (selectedPancasila.includes(dimensi)) {
      setSelectedPancasila(selectedPancasila.filter((d) => d !== dimensi));
    } else {
      setSelectedPancasila([...selectedPancasila, dimensi]);
    }
  };

  const handleGenerateRpp = async () => {
    if (!topik.trim()) {
      setError('Silakan masukkan topik / materi pokok pembelajaran.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/generate-rpp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mataPelajaran,
          faseKelas,
          topik,
          alokasiWaktu,
          modelPembelajaran,
          profilPancasila: selectedPancasila,
          diferensiasi: diferensiasiFokus,
          catatanTambahan: `${catatanGuru} ${konteksLokal ? '| Konteks lokal SMAN 1 Lampasio: ' + konteksLokal : ''}`,
          namaGuru: profile.namaGuru,
          nipGuru: profile.nipGuru,
          namaKepsek: profile.namaKepalaSekolah,
          nipKepsek: profile.nipKepalaSekolah,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Gagal membuat RPP');
      }

      const data: RppModulAjar = await res.json();
      setCurrentRpp(data);
      onSaveToArchive(data);

      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.6 },
        });
      } catch (e) {
        // fallback
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Terjadi kesalahan saat memproses pembuatan RPP dengan AI.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportDocx = async () => {
    try {
      await exportRppToDocx(currentRpp, profile);
    } catch (e) {
      console.error('Export docx error', e);
      alert('Gagal mengekspor dokumen Word. Silakan coba kembali.');
    }
  };

  const handlePrintPdf = () => {
    printDocument('printable-rpp-document');
  };

  const handleCopyText = () => {
    const textContent = `
MODUL AJAR / RPP KURIKULUM MERDEKA
${profile.namaSekolah.toUpperCase()}
Mata Pelajaran: ${currentRpp.mataPelajaran}
Kelas/Fase: ${currentRpp.fase}
Topik: ${currentRpp.topik}
Alokasi Waktu: ${currentRpp.alokasiWaktu}

I. TUJUAN PEMBELAJARAN
${currentRpp.tujuanPembelajaran.map((tp, i) => `${i + 1}. ${tp}`).join('\n')}

II. PEMAHAMAN BERMAKNA
${currentRpp.pemahamanBermakna.join('\n')}

III. PERTANYAAN PEMANTIK
${currentRpp.pertanyaanPemantik.join('\n')}

IV. KEGIATAN PEMBELAJARAN (${currentRpp.modelPembelajaran})
- Pendahuluan (${currentRpp.kegiatanPembelajaran.pendahuluan.durasi}):
${currentRpp.kegiatanPembelajaran.pendahuluan.langkah.join('\n')}

- Inti:
${currentRpp.kegiatanPembelajaran.inti.tahapan.map((t) => `* ${t.tahap}: ${t.aktivitas}`).join('\n')}

- Penutup (${currentRpp.kegiatanPembelajaran.penutup.durasi}):
${currentRpp.kegiatanPembelajaran.penutup.langkah.join('\n')}

V. ASESMEN
- Diagnostik: ${currentRpp.asesmen.diagnostik}
- Formatif: ${currentRpp.asesmen.formatif}
- Sumatif: ${currentRpp.asesmen.sumatif}
    `.trim();

    navigator.clipboard.writeText(textContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const loadSample = () => {
    setCurrentRpp(SAMPLE_RPP_INFORMATIKA);
    setMataPelajaran(SAMPLE_RPP_INFORMATIKA.mataPelajaran);
    setFaseKelas(SAMPLE_RPP_INFORMATIKA.fase);
    setTopik(SAMPLE_RPP_INFORMATIKA.topik);
    setModelPembelajaran(SAMPLE_RPP_INFORMATIKA.modelPembelajaran);
    setSelectedPancasila(SAMPLE_RPP_INFORMATIKA.profilPelajarPancasila);
  };

  return (
    <div className="space-y-5">
      {/* Top Generator Card */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 px-5 sm:px-6 py-4 text-white">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="bg-white/20 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full backdrop-blur-xs border border-white/20 uppercase tracking-wider">
                  Modul Ajar / RPP Otomatis
                </span>
                <span className="text-blue-100 text-xs font-medium">Standar BSKAP No. 032/H/KR/2024</span>
              </div>
              <h2 className="text-lg sm:text-xl font-black mt-1 text-white tracking-tight">
                Generator Modul Ajar Kurikulum Merdeka
              </h2>
              <p className="text-xs text-blue-100 mt-0.5">
                Terintegrasi Pendekatan Berdiferensiasi, KKTP, &amp; Konteks Lokal Tolitoli
              </p>
            </div>
            <button
              id="btn-load-sample-rpp"
              onClick={loadSample}
              className="self-start sm:self-auto text-xs font-semibold bg-white/15 hover:bg-white/25 text-white px-3 py-1.5 rounded-xl border border-white/20 transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Muat Contoh Baku (Informatika)</span>
            </button>
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
                id="select-mapel"
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

            {/* Fase / Kelas */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Fase &amp; Jenjang Kelas <span className="text-rose-500">*</span>
              </label>
              <select
                id="select-fase"
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

            {/* Alokasi Waktu */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Alokasi Waktu / Pertemuan
              </label>
              <input
                id="input-alokasi"
                type="text"
                value={alokasiWaktu}
                onChange={(e) => setAlokasiWaktu(e.target.value)}
                placeholder="misal: 2 x 45 Menit (1 Pertemuan)"
                className="w-full text-xs font-medium rounded-xl border border-slate-200 bg-slate-50/60 px-3 py-2 text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600 transition-all"
              />
            </div>
          </div>

          {/* Topik / Materi Pokok */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Topik / Lingkup Materi Pokok Pembelajaran <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                id="input-topik"
                type="text"
                value={topik}
                onChange={(e) => setTopik(e.target.value)}
                placeholder="Contoh: Berpikir Komputasional dan Algoritma / Struktur Atom / Hukum Newton"
                className="w-full text-xs sm:text-sm font-semibold rounded-xl border border-slate-300/90 bg-white px-3.5 py-2.5 text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600 pr-10 transition-all shadow-xs"
              />
              <BookOpen className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
            </div>
          </div>

          {/* Model Pembelajaran & Diferensiasi */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Model Pembelajaran
              </label>
              <select
                id="select-model"
                value={modelPembelajaran}
                onChange={(e) => setModelPembelajaran(e.target.value)}
                className="w-full text-xs font-medium rounded-xl border border-slate-200 bg-slate-50/60 px-3 py-2 text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600 transition-all"
              >
                {MODEL_PEMBELAJARAN_LIST.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Fokus Pembelajaran Berdiferensiasi
              </label>
              <select
                id="select-diferensiasi"
                value={diferensiasiFokus}
                onChange={(e) => setDiferensiasiFokus(e.target.value)}
                className="w-full text-xs font-medium rounded-xl border border-slate-200 bg-slate-50/60 px-3 py-2 text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600 transition-all"
              >
                <option value="Diferensiasi Konten, Proses, dan Produk">
                  Lengkap (Konten, Proses, dan Produk)
                </option>
                <option value="Diferensiasi Proses dan Produk">
                  Diferensiasi Proses dan Produk
                </option>
                <option value="Diferensiasi Konten dan Proses">
                  Diferensiasi Konten dan Proses
                </option>
                <option value="Diferensiasi Tingkat Kesiapan Belajar">
                  Berdasarkan Kesiapan Belajar Siswa
                </option>
              </select>
            </div>
          </div>

          {/* Profil Pelajar Pancasila Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Dimensi Profil Pelajar Pancasila yang Ditargetkan
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {PROFIL_PELAJAR_PANCASILA_LIST.map((p) => {
                const isSelected = selectedPancasila.includes(p);
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => togglePancasila(p)}
                    className={`flex items-center gap-2 p-2 rounded-xl text-xs font-semibold text-left border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-blue-50/90 border-blue-400 text-blue-900'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-md flex items-center justify-center border shrink-0 transition-colors ${
                        isSelected ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-300'
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                    <span className="truncate">{p}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Advanced / Local Context Accordion */}
          <div>
            <button
              type="button"
              onClick={() => setShowAdvancedParams(!showAdvancedParams)}
              className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-blue-700 py-1 cursor-pointer"
            >
              {showAdvancedParams ? <ChevronUp className="w-3.5 h-3.5 text-blue-600" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-500" />}
              <span>
                {showAdvancedParams
                  ? 'Sembunyikan Pengaturan Kontekstual Tolitoli & Catatan Guru'
                  : 'Opsi Tambahan: Kearifan Lokal SMAN 1 Lampasio & Catatan Guru'}
              </span>
            </button>

            {showAdvancedParams && (
              <div className="mt-2.5 p-3.5 bg-slate-50/80 rounded-xl border border-slate-200/80 space-y-3 animate-fadeIn">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Integrasi Kearifan Lokal Tolitoli / Lampasio
                  </label>
                  <input
                    type="text"
                    value={konteksLokal}
                    onChange={(e) => setKonteksLokal(e.target.value)}
                    placeholder="misal: perkebunan cengkeh/kakao Lampasio, pesisir Tolitoli"
                    className="w-full text-xs rounded-lg border border-slate-300 p-2 bg-white text-slate-800"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">
                    AI otomatis menyisipkan studi kasus dan analogi kontekstual riil daerah Tolitoli.
                  </p>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Catatan Khusus Pengampu
                  </label>
                  <textarea
                    rows={2}
                    value={catatanGuru}
                    onChange={(e) => setCatatanGuru(e.target.value)}
                    placeholder="misal: Sertakan aktivitas kelompok, manfaatkan LCD proyektor"
                    className="w-full text-xs rounded-lg border border-slate-300 p-2 bg-white text-slate-800"
                  />
                </div>
              </div>
            )}
          </div>

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-xs flex items-center gap-2">
              <span className="font-bold">Perhatian:</span> {error}
            </div>
          )}

          {/* Action Generate Button */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-100">
            <p className="text-xs text-slate-500 font-medium">
              * Perangkat diformat sesuai standar resmi Kemendikbudristek &amp; SMAN 1 Lampasio.
            </p>
            <button
              id="btn-generate-rpp"
              onClick={handleGenerateRpp}
              disabled={isLoading}
              className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs sm:text-sm font-bold rounded-xl shadow-md shadow-blue-600/20 hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-white" />
                  <span>Merancang Modul Ajar dengan AI...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Hasilkan Modul Ajar Otomatis</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Action Toolbar & Document Actions */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-3 sm:p-4 shadow-xs flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold bg-blue-50 text-blue-800 border border-blue-200/80">
            <BookOpen className="w-3.5 h-3.5 text-blue-600" />
            {currentRpp.mataPelajaran} ({currentRpp.fase})
          </span>
          <button
            onClick={() => setIsEditMode(!isEditMode)}
            className={`flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-lg border transition-colors cursor-pointer ${
              isEditMode
                ? 'bg-amber-500 text-white border-amber-600'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>{isEditMode ? 'Selesai Edit' : 'Edit Teks'}</span>
          </button>
        </div>

        {/* Export and Automation Hub */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          <button
            id="btn-export-docx"
            onClick={handleExportDocx}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs transition-colors cursor-pointer"
            title="Download Dokumen Microsoft Word (.docx) Resmi"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Word (.docx)</span>
          </button>

          <button
            id="btn-print-pdf"
            onClick={handlePrintPdf}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-xs transition-colors cursor-pointer"
            title="Cetak atau Simpan sebagai PDF"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Cetak / PDF</span>
          </button>

          <button
            id="btn-copy-rpp"
            onClick={handleCopyText}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl border border-slate-200 transition-colors cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
            <span>{copied ? 'Tersalin' : 'Salin'}</span>
          </button>

          <button
            id="btn-link-lkpd"
            onClick={() => onGenerateLinkedLkpd(currentRpp)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl border border-indigo-200 transition-colors cursor-pointer"
            title="Sinkronkan dan Buat LKPD terkait otomatis"
          >
            <span>LKPD Terkait</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          <button
            id="btn-link-penilaian"
            onClick={() => onGenerateLinkedAssessment(currentRpp)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-xl border border-purple-200 transition-colors cursor-pointer"
            title="Buat Bank Soal & Penilaian Daring terkait"
          >
            <span>Asesmen Terkait</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Official Document Preview Frame (Paper Layout) */}
      <div className="bg-slate-200/70 p-3 sm:p-8 rounded-2xl border border-slate-300/80">
        <div
          id="printable-rpp-document"
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

          {/* Title */}
          <div className="doc-title text-center mb-6">
            <h2 className="text-base sm:text-lg font-bold underline uppercase text-slate-900">
              Modul Ajar / Rencana Pelaksanaan Pembelajaran (RPP)
            </h2>
            <p className="text-xs sm:text-sm font-bold text-slate-700 mt-1">
              Kurikulum Merdeka — Tahun Pelajaran {profile.tahunPelajaran} (Semester {currentRpp.semester || profile.semester})
            </p>
          </div>

          {/* I. Informasi Umum */}
          <div className="mb-6">
            <div className="flex items-center justify-between border-b border-slate-300 pb-1 mb-3">
              <h3 className="text-sm sm:text-base font-bold text-blue-900 font-sans">
                I. INFORMASI UMUM & IDENTITAS MODUL
              </h3>
            </div>

            <table className="w-full text-xs sm:text-sm border-collapse mb-4">
              <tbody>
                <tr className="border-b border-slate-100">
                  <td className="py-1.5 font-semibold w-1/3 text-slate-700">Satuan Pendidikan</td>
                  <td className="py-1.5 text-slate-900">: {profile.namaSekolah}</td>
                </tr>
                <tr className="border-b border-slate-100">
                  <td className="py-1.5 font-semibold text-slate-700">Nama Penyusun / Guru</td>
                  <td className="py-1.5 text-slate-900">: {currentRpp.namaGuru || profile.namaGuru}</td>
                </tr>
                <tr className="border-b border-slate-100">
                  <td className="py-1.5 font-semibold text-slate-700">Mata Pelajaran</td>
                  <td className="py-1.5 text-slate-900">: {currentRpp.mataPelajaran}</td>
                </tr>
                <tr className="border-b border-slate-100">
                  <td className="py-1.5 font-semibold text-slate-700">Fase / Kelas / Semester</td>
                  <td className="py-1.5 text-slate-900">: {currentRpp.fase} / Semester {currentRpp.semester || profile.semester}</td>
                </tr>
                <tr className="border-b border-slate-100">
                  <td className="py-1.5 font-semibold text-slate-700">Alokasi Waktu</td>
                  <td className="py-1.5 text-slate-900">: {currentRpp.alokasiWaktu}</td>
                </tr>
                <tr className="border-b border-slate-100">
                  <td className="py-1.5 font-semibold text-slate-700">Elemen Capaian</td>
                  <td className="py-1.5 text-slate-900">: {currentRpp.elemenCP}</td>
                </tr>
                <tr className="border-b border-slate-100">
                  <td className="py-1.5 font-semibold text-slate-700">Topik / Materi Pokok</td>
                  <td className="py-1.5 text-slate-900 font-semibold">: {currentRpp.topik}</td>
                </tr>
                <tr className="border-b border-slate-100">
                  <td className="py-1.5 font-semibold text-slate-700">Model Pembelajaran</td>
                  <td className="py-1.5 text-slate-900">: {currentRpp.modelPembelajaran}</td>
                </tr>
                <tr className="border-b border-slate-100">
                  <td className="py-1.5 font-semibold text-slate-700">Target Peserta Didik</td>
                  <td className="py-1.5 text-slate-900">: {currentRpp.targetPesertaDidik}</td>
                </tr>
              </tbody>
            </table>

            <div className="space-y-2 text-xs sm:text-sm bg-slate-50 p-3 rounded-lg border border-slate-200">
              <div>
                <span className="font-bold text-slate-800">Profil Pelajar Pancasila: </span>
                <span className="text-slate-700">{currentRpp.profilPelajarPancasila.join(', ')}</span>
              </div>
              <div>
                <span className="font-bold text-slate-800">Sarana & Prasarana: </span>
                <span className="text-slate-700">{currentRpp.saranaPrasarana.join(', ')}</span>
              </div>
            </div>
          </div>

          {/* II. Komponen Inti */}
          <div className="mb-6">
            <div className="flex items-center justify-between border-b border-slate-300 pb-1 mb-3">
              <h3 className="text-sm sm:text-base font-bold text-blue-900 font-sans">
                II. KOMPONEN INTI PEMBELAJARAN
              </h3>
              <button
                onClick={() =>
                  onOpenAIRefine(
                    currentRpp.capaianPembelajaran,
                    (newTxt) => setCurrentRpp({ ...currentRpp, capaianPembelajaran: newTxt }),
                    'Capaian & Tujuan Pembelajaran'
                  )
                }
                className="text-[11px] text-blue-600 hover:text-blue-800 flex items-center gap-1 font-sans"
              >
                <Sparkles className="w-3 h-3" /> Optimalkan dengan AI
              </button>
            </div>

            {/* CP */}
            <div className="mb-3">
              <h4 className="font-bold text-slate-800 text-xs sm:text-sm mb-1">
                A. Capaian Pembelajaran (CP)
              </h4>
              <p className="text-justify text-slate-800 bg-blue-50/40 p-2.5 rounded border border-blue-100/60">
                {currentRpp.capaianPembelajaran}
              </p>
            </div>

            {/* ATP & TP */}
            <div className="mb-3">
              <h4 className="font-bold text-slate-800 text-xs sm:text-sm mb-1">
                B. Alur dan Tujuan Pembelajaran (ATP & TP)
              </h4>
              <p className="text-slate-700 italic text-xs mb-1.5">Alur: {currentRpp.alurTujuanPembelajaran}</p>
              <ul className="list-decimal pl-5 space-y-1 text-slate-800">
                {currentRpp.tujuanPembelajaran.map((tp, i) => (
                  <li key={i}>{tp}</li>
                ))}
              </ul>
            </div>

            {/* Pemahaman Bermakna & Pemantik */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
              <div className="bg-amber-50/50 p-3 rounded-lg border border-amber-200/60">
                <h4 className="font-bold text-amber-900 text-xs sm:text-sm mb-1">
                  C. Pemahaman Bermakna
                </h4>
                <ul className="list-disc pl-4 space-y-1 text-slate-800 text-xs">
                  {currentRpp.pemahamanBermakna.map((pm, i) => (
                    <li key={i}>{pm}</li>
                  ))}
                </ul>
              </div>

              <div className="bg-indigo-50/50 p-3 rounded-lg border border-indigo-200/60">
                <h4 className="font-bold text-indigo-900 text-xs sm:text-sm mb-1">
                  D. Pertanyaan Pemantik
                </h4>
                <ul className="list-disc pl-4 space-y-1 text-slate-800 text-xs">
                  {currentRpp.pertanyaanPemantik.map((pp, i) => (
                    <li key={i}>{pp}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Pembelajaran Berdiferensiasi */}
            <div className="bg-emerald-50/50 p-3 rounded-lg border border-emerald-200/60 mb-3">
              <h4 className="font-bold text-emerald-900 text-xs sm:text-sm mb-1.5">
                E. Rencana Pembelajaran Berdiferensiasi (Kurikulum Merdeka)
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                <div className="bg-white p-2 rounded border border-emerald-100">
                  <span className="font-bold text-emerald-800 block mb-0.5">Diferensiasi Konten:</span>
                  <span className="text-slate-700">{currentRpp.diferensiasi.konten}</span>
                </div>
                <div className="bg-white p-2 rounded border border-emerald-100">
                  <span className="font-bold text-emerald-800 block mb-0.5">Diferensiasi Proses:</span>
                  <span className="text-slate-700">{currentRpp.diferensiasi.proses}</span>
                </div>
                <div className="bg-white p-2 rounded border border-emerald-100">
                  <span className="font-bold text-emerald-800 block mb-0.5">Diferensiasi Produk:</span>
                  <span className="text-slate-700">{currentRpp.diferensiasi.produk}</span>
                </div>
              </div>
            </div>
          </div>

          {/* III. Kegiatan Pembelajaran */}
          <div className="mb-6">
            <div className="flex items-center justify-between border-b border-slate-300 pb-1 mb-3">
              <h3 className="text-sm sm:text-base font-bold text-blue-900 font-sans">
                III. SKENARIO / LANGKAH PEMBELAJARAN
              </h3>
              <button
                onClick={() =>
                  onOpenAIRefine(
                    JSON.stringify(currentRpp.kegiatanPembelajaran),
                    (newTxt) => {
                      try {
                        const parsed = JSON.parse(newTxt);
                        setCurrentRpp({ ...currentRpp, kegiatanPembelajaran: parsed });
                      } catch (e) {}
                    },
                    'Langkah Kegiatan Pembelajaran'
                  )
                }
                className="text-[11px] text-blue-600 hover:text-blue-800 flex items-center gap-1 font-sans"
              >
                <Sparkles className="w-3 h-3" /> Revisi Skenario
              </button>
            </div>

            {/* Pendahuluan */}
            <div className="mb-4">
              <div className="font-bold text-slate-800 text-xs sm:text-sm mb-1.5 flex justify-between">
                <span>A. Kegiatan Pendahuluan</span>
                <span className="text-slate-500 font-normal">({currentRpp.kegiatanPembelajaran.pendahuluan.durasi})</span>
              </div>
              <ul className="list-disc pl-5 space-y-1 text-slate-800">
                {currentRpp.kegiatanPembelajaran.pendahuluan.langkah.map((l, i) => (
                  <li key={i}>{l}</li>
                ))}
              </ul>
            </div>

            {/* Inti (Sintaks Table) */}
            <div className="mb-4">
              <div className="font-bold text-slate-800 text-xs sm:text-sm mb-1.5">
                B. Kegiatan Inti ({currentRpp.kegiatanPembelajaran.inti.sintaks})
              </div>
              <table className="w-full text-xs sm:text-sm border border-slate-300 border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-900">
                    <th className="border border-slate-300 p-2 text-left w-1/3">Sintaks Pembelajaran</th>
                    <th className="border border-slate-300 p-2 text-left">Aktivitas Siswa & Guru</th>
                  </tr>
                </thead>
                <tbody>
                  {currentRpp.kegiatanPembelajaran.inti.tahapan.map((t, i) => (
                    <tr key={i} className="border-b border-slate-200">
                      <td className="border border-slate-300 p-2 font-semibold text-slate-800 align-top">
                        {t.tahap}
                      </td>
                      <td className="border border-slate-300 p-2 text-slate-800 align-top">
                        <p>{t.aktivitas}</p>
                        {t.diferensiasi && (
                          <p className="mt-1 text-[11.5px] text-emerald-700 italic">
                            *Diferensiasi: {t.diferensiasi}
                          </p>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Penutup */}
            <div className="mb-4">
              <div className="font-bold text-slate-800 text-xs sm:text-sm mb-1.5 flex justify-between">
                <span>C. Kegiatan Penutup</span>
                <span className="text-slate-500 font-normal">({currentRpp.kegiatanPembelajaran.penutup.durasi})</span>
              </div>
              <ul className="list-disc pl-5 space-y-1 text-slate-800">
                {currentRpp.kegiatanPembelajaran.penutup.langkah.map((l, i) => (
                  <li key={i}>{l}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* IV. Asesmen & KKTP */}
          <div className="mb-6">
            <div className="flex items-center justify-between border-b border-slate-300 pb-1 mb-3">
              <h3 className="text-sm sm:text-base font-bold text-blue-900 font-sans">
                IV. ASESMEN & KRITERIA KETERCAPAIAN (KKTP)
              </h3>
            </div>

            <div className="space-y-2 mb-3 text-xs sm:text-sm">
              <p>
                <strong className="text-slate-800">1. Asesmen Awal / Diagnostik: </strong>
                <span className="text-slate-700">{currentRpp.asesmen.diagnostik}</span>
              </p>
              <p>
                <strong className="text-slate-800">2. Asesmen Formatif: </strong>
                <span className="text-slate-700">{currentRpp.asesmen.formatif}</span>
              </p>
              <p>
                <strong className="text-slate-800">3. Asesmen Sumatif: </strong>
                <span className="text-slate-700">{currentRpp.asesmen.sumatif}</span>
              </p>
            </div>

            {/* Rubrik Table */}
            <h4 className="font-bold text-slate-800 text-xs mb-1.5">
              Rubrik Kriteria Ketercapaian Tujuan Pembelajaran (KKTP):
            </h4>
            <div className="overflow-x-auto">
              <table className="w-full text-[11.5px] border border-slate-300 border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-900">
                    <th className="border border-slate-300 p-1.5 text-left">Kriteria</th>
                    <th className="border border-slate-300 p-1.5 text-left">Baru Berkembang</th>
                    <th className="border border-slate-300 p-1.5 text-left">Layak</th>
                    <th className="border border-slate-300 p-1.5 text-left">Cakap</th>
                    <th className="border border-slate-300 p-1.5 text-left">Mahir</th>
                  </tr>
                </thead>
                <tbody>
                  {currentRpp.asesmen.rubrikKriteria.map((r, i) => (
                    <tr key={i} className="border-b border-slate-200">
                      <td className="border border-slate-300 p-1.5 font-semibold text-slate-800 align-top">
                        {r.kriteria}
                      </td>
                      <td className="border border-slate-300 p-1.5 text-slate-700 align-top">{r.baruBerkembang}</td>
                      <td className="border border-slate-300 p-1.5 text-slate-700 align-top">{r.layak}</td>
                      <td className="border border-slate-300 p-1.5 text-slate-700 align-top">{r.cakap}</td>
                      <td className="border border-slate-300 p-1.5 text-slate-700 align-top">{r.mahir}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* V. Remedial & Pengayaan */}
          <div className="mb-6">
            <div className="border-b border-slate-300 pb-1 mb-3">
              <h3 className="text-sm sm:text-base font-bold text-blue-900 font-sans">
                V. PENGAYAAN DAN REMEDIAL
              </h3>
            </div>
            <div className="space-y-2 text-xs sm:text-sm">
              <p>
                <strong className="text-slate-800">Program Remedial: </strong>
                <span className="text-slate-700">{currentRpp.remedialPengayaan.remedial}</span>
              </p>
              <p>
                <strong className="text-slate-800">Program Pengayaan: </strong>
                <span className="text-slate-700">{currentRpp.remedialPengayaan.pengayaan}</span>
              </p>
            </div>
          </div>

          {/* VI. Glosarium & Daftar Pustaka */}
          <div className="mb-8">
            <div className="border-b border-slate-300 pb-1 mb-3">
              <h3 className="text-sm sm:text-base font-bold text-blue-900 font-sans">
                VI. GLOSARIUM & DAFTAR PUSTAKA
              </h3>
            </div>
            <div className="mb-3 text-xs sm:text-sm">
              <strong className="text-slate-800 block mb-1">Glosarium:</strong>
              <ul className="list-disc pl-5 space-y-0.5 text-slate-700">
                {currentRpp.glosarium.map((g, i) => (
                  <li key={i}>
                    <strong>{g.istilah}:</strong> {g.arti}
                  </li>
                ))}
              </ul>
            </div>
            <div className="text-xs sm:text-sm">
              <strong className="text-slate-800 block mb-1">Daftar Pustaka:</strong>
              <ul className="list-disc pl-5 space-y-0.5 text-slate-700">
                {currentRpp.daftarPustaka.map((dp, i) => (
                  <li key={i}>{dp}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Signatures / Tanda Tangan Resmi */}
          <div className="signature-box pt-6 border-t border-slate-200">
            <table className="w-full text-xs sm:text-sm">
              <tbody>
                <tr>
                  <td className="w-1/2 align-top text-left">
                    <p className="m-0">Mengetahui,</p>
                    <p className="font-bold m-0">Kepala SMA Negeri 1 Lampasio</p>
                    <div className="h-16"></div>
                    <p className="font-bold underline m-0">
                      {currentRpp.namaKepsek || profile.namaKepalaSekolah}
                    </p>
                    <p className="text-slate-600 m-0">
                      NIP. {currentRpp.nipKepsek || profile.nipKepalaSekolah}
                    </p>
                  </td>
                  <td className="w-1/2 align-top text-left pl-8">
                    <p className="m-0">
                      Lampasio, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                    <p className="font-bold m-0">Guru Mata Pelajaran,</p>
                    <div className="h-16"></div>
                    <p className="font-bold underline m-0">
                      {currentRpp.namaGuru || profile.namaGuru}
                    </p>
                    <p className="text-slate-600 m-0">
                      NIP. {currentRpp.nipGuru || profile.nipGuru}
                    </p>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
