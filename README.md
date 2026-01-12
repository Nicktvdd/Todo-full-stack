# Todo App with Express & PostgreSQL

A full-stack todo application with Express backend and PostgreSQL database.

> **📚 Teaching this course?** See [TEACHING.md](TEACHING.md) for a complete 2-day curriculum guide.
> 
> **☁️ Deploying to AWS?** See [DEPLOYMENT.md](DEPLOYMENT.md) for browser-based AWS deployment guides.

## Prerequisites

### For Simple Version (JSON File Storage)
- Node.js (v14 or higher)
- npm or yarn

### For Full Version (PostgreSQL)
- Node.js (v14 or higher)
- Docker and Docker Compose
- npm or yarn

## Getting Started

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd webdev-express
```

### 2a. Quick Start - Simple Version (No Docker Required)

Perfect for learning Express basics without database complexity:

```bash
cd backend
npm install
npm run dev:simple
```

This runs the server with JSON file storage. Great for beginners!

### 2b. Full Version - Start with Docker Compose

From the project root directory:

```bash
docker-compose up -d
```

This will:
- Start a PostgreSQL container
- Build and start the Express backend container
- Create the database and tables automatically
- Insert sample data
- Backend runs on `http://localhost:3000`
- PostgreSQL runs on port 5432

To check if everything is running:

```bash
docker-compose ps
```

To view logs:

```bash
# All services
docker-compose logs -f

# Just backend
docker-compose logs -f backend

# Just database
docker-compose logs -f postgres
```

### 3. Start the frontend (optional)

The frontend still runs locally (not containerized):

```bash
cd frontend
npm install
npm run dev
```

## Development Modes

### Option 1: Full Docker (Recommended for Production-like Environment)

Run everything in containers:

```bash
docker-compose up -d
```

- Pros: Isolated, consistent, easy deployment
- Cons: Slower to rebuild after code changes

### Option 2: Hybrid (Recommended for Development)

Run only the database in Docker, backend locally:

```bash
# Start just the database
docker-compose up -d postgres

# In another terminal, run backend locally
cd backend
npm install
npm run dev
```

- Pros: Hot reload with nodemon, faster iteration
- Cons: Need Node.js installed locally
- Note: Update `DB_HOST` to `localhost` in your local `.env` file

## API Endpoints

- `GET /todos` - Get all todos
- `GET /todos/count` - Get count of todos
- `GET /todos/:id` - Get a single todo
- `POST /todos` - Create a new todo
- `PUT /todos/:id` - Update a todo
- `DELETE /todos/:id` - Delete a todo

## Docker Commands

### Stop all services

```bash
docker-compose down
```

### Stop and remove all data (including database)

```bash
docker-compose down -v
```

### Restart all services

```bash
docker-compose restart
```

### Restart just the backend

```bash
docker-compose restart backend
```

### Rebuild backend after code changes

```bash
docker-compose up -d --build backend
```

### View running containers

```bash
docker-compose ps
```

### Access PostgreSQL CLI

```bash
docker exec -it todo-postgres psql -U todouser -d tododb
```

### Access backend container shell

```bash
docker exec -it todo-backend sh
```

Useful SQL commands:
```sql
-- View all todos
SELECT * FROM todos;

-- Count todos
SELECT COUNT(*) FROM todos;

-- Drop and recreate table (careful!)
DROP TABLE todos;
```

## Database Schema

```sql
CREATE TABLE todos (
    id SERIAL PRIMARY KEY,
    text VARCHAR(500) NOT NULL,
    completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Migration from JSON

The old JSON file (`database.json`) is no longer used. The initial data has been migrated to PostgreSQL via the `init.sql` script.

## Troubleshooting

### Database connection errors

1. Make sure Docker is running
2. Check if containers are up: `docker-compose ps`
3. Check logs: `docker-compose logs backend`
4. Verify the backend waits for database health check (configured with `depends_on`)

### Port conflicts

**Backend port (3000):**
```yaml
ports:
  - "3001:3000"  # Use 3001 on host instead
```

**Database port (5432):**
```yaml
ports:
  - "5433:5432"  # Use 5433 on host instead
```

### Backend not starting

If the backend exits immediately:
```bash
# Check logs
docker-compose logs backend

# Rebuild the backend
docker-compose up -d --build backend
```

### Code changes not reflecting

When running in Docker, you need to rebuild after code changes:
```bash
docker-compose up -d --build backend
```

For faster development, use the hybrid approach (see Development Modes above).

## Development

### Hybrid Mode (Recommended for Fast Iteration)

Run database in Docker, backend locally:

```bash
# Terminal 1: Start database only
docker-compose up -d postgres

# Terminal 2: Run backend locally with hot reload
cd backend
npm install
npm run dev  # Uses nodemon for auto-reload
```

**Important:** When running backend locally, make sure your `backend/.env` has:
```
DB_HOST=localhost
```

### Full Docker Mode

```bash
docker-compose up -d
```

Code changes require rebuild:
```bash
docker-compose up -d --build backend
```

### Adding Hot Reload to Docker (Optional)

You can mount your code as a volume for live reload in Docker:

```yaml
# Add to backend service in docker-compose.yml
volumes:
  - ./backend:/app
  - /app/node_modules
command: npm run dev
```

## Production Considerations

For production deployment:

1. Use strong passwords (change in both `docker-compose.yml` and `.env`)
2. Use environment-specific `.env` files
3. Consider using a managed PostgreSQL service (AWS RDS, DigitalOcean, etc.)
4. Add proper logging and monitoring
5. Implement rate limiting and security headers
6. Use connection pooling (already implemented with `pg.Pool`)

## License

ISC
