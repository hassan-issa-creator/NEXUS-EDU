-- Million Platform - Database Schema for Million Dialogue Feature
-- Migration: 001_million_tables.sql
-- Description: Create core tables for the Million Dialogue multiplayer quiz system

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Million Rooms Table
-- Stores game room information
CREATE TABLE IF NOT EXISTS million_rooms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    host_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'waiting' CHECK (status IN ('waiting', 'in_progress', 'finished', 'cancelled')),
    type VARCHAR(50) DEFAULT 'public' CHECK (type IN ('public', 'private')),
    settings JSONB DEFAULT '{
        "maxPlayers": 10,
        "questionCount": 10,
        "timeLimit": 15,
        "difficulty": "mixed"
    }'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Million Rounds Table
-- Stores individual rounds within a room
CREATE TABLE IF NOT EXISTS million_rounds (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_id UUID NOT NULL REFERENCES million_rooms(id) ON DELETE CASCADE,
    round_number INT NOT NULL,
    started_at TIMESTAMP WITH TIME ZONE,
    finished_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(room_id, round_number)
);

-- Million Questions Table
-- Stores the question bank in Arabic
CREATE TABLE IF NOT EXISTS million_questions (
    id SERIAL PRIMARY KEY,
    text_ar TEXT NOT NULL,
    options JSONB NOT NULL CHECK (jsonb_array_length(options) >= 2 AND jsonb_array_length(options) <= 4),
    correct_index INT NOT NULL CHECK (correct_index >= 0 AND correct_index <= 3),
    difficulty INT NOT NULL DEFAULT 1 CHECK (difficulty >= 1 AND difficulty <= 5),
    tags JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Million Round Questions Table
-- Links questions to specific rounds
CREATE TABLE IF NOT EXISTS million_round_questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    round_id UUID NOT NULL REFERENCES million_rounds(id) ON DELETE CASCADE,
    question_id INT NOT NULL REFERENCES million_questions(id),
    order_index INT NOT NULL CHECK (order_index >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(round_id, order_index),
    UNIQUE(round_id, question_id)
);

-- Million Answers Table
-- Stores player answers and scores
CREATE TABLE IF NOT EXISTS million_answers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    round_id UUID NOT NULL REFERENCES million_rounds(id) ON DELETE CASCADE,
    question_id INT NOT NULL REFERENCES million_questions(id),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    chosen_index INT NOT NULL CHECK (chosen_index >= 0 AND chosen_index <= 3),
    time_taken INT NOT NULL CHECK (time_taken >= 0),
    points_awarded INT DEFAULT 0 CHECK (points_awarded >= 0),
    is_correct BOOLEAN GENERATED ALWAYS AS (
        chosen_index = (SELECT correct_index FROM million_questions WHERE id = question_id)
    ) STORED,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(round_id, question_id, user_id)
);

-- Million Scores Table
-- Aggregates total scores per room per user
CREATE TABLE IF NOT EXISTS million_scores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_id UUID NOT NULL REFERENCES million_rooms(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    total_points INT DEFAULT 0 CHECK (total_points >= 0),
    questions_answered INT DEFAULT 0 CHECK (questions_answered >= 0),
    correct_answers INT DEFAULT 0 CHECK (correct_answers >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(room_id, user_id)
);

-- Room Participants Table
-- Tracks who joined which rooms
CREATE TABLE IF NOT EXISTS million_room_participants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_id UUID NOT NULL REFERENCES million_rooms(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    left_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT TRUE,
    UNIQUE(room_id, user_id)
);

-- Comments for documentation
COMMENT ON TABLE million_rooms IS 'Stores game rooms for Million Dialogue multiplayer quiz';
COMMENT ON TABLE million_rounds IS 'Stores individual rounds within each game room';
COMMENT ON TABLE million_questions IS 'Question bank in Arabic with multiple choice options';
COMMENT ON TABLE million_round_questions IS 'Links questions to specific rounds';
COMMENT ON TABLE million_answers IS 'Stores player answers with timing and points';
COMMENT ON TABLE million_scores IS 'Aggregated scores per player per room';
COMMENT ON TABLE million_room_participants IS 'Tracks room membership';

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_million_rooms_updated_at BEFORE UPDATE ON million_rooms
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_million_questions_updated_at BEFORE UPDATE ON million_questions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_million_scores_updated_at BEFORE UPDATE ON million_scores
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
