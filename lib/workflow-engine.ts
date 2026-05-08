import {
  assignBestTechnician,
} from "./ai-assignment";

export async function runWorkflow(
  ticket: any,
  technicians: any[]
) {
  let updates: any = {};

  if (
    ticket.priority ===
    "HIGH"
  ) {
    updates.escalationLevel =
      2;

    updates.notifyAdmin =
      true;
  }

  const assigned =
    assignBestTechnician(
      technicians,
      ticket.category
    );

  if (assigned) {
    updates.assignedTo =
      assigned._id;
  }

  return updates;
}