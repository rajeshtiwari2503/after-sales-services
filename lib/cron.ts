import cron from "node-cron";

import Ticket from "@/models/Ticket";

export function startCron() {
  cron.schedule(
    "*/5 * * * *",
    async () => {
      const now =
        new Date();

      const tickets =
        await Ticket.find({
          slaDeadline: {
            $lt: now,
          },

          status: {
            $ne: "RESOLVED",
          },
        });

      for (const ticket of tickets) {
        ticket.slaStatus =
          "BREACHED";

        await ticket.save();
      }
    }
  );
}