# Supabase Foundation (Guru Host + Murid Kelas)

Folder ini berisi fondasi backend Supabase untuk mode mabar kelas dengan ranking.

## Isi

1. `schema.sql`:
   - Tabel inti: `profiles`, `class_rooms`, `class_members`, `game_sessions`, `session_participants`, `session_events`, `session_rankings`
   - Trigger profil otomatis dari `auth.users`
   - Helper function akses (`is_class_member`, `is_class_teacher`, `is_session_member`, `is_session_teacher`)
   - RLS policy untuk role `guru` / `siswa` / `admin`

## Cara pakai

1. Buat project Supabase.
2. Buka **SQL Editor**.
3. Jalankan isi file `supabase/schema.sql`.
4. Verifikasi tabel dan policy di:
   - Database > Tables
   - Authentication > Policies

## Connection string Postgres (server-side only)

Connection string yang benar untuk project kamu:

```text
postgresql://postgres.ngcioiearbemwqzavcfp:YOUR_DB_PASSWORD@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres?sslmode=require
```

Penting:
- Jangan taruh connection string ini di frontend/browser.
- Pakai hanya di server/tooling (migration, worker, backend admin).

## Konfigurasi frontend (sudah disiapkan file runtime)

Frontend sekarang membaca:
- `js/supabaseConfig.js`
- `js/supabaseRuntime.js`
- `js/supabaseClient.js`

Default URL project sudah terisi ke:
`https://ngcioiearbemwqzavcfp.supabase.co`

Yang perlu kamu isi hanya anon key:

```html
<script>
  window.GAME_EDUKASI_SUPABASE = {
    url: "https://ngcioiearbemwqzavcfp.supabase.co",
    publishableKey: "YOUR_SUPABASE_PUBLISHABLE_KEY",
    anonKey: "YOUR_SUPABASE_ANON_KEY",
    realtimeChannelPrefix: "kelas-room"
  };
</script>
```

`publishableKey` akan dipakai sebagai prioritas. `anonKey` tetap dipertahankan sebagai fallback.

## File env contoh

Lihat `supabase/.env.example` untuk template:
- `SUPABASE_DB_URL`
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
