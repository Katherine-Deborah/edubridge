-- db/init.sql
-- This script runs automatically when the PostgreSQL container starts

-- Users table (for both students and teachers)
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    student_id VARCHAR(50) UNIQUE, -- Optional student ID
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('student', 'teacher')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Sessions table (for tracking educational sessions)
CREATE TABLE sessions (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User sessions progress table
CREATE TABLE user_session_progress (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    session_id INTEGER REFERENCES sessions(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed')),
    reflection_text TEXT,
    last_accessed TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    UNIQUE(user_id, session_id)
);

-- Insert sample users with hashed passwords
-- Password for all users is: password123
INSERT INTO users (email, student_id, password_hash, first_name, last_name, role) VALUES
('john.doe@student.edu', 'STU001', '$2b$10$cmZJIg4qrqYWPDwgXefQ3.f557DrbHQdevok498VLj7CUn2Cltoem', 'John', 'Doe', 'student'),
('jane.smith@student.edu', 'STU002', '$2b$10$cmZJIg4qrqYWPDwgXefQ3.f557DrbHQdevok498VLj7CUn2Cltoem', 'Jane', 'Smith', 'student'),
('mike.johnson@student.edu', 'STU003', '$2b$10$cmZJIg4qrqYWPDwgXefQ3.f557DrbHQdevok498VLj7CUn2Cltoem', 'Mike', 'Johnson', 'student'),
('sarah.teacher@school.edu', NULL, '$2b$10$cmZJIg4qrqYWPDwgXefQ3.f557DrbHQdevok498VLj7CUn2Cltoem', 'Sarah', 'Wilson', 'teacher'),
('robert.teacher@school.edu', NULL, '$2b$10$cmZJIg4qrqYWPDwgXefQ3.f557DrbHQdevok498VLj7CUn2Cltoem', 'Robert', 'Brown', 'teacher');

-- Run this in your database to add more sample data
-- You can execute this by connecting to your Docker container:
-- docker exec -it student_dashboard_db psql -U postgres -d student_dashboard

-- Add more sessions
INSERT INTO sessions (title, description) VALUES
('Time Management Mastery', 'Learn effective time management techniques for academic success'),
('Stress Management Toolkit', 'Develop healthy coping strategies for academic pressure'),
('Goal Setting Workshop', 'Create SMART goals and action plans for your future'),
('Communication Skills', 'Improve your verbal and written communication abilities'),
('Study Strategies', 'Discover effective study methods and memory techniques');

-- Add more varied progress data
INSERT INTO user_session_progress (user_id, session_id, status, reflection_text, last_accessed, completed_at) VALUES
-- John Doe (user_id = 1) - mixed progress
(1, 3, 'not_started', NULL, NULL, NULL),
(1, 4, 'completed', 'This session really helped me understand the importance of setting realistic goals. I now have a clear action plan for the next semester.', NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days'),
(1, 5, 'in_progress', 'Learning about different study techniques...', NOW() - INTERVAL '2 days', NULL),
(1, 6, 'not_started', NULL, NULL, NULL),
(1, 7, 'not_started', NULL, NULL, NULL),
(1, 8, 'completed', 'Great practical tips for managing academic stress. The breathing exercises are really helpful.', NOW() - INTERVAL '1 week', NOW() - INTERVAL '1 week'),

-- Jane Smith (user_id = 2) - more advanced
(2, 2, 'in_progress', 'Still working through the examples...', NOW() - INTERVAL '1 day', NULL),
(2, 3, 'completed', 'Amazing session! I feel more confident about tackling difficult problems now.', NOW() - INTERVAL '4 days', NOW() - INTERVAL '4 days'),
(2, 4, 'completed', 'The goal-setting framework is exactly what I needed. Already seeing results!', NOW() - INTERVAL '6 days', NOW() - INTERVAL '6 days'),
(2, 5, 'not_started', NULL, NULL, NULL),
(2, 6, 'not_started', NULL, NULL, NULL),
(2, 7, 'not_started', NULL, NULL, NULL),
(2, 8, 'completed', 'These stress management techniques are life-changing. Thank you!', NOW() - INTERVAL '2 weeks', NOW() - INTERVAL '2 weeks'),

-- Mike Johnson (user_id = 3) - just getting started
(3, 2, 'not_started', NULL, NULL, NULL),
(3, 3, 'not_started', NULL, NULL, NULL),
(3, 4, 'not_started', NULL, NULL, NULL),
(3, 5, 'not_started', NULL, NULL, NULL)