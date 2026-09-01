-- Grant dashboard admin role to designated IPS admins.
-- Safe to re-run: merges role into existing app_metadata.

UPDATE auth.users
SET raw_app_meta_data =
  COALESCE(raw_app_meta_data, '{}'::jsonb) || '{"role": "admin"}'::jsonb
WHERE lower(email) IN (
  'hn.gopi@iiserpune.ac.in',
  'rafeequemavoor@gmail.com'
);
