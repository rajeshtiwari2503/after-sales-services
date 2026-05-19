// scripts/seed-rbac.ts  — NEW FILE
// Run: npx ts-node -r tsconfig-paths/register scripts/seed-rbac.ts
//
// Seeds:
//   Super Admin  (admin / tenantId: system)
//   Brand A      (tenantId: brand-a)  → Manager A → SC-1, SC-2 → Tech-1, Tech-2, Tech-3
//   Brand B      (tenantId: brand-b)  → Manager B → SC-3 → Tech-4

import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI!);
  console.log('✅ MongoDB connected');

  const { default: Tenant } = await import('../models/Tenant');
  const { default: User } = await import('../models/User');
  const { default: Brand } = await import('../models/Brand');
  const { default: ServiceCenter } = await import('../models/ServiceCenter');
  const { default: Technician } = await import('../models/Technician');
  const { hashPassword } = await import('../lib/hash');

  const h = (pw: string) => hashPassword(pw);

  // ── 1. Super Admin ──────────────────────────────────────────────────────────
  await Tenant.findOneAndUpdate(
    { slug: 'system' },
    { name: 'System', slug: 'system', isActive: true },
    { upsert: true }
  );
  const superAdmin = await User.findOneAndUpdate(
    { email: 'admin@system.com' },
    {
      name: 'Super Admin',
      email: 'admin@system.com',
      password: await h('Admin@1234'),
      role: 'admin',
      tenantId: 'system',
      isActive: true,
    },
    { upsert: true, new: true }
  );
  console.log('👑 Super Admin:', superAdmin.email);

  // ── 2. Brand A ──────────────────────────────────────────────────────────────
  await Tenant.findOneAndUpdate(
    { slug: 'brand-a' },
    { name: 'Brand A', slug: 'brand-a', isActive: true },
    { upsert: true }
  );
  const managerA = await User.findOneAndUpdate(
    { email: 'manager@brand-a.com' },
    {
      name: 'Manager A',
      email: 'manager@brand-a.com',
      password: await h('Manager@1234'),
      role: 'manager',
      tenantId: 'brand-a',
      isActive: true,
    },
    { upsert: true, new: true }
  );
  const brandA = await Brand.findOneAndUpdate(
    { name: 'Brand A' },
    {
      name: 'Brand A',
      managerId: managerA._id,
      contactEmail: 'contact@brand-a.com',
      contactPhone: '+91-9000000000',
      address: '100 Brand A Street, Mumbai',
    },
    { upsert: true, new: true }
  );

  // SC-1 under Brand A
  const sc1 = await ServiceCenter.findOneAndUpdate(
    { code: 'SC-1', tenantId: 'brand-a' },
    {
      name: 'Service Center 1',
      code: 'SC-1',
      tenantId: 'brand-a',
      address: { street: '1 SC Road', city: 'Mumbai', state: 'MH', postalCode: '400001', country: 'IN' },
      contact: { phone: '+91-9000000001', email: 'sc1@brand-a.com' },
      isActive: true,
    },
    { upsert: true, new: true }
  );

  // SC-2 under Brand A
  const sc2 = await ServiceCenter.findOneAndUpdate(
    { code: 'SC-2', tenantId: 'brand-a' },
    {
      name: 'Service Center 2',
      code: 'SC-2',
      tenantId: 'brand-a',
      address: { street: '2 SC Road', city: 'Pune', state: 'MH', postalCode: '411001', country: 'IN' },
      contact: { phone: '+91-9000000002', email: 'sc2@brand-a.com' },
      isActive: true,
    },
    { upsert: true, new: true }
  );

  // SC-1 Operator
  const scOp1 = await User.findOneAndUpdate(
    { email: 'operator@sc1-brand-a.com' },
    {
      name: 'SC-1 Operator',
      email: 'operator@sc1-brand-a.com',
      password: await h('ScOp@1234'),
      role: 'service_center',
      tenantId: 'brand-a',
      serviceCenterId: sc1._id.toString(),
      isActive: true,
    },
    { upsert: true, new: true }
  );

  // Tech-1 → SC-1
  const techUser1 = await User.findOneAndUpdate(
    { email: 'tech1@brand-a.com' },
    { name: 'Tech 1', email: 'tech1@brand-a.com', password: await h('Tech@1234'), role: 'technician', tenantId: 'brand-a', serviceCenterId: sc1._id.toString(), isActive: true },
    { upsert: true, new: true }
  );
  await Technician.findOneAndUpdate(
    { employeeId: 'EMP-T001', tenantId: 'brand-a' },
    { userId: techUser1._id, tenantId: 'brand-a', serviceCenterId: sc1._id, employeeId: 'EMP-T001', specializations: ['Electronics'], isActive: true },
    { upsert: true }
  );

  // Tech-2 → SC-1
  const techUser2 = await User.findOneAndUpdate(
    { email: 'tech2@brand-a.com' },
    { name: 'Tech 2', email: 'tech2@brand-a.com', password: await h('Tech@1234'), role: 'technician', tenantId: 'brand-a', serviceCenterId: sc1._id.toString(), isActive: true },
    { upsert: true, new: true }
  );
  await Technician.findOneAndUpdate(
    { employeeId: 'EMP-T002', tenantId: 'brand-a' },
    { userId: techUser2._id, tenantId: 'brand-a', serviceCenterId: sc1._id, employeeId: 'EMP-T002', specializations: ['Appliances'], isActive: true },
    { upsert: true }
  );

  // Tech-3 → SC-2
  const techUser3 = await User.findOneAndUpdate(
    { email: 'tech3@brand-a.com' },
    { name: 'Tech 3', email: 'tech3@brand-a.com', password: await h('Tech@1234'), role: 'technician', tenantId: 'brand-a', serviceCenterId: sc2._id.toString(), isActive: true },
    { upsert: true, new: true }
  );
  await Technician.findOneAndUpdate(
    { employeeId: 'EMP-T003', tenantId: 'brand-a' },
    { userId: techUser3._id, tenantId: 'brand-a', serviceCenterId: sc2._id, employeeId: 'EMP-T003', specializations: ['HVAC'], isActive: true },
    { upsert: true }
  );

  console.log('🏢 Brand A → SC-1 (Tech-1, Tech-2), SC-2 (Tech-3), SC-1 Operator');

  // ── 3. Brand B ──────────────────────────────────────────────────────────────
  await Tenant.findOneAndUpdate(
    { slug: 'brand-b' },
    { name: 'Brand B', slug: 'brand-b', isActive: true },
    { upsert: true }
  );
  const managerB = await User.findOneAndUpdate(
    { email: 'manager@brand-b.com' },
    { name: 'Manager B', email: 'manager@brand-b.com', password: await h('Manager@1234'), role: 'manager', tenantId: 'brand-b', isActive: true },
    { upsert: true, new: true }
  );
  await Brand.findOneAndUpdate(
    { name: 'Brand B' },
    { name: 'Brand B', managerId: managerB._id, contactEmail: 'contact@brand-b.com', contactPhone: '+91-9000000010', address: '200 Brand B Street, Delhi' },
    { upsert: true }
  );

  const sc3 = await ServiceCenter.findOneAndUpdate(
    { code: 'SC-3', tenantId: 'brand-b' },
    {
      name: 'Service Center 3',
      code: 'SC-3',
      tenantId: 'brand-b',
      address: { street: '3 SC Road', city: 'Delhi', state: 'DL', postalCode: '110001', country: 'IN' },
      contact: { phone: '+91-9000000003', email: 'sc3@brand-b.com' },
      isActive: true,
    },
    { upsert: true, new: true }
  );

  // SC-3 Operator
  await User.findOneAndUpdate(
    { email: 'operator@sc3-brand-b.com' },
    { name: 'SC-3 Operator', email: 'operator@sc3-brand-b.com', password: await h('ScOp@1234'), role: 'service_center', tenantId: 'brand-b', serviceCenterId: sc3._id.toString(), isActive: true },
    { upsert: true, new: true }
  );

  // Tech-4 → SC-3
  const techUser4 = await User.findOneAndUpdate(
    { email: 'tech4@brand-b.com' },
    { name: 'Tech 4', email: 'tech4@brand-b.com', password: await h('Tech@1234'), role: 'technician', tenantId: 'brand-b', serviceCenterId: sc3._id.toString(), isActive: true },
    { upsert: true, new: true }
  );
  await Technician.findOneAndUpdate(
    { employeeId: 'EMP-T004', tenantId: 'brand-b' },
    { userId: techUser4._id, tenantId: 'brand-b', serviceCenterId: sc3._id, employeeId: 'EMP-T004', specializations: ['Electrical'], isActive: true },
    { upsert: true }
  );

  console.log('🏢 Brand B → SC-3 (Tech-4), SC-3 Operator');

  console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 Login Credentials
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Super Admin      → admin@system.com             / Admin@1234
Brand A Manager  → manager@brand-a.com          / Manager@1234
SC-1 Operator    → operator@sc1-brand-a.com     / ScOp@1234
Tech 1 (SC-1)    → tech1@brand-a.com            / Tech@1234
Tech 2 (SC-1)    → tech2@brand-a.com            / Tech@1234
Tech 3 (SC-2)    → tech3@brand-a.com            / Tech@1234
Brand B Manager  → manager@brand-b.com          / Manager@1234
SC-3 Operator    → operator@sc3-brand-b.com     / ScOp@1234
Tech 4 (SC-3)    → tech4@brand-b.com            / Tech@1234
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  `);

  await mongoose.disconnect();
  console.log('✅ Seed complete');
}

seed().catch((e) => { console.error(e); process.exit(1); });