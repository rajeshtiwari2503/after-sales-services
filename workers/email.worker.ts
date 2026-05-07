import { Worker } from "bullmq";

import { connection } from
  "../shared/redis";

const worker = new Worker(
  "emailQueue",

  async (job) => {
    console.log(
      "Sending email:",
      job.data
    );
  },

  {
    connection,
  }
);