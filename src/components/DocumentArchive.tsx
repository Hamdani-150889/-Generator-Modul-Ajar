import React, { useState } from 'react';
import {
  FolderArchive,
  BookOpen,
  FileText,
  CheckSquare,
  Download,
  Trash2,
  ExternalLink,
  Search,
  Calendar,
  Layers,
} from 'lucide-react';
import { RppModulAjar, LKPDDocument, AsesmenDaringPackage, SchoolProfile } from '../types';
import { exportRppToDocx, exportLkpdToDocx } from '../utils/docxExport';

interface DocumentArchiveProps {
  profile: SchoolProfile;
  rppList: RppModulAjar[];
  lkpdList: LKPDDocument[];
  asesmenList: AsesmenDaringPackage[];
  onSelectRpp: (rpp: RppModulAjar) => void;
  onSelectLkpd: (lkpd: LKPDDocument) => void;
  onSelectAsesmen: (asesmen: AsesmenDaringPackage) => void;
  onDeleteRpp: (id: string) => void;
  onDeleteLkpd: (id: string) => void;
  onDeleteAsesmen: (id: string) => void;
}

export const DocumentArchive: React.FC<DocumentArchiveProps> = ({
  profile,
  rppList,
  lkpdList,
  asesmenList,
  onSelectRpp,
  onSelectLkpd,
  onSelectAsesmen,
  onDeleteRpp,
  onDeleteLkpd,
  onDeleteAsesmen,
}) => {
  const [filterType, setFilterType] = useState<'all' | 'rpp' | 'lkpd' | 'asesmen'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredRpp = rppList.filter(
    (r) =>
      r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.topik.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.mataPelajaran.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredLkpd = lkpdList.filter(
    (l) =>
      l.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.mataPelajaran.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredAsesmen = asesmenList.filter(
    (a) =>
      a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.mataPelajaran.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <FolderArchive className="w-5 h-5 text-blue-600" />
              <span>Bank Dokumen & Arsip Perangkat Pembelajaran</span>
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Arsip tersimpan untuk Guru {profile.namaSekolah}. Buka kembali untuk diedit, dicetak, atau diekspor ke Word (.docx) & PDF kapan saja.
            </p>
          </div>

          {/* Search Bar */}
          <div className="relative min-w-[260px]">
            <input
              type="text"
              placeholder="Cari topik atau mata pelajaran..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs rounded-lg border border-slate-300 pl-8 pr-3 py-2 text-slate-800 focus:ring-2 focus:ring-blue-500"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex space-x-2 mt-4 pt-4 border-t border-slate-100">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              filterType === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Semua Dokumen ({rppList.length + lkpdList.length + asesmenList.length})
          </button>
          <button
            onClick={() => setFilterType('rpp')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
              filterType === 'rpp'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>RPP / Modul Ajar ({rppList.length})</span>
          </button>
          <button
            onClick={() => setFilterType('lkpd')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
              filterType === 'lkpd'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>LKPD Siswa ({lkpdList.length})</span>
          </button>
          <button
            onClick={() => setFilterType('asesmen')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
              filterType === 'asesmen'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <CheckSquare className="w-3.5 h-3.5" />
            <span>Asesmen & CBT ({asesmenList.length})</span>
          </button>
        </div>
      </div>

      {/* Grid of Documents */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* RPP Cards */}
        {(filterType === 'all' || filterType === 'rpp') &&
          filteredRpp.map((rpp) => (
            <div
              key={rpp.id}
              className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-800 border border-blue-200">
                    <BookOpen className="w-3 h-3" /> RPP / Modul Ajar
                  </span>
                  <span className="text-[11px] text-slate-400">
                    {new Date(rpp.createdAt).toLocaleDateString('id-ID')}
                  </span>
                </div>

                <h3 className="font-bold text-slate-900 text-sm leading-snug line-clamp-2">
                  {rpp.title}
                </h3>
                <p className="text-xs text-slate-600 mt-1">
                  <strong>Mapel:</strong> {rpp.mataPelajaran} ({rpp.fase})
                </p>
                <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">
                  <strong>Model:</strong> {rpp.modelPembelajaran}
                </p>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => onSelectRpp(rpp)}
                  className="text-xs font-semibold text-blue-700 hover:text-blue-900 flex items-center gap-1"
                >
                  <span>Buka & Edit</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => exportRppToDocx(rpp, profile)}
                    className="p-1.5 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-md transition-colors"
                    title="Download Word (.docx)"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDeleteRpp(rpp.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                    title="Hapus Dokumen"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}

        {/* LKPD Cards */}
        {(filterType === 'all' || filterType === 'lkpd') &&
          filteredLkpd.map((lkpd) => (
            <div
              key={lkpd.id}
              className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                    <FileText className="w-3 h-3" /> LKPD Siswa
                  </span>
                  <span className="text-[11px] text-slate-400">
                    {new Date(lkpd.createdAt).toLocaleDateString('id-ID')}
                  </span>
                </div>

                <h3 className="font-bold text-slate-900 text-sm leading-snug line-clamp-2">
                  {lkpd.title}
                </h3>
                <p className="text-xs text-slate-600 mt-1">
                  <strong>Mapel:</strong> {lkpd.mataPelajaran} ({lkpd.faseKelas})
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  <strong>Soal Analisis:</strong> {lkpd.pertanyaanDiskusi.length} Butir
                </p>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => onSelectLkpd(lkpd)}
                  className="text-xs font-semibold text-emerald-700 hover:text-emerald-900 flex items-center gap-1"
                >
                  <span>Buka & Edit</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => exportLkpdToDocx(lkpd, profile)}
                    className="p-1.5 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-md transition-colors"
                    title="Download Word (.docx)"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDeleteLkpd(lkpd.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                    title="Hapus Dokumen"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}

        {/* Asesmen Cards */}
        {(filterType === 'all' || filterType === 'asesmen') &&
          filteredAsesmen.map((asesmen) => (
            <div
              key={asesmen.id}
              className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-purple-50 text-purple-800 border border-purple-200">
                    <CheckSquare className="w-3 h-3" /> Paket Asesmen & CBT
                  </span>
                  <span className="text-[11px] text-slate-400">
                    {new Date(asesmen.createdAt).toLocaleDateString('id-ID')}
                  </span>
                </div>

                <h3 className="font-bold text-slate-900 text-sm leading-snug line-clamp-2">
                  {asesmen.title}
                </h3>
                <p className="text-xs text-slate-600 mt-1">
                  <strong>Mapel:</strong> {asesmen.mataPelajaran} ({asesmen.faseKelas})
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  <strong>Jumlah Soal:</strong> {asesmen.soalKuis.length} Butir
                </p>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => onSelectAsesmen(asesmen)}
                  className="text-xs font-semibold text-purple-700 hover:text-purple-900 flex items-center gap-1"
                >
                  <span>Buka Ujian / Rekap</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onDeleteAsesmen(asesmen.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                    title="Hapus Dokumen"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
      </div>

      {filteredRpp.length === 0 && filteredLkpd.length === 0 && filteredAsesmen.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl border border-slate-200 p-8">
          <FolderArchive className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="font-bold text-slate-700 text-sm">Belum ada dokumen yang sesuai</h3>
          <p className="text-xs text-slate-500 mt-1">
            Gunakan tab RPP, LKPD, atau Asesmen Daring untuk membuat dokumen baru secara otomatis.
          </p>
        </div>
      )}
    </div>
  );
};
