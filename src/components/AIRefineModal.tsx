import React, { useState } from 'react';
import { X, Sparkles, Wand2, Check, RefreshCw } from 'lucide-react';

interface AIRefineModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetText: string;
  sectionName: string;
  onApply: (refinedText: string) => void;
}

export const AIRefineModal: React.FC<AIRefineModalProps> = ({
  isOpen,
  onClose,
  targetText,
  sectionName,
  onApply,
}) => {
  const [instruction, setInstruction] = useState('Tingkatkan kedalaman analisis dan relevansi dengan kearifan lokal Tolitoli');
  const [resultText, setResultText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleRefine = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/refine-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          originalText: targetText,
          instruction,
          sectionContext: sectionName,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Gagal menyempurnakan konten');
      }

      const data = await res.json();
      setResultText(data.refinedText);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Terjadi kesalahan saat memproses perbaikan AI.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveAndClose = () => {
    if (resultText) {
      onApply(resultText);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-2xl w-full overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-700 px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-300" />
            <div>
              <h3 className="font-bold text-base">Asisten AI Penyempurna Konten</h3>
              <p className="text-xs text-blue-100">Bagian: {sectionName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Preset Buttons */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Pilih / Masukkan Instruksi Perbaikan:
            </label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {[
                'Integrasikan studi kasus potensi pertanian Lampasio/Tolitoli',
                'Tingkatkan level berpikir tingkat tinggi (HOTS C4-C6)',
                'Perjelas diferensiasi proses dan produk',
                'Sederhanakan bahasa agar lebih mudah dipahami siswa',
                'Tambahkan pertanyaan pemantik yang lebih memotivasi',
              ].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setInstruction(preset)}
                  className="text-[11px] bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 px-2 py-1 rounded-md border border-slate-200 transition-colors"
                >
                  + {preset}
                </button>
              ))}
            </div>
            <input
              type="text"
              value={instruction}
              onChange={(e) => setInstruction(e.target.value)}
              className="w-full text-xs rounded-lg border border-slate-300 p-2.5 text-slate-900 focus:ring-2 focus:ring-blue-500 font-medium"
            />
          </div>

          {/* Original Text vs Result */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">
                Teks Asli Saat Ini:
              </label>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-700 max-h-48 overflow-y-auto whitespace-pre-wrap">
                {targetText || 'Teks kosong'}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-purple-700 mb-1">
                Hasil Optimasi AI:
              </label>
              <div className="p-3 bg-purple-50/50 rounded-lg border border-purple-200 text-xs text-slate-800 max-h-48 overflow-y-auto whitespace-pre-wrap min-h-[100px]">
                {resultText ? (
                  resultText
                ) : (
                  <span className="text-slate-400 italic">
                    Klik tombol "Proses Perbaikan AI" di bawah untuk melihat hasil perbaikan.
                  </span>
                )}
              </div>
            </div>
          </div>

          {error && (
            <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-xs">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            <button
              onClick={handleRefine}
              disabled={isLoading}
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors flex items-center gap-1.5 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Memproses AI...</span>
                </>
              ) : (
                <>
                  <Wand2 className="w-3.5 h-3.5" />
                  <span>Proses Perbaikan AI</span>
                </>
              )}
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg border border-slate-300"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSaveAndClose}
                disabled={!resultText}
                className="px-4 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-xs transition-colors flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Terapkan ke Dokumen</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
