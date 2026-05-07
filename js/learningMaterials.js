/**
 * BLOOMPA - Learning Materials System
 * Materi pembelajaran interaktif untuk setiap mode game
 */
const LearningMaterials = (() => {
    const DATA = {
        robot: {
            title: 'Robot Logic Adventure',
            color: '#0ea5e9',
            icon: '🤖',
            tabs: [
                {
                    label: 'Algoritma',
                    quiz: [
                        { q: 'Algoritma harus memiliki langkah yang jelas dan tidak ambigu. Sifat ini disebut?', options: ['Finite','Definite','Effective','Input'], answer: 1 },
                        { q: 'Manakah contoh algoritma dalam kehidupan sehari-hari?', options: ['Menonton TV','Resep masakan','Tidur siang','Bermain game'], answer: 1 }
                    ],
                    content: `<h3>Apa itu Algoritma?</h3>
<p>Algoritma adalah <strong>urutan langkah-langkah logis</strong> untuk menyelesaikan suatu masalah. Bayangkan seperti resep masakan — setiap langkah harus dilakukan secara berurutan agar hasilnya benar.</p>
<div class="lm-callout"><strong>💡 Contoh Kehidupan Nyata:</strong><br>Membuat mie instan: Didihkan air → Masukkan mie → Tunggu 3 menit → Masukkan bumbu → Aduk → Sajikan</div>
<h4>Visualisasi Algoritma (Flowchart):</h4>
<div class="lm-flowchart">
  <div class="lm-fc-box lm-fc-start">▶ MULAI</div>
  <div class="lm-fc-arrow">↓</div>
  <div class="lm-fc-box lm-fc-proc">📋 Baca instruksi level</div>
  <div class="lm-fc-arrow">↓</div>
  <div class="lm-fc-box lm-fc-proc">🤖 Jalankan perintah</div>
  <div class="lm-fc-arrow">↓</div>
  <div class="lm-fc-box lm-fc-dec">🎯 Tujuan tercapai?</div>
  <div class="lm-fc-arrow">↓ Ya</div>
  <div class="lm-fc-box lm-fc-end">⏹ SELESAI 🎉</div>
</div>
<h4>Ciri-ciri Algoritma yang Baik:</h4>
<ul>
<li><strong>Finite</strong> — Harus berakhir (ada langkah terakhir)</li>
<li><strong>Definite</strong> — Setiap langkah jelas dan tidak ambigu</li>
<li><strong>Input/Output</strong> — Menerima masukan dan menghasilkan keluaran</li>
<li><strong>Effective</strong> — Setiap langkah bisa dikerjakan</li>
</ul>`
                },
                {
                    label: 'Sequence',
                    quiz: [
                        { q: 'Sequence berarti perintah dijalankan secara...', options: ['Acak','Berurutan atas ke bawah','Paralel','Mundur'], answer: 1 },
                        { q: 'Jika urutan perintah robot salah, apa yang terjadi?', options: ['Robot lebih cepat','Robot nyasar/gagal','Robot berhenti','Tidak ada pengaruh'], answer: 1 }
                    ],
                    content: `<h3>Sequence (Urutan)</h3>
<p>Sequence adalah konsep paling dasar dalam pemrograman. Perintah dijalankan <strong>satu per satu dari atas ke bawah</strong>, berurutan.</p>
<div class="lm-code"><span class="lm-code-title">Contoh Sequence Robot:</span>
<pre>maju()
maju()
belok_kanan()
maju()
ambil_koin()</pre></div>
<p>Dalam game ini, kamu menyusun urutan perintah agar robot bisa mencapai tujuan. Urutan yang salah = robot nyasar! 🤖</p>
<div class="lm-callout"><strong>🎯 Tips:</strong> Coba bayangkan dirimu sebagai robot. Langkah apa yang perlu kamu ambil dari posisi awal ke tujuan?</div>`
                },
                {
                    label: 'Selection',
                    quiz: [
                        { q: 'Keyword Python untuk percabangan adalah?', options: ['loop','repeat','if/else','switch'], answer: 2 },
                        { q: 'Selection memungkinkan program untuk...', options: ['Mengulang perintah','Membuat keputusan','Menyimpan data','Mencetak output'], answer: 1 }
                    ],
                    content: `<h3>Selection (Percabangan)</h3>
<p>Selection memungkinkan program <strong>membuat keputusan</strong> berdasarkan kondisi tertentu. Jika kondisi benar, jalankan aksi A. Jika salah, jalankan aksi B.</p>
<div class="lm-code"><span class="lm-code-title">Contoh di Python:</span>
<pre>if ada_dinding_depan:
    belok_kanan()
else:
    maju()</pre></div>
<h4>Flowchart Percabangan:</h4>
<div class="lm-diagram">
┌─────────────┐
│ Ada dinding? │
└──────┬──────┘
       │
   ┌───┴───┐
   │Ya  │Tidak│
   ▼       ▼
Belok    Maju
</div>`
                },
                {
                    label: 'Loop',
                    quiz: [
                        { q: 'for i in range(5) akan mengulang sebanyak...', options: ['4 kali','5 kali','6 kali','Tak terbatas'], answer: 1 },
                        { q: 'Keuntungan menggunakan loop dibanding menulis ulang perintah adalah?', options: ['Lebih lambat','Kode lebih panjang','Lebih efisien dan ringkas','Lebih rumit'], answer: 2 }
                    ],
                    content: `<h3>Loop (Perulangan)</h3>
<p>Loop memungkinkan kamu <strong>mengulang perintah</strong> tanpa menulis berulang-ulang. Sangat efisien!</p>
<div class="lm-code"><span class="lm-code-title">Tanpa Loop (tidak efisien):</span>
<pre>maju()
maju()
maju()
maju()
maju()</pre></div>
<div class="lm-code"><span class="lm-code-title">Dengan Loop (efisien!):</span>
<pre>for i in range(5):
    maju()</pre></div>
<div class="lm-callout"><strong>⭐ Di Game:</strong> Gunakan loop untuk mendapat bintang 3! Semakin sedikit perintah yang kamu pakai, semakin tinggi skormu.</div>`
                },
                {
                    label: '📋 Ringkasan',
                    content: `<h3>Cheatsheet Robot Logic</h3>
<div class="lm-sheet-grid">
<div class="lm-sheet-card"><div class="lm-sheet-title">🔢 Sequence</div><code>maju()</code><br><code>belok_kanan()</code><br><code>belok_kiri()</code><br><small>Dijalankan berurutan ↓</small></div>
<div class="lm-sheet-card"><div class="lm-sheet-title">🔀 Selection</div><code>if kondisi:</code><br><code>&nbsp;&nbsp;aksi_A()</code><br><code>else:</code><br><code>&nbsp;&nbsp;aksi_B()</code></div>
<div class="lm-sheet-card"><div class="lm-sheet-title">🔄 Loop</div><code>for i in range(n):</code><br><code>&nbsp;&nbsp;maju()</code><br><small>Ulangi n kali</small></div>
<div class="lm-sheet-card"><div class="lm-sheet-title">⭐ Tips Bintang 3</div><small>Gunakan <strong>loop</strong> agar perintah lebih sedikit → skor lebih tinggi!</small></div>
</div>`
                }
            ]
        },
        network: {
            title: 'Network Mission',
            color: '#22c55e',
            icon: '🌐',
            tabs: [
                {
                    label: 'Jaringan',
                    quiz: [
                        { q: 'Jaringan komputer di lab sekolah (area lokal) disebut?', options: ['WAN','MAN','LAN','Internet'], answer: 2 },
                        { q: 'Internet adalah contoh jaringan?', options: ['LAN','MAN','WAN','PAN'], answer: 2 }
                    ],
                    content: `<h3>Apa itu Jaringan Komputer?</h3>
<p>Jaringan komputer adalah <strong>kumpulan perangkat yang saling terhubung</strong> untuk berbagi data dan sumber daya.</p>
<h4>Jenis Jaringan Berdasarkan Jangkauan:</h4>
<ul>
<li><strong>LAN</strong> (Local Area Network) — Jaringan lokal, misal di lab sekolah</li>
<li><strong>MAN</strong> (Metropolitan Area Network) — Jaringan sekota</li>
<li><strong>WAN</strong> (Wide Area Network) — Jaringan luas, contoh: Internet</li>
</ul>
<div class="lm-callout"><strong>🌍 Fakta Menarik:</strong> Internet adalah jaringan WAN terbesar di dunia yang menghubungkan miliaran perangkat!</div>`
                },
                {
                    label: 'Topologi',
                    quiz: [
                        { q: 'Topologi yang semua perangkat terhubung ke satu pusat (hub/switch) adalah?', options: ['Bus','Ring','Mesh','Star'], answer: 3 },
                        { q: 'Pada topologi Bus, jika kabel utama putus maka?', options: ['Hanya 1 PC mati','Semua jaringan mati','Tidak ada pengaruh','Data tetap mengalir'], answer: 1 }
                    ],
                    content: `<h3>Topologi Jaringan</h3>
<p>Topologi adalah <strong>bentuk/susunan</strong> bagaimana perangkat-perangkat saling terhubung dalam jaringan.</p>
<h4>Jenis-jenis Topologi:</h4>
<div class="lm-diagram">
<strong>⭐ Star (Bintang)</strong>
    [PC]
     |
[PC]—[Hub]—[PC]
     |
    [PC]
Semua terhubung ke pusat (hub/switch)
</div>
<div class="lm-diagram">
<strong>🔗 Bus</strong>
[PC]—[PC]—[PC]—[PC]
━━━━━━━━━━━━━━━━━━
Semua terhubung ke satu kabel utama
</div>
<div class="lm-diagram">
<strong>🔄 Ring (Cincin)</strong>
[PC]→[PC]→[PC]
  ↑           ↓
 [PC]←[PC]←[PC]
Data mengalir satu arah melingkar
</div>`
                },
                {
                    label: 'Kabel & IP',
                    quiz: [
                        { q: 'Kabel UTP Straight digunakan untuk menghubungkan?', options: ['PC ke PC','Switch ke Switch','PC ke Switch','Router ke Router'], answer: 2 },
                        { q: 'Format IP Address IPv4 terdiri dari berapa bagian angka?', options: ['3','4','6','8'], answer: 1 }
                    ],
                    content: `<h3>Kabel UTP & Pengalamatan IP</h3>
<h4>Kabel UTP (Unshielded Twisted Pair)</h4>
<p>Kabel paling umum di jaringan LAN. Memiliki <strong>8 kabel kecil berwarna</strong> yang dipilin berpasangan.</p>
<ul>
<li><strong>Straight</strong> — Menghubungkan perangkat berbeda (PC ↔ Switch)</li>
<li><strong>Crossover</strong> — Menghubungkan perangkat sejenis (PC ↔ PC)</li>
</ul>
<h4>IP Address</h4>
<p>Alamat unik setiap perangkat di jaringan, seperti alamat rumah.</p>
<div class="lm-code"><span class="lm-code-title">Format IPv4:</span>
<pre>192.168.1.1
┃       ┃ ┃
Network  Host
ID       ID</pre></div>
<div class="lm-callout"><strong>💡 Tips:</strong> Di game ini kamu menghubungkan perangkat jaringan. Pastikan topologi dan koneksi sudah benar!</div>`
                },
                {
                    label: '📋 Ringkasan',
                    content: `<h3>Cheatsheet Network</h3>
<div class="lm-sheet-grid">
<div class="lm-sheet-card"><div class="lm-sheet-title">🌐 Jangkauan</div><small><strong>LAN</strong> = Lab sekolah<br><strong>MAN</strong> = Sekota<br><strong>WAN</strong> = Internet</small></div>
<div class="lm-sheet-card"><div class="lm-sheet-title">⭐ Topologi</div><small><strong>Star</strong> = Hub di tengah<br><strong>Bus</strong> = Kabel utama<br><strong>Ring</strong> = Melingkar</small></div>
<div class="lm-sheet-card"><div class="lm-sheet-title">🔌 Kabel UTP</div><small><strong>Straight</strong> = beda perangkat<br><strong>Crossover</strong> = sama perangkat</small></div>
<div class="lm-sheet-card"><div class="lm-sheet-title">📡 IP Address</div><code>192.168.x.x</code><br><small>= Jaringan lokal<br>Format: 4 angka</small></div>
</div>`
                }
            ]
        },
        computer: {
            title: 'Build a Computer',
            color: '#8b5cf6',
            icon: '💻',
            tabs: [
                {
                    label: 'Sistem IPO',
                    quiz: [
                        { q: 'Komponen manakah yang berperan sebagai PROSES dalam sistem komputer?', options: ['Monitor','Keyboard','CPU','Printer'], answer: 2 },
                        { q: 'Monitor termasuk perangkat?', options: ['Input','Proses','Output','Storage'], answer: 2 }
                    ],
                    content: `<h3>Konsep Input-Proses-Output (IPO)</h3>
<p>Setiap komputer bekerja dengan prinsip dasar <strong>IPO</strong>:</p>
<div class="lm-diagram">
┌─────────┐    ┌──────────┐    ┌──────────┐
│  INPUT   │ →  │  PROSES  │ →  │  OUTPUT  │
│Keyboard, │    │   CPU    │    │ Monitor, │
│Mouse,Mic │    │  (Otak)  │    │Speaker,  │
│          │    │          │    │ Printer  │
└─────────┘    └──────────┘    └──────────┘
</div>
<h4>Contoh:</h4>
<ul>
<li><strong>Input:</strong> Kamu mengetik dokumen (keyboard)</li>
<li><strong>Proses:</strong> CPU mengolah teks</li>
<li><strong>Output:</strong> Teks muncul di layar (monitor)</li>
</ul>`
                },
                {
                    label: 'Hardware',
                    quiz: [
                        { q: 'RAM adalah singkatan dari?', options: ['Read Access Memory','Random Access Memory','Rapid Array Memory','Read Array Module'], answer: 1 },
                        { q: 'SSD lebih unggul dari HDD dalam hal?', options: ['Harga lebih murah','Kapasitas lebih besar','Kecepatan baca/tulis','Ukuran lebih besar'], answer: 2 }
                    ],
                    content: `<h3>Komponen Hardware Komputer</h3>
<h4>🧠 CPU (Central Processing Unit)</h4>
<p>Otak komputer. Memproses semua instruksi dan perhitungan. Contoh: Intel Core i7, AMD Ryzen 5.</p>
<h4>💾 RAM (Random Access Memory)</h4>
<p>Memori sementara untuk data yang sedang diproses. Semakin besar RAM, semakin banyak program bisa berjalan bersamaan.</p>
<h4>📦 Storage (Penyimpanan)</h4>
<ul>
<li><strong>HDD</strong> — Hard Disk Drive, murah tapi lambat</li>
<li><strong>SSD</strong> — Solid State Drive, cepat tapi lebih mahal</li>
</ul>
<h4>🎮 GPU (Graphics Processing Unit)</h4>
<p>Kartu grafis untuk memproses tampilan visual, gaming, dan desain.</p>
<h4>🔌 Motherboard</h4>
<p>Papan sirkuit utama yang menghubungkan semua komponen.</p>
<div class="lm-callout"><strong>🎯 Di Game:</strong> Kamu akan merakit komputer dengan meletakkan komponen di tempat yang benar!</div>`
                },
                {
                    label: 'Software',
                    quiz: [
                        { q: 'Windows dan Linux termasuk jenis software?', options: ['Aplikasi','Utility','Sistem Operasi','Firmware'], answer: 2 },
                        { q: 'Antivirus termasuk kategori software?', options: ['Sistem Operasi','Utility','Aplikasi','Hardware'], answer: 1 }
                    ],
                    content: `<h3>Perangkat Lunak (Software)</h3>
<p>Software adalah <strong>program/instruksi</strong> yang membuat hardware bisa bekerja.</p>
<h4>Jenis Software:</h4>
<ul>
<li><strong>Sistem Operasi</strong> — Windows, Linux, macOS (mengelola seluruh hardware)</li>
<li><strong>Aplikasi</strong> — Chrome, Word, Photoshop (untuk kebutuhan pengguna)</li>
<li><strong>Utility</strong> — Antivirus, WinRAR (membantu sistem)</li>
</ul>
<h4>Hubungan Hardware & Software:</h4>
<div class="lm-diagram">
┌──────────────────────┐
│     APLIKASI         │  ← User berinteraksi
├──────────────────────┤
│   SISTEM OPERASI     │  ← Mengelola resource
├──────────────────────┤
│     HARDWARE         │  ← Eksekusi fisik
└──────────────────────┘
</div>`
                },
                {
                    label: '📋 Ringkasan',
                    content: `<h3>Cheatsheet Komputer</h3>
<div class="lm-sheet-grid">
<div class="lm-sheet-card"><div class="lm-sheet-title">🔄 Sistem IPO</div><small><strong>Input</strong> → Keyboard, Mouse<br><strong>Proses</strong> → CPU<br><strong>Output</strong> → Monitor, Printer</small></div>
<div class="lm-sheet-card"><div class="lm-sheet-title">🧠 Hardware</div><small><strong>CPU</strong> = Otak<br><strong>RAM</strong> = Memori sementara<br><strong>SSD/HDD</strong> = Penyimpanan<br><strong>GPU</strong> = Grafis</small></div>
<div class="lm-sheet-card"><div class="lm-sheet-title">💿 Software</div><small><strong>OS</strong> = Windows/Linux<br><strong>Aplikasi</strong> = Chrome/Word<br><strong>Utility</strong> = Antivirus</small></div>
<div class="lm-sheet-card"><div class="lm-sheet-title">⭐ Tips Game</div><small>Letakkan komponen di slot yang tepat! Urutan: Motherboard → CPU → RAM → Storage → GPU</small></div>
</div>`
                }
            ]
        },
        coding: {
            title: 'Coding Puzzle Lab',
            color: '#f59e0b',
            icon: '🧩',
            tabs: [
                {
                    label: 'Dasar Python',
                    quiz: [
                        { q: 'Fungsi untuk mencetak teks ke layar di Python adalah?', options: ['echo()','console.log()','print()','write()'], answer: 2 },
                        { q: 'Tipe data True/False di Python disebut?', options: ['String','Integer','Float','Boolean'], answer: 3 }
                    ],
                    content: `<h3>Pengenalan Python</h3>
<p>Python adalah bahasa pemrograman yang <strong>mudah dibaca dan dipelajari</strong>, cocok untuk pemula!</p>
<div class="lm-code"><span class="lm-code-title">Hello World pertamamu:</span>
<pre>print("Halo, dunia!")</pre></div>
<h4>Variabel & Tipe Data:</h4>
<div class="lm-code"><span class="lm-code-title">Contoh Variabel:</span>
<pre>nama = "Budi"          # String (teks)
umur = 16               # Integer (bilangan bulat)
tinggi = 170.5          # Float (desimal)
lulus = True             # Boolean (benar/salah)

print(f"Halo {nama}, umur {umur}")</pre></div>
<div class="lm-callout"><strong>💡 Tips:</strong> Python tidak perlu titik koma (;) di akhir baris, dan menggunakan indentasi (spasi) untuk menandai blok kode.</div>`
                },
                {
                    label: 'If / Else',
                    quiz: [
                        { q: 'Keyword untuk kondisi tambahan setelah if di Python adalah?', options: ['else if','elsif','elif','elseif'], answer: 2 },
                        { q: 'Operator manakah yang berarti "tidak sama dengan" di Python?', options: ['<>','=/=','!=','~='], answer: 2 }
                    ],
                    content: `<h3>Percabangan (If / Else)</h3>
<p>Membuat program bisa <strong>mengambil keputusan</strong> berdasarkan kondisi.</p>
<div class="lm-code"><span class="lm-code-title">Contoh If/Else:</span>
<pre>nilai = 85

if nilai >= 90:
    print("A - Sempurna!")
elif nilai >= 80:
    print("B - Bagus!")
elif nilai >= 70:
    print("C - Cukup")
else:
    print("D - Perlu belajar lagi")</pre></div>
<h4>Operator Perbandingan:</h4>
<ul>
<li><code>==</code> sama dengan</li>
<li><code>!=</code> tidak sama dengan</li>
<li><code>&gt;</code> lebih besar, <code>&lt;</code> lebih kecil</li>
<li><code>&gt;=</code> lebih besar/sama, <code>&lt;=</code> lebih kecil/sama</li>
</ul>`
                },
                {
                    label: 'Loop',
                    quiz: [
                        { q: 'Loop yang terus berjalan tanpa kondisi berhenti disebut?', options: ['Fast loop','Infinite loop','Dead loop','Null loop'], answer: 1 },
                        { q: 'range(1, 6) menghasilkan angka?', options: ['1,2,3,4,5,6','1,2,3,4,5','0,1,2,3,4,5','0,1,2,3,4'], answer: 1 }
                    ],
                    content: `<h3>Perulangan (Loop)</h3>
<h4>For Loop — Ulangi sejumlah tertentu</h4>
<div class="lm-code"><span class="lm-code-title">Contoh For Loop:</span>
<pre># Cetak angka 1 sampai 5
for i in range(1, 6):
    print(f"Angka ke-{i}")

# Loop melalui list
buah = ["apel", "jeruk", "mangga"]
for b in buah:
    print(f"Saya suka {b}")</pre></div>
<h4>While Loop — Ulangi selama kondisi benar</h4>
<div class="lm-code"><span class="lm-code-title">Contoh While Loop:</span>
<pre>hitungan = 0
while hitungan < 3:
    print(f"Hitungan: {hitungan}")
    hitungan += 1</pre></div>
<div class="lm-callout"><strong>⚠️ Hati-hati:</strong> Pastikan while loop punya kondisi berhenti, kalau tidak programmu akan loop selamanya (infinite loop)!</div>`
                },
                {
                    label: 'Function',
                    quiz: [
                        { q: 'Keyword untuk mendefinisikan fungsi di Python adalah?', options: ['function','func','define','def'], answer: 3 },
                        { q: 'Keyword untuk mengembalikan nilai dari fungsi adalah?', options: ['give','send','return','output'], answer: 2 }
                    ],
                    content: `<h3>Fungsi (Function)</h3>
<p>Fungsi adalah <strong>blok kode yang bisa dipakai ulang</strong>. Seperti mesin yang menerima input dan menghasilkan output.</p>
<div class="lm-code"><span class="lm-code-title">Membuat Fungsi:</span>
<pre>def sapa(nama):
    return f"Halo, {nama}!"

# Memanggil fungsi
pesan = sapa("Ani")
print(pesan)  # Output: Halo, Ani!</pre></div>
<div class="lm-code"><span class="lm-code-title">Fungsi dengan Perhitungan:</span>
<pre>def luas_persegi(sisi):
    return sisi * sisi

hasil = luas_persegi(5)
print(f"Luas = {hasil}")  # Output: Luas = 25</pre></div>
<div class="lm-callout"><strong>🎯 Di Game:</strong> Kamu menyusun blok-blok kode Python untuk menyelesaikan puzzle. Pahami konsep di sini, lalu praktekkan di game!</div>`
                },
                {
                    label: '📋 Ringkasan',
                    content: `<h3>Cheatsheet Python</h3>
<div class="lm-sheet-grid">
<div class="lm-sheet-card"><div class="lm-sheet-title">📤 Output</div><code>print("teks")</code><br><code>print(f"{var}")</code></div>
<div class="lm-sheet-card"><div class="lm-sheet-title">🔀 If/Else</div><code>if x &gt; 0:</code><br><code>&nbsp;&nbsp;aksi()</code><br><code>elif x == 0:</code><br><code>else:</code></div>
<div class="lm-sheet-card"><div class="lm-sheet-title">🔄 Loop</div><code>for i in range(n):</code><br><code>while kondisi:</code><br><small>break = keluar loop</small></div>
<div class="lm-sheet-card"><div class="lm-sheet-title">⚙️ Function</div><code>def nama(param):</code><br><code>&nbsp;&nbsp;return hasil</code></div>
</div>`
                }
            ]
        },
        circuit: {
            title: 'Circuit Builder',
            color: '#14b8a6',
            icon: '⚡',
            tabs: [
                {
                    label: 'Elektronik',
                    quiz: [
                        { q: 'Rumus Hukum Ohm yang benar adalah?', options: ['V = I + R','V = I × R','V = I / R','V = I - R'], answer: 1 },
                        { q: 'Satuan hambatan listrik adalah?', options: ['Volt','Ampere','Watt','Ohm'], answer: 3 }
                    ],
                    content: `<h3>Dasar Elektronika</h3>
<p>Elektronika mempelajari aliran <strong>arus listrik</strong> dalam rangkaian dan komponen-komponennya.</p>
<h4>Konsep Dasar:</h4>
<ul>
<li><strong>Tegangan (V)</strong> — "Tekanan" yang mendorong arus listrik (satuan: Volt)</li>
<li><strong>Arus (I)</strong> — Aliran elektron dalam rangkaian (satuan: Ampere)</li>
<li><strong>Hambatan (R)</strong> — "Penghambat" aliran arus (satuan: Ohm Ω)</li>
</ul>
<h4>Hukum Ohm:</h4>
<div class="lm-diagram">
V = I × R

Tegangan = Arus × Hambatan

Contoh: Jika R = 100Ω dan I = 0.02A
maka V = 0.02 × 100 = 2 Volt
</div>`
                },
                {
                    label: 'Komponen',
                    quiz: [
                        { q: 'LED adalah singkatan dari?', options: ['Light Electric Device','Light Emitting Diode','Low Energy Display','Linear Energy Driver'], answer: 1 },
                        { q: 'Fungsi Resistor dalam rangkaian adalah?', options: ['Menyimpan arus','Menghambat arus','Menghasilkan arus','Memutus arus'], answer: 1 }
                    ],
                    content: `<h3>Komponen Elektronik</h3>
<h4>💡 LED (Light Emitting Diode)</h4>
<p>Lampu kecil yang menyala saat dialiri arus. Punya polaritas (+/-), harus dipasang benar.</p>
<h4>🔧 Resistor</h4>
<p>Menghambat arus listrik. Nilainya dibaca dari kode warna pada badannya.</p>
<h4>🔋 Baterai / Power Supply</h4>
<p>Sumber tegangan yang mendorong arus mengalir dalam rangkaian.</p>
<h4>⚡ Kapasitor</h4>
<p>Menyimpan muatan listrik sementara, seperti baterai mini yang bisa diisi dan dikosongkan dengan cepat.</p>
<h4>🔀 Saklar (Switch)</h4>
<p>Memutus atau menyambung aliran arus dalam rangkaian.</p>
<div class="lm-callout"><strong>🎯 Di Game:</strong> Hubungkan komponen-komponen ini untuk membangun rangkaian yang berfungsi!</div>`
                },
                {
                    label: 'Rangkaian',
                    quiz: [
                        { q: 'Pada rangkaian seri, jika satu komponen putus maka?', options: ['Yang lain tetap nyala','Semua komponen mati','Arus bertambah','Tegangan naik'], answer: 1 },
                        { q: 'Lampu di rumah menggunakan rangkaian jenis?', options: ['Seri','Paralel','Campuran','Seri-paralel'], answer: 1 }
                    ],
                    content: `<h3>Jenis Rangkaian Listrik</h3>
<h4>🔗 Rangkaian Seri</h4>
<p>Komponen disusun <strong>berurutan</strong> dalam satu jalur. Arus yang mengalir sama di semua komponen.</p>
<div class="lm-diagram">
[+]━━[R1]━━[R2]━━[R3]━━[-]

R total = R1 + R2 + R3
Jika satu komponen putus, semua mati.
</div>
<h4>🔀 Rangkaian Paralel</h4>
<p>Komponen disusun <strong>bercabang</strong>. Tegangan sama di semua cabang.</p>
<div class="lm-diagram">
      ┌━[R1]━┐
[+]━━━┤      ├━━━[-]
      ├━[R2]━┤
      └━[R3]━┘

1/R total = 1/R1 + 1/R2 + 1/R3
Jika satu putus, yang lain tetap nyala.
</div>
<div class="lm-callout"><strong>💡 Contoh:</strong> Lampu rumahmu menggunakan rangkaian paralel — kalau satu lampu mati, yang lain tetap nyala!</div>`
                },
                {
                    label: '📋 Ringkasan',
                    content: `<h3>Cheatsheet Circuit</h3>
<div class="lm-sheet-grid">
<div class="lm-sheet-card"><div class="lm-sheet-title">⚡ Hukum Ohm</div><code>V = I × R</code><br><small>V=Volt, I=Ampere<br>R=Ohm (Ω)</small></div>
<div class="lm-sheet-card"><div class="lm-sheet-title">🔗 Seri</div><code>R = R1+R2+R3</code><br><small>Arus sama, tegangan bagi<br>Putus 1 = semua mati</small></div>
<div class="lm-sheet-card"><div class="lm-sheet-title">🔀 Paralel</div><code>1/R=1/R1+1/R2</code><br><small>Tegangan sama<br>Putus 1 = lainnya hidup</small></div>
<div class="lm-sheet-card"><div class="lm-sheet-title">🧩 Komponen</div><small><strong>LED</strong>=lampu diode<br><strong>R</strong>=resistor<br><strong>C</strong>=kapasitor<br><strong>SW</strong>=saklar</small></div>
</div>`
                }
            ]
        }
    };

    let currentMode = null;
    let currentTab = 0;

    // ── PROGRESS TRACKING ──────────────────────────────
    const STORAGE_KEY = 'lm_progress';
    function getProgress() {
        try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}; } catch { return {}; }
    }
    function markRead(mode, tab) {
        const p = getProgress();
        if (!p[mode]) p[mode] = [];
        if (!p[mode].includes(tab)) p[mode].push(tab);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
    }
    function isRead(mode, tab) {
        const p = getProgress();
        return !!(p[mode] && p[mode].includes(tab));
    }

    // ── SYNTAX HIGHLIGHTER ─────────────────────────────
    function highlight(code) {
        const esc = code.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
        return esc
            .replace(/(#[^\n]*)/g, '<span class="lm-hl-comment">$1</span>')
            .replace(/("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')/g, '<span class="lm-hl-str">$1</span>')
            .replace(/\b(def|return|if|elif|else|for|while|in|and|or|not|import|from|class|True|False|None|range|print|pass|break|continue)\b/g,
                '<span class="lm-hl-kw">$1</span>')
            .replace(/\b(\d+\.?\d*)\b/g, '<span class="lm-hl-num">$1</span>');
    }

    // ── QUIZ RENDER ────────────────────────────────────
    function renderQuiz(quiz, mode, tabIdx) {
        if (!quiz || !quiz.length) return '';
        const qs = quiz.map((q, qi) => {
            const opts = q.options.map((o, oi) =>
                `<button class="lm-quiz-opt" data-qi="${qi}" data-oi="${oi}" data-correct="${q.answer}">${String.fromCharCode(65+oi)}. ${o}</button>`
            ).join('');
            return `<div class="lm-quiz-q" id="lmq-${mode}-${tabIdx}-${qi}">
                <p class="lm-quiz-qtext"><span class="lm-quiz-num">Q${qi+1}</span> ${q.q}</p>
                <div class="lm-quiz-opts">${opts}</div>
                <div class="lm-quiz-feedback" id="lmfb-${mode}-${tabIdx}-${qi}"></div>
            </div>`;
        }).join('');
        return `<div class="lm-quiz-section">
            <div class="lm-quiz-header">🧠 Mini Kuis — Uji Pemahamanmu!</div>
            ${qs}
        </div>`;
    }

    function applyHighlight(modal) {
        modal.querySelectorAll('.lm-code pre').forEach(pre => {
            pre.innerHTML = highlight(pre.textContent);
        });
    }

    function bindQuiz(modal) {
        modal.querySelectorAll('.lm-quiz-opt').forEach(btn => {
            btn.addEventListener('click', function() {
                const qi = this.dataset.qi;
                const oi = parseInt(this.dataset.oi);
                const correct = parseInt(this.dataset.correct);
                const qBlock = this.closest('.lm-quiz-q');
                if (qBlock.classList.contains('lm-quiz-answered')) return;
                qBlock.classList.add('lm-quiz-answered');
                const fb = qBlock.querySelector('.lm-quiz-feedback');
                if (oi === correct) {
                    this.classList.add('lm-quiz-correct');
                    fb.innerHTML = '✅ Benar! Hebat!';
                    fb.className = 'lm-quiz-feedback lm-fb-correct';
                    if (typeof SoundManager !== 'undefined') SoundManager.play('success');
                } else {
                    this.classList.add('lm-quiz-wrong');
                    qBlock.querySelectorAll('.lm-quiz-opt')[correct].classList.add('lm-quiz-correct');
                    fb.innerHTML = '❌ Kurang tepat. Jawaban benar: ' + String.fromCharCode(65+correct);
                    fb.className = 'lm-quiz-feedback lm-fb-wrong';
                }
            });
        });
    }

    // ── MAIN FUNCTIONS ─────────────────────────────────
    function show(mode) {
        const data = DATA[mode];
        if (!data) return;
        currentMode = mode;
        currentTab = 0;
        markRead(mode, 0);

        let modal = document.getElementById('learning-materials-modal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'learning-materials-modal';
            document.body.appendChild(modal);
        }

        modal.className = 'lm-overlay';
        modal.innerHTML = buildHTML(data, mode);
        modal.style.display = 'flex';
        requestAnimationFrame(() => modal.classList.add('lm-visible'));

        modal.querySelector('.lm-close').addEventListener('click', hide);
        modal.addEventListener('click', (e) => { if (e.target === modal) hide(); });
        bindTabs(modal, data, mode);
        applyHighlight(modal);
        bindQuiz(modal);

        if (typeof SoundManager !== 'undefined') SoundManager.play('navigate');
    }

    function hide() {
        const modal = document.getElementById('learning-materials-modal');
        if (!modal) return;
        modal.classList.remove('lm-visible');
        setTimeout(() => { modal.style.display = 'none'; }, 300);
        if (typeof SoundManager !== 'undefined') SoundManager.play('back');
    }

    function buildHTML(data, mode) {
        const tabsHTML = data.tabs.map((t, i) => {
            const read = isRead(mode, i);
            const check = read ? ' <span class="lm-tab-check">✓</span>' : '';
            return `<button class="lm-tab${i === 0 ? ' lm-tab-active' : ''}${read ? ' lm-tab-read' : ''}" data-tab="${i}">${t.label}${check}</button>`;
        }).join('');

        const tab0 = data.tabs[0];
        const quizHTML = renderQuiz(tab0.quiz, mode, 0);

        return `
        <div class="lm-card">
            <div class="lm-header" style="border-bottom-color:${data.color}40">
                <div class="lm-header-left">
                    <span class="lm-icon">${data.icon}</span>
                    <div>
                        <p class="lm-subtitle">MATERI PEMBELAJARAN</p>
                        <h2 class="lm-title" style="color:${data.color}">${data.title}</h2>
                    </div>
                </div>
                <div class="lm-header-right">
                    <span class="lm-progress-badge" id="lm-prog-badge">${getProgressBadge(data, mode)}</span>
                    <button class="lm-close" title="Tutup">✕</button>
                </div>
            </div>
            <div class="lm-tabs-wrapper">
                <div class="lm-tabs">${tabsHTML}</div>
            </div>
            <div class="lm-body">
                <div class="lm-content">${tab0.content}</div>
                ${quizHTML}
            </div>
            <div class="lm-footer">
                <button class="lm-coba-btn" onclick="LearningMaterials.hide()">
                    🎮 Coba di Game!
                </button>
            </div>
        </div>`;
    }

    function getProgressBadge(data, mode) {
        const p = getProgress();
        const read = (p[mode] || []).length;
        const total = data.tabs.length;
        const pct = Math.round(read / total * 100);
        return `${read}/${total} tab dibaca`;
    }

    function bindTabs(modal, data, mode) {
        modal.querySelectorAll('.lm-tab').forEach(btn => {
            btn.addEventListener('click', () => {
                const idx = parseInt(btn.dataset.tab);
                currentTab = idx;
                markRead(mode, idx);

                // Update tab styles
                modal.querySelectorAll('.lm-tab').forEach(b => b.classList.remove('lm-tab-active'));
                btn.classList.add('lm-tab-active', 'lm-tab-read');
                if (!btn.querySelector('.lm-tab-check')) {
                    btn.innerHTML += ' <span class="lm-tab-check">✓</span>';
                }

                // Update badge
                const badge = modal.querySelector('#lm-prog-badge');
                if (badge) badge.textContent = getProgressBadge(data, mode);

                // Render content + quiz
                const tab = data.tabs[idx];
                const body = modal.querySelector('.lm-body');
                body.innerHTML = `<div class="lm-content">${tab.content}</div>${renderQuiz(tab.quiz, mode, idx)}`;
                applyHighlight(modal);
                bindQuiz(modal);

                if (typeof SoundManager !== 'undefined') SoundManager.play('click');
            });
        });
    }

    return { show, hide, DATA };
})();

