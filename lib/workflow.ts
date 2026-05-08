export function workflowEngine(
  ticket: any
) {
  if (
    ticket.priority ===
    "HIGH"
  ) {
    return {
      escalationLevel: 2,

      notifyManager: true,
    };
  }

  return {
    escalationLevel: 0,
  };
}