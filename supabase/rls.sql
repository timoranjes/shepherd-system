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
-- Hierarchy-based filtering: users can only see members in their hierarchy scope
-- ============================================================

CREATE POLICY "Members viewable by hierarchy scope"
    ON members FOR SELECT
    TO authenticated
    USING (
        hierarchy_id IN (
            SELECT id FROM get_user_hierarchy_ids(auth.uid())
        )
        OR auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin')
    );

CREATE POLICY "Users can insert members in their hierarchy"
    ON members FOR INSERT
    TO authenticated
    WITH CHECK (
        hierarchy_id IN (
            SELECT id FROM get_user_hierarchy_ids(auth.uid())
        )
        OR auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin')
    );

CREATE POLICY "Users can update members in their hierarchy"
    ON members FOR UPDATE
    TO authenticated
    USING (
        hierarchy_id IN (
            SELECT id FROM get_user_hierarchy_ids(auth.uid())
        )
        OR auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin')
    );

CREATE POLICY "Users can delete members they created"
    ON members FOR DELETE
    TO authenticated
    USING (
        created_by = auth.uid()
        OR auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin')
    );

-- ============================================================
-- Pastoring Logs Policies
-- Filtered by member's hierarchy scope
-- ============================================================

CREATE POLICY "Pastoring logs viewable by hierarchy scope"
    ON pastoring_logs FOR SELECT
    TO authenticated
    USING (
        member_id IN (
            SELECT m.id FROM members m
            WHERE m.hierarchy_id IN (
                SELECT id FROM get_user_hierarchy_ids(auth.uid())
            )
        )
        OR auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin')
    );

CREATE POLICY "Users can insert pastoring logs for their members"
    ON pastoring_logs FOR INSERT
    TO authenticated
    WITH CHECK (
        member_id IN (
            SELECT m.id FROM members m
            WHERE m.hierarchy_id IN (
                SELECT id FROM get_user_hierarchy_ids(auth.uid())
            )
        )
        OR auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin')
    );

-- ============================================================
-- Materials Policies
-- All authenticated users can view (shared resources)
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
-- Filtered by hierarchy scope
-- ============================================================

CREATE POLICY "Prayers viewable by hierarchy scope"
    ON prayers FOR SELECT
    TO authenticated
    USING (
        hierarchy_id IN (
            SELECT id FROM get_user_hierarchy_ids(auth.uid())
        )
        OR auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin')
    );

CREATE POLICY "Users can create prayers in their hierarchy"
    ON prayers FOR INSERT
    TO authenticated
    WITH CHECK (
        hierarchy_id IN (
            SELECT id FROM get_user_hierarchy_ids(auth.uid())
        )
        OR auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin')
    );

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

CREATE POLICY "Users can view amen actions on prayers they can see"
    ON amen_actions FOR SELECT
    TO authenticated
    USING (
        prayer_id IN (
            SELECT p.id FROM prayers p
            WHERE p.hierarchy_id IN (
                SELECT id FROM get_user_hierarchy_ids(auth.uid())
            )
            OR auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin')
        )
    );

CREATE POLICY "Users can add amen"
    ON amen_actions FOR INSERT
    TO authenticated
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own amen"
    ON amen_actions FOR DELETE
    TO authenticated
    USING (user_id = auth.uid());

-- ============================================================
-- Activities Policies
-- Filtered by member's hierarchy scope
-- ============================================================

CREATE POLICY "Activities viewable by hierarchy scope"
    ON activities FOR SELECT
    TO authenticated
    USING (
        member_id IN (
            SELECT m.id FROM members m
            WHERE m.hierarchy_id IN (
                SELECT id FROM get_user_hierarchy_ids(auth.uid())
            )
        )
        OR member_id IS NULL
        OR auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin')
    );

CREATE POLICY "System can create activities"
    ON activities FOR INSERT
    TO authenticated
    WITH CHECK (user_id = auth.uid());

-- ============================================================
-- Trigger to auto-create profile on user signup
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

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();
