# Monorepo Docker Setup

This document explains how to run the application using Docker Compose.

## Prerequisites

- Docker and Docker Compose installed on your machine

## Project Structure

```
monorepo/
├── frontend/          # React + Vite frontend
│   ├── .env           # Frontend environment variables
│   └── ...
├── backend/           # Bun.js backend
│   ├── .env           # Backend environment variables
│   ├── package.json   # Backend dependencies
│   ├── bun.lockb      # Bun lock file
│   └── ...
├── frontend.Dockerfile
├── backend.Dockerfile
├── docker-compose.yml
└── README.md          # This file
```

## Running the Application

1. Make sure both `.env` files exist and are properly configured:
   - `backend/.env` - Environment variables for the Bun.js backend
   - `frontend/.env` - Environment variables for the React frontend

2. Build and start the containers:
   ```bash
   docker-compose up
   ```

   This will:
   - Build both frontend and backend Docker images
   - Start both services
   - Connect them to the same network
   - Forward the necessary ports

3. Access the application:
   - Frontend: `http://localhost:3000`
   - Backend API: `http://localhost:8000`

4. To stop the application:
   ```bash
   docker-compose down
   ```

## Development

If you need to rebuild the containers after making changes:
```bash
docker-compose up --build
```

## Troubleshooting

- If you encounter connection issues between frontend and backend, ensure that in the frontend's `.env` file, the API URL is pointing to the backend service (e.g., `VITE_API_URL=http://backend:8000`)
- If port conflicts occur, you can modify the port mappings in `docker-compose.yml`