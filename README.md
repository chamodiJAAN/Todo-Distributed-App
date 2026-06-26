🚀 Distributed ToDo Application

A production-ready distributed ToDo app showcasing microservices, caching, message queues, and containerization.

🏗️ Architecture
- **Frontend**: React + Tailwind CSS
- **Backend**: Node.js + Express
- **Database**: PostgreSQL
- **Cache**: Redis
- **Message Queue**: BullMQ
- **Containerization**: Docker

✨ Features
- ✅ CRUD operations with optimistic updates
- 🚀 Redis caching for performance
- 📨 Async task processing with BullMQ
- 🐳 Containerized with Docker
- 🎨 Modern, responsive UI

🪄 Distributed Systems Features
- 🔄 **Redis Caching** - 10-second cache for reduced database load
- 📨 **Async Processing** - Background jobs with BullMQ
- 🐳 **Containerization** - Docker & Docker Compose
- 🔍 **Health Checks** - Service monitoring endpoint
- 📝 **Audit Logging** - Track all todo creations
- ⚡ **Optimistic Concurrency** - Handle race conditions

💻 UI/UX
- 🎨 **Modern Design** - Clean, responsive interface
- 🌈 **Gradient Background** - Visual appeal
- 📱 **Mobile Friendly** - Works on all devices
- ⚡ **Loading States** - Visual feedback during operations

🚀 Quick Start
```powershell/bash
docker-compose up --build
```

✅ Installation

1. Clone the repository
```bash
git clone https://github.com/chamodiJAAN/Todo-Distributed-App.git
cd Todo-Distributed-App
```

🌐 Distributed Systems Concepts

This project demonstrates several key distributed systems concepts:

1.Caching Strategy -
Redis cache stores todo for 10 seconds
Reduces Database load for read-heavy operations
Cache invalidation on write operations

2.Massage Queues -
BullMQ for asynchronous task processing
Decouples request handling from background work
Audit logging performed asynchronously

3.Fault Tolerance -
Health check endpoint for service monitoring
Graceful error handling with rollback
Retry logic for failed operations

4.Containerization -
Docker for consistent environments
Docker Compose for multi-service orchestration
Easy scaling and deployment

5.Optimistic Concurrency -
Immediate UI updates
Rollback on failure
Better user experience

6.Service Discovery -
Docker networking for service communication
Environment variables for configuration
Clean separation of concerns

🧪 Testing
bash
```Frontend tests
cd frontend
npm test
```

```API testing (using curl)
curl http://localhost:5000/health
curl http://localhost:5000/api/todos
```

🙏 Acknowledgments
React for the awesome UI library
Docker for containerization
All open-source libraries used

```📝APP
Project Link: Todo-Distributed-App


