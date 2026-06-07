-- PostgreSQL Schema for UbutaberaHub

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    name VARCHAR(255),
    role VARCHAR(50) DEFAULT 'citizen',
    profile_photo VARCHAR(255),
    phone VARCHAR(50),
    is_verified BOOLEAN DEFAULT FALSE,
    verification_token UUID,
    reset_token UUID,
    reset_expires TIMESTAMP,
    specialization VARCHAR(255),
    years_experience INTEGER DEFAULT 0,
    law_firm VARCHAR(255),
    license_number VARCHAR(100),
    verification_status VARCHAR(50) DEFAULT 'pending',
    approved_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Cases Table
CREATE TABLE IF NOT EXISTS cases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    case_number VARCHAR(50) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    case_type VARCHAR(100),
    status VARCHAR(50) DEFAULT 'Pending',
    priority VARCHAR(50) DEFAULT 'medium',
    citizen_id UUID REFERENCES users(id),
    assigned_lawyer_id UUID REFERENCES users(id),
    assigned_judge_id UUID REFERENCES users(id),
    assigned_clerk_id UUID REFERENCES users(id),
    metadata JSONB DEFAULT '{}',
    filed_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Conversations Table
CREATE TABLE IF NOT EXISTS conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    subject VARCHAR(255),
    case_id UUID REFERENCES cases(id),
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Conversation Participants Table
CREATE TABLE IF NOT EXISTS conversation_participants (
    conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(50),
    unread_count INTEGER DEFAULT 0,
    PRIMARY KEY (conversation_id, user_id)
);

-- Messages Table
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES users(id),
    body TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) DEFAULT 'general',
    title VARCHAR(255),
    body TEXT,
    metadata JSONB DEFAULT '{}',
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Appointments Table
CREATE TABLE IF NOT EXISTS appointments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    citizen_id UUID REFERENCES users(id),
    lawyer_id UUID REFERENCES users(id),
    judge_id UUID REFERENCES users(id),
    clerk_id UUID REFERENCES users(id),
    case_id UUID REFERENCES cases(id),
    appointment_type VARCHAR(100),
    starts_at TIMESTAMP NOT NULL,
    duration_minutes INTEGER DEFAULT 30,
    mode VARCHAR(50) DEFAULT 'in-person',
    status VARCHAR(50) DEFAULT 'pending',
    notes TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Hearings Table
CREATE TABLE IF NOT EXISTS hearings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    case_id UUID REFERENCES cases(id),
    judge_id UUID REFERENCES users(id),
    lawyer_id UUID REFERENCES users(id),
    clerk_id UUID REFERENCES users(id),
    citizen_id UUID REFERENCES users(id),
    title VARCHAR(255),
    hearing_type VARCHAR(100),
    status VARCHAR(50) DEFAULT 'scheduled',
    scheduled_at TIMESTAMP NOT NULL,
    location VARCHAR(255),
    mode VARCHAR(50) DEFAULT 'physical',
    notes TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
