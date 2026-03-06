-- Remove duplicate RLS policies added by accident (originals in migration.sql are sufficient)
DROP POLICY IF EXISTS "admin_read_all_seller_profiles" ON seller_profiles;
DROP POLICY IF EXISTS "admin_update_seller_profiles" ON seller_profiles;
DROP POLICY IF EXISTS "users_read_own_seller_profile" ON seller_profiles;
DROP POLICY IF EXISTS "users_insert_own_seller_profile" ON seller_profiles;
DROP POLICY IF EXISTS "users_update_own_seller_profile" ON seller_profiles;
DROP POLICY IF EXISTS "admin_read_all_profiles" ON profiles;
DROP POLICY IF EXISTS "users_read_own_profile" ON profiles;
