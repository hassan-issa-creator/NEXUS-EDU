-- Educational Games System Migration
-- Migration: 20241203_008_games_system.sql

-- =====================================================
-- EDUCATIONAL GAMES SYSTEM
-- =====================================================

-- Create ENUM types
CREATE TYPE game_type AS ENUM ('quiz', 'memory_match', 'word_puzzle', 'drag_drop', 'flashcards', 'trivia');
CREATE TYPE game_difficulty AS ENUM ('easy', 'medium', 'hard');
CREATE TYPE game_session_status AS ENUM ('in_progress', 'completed', 'abandoned');

-- =====================================================
-- 1. GAMES TABLE
-- =====================================================

CREATE TABLE public.games (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Game Info
    title TEXT NOT NULL,
    title_ar TEXT,
    description TEXT,
    game_type game_type NOT NULL,
    difficulty game_difficulty DEFAULT 'medium',
    
    -- Organization
    subject_id UUID REFERENCES public.subjects(id),
    class_id UUID REFERENCES public.classes(id),
    category TEXT, -- Optional category
    tags TEXT[],
    
    -- Game Configuration
    settings JSONB DEFAULT '{
        "timeLimit": null,
        "maxAttempts": 3,
        "showHints": true,
        "randomizeQuestions": true,
        "passingScore": 70
    }'::jsonb,
    
    -- Display
    thumbnail_url TEXT,
    icon TEXT,
    color TEXT DEFAULT '#8B5CF6',
    
    -- Stats
    total_questions INTEGER DEFAULT 0,
    max_score INTEGER DEFAULT 100,
    avg_completion_time INTEGER, -- in seconds
    
    -- Visibility
    is_published BOOLEAN DEFAULT false,
    is_featured BOOLEAN DEFAULT false,
    
    -- Engagement
    plays_count INTEGER DEFAULT 0,
    
    -- Metadata
    created_by UUID REFERENCES public.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 2. GAME QUESTIONS TABLE
-- =====================================================

CREATE TABLE public.game_questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    game_id UUID REFERENCES public.games(id) ON DELETE CASCADE NOT NULL,
    
    -- Question Content
    question_text TEXT NOT NULL,
    question_type TEXT DEFAULT 'multiple_choice', -- 'multiple_choice', 'true_false', 'matching', 'fill_blank'
    
    -- Options (JSONB for flexibility)
    -- For MCQ: [{text: "...", isCorrect: true}, ...]
    -- For matching: [{left: "...", right: "..."}, ...]
    options JSONB,
    
    -- Correct Answer
    correct_answer TEXT,
    
    -- Hints
    hint TEXT,
    explanation TEXT,
    
    -- Media
    image_url TEXT,
    audio_url TEXT,
    
    -- Scoring
    points INTEGER DEFAULT 10,
    time_limit_seconds INTEGER,
    
    -- Order
    order_index INTEGER DEFAULT 0,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 3. GAME SESSIONS TABLE
-- =====================================================

CREATE TABLE public.game_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Relations
    game_id UUID REFERENCES public.games(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    
    -- Session Info
    status game_session_status DEFAULT 'in_progress',
    
    -- Timing
    started_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    time_taken_seconds INTEGER,
    
    -- Scoring
    score INTEGER DEFAULT 0,
    max_score INTEGER,
    percentage NUMERIC(5,2),
    
    -- Progress
    questions_attempted INTEGER DEFAULT 0,
    questions_correct INTEGER DEFAULT 0,
    questions_total INTEGER,
    
    -- Streak & Bonuses
    current_streak INTEGER DEFAULT 0,
    max_streak INTEGER DEFAULT 0,
    bonus_points INTEGER DEFAULT 0,
    
    -- Performance Metrics
    avg_response_time NUMERIC(10,2), -- in seconds
    accuracy_rate NUMERIC(5,2),
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 4. GAME_SESSION_ANSWERS TABLE
-- =====================================================

CREATE TABLE public.game_session_answers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Relations
    session_id UUID REFERENCES public.game_sessions(id) ON DELETE CASCADE NOT NULL,
    question_id UUID REFERENCES public.game_questions(id) NOT NULL,
    
    -- Answer
    user_answer TEXT,
    is_correct BOOLEAN,
    
    -- Timing
    time_taken_seconds INTEGER,
    answered_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Scoring
    points_earned INTEGER DEFAULT 0,
    
    -- Hints Used
    hints_used INTEGER DEFAULT 0,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 5. GAME ACHIEVEMENTS TABLE
-- =====================================================

CREATE TABLE public.game_achievements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Achievement Info
    name TEXT NOT NULL,
    name_ar TEXT,
    description TEXT,
    icon TEXT,
    color TEXT DEFAULT '#FFD700',
    
    -- Criteria (JSONB for flexibility)
    -- Examples: {type: "score", min: 100}, {type: "streak", min: 5}
    criteria JSONB NOT NULL,
    
    -- Points
    points INTEGER DEFAULT 10,
    
    -- Display
    badge_url TEXT,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 6. USER ACHIEVEMENTS TABLE
-- =====================================================

CREATE TABLE public.user_achievements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Relations
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    achievement_id UUID REFERENCES public.game_achievements(id) ON DELETE CASCADE NOT NULL,
    
    -- Earned Info
    earned_at TIMESTAMPTZ DEFAULT NOW(),
    game_session_id UUID REFERENCES public.game_sessions(id),
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- One achievement per user
    UNIQUE(user_id, achievement_id)
);

-- =====================================================
-- 7. LEADERBOARD TABLE (Materialized for performance)
-- =====================================================

CREATE TABLE public.game_leaderboard (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Relations
    game_id UUID REFERENCES public.games(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    
    -- Best Performance
    best_score INTEGER DEFAULT 0,
    best_time_seconds INTEGER,
    total_plays INTEGER DEFAULT 0,
    total_wins INTEGER DEFAULT 0,
    
    -- Ranking
    rank INTEGER,
    
    -- Metadata
    last_played_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Unique per game per user
    UNIQUE(game_id, user_id)
);

-- =====================================================
-- INDEXES for Performance
-- =====================================================

-- Games
CREATE INDEX idx_games_type ON public.games(game_type);
CREATE INDEX idx_games_subject ON public.games(subject_id);
CREATE INDEX idx_games_class ON public.games(class_id);
CREATE INDEX idx_games_published ON public.games(is_published);
CREATE INDEX idx_games_featured ON public.games(is_featured) WHERE is_featured = true;
CREATE INDEX idx_games_tags ON public.games USING GIN(tags);

-- Game Questions
CREATE INDEX idx_game_questions_game ON public.game_questions(game_id);
CREATE INDEX idx_game_questions_order ON public.game_questions(game_id, order_index);

-- Game Sessions
CREATE INDEX idx_game_sessions_game ON public.game_sessions(game_id);
CREATE INDEX idx_game_sessions_user ON public.game_sessions(user_id);
CREATE INDEX idx_game_sessions_status ON public.game_sessions(status);
CREATE INDEX idx_game_sessions_score ON public.game_sessions(score DESC);
CREATE INDEX idx_game_sessions_completed ON public.game_sessions(completed_at DESC);

-- Session Answers
CREATE INDEX idx_game_session_answers_session ON public.game_session_answers(session_id);
CREATE INDEX idx_game_session_answers_question ON public.game_session_answers(question_id);

-- Leaderboard
CREATE INDEX idx_game_leaderboard_game ON public.game_leaderboard(game_id, best_score DESC);
CREATE INDEX idx_game_leaderboard_user ON public.game_leaderboard(user_id);
CREATE INDEX idx_game_leaderboard_rank ON public.game_leaderboard(game_id, rank);

-- User Achievements
CREATE INDEX idx_user_achievements_user ON public.user_achievements(user_id);
CREATE INDEX idx_user_achievements_achievement ON public.user_achievements(achievement_id);

-- =====================================================
-- TRIGGERS for updated_at
-- =====================================================

CREATE TRIGGER update_games_updated_at 
    BEFORE UPDATE ON public.games 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_game_questions_updated_at 
    BEFORE UPDATE ON public.game_questions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_game_sessions_updated_at 
    BEFORE UPDATE ON public.game_sessions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_game_leaderboard_updated_at 
    BEFORE UPDATE ON public.game_leaderboard 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- TRIGGER: Update leaderboard on session completion
-- =====================================================

CREATE OR REPLACE FUNCTION update_game_leaderboard()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
        -- Insert or update leaderboard entry
        INSERT INTO public.game_leaderboard (
            game_id, user_id, best_score, best_time_seconds, 
            total_plays, total_wins, last_played_at
        )
        VALUES (
            NEW.game_id, NEW.user_id, NEW.score, NEW.time_taken_seconds,
            1, CASE WHEN NEW.percentage >= 70 THEN 1 ELSE 0 END, NOW()
        )
        ON CONFLICT (game_id, user_id) DO UPDATE SET
            best_score = GREATEST(game_leaderboard.best_score, NEW.score),
            best_time_seconds = CASE 
                WHEN NEW.score > game_leaderboard.best_score THEN NEW.time_taken_seconds
                WHEN NEW.score = game_leaderboard.best_score THEN LEAST(COALESCE(game_leaderboard.best_time_seconds, 999999), NEW.time_taken_seconds)
                ELSE game_leaderboard.best_time_seconds
            END,
            total_plays = game_leaderboard.total_plays + 1,
            total_wins = game_leaderboard.total_wins + CASE WHEN NEW.percentage >= 70 THEN 1 ELSE 0 END,
            last_played_at = NOW(),
            updated_at = NOW();
        
        -- Update game plays count
        UPDATE public.games 
        SET plays_count = plays_count + 1
        WHERE id = NEW.game_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_game_leaderboard
    AFTER INSERT OR UPDATE ON public.game_sessions
    FOR EACH ROW EXECUTE FUNCTION update_game_leaderboard();

-- =====================================================
-- FUNCTION: Calculate session score
-- =====================================================

CREATE OR REPLACE FUNCTION calculate_game_session_score(p_session_id UUID)
RETURNS VOID AS $$
DECLARE
    total_points INTEGER;
    max_points INTEGER;
    correct_count INTEGER;
    total_count INTEGER;
BEGIN
    -- Calculate totals
    SELECT 
        COALESCE(SUM(points_earned), 0),
        COALESCE(SUM(q.points), 0),
        COUNT(CASE WHEN is_correct THEN 1 END),
        COUNT(*)
    INTO total_points, max_points, correct_count, total_count
    FROM public.game_session_answers gsa
    JOIN public.game_questions q ON gsa.question_id = q.id
    WHERE gsa.session_id = p_session_id;
    
    -- Update session
    UPDATE public.game_sessions
    SET 
        score = total_points,
        max_score = max_points,
        percentage = CASE WHEN max_points > 0 THEN (total_points::NUMERIC / max_points * 100) ELSE 0 END,
        questions_attempted = total_count,
        questions_correct = correct_count,
        accuracy_rate = CASE WHEN total_count > 0 THEN (correct_count::NUMERIC / total_count * 100) ELSE 0 END
    WHERE id = p_session_id;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- FUNCTION: Get leaderboard for a game
-- =====================================================

CREATE OR REPLACE FUNCTION get_game_leaderboard(
    p_game_id UUID,
    p_limit INTEGER DEFAULT 10,
    p_timeframe TEXT DEFAULT 'all_time' -- 'all_time', 'today', 'week', 'month'
)
RETURNS TABLE (
    rank BIGINT,
    user_id UUID,
    user_name TEXT,
    best_score INTEGER,
    best_time_seconds INTEGER,
    total_plays INTEGER,
    last_played_at TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ROW_NUMBER() OVER (ORDER BY lb.best_score DESC, lb.best_time_seconds ASC) as rank,
        lb.user_id,
        u.full_name as user_name,
        lb.best_score,
        lb.best_time_seconds,
        lb.total_plays,
        lb.last_played_at
    FROM public.game_leaderboard lb
    JOIN public.users u ON lb.user_id = u.id
    WHERE lb.game_id = p_game_id
        AND (
            p_timeframe = 'all_time' OR
            (p_timeframe = 'today' AND lb.last_played_at >= CURRENT_DATE) OR
            (p_timeframe = 'week' AND lb.last_played_at >= CURRENT_DATE - INTERVAL '7 days') OR
            (p_timeframe = 'month' AND lb.last_played_at >= CURRENT_DATE - INTERVAL '30 days')
        )
    ORDER BY lb.best_score DESC, lb.best_time_seconds ASC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- FUNCTION: Check and award achievements
-- =====================================================

CREATE OR REPLACE FUNCTION check_achievements(p_user_id UUID, p_session_id UUID)
RETURNS VOID AS $$
DECLARE
    session_record RECORD;
    achievement_record RECORD;
BEGIN
    -- Get session details
    SELECT * INTO session_record 
    FROM public.game_sessions 
    WHERE id = p_session_id;
    
    -- Loop through all achievements
    FOR achievement_record IN SELECT * FROM public.game_achievements LOOP
        -- Check criteria (simplified - expand based on needs)
        IF (achievement_record.criteria->>'type' = 'score' AND 
            session_record.score >= (achievement_record.criteria->>'min')::INTEGER)
        THEN
            -- Award achievement if not already earned
            INSERT INTO public.user_achievements (user_id, achievement_id, game_session_id)
            VALUES (p_user_id, achievement_record.id, p_session_id)
            ON CONFLICT (user_id, achievement_id) DO NOTHING;
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- POLICIES (Row Level Security)
-- =====================================================

ALTER TABLE public.games ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;

-- Users can view published games
CREATE POLICY users_view_published_games ON public.games
    FOR SELECT
    USING (is_published = true OR created_by = auth.uid());

-- Users can view their own sessions
CREATE POLICY users_view_own_sessions ON public.game_sessions
    FOR ALL
    USING (user_id = auth.uid());

-- Users can view their own achievements
CREATE POLICY users_view_own_achievements ON public.user_achievements
    FOR SELECT
    USING (user_id = auth.uid());

-- =====================================================
-- COMMENTS for Documentation
-- =====================================================

COMMENT ON TABLE public.games IS 'Educational games (quiz, puzzles, etc.)';
COMMENT ON TABLE public.game_questions IS 'Questions for games';
COMMENT ON TABLE public.game_sessions IS 'Game play sessions';
COMMENT ON TABLE public.game_session_answers IS 'Answers within game sessions';
COMMENT ON TABLE public.game_achievements IS 'Achievements/badges definition';
COMMENT ON TABLE public.user_achievements IS 'Achievements earned by users';
COMMENT ON TABLE public.game_leaderboard IS 'Leaderboard rankings for games';

COMMENT ON FUNCTION get_game_leaderboard IS 'Get ranked leaderboard for a game';
COMMENT ON FUNCTION calculate_game_session_score IS 'Calculate and update session score';
COMMENT ON FUNCTION check_achievements IS 'Check and award achievements after session';
