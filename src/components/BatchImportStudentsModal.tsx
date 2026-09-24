import React, { useState } from 'react';
import { X, Users, Upload, FileText, Check, Sparkles } from 'lucide-react';
import { DataNilaiSiswa } from '../types';
import { MASTER_STUDENTS_SMAN1_LAMPASIO } from '../data/sampleTemplates';

interface BatchImportStudentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportStudents: (students: DataNilaiSiswa[]) => void;
}

export const BatchImportStudentsModal: React.FC<BatchImportStudentsModalProps> = ({
  isOpen,
  onClose,
  onImportStudents,
}) => {
  const [importMode, setImportMode] = useState<'preset' | 'text'>('preset');
  const [selectedPresetClass, setSelectedPresetClass] = useState('Semua');
  const [pasteText, setPasteText] = useState('');
  const [defaultTargetClass, setDefaultTargetClass] = useState('X-A');

  if (!isOpen) return null;

  const handleImportPreset = () => {
    let toImport = MASTER_STUDENTS_SMAN1_LAMPASIO;
    if (selectedPresetClass !== 'Semua') {
      toImport = MASTER_STUDENTS_SMAN1_LAMPASIO.filter((s) => s.kelas.startsWith(selectedPresetClass));
    }
    onImportStudents(toImport);
    onClose();
  };

  const handleImportText = () => {
    if (!pasteText.trim()) return;

    const lines = pasteText.split('\n');
    const parsedStudents: DataNilaiSiswa[] = [];

    lines.forEach((line, index) => {
      const trimmed = line.trim();
      if (!trimmed) return;

      // Check if comma-separated or tab-separated: NISN, Nama, Kelas
      const parts = trimmed.split(/[\t,;]+/).map((p) => p.trim());
      let nisn = '';
      let nama = '';
      let kelas = defaultTargetClass;

      if (parts.length >= 2) {
        if (/^\d{8,12}$/.test(parts[0])) {
          nisn = parts[0];
          nama = parts[1];
          if (parts[2]) kelas = parts[2];
        } else {
          nama = parts[0];
          if (parts[1]) {
            if (/^\d{8,12}$/.test(parts[1])) {
              nisn = parts[1];
            } else {
              kelas = parts[1];
            }
          }
          if (parts[2]) kelas = parts[2];
        }
      } else {
        nama = trimmed.replace(/^\d+[\.\-\)]\s*/, ''); // strip number prefixes like "1. Budi"
        nisn = '00' + Math.floor(10000000 + Math.random() * 90000000);
      }

      const f = 80;
      const l = 85;
      const s = 82;
      const na = Math.round(f * 0.3 + l * 0.3 + s * 0.4);

      parsedStudents.push({
        id: 'import-' + Date.now() + '-' + index,
        nisn: nisn || '00' + Math.floor(10000000 + Math.random() * 90000000),
        nama: nama,
        kelas: kelas,
        nilaiFormatif: f,
        nilaiLKPD: l,
        nilaiSumatif: s,
        nilaiAkhir: na,
        statusKetercapaian: 'Tuntas (Cakap)',
        catatanGuru: 'Diimpor dari daftar presensi kelas',
      });
    });

    if (parsedStudents.length > 0) {
      onImportStudents(parsedStudents);
      onClose();
      setPasteText('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-xl w-full overflow-hidden shadow-2xl border border-slate-200">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-emerald-700 to-teal-800 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center text-white">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Import Massal Rombel Siswa</h3>
              <p className="text-xs text-emerald-100">SMA Negeri 1 Lampasio — Rekap Nilai Cepat</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="p-6 space-y-5">
          <div className="flex rounded-xl bg-slate-100 p-1 border border-slate-200">
            <button
              onClick={() => setImportMode('preset')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                importMode === 'preset'
                  ? 'bg-white text-emerald-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Daftar Rombel Resmi SMAN 1 Lampasio
            </button>
            <button
              onClick={() => setImportMode('text')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                importMode === 'text'
                  ? 'bg-white text-emerald-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Tempel / Copy-Paste Nama Siswa
            </button>
          </div>

          {importMode === 'preset' ? (
            <div className="space-y-4">
              <p className="text-xs text-slate-600 leading-relaxed">
                Pilih rombongan belajar (kelas) yang ingin dimuat ke dalam buku nilai asesmen:
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {[
                  { id: 'Semua', label: 'Semua Rombel (16 Siswa)' },
                  { id: 'X-A', label: 'Kelas X-A (8 Siswa)' },
                  { id: 'X-B', label: 'Kelas X-B (4 Siswa)' },
                  { id: 'XI', label: 'Kelas XI (4 Siswa)' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSelectedPresetClass(item.id)}
                    className={`p-3 text-left rounded-xl border text-xs font-semibold transition-all ${
                      selectedPresetClass === item.id
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-400'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span className="block font-bold">{item.id}</span>
                    <span className="text-[10px] text-slate-500 font-normal">{item.label}</span>
                  </button>
                ))}
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600">
                💡 Roster ini mencakup data nama lengkap siswa, NISN, serta nilai awal yang dapat Anda sesuaikan kapan saja.
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleImportPreset}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>Muat Siswa Rombel Ini</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <label className="text-xs font-semibold text-slate-700">Target Kelas Default:</label>
                <input
                  type="text"
                  value={defaultTargetClass}
                  onChange={(e) => setDefaultTargetClass(e.target.value)}
                  className="text-xs font-bold border border-slate-300 rounded-lg px-2.5 py-1 bg-white text-slate-800 w-24"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tempel Daftar Nama Siswa (1 Baris per Siswa):
                </label>
                <textarea
                  rows={6}
                  value={pasteText}
                  onChange={(e) => setPasteText(e.target.value)}
                  placeholder="Contoh format:&#10;0078129011, Andi Muh. Rizky Pratama&#10;0081293812, Nur Aisyah Tolitoli&#10;Fajar Hidayatullah&#10;Siti Rahmawati Lampasio"
                  className="w-full text-xs font-mono rounded-xl border border-slate-300 p-3 bg-white text-slate-800 focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="button"
                  disabled={!pasteText.trim()}
                  onClick={handleImportText}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Upload className="w-4 h-4" />
                  <span>Import &amp; Tambahkan</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
