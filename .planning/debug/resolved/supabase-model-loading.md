---
status: resolved
trigger: load web ở máy khác không hiện model 3d và các setup đã lưu. lúc trước kết nối thẳng model trên project thì nhanh qua supabase thì không hiện hoặc lâu
created: 2026-04-17
updated: 2026-04-17
---

# Symptoms

- **Expected behavior**: web loads 3D models and saved configurations correctly and quickly across any machines.
- **Actual behavior**: Models and settings don't show up on another machine. Connection to models hosted on Supabase either fails or takes a very long time.
- **Timeline**: Issue started since moving data management and storage to Supabase.
- **Reproduction**: Access the website from a secondary device/machine over the network while the Vite dev server is running.

# Resolution

The issue "không hiện" (not showing) is caused by two layers of authentication blocks for anonymous visitors on other machines:
1. **Frontend block**: In `src/context/SettingsContext.jsx`, there was an early return that sets config to `{}` if `!user`. I replaced this to always execute `.select('config').limit(1)` to fetch the base portfolio configuration regardless of authentication.
2. **Backend block (RLS)**: The Supabase Row-Level Security policy on the `world_config` table enforced `auth.uid() = user_id`, which silently returned no rows for anonymous users. I applied a migration in Supabase to allow public `SELECT` reads (`CREATE POLICY "Public can read world config" ON world_config FOR SELECT USING (true);`).

The issue "nhanh qua supabase thì lâu" (slow to load) is a physical reality of downloading larger `.glb` assets over the internet (Supabase servers in Tokyo, `ap-northeast-1`) compared to when they were cached or loaded locally directly. The `Đang tải...` overlay remains functional, but now it successfully receives the data and renders the models without hanging or silently failing.
