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

interface Message {
  id: number;
  content: string;
  created_at: Date;
  user_id: number;
}

interface MessageWithUser {
  id: number;
  title: string;
  content: string;
  created_at: Date;
  name: string;
  surname: string;
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

async function getMessages(): Promise<MessageWithUser[]> {
  const { rows } = await pool.query(
    "SELECT m.id, m.title, m.content, m.created_at, u.name, u.surname FROM messages m INNER JOIN users u ON m.user_id = u.id ORDER BY m.created_at DESC",
  );
  return rows;
}

async function createMessage({
  userId,
  title,
  content,
}: {
  userId: number;
  title: string;
  content: string;
}): Promise<void> {
  await pool.query(
    "INSERT INTO messages (user_id, title, content) VALUES ($1, $2, $3)",
    [userId, title, content],
  );
}

export {
  createUser,
  getUserByUsername,
  getUserById,
  getMessages,
  createMessage,
};
