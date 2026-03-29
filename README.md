# AI Resume Analyzer

A full-stack project building a smarter resume scanner with AI.

## Architecture

- **Frontend:** React + Vite, styled using TailwindCSS (v3) + Lucide Icons.
- **Backend:** Spring Boot (Java 17) connected to a MySQL Database and Gemini API.
- **Database:** Configured to work seamlessly with local instances or a Cloud Db like NeonDB.

## Running Locally with Docker

You can run the entire stack seamlessly using Docker Compose.

```bash
docker-compose up --build
```
> This will start:
> 1. A local MySQL database (port 3306)
> 2. The Spring Boot backend (port 8080)
> 3. The React Vite frontend (port 5173, reverse proxy via nginx on port 80)

Once running via Docker:
- Access Frontend here: `http://localhost:5173` or `http://localhost:80`
- Access Backend API directly here: `http://localhost:8080/api/...`

## Setting up API Keys

By default, an AI key placeholder is used. For realistic testing, you will need a valid Google Gemini API Key.
Add it inside `docker-compose.yml` or set it locally via your environment:

`export AI_API_KEY="your-gemini-key"`

## Deployment Configurations

### Frontend (Vercel)
Vercel recognizes this project inherently. Simply import the repository from Github with Root Directory set to `frontend`. 
Build commands: `npm run build`. Framework preset: `Vite`.

### Backend (Render)
Render inherently supports deploying using Docker, providing absolute consistency. Choose "Deploy from Docker" and pick `backend/Dockerfile` as the source context.
Add all the necessary Environment Variables on Render dashboard: `DB_URL, DB_USER, DB_PASSWORD, AI_API_KEY`.
