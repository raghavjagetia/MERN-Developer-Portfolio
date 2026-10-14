# MERN Developer Portfolio

This is a full-stack developer portfolio:

- **Frontend:** React (Vite)
- **Backend:** Express API with Mongoose models
- **Database:** MongoDB Atlas
- **Hosting:** Vercel, with the frontend as a static site and the API as a serverless function

It ships with dummy data: 26 projects, 24 blog articles, 30 skills, 20 certifications, 20 achievements, 20 testimonials, 12 FAQs and 8 timeline entries.

```
├── api/index.js           Vercel serverless entry → server/app.js
├── server/
│   ├── app.js             Express app (routes, middleware)
│   ├── server.js          Local server entry (npm run dev / npm start)
│   ├── db.js              Mongoose connection (cached for serverless)
│   ├── models/            Mongoose schemas
│   ├── routes/            content, contact, events, admin
│   ├── lib/store.js       Reads from MongoDB, falls back to seed data
│   └── seed/              data.js (dummy data) + seed.js (loader)
├── client/                React app (Vite)
├── vercel.json            Vercel build + rewrites
└── .env                   Your secrets (never committed)
```

## 1. Run locally

```bash
npm run setup     # installs root (API) + client dependencies
npm run dev       # API on :5000 + React on :5173 (open http://localhost:5173)
```

The site works without a database. Until `MONGO_URI` is set, the API serves `server/seed/data.js`.

## 2. Connect MongoDB Atlas

1. **Create a database user.** In Atlas, go to **Security → Database Access → Add New Database User**. Use password authentication, then copy the username and password.
2. **Allow connections.** Go to **Security → Network Access → Add IP Address → Allow access from anywhere** (`0.0.0.0/0`). Vercel's servers use changing IP addresses, so this is required.
3. **Get the connection string.**
   1. Go to **Database → Clusters → RJ → Connect → Drivers** (Node.js) and copy the string.
   2. Replace `<db_password>` with your password.
   3. Add the database name `portfolio` right before the `?`:
      ```
      mongodb+srv://myuser:mypassword@rj.abc12.mongodb.net/portfolio?retryWrites=true&w=majority&appName=RJ
      ```
   If your password contains special characters (`@ : / ? # %`), URL-encode them. For example, `@` becomes `%40`.
4. **Paste it into `.env`** in the project root:
   ```
   MONGO_URI=mongodb+srv://...
   ```
5. **Load the dummy data:**
   ```bash
   npm run seed           # creates the collections and inserts the dummy data
   npm run seed:destroy   # removes it again (contact messages and events are kept)
   ```
6. **Restart** with `npm run dev`. `http://localhost:5000/api/health` should now show `"database":"connected"`. In Atlas, **Data Explorer** shows the `portfolio` database.

To change your content later, edit `server/seed/data.js` and run `npm run seed` again. You can also edit documents directly in the Atlas Data Explorer.

## 3. Deploy to Vercel

1. Push the project to GitHub. `.env` and `node_modules` are git-ignored.
2. In Vercel, choose **Add New → Project** and import the repo. Leave the framework preset as **Other**; the settings come from `vercel.json`.
3. Under **Settings → Environment Variables**, add `MONGO_URI`, which is the same string as in `.env`. `ADMIN_KEY` is optional.
4. Click **Deploy**. Then open `https://<your-app>.vercel.app/api/health` and check that it shows `"database":"connected"`.

## API

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/health` | Server + database status |
| GET | `/api/bootstrap` | All content in one call (used by the frontend) |
| GET | `/api/projects?category=&tech=&q=&featured=&sort=newest\|oldest\|az` | Filterable projects |
| GET | `/api/projects/:slug` | One project |
| GET | `/api/articles?tag=&q=` · `/api/articles/:slug` | Blog |
| POST | `/api/articles/:slug/like` `{ liked: true\|false }` | Like / unlike |
| GET | `/api/skills` `/api/experience` `/api/certifications` `/api/achievements` `/api/testimonials` `/api/faqs` `/api/profile` | Content |
| POST | `/api/contact` `{ name, email, type, message }` | Saves an inquiry (needs a database) |
| POST | `/api/events` `{ type, ref, sessionId }` | Visitor-behaviour event |
| GET | `/api/events/summary` | Aggregated behaviour across all visitors |
| GET | `/api/admin/inquiries` (header `x-admin-key`) | Read contact messages |
| PATCH | `/api/admin/inquiries/:id` `{ status }` | Mark an inquiry as `read` or `replied` |

## Features

- **Pages:** Home, Skills & Projects, Case Study, Experience & Education, Resume & Contact, AI Insights dashboard, Certifications & Achievements, About, and Blog with an article view.
- **AI visitor-behaviour analysis:**
  - Every click is tracked in the browser and sent to `/api/events`.
  - The dashboard shows personalised project and article recommendations, interest charts, a funnel, a contact-interest gauge, and an "All visitors" section read from MongoDB.
- **Theme and navigation:** dark/light theme, a command palette (Ctrl/⌘ + K), and a floating AI assistant.
- **Animations:** scroll reveals and tilt cards.
- **Interactive pieces:** a lightbox, flip cards, a contact form with validation, and Save-resume-as-PDF.
