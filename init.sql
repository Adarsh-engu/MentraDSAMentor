-- init.sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- NextAuth.js standard tables
CREATE TABLE users (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  name VARCHAR(255),
  email VARCHAR(255),
  "emailVerified" TIMESTAMPTZ,
  image TEXT,
  PRIMARY KEY (id)
);

CREATE TABLE accounts (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  "userId" uuid NOT NULL,
  type VARCHAR(255) NOT NULL,
  provider VARCHAR(255) NOT NULL,
  "providerAccountId" VARCHAR(255) NOT NULL,
  refresh_token TEXT,
  access_token TEXT,
  expires_at BIGINT,
  id_token TEXT,
  scope TEXT,
  session_state TEXT,
  token_type TEXT,
  PRIMARY KEY (id),
  FOREIGN KEY ("userId") REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE sessions (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  "userId" uuid NOT NULL,
  expires TIMESTAMPTZ NOT NULL,
  "sessionToken" VARCHAR(255) NOT NULL,
  PRIMARY KEY (id),
  FOREIGN KEY ("userId") REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE verification_token (
  identifier TEXT,
  expires TIMESTAMPTZ NOT NULL,
  token TEXT NOT NULL,
  PRIMARY KEY (identifier, token)
);

-- Domain tables for Algo Mentor
CREATE TABLE platforms (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  name VARCHAR(50) NOT NULL UNIQUE, -- e.g., 'LeetCode', 'Codeforces'
  base_url VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (id)
);

CREATE TABLE problems (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  platform_id uuid NOT NULL,
  platform_problem_id VARCHAR(100) NOT NULL, -- e.g., 'two-sum'
  title VARCHAR(255) NOT NULL,
  difficulty VARCHAR(50), -- e.g., 'Easy', 'Medium', 'Hard'
  url VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (id),
  FOREIGN KEY (platform_id) REFERENCES platforms(id) ON DELETE CASCADE,
  UNIQUE (platform_id, platform_problem_id)
);

CREATE TABLE submissions (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL,
  problem_id uuid NOT NULL,
  status VARCHAR(50) NOT NULL, -- e.g., 'Accepted', 'Wrong Answer'
  language VARCHAR(50),
  submitted_at TIMESTAMPTZ NOT NULL,
  runtime_ms INT,
  memory_kb INT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (problem_id) REFERENCES problems(id) ON DELETE CASCADE
);

CREATE TABLE user_platforms (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL,
  platform_id uuid NOT NULL,
  handle VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (platform_id) REFERENCES platforms(id) ON DELETE CASCADE,
  UNIQUE (user_id, platform_id)
);

-- Basic data
INSERT INTO platforms (name, base_url) VALUES 
('LeetCode', 'https://leetcode.com'),
('Codeforces', 'https://codeforces.com'),
('Smart Interviews', 'https://smartinterviews.in');
