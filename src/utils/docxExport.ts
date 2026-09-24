import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
  AlignmentType,
  BorderStyle,
  HeadingLevel,
  UnderlineType,
} from 'docx';
import { RppModulAjar, LKPDDocument, SchoolProfile } from '../types';

// Helper to trigger browser download
function saveDocxBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Generate Official Word (.docx) for RPP / Modul Ajar
export async function exportRppToDocx(rpp: RppModulAjar, profile: SchoolProfile) {
  const tableBorderNone = {
    top: { style: BorderStyle.NONE, size: 0, color: 'auto' },
    bottom: { style: BorderStyle.NONE, size: 0, color: 'auto' },
    left: { style: BorderStyle.NONE, size: 0, color: 'auto' },
    right: { style: BorderStyle.NONE, size: 0, color: 'auto' },
    insideHorizontal: { style: BorderStyle.NONE, size: 0, color: 'auto' },
    insideVertical: { style: BorderStyle.NONE, size: 0, color: 'auto' },
  };

  const tableBorderGrid = {
    top: { style: BorderStyle.SINGLE, size: 4, color: '000000' },
    bottom: { style: BorderStyle.SINGLE, size: 4, color: '000000' },
    left: { style: BorderStyle.SINGLE, size: 4, color: '000000' },
    right: { style: BorderStyle.SINGLE, size: 4, color: '000000' },
    insideHorizontal: { style: BorderStyle.SINGLE, size: 4, color: 'CCCCCC' },
    insideVertical: { style: BorderStyle.SINGLE, size: 4, color: 'CCCCCC' },
  };

  // Header Kop Surat
  const kopParagraphs = [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: 'PEMERINTAH PROVINSI SULAWESI TENGAH',
          bold: true,
          size: 24, // 12pt
          font: 'Times New Roman',
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: 'DINAS PENDIDIKAN DAN KEBUDAYAAN',
          bold: true,
          size: 26, // 13pt
          font: 'Times New Roman',
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: profile.namaSekolah.toUpperCase(),
          bold: true,
          size: 28, // 14pt
          font: 'Times New Roman',
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: `${profile.alamat} | NPSN: ${profile.npsn}`,
          italics: true,
          size: 18, // 9pt
          font: 'Times New Roman',
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: '================================================================================',
          bold: true,
          size: 20,
          font: 'Times New Roman',
        }),
      ],
    }),
    new Paragraph({ text: '' }),
  ];

  // Document Title
  const titleParagraph = new Paragraph({
    alignment: AlignmentType.CENTER,
    children: [
      new TextRun({
        text: 'MODUL AJAR / RENCANA PELAKSANAAN PEMBELAJARAN (RPP)',
        bold: true,
        size: 26,
        underline: { type: UnderlineType.SINGLE },
        font: 'Times New Roman',
      }),
    ],
  });

  const subTitleParagraph = new Paragraph({
    alignment: AlignmentType.CENTER,
    children: [
      new TextRun({
        text: `KURIKULUM MERDEKA - TAHUN AJARAN ${profile.tahunPelajaran}`,
        bold: true,
        size: 22,
        font: 'Times New Roman',
      }),
    ],
  });

  // Metadata Table Rows
  const metadataRows = [
    ['Nama Satuan Pendidikan', `: ${profile.namaSekolah}`],
    ['Nama Penyusun / Guru', `: ${rpp.namaGuru || profile.namaGuru}`],
    ['Mata Pelajaran', `: ${rpp.mataPelajaran}`],
    ['Fase / Kelas / Semester', `: ${rpp.fase} / Semester ${rpp.semester || profile.semester}`],
    ['Alokasi Waktu', `: ${rpp.alokasiWaktu}`],
    ['Elemen Capaian', `: ${rpp.elemenCP}`],
    ['Topik / Materi Pokok', `: ${rpp.topik}`],
    ['Model Pembelajaran', `: ${rpp.modelPembelajaran}`],
    ['Target Peserta Didik', `: ${rpp.targetPesertaDidik}`],
  ].map(
    ([label, val]) =>
      new TableRow({
        children: [
          new TableCell({
            width: { size: 3000, type: WidthType.DXA },
            children: [new Paragraph({ children: [new TextRun({ text: label, bold: true, size: 20, font: 'Times New Roman' })] })],
          }),
          new TableCell({
            width: { size: 6500, type: WidthType.DXA },
            children: [new Paragraph({ children: [new TextRun({ text: val, size: 20, font: 'Times New Roman' })] })],
          }),
        ],
      })
  );

  const metadataTable = new Table({
    width: { size: 9500, type: WidthType.DXA },
    borders: tableBorderNone,
    rows: metadataRows,
  });

  // Section Builder Helpers
  function createSectionHeader(title: string) {
    return new Paragraph({
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 240, after: 120 },
      children: [
        new TextRun({
          text: title,
          bold: true,
          size: 22,
          color: '1E3A8A',
          font: 'Times New Roman',
        }),
      ],
    });
  }

  function createBullet(text: string) {
    return new Paragraph({
      bullet: { level: 0 },
      spacing: { after: 60 },
      children: [new TextRun({ text, size: 20, font: 'Times New Roman' })],
    });
  }

  // Kegiatan Inti Tahapan Rows
  const kegiatanRows = [
    new TableRow({
      children: [
        new TableCell({
          width: { size: 2800, type: WidthType.DXA },
          children: [new Paragraph({ children: [new TextRun({ text: 'Sintaks / Tahap', bold: true, size: 20, font: 'Times New Roman' })] })],
        }),
        new TableCell({
          width: { size: 6700, type: WidthType.DXA },
          children: [new Paragraph({ children: [new TextRun({ text: 'Aktivitas Pembelajaran & Diferensiasi', bold: true, size: 20, font: 'Times New Roman' })] })],
        }),
      ],
    }),
    ...rpp.kegiatanPembelajaran.inti.tahapan.map(
      (t) =>
        new TableRow({
          children: [
            new TableCell({
              width: { size: 2800, type: WidthType.DXA },
              children: [new Paragraph({ children: [new TextRun({ text: t.tahap, bold: true, size: 20, font: 'Times New Roman' })] })],
            }),
            new TableCell({
              width: { size: 6700, type: WidthType.DXA },
              children: [
                new Paragraph({ children: [new TextRun({ text: t.aktivitas, size: 20, font: 'Times New Roman' })] }),
                ...(t.diferensiasi
                  ? [
                      new Paragraph({
                        children: [
                          new TextRun({ text: `*Diferensiasi: ${t.diferensiasi}`, italics: true, size: 18, color: '059669', font: 'Times New Roman' }),
                        ],
                      }),
                    ]
                  : []),
              ],
            }),
          ],
        })
    ),
  ];

  const kegiatanTable = new Table({
    width: { size: 9500, type: WidthType.DXA },
    borders: tableBorderGrid,
    rows: kegiatanRows,
  });

  // Rubrik Asesmen Rows
  const rubrikRows = [
    new TableRow({
      children: [
        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Kriteria', bold: true, size: 18, font: 'Times New Roman' })] })] }),
        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Baru Berkembang (0-60)', bold: true, size: 18, font: 'Times New Roman' })] })] }),
        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Layak (61-74)', bold: true, size: 18, font: 'Times New Roman' })] })] }),
        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Cakap (75-88)', bold: true, size: 18, font: 'Times New Roman' })] })] }),
        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Mahir (89-100)', bold: true, size: 18, font: 'Times New Roman' })] })] }),
      ],
    }),
    ...rpp.asesmen.rubrikKriteria.map(
      (r) =>
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: r.kriteria, bold: true, size: 18, font: 'Times New Roman' })] })] }),
            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: r.baruBerkembang, size: 18, font: 'Times New Roman' })] })] }),
            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: r.layak, size: 18, font: 'Times New Roman' })] })] }),
            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: r.cakap, size: 18, font: 'Times New Roman' })] })] }),
            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: r.mahir, size: 18, font: 'Times New Roman' })] })] }),
          ],
        })
    ),
  ];

  const rubrikTable = new Table({
    width: { size: 9500, type: WidthType.DXA },
    borders: tableBorderGrid,
    rows: rubrikRows,
  });

  // Tanda Tangan Resmi
  const signatureTable = new Table({
    width: { size: 9500, type: WidthType.DXA },
    borders: tableBorderNone,
    rows: [
      new TableRow({
        children: [
          new TableCell({
            width: { size: 5000, type: WidthType.DXA },
            children: [
              new Paragraph({ children: [new TextRun({ text: 'Mengetahui,', size: 20, font: 'Times New Roman' })] }),
              new Paragraph({ children: [new TextRun({ text: 'Kepala SMA Negeri 1 Lampasio', bold: true, size: 20, font: 'Times New Roman' })] }),
              new Paragraph({ text: '', spacing: { after: 900 } }),
              new Paragraph({ children: [new TextRun({ text: rpp.namaKepsek || profile.namaKepalaSekolah, bold: true, underline: { type: UnderlineType.SINGLE }, size: 20, font: 'Times New Roman' })] }),
              new Paragraph({ children: [new TextRun({ text: `NIP. ${rpp.nipKepsek || profile.nipKepalaSekolah}`, size: 20, font: 'Times New Roman' })] }),
            ],
          }),
          new TableCell({
            width: { size: 4500, type: WidthType.DXA },
            children: [
              new Paragraph({ children: [new TextRun({ text: `Lampasio, ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}`, size: 20, font: 'Times New Roman' })] }),
              new Paragraph({ children: [new TextRun({ text: 'Guru Mata Pelajaran,', bold: true, size: 20, font: 'Times New Roman' })] }),
              new Paragraph({ text: '', spacing: { after: 900 } }),
              new Paragraph({ children: [new TextRun({ text: rpp.namaGuru || profile.namaGuru, bold: true, underline: { type: UnderlineType.SINGLE }, size: 20, font: 'Times New Roman' })] }),
              new Paragraph({ children: [new TextRun({ text: `NIP. ${rpp.nipGuru || profile.nipGuru}`, size: 20, font: 'Times New Roman' })] }),
            ],
          }),
        ],
      }),
    ],
  });

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: { top: 1200, bottom: 1200, left: 1440, right: 1440 },
          },
        },
        children: [
          ...kopParagraphs,
          titleParagraph,
          subTitleParagraph,
          new Paragraph({ text: '', spacing: { after: 180 } }),
          createSectionHeader('I. INFORMASI UMUM & IDENTITAS MODUL'),
          metadataTable,
          new Paragraph({ text: '', spacing: { after: 120 } }),
          new Paragraph({
            children: [
              new TextRun({ text: 'Profil Pelajar Pancasila: ', bold: true, size: 20, font: 'Times New Roman' }),
              new TextRun({ text: rpp.profilPelajarPancasila.join(', '), size: 20, font: 'Times New Roman' }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: 'Sarana & Prasarana: ', bold: true, size: 20, font: 'Times New Roman' }),
              new TextRun({ text: rpp.saranaPrasarana.join(', '), size: 20, font: 'Times New Roman' }),
            ],
          }),
          new Paragraph({ text: '', spacing: { after: 180 } }),
          createSectionHeader('II. KOMPONEN INTI PEMBELAJARAN'),
          new Paragraph({
            children: [
              new TextRun({ text: 'A. Capaian Pembelajaran (CP):', bold: true, size: 20, font: 'Times New Roman' }),
            ],
          }),
          new Paragraph({ children: [new TextRun({ text: rpp.capaianPembelajaran, size: 20, font: 'Times New Roman' })] }),
          new Paragraph({ text: '', spacing: { after: 100 } }),
          new Paragraph({
            children: [
              new TextRun({ text: 'B. Alur Tujuan Pembelajaran (ATP):', bold: true, size: 20, font: 'Times New Roman' }),
            ],
          }),
          new Paragraph({ children: [new TextRun({ text: rpp.alurTujuanPembelajaran, size: 20, font: 'Times New Roman' })] }),
          new Paragraph({ text: '', spacing: { after: 100 } }),
          new Paragraph({
            children: [
              new TextRun({ text: 'C. Tujuan Pembelajaran (TP):', bold: true, size: 20, font: 'Times New Roman' }),
            ],
          }),
          ...rpp.tujuanPembelajaran.map((tp) => createBullet(tp)),
          new Paragraph({ text: '', spacing: { after: 100 } }),
          new Paragraph({
            children: [
              new TextRun({ text: 'D. Pemahaman Bermakna:', bold: true, size: 20, font: 'Times New Roman' }),
            ],
          }),
          ...rpp.pemahamanBermakna.map((pm) => createBullet(pm)),
          new Paragraph({ text: '', spacing: { after: 100 } }),
          new Paragraph({
            children: [
              new TextRun({ text: 'E. Pertanyaan Pemantik:', bold: true, size: 20, font: 'Times New Roman' }),
            ],
          }),
          ...rpp.pertanyaanPemantik.map((pp) => createBullet(pp)),
          new Paragraph({ text: '', spacing: { after: 100 } }),
          new Paragraph({
            children: [
              new TextRun({ text: 'F. Rencana Pembelajaran Berdiferensiasi:', bold: true, size: 20, font: 'Times New Roman' }),
            ],
          }),
          createBullet(`Diferensiasi Konten: ${rpp.diferensiasi.konten}`),
          createBullet(`Diferensiasi Proses: ${rpp.diferensiasi.proses}`),
          createBullet(`Diferensiasi Produk: ${rpp.diferensiasi.produk}`),
          new Paragraph({ text: '', spacing: { after: 180 } }),
          createSectionHeader('III. SKENARIO / KEGIATAN PEMBELAJARAN'),
          new Paragraph({
            children: [
              new TextRun({ text: `A. Kegiatan Pendahuluan (${rpp.kegiatanPembelajaran.pendahuluan.durasi}):`, bold: true, size: 20, font: 'Times New Roman' }),
            ],
          }),
          ...rpp.kegiatanPembelajaran.pendahuluan.langkah.map((l) => createBullet(l)),
          new Paragraph({ text: '', spacing: { after: 100 } }),
          new Paragraph({
            children: [
              new TextRun({ text: `B. Kegiatan Inti (${rpp.kegiatanPembelajaran.inti.sintaks}):`, bold: true, size: 20, font: 'Times New Roman' }),
            ],
          }),
          kegiatanTable,
          new Paragraph({ text: '', spacing: { after: 100 } }),
          new Paragraph({
            children: [
              new TextRun({ text: `C. Kegiatan Penutup (${rpp.kegiatanPembelajaran.penutup.durasi}):`, bold: true, size: 20, font: 'Times New Roman' }),
            ],
          }),
          ...rpp.kegiatanPembelajaran.penutup.langkah.map((l) => createBullet(l)),
          new Paragraph({ text: '', spacing: { after: 180 } }),
          createSectionHeader('IV. ASESMEN & KRITERIA KETERCAPAIAN (KKTP)'),
          createBullet(`Asesmen Awal / Diagnostik: ${rpp.asesmen.diagnostik}`),
          createBullet(`Asesmen Formatif: ${rpp.asesmen.formatif}`),
          createBullet(`Asesmen Sumatif: ${rpp.asesmen.sumatif}`),
          new Paragraph({ text: '', spacing: { after: 100 } }),
          new Paragraph({
            children: [
              new TextRun({ text: 'Rubrik Penilaian Ketercapaian TP (KKTP):', bold: true, size: 20, font: 'Times New Roman' }),
            ],
          }),
          rubrikTable,
          new Paragraph({ text: '', spacing: { after: 180 } }),
          createSectionHeader('V. PENGAYAAN & REMEDIAL'),
          createBullet(`Program Remedial: ${rpp.remedialPengayaan.remedial}`),
          createBullet(`Program Pengayaan: ${rpp.remedialPengayaan.pengayaan}`),
          new Paragraph({ text: '', spacing: { after: 180 } }),
          createSectionHeader('VI. GLOSARIUM & DAFTAR PUSTAKA'),
          ...rpp.glosarium.map((g) => createBullet(`${g.istilah}: ${g.arti}`)),
          new Paragraph({ text: '', spacing: { after: 100 } }),
          new Paragraph({
            children: [
              new TextRun({ text: 'Daftar Pustaka:', bold: true, size: 20, font: 'Times New Roman' }),
            ],
          }),
          ...rpp.daftarPustaka.map((dp) => createBullet(dp)),
          new Paragraph({ text: '', spacing: { after: 360 } }),
          signatureTable,
        ],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  const cleanTitle = (rpp.title || 'RPP_SMAN1_Lampasio').replace(/[^a-zA-Z0-9_-]/g, '_');
  saveDocxBlob(blob, `${cleanTitle}.docx`);
}

// Generate Official Word (.docx) for LKPD
export async function exportLkpdToDocx(lkpd: LKPDDocument, profile: SchoolProfile) {
  const tableBorderNone = {
    top: { style: BorderStyle.NONE, size: 0, color: 'auto' },
    bottom: { style: BorderStyle.NONE, size: 0, color: 'auto' },
    left: { style: BorderStyle.NONE, size: 0, color: 'auto' },
    right: { style: BorderStyle.NONE, size: 0, color: 'auto' },
  };

  const tableBorderGrid = {
    top: { style: BorderStyle.SINGLE, size: 4, color: '000000' },
    bottom: { style: BorderStyle.SINGLE, size: 4, color: '000000' },
    left: { style: BorderStyle.SINGLE, size: 4, color: '000000' },
    right: { style: BorderStyle.SINGLE, size: 4, color: '000000' },
    insideHorizontal: { style: BorderStyle.SINGLE, size: 4, color: 'CCCCCC' },
    insideVertical: { style: BorderStyle.SINGLE, size: 4, color: 'CCCCCC' },
  };

  // Header Kop Surat
  const kopParagraphs = [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: 'PEMERINTAH PROVINSI SULAWESI TENGAH',
          bold: true,
          size: 24,
          font: 'Times New Roman',
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: 'DINAS PENDIDIKAN DAN KEBUDAYAAN',
          bold: true,
          size: 26,
          font: 'Times New Roman',
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: profile.namaSekolah.toUpperCase(),
          bold: true,
          size: 28,
          font: 'Times New Roman',
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: `${profile.alamat} | NPSN: ${profile.npsn}`,
          italics: true,
          size: 18,
          font: 'Times New Roman',
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: '================================================================================',
          bold: true,
          size: 20,
          font: 'Times New Roman',
        }),
      ],
    }),
    new Paragraph({ text: '' }),
  ];

  // Identitas Siswa Box
  const studentInfoRows = [
    ['Mata Pelajaran', `: ${lkpd.mataPelajaran}`, 'Nama Kelompok', ': ..........................................'],
    ['Fase / Kelas', `: ${lkpd.faseKelas}`, 'Nama Anggota', ': 1. ........................................'],
    ['Alokasi Waktu', `: ${lkpd.alokasiWaktu}`, '', '  2. ........................................'],
    ['Tahun Ajaran', `: ${profile.tahunPelajaran}`, '', '  3. ........................................'],
    ['Guru Pengampu', `: ${lkpd.namaGuru || profile.namaGuru}`, '', '  4. ........................................'],
  ].map(
    ([l1, v1, l2, v2]) =>
      new TableRow({
        children: [
          new TableCell({
            width: { size: 2000, type: WidthType.DXA },
            children: [new Paragraph({ children: [new TextRun({ text: l1, bold: true, size: 18, font: 'Times New Roman' })] })],
          }),
          new TableCell({
            width: { size: 2800, type: WidthType.DXA },
            children: [new Paragraph({ children: [new TextRun({ text: v1, size: 18, font: 'Times New Roman' })] })],
          }),
          new TableCell({
            width: { size: 1800, type: WidthType.DXA },
            children: [new Paragraph({ children: [new TextRun({ text: l2, bold: true, size: 18, font: 'Times New Roman' })] })],
          }),
          new TableCell({
            width: { size: 2900, type: WidthType.DXA },
            children: [new Paragraph({ children: [new TextRun({ text: v2, size: 18, font: 'Times New Roman' })] })],
          }),
        ],
      })
  );

  const studentInfoTable = new Table({
    width: { size: 9500, type: WidthType.DXA },
    borders: tableBorderGrid,
    rows: studentInfoRows,
  });

  const rubrikRows = [
    new TableRow({
      children: [
        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Aspek Penilaian', bold: true, size: 18, font: 'Times New Roman' })] })] }),
        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Kriteria Ketercapaian', bold: true, size: 18, font: 'Times New Roman' })] })] }),
        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Skor Maks', bold: true, size: 18, font: 'Times New Roman' })] })] }),
      ],
    }),
    ...lkpd.rubrikPenilaianLKPD.map(
      (r) =>
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: r.aspek, bold: true, size: 18, font: 'Times New Roman' })] })] }),
            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: r.kriteria, size: 18, font: 'Times New Roman' })] })] }),
            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: String(r.skorMaks), size: 18, font: 'Times New Roman' })] })] }),
          ],
        })
    ),
  ];

  const rubrikTable = new Table({
    width: { size: 9500, type: WidthType.DXA },
    borders: tableBorderGrid,
    rows: rubrikRows,
  });

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: { top: 1200, bottom: 1200, left: 1440, right: 1440 },
          },
        },
        children: [
          ...kopParagraphs,
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: 'LEMBAR KERJA PESERTA DIDIK (LKPD)',
                bold: true,
                size: 26,
                underline: { type: UnderlineType.SINGLE },
                font: 'Times New Roman',
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: lkpd.title.toUpperCase(),
                bold: true,
                size: 22,
                font: 'Times New Roman',
              }),
            ],
          }),
          new Paragraph({ text: '', spacing: { after: 180 } }),
          studentInfoTable,
          new Paragraph({ text: '', spacing: { after: 180 } }),
          new Paragraph({
            children: [
              new TextRun({ text: 'A. PETUNJUK BELAJAR', bold: true, size: 20, font: 'Times New Roman' }),
            ],
          }),
          ...lkpd.petunjukBelajar.map(
            (p) =>
              new Paragraph({
                bullet: { level: 0 },
                children: [new TextRun({ text: p, size: 20, font: 'Times New Roman' })],
              })
          ),
          new Paragraph({ text: '', spacing: { after: 140 } }),
          new Paragraph({
            children: [
              new TextRun({ text: 'B. TUJUAN AKTIVITAS PEMBELAJARAN', bold: true, size: 20, font: 'Times New Roman' }),
            ],
          }),
          ...lkpd.tujuanAktivitas.map(
            (t) =>
              new Paragraph({
                bullet: { level: 0 },
                children: [new TextRun({ text: t, size: 20, font: 'Times New Roman' })],
              })
          ),
          new Paragraph({ text: '', spacing: { after: 140 } }),
          new Paragraph({
            children: [
              new TextRun({ text: 'C. STIMULUS MATERI / STUDI KASUS KONTEKSTUAL', bold: true, size: 20, font: 'Times New Roman' }),
            ],
          }),
          new Paragraph({
            children: [new TextRun({ text: lkpd.stimulusMateri, size: 20, font: 'Times New Roman' })],
          }),
          new Paragraph({ text: '', spacing: { after: 140 } }),
          new Paragraph({
            children: [
              new TextRun({ text: 'D. LANGKAH KERJA & INVESTIGASI', bold: true, size: 20, font: 'Times New Roman' }),
            ],
          }),
          ...lkpd.langkahKerja.map(
            (l) =>
              new Paragraph({
                bullet: { level: 0 },
                children: [new TextRun({ text: l, size: 20, font: 'Times New Roman' })],
              })
          ),
          new Paragraph({ text: '', spacing: { after: 140 } }),
          new Paragraph({
            children: [
              new TextRun({ text: 'E. PERTANYAAN DISKUSI & ANALISIS (LEMBAR JAWABAN)', bold: true, size: 20, font: 'Times New Roman' }),
            ],
          }),
          ...lkpd.pertanyaanDiskusi.flatMap((q) => [
            new Paragraph({
              spacing: { before: 120 },
              children: [
                new TextRun({ text: `Soal No. ${q.no} [Skor Maks: ${q.skorMaks}]: `, bold: true, size: 20, font: 'Times New Roman' }),
                new TextRun({ text: q.pertanyaan, size: 20, font: 'Times New Roman' }),
              ],
            }),
            new Paragraph({
              children: [
                new TextRun({ text: 'Jawaban Siswa / Kelompok:', italics: true, size: 18, color: '666666', font: 'Times New Roman' }),
              ],
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: q.ruangJawaban || '....................................................................................................................................................................................................................................................................................................................................',
                  size: 20,
                  font: 'Times New Roman',
                }),
              ],
            }),
          ]),
          new Paragraph({ text: '', spacing: { after: 140 } }),
          new Paragraph({
            children: [
              new TextRun({ text: 'F. KESIMPULAN HASIL BELAJAR', bold: true, size: 20, font: 'Times New Roman' }),
            ],
          }),
          new Paragraph({
            children: [new TextRun({ text: lkpd.kesimpulanPanduan, size: 20, font: 'Times New Roman' })],
          }),
          new Paragraph({ text: '', spacing: { after: 180 } }),
          new Paragraph({
            children: [
              new TextRun({ text: 'G. RUBRIK PENILAIAN LKPD', bold: true, size: 20, font: 'Times New Roman' }),
            ],
          }),
          rubrikTable,
        ],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  const cleanTitle = (lkpd.title || 'LKPD_SMAN1_Lampasio').replace(/[^a-zA-Z0-9_-]/g, '_');
  saveDocxBlob(blob, `${cleanTitle}.docx`);
}
