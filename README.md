# Artist Management System (AMS)

A modern, full-stack web application designed to efficiently manage artists, song catalogs, and internal platform users. Featuring a high-performance backend and a beautifully designed, responsive dynamic UI for administrative workflows.

## 🚀 Tech Stack

### Frontend (Client)
* **Framework:** React 18, Vite, TypeScript
* **State Management:** React Query (Server caching), React Context (Auth State)
* **UI & Styling:** Mantine UI, TailwindCSS, custom CSS animations
* **Routing:** React Router v6
* **Form Validation:** `@mantine/form` mapped with Zod schemas

### Backend (Server)
* **Runtime / Framework:** Node.js, Express.js, TypeScript
* **Database:** PostgreSQL (with raw `pg` queries)
* **Security & Auth:** JSON Web Tokens (JWT), bcrypt (password hashing)

## 📌 Core Features

* **Authentication System:** Secure Login and Registration via JWT. Role-based access ensures safe API routing and prevents unauthorized dashboard access.
* **Dashboard Layouts:** Centralized dual-tab data grids natively supporting users and artists tracking. 
* **Artist Management:** Complete CRUD (Create, Read, Update, Delete) system tailored for artists.
* **Song Catalog Integration:** Dedicated nested views for creating, assigning, and organizing songs tied strictly to specific artists.
* **Pagination Design:** Highly optimized server-side pagination with offset logic preventing overload on large dataset rendering.
* **Premium UI/UX:** Features dynamic aesthetic components, animated grid backgrounds, smooth modal forms, glassmorphism layouts, and elegant gradient CTA buttons.

## 🛠️ Local Development Setup

Follow these instructions to get a local development instance of AMS up and running.

### Prerequisites
* [Node.js](https://nodejs.org/en/) (v18 or higher recommended)
* [PostgreSQL](https://www.postgresql.org/) running locally
* Git

### 1. Clone the repository
```bash
git clone https://github.com/anisha2lc/ams-fullstack.git
cd ams-fullstack
```

### 2. Configure the Backend (Server)
Open a terminal and navigate to the server directory:
```bash
cd server
npm install
```

**Database Initialization:**
You must manually create the local database and run the schema before starting the server.

1. Open your PostgreSQL terminal (e.g. `psql` or pgAdmin).
2. Create the database: `CREATE DATABASE ams;`
3. Load the initial schema layout into the database:
   *(If using command line)*:
   ```bash
   psql -U postgres -d ams -f src/config/schema.sql
   ```

**Environment Variables:**
1. Rename the `server/.env.example` file to `server/.env` (or create a new `.env`).
2. Update the `DATABASE_URL` with your local Postgres credentials.
   (Example: `DATABASE_URL="postgresql://postgres:root@localhost:5432/ams"`)

**Start the API Server:**
```bash
npm run dev
```
The Express Node.js API will now be listening on `http://localhost:5000`.

### 3. Configure the Frontend (Client)
Open a new terminal tab/window and navigate to the client directory:
```bash
cd client
npm install

# Start the Vite development server
npm run dev
```
The React frontend will instantly compile and be served on `http://localhost:5173`. Open this URL in your web browser to sign up, log in, and interact with the application.

## 📁 Project Structure

```text
ams-fullstack/
├── client/                 # React Frontend
│   ├── src/
│   │   ├── api/            # Centralized API logic (fetch/axios)
│   │   ├── components/     # Scalable UI slices (Data tables, Forms)
│   │   ├── context/        # Global React Contexts (Auth session)
│   │   ├── layouts/        # Page container wrappers
│   │   ├── pages/          # Complete React route views
│   │   └── index.css       # Tailwind directives & CSS design tokens
├── server/                 # Express Backend
│   ├── src/
│   │   ├── config/         # DB connection & raw schema.sql
│   │   ├── controller/     # Core Business and query logic
│   │   ├── middlewares/    # Auth guards and global Error catchers
│   │   └── routes/         # API Endpoint controllers mapping
└── README.md
```

## 🤝 Contributing
1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request
