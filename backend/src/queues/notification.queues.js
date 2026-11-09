import { Queue } from "bullmq";
import redis from "../config/redis.js";

const notificationQueue = new Queue("notifications", {
  connection: redis,

  defaultJobOptions: {
    attempts: 3,

    backoff: {
      type: "exponential",
      delay: 2000,
    },

    removeOnComplete: {
      age: 24 * 60 * 60,
      count: 1000,
    },

    removeOnFail: false,
  },
});

export default notificationQueue;
