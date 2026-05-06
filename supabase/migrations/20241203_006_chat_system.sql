-- Chat/Messaging System Migration
-- Migration: 20241203_006_chat_system.sql

-- =====================================================
-- CHAT SYSTEM TABLES
-- =====================================================

-- Create ENUM types for chat system
CREATE TYPE conversation_type AS ENUM ('direct', 'group', 'class');
CREATE TYPE message_type AS ENUM ('text', 'image', 'file', 'system', 'voice');
CREATE TYPE participant_role AS ENUM ('member', 'admin', 'owner');

-- =====================================================
-- 1. CONVERSATIONS TABLE
-- =====================================================

CREATE TABLE public.conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Type and Info
    type conversation_type NOT NULL DEFAULT 'direct',
    title TEXT, -- For group/class chats
    description TEXT,
    avatar_url TEXT,
    
    -- Creator
    created_by UUID REFERENCES public.users(id),
    
    -- Class Integration (for class conversations)
    class_id UUID REFERENCES public.classes(id),
    
    -- Activity
    last_message_at TIMESTAMPTZ DEFAULT NOW(),
    last_message_text TEXT, -- For preview
    
    -- Settings
    settings JSONB DEFAULT '{
        "allowFiles": true,
        "allowImages": true,
        "allowVoice": true,
        "maxFileSize": 10485760,
        "onlyAdminsCanPost": false
    }'::jsonb,
    
    -- Metadata
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 2. CONVERSATION PARTICIPANTS TABLE
-- =====================================================

CREATE TABLE public.conversation_participants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Relations
    conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    
    -- Role
    role participant_role DEFAULT 'member',
    
    -- Status
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    left_at TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT true,
    
    -- Reading Status
    last_read_at TIMESTAMPTZ DEFAULT NOW(),
    last_read_message_id UUID, -- Reference to last read message
    
    -- Notifications
    is_muted BOOLEAN DEFAULT false,
    muted_until TIMESTAMPTZ,
    
    -- Typing Indicator
    is_typing BOOLEAN DEFAULT false,
    typing_updated_at TIMESTAMPTZ,
    
    -- Unique constraint
    UNIQUE(conversation_id, user_id)
);

-- =====================================================
-- 3. MESSAGES TABLE
-- =====================================================

CREATE TABLE public.messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Relations
    conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE NOT NULL,
    sender_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    
    -- Content
    message_text TEXT,
    message_type message_type DEFAULT 'text',
    
    -- Attachments (for images/files)
    attachments JSONB, -- [{url, name, size, type, thumbnailUrl}]
    
    -- Reply/Thread
    reply_to_message_id UUID REFERENCES public.messages(id),
    
    -- Mentions
    mentions UUID[], -- Array of user IDs
    
    -- Status
    is_edited BOOLEAN DEFAULT false,
    edited_at TIMESTAMPTZ,
    is_deleted BOOLEAN DEFAULT false,
    deleted_at TIMESTAMPTZ,
    deleted_by UUID REFERENCES public.users(id),
    
    -- Pinned
    is_pinned BOOLEAN DEFAULT false,
    pinned_by UUID REFERENCES public.users(id),
    pinned_at TIMESTAMPTZ,
    
    -- Metadata
    sent_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 4. MESSAGE REACTIONS TABLE
-- =====================================================

CREATE TABLE public.message_reactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Relations
    message_id UUID REFERENCES public.messages(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    
    -- Reaction
    emoji VARCHAR(10) NOT NULL, -- Unicode emoji
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- One reaction per user per message per emoji
    UNIQUE(message_id, user_id, emoji)
);

-- =====================================================
-- 5. MESSAGE READS TABLE (Read Receipts)
-- =====================================================

CREATE TABLE public.message_reads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Relations
    message_id UUID REFERENCES public.messages(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    
    -- Metadata
    read_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- One read per user per message
    UNIQUE(message_id, user_id)
);

-- =====================================================
-- 6. TYPING INDICATORS TABLE (Optional - can use in-memory)
-- =====================================================

CREATE TABLE public.typing_indicators (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Relations
    conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    
    -- Status
    started_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '10 seconds',
    
    -- Unique per user per conversation
    UNIQUE(conversation_id, user_id)
);

-- =====================================================
-- INDEXES for Performance
-- =====================================================

-- Conversations
CREATE INDEX idx_conversations_created_by ON public.conversations(created_by);
CREATE INDEX idx_conversations_class_id ON public.conversations(class_id);
CREATE INDEX idx_conversations_type ON public.conversations(type);
CREATE INDEX idx_conversations_last_message ON public.conversations(last_message_at DESC);

-- Participants
CREATE INDEX idx_participants_conversation ON public.conversation_participants(conversation_id);
CREATE INDEX idx_participants_user ON public.conversation_participants(user_id);
CREATE INDEX idx_participants_active ON public.conversation_participants(conversation_id, is_active);

-- Messages
CREATE INDEX idx_messages_conversation ON public.messages(conversation_id, sent_at DESC);
CREATE INDEX idx_messages_sender ON public.messages(sender_id);
CREATE INDEX idx_messages_reply_to ON public.messages(reply_to_message_id);
CREATE INDEX idx_messages_deleted ON public.messages(is_deleted, conversation_id);
CREATE INDEX idx_messages_pinned ON public.messages(conversation_id, is_pinned) WHERE is_pinned = true;

-- Reactions
CREATE INDEX idx_reactions_message ON public.message_reactions(message_id);
CREATE INDEX idx_reactions_user ON public.message_reactions(user_id);

-- Reads
CREATE INDEX idx_reads_message ON public.message_reads(message_id);
CREATE INDEX idx_reads_user ON public.message_reads(user_id);

-- Typing Indicators
CREATE INDEX idx_typing_conversation ON public.typing_indicators(conversation_id);
CREATE INDEX idx_typing_expires ON public.typing_indicators(expires_at);

-- =====================================================
-- TRIGGERS for updated_at
-- =====================================================

CREATE TRIGGER update_conversations_updated_at 
    BEFORE UPDATE ON public.conversations 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_messages_updated_at 
    BEFORE UPDATE ON public.messages 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- TRIGGER: Update conversation last_message
-- =====================================================

CREATE OR REPLACE FUNCTION update_conversation_last_message()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE public.conversations
        SET 
            last_message_at = NEW.sent_at,
            last_message_text = CASE 
                WHEN NEW.message_type = 'text' THEN LEFT(NEW.message_text, 100)
                WHEN NEW.message_type = 'image' THEN '📷 صورة'
                WHEN NEW.message_type = 'file' THEN '📎 ملف'
                WHEN NEW.message_type = 'voice' THEN '🎤 رسالة صوتية'
                ELSE 'رسالة'
            END
        WHERE id = NEW.conversation_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_conversation_last_message
    AFTER INSERT ON public.messages
    FOR EACH ROW
    EXECUTE FUNCTION update_conversation_last_message();

-- =====================================================
-- FUNCTION: Get unread message count
-- =====================================================

CREATE OR REPLACE FUNCTION get_unread_count(
    p_conversation_id UUID,
    p_user_id UUID
)
RETURNS INTEGER AS $$
DECLARE
    last_read TIMESTAMPTZ;
    unread_count INTEGER;
BEGIN
    -- Get last read timestamp
    SELECT last_read_at INTO last_read
    FROM public.conversation_participants
    WHERE conversation_id = p_conversation_id 
      AND user_id = p_user_id;
    
    -- Count messages since last read
    SELECT COUNT(*) INTO unread_count
    FROM public.messages
    WHERE conversation_id = p_conversation_id
      AND sender_id != p_user_id
      AND sent_at > COALESCE(last_read, '1970-01-01'::timestamptz)
      AND is_deleted = false;
    
    RETURN COALESCE(unread_count, 0);
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- FUNCTION: Mark messages as read
-- =====================================================

CREATE OR REPLACE FUNCTION mark_messages_as_read(
    p_conversation_id UUID,
    p_user_id UUID,
    p_up_to_message_id UUID DEFAULT NULL
)
RETURNS VOID AS $$
DECLARE
    cutoff_time TIMESTAMPTZ;
BEGIN
    -- Get timestamp of the cutoff message
    IF p_up_to_message_id IS NOT NULL THEN
        SELECT sent_at INTO cutoff_time
        FROM public.messages
        WHERE id = p_up_to_message_id;
    ELSE
        cutoff_time := NOW();
    END IF;
    
    -- Update participant's last read
    UPDATE public.conversation_participants
    SET 
        last_read_at = cutoff_time,
        last_read_message_id = p_up_to_message_id
    WHERE conversation_id = p_conversation_id
      AND user_id = p_user_id;
    
    -- Insert read receipts for unread messages
    INSERT INTO public.message_reads (message_id, user_id, read_at)
    SELECT m.id, p_user_id, NOW()
    FROM public.messages m
    WHERE m.conversation_id = p_conversation_id
      AND m.sender_id != p_user_id
      AND m.sent_at <= cutoff_time
      AND m.is_deleted = false
      AND NOT EXISTS (
          SELECT 1 FROM public.message_reads mr
          WHERE mr.message_id = m.id AND mr.user_id = p_user_id
      )
    ON CONFLICT (message_id, user_id) DO NOTHING;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- FUNCTION: Clean up old typing indicators
-- =====================================================

CREATE OR REPLACE FUNCTION cleanup_expired_typing()
RETURNS VOID AS $$
BEGIN
    DELETE FROM public.typing_indicators
    WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- POLICIES (Row Level Security)
-- =====================================================

-- Enable RLS
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_reads ENABLE ROW LEVEL SECURITY;

-- Conversations: Users can see conversations they're part of
CREATE POLICY users_view_own_conversations ON public.conversations
    FOR SELECT
    USING (
        id IN (
            SELECT conversation_id 
            FROM public.conversation_participants 
            WHERE user_id = auth.uid() AND is_active = true
        )
    );

-- Participants: Users can see participants in their conversations
CREATE POLICY users_view_participants ON public.conversation_participants
    FOR SELECT
    USING (
        conversation_id IN (
            SELECT conversation_id 
            FROM public.conversation_participants 
            WHERE user_id = auth.uid()
        )
    );

-- Messages: Users can see messages in their conversations
CREATE POLICY users_view_messages ON public.messages
    FOR SELECT
    USING (
        conversation_id IN (
            SELECT conversation_id 
            FROM public.conversation_participants 
            WHERE user_id = auth.uid() AND is_active = true
        )
        AND is_deleted = false
    );

-- Messages: Users can send messages to their conversations
CREATE POLICY users_send_messages ON public.messages
    FOR INSERT
    WITH CHECK (
        sender_id = auth.uid()
        AND conversation_id IN (
            SELECT conversation_id 
            FROM public.conversation_participants 
            WHERE user_id = auth.uid() AND is_active = true
        )
    );

-- Reactions: Users can add reactions to messages they can see
CREATE POLICY users_add_reactions ON public.message_reactions
    FOR INSERT
    WITH CHECK (
        user_id = auth.uid()
        AND message_id IN (
            SELECT m.id FROM public.messages m
            WHERE m.conversation_id IN (
                SELECT conversation_id 
                FROM public.conversation_participants 
                WHERE user_id = auth.uid()
            )
        )
    );

-- =====================================================
-- COMMENTS for Documentation
-- =====================================================

COMMENT ON TABLE public.conversations IS 'Chat conversations (direct, group, class)';
COMMENT ON TABLE public.conversation_participants IS 'Users participating in conversations';
COMMENT ON TABLE public.messages IS 'Chat messages';
COMMENT ON TABLE public.message_reactions IS 'Emoji reactions to messages';
COMMENT ON TABLE public.message_reads IS 'Read receipts for messages';
COMMENT ON TABLE public.typing_indicators IS 'Real-time typing indicators';

COMMENT ON FUNCTION get_unread_count IS 'Get count of unread messages for a user in a conversation';
COMMENT ON FUNCTION mark_messages_as_read IS 'Mark messages as read up to a specific message';
COMMENT ON FUNCTION cleanup_expired_typing IS 'Remove expired typing indicators';
