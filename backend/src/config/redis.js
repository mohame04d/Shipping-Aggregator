import Redis from "ioredis";

const redis = new Redis({
  host: "127.0.0.1",
  port: 6379,
  maxRetriesPerRequest: null,
});

redis.on("connect", () => {
  console.log("Redis connected successfully");
});

redis.on("error", (error) => {
  console.error("Redis connection error:", error);
});

export default redis;