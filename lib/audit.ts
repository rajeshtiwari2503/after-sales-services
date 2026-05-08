import AuditLog from "@/models/AuditLog";

export async function createAuditLog({
  action,
  entity,
  entityId,
  userId,
  payload,
}: any) {
  await AuditLog.create({
    action,

    entity,

    entityId,

    userId,

    payload,
  });
}