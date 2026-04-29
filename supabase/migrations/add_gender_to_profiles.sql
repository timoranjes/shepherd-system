-- ============================================================
-- Migration: Add gender and default_avatar to profiles
-- ============================================================
-- This migration adds gender field for user classification
-- and default_avatar for avatar selection feature
-- ============================================================

-- Add gender column with CHECK constraint for valid values
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS gender TEXT CHECK (gender IN ('弟兄', '姊妹'));

-- Add default_avatar column for avatar selection feature
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS default_avatar TEXT;

-- ============================================================
-- Notes:
-- - gender is optional (nullable) to allow gradual migration
-- - Values: '弟兄' (brother) or '姊妹' (sister)
-- - default_avatar stores the selected default avatar identifier
-- ============================================================