# IT3030 Smart Campus Template

Clean starter template for team collaboration.

## Project Structure
- `backend/` : Spring Boot REST API (Java 21, Maven)
- `frontend/` : React web app (Node 22+)

## Quick Start

### Backend
```bash
cd backend
mvn spring-boot:run
```
Runs on `http://localhost:8080`.

Health check: `GET http://localhost:8080/api/v1/health`

### Frontend
```bash
cd frontend
npm install
npm start
```
Runs on `http://localhost:3000`.

## Team Workflow
- Keep `main` as stable template.
- Create personal branches from `main` and implement assigned modules.
