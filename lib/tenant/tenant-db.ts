 import mongoose from 'mongoose';

const connections: Map<string, typeof mongoose> = new Map();

export async function getTenantConnection(tenantId: string): Promise<typeof mongoose> {
  const existing = connections.get(tenantId);
  if (existing) {
    return existing;
  }

  const dbName = `tenant_${tenantId}`;
  const uri = process.env.MONGODB_URI!.replace(/\/[^/]*$/, `/${dbName}`);

  const connection = await mongoose.connect(uri);
  connections.set(tenantId, connection);

  return connection;
}

export function clearTenantConnections(): void {
  connections.forEach((conn) => {
    conn.disconnect();
  });
  connections.clear();
}
