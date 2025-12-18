-- Drop unique constraint on user_id to allow multiple vendor profiles per user (for demo/seed data)
ALTER TABLE vendor_profiles DROP CONSTRAINT IF EXISTS vendor_profiles_user_id_key;

-- Also drop foreign key constraint to allow seed data
ALTER TABLE vendor_profiles DROP CONSTRAINT IF EXISTS vendor_profiles_user_id_fkey;