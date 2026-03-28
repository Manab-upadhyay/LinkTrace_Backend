import { Queue } from 'bullmq';
import { redis } from './src/config/redis.config';

const q = new Queue('analyticsQueue', { connection: redis });

async function run() {
  const counts = await q.getJobCounts();
  console.log("Job Counts:", counts);
  process.exit(0);
}

run();
