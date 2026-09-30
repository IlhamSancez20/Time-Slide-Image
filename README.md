# 🖼️ Interactive Web Gallery & Auto-Slideshow Web App

<div align="center">

**Pilih Bahasa / Select Language:**

[🇮🇩 Bahasa Indonesia](#-bahasa-indonesia) | [🇬🇧 English](#-english)

---

</div>

<a id="bahasa-indonesia"></a>

# 🇮🇩 Bahasa Indonesia

Selamat datang di repositori **Aplikasi Web Galeri Interaktif & Slideshow Otomatis**! Dokumentasi ini disusun untuk membantu Anda memahami, menginstal, mengonfigurasi, dan menggunakan aplikasi web galeri interaktif ini secara mandiri.

---

## 📋 Daftar Isi
1. [💡 Alasan Pembuatan Website](#1-alasan-pembuatan-website)
2. [🛠️ Bahasa Pemrograman & Teknologi](#2-bahasa-pemrograman--teknologi)
3. [📦 Cara Install](#3-cara-install)
4. [⚙️ Cara Pasang](#4-cara-pasang)
5. [🚀 Cara Memasang](#5-cara-memasang-integrasi-frontend--backend)
6. [📖 Cara Menggunakan Aplikasi](#6-cara-menggunakan-aplikasi)
7. [👤 Pembuat](#7-pembuat)
8. [🔓 Lisensi & Hak Penggunaan](#8-lisensi--hak-penggunaan)

---
<a id="1-alasan-pembuatan-website"></a>

## 1. 💡 Alasan Pembuatan Website
Website ini diciptakan untuk memenuhi kebutuhan akan **sistem galeri visual interaktif modern** yang ringan, elegan, dan fleksibel tanpa membutuhkan biaya server database mahal.

Beberapa alasan utama pengembangannya meliputi:
* **Solusi Storage Berbiaya Nol ($0)**: Memanfaatkan kombinasi **Google Drive** sebagai Cloud Storage dan **Google Sheets** sebagai database indeks gambar melalui **Google Apps Script (GAS)**.
* **Tampilan Interaktif & Modern**: Menghadirkan antarmuka berbasis *Glassmorphism/Neumorphism* yang responsif dengan efek visual dinamis.
* **Pengoptimasi Presentasi / Papan Informasi**: Dilengkapi fitur *Auto-Slideshow* dengan timer hitung mundur, audio latar belakang (*Atmospheric Synthesizer*), serta mode *Fullscreen* bersih untuk pameran, *digital signage*, atau portofolio pribadi.
* **Otomatisasi Ukuran File**: Mengompresi file gambar yang diunggah secara otomatis langsung di sisi klien (*client-side*) agar ukuran file tetap efisien (< 500 KB) sebelum dikirim ke cloud.

---
<a id="2-bahasa-pemrograman--teknologi"></a>

## 2. 🛠️ Bahasa Pemrograman & Teknologi

Aplikasi ini dibangun menggunakan kombinasi teknologi web modern tanpa ketergantungan pada *framework* eksternal yang berat (Pure HTML/CSS/JS Native):

| Sisi (Side) | Teknologi / Bahasa | Fungsi & Kegunaan |
| :--- | :--- | :--- |
| **Frontend** | **HTML5** | Struktur antarmuka dan elemen modal/viewer. |
| | **CSS3** | Layouting (Flexbox & Grid), Glassmorphism, CSS Variables, dan Animasi. |
| | **JavaScript (ES6+)** | Logika interaksi UI, Timer, Kompresi Gambar Canvas, & Fetch API. |
| | **Web Audio API** | Efek suara sintetis atmosferik tanpa menggunakan file MP3 eksternal. |
| **Backend & Database** | **Google Apps Script (GAS)** | REST API serverless berbasis JavaScript untuk menangani request GET/POST. |
| | **Google Drive API** | Media penyimpanan file gambar di cloud. |
| | **Google Sheets API** | Database relasional sederhana untuk indeks metadata gambar. |
| **Library Eksternal** | **FontAwesome 6** | Ikon grafis antarmuka. |
| | **Google Fonts** | Tipografi (*Plus Jakarta Sans*). |

---
<a id="3-cara-install"></a>

## 3. 📦 Cara Install (Persiapan File)

Langkah awal untuk memiliki project ini di komputer lokal Anda:

1. **Unduh Repositori / File Proyek**
   * Klik tombol **Code** > **Download ZIP** pada halaman GitHub ini, lalu ekstrak ke komputer Anda.
   * Atau *clone* repositori menggunakan Git terminal:
     ```bash
     git clone [https://github.com/username/interactive-web-gallery.git](https://github.com/username/interactive-web-gallery.git)
     ```
2. **Pastikan Struktur File Lengkap**
   Pastikan dalam folder proyek Anda terdapat file berikut:
   * `index.html` (Tampilan utama)
   * `style.css` (Gaya antarmuka)
   * `script.js` (Logika aplikasi)
   * `Code.gs` (Kode script backend Google)
   * `README.md` (Dokumentasi)

   ---
<a id="4-cara-pasang"></a>

## ⚙️ 4. Cara Pasang (Konfigurasi Google Drive, Sheets & Apps Script)

Aplikasi ini membutuhkan integrasi backend dari Google. Silakan ikuti langkah-langkah mudah di bawah ini:

### **Langkah A: Penyiapan Google Drive Folder**
1. Buka [Google Drive](https://drive.google.com).
2. Buat **Folder Baru** (Misalnya diberi nama: `Web Gallery Storage`).
3. Buka folder tersebut, lalu salin **Folder ID** dari URL di browser Anda.
   * *Contoh URL*: `https://drive.google.com/drive/folders/1hUmqHwJuN4yW1_UyfRyRnuevpCpIbPWd`
   * *Folder ID Anda adalah*: `1hUmqHwJuN4yW1_UyfRyRnuevpCpIbPWd`
4. Ubah akses berbagi folder menjadi: **"Siapa saja yang memiliki link dapat melihat" (*Anyone with the link can view*)**.

### **Langkah B: Penyiapan Google Sheets**
1. Buka [Google Sheets](https://sheets.google.com) dan buat dokumen baru.
2. Beri nama spreadsheet Anda (Misal: `Database Galeri Web`).
3. Biarkan Sheet1 kosong (sistem akan membuat header kolom otomatis saat pertama kali dijalankan).

### **Langkah C: Menyiapkan Google Apps Script (GAS)**
1. Pada dokumen Google Sheets yang telah dibuat, klik menu **Ekstensi (*Extensions*) > Apps Script**.
2. Hapus semua kode default yang ada di dalam editor.
3. Buka file `Code.gs` dari folder proyek Anda, lalu salin seluruh kodenya dan tempelkan (*paste*) ke editor Apps Script.
4. Sesuaikan variabel `FOLDER_ID` pada baris atas kode `Code.gs` dengan ID folder Google Drive Anda:
   ```javascript
   const FOLDER_ID = '1hUmqHwJuN4yW1_UyfRyRnuevpCpIbPWd'; // Ganti dengan Folder ID Anda

---


## 🔌 5. Cara Memasang (Deploy Backend & Menghubungkan ke Frontend)
### Langkah A: Dipublikasikan sebagai Web App (Deployment)
1. Di halaman Google Apps Script, klik tombol **Deploy** di pojok kanan atas > **New deployment**.
2. Klik ikon roda gigi ⚙️ pada Select type, lalu pilih Web app.
3. Isi konfigurasi sebagai berikut:
   - **Description**: `Interactive Gallery API`
   - **Execute as**: `Me (email_anda@gmail.com)`
   - **Who has access**: `Anyone` (Wajib memilih 'Anyone' agar aplikasi frontend bisa mengakses API tanpa login).
4. Klik tombol **Deploy**.
5. Klik **Authorize access**, pilih akun Google Anda, lalu berikan izin akses (Allow).
6. Setelah selesai, salin **Web App URL** yang dihasilkan (URL berakhiran `/exec`).

### Langkah B: Menghubungkan URL ke Frontend
1. Buka file `script.js` pada komputer/editor kode Anda (misal: VS Code).
2. Cari variabel `GAS_API_URL` pada bagian atas file (sekitar baris ke-2), lalu ganti nilainya dengan Web App URL yang baru disalin:
   ```javascript
   const CONFIG = {
   GAS_API_URL: 'HTTPS://SCRIPT.GOOGLE.COM/MACROS/S/AKFYCBX.../EXEC', // Tempelkan URL Anda di sini
   DEFAULT_TIMER_SECONDS: 120,
   MAX_UPLOAD_SIZE_BYTES: 500 * 1024
   };
