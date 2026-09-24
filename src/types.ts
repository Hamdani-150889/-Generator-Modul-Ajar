export type TabType = 'rpp' | 'lkpd' | 'asesmen' | 'arsip' | 'admin';

export interface DataKelas {
  id: string;
  namaKelas: string;
  tingkat: 'X' | 'XI' | 'XII';
  fase: 'Fase E (Kelas X)' | 'Fase F (Kelas XI)' | 'Fase F (Kelas XII)' | 'Fase E & F';
  jurusan: 'Umum / Fondasi' | 'MIPA' | 'IPS' | 'Bahasa' | 'Pilihan Vokasi';
  waliKelas: string;
  nipWaliKelas: string;
  jumlahSiswa: number;
  ruangKelas: string;
  tahunAjaran: string;
  keterangan?: string;
}

export interface TeacherUser {
  id: string;
  username: string;
  password?: string;
  namaLengkap: string;
  nip: string;
  mataPelajaran: string;
  rumpunMapel: 'MIPA' | 'IPS' | 'Bahasa' | 'Umum & Vokasi' | 'Manajemen & Konseling';
  faseDefault: string;
  email: string;
  role: 'guru' | 'kepsek' | 'admin';
  statusKepegawaian?: 'PNS' | 'PPPK' | 'GTT / Honorer' | 'Guru Penggerak';
  avatarBgColor?: string;
}

export interface SchoolProfile {
  namaSekolah: string;
  npsn: string;
  kabupaten: string;
  provinsi: string;
  alamat: string;
  namaKepalaSekolah: string;
  nipKepalaSekolah: string;
  namaGuru: string;
  nipGuru: string;
  mataPelajaranDefault: string;
  tahunPelajaran: string;
  semester: 'Ganjil' | 'Genap';
}

export interface Diferensiasi {
  konten: string;
  proses: string;
  produk: string;
}

export interface TahapKegiatan {
  tahap: string;
  aktivitas: string;
  diferensiasi?: string;
}

export interface RubrikKriteria {
  kriteria: string;
  baruBerkembang: string;
  layak: string;
  cakap: string;
  mahir: string;
}

export interface RppModulAjar {
  id: string;
  title: string;
  mataPelajaran: string;
  fase: string;
  semester: string;
  alokasiWaktu: string;
  topik: string;
  elemenCP: string;
  capaianPembelajaran: string;
  tujuanPembelajaran: string[];
  alurTujuanPembelajaran: string;
  pemahamanBermakna: string[];
  pertanyaanPemantik: string[];
  profilPelajarPancasila: string[];
  saranaPrasarana: string[];
  targetPesertaDidik: string;
  modelPembelajaran: string;
  metodePembelajaran: string[];
  diferensiasi: Diferensiasi;
  kegiatanPembelajaran: {
    pendahuluan: { durasi: string; langkah: string[] };
    inti: {
      sintaks: string;
      tahapan: TahapKegiatan[];
    };
    penutup: { durasi: string; langkah: string[] };
  };
  asesmen: {
    diagnostik: string;
    formatif: string;
    sumatif: string;
    rubrikKriteria: RubrikKriteria[];
  };
  remedialPengayaan: {
    remedial: string;
    pengayaan: string;
  };
  refleksi: {
    refleksiGuru: string[];
    refleksiSiswa: string[];
  };
  glosarium: { istilah: string; arti: string }[];
  daftarPustaka: string[];
  namaGuru?: string;
  nipGuru?: string;
  namaKepsek?: string;
  nipKepsek?: string;
  createdAt: string;
}

export interface PertanyaanDiskusiLKPD {
  no: number;
  pertanyaan: string;
  ruangJawaban: string;
  skorMaks: number;
}

export interface RubrikLKPD {
  aspek: string;
  kriteria: string;
  skorMaks: number;
}

export interface LKPDDocument {
  id: string;
  rppId?: string;
  title: string;
  mataPelajaran: string;
  faseKelas: string;
  alokasiWaktu: string;
  petunjukBelajar: string[];
  tujuanAktivitas: string[];
  stimulusMateri: string;
  alatBahan: string[];
  langkahKerja: string[];
  pertanyaanDiskusi: PertanyaanDiskusiLKPD[];
  tugasProyekAtauEksperimen?: string;
  kesimpulanPanduan: string;
  rubrikPenilaianLKPD: RubrikLKPD[];
  kunciJawabanDanPedomanPenskoran: string;
  namaGuru?: string;
  nipGuru?: string;
  createdAt: string;
}

export interface OpsiPilihanGanda {
  key: string;
  text: string;
}

export interface SoalPenilaian {
  id: string;
  no: number;
  tipe: 'pilihan_ganda' | 'uraian' | 'studi_kasus' | string;
  pertanyaan: string;
  pilihan?: OpsiPilihanGanda[];
  kunciJawaban: string;
  pembahasan: string;
  bobot: number;
  tujuanPembelajaranTerkait: string;
}

export interface KKTPInterval {
  batasBawah: number;
  batasAtas: number;
  predikat: string;
  intervensi: string;
}

export interface DataNilaiSiswa {
  id: string;
  nisn: string;
  nama: string;
  kelas: string;
  nilaiFormatif: number;
  nilaiLKPD: number;
  nilaiSumatif: number;
  nilaiAkhir?: number;
  statusKetercapaian?: string;
  catatanGuru?: string;
}

export interface AsesmenDaringPackage {
  id: string;
  rppId?: string;
  title: string;
  mataPelajaran: string;
  faseKelas: string;
  kktpInterval: KKTPInterval[];
  soalKuis: SoalPenilaian[];
  daftarSiswaSMAN1Lampasio: DataNilaiSiswa[];
  createdAt: string;
}
