// import cron from "node-cron";

// import Ticket from "@/models/Ticket";

// export function startCron() {
//   cron.schedule(
//     "*/5 * * * *",
//     async () => {
//       const now =
//         new Date();

//       const tickets =
//         await Ticket.find({
//           slaDeadline: {
//             $lt: now,
//           },

//           status: {
//             $ne: "RESOLVED",
//           },
//         });

//       for (const ticket of tickets) {
//         ticket.slaStatus =
//           "BREACHED";

//         await ticket.save();
//       }
//     }
//   );
// }

import cron from "node-cron";

import Ticket from "@/models/Ticket";

export function startCron() {
  cron.schedule(
    "*/5 * * * *",
    async () => {
      try {
        const now =
          new Date();

        const tickets =
          await Ticket.find({
            "sla.resolutionDeadline":
              {
                $lt: now,
              },

            status: {
              $ne:
                "resolved",
            },

            "sla.isResolutionBreached":
              false,
          });

        for (const ticket of tickets) {
          if (ticket.sla) {
            ticket.sla.isResolutionBreached =
              true;

            ticket.timeline.push(
              {
                action:
                  "SLA_BREACHED",

                description:
                  "Resolution SLA breached",

                performedBy:
                  ticket.customerId,

                performedByName:
                  "System",

                metadata: {
                  type:
                    "resolution",
                },

                createdAt:
                  new Date(),
              } as any
            );

            await ticket.save();
          }
        }

        console.log(
          `[cron] checked ${tickets.length} tickets`
        );
      } catch (error) {
        console.error(
          "[cron] SLA check failed:",
          error
        );
      }
    }
  );
}