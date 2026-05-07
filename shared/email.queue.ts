import { Queue } from "bullmq";

import { connection } from
  "../shared/redis";

export const emailQueue =
  new Queue("emailQueue", {
    connection,
  });