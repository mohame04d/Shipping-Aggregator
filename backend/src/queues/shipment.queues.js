import { Queue } from "bullmq";
import redis from "../config/redis";

export default shipmentQueues= new Queue('shipments', {
    connection: redis,

    defaultJobOptions: {
        attempts: 3,

        backoff: {
          type: "exponential",
          delay: 2000 
        },

        removeOnFail: false,

        removeOnComplete: {
            age: 24*60*60,
            count: 1000
        }
    }
})