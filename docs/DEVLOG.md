PKS Dashboard Development Log
10 March 2026
Progress

Membuat layout dasar dashboard PKS

Membuat sidebar navigation

Membuat KPI card awal (TBS, CPO, Kernel, OER)

Membuat chart Produksi dan OER menggunakan Chart.js

Membuat API FastAPI untuk:

produksi

restan

lorry

stock CPO

11 March 2026
Progress

Menambahkan filter tanggal menggunakan Flatpickr

Menambahkan quick filter (7D, 30D, 3M)

Menghubungkan dashboard dengan API produksi

Menampilkan KPI berdasarkan data terbaru

12 March 2026
Progress

Menambahkan master data Company dan Mill

Membuat API /company-mill

Menambahkan dropdown filter Company dan Mill

Memperbaiki error fungsi updateMill()

Menambahkan highlight sidebar aktif

Membuat filter bar menjadi card layout

13 March 2026
Progress

Redesign dashboard menggunakan grouping KPI layout

Membagi dashboard menjadi section:

Produksi

Hasil Produksi

Stock

Menambahkan KPI baru:

TBS Terima

KER

Menambahkan KPI Stock:

Stock CPO

Stock Kernel

Menambahkan kembali Status Produksi dengan persentase

Memperbaiki bug:

TBS Terima tidak tampil

Flatpickr date filter tidak muncul

Menyesuaikan struktur CSS dan layout grid KPI

Current Dashboard Structure

Filter Card

Quick Filter

Produksi KPI

Hasil Produksi KPI

Stock KPI

Status Produksi

Chart Produksi & OER

Next Task

Export data produksi ke Excel

Implement filter Company & Mill ke query backend

Tambah indikator warna dinamis pada Status Produksi

Persiapan modul Mass Balance RSPO

14 March 2026
Progress

Mengevaluasi struktur data produksi dari Dept Engineering (Excel Daily Production)

Mengidentifikasi kolom penting untuk sistem dashboard:

Group

Region

PT

Mill

Tanggal

TBS Masuk

TBS Olah

Restan

CPO

Kernel

OER

KER

Jam Olah

Menyesuaikan desain dashboard agar kompatibel dengan struktur data real produksi

Merencanakan integrasi data Excel ke database MySQL

Decision

Project akan mulai menggunakan data produksi real dari engineering sebagai sumber utama dashboard, menggantikan dummy data yang sebelumnya digunakan.

Next Task

Mendesain ulang struktur tabel produksi_harian agar sesuai dengan data Excel

Menambahkan relasi data:

Group

Region

Company (PT)

Mill

Membuat script import data Excel ke database

Menghubungkan dashboard dengan data produksi real

Mengaktifkan filter:

Region

Company (PT)

Mill

Tanggal

15 March 2026
Next Task

Mengaktifkan filter dashboard berdasarkan:

Region

Company (PT)

Mill

Membuat KPI dashboard mengikuti filter yang dipilih:

TBS Terima

TBS Olah

Restan

CPO

Kernel

OER

KER

Menambahkan indikator identitas data pada dashboard:

Region

Company (PT)

Mill

Mendesain ulang tampilan header dashboard agar menampilkan konteks data yang sedang dipantau

contoh:

Region 1 – PT SSS – Mill SLM

Menyesuaikan query backend agar data dashboard dapat difilter berdasarkan:

Region

Company

Mill

Rentang tanggal

16 March 2026
Progress
1. Dashboard Filter Improvement

Menambahkan sistem filter dashboard untuk memonitor data berdasarkan struktur operasional PKS.

Filter yang tersedia:

Date Range

Company (PT)

Mill

Data Company dan Mill diambil dari endpoint backend:

/company-mill

Struktur response:

Company
   └ Mills

Contoh:

PT Borneo Sawit Gemilang
   └ PANGKOH MILL
2. Hierarchical Filter Logic

Mengimplementasikan filter bertingkat pada dashboard.

Flow filter:

Company dipilih
      ↓
Mill otomatis terisi berdasarkan company

Function yang digunakan:

updateMill()

Method ini mengambil daftar mill berdasarkan company yang dipilih.

3. Dashboard Context Indicator

Menambahkan indikator konteks dashboard agar user mengetahui data yang sedang dimonitor.

Contoh tampilan:

All Company • All Mill
Periode : 01 Feb 2026 - 28 Feb 2026

Tujuan:

Memastikan user tidak salah membaca data

Memberikan konteks monitoring produksi

4. Dashboard UI & CSS Refactor

Melakukan perapihan CSS pada App.vue dengan pemisahan section:

Layout
Sidebar
Content
Dashboard
Header
Filter
KPI
Chart
Status

Perbaikan yang dilakukan:

Menghapus style duplikat

Memperbaiki error warna CSS

Menyederhanakan struktur card

Menjaga konsistensi layout dashboard

Bug Fix
1. Dropdown Filter Tidak Muncul

Masalah terjadi karena frontend mencoba mengambil endpoint:

/region-company-mill

Namun endpoint tersebut belum tersedia di backend (404).

Solusi:
Mengembalikan endpoint ke:

/company-mill
2. Vue Render Error

Error yang muncul:

this.regionData?.find is not a function

Penyebab:
Frontend mencoba membaca regionData yang belum tersedia.

Solusi:

Menghapus sementara fitur region filter

Mengembalikan struktur filter menjadi:

Company → Mill
Current Dashboard Structure

Filter

Date Range
Company
Mill

Dashboard

Produksi
TBS Terima
TBS Olah
Restan

Hasil Produksi
CPO
Kernel
OER
KER

Stock
CPO
Kernel

Chart

Produksi CPO vs TBS
OER Trend
Next Task

Menambahkan struktur organisasi pada dashboard

Region
   ↓
Company
   ↓
Mill

Menambahkan kolom region pada tabel:

master_company

atau membuat tabel baru:

master_region

Membuat endpoint backend baru:

/region-company-mill

Mengaktifkan kembali filter hierarki

Region → Company → Mill

Menghubungkan filter dengan query backend agar dashboard dapat difilter berdasarkan:

Region

Company

Mill

Date Range

Long Term Improvement

Auto apply filter tanpa tombol "Apply"

KPI indicator (Normal / Warning / Critical)

Drilldown chart produksi

Integrasi data real dari Excel engineering

17 March 2026
Progress
1. Backend API Improvement

Memperbaiki endpoint /produksi dengan menambahkan JOIN ke tabel master_mill agar data produksi memiliki informasi struktur organisasi kebun.

Field baru yang ditambahkan pada response API:

company_code
mill_code

Struktur data produksi kini mengikuti hierarki:

Company → Mill → Produksi
2. Dashboard Filter Stabilization

Memperbaiki logika filter dashboard pada fungsi:

applyFilter()

Filter dashboard kini menggunakan parameter:

Date Range

Company (PT)

Mill

Perbaikan yang dilakukan:

Memperbaiki bug timezone pada filter tanggal

Menyesuaikan format tanggal menjadi:

YYYY-MM-DD
3. KPI & Chart Synchronization

Menyesuaikan sinkronisasi antara KPI Card dan Chart Dashboard agar mengikuti filter yang dipilih.

Perbaikan yang dilakukan:

KPI mengikuti data hasil filter

Chart melakukan re-render setelah filter dijalankan

Menghindari data chart yang tidak sinkron dengan KPI

4. Quick Filter Adjustment

Menyesuaikan quick filter:

7D
30D
3M

Quick filter kini menggunakan tanggal terakhir dari dataset produksi sebagai acuan, sehingga lebih relevan dengan data produksi terbaru.

5. Persiapan Modul Produksi

Mulai pengembangan halaman Produksi PKS terpisah dari dashboard.

Halaman ini dirancang untuk fokus pada:

Analisis produksi
Trend produksi
Detail data produksi

Komponen yang disiapkan:

Filter Date Range

Filter Company

Filter Mill

Chart Produksi TBS vs CPO

Decision

Beberapa rencana pengembangan ditunda sementara:

Integrasi data Excel Engineering

Filter Region

Fokus pengembangan saat ini:

Stabilisasi modul Produksi
Filter Dashboard
KPI dan Chart
Next Task

Export data produksi ke Excel

Input manual stock bulking pada modul Stock CPO

Persiapan modul Mass Balance RSPO

Kalau kamu mau, besok aku juga bisa bantu kamu mulai devlog untuk fase baru project kamu, karena sebenarnya dashboard kamu sudah masuk tahap:

Prototype → Production Ready System

Biasanya di fase ini devlog mulai dibagi menjadi:

Frontend
Backend
Database
Module

## 17 March 2026

### Progress

#### Backend

* Membuat tabel baru `stock_movement` untuk mencatat pergerakan stock (IN / OUT / ADJ)
* Menambahkan endpoint API:

  * `POST /stock-movement` (input data stock)
  * `GET /stock-movement` (ambil data movement)
* Menyiapkan endpoint baru:

  * `GET /stock-combined` (persiapan integrasi data produksi + stock)

---

#### Frontend – Modul Stock CPO

##### Input Stock Movement

* Membuat form input stock:

  * Tanggal
  * Produk (CPO / Kernel)
  * Tipe (IN / OUT / ADJ)
  * Jumlah
  * Keterangan
* Mengubah form input menjadi **modal popup**
* Menambahkan tombol `+ Input Stock`
* Menambahkan fitur:

  * Auto refresh data setelah submit
  * Auto reset form
  * Auto close modal setelah simpan

---

##### Stock Calculation

* Implementasi logika perhitungan stock:

  * IN → menambah stock
  * OUT → mengurangi stock
  * ADJ → penyesuaian stock
* Memisahkan perhitungan:

  * Total Stock CPO
  * Total Stock Kernel

---

##### Chart Improvement

* Mengubah chart menjadi **running stock (stock position)**
* Implementasi cumulative logic:

  * Stock berjalan berdasarkan transaksi
* Sinkronisasi chart dengan:

  * Filter
  * Data terbaru

---

##### Filter & Data Flow

* Integrasi filter dengan data stock
* Quick filter tetap berjalan:

  * 7D
  * 30D
  * 3M
* Mulai integrasi dengan endpoint `stock-combined`

---

##### UI / UX Improvement

* Refactor tampilan Stock CPO:

  * Input tidak lagi memenuhi halaman (dipindah ke modal)
* Menyusun ulang layout:

  * Header action (Stock Movement)
  * Chart + KPI dalam satu section
* Redesign KPI:

  * Dari card terpisah → inline (lebih clean & compact)
* Meningkatkan fokus visual pada chart

---

### Bug / Finding

* Data dari endpoint `stock-combined` belum sesuai struktur (produk, tipe, jumlah)
* Nilai `NaN` muncul pada tabel dan chart
* Chart tidak tampil optimal karena data belum termapping dengan benar

---

### Current Status

Stock CPO Module ±80% selesai

Sudah tersedia:

* Input stock movement
* Perhitungan stock
* Chart running stock
* KPI stock

---

### Next Task

* Finalisasi endpoint `stock-combined`
* Mapping data agar sesuai struktur:

  * produk
  * tipe
  * jumlah
* Sinkronisasi:

  * data produksi
  * stock movement
* Validasi input (hindari null / NaN)
* Persiapan modul **Mass Balance RSPO**
