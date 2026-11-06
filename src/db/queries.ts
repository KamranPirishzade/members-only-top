import pool from "./pool.ts";

interface User {
  id: number;
  name: string;
  surname: string;
  username: string;
  password_hash: string;
  created_at: Date;
  role: "user" | "member" | "admin";
}

async function createUser({
  name,
  surname,
  username,
  passwordHash,
  role = "user",
}: {
  name: string;
  surname: string;
  username: string;
  passwordHash: string;
  role?: "user" | "member" | "admin";
}): Promise<void> {
  await pool.query(
    "INSERT INTO users (name, surname, username, password_hash, role) VALUES ($1, $2, $3, $4, $5)",
    [name, surname, username, passwordHash, role],
  );
}

async function getUserByUsername(username: string): Promise<User | undefined> {
  const { rows } = await pool.query(
    "SELECT * FROM users WHERE lower(username) = lower($1)",
    [username],
  );
  return rows[0];
}

async function getUserById(
  id: number,
): Promise<Omit<User, "password_hash"> | undefined> {
  const { rows } = await pool.query(
    "SELECT id, name, surname, username, role FROM users WHERE id = $1",
    [id],
  );

  return rows[0];
}

export { createUser, getUserByUsername, getUserById };
