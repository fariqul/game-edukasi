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

## Konfigurasi frontend (nanti dipakai saat integrasi client)

Tambahkan runtime config global sebelum script utama:

```html
<script>
  window.GAME_EDUKASI_SUPABASE = {
    url: "https://YOUR_PROJECT_REF.supabase.co",
    anonKey: "YOUR_SUPABASE_ANON_KEY",
    realtimeChannelPrefix: "kelas-room"
  };
</script>
```

Untuk helper parsing config, gunakan `js/supabaseConfig.js`.
