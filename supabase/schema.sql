-- ============================================================
-- Database Schema for 福音與牧養管理系統
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- Profiles (extends auth.users)
-- ============================================================
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    avatar_url TEXT,
    role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'member')),
    hierarchy_level TEXT CHECK (hierarchy_level IN ('大区', '小区', '小排')),
    hierarchy_id UUID,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- Hierarchies (Geographic/group structure)
-- ============================================================
CREATE TABLE IF NOT EXISTS hierarchies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name_zh_hant TEXT NOT NULL,
    name_zh_hans TEXT NOT NULL,
    level TEXT NOT NULL CHECK (level IN ('region', 'sub_region', 'group')),
    parent_id UUID REFERENCES hierarchies(id) ON DELETE SET NULL,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- Members (Gospel friends & new believers)
-- ============================================================
CREATE TABLE IF NOT EXISTS members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name_zh_hant TEXT NOT NULL,
    name_zh_hans TEXT NOT NULL,
    phone TEXT,
    address_zh_hant TEXT,
    address_zh_hans TEXT,
    occupation_zh_hant TEXT,
    occupation_zh_hans TEXT,
    birthday DATE,
    notes_zh_hant TEXT,
    notes_zh_hans TEXT,
    avatar_url TEXT,
    type TEXT NOT NULL CHECK (type IN ('gospel', 'new_believer')),
    status TEXT CHECK (status IN ('初接觸', '初接触', '平安之子', '柔軟敞開', '柔软敞开', '有尋求', '有寻求', '剛受浸', '刚受浸', '晨興建立中', '晨兴建立中', '穩定家聚會', '稳定家聚会')),
    hierarchy_id UUID NOT NULL REFERENCES hierarchies(id) ON DELETE RESTRICT,
    assigned_to UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- Pastoring Logs (Care visit records)
-- ============================================================
CREATE TABLE IF NOT EXISTS pastoring_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    action TEXT NOT NULL CHECK (action IN ('gospel_preaching', 'visitation', 'home_meeting', 'morning_revival', 'reading_together', 'love_feast')),
    summary TEXT NOT NULL,
    action_date DATE NOT NULL DEFAULT CURRENT_DATE,
    partner_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- Materials (Gospel resources)
-- ============================================================
CREATE TABLE IF NOT EXISTS materials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title_zh_hant TEXT NOT NULL,
    title_zh_hans TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('gospel', 'new_believer', 'life_course', 'hymns')),
    type TEXT NOT NULL CHECK (type IN ('pdf', 'article', 'video', 'audio')),
    suitable_for TEXT,
    cover_color TEXT,
    file_url TEXT,
    uploaded_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- Prayers (Prayer requests)
-- ============================================================
CREATE TABLE IF NOT EXISTS prayers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title_zh_hant TEXT NOT NULL,
    title_zh_hans TEXT NOT NULL,
    content_zh_hant TEXT NOT NULL,
    content_zh_hans TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('gospel', 'new_believers', 'family', 'serving', 'urgent')),
    is_urgent BOOLEAN DEFAULT FALSE,
    hierarchy_id UUID NOT NULL REFERENCES hierarchies(id) ON DELETE RESTRICT,
    posted_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    amen_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- Amen Actions (Tracks who clicked "阿們")
-- ============================================================
CREATE TABLE IF NOT EXISTS amen_actions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    prayer_id UUID NOT NULL REFERENCES prayers(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(prayer_id, user_id)
);

-- ============================================================
-- Activities (Dashboard timeline)
-- ============================================================
CREATE TABLE IF NOT EXISTS activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    member_id UUID REFERENCES members(id) ON DELETE SET NULL,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    description_zh_hant TEXT,
    description_zh_hans TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- Indexes for performance
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_members_hierarchy ON members(hierarchy_id);
CREATE INDEX IF NOT EXISTS idx_members_assigned_to ON members(assigned_to);
CREATE INDEX IF NOT EXISTS idx_members_type ON members(type);
CREATE INDEX IF NOT EXISTS idx_pastoring_logs_member ON pastoring_logs(member_id);
CREATE INDEX IF NOT EXISTS idx_pastoring_logs_user ON pastoring_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_prayers_hierarchy ON prayers(hierarchy_id);
CREATE INDEX IF NOT EXISTS idx_prayers_category ON prayers(category);
CREATE INDEX IF NOT EXISTS idx_activities_member ON activities(member_id);
CREATE INDEX IF NOT EXISTS idx_activities_created ON activities(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_hierarchies_parent ON hierarchies(parent_id);

-- ============================================================
-- Trigger to auto-update updated_at
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER members_updated_at BEFORE UPDATE ON members
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER pastoring_logs_updated_at BEFORE UPDATE ON pastoring_logs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER materials_updated_at BEFORE UPDATE ON materials
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER prayers_updated_at BEFORE UPDATE ON prayers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- Trigger to increment amen_count
-- ============================================================
CREATE OR REPLACE FUNCTION increment_amen_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE prayers SET amen_count = amen_count + 1 WHERE id = NEW.prayer_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER amen_action_increment
    AFTER INSERT ON amen_actions
    FOR EACH ROW EXECUTE FUNCTION increment_amen_count();

-- ============================================================
-- Trigger to decrement amen_count on delete
-- ============================================================
CREATE OR REPLACE FUNCTION decrement_amen_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE prayers SET amen_count = GREATEST(amen_count - 1, 0) WHERE id = OLD.prayer_id;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER amen_action_decrement
    AFTER DELETE ON amen_actions
    FOR EACH ROW EXECUTE FUNCTION decrement_amen_count();

-- ============================================================
-- Function to get all child hierarchy IDs recursively
-- ============================================================
CREATE OR REPLACE FUNCTION get_child_hierarchy_ids(parent_hierarchy_id UUID)
RETURNS TABLE(id UUID) AS $$
BEGIN
    RETURN QUERY
    WITH RECURSIVE hierarchy_tree AS (
        SELECT id FROM hierarchies WHERE id = parent_hierarchy_id
        UNION ALL
        SELECT h.id FROM hierarchies h
        INNER JOIN hierarchy_tree ht ON h.parent_id = ht.id
    )
    SELECT id FROM hierarchy_tree;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- Function to get user accessible hierarchy IDs based on role
-- ============================================================
CREATE OR REPLACE FUNCTION get_user_hierarchy_ids(p_profile_id UUID)
RETURNS TABLE(id UUID) AS $$
BEGIN
    RETURN QUERY
    WITH RECURSIVE hierarchy_tree AS (
        SELECT h.id FROM hierarchies h
        INNER JOIN profiles p ON p.hierarchy_id = h.id
        WHERE p.id = p_profile_id
        UNION ALL
        SELECT h.id FROM hierarchies h
        INNER JOIN hierarchy_tree ht ON h.parent_id = ht.id
    )
    SELECT id FROM hierarchy_tree;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- Auto-create activity when pastoring log is inserted
-- ============================================================
CREATE OR REPLACE FUNCTION create_activity_from_pastoring_log()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO activities (member_id, user_id, type, description_zh_hant, description_zh_hans)
    VALUES (
        NEW.member_id,
        NEW.user_id,
        NEW.action,
        NEW.summary,
        NEW.summary
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER pastoring_log_creates_activity
    AFTER INSERT ON pastoring_logs
    FOR EACH ROW EXECUTE FUNCTION create_activity_from_pastoring_log();
