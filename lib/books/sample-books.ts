import { Book } from '../types';

export const SAMPLE_BOOKS: Book[] = [
  {
    id: 'biologi-sma-11',
    title: 'Biologi untuk SMA/MA Kelas XI',
    subject: 'Biologi',
    grade: 'Kelas 11 SMA',
    badge: 'Kurikulum Merdeka',
    description: 'Materi sel, transpor zat membran sel, jaringan tumbuhan/hewan, dan metabolisme enzimatis.',
    coverGradient: 'linear-gradient(135deg, #059669 0%, #10b981 50%, #064e3b 100%)',
    sections: [
      {
        id: 'bio-ch1-s1',
        chapter: 'Bab 1: Struktur Sel dan Fungsi Organel',
        title: 'Perbedaan Sel Prokariotik dan Eukariotik',
        page: 14,
        content: `Sel prokariotik adalah sel yang belum memiliki membran inti (nukleus sejati), materi genetiknya (DNA) berada di area yang disebut nukleoid tanpa dibungkus membran. Contoh sel prokariotik adalah bakteri dan arkea. Sebaliknya, sel eukariotik memiliki membran inti sejati yang menyelubungi materi genetik, serta organel-organel bermembran seperti mitokondria, retikulum endoplasma, dan badan golgi. Ukuran sel prokariotik umumnya lebih kecil (0,1-5 μm) dibandingkan eukariotik (10-100 μm).`
      },
      {
        id: 'bio-ch1-s2',
        chapter: 'Bab 1: Struktur Sel dan Fungsi Organel',
        title: 'Fungsi Mitokondria vs Kloroplas',
        page: 21,
        content: `Mitokondria sering disebut 'the powerhouse of cell' karena berfungsi sebagai tempat respirasi seluler aerob untuk menghasilkan energi berupa ATP dari glukosa. Mitokondria terdapat pada hampir semua sel eukariotik (hewan dan tumbuhan). Sedangkan kloroplas adalah plastida bermembran ganda yang mengandung klorofil dan berfungsi khusus untuk fotosintesis (mengubah energi cahaya menjadi energi kimia berupa glukosa), hanya ditemukan pada sel tumbuhan dan alga.`
      },
      {
        id: 'bio-ch2-s1',
        chapter: 'Bab 2: Transpor Melalui Membran Sel',
        title: 'Difusi Sederhana vs Difusi Terfasilitasi',
        page: 38,
        content: `Difusi sederhana adalah perpindahan molekul zat terlarut dari konsentrasi tinggi ke konsentrasi rendah secara spontan menembus membran fosfolipid lapis ganda tanpa bantuan molekul pembawa dan tanpa energi (contoh: difusi gas O2 dan CO2). Sementara itu, difusi terfasilitasi adalah perpindahan molekul dari konsentrasi tinggi ke rendah yang MEMERLUKAN bantuan protein membran (channel protein atau carrier protein) karena molekulnya bersifat polar atau berukuran relatif besar (contoh: masuknya glukosa dan asam amino ke dalam sel). Keduanya sama-sama transpor pasif yang TIDAK memerlukan ATP.`
      },
      {
        id: 'bio-ch2-s2',
        chapter: 'Bab 2: Transpor Melalui Membran Sel',
        title: 'Osmosis dan Tekanan Turgor',
        page: 43,
        content: `Osmosis adalah kasus khusus difusi, yaitu perpindahan pelarut (khususnya air) melalui membran semipermeabel dari larutan berkonsentrasi zat terlarut rendah (hipotonik) menuju larutan berkonsentrasi zat terlarut tinggi (hipertonik) sampai tercapai kesetimbangan. Pada sel tumbuhan dalam kondisi hipotonik, air masuk menyebabkan vakuola membesar dan menekan dinding sel, menciptakan tekanan turgor yang membuat tumbuhan berdiri kokoh. Sebaliknya jika lingkungan hipertonik, sel tumbuhan mengalami plasmolisis.`
      },
      {
        id: 'bio-ch3-s1',
        chapter: 'Bab 3: Enzim dan Metabolisme Sel',
        title: 'Katabolisme vs Anabolisme',
        page: 65,
        content: `Metabolisme dibedakan menjadi dua jalur utama: katabolisme dan anabolisme. Katabolisme adalah reaksi perombakan atau pemecahan senyawa organik kompleks menjadi molekul-molekul sederhana yang bersifat eksergonik (menghasilkan energi bebas berupa ATP), contoh utamanya adalah respirasi aerob dan fermentasi. Anabolisme adalah reaksi penyusunan molekul-molekul sederhana menjadi molekul kompleks yang bersifat endergonik (membutuhkan input energi), contohnya fotosintesis dan kemosintesis.`
      }
    ]
  },
  {
    id: 'fisika-sma-10',
    title: 'Fisika SMA/MA Kelas X',
    subject: 'Fisika',
    grade: 'Kelas 10 SMA',
    badge: 'Buku Siswa Kemdikbud',
    description: 'Mekanika gerak, vektor, Hukum Gerak Newton, gaya gesek, gravitasi, usaha dan energi.',
    coverGradient: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 50%, #1e3a8a 100%)',
    sections: [
      {
        id: 'fis-ch3-s1',
        chapter: 'Bab 3: Dinamika Gerak Partikel (Hukum Newton)',
        title: 'Hukum I Newton (Inersia / Kelembaman)',
        page: 72,
        content: `Hukum I Newton menyatakan bahwa jika resultan gaya yang bekerja pada suatu benda sama dengan nol (ΣF = 0), maka benda yang mula-mula diam akan tetap diam, dan benda yang mula-mula bergerak lurus beraturan akan tetap bergerak lurus beraturan dengan kecepatan konstan. Sifat benda yang mempertahankan keadaan gerak atau diamnya ini disebut sifat kelembaman (inersia). Massa benda merupakan ukuran kuantitatif dari kelembaman benda tersebut.`
      },
      {
        id: 'fis-ch3-s2',
        chapter: 'Bab 3: Dinamika Gerak Partikel (Hukum Newton)',
        title: 'Hukum II Newton dan Percepatan',
        page: 78,
        content: `Hukum II Newton menyatakan bahwa percepatan (a) yang dihasilkan oleh resultan gaya yang bekerja pada suatu benda berbanding lurus dengan resultan gaya (ΣF) dan berbanding terbalik dengan massa benda (m). Secara matematis dirumuskan: a = ΣF / m atau ΣF = m.a. Arah percepatan benda searah dengan resultan gaya yang memengaruhinya.`
      },
      {
        id: 'fis-ch3-s3',
        chapter: 'Bab 3: Dinamika Gerak Partikel (Hukum Newton)',
        title: 'Hukum III Newton: Mengapa Gaya Normal dan Berat Bukan Pasangan Aksi-Reaksi?',
        page: 84,
        content: `Hukum III Newton menyatakan bahwa jika benda A mengerjakan gaya pada benda B (gaya aksi), maka benda B akan mengerjakan gaya pada benda A (gaya reaksi) yang sama besar tetapi berlawanan arah (F_aksi = -F_reaksi). Pasangan aksi-reaksi memiliki syarat mutlak: HARUS bekerja pada DUA BENDA YANG BERBEDA. 
PENTING (Catatan Konseptual): Gaya berat (W = m.g) yang dialami buku di atas meja dan gaya normal (N) dari meja pada buku BUKANLAH pasangan gaya aksi-reaksi! Meskipun nilainya sama besar dan arahnya berlawanan (N = W saat diam), keduanya bekerja pada SATU BENDA YANG SAMA (yaitu buku itu sendiri). Pasangan reaksi dari gaya normal meja pada buku adalah gaya tekan buku pada meja; sedangkan pasangan reaksi dari gaya gravitasi bumi pada buku adalah gaya tarik gravitasi buku pada inti bumi.`
      },
      {
        id: 'fis-ch4-s1',
        chapter: 'Bab 4: Usaha dan Energi',
        title: 'Perbedaan Usaha Positif, Negatif, dan Nol',
        page: 102,
        content: `Secara fisika, usaha (W) dirumuskan W = F . s . cos(θ), dengan θ adalah sudut antara arah gaya (F) dan perpindahan (s). 
1. Usaha positif: Gaya searah perpindahan (0° <= θ < 90°), gaya mempercepat gerak benda.
2. Usaha negatif: Gaya berlawanan arah perpindahan (90° < θ <= 180°), contohnya gaya gesek yang memperlambat laju benda.
3. Usaha bernilai nol: Perpindahan s = 0 (mendorong dinding kokoh), ATAU gaya tegak lurus perpindahan (θ = 90°, cos 90° = 0), contohnya gaya gravitasi saat seseorang berjalan mendatar membawa ransel tidak melakukan usaha terhadap gerak mendatar tersebut.`
      }
    ]
  },
  {
    id: 'sejarah-sma-11',
    title: 'Sejarah Indonesia SMA Kelas XI',
    subject: 'Sejarah',
    grade: 'Kelas 11 SMA',
    badge: 'BSE Kemdikbudristek',
    description: 'Kolonialisme bangsa barat, kebangkitan nasional, pergerakan pemuda, peristiwa Rengasdengklok hingga proklamasi kemerdekaan.',
    coverGradient: 'linear-gradient(135deg, #b91c1c 0%, #ef4444 50%, #7f1d1d 100%)',
    sections: [
      {
        id: 'sej-ch2-s1',
        chapter: 'Bab 2: Pergerakan Kebangsaan Indonesia',
        title: 'Perbedaan Haluan Budi Utomo dan Sarekat Islam',
        page: 54,
        content: `Budi Utomo yang didirikan pada 20 Mei 1908 oleh dr. Soetomo dan para pelajar STOVIA bergerak di bidang sosial, pendidikan, dan kebudayaan. Pada awalnya keanggotaannya bersifat elitis dan terbatas hanya untuk kalangan priyayi dan penduduk Jawa serta Madura, serta bersikap kooperatif terhadap pemerintah kolonial Hindia Belanda.
Sebaliknya, Sarekat Islam (SI) yang bertransformasi dari Sarekat Dagang Islam pada 1912 di bawah kepemimpinan H.O.S. Tjokroaminoto merupakan organisasi massa pertama di Hindia Belanda yang keanggotaannya terbuka untuk seluruh lapisan rakyat pribumi beragama Islam, bergerak di bidang perekonomian rakyat, perbaikan nasib buruh/petani, dan berani mengkritik kebijakan eksploitatif pemerintah kolonial secara terbuka.`
      },
      {
        id: 'sej-ch3-s1',
        chapter: 'Bab 3: Detik-Detik Menuju Kemerdekaan',
        title: 'Peristiwa Rengasdengklok: Perbedaan Golongan Muda dan Golongan Tua',
        page: 98,
        content: `Peristiwa Rengasdengklok terjadi pada tanggal 16 Agustus 1945 dini hari ketika para pemuda (antara lain Sukarni, Wikana, dan Chaerul Saleh) membawa Ir. Soekarno dan Drs. Moh. Hatta ke Rengasdengklok, Karawang. 
Latar belakang perbedaan pendapat:
1. Golongan Muda: Menuntut agar kemerdekaan Indonesia diproklamasikan secepat mungkin tanpa menunggu sidang PPKI, karena PPKI dianggap bentukan militer Jepang sehingga kemerdekaan Indonesia nantinya dicap sebagai 'hadiah dari Jepang'.
2. Golongan Tua (Soekarno, Hatta, Achmad Soebardjo): Menginginkan agar proklamasi dibicarakan terlebih dahulu melalui rapat PPKI agar tidak menimbulkan pertumpahan darah dengan tentara Jepang yang masih bersenjata lengkap di Jakarta.`
      },
      {
        id: 'sej-ch3-s2',
        chapter: 'Bab 3: Detik-Detik Menuju Kemerdekaan',
        title: 'Penyusunan dan Perumusan Teks Proklamasi',
        page: 104,
        content: `Teks Proklamasi dirumuskan di kediaman Laksamana Tadashi Maeda di Jalan Imam Bonjol No. 1 Jakarta pada dini hari 17 Agustus 1945. Kalimat pertama 'Kami bangsa Indonesia dengan ini menjatakan kemerdekaan Indonesia' digagas oleh Achmad Soebardjo. Kalimat kedua mengenai pemindahan kekuasaan diusulkan oleh Moh. Hatta. Konsep teks proklamasi ditulis tangan oleh Ir. Soekarno, kemudian diketik oleh Sayuti Melik dengan beberapa perubahan kata (seperti 'tempoh' menjadi 'tempo', 'wakil-wakil bangsa Indonesia' diubah atas usul Sukarni menjadi 'Atas nama bangsa Indonesia Soekarno-Hatta').`
      }
    ]
  },
  {
    id: 'ppkn-sma-10',
    title: 'Pendidikan Pancasila dan Kewarganegaraan Kelas X',
    subject: 'PPKN',
    grade: 'Kelas 10 SMA',
    badge: 'Kurikulum Merdeka',
    description: 'Nilai-nilai luhur Pancasila, konstitusi UUD 1945, sistem perundang-undangan, dan integrasi nasional.',
    coverGradient: 'linear-gradient(135deg, #7c3aed 0%, #8b5cf6 50%, #5b21b6 100%)',
    sections: [
      {
        id: 'ppkn-ch1-s1',
        chapter: 'Bab 1: Hakikat dan Nilai-Nilai Pancasila',
        title: 'Dimensi Nilai Instrumental vs Nilai Praksis Pancasila',
        page: 25,
        content: `Pancasila sebagai ideologi terbuka memiliki tiga tingkatan nilai:
1. Nilai Dasar: Hakikat kelima sila Pancasila yang bersifat universal, tetap, dan tidak berubah sepanjang masa (Ketuhanan, Kemanusiaan, Persatuan, Kerakyatan, dan Keadilan).
2. Nilai Instrumental: Penjabaran lebih lanjut dari nilai dasar dalam bentuk ketentuan konstitusional, perundang-undangan, kebijakan pemerintah, dan kelembagaan negara yang dapat disesuaikan dengan perkembangan zaman (contoh: UUD NRI 1945, TAP MPR, UU).
3. Nilai Praksis: Realisasi nyata nilai-nilai instrumental dalam kehidupan sehari-hari oleh warga negara dan penyelenggara negara (contoh: gotong royong di lingkungan RT, sikap toleransi antarumat beragama).`
      },
      {
        id: 'ppkn-ch2-s1',
        chapter: 'Bab 2: Hierarki Peraturan Perundang-Undangan',
        title: 'Tata Urutan Peraturan Berdasarkan UU No. 12 Tahun 2011',
        page: 62,
        content: `Berdasarkan Pasal 7 ayat (1) Undang-Undang Republik Indonesia Nomor 12 Tahun 2011 tentang Pembentukan Peraturan Perundang-undangan, jenis dan hierarki peraturan perundang-undangan adalah sebagai berikut dari yang tertinggi:
1. Undang-Undang Dasar Negara Republik Indonesia Tahun 1945 (UUD 1945).
2. Ketetapan Majelis Permusyawaratan Rakyat (TAP MPR).
3. Undang-Undang / Peraturan Pemerintah Pengganti Undang-Undang (UU / Perpu).
4. Peraturan Pemerintah (PP).
5. Peraturan Presiden (Perpres).
6. Peraturan Daerah Provinsi (Perda Provinsi).
7. Peraturan Daerah Kabupaten/Kota (Perda Kab/Kota).
Asas 'Lex superior derogat legi inferiori' berlaku: peraturan perundang-undangan yang lebih rendah tidak boleh bertentangan dengan peraturan perundang-undangan yang lebih tinggi.`
      }
    ]
  }
];
