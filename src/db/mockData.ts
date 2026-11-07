import { Client } from "pg";
import bcrypt from "bcryptjs";

const MOCK_PASSWORD = "password123";

const USERS = [
  { name: "Nora", surname: "Stone", username: "mock_user", role: "user" },
  { name: "Mia", surname: "Rivers", username: "mock_member", role: "member" },
  { name: "Adam", surname: "Woods", username: "mock_admin", role: "admin" },
];

const MESSAGES = [
  {
    username: "mock_admin",
    title: "Welcome to the club",
    content:
      "Be kind, keep it short, and remember that not everyone can see who wrote what.",
    hoursAgo: 72,
  },
  {
    username: "mock_member",
    title: "Finally joined",
    content: "It took me three tries to get the passcode right. Worth it.",
    hoursAgo: 48,
  },
  {
    username: "mock_user",
    title: "Who wrote these?",
    content: "I can read every message, but I have no idea who any of you are.",
    hoursAgo: 30,
  },
  {
    username: "mock_member",
    title: "A <b>tricky</b> title",
    content:
      "If this text looks bold or runs as code, the page is not escaping user input: <script>alert('xss')</script>",
    hoursAgo: 12,
  },
  {
    username: "mock_admin",
    title: "Coffee on Friday",
    content:
      "Anyone up for coffee after work on Friday? Reply with your own message.",
    hoursAgo: 5,
  },
  {
    username: "mock_user",
    title: "A very long message",
    content: "This one is here to check how the page handles long text. "
      .repeat(12)
      .trim(),
    hoursAgo: 1,
  },
];

async function main() {
  if (!process.env.DATABASE_URL) {
    throw Error("DATABASE_URL is not set");
  }
  // These accounts have a known password, so they must never reach a real database
  const { hostname } = new URL(process.env.DATABASE_URL);
  if (hostname !== "localhost" && hostname !== "127.0.0.1") {
    throw Error("Mock data can only be added to a local database");
  }

  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });
  await client.connect();
  try {
    await client.query("BEGIN");
    const passwordHash = await bcrypt.hash(MOCK_PASSWORD, 10);

    const ids = new Map<string, number>();
    for (const { name, surname, username, role } of USERS) {
      const { rows } = await client.query<{ id: number }>(
        `INSERT INTO users (name, surname, username, password_hash, role)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (LOWER(username)) DO UPDATE
         SET name = EXCLUDED.name, surname = EXCLUDED.surname,
             password_hash = EXCLUDED.password_hash, role = EXCLUDED.role
         RETURNING id`,
        [name, surname, username, passwordHash, role],
      );
      ids.set(username, rows[0].id);
    }

    // Only the mock users' messages are replaced, so running this twice adds no duplicates
    await client.query("DELETE FROM messages WHERE user_id = ANY($1)", [
      [...ids.values()],
    ]);
    for (const { username, title, content, hoursAgo } of MESSAGES) {
      await client.query(
        `INSERT INTO messages (user_id, title, content, created_at)
         VALUES ($1, $2, $3, now() - make_interval(hours => $4))`,
        [ids.get(username), title, content, hoursAgo],
      );
    }

    await client.query("COMMIT");
    console.log(
      `Added ${USERS.length} mock users and ${MESSAGES.length} messages`,
    );
    console.log(`Log in as ${USERS.map((u) => u.username).join(", ")}`);
    console.log(`Password for all of them: ${MOCK_PASSWORD}`);
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error("Adding mock data failed: ", err.message);
  process.exit(1);
});
