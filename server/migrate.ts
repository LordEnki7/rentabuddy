import { Pool } from "pg";

export async function runMigrations() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL! });

  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        email TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        name TEXT NOT NULL,
        role TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'ACTIVE',
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS client_profiles (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id VARCHAR NOT NULL REFERENCES users(id),
        city TEXT,
        short_bio TEXT,
        profile_image TEXT,
        safety_agreement_accepted_at TIMESTAMP,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS buddy_profiles (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id VARCHAR NOT NULL REFERENCES users(id),
        headline TEXT,
        bio TEXT,
        city TEXT,
        hourly_rate DECIMAL(10,2),
        experience_years INTEGER,
        languages JSON,
        activities JSON,
        rating_average DECIMAL(3,2) DEFAULT 0,
        rating_count INTEGER DEFAULT 0,
        is_certified BOOLEAN DEFAULT false,
        identity_verified BOOLEAN DEFAULT false,
        background_check_passed BOOLEAN DEFAULT false,
        code_of_conduct_accepted_at TIMESTAMP,
        safety_protocol_accepted_at TIMESTAMP,
        profile_image TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS bookings (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        client_id VARCHAR NOT NULL REFERENCES users(id),
        buddy_id VARCHAR NOT NULL REFERENCES users(id),
        start_time TIMESTAMP NOT NULL,
        end_time TIMESTAMP NOT NULL,
        status TEXT NOT NULL DEFAULT 'PENDING',
        location_type TEXT NOT NULL,
        location_description TEXT,
        activity TEXT,
        client_notes TEXT,
        buddy_notes TEXT,
        total_price DECIMAL(10,2),
        payment_status TEXT DEFAULT 'PENDING',
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS reviews (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        booking_id VARCHAR NOT NULL REFERENCES bookings(id),
        client_id VARCHAR NOT NULL REFERENCES users(id),
        buddy_id VARCHAR NOT NULL REFERENCES users(id),
        rating INTEGER NOT NULL,
        comment TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS message_threads (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        client_id VARCHAR NOT NULL REFERENCES users(id),
        buddy_id VARCHAR NOT NULL REFERENCES users(id),
        last_message TEXT,
        last_message_at TIMESTAMP,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS messages (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        thread_id VARCHAR NOT NULL REFERENCES message_threads(id),
        sender_id VARCHAR NOT NULL REFERENCES users(id),
        content TEXT NOT NULL,
        read_at TIMESTAMP,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS availability (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        buddy_id VARCHAR NOT NULL REFERENCES users(id),
        day_of_week INTEGER NOT NULL,
        start_time TEXT NOT NULL,
        end_time TEXT NOT NULL,
        is_available BOOLEAN DEFAULT true
      );

      CREATE TABLE IF NOT EXISTS safety_reports (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        reporter_id VARCHAR NOT NULL REFERENCES users(id),
        reported_user_id VARCHAR NOT NULL REFERENCES users(id),
        booking_id VARCHAR REFERENCES bookings(id),
        category TEXT NOT NULL,
        description TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'OPEN',
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS transactions (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        booking_id VARCHAR NOT NULL REFERENCES bookings(id),
        amount DECIMAL(10,2) NOT NULL,
        status TEXT NOT NULL DEFAULT 'PENDING',
        stripe_payment_id TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS agents (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL,
        role TEXT NOT NULL,
        description TEXT NOT NULL,
        capabilities JSON NOT NULL,
        status TEXT NOT NULL DEFAULT 'ACTIVE',
        last_active_at TIMESTAMP,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS agent_jobs (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        agent_id VARCHAR NOT NULL REFERENCES agents(id),
        title TEXT NOT NULL,
        description TEXT,
        priority TEXT NOT NULL DEFAULT 'MEDIUM',
        status TEXT NOT NULL DEFAULT 'PENDING',
        result JSON,
        started_at TIMESTAMP,
        completed_at TIMESTAMP,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS agent_runs (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        agent_id VARCHAR NOT NULL REFERENCES agents(id),
        job_id VARCHAR REFERENCES agent_jobs(id),
        action_log JSON NOT NULL,
        output_summary TEXT,
        quality_score INTEGER,
        start_time TIMESTAMP NOT NULL,
        end_time TIMESTAMP,
        duration_ms INTEGER,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS agent_memory (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        agent_id VARCHAR NOT NULL REFERENCES agents(id),
        category TEXT NOT NULL,
        key TEXT NOT NULL,
        value JSON NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS session (
        sid VARCHAR NOT NULL COLLATE "default",
        sess JSON NOT NULL,
        expire TIMESTAMP(6) NOT NULL,
        CONSTRAINT session_pkey PRIMARY KEY (sid)
      );

      CREATE INDEX IF NOT EXISTS IDX_session_expire ON session (expire);
    `);

    console.log("Database migrations completed successfully");
  } finally {
    await pool.end();
  }
}
