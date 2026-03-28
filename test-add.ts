import { Queue } from 'bullmq';
import { redis } from './src/config/redis.config';

const q = new Queue('analyticsQueue', { connection: redis });

async function run() {
  try {
    const job = await q.add("test-job", {
      linkId: "651234567890123456789012",
      shortCode: "test",
      ip: "127.0.0.1",
      userAgent: "curl/7.68.0"
    });
    console.log("Successfully added job:", job.id);
  } catch (err) {
    console.error("Error adding job:", err);
  }
  process.exit(0);
}

run();
