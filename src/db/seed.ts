import { Client } from "pg";

const SQL = `
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
        name VARCHAR(200) NOT NULL CHECK (name <> ''),
        surname VARCHAR(200) NOT NULL CHECK (surname <> ''),
        username VARCHAR(200) NOT NULL CHECK (username <> ''),
        password_hash VARCHAR(200) NOT NULL CHECK (password_hash <> ''),
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        role VARCHAR(50) NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'member', 'admin'))
    );
    -- Create the messages table
    CREATE TABLE IF NOT EXISTS messages(
        id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
        user_id INTEGER NOT NULL REFERENCES users (id) ON DELETE CASCADE, -- Foreign key to users table, when a user is deleted, their messages are also deleted
        title VARCHAR(200) NOT NULL CHECK (title <> ''),
        content TEXT NOT NULL CHECK (content <> ''),
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );

    -- Create indexes
    CREATE INDEX IF NOT EXISTS messages_user_id_idx ON messages (user_id);
    CREATE UNIQUE INDEX IF NOT EXISTS users_username_lower_idx on users (LOWER(username));
`;

async function main() {
  console.log("Seeding");
  if (!process.env.DATABASE_URL) {
    throw Error("DATABASE_URL is not set");
  }

  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });
  await client.connect();
  try {
    await client.query(SQL);
    console.log("Seeding finished");
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error("Seeding failed: ", err.message);
  process.exit(1);
});
