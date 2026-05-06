-- Educational Content Platform Migration
-- Migration: 20241203_007_content_platform.sql

-- =====================================================
-- EDUCATIONAL CONTENT PLATFORM
-- =====================================================

-- Create ENUM types
CREATE TYPE content_type AS ENUM ('video', 'document', 'link', 'interactive', 'audio');
CREATE TYPE access_level AS ENUM ('public', 'enrolled', 'premium');

-- =====================================================
-- 1. CONTENT CATEGORIES TABLE
-- =====================================================

CREATE TABLE public.content_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Category Info
    name TEXT NOT NULL,
    name_ar TEXT,
    description TEXT,
    
    -- Hierarchy
    parent_id UUID REFERENCES public.content_categories(id),
    
    -- Display
    icon TEXT,
    color TEXT DEFAULT '#3B82F6',
    order_index INTEGER DEFAULT 0,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 2. CONTENT ITEMS TABLE
-- =====================================================

CREATE TABLE public.content_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Content Info
    title TEXT NOT NULL,
    description TEXT,
    content_type content_type NOT NULL,
    
    -- File/URL Info
    file_url TEXT,
    thumbnail_url TEXT,
    external_url TEXT, -- For links
    
    -- Video/Audio Metadata
    duration_seconds INTEGER,
    file_size BIGINT,
    mime_type TEXT,
    
    -- Organization
    subject_id UUID REFERENCES public.subjects(id),
    class_id UUID REFERENCES public.classes(id),
    category_id UUID REFERENCES public.content_categories(id),
    tags TEXT[],
    
    -- Ordering & Visibility
    order_index INTEGER DEFAULT 0,
    is_published BOOLEAN DEFAULT false,
    is_featured BOOLEAN DEFAULT false,
    published_at TIMESTAMPTZ,
    
    -- Access Control
    access_level access_level DEFAULT 'enrolled',
    
    -- Engagement Stats
    views_count INTEGER DEFAULT 0,
    likes_count INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    
    -- Metadata
    created_by UUID REFERENCES public.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 3. CONTENT PROGRESS TABLE
-- =====================================================

CREATE TABLE public.content_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Relations
    content_id UUID REFERENCES public.content_items(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    
    -- Progress Tracking
    progress_percentage NUMERIC(5,2) DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
    last_position_seconds INTEGER DEFAULT 0, -- For videos
    is_completed BOOLEAN DEFAULT false,
    completed_at TIMESTAMPTZ,
    
    -- Activity Tracking
    time_spent_seconds INTEGER DEFAULT 0,
    views_count INTEGER DEFAULT 0,
    last_accessed_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- One progress record per user per content
    UNIQUE(content_id, user_id)
);

-- =====================================================
-- 4. CONTENT COMMENTS TABLE
-- =====================================================

CREATE TABLE public.content_comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Relations
    content_id UUID REFERENCES public.content_items(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    parent_id UUID REFERENCES public.content_comments(id), -- For replies
    
    -- Comment Content
    comment_text TEXT NOT NULL,
    timestamp_seconds INTEGER, -- For video timestamp comments
    
    -- Status
    is_edited BOOLEAN DEFAULT false,
    edited_at TIMESTAMPTZ,
    is_deleted BOOLEAN DEFAULT false,
    deleted_at TIMESTAMPTZ,
    
    -- Engagement
    likes_count INTEGER DEFAULT 0,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 5. CONTENT LIKES TABLE
-- =====================================================

CREATE TABLE public.content_likes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Relations
    content_id UUID REFERENCES public.content_items(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- One like per user per content
    UNIQUE(content_id, user_id)
);

-- =====================================================
-- 6. CONTENT BOOKMARKS TABLE
-- =====================================================

CREATE TABLE public.content_bookmarks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Relations
    content_id UUID REFERENCES public.content_items(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    
    -- Optional: Organize bookmarks into folders
    folder_name TEXT,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- One bookmark per user per content
    UNIQUE(content_id, user_id)
);

-- =====================================================
-- INDEXES for Performance
-- =====================================================

-- Categories
CREATE INDEX idx_content_categories_parent ON public.content_categories(parent_id);
CREATE INDEX idx_content_categories_order ON public.content_categories(order_index);

-- Content Items
CREATE INDEX idx_content_items_type ON public.content_items(content_type);
CREATE INDEX idx_content_items_subject ON public.content_items(subject_id);
CREATE INDEX idx_content_items_class ON public.content_items(class_id);
CREATE INDEX idx_content_items_category ON public.content_items(category_id);
CREATE INDEX idx_content_items_created_by ON public.content_items(created_by);
CREATE INDEX idx_content_items_published ON public.content_items(is_published);
CREATE INDEX idx_content_items_featured ON public.content_items(is_featured) WHERE is_featured = true;
CREATE INDEX idx_content_items_tags ON public.content_items USING GIN(tags);
CREATE INDEX idx_content_items_created_at ON public.content_items(created_at DESC);

-- Progress
CREATE INDEX idx_content_progress_content ON public.content_progress(content_id);
CREATE INDEX idx_content_progress_user ON public.content_progress(user_id);
CREATE INDEX idx_content_progress_completed ON public.content_progress(is_completed);
CREATE INDEX idx_content_progress_last_accessed ON public.content_progress(last_accessed_at DESC);

-- Comments
CREATE INDEX idx_content_comments_content ON public.content_comments(content_id);
CREATE INDEX idx_content_comments_user ON public.content_comments(user_id);
CREATE INDEX idx_content_comments_parent ON public.content_comments(parent_id);
CREATE INDEX idx_content_comments_deleted ON public.content_comments(is_deleted);

-- Likes
CREATE INDEX idx_content_likes_content ON public.content_likes(content_id);
CREATE INDEX idx_content_likes_user ON public.content_likes(user_id);

-- Bookmarks
CREATE INDEX idx_content_bookmarks_user ON public.content_bookmarks(user_id);
CREATE INDEX idx_content_bookmarks_content ON public.content_bookmarks(content_id);

-- =====================================================
-- TRIGGERS for updated_at
-- =====================================================

CREATE TRIGGER update_content_categories_updated_at 
    BEFORE UPDATE ON public.content_categories 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_content_items_updated_at 
    BEFORE UPDATE ON public.content_items 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_content_progress_updated_at 
    BEFORE UPDATE ON public.content_progress 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_content_comments_updated_at 
    BEFORE UPDATE ON public.content_comments 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- TRIGGER: Update content stats on like/comment
-- =====================================================

CREATE OR REPLACE FUNCTION update_content_stats()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_TABLE_NAME = 'content_likes' THEN
        IF TG_OP = 'INSERT' THEN
            UPDATE public.content_items 
            SET likes_count = likes_count + 1 
            WHERE id = NEW.content_id;
        ELSIF TG_OP = 'DELETE' THEN
            UPDATE public.content_items 
            SET likes_count = GREATEST(0, likes_count - 1) 
            WHERE id = OLD.content_id;
        END IF;
    ELSIF TG_TABLE_NAME = 'content_comments' THEN
        IF TG_OP = 'INSERT' AND NEW.is_deleted = false THEN
            UPDATE public.content_items 
            SET comments_count = comments_count + 1 
            WHERE id = NEW.content_id;
        ELSIF TG_OP = 'UPDATE' AND OLD.is_deleted = false AND NEW.is_deleted = true THEN
            UPDATE public.content_items 
            SET comments_count = GREATEST(0, comments_count - 1) 
            WHERE id = NEW.content_id;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_content_likes_count
    AFTER INSERT OR DELETE ON public.content_likes
    FOR EACH ROW EXECUTE FUNCTION update_content_stats();

CREATE TRIGGER trigger_update_content_comments_count
    AFTER INSERT OR UPDATE ON public.content_comments
    FOR EACH ROW EXECUTE FUNCTION update_content_stats();

-- =====================================================
-- FUNCTION: Get user's learning progress
-- =====================================================

CREATE OR REPLACE FUNCTION get_user_learning_stats(p_user_id UUID)
RETURNS TABLE (
    total_content INTEGER,
    completed_content INTEGER,
    in_progress_content INTEGER,
    total_time_spent INTEGER,
    completion_rate NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*)::INTEGER as total_content,
        SUM(CASE WHEN is_completed THEN 1 ELSE 0 END)::INTEGER as completed_content,
        SUM(CASE WHEN progress_percentage > 0 AND NOT is_completed THEN 1 ELSE 0 END)::INTEGER as in_progress_content,
        COALESCE(SUM(time_spent_seconds), 0)::INTEGER as total_time_spent,
        CASE 
            WHEN COUNT(*) > 0 THEN (SUM(CASE WHEN is_completed THEN 1 ELSE 0 END)::NUMERIC / COUNT(*) * 100)
            ELSE 0 
        END as completion_rate
    FROM public.content_progress
    WHERE user_id = p_user_id;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- FUNCTION: Get popular content
-- =====================================================

CREATE OR REPLACE FUNCTION get_popular_content(
    p_limit INTEGER DEFAULT 10,
    p_content_type content_type DEFAULT NULL,
    p_subject_id UUID DEFAULT NULL
)
RETURNS TABLE (
    content_id UUID,
    title TEXT,
    content_type content_type,
    views_count INTEGER,
    likes_count INTEGER,
    avg_completion_rate NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ci.id as content_id,
        ci.title,
        ci.content_type,
        ci.views_count,
        ci.likes_count,
        COALESCE(AVG(cp.progress_percentage), 0) as avg_completion_rate
    FROM public.content_items ci
    LEFT JOIN public.content_progress cp ON ci.id = cp.content_id
    WHERE ci.is_published = true
        AND (p_content_type IS NULL OR ci.content_type = p_content_type)
        AND (p_subject_id IS NULL OR ci.subject_id = p_subject_id)
    GROUP BY ci.id, ci.title, ci.content_type, ci.views_count, ci.likes_count
    ORDER BY (ci.views_count + ci.likes_count * 2) DESC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- POLICIES (Row Level Security)
-- =====================================================

ALTER TABLE public.content_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_likes ENABLE ROW LEVEL SECURITY;

-- Users can view published content
CREATE POLICY users_view_published_content ON public.content_items
    FOR SELECT
    USING (is_published = true OR created_by = auth.uid());

-- Users can view their own progress
CREATE POLICY users_view_own_progress ON public.content_progress
    FOR ALL
    USING (user_id = auth.uid());

-- Users can view comments on content they can access
CREATE POLICY users_view_comments ON public.content_comments
    FOR SELECT
    USING (
        is_deleted = false
        AND content_id IN (
            SELECT id FROM public.content_items 
            WHERE is_published = true OR created_by = auth.uid()
        )
    );

-- Users can manage their own comments
CREATE POLICY users_manage_own_comments ON public.content_comments
    FOR ALL
    USING (user_id = auth.uid());

-- =====================================================
-- COMMENTS for Documentation
-- =====================================================

COMMENT ON TABLE public.content_items IS 'Educational content (videos, documents, links)';
COMMENT ON TABLE public.content_categories IS 'Categories for organizing content';
COMMENT ON TABLE public.content_progress IS 'User progress tracking for content';
COMMENT ON TABLE public.content_comments IS 'Comments on content items';
COMMENT ON TABLE public.content_likes IS 'Likes on content items';
COMMENT ON TABLE public.content_bookmarks IS 'User bookmarks/favorites';

COMMENT ON FUNCTION get_user_learning_stats IS 'Get learning statistics for a user';
COMMENT ON FUNCTION get_popular_content IS 'Get trending/popular content';
