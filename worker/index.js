const { Worker } = require('bullmq');
const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'postgres',
  database: 'todo_db',
  password: 'postgres',
  port: 5432,
});

const worker = new Worker('todo-queue', async (job) => {
  console.log(`Processing job ${job.id} of type ${job.name}`);
  
  if (job.name === 'todo-created') {
    console.log(`✅ Todo created: ${job.data.title}`);
    console.log(`📝 Todo ID: ${job.data.todoId}`);
    console.log(`⏰ Timestamp: ${job.data.timestamp}`);
  }
}, {
  connection: {
    host: 'redis',
    port: 6379,
  }
});

console.log('🚀 Worker is running and waiting for jobs...');