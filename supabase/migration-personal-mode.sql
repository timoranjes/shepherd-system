-- ============================================================
-- Migration: Personal-Only Mode (Remove Hierarchy Architecture)
-- Run this AFTER backing up your database!
-- ============================================================
-- 
-- This migration:
-- 1. Removes hierarchy_id from all tables
-- 2. Drops the hierarchies table
-- 3. Updates RLS policies to user-based filtering
-- 4. Removes hierarchy-related functions
-- 
-- IMPORTANT: Run in Supabase SQL Editor in order!
-- ============================================================

-- ============================================================
-- STEP 1: Drop ALL existing RLS policies (both old and new)
-- ============================================================

-- Drop OLD hierarchy-based policies
DROP POLICY IF EXISTS "Members viewable by hierarchy scope" ON members;
DROP POLICY IF EXISTS "Users can insert members in their hierarchy" ON members;
DROP POLICY IF EXISTS "Users can update members in their hierarchy" ON members;
DROP POLICY IF EXISTS "Users can delete members they created" ON members;

DROP POLICY IF EXISTS "Pastoring logs viewable by hierarchy scope" ON pastoring_logs;
DROP POLICY IF EXISTS "Users can insert pastoring logs for their members" ON pastoring_logs;

DROP POLICY IF EXISTS "Prayers viewable by hierarchy scope" ON prayers;
DROP POLICY IF EXISTS "Users can create prayers in their hierarchy" ON prayers;

DROP POLICY IF EXISTS "Activities viewable by hierarchy scope" ON activities;

DROP POLICY IF EXISTS "Authenticated users can view hierarchies" ON hierarchies;

-- Drop NEW user-based policies (if they were partially created)
DROP POLICY IF EXISTS "Users can view own members" ON members;
DROP POLICY IF EXISTS "Users can insert members" ON members;
DROP POLICY IF EXISTS "Users can update own members" ON members;
DROP POLICY IF EXISTS "Users can delete own members" ON members;

DROP POLICY IF EXISTS "Users can view logs for own members" ON pastoring_logs;
DROP POLICY IF EXISTS "Users can insert logs for own members" ON pastoring_logs;

DROP POLICY IF EXISTS "Users can view prayers" ON prayers;
DROP POLICY IF EXISTS "Users can insert prayers" ON prayers;
DROP POLICY IF EXISTS "Users can update own prayers" ON prayers;
DROP POLICY IF EXISTS "Users can delete own prayers" ON prayers;

DROP POLICY IF EXISTS "Users can view amen actions" ON amen_actions;
DROP POLICY IF EXISTS "Users can add amen" ON amen_actions;
DROP POLICY IF EXISTS "Users can delete own amen" ON amen_actions;

DROP POLICY IF EXISTS "Users can view activities for own members" ON activities;
DROP POLICY IF EXISTS "System can create activities" ON activities;

-- ============================================================
-- STEP 2: Remove hierarchy_id columns from tables
-- ============================================================

-- Members: Remove hierarchy_id (make it nullable first, then drop)
ALTER TABLE members ALTER COLUMN hierarchy_id DROP NOT NULL;
ALTER TABLE members DROP COLUMN IF EXISTS hierarchy_id;

-- Prayers: Remove hierarchy_id
ALTER TABLE prayers DROP COLUMN IF EXISTS hierarchy_id;

-- Profiles: Remove hierarchy_id and hierarchy_level
ALTER TABLE profiles DROP COLUMN IF EXISTS hierarchy_id;
ALTER TABLE profiles DROP COLUMN IF EXISTS hierarchy_level;

-- ============================================================
-- STEP 3: Drop hierarchies table and related objects
-- ============================================================

-- Drop indexes related to hierarchies
DROP INDEX IF EXISTS idx_members_hierarchy;
DROP INDEX IF EXISTS idx_prayers_hierarchy;
DROP INDEX IF EXISTS idx_hierarchies_parent;

-- Drop functions related to hierarchies
DROP FUNCTION IF EXISTS get_child_hierarchy_ids(UUID);
DROP FUNCTION IF EXISTS get_user_hierarchy_ids(UUID);

-- Drop hierarchies table (this will cascade to foreign key references)
DROP TABLE IF EXISTS hierarchies CASCADE;

-- ============================================================
-- STEP 4: Ensure proper owner columns exist
-- ============================================================

-- Members: Ensure created_by and assigned_to reference auth.users
-- (They already reference profiles, which references auth.users - this is correct)

-- Pastoring Logs: user_id already exists and references profiles

-- Prayers: posted_by already exists and references profiles

-- Activities: user_id already exists and references profiles

-- ============================================================
-- STEP 5: Create new RLS policies (User-based, not hierarchy-based)
-- ============================================================

-- ============================================================
-- Members Policies - Personal Only
-- ============================================================

-- Users can only see members they created or are assigned to
CREATE POLICY "Users can view own members"
    ON members FOR SELECT
    TO authenticated
    USING (
        created_by = auth.uid() 
        OR assigned_to = auth.uid()
    );

-- Users can insert members (created_by will be set by server)
CREATE POLICY "Users can insert members"
    ON members FOR INSERT
    TO authenticated
    WITH CHECK (true);  -- Server will set created_by, allow insert

-- Users can update members they created or are assigned to
CREATE POLICY "Users can update own members"
    ON members FOR UPDATE
    TO authenticated
    USING (
        created_by = auth.uid() 
        OR assigned_to = auth.uid()
    );

-- Users can delete members they created
CREATE POLICY "Users can delete own members"
    ON members FOR DELETE
    TO authenticated
    USING (created_by = auth.uid());

-- ============================================================
-- Pastoring Logs Policies - Personal Only
-- ============================================================

-- Users can view logs for members they own
CREATE POLICY "Users can view logs for own members"
    ON pastoring_logs FOR SELECT
    TO authenticated
    USING (
        user_id = auth.uid()
        OR member_id IN (
            SELECT id FROM members 
            WHERE created_by = auth.uid() OR assigned_to = auth.uid()
        )
    );

-- Users can insert logs for members they own
CREATE POLICY "Users can insert logs for own members"
    ON pastoring_logs FOR INSERT
    TO authenticated
    WITH CHECK (
        user_id = auth.uid()
        AND member_id IN (
            SELECT id FROM members 
            WHERE created_by = auth.uid() OR assigned_to = auth.uid()
        )
    );

-- ============================================================
-- Prayers Policies - Personal Only
-- ============================================================

-- Users can view all prayers (shared resource) OR their own
CREATE POLICY "Users can view prayers"
    ON prayers FOR SELECT
    TO authenticated
    USING (true);  -- Prayers are shared, everyone can see

-- Users can insert their own prayers
CREATE POLICY "Users can insert prayers"
    ON prayers FOR INSERT
    TO authenticated
    WITH CHECK (posted_by = auth.uid());

-- Users can update own prayers
CREATE POLICY "Users can update own prayers"
    ON prayers FOR UPDATE
    TO authenticated
    USING (posted_by = auth.uid());

-- Users can delete own prayers
CREATE POLICY "Users can delete own prayers"
    ON prayers FOR DELETE
    TO authenticated
    USING (posted_by = auth.uid());

-- ============================================================
-- Amen Actions Policies (unchanged)
-- ============================================================

CREATE POLICY "Users can view amen actions"
    ON amen_actions FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Users can add amen"
    ON amen_actions FOR INSERT
    TO authenticated
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own amen"
    ON amen_actions FOR DELETE
    TO authenticated
    USING (user_id = auth.uid());

-- ============================================================
-- Activities Policies - Personal Only
-- ============================================================

-- Users can view activities for their members
CREATE POLICY "Users can view activities for own members"
    ON activities FOR SELECT
    TO authenticated
    USING (
        user_id = auth.uid()
        OR member_id IN (
            SELECT id FROM members 
            WHERE created_by = auth.uid() OR assigned_to = auth.uid()
        )
        OR member_id IS NULL
    );

-- System can create activities (trigger)
CREATE POLICY "System can create activities"
    ON activities FOR INSERT
    TO authenticated
    WITH CHECK (true);  -- Trigger creates this, allow

-- ============================================================
-- Materials Policies (unchanged - shared resources)
-- ============================================================

-- Keep existing policies for materials (shared resources)
-- Already set up correctly in rls.sql

-- ============================================================
-- Profiles Policies (unchanged)
-- ============================================================

-- Keep existing policies for profiles
-- Already set up correctly in rls.sql

-- ============================================================
-- STEP 6: Update handle_new_user function (remove hierarchy)
-- ============================================================

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, name, email, avatar_url, role)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'avatar_url', ''),
        'member'
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- STEP 7: Create indexes for new query patterns
-- ============================================================

-- Index for finding members by owner
CREATE INDEX IF NOT EXISTS idx_members_created_by ON members(created_by);
CREATE INDEX IF NOT EXISTS idx_members_assigned_to ON members(assigned_to);

-- ============================================================
-- STEP 8: Update pastoring_logs trigger (remove hierarchy dependency)
-- ============================================================

-- The existing trigger create_activity_from_pastoring_log() is fine
-- It doesn't depend on hierarchy

-- ============================================================
-- VERIFICATION QUERIES (Run these after migration)
-- ============================================================

-- Check that hierarchies table is gone
-- SELECT * FROM hierarchies;  -- Should error: relation does not exist

-- Check members table structure
-- SELECT column_name, data_type FROM information_schema.columns 
-- WHERE table_name = 'members' ORDER BY ordinal_position;

-- Check RLS policies
-- SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
-- FROM pg_policies WHERE tablename IN ('members', 'pastoring_logs', 'prayers');

-- ============================================================
-- END OF MIGRATION
-- ============================================================