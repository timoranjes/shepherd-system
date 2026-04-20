-- ============================================================
-- Row Level Security Policies
-- Run AFTER schema.sql
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE hierarchies ENABLE ROW LEVEL SECURITY;
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE pastoring_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE prayers ENABLE ROW LEVEL SECURITY;
ALTER TABLE amen_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- Profiles Policies
-- ============================================================

CREATE POLICY "Public profiles are viewable by authenticated users"
    ON profiles FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Users can update own profile"
    ON profiles FOR UPDATE
    TO authenticated
    USING (auth.uid() = id);

-- ============================================================
-- Hierarchies Policies
-- ============================================================

CREATE POLICY "Authenticated users can view hierarchies"
    ON hierarchies FOR SELECT
    TO authenticated
    USING (true);

-- ============================================================
-- Members Policies
-- Note: For simplicity, allow all authenticated users to read members.
-- For hierarchy-based filtering, use the get_user_hierarchy_ids function
-- in application code or enable the policies below after testing.
-- ============================================================

CREATE POLICY "Members are viewable by authenticated users"
    ON members FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Users can insert members"
    ON members FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Users can update members"
    ON members FOR UPDATE
    TO authenticated
    USING (true);

CREATE POLICY "Users can delete own members"
    ON members FOR DELETE
    TO authenticated
    USING (created_by = auth.uid());

-- ============================================================
-- Pastoring Logs Policies
-- ============================================================

CREATE POLICY "Pastoring logs are viewable by authenticated users"
    ON pastoring_logs FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Users can insert pastoring logs"
    ON pastoring_logs FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- ============================================================
-- Materials Policies
-- ============================================================

CREATE POLICY "All authenticated users can view materials"
    ON materials FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Users can upload materials"
    ON materials FOR INSERT
    TO authenticated
    WITH CHECK (uploaded_by = auth.uid());

CREATE POLICY "Users can update own materials"
    ON materials FOR UPDATE
    TO authenticated
    USING (uploaded_by = auth.uid());

CREATE POLICY "Users can delete own materials"
    ON materials FOR DELETE
    TO authenticated
    USING (uploaded_by = auth.uid());

-- ============================================================
-- Prayers Policies
-- ============================================================

CREATE POLICY "Prayers are viewable by authenticated users"
    ON prayers FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Users can create prayers"
    ON prayers FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Users can update own prayers"
    ON prayers FOR UPDATE
    TO authenticated
    USING (posted_by = auth.uid());

CREATE POLICY "Users can delete own prayers"
    ON prayers FOR DELETE
    TO authenticated
    USING (posted_by = auth.uid());

-- ============================================================
-- Amen Actions Policies
-- ============================================================

CREATE POLICY "Users can view own amen actions"
    ON amen_actions FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

CREATE POLICY "Users can add amen"
    ON amen_actions FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Users can delete own amen"
    ON amen_actions FOR DELETE
    TO authenticated
    USING (user_id = auth.uid());

-- ============================================================
-- Activities Policies
-- ============================================================

CREATE POLICY "Activities are viewable by authenticated users"
    ON activities FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Users can create activities"
    ON activities FOR INSERT
    TO authenticated
    WITH CHECK (user_id = auth.uid());

-- ============================================================
-- Trigger to auto-create profile on user signup
-- ============================================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO profiles (id, name, email, avatar_url)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
        NEW.email,
        NEW.raw_user_meta_data->>'avatar_url'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();
