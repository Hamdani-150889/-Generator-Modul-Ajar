import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "15mb" }));

// Helper to get GoogleGenAI client
function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  return new GoogleGenAI({
    apiKey: apiKey || "",
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

// Resilient AI generation with automatic retry and model fallback chain
const MODEL_FALLBACK_CHAIN = [
  "gemini-3.7-flash",
  "gemini-flash-latest",
  "gemini-3.1-flash-lite",
];

function sanitizeJsonOutput(text: string): string {
  let cleaned = text.trim();
  // Strip markdown code fences if present
  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
  }
  return cleaned.trim();
}

async function generateContentWithRetry(
  ai: GoogleGenAI,
  params: {
    contents: string;
    systemInstruction: string;
    responseSchema?: any;
  }
): Promise<string> {
  let lastError: any = null;

  for (const modelName of MODEL_FALLBACK_CHAIN) {
    // Try up to 2 attempts per model with short backoff
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const config: any = {
          systemInstruction: params.systemInstruction,
          responseMimeType: "application/json",
        };
        if (params.responseSchema) {
          config.responseSchema = params.responseSchema;
        }

        const response = await ai.models.generateContent({
          model: modelName,
          contents: params.contents,
          config,
        });

        if (response && response.text) {
          return sanitizeJsonOutput(response.text);
        }
      } catch (err: any) {
        lastError = err;
        const errString = String(err?.message || err || "");
        const isTransient =
          errString.includes("503") ||
          errString.includes("UNAVAILABLE") ||
          errString.includes("high demand") ||
          errString.includes("429") ||
          errString.includes("RESOURCE_EXHAUSTED") ||
          errString.includes("Overloaded");

        console.warn(
          `[Gemini Attempt ${attempt} on ${modelName}] Failed: ${errString}. Transient? ${isTransient}`
        );

        if (isTransient && attempt < 2) {
          // Wait 1.2 seconds before retrying same model
          await new Promise((resolve) => setTimeout(resolve, 1200));
        } else {
          // Break to try next model in fallback chain
          break;
        }
      }
    }
  }

  throw lastError || new Error("Semua model AI sedang mengalami beban tinggi. Silakan coba kembali sesaat lagi.");
}

// System instructions for standard Kurikulum Merdeka at SMAN 1 Lampasio
const SMAN1_LAMPASIO_CONTEXT = `
Anda adalah Pakar Kurikulum Merdeka dan Pengembang Perangkat Pembelajaran untuk SMA Negeri 1 Lampasio (Kabupaten Tolitoli, Sulawesi Tengah).
Karakteristik sekolah:
- Satuan Pendidikan: SMA Negeri 1 Lampasio
- Lokasi: Jl. Poros Lampasio - Salumpaga, Kec. Lampasio, Kab. Tolitoli, Sulawesi Tengah
- Kurikulum: Kurikulum Merdeka (Fase E untuk Kelas X, Fase F untuk Kelas XI & XII)
- Standar: Standar BSKAP Kemendikbudristek No. 032/H/KR/2024 & Permendikbudristek No. 12 Tahun 2024
- Nilai & Konteks: Mengintegrasikan 6 Dimensi Profil Pelajar Pancasila, Pembelajaran Berdiferensiasi (Konten, Proses, Produk), Asesmen Otentik, serta kearifan lokal daerah Tolitoli (agrikultur cengkeh/kelapa/kakao, maritim, keanekaragaman hayati, dan gotong royong).
Semua keluaran harus berkualitas tinggi, terstruktur rapi, siap pakai tanpa placeholder kosong, dan siap dicetak/diekspor resmi.
`;

// 1. Endpoint Generate RPP / Modul Ajar
app.post("/api/generate-rpp", async (req, res) => {
  try {
    const {
      mataPelajaran,
      faseKelas,
      topik,
      alokasiWaktu,
      modelPembelajaran,
      profilPancasila,
      diferensiasi,
      catatanTambahan,
      namaGuru,
      nipGuru,
      namaKepsek,
      nipKepsek,
    } = req.body;

    const ai = getGeminiClient();

    const prompt = `
Buatlah Dokumen RPP / Modul Ajar Kurikulum Merdeka Lengkap dan Standar Resmi untuk SMA Negeri 1 Lampasio dengan data:
- Mata Pelajaran: ${mataPelajaran || "Informatika"}
- Fase / Kelas: ${faseKelas || "Fase E (Kelas X)"}
- Topik / Materi Pokok: ${topik || "Berpikir Komputasional dan Algoritma"}
- Alokasi Waktu: ${alokasiWaktu || "2 x 45 Menit (1 Pertemuan)"}
- Model Pembelajaran Utama: ${modelPembelajaran || "Problem Based Learning (PBL)"}
- Fokus Profil Pelajar Pancasila: ${profilPancasila ? profilPancasila.join(", ") : "Bernalar Kritis, Kreatif, Bergotong Royong"}
- Fokus Pembelajaran Berdiferensiasi: ${diferensiasi || "Diferensiasi Proses dan Produk"}
- Catatan / Penyesuaian Guru: ${catatanTambahan || "Sesuaikan dengan karakteristik siswa di SMAN 1 Lampasio"}

Format output JSON harus sangat detail, terstruktur, mencakup sintaks model pembelajaran, diferensiasi konten/proses/produk, dan instrumen penilaian KKTP.
`;

    const jsonText = await generateContentWithRetry(ai, {
      contents: prompt,
      systemInstruction: SMAN1_LAMPASIO_CONTEXT,
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          mataPelajaran: { type: Type.STRING },
          fase: { type: Type.STRING },
          semester: { type: Type.STRING },
          alokasiWaktu: { type: Type.STRING },
          topik: { type: Type.STRING },
          elemenCP: { type: Type.STRING },
          capaianPembelajaran: { type: Type.STRING },
          tujuanPembelajaran: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
          alurTujuanPembelajaran: { type: Type.STRING },
          pemahamanBermakna: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
          pertanyaanPemantik: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
          profilPelajarPancasila: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
          saranaPrasarana: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
          targetPesertaDidik: { type: Type.STRING },
          modelPembelajaran: { type: Type.STRING },
          metodePembelajaran: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
          diferensiasi: {
            type: Type.OBJECT,
            properties: {
              konten: { type: Type.STRING },
              proses: { type: Type.STRING },
              produk: { type: Type.STRING },
            },
            required: ["konten", "proses", "produk"],
          },
          kegiatanPembelajaran: {
            type: Type.OBJECT,
            properties: {
              pendahuluan: {
                type: Type.OBJECT,
                properties: {
                  durasi: { type: Type.STRING },
                  langkah: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                },
                required: ["durasi", "langkah"],
              },
              inti: {
                type: Type.OBJECT,
                properties: {
                  sintaks: { type: Type.STRING },
                  tahapan: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        tahap: { type: Type.STRING },
                        aktivitas: { type: Type.STRING },
                        diferensiasi: { type: Type.STRING },
                      },
                      required: ["tahap", "aktivitas"],
                    },
                  },
                },
                required: ["sintaks", "tahapan"],
              },
              penutup: {
                type: Type.OBJECT,
                properties: {
                  durasi: { type: Type.STRING },
                  langkah: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                },
                required: ["durasi", "langkah"],
              },
            },
            required: ["pendahuluan", "inti", "penutup"],
          },
          asesmen: {
            type: Type.OBJECT,
            properties: {
              diagnostik: { type: Type.STRING },
              formatif: { type: Type.STRING },
              sumatif: { type: Type.STRING },
              rubrikKriteria: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    kriteria: { type: Type.STRING },
                    baruBerkembang: { type: Type.STRING },
                    layak: { type: Type.STRING },
                    cakap: { type: Type.STRING },
                    mahir: { type: Type.STRING },
                  },
                  required: ["kriteria", "baruBerkembang", "layak", "cakap", "mahir"],
                },
              },
            },
            required: ["diagnostik", "formatif", "sumatif", "rubrikKriteria"],
          },
          remedialPengayaan: {
            type: Type.OBJECT,
            properties: {
              remedial: { type: Type.STRING },
              pengayaan: { type: Type.STRING },
            },
            required: ["remedial", "pengayaan"],
          },
          refleksi: {
            type: Type.OBJECT,
            properties: {
              refleksiGuru: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              refleksiSiswa: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
            },
            required: ["refleksiGuru", "refleksiSiswa"],
          },
          glosarium: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                istilah: { type: Type.STRING },
                arti: { type: Type.STRING },
              },
              required: ["istilah", "arti"],
            },
          },
          daftarPustaka: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
        },
        required: [
          "title",
          "mataPelajaran",
          "fase",
          "semester",
          "alokasiWaktu",
          "topik",
          "elemenCP",
          "capaianPembelajaran",
          "tujuanPembelajaran",
          "alurTujuanPembelajaran",
          "pemahamanBermakna",
          "pertanyaanPemantik",
          "profilPelajarPancasila",
          "modelPembelajaran",
          "diferensiasi",
          "kegiatanPembelajaran",
          "asesmen",
          "remedialPengayaan",
          "refleksi",
          "glosarium",
          "daftarPustaka",
        ],
      },
    });

    const parsed = JSON.parse(jsonText || "{}");
    const result = {
      id: "rpp-" + Date.now(),
      ...parsed,
      namaGuru: namaGuru || "Guru Mata Pelajaran, S.Pd",
      nipGuru: nipGuru || "19850101 201001 1 005",
      namaKepsek: namaKepsek || "Drs. H. Sudirman, M.Pd",
      nipKepsek: nipKepsek || "19680512 199412 1 002",
      createdAt: new Date().toISOString(),
    };

    res.json(result);
  } catch (error: any) {
    console.error("Error generating RPP:", error);
    res.status(500).json({ error: error.message || "Gagal membuat RPP dengan AI" });
  }
});

// 2. Endpoint Generate LKPD (Lembar Kerja Peserta Didik)
app.post("/api/generate-lkpd", async (req, res) => {
  try {
    const {
      mataPelajaran,
      faseKelas,
      topik,
      tujuanPembelajaran,
      modelPembelajaran,
      tipeAktivitas,
      konteksLokal,
      rppRef,
    } = req.body;

    const ai = getGeminiClient();

    const prompt = `
Buatlah Lembar Kerja Peserta Didik (LKPD) Interaktif dan Menantang Berbasis Kurikulum Merdeka untuk siswa SMA Negeri 1 Lampasio dengan data:
- Mata Pelajaran: ${mataPelajaran}
- Fase / Kelas: ${faseKelas}
- Topik / Materi: ${topik}
- Tujuan Pembelajaran: ${Array.isArray(tujuanPembelajaran) ? tujuanPembelajaran.join("; ") : tujuanPembelajaran || "Siswa mampu memahami konsep dan menerapkan dalam pemecahan masalah"}
- Model / Tipe Aktivitas: ${tipeAktivitas || modelPembelajaran || "Diskusi Kelompok & Analisis Kasus Kontekstual"}
- Integrasi Konteks Lokal Tolitoli / Lampasio: ${konteksLokal || "Contoh nyata di lingkungan Lampasio/Tolitoli seperti potensi perkebunan, kelautan, atau teknologi lokal"}

LKPD harus terstruktur dengan:
1. Petunjuk belajar yang jelas
2. Stimulus berupa studi kasus/bacaan/data menarik
3. Pertanyaan diskusi tingkat tinggi (HOTS - Analisis, Evaluasi, Kreasi)
4. Tugas pemecahan masalah / proyek kecil
5. Kesimpulan terarah
6. Rubrik penskoran dan kunci jawaban pedoman guru
`;

    const jsonText = await generateContentWithRetry(ai, {
      contents: prompt,
      systemInstruction: SMAN1_LAMPASIO_CONTEXT,
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          mataPelajaran: { type: Type.STRING },
          faseKelas: { type: Type.STRING },
          alokasiWaktu: { type: Type.STRING },
          petunjukBelajar: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
          tujuanAktivitas: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
          stimulusMateri: { type: Type.STRING },
          alatBahan: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
          langkahKerja: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
          pertanyaanDiskusi: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                no: { type: Type.INTEGER },
                pertanyaan: { type: Type.STRING },
                ruangJawaban: { type: Type.STRING },
                skorMaks: { type: Type.INTEGER },
              },
              required: ["no", "pertanyaan", "ruangJawaban", "skorMaks"],
            },
          },
          tugasProyekAtauEksperimen: { type: Type.STRING },
          kesimpulanPanduan: { type: Type.STRING },
          rubrikPenilaianLKPD: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                aspek: { type: Type.STRING },
                kriteria: { type: Type.STRING },
                skorMaks: { type: Type.INTEGER },
              },
              required: ["aspek", "kriteria", "skorMaks"],
            },
          },
          kunciJawabanDanPedomanPenskoran: { type: Type.STRING },
        },
        required: [
          "title",
          "mataPelajaran",
          "faseKelas",
          "alokasiWaktu",
          "petunjukBelajar",
          "tujuanAktivitas",
          "stimulusMateri",
          "alatBahan",
          "langkahKerja",
          "pertanyaanDiskusi",
          "kesimpulanPanduan",
          "rubrikPenilaianLKPD",
          "kunciJawabanDanPedomanPenskoran",
        ],
      },
    });

    const parsed = JSON.parse(jsonText || "{}");
    const result = {
      id: "lkpd-" + Date.now(),
      rppId: rppRef || undefined,
      ...parsed,
      createdAt: new Date().toISOString(),
    };

    res.json(result);
  } catch (error: any) {
    console.error("Error generating LKPD:", error);
    res.status(500).json({ error: error.message || "Gagal membuat LKPD dengan AI" });
  }
});

// 3. Endpoint Generate Sistem Penilaian Daring & Bank Soal
app.post("/api/generate-asesmen", async (req, res) => {
  try {
    const {
      mataPelajaran,
      faseKelas,
      topik,
      tujuanPembelajaran,
      jumlahPilihanGanda,
      jumlahUraian,
      tingkatKesulitan,
    } = req.body;

    const ai = getGeminiClient();

    const prompt = `
Buatlah Paket Penilaian Daring / Asesmen Kurikulum Merdeka Lengkap untuk SMA Negeri 1 Lampasio:
- Mata Pelajaran: ${mataPelajaran}
- Fase / Kelas: ${faseKelas}
- Topik / Materi: ${topik}
- Tujuan Pembelajaran Terkait: ${Array.isArray(tujuanPembelajaran) ? tujuanPembelajaran.join("; ") : tujuanPembelajaran || "Menerapkan dan mengevaluasi pemahaman konsep"}
- Jumlah Soal Pilihan Ganda: ${jumlahPilihanGanda || 5} (dengan 5 opsi A, B, C, D, E)
- Jumlah Soal Uraian / Studi Kasus: ${jumlahUraian || 2}
- Tingkat Kesulitan: ${tingkatKesulitan || "Kombinasi HOTS (C4-C6) dan MOTS (C3)"}

Sertakan:
1. Kriteria Ketercapaian Tujuan Pembelajaran (KKTP) dengan interval nilai dan tindak lanjut intervensi.
2. Soal Pilihan Ganda lengkap dengan kunci dan pembahasan mendalam.
3. Soal Uraian dengan rubrik penskoran analitik.
4. Contoh daftar 10 siswa SMAN 1 Lampasio untuk simulasi penilaian daring otomatis.
`;

    const jsonText = await generateContentWithRetry(ai, {
      contents: prompt,
      systemInstruction: SMAN1_LAMPASIO_CONTEXT,
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          mataPelajaran: { type: Type.STRING },
          faseKelas: { type: Type.STRING },
          kktpInterval: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                batasBawah: { type: Type.INTEGER },
                batasAtas: { type: Type.INTEGER },
                predikat: { type: Type.STRING },
                intervensi: { type: Type.STRING },
              },
              required: ["batasBawah", "batasAtas", "predikat", "intervensi"],
            },
          },
          soalKuis: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                no: { type: Type.INTEGER },
                tipe: { type: Type.STRING },
                pertanyaan: { type: Type.STRING },
                pilihan: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      key: { type: Type.STRING },
                      text: { type: Type.STRING },
                    },
                    required: ["key", "text"],
                  },
                },
                kunciJawaban: { type: Type.STRING },
                pembahasan: { type: Type.STRING },
                bobot: { type: Type.INTEGER },
                tujuanPembelajaranTerkait: { type: Type.STRING },
              },
              required: ["id", "no", "tipe", "pertanyaan", "kunciJawaban", "pembahasan", "bobot", "tujuanPembelajaranTerkait"],
            },
          },
          daftarSiswaSMAN1Lampasio: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                nisn: { type: Type.STRING },
                nama: { type: Type.STRING },
                kelas: { type: Type.STRING },
                nilaiFormatif: { type: Type.INTEGER },
                nilaiLKPD: { type: Type.INTEGER },
                nilaiSumatif: { type: Type.INTEGER },
              },
              required: ["id", "nisn", "nama", "kelas", "nilaiFormatif", "nilaiLKPD", "nilaiSumatif"],
            },
          },
        },
        required: ["title", "mataPelajaran", "faseKelas", "kktpInterval", "soalKuis", "daftarSiswaSMAN1Lampasio"],
      },
    });

    const parsed = JSON.parse(jsonText || "{}");
    const result = {
      id: "asesmen-" + Date.now(),
      ...parsed,
      createdAt: new Date().toISOString(),
    };

    res.json(result);
  } catch (error: any) {
    console.error("Error generating asesmen:", error);
    res.status(500).json({ error: error.message || "Gagal membuat Asesmen Daring dengan AI" });
  }
});

// 4. Endpoint Refine Content with AI (Koreksi / Perluas / Modifikasi)
app.post("/api/refine-content", async (req, res) => {
  try {
    const { originalText, instruction, type } = req.body;
    const ai = getGeminiClient();

    const prompt = `
Berikut adalah konten ${type || "dokumen pembelajaran"} SMAN 1 Lampasio:
---
${originalText}
---

Instruksi guru untuk merevisi/mengoptimalkan konten:
${instruction}

Berikan versi yang sudah disempurnakan sesuai dengan kaidah Kurikulum Merdeka dan karakter siswa SMAN 1 Lampasio. Kembalikan dalam format JSON: { "improvedText": "..." }
`;

    const jsonText = await generateContentWithRetry(ai, {
      contents: prompt,
      systemInstruction: SMAN1_LAMPASIO_CONTEXT,
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          improvedText: { type: Type.STRING },
        },
        required: ["improvedText"],
      },
    });

    const parsed = JSON.parse(jsonText || "{}");
    res.json(parsed);
  } catch (error: any) {
    console.error("Error refining content:", error);
    res.status(500).json({ error: error.message || "Gagal menyempurnakan konten" });
  }
});

// Vite middleware & Static serving
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`SMA Negeri 1 Lampasio AI App running on port ${PORT}`);
  });
}

startServer();
