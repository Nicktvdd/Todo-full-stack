# Teaching Guide: Express Backend with PostgreSQL

This project is designed for a 2-day backend course.

## 📚 Course Structure

### **Day 1: Express Basics with JSON Storage**
Simple REST API without database complexity

### **Day 2: Database Integration with PostgreSQL & Docker**
Migrate to production-ready database setup

---

## 🎯 Day 1: Express Basics

### Learning Goals
- Understand Express.js fundamentals
- Learn REST API principles (GET, POST, PUT, DELETE)
- Work with JSON data
- Test APIs with tools like Postman/Thunder Client

### Setup for Day 1

Students only need Node.js installed (no Docker required).

```bash
cd backend
npm install
npm run dev:simple
```

This runs `index.simple.js` which uses `database.json` for storage.

### Day 1 Files
- `backend/index.simple.js` - Simple Express server with JSON file storage
- `backend/database.json` - Data storage file
- `backend/package.json` - Dependencies (just `express` and `cors`)

### Teaching Flow

1. **Explain the basics:**
   ```javascript
   import express from 'express'
   const app = express()
   ```

2. **Show middleware:**
   ```javascript
   app.use(cors())
   app.use(express.json())
   ```

3. **Walk through CRUD operations:**
   - **GET** `/todos` - Retrieve all todos
   - **GET** `/todos/:id` - Retrieve one todo
   - **POST** `/todos` - Create a new todo
   - **PUT** `/todos/:id` - Update a todo
   - **DELETE** `/todos/:id` - Delete a todo

4. **Demonstrate with Postman/Thunder Client:**
   ```bash
   # GET all todos
   curl http://localhost:3000/todos

   # POST new todo
   curl -X POST http://localhost:3000/todos \
     -H "Content-Type: application/json" \
     -d '{"text":"Learn Express"}'

   # PUT update todo
   curl -X PUT http://localhost:3000/todos/1 \
     -H "Content-Type: application/json" \
     -d '{"completed":true}'

   # DELETE todo
   curl -X DELETE http://localhost:3000/todos/1
   ```

5. **Show how data persists in `database.json`**
   - Open the file during class
   - Show how it changes after API calls

### Day 1 Limitations (Address These!)
- ⚠️ File storage isn't production-ready
- ⚠️ No concurrent access handling
- ⚠️ Data can be corrupted
- ⚠️ Doesn't scale
- ⚠️ No transactions or data integrity

**This sets up Day 2 perfectly!**

---

## 🚀 Day 2: PostgreSQL & Docker

### Learning Goals
- Understand why databases are necessary
- Learn Docker basics
- Work with PostgreSQL
- Use connection pooling
- Handle async database operations

### Setup for Day 2

Students need Docker Desktop installed.

```bash
# Start PostgreSQL with Docker
docker-compose up -d postgres

# Option 1: Run backend in Docker (recommended)
docker-compose up -d backend

# Option 2: Run backend locally with database in Docker
cd backend
npm run dev:postgres
```

### Day 2 Files
- `docker-compose.yml` - Container orchestration
- `backend/Dockerfile` - Backend container definition
- `backend/init.sql` - Database schema and seed data
- `backend/db.js` - PostgreSQL connection pool
- `backend/index.js` - Express server with PostgreSQL
- `backend/.env.example` - Environment configuration template

### Teaching Flow

#### Part 1: Why Databases?

Review Day 1 limitations and explain:
- **Concurrency**: Multiple users can access simultaneously
- **ACID properties**: Atomicity, Consistency, Isolation, Durability
- **Querying**: Complex searches and filtering
- **Relationships**: Link data between tables
- **Performance**: Indexing, optimization
- **Security**: User permissions, encryption

#### Part 2: Docker Introduction

1. **What is Docker?**
   - Containers vs VMs
   - Consistency across environments
   - Easy setup and teardown

2. **Docker Compose:**
   - Multi-container applications
   - Service definitions
   - Networking between containers

3. **Hands-on:**
   ```bash
   # Start database
   docker-compose up -d postgres
   
   # Check status
   docker-compose ps
   
   # View logs
   docker-compose logs -f postgres
   
   # Access PostgreSQL CLI
   docker exec -it todo-postgres psql -U todouser -d tododb
   ```

#### Part 3: Database Schema

Walk through `init.sql`:

```sql
CREATE TABLE todos (
    id SERIAL PRIMARY KEY,
    text VARCHAR(500) NOT NULL,
    completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

Explain:
- **SERIAL**: Auto-incrementing ID
- **PRIMARY KEY**: Unique identifier
- **Constraints**: NOT NULL, DEFAULT
- **Data types**: VARCHAR, BOOLEAN, TIMESTAMP

#### Part 4: Node.js + PostgreSQL

1. **Connection Pooling** (`db.js`):
   ```javascript
   const pool = new Pool({
     user: 'todouser',
     host: 'postgres', // or 'localhost' if running locally
     database: 'tododb',
     password: 'todopassword',
     port: 5432,
   })
   ```

2. **Async/Await** (compare to Day 1):
   
   **Day 1 (Synchronous):**
   ```javascript
   app.get('/todos', (req, res) => {
     res.json(todoData)
   })
   ```
   
   **Day 2 (Asynchronous):**
   ```javascript
   app.get('/todos', async (req, res) => {
     try {
       const result = await pool.query('SELECT * FROM todos')
       res.json(result.rows)
     } catch (error) {
       res.status(500).json({ error: 'Database error' })
     }
   })
   ```

3. **SQL Injection Prevention:**
   ```javascript
   // ❌ DANGEROUS - Don't do this!
   pool.query(`SELECT * FROM todos WHERE id = ${req.params.id}`)
   
   // ✅ SAFE - Parameterized query
   pool.query('SELECT * FROM todos WHERE id = $1', [req.params.id])
   ```

#### Part 5: Migration Exercise

**Live coding activity**: Convert one endpoint at a time from Day 1 to Day 2.

**Example - Converting POST endpoint:**

**Before (Day 1):**
```javascript
app.post('/todos', (req, res) => {
  const newTodo = {
    id: Date.now(),
    text: req.body.text,
    completed: false,
  }
  todoData.push(newTodo)
  saveDataToFile()
  res.status(201).json(newTodo)
})
```

**After (Day 2):**
```javascript
app.post('/todos', async (req, res) => {
  try {
    const { text } = req.body
    const result = await pool.query(
      'INSERT INTO todos (text, completed) VALUES ($1, $2) RETURNING *',
      [text, false]
    )
    res.status(201).json(result.rows[0])
  } catch (error) {
    console.error('Error creating todo:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})
```

**Key differences:**
- `async`/`await` keywords
- `try`/`catch` error handling
- SQL query instead of array manipulation
- Database generates ID (SERIAL)
- `RETURNING *` gives us the created record

---

## 🧪 Testing During Class

### Day 1: Test with simple curl commands
```bash
curl http://localhost:3000/todos
curl -X POST http://localhost:3000/todos -H "Content-Type: application/json" -d '{"text":"Test"}'
```

### Day 2: Same API, different backend!
```bash
# Same commands work! API contract unchanged
curl http://localhost:3000/todos
curl -X POST http://localhost:3000/todos -H "Content-Type: application/json" -d '{"text":"Test"}'
```

**Show students**: The frontend doesn't need to change because we maintained the same API interface!

---

## 💡 Teaching Tips

### Day 1 Tips
- Keep it simple - focus on Express concepts
- Let students break things and fix them
- Show the data file changing in real-time
- Encourage testing with Postman/Thunder Client
- Don't mention databases yet (except at the end)

### Day 2 Tips
- Start by reviewing Day 1 pain points
- Live demo Docker commands
- Show the database with a GUI tool (pgAdmin, TablePlus, etc.)
- Do the migration **together** as a class
- Emphasize error handling importance
- Compare code side-by-side (Day 1 vs Day 2)

### Common Student Questions

**Q: Why not just use JSON files?**
A: Great for learning, but fails with multiple users, has no transactions, can corrupt data, and doesn't scale.

**Q: Do I need Docker for development?**
A: Not strictly necessary - you can install PostgreSQL locally. But Docker makes it easier and more consistent.

**Q: What's the difference between `node index.js` and `npm start`?**
A: They're the same! `npm start` runs the script defined in `package.json`.

**Q: Why async/await?**
A: Database operations are I/O bound and take time. Async prevents blocking the server while waiting.

**Q: What's SQL injection?**
A: When user input is directly inserted into SQL queries, attackers can execute malicious commands. Always use parameterized queries!

---

## 📝 Exercises for Students

### Day 1 Exercises
1. Add a new endpoint: `GET /todos/completed` (return only completed todos)
2. Add validation: Don't allow empty todo text
3. Add a `priority` field to todos (low, medium, high)
4. Implement searching: `GET /todos/search?q=keyword`

### Day 2 Exercises
1. Migrate their Day 1 custom endpoints to PostgreSQL
2. Add pagination: `GET /todos?page=1&limit=10`
3. Add sorting: `GET /todos?sort=created_at&order=desc`
4. Create a new table for `categories` and link todos to categories (foreign key)
5. Add a migration script to import old JSON data to PostgreSQL

---

## 🎬 Suggested Timeline

### Day 1 (3-4 hours)
- 0:00-0:30 - Intro to Node.js and Express
- 0:30-1:30 - Build the API together (GET, POST)
- 1:30-2:00 - Break
- 2:00-3:00 - Add PUT and DELETE
- 3:00-3:30 - Testing and debugging
- 3:30-4:00 - Student exercises

### Day 2 (3-4 hours)
- 0:00-0:30 - Review Day 1, discuss limitations
- 0:30-1:00 - Docker introduction
- 1:00-1:30 - PostgreSQL basics
- 1:30-2:00 - Break
- 2:00-3:00 - Live migration (convert endpoints together)
- 3:00-3:30 - Error handling and best practices
- 3:30-4:00 - Student exercises and Q&A

---

## 🎓 Learning Outcomes

By the end of Day 2, students should be able to:
- ✅ Build a REST API with Express
- ✅ Understand CRUD operations
- ✅ Work with both file storage and databases
- ✅ Use Docker for development
- ✅ Write SQL queries
- ✅ Handle async operations in Node.js
- ✅ Implement error handling
- ✅ Understand the progression from prototype to production

---

## 🔄 Quick Command Reference

```bash
# Day 1
npm run dev:simple          # Start with JSON file storage

# Day 2 - Database only
docker-compose up -d postgres

# Day 2 - Everything in Docker
docker-compose up -d

# Day 2 - Backend local, database Docker
docker-compose up -d postgres
npm run dev:postgres

# Stop everything
docker-compose down

# Nuclear option - delete all data
docker-compose down -v
```

---

## ☁️ Day 2 Extension: AWS Deployment (Optional)

If you have extra time or want to extend Day 2, see [DEPLOYMENT.md](DEPLOYMENT.md) for complete AWS deployment guides.

### Quick AWS Demo (30-45 minutes)

**Recommended: EC2 + Docker Compose**

This is the easiest way to show cloud deployment using the AWS Console (browser):

1. **Launch EC2 Instance** (10 minutes)
   - Ubuntu t2.micro (free tier)
   - Configure security groups (ports 22, 3000)
   - Add user data script to auto-install Docker
   - All from AWS Console - no CLI needed!

2. **Deploy Application** (10 minutes)
   - SSH into instance
   - Clone Git repository
   - Run `docker-compose up -d`
   - Same command as local! 🎉

3. **Test & Demonstrate** (10 minutes)
   - Access from browser: `http://ec2-ip:3000/todos`
   - Show logs: `docker-compose logs -f`
   - Show containers: `docker-compose ps`
   - Test from students' phones (cool factor!)

4. **Discuss Production** (10 minutes)
   - Why RDS vs containerized database?
   - Load balancers for scaling
   - Auto-scaling groups
   - Monitoring and alerts
   - Cost considerations

### Why Docker Makes AWS Easy

**Same commands everywhere:**
```bash
# Local development
docker-compose up -d

# AWS EC2
docker-compose up -d

# It's literally the same! 🎉
```

**Students learn:**
- ✅ Cloud deployment isn't scary
- ✅ Docker simplifies everything
- ✅ Development = Production environment
- ✅ Easy to scale and maintain
- ✅ Infrastructure as code concepts

### Cost-Conscious Teaching

**Total cost for demo**: < $1 (if you delete after class)

**Strategy:**
1. Create EC2 instance before class (5 min)
2. Demonstrate deployment (30 min)
3. Let students explore (if they have AWS accounts)
4. **Delete instance immediately after** (prevent charges)

Set up billing alerts at $5 to avoid surprises!

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed step-by-step instructions with screenshots descriptions and troubleshooting.

---

Good luck with your class! 🎓

