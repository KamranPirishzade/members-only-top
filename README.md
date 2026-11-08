# Members Only

A private message board built for [The Odin Project](https://www.theodinproject.com/lessons/node-path-nodejs-members-only). Anyone can read the messages, but only club members can see who wrote them and when.

## Features

- Sign up and log in with sessions that are stored in PostgreSQL
- Passwords are hashed with bcrypt
- Logged-in users can post messages
- A secret passcode turns a user into a club member, and a second passcode makes them an admin
- Admins can delete messages
- Forms are validated on the server, and they keep what you typed when something is wrong

## What each role can do

| | Read messages | Post messages | See author and date | Delete messages |
| --- | --- | --- | --- | --- |
| Visitor | Yes | No | No | No |
| User | Yes | Yes | No | No |
| Member | Yes | Yes | Yes | No |
| Admin | Yes | Yes | Yes | Yes |

These rules are enforced on the server. Hidden authors and dates are never sent to the browser, and the routes that create or delete messages check the user's role themselves.

## Tech stack

- **Node.js 24** and **Express 5**, written in **TypeScript** (run directly by Node in development)
- **PostgreSQL** with the `pg` driver and plain SQL queries
- **Passport** (local strategy), **express-session** and **connect-pg-simple** for authentication
- **bcryptjs** for password hashing
- **express-validator** for form validation
- **EJS** templates and **Tailwind CSS**

## Database

```
users                       messages
-----                       --------
id            ◄──────────── user_id
name                        id
surname                     title
username                    content
password_hash               created_at
role
created_at
```

- `role` is one of `user`, `member` or `admin`, and new accounts start as `user`
- Usernames are unique, ignoring upper and lower case (a unique index on `LOWER(username)`)
- Deleting a user also deletes their messages (`ON DELETE CASCADE`)
- The `session` table is created automatically the first time the app runs

## Running locally

Requirements: Node.js 24 and a PostgreSQL database.

1. Install the dependencies:

   ```bash
   npm install
   ```

2. Copy the example environment file, then fill in the values:

   ```bash
   cp .env.example .env
   ```

3. Create the tables:

   ```bash
   npm run seed
   ```

4. Optionally, add sample messages and one account for each role:

   ```bash
   npm run seed:mock
   ```

   This creates `mock_user`, `mock_member` and `mock_admin`, all with the password `password123`. It only runs against a database on `localhost`.

5. Build the CSS and start the server:

   ```bash
   npm run build:css
   npm run dev
   ```

   Open http://localhost:3000. While working on styles, run `npm run watch:css` in a second terminal.

## Becoming a member or an admin

Log in, then go to one of these pages and enter the passcode you set in `.env`:

- `/membership/join` with `MEMBERSHIP_CODE`. Users can reach this page from the home page.
- `/membership/admin` with `ADMIN_CODE`. This page isn't linked anywhere.

## Scripts

| Script | What it does |
| --- | --- |
| `npm run dev` | Start the server and restart on file changes |
| `npm run seed` | Create the tables |
| `npm run seed:mock` | Add sample users and messages to a local database |
| `npm run typecheck` | Check types with TypeScript |
| `npm run build:css` | Build the CSS once |
| `npm run watch:css` | Rebuild the CSS on file changes |
| `npm run build` | Compile TypeScript to `dist/` and build the CSS |
| `npm start` | Run the compiled app from `dist/` |

## Deployment

The app can run on any Node.js host with a PostgreSQL database.

- Build command: `npm install --include=dev && npm run build`
- Start command: `npm start`
- Environment variables: `DATABASE_URL`, `SESSION_SECRET`, `MEMBERSHIP_CODE`, `ADMIN_CODE`, `NODE_ENV=production`

Run `npm run seed` once against the production database to create the tables. With `NODE_ENV=production`, the session cookie is only sent over HTTPS, so the site must be served over HTTPS for login to work.
