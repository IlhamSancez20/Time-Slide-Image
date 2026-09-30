# 🖼️ Interactive Web Gallery & Auto-Slideshow Web App

<div align="center">

**Pilih Bahasa / Select Language:**

[🇮🇩 Bahasa Indonesia](#-bahasa-indonesia) | [🇬🇧 English](#-english)

---

</div>

<a id="bahasa-indonesia"></a>
# 🇮🇩 Bahasa Indonesia

Selamat datang di repositori **Interactive Web Gallery & Auto-Slideshow Web App**! Dokumentasi ini disusun untuk membantu Anda memahami, menginstal, mengonfigurasi, dan menggunakan aplikasi web galeri interaktif ini secara mandiri.

---

## 📋 Daftar Isi
1. [💡 Alasan Pembuatan Website](#1-alasan-pembuatan-website)
2. [🛠️ Bahasa Pemrograman & Teknologi](#2-bahasa-pemrograman--teknologi)
3. [📦 Cara Install (Persiapan File)](#3-cara-install-persiapan-file)
4. [⚙️ Cara Pasang (Konfigurasi Backend & Server)](#4-cara-pasang-konfigurasi-backend--server)
5. [🚀 Cara Memasang (Integrasi Frontend & Backend)](#5-cara-memasang-integrasi-frontend--backend)
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

## 3. 📦 Cara Install (Persiapan File)

Untuk membuat dan menjalankan proyek ini sendiri di komputer Anda, ikuti langkah persiapan file berikut:

1. **Unduh atau Clone Repositori Ini**:
   Jika Anda menggunakan Git, jalankan perintah berikut pada terminal/command prompt:
   ```bash
   git clone [https://github.com/username/interactive-web-gallery.git](https://github.com/username/interactive-web-gallery.git)
