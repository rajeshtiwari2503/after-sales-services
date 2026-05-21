// app/api/reports/tickets/route.ts  — NEW FILE
// GET /api/reports/tickets?period=monthly&format=csv|json
// Returns ALL ticket fields, role-scoped (same RBAC as /api/reports)

import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth-helper';
import { errorResponse } from '@/utils/apiResponse';
import connectDB from '@/lib/db';
import Ticket from '@/models/Ticket';
import mongoose from 'mongoose';

function getDateRange(period: string) {
  const now   = new Date();
  const start = new Date();
  if (period === 'weekly')  start.setDate(now.getDate() - 7);
  else if (period === 'monthly') start.setMonth(now.getMonth() - 1);
  else if (period === 'yearly')  start.setFullYear(now.getFullYear() - 1);
  else start.setMonth(now.getMonth() - 1);
  start.setHours(0, 0, 0, 0);
  return { start, end: now };
}

function buildMatch(
  user: { role: string; tenantId: string; userId: string },
  headers: Headers
): Record<string, any> {
  if (user.role === 'admin')   return {};
  if (user.role === 'manager') return { tenantId: user.tenantId };
  if (user.role === 'service_center') {
    const scId = headers.get('x-service-center-id');
    const m: Record<string, any> = { tenantId: user.tenantId };
    if (scId && mongoose.Types.ObjectId.isValid(scId))
      m.serviceCenterId = new mongoose.Types.ObjectId(scId);
    return m;
  }
  if (user.role === 'technician') {
    return {
      tenantId:     user.tenantId,
      technicianId: new mongoose.Types.ObjectId(user.userId),
    };
  }
  return { tenantId: user.tenantId };
}

/* ── CSV helpers ─────────────────────────────────────────────── */
function escapeCsv(val: any): string {
  if (val === null || val === undefined) return '';
  const str = String(val).replace(/"/g, '""');
  return str.includes(',') || str.includes('"') || str.includes('\n')
    ? `"${str}"`
    : str;
}

function fmtDate(d: any): string {
  if (!d) return '';
  try { return new Date(d).toLocaleString('en-IN', { hour12: false }); }
  catch { return ''; }
}

function fmtMs(ms: number | null | undefined): string {
  if (!ms) return '';
  const hrs = Math.round(ms / 3600000);
  return `${hrs}h`;
}

export async function GET(request: NextRequest) {
  try {
    const user = getAuthUser(request);
    if (!user) return errorResponse('Unauthorized', 401);

    await connectDB();

    const { searchParams } = new URL(request.url);
    const period  = searchParams.get('period')  ?? 'monthly';
    const format  = searchParams.get('format')  ?? 'csv';    // csv | json
    const startDate = searchParams.get('startDate');
    const endDate   = searchParams.get('endDate');

    let range = getDateRange(period);
    if (startDate && endDate) {
      range = { start: new Date(startDate), end: new Date(endDate) };
    }

    const match = {
      ...buildMatch(user as any, request.headers),
      createdAt: { $gte: range.start, $lte: range.end },
    };

    /* ── Fetch all tickets with full populate ── */
    const tickets = await Ticket.find(match)
      .populate('customerId',      'name email phone')
      .populate('technicianId',    'name email')
      .populate('serviceCenterId', 'name code address')
      .populate('categoryId',      'name slug')
      .populate('productId',       'name modelNumber warrantyPeriod')
      .sort({ createdAt: -1 })
      .limit(10000)   // safety cap
      .lean();

    /* ── JSON response ── */
    if (format === 'json') {
      return NextResponse.json({ success: true, data: tickets, total: tickets.length });
    }

    /* ── CSV response ── */
    const HEADERS = [
      'Ticket Number',
      'Title',
      'Status',
      'Priority',
      'Category',
      'Fault',
      'Product',
      'Model Number',
      'Customer Name',
      'Customer Email',
      'Customer Phone',
      'Technician',
      'Technician Email',
      'Service Center',
      'SC Code',
      'Brand (Tenant)',
      'SLA Response Deadline',
      'SLA Resolution Deadline',
      'SLA Response Breached',
      'SLA Resolution Breached',
      'Response Time',
      'Resolution Time',
      'Estimated Completion',
      'Actual Completion',
      'Notes Count',
      'Attachments Count',
      'Timeline Events',
      'Created At',
      'Updated At',
      'Description',
    ];

    const rows: string[][] = [HEADERS];

    for (const t of tickets) {
      const customer   = t.customerId   as any;
      const tech       = t.technicianId as any;
      const sc         = t.serviceCenterId as any;
      const category   = (t as any).categoryId as any;
      const product    = (t as any).productId  as any;

      rows.push([
        (t as any).ticketNumber ?? '',
        t.title,
        t.status,
        t.priority,
        category?.name ?? t.category ?? '',
        (t as any).faultName ?? '',
        product?.name ?? '',
        product?.modelNumber ?? '',
        customer?.name  ?? '',
        customer?.email ?? '',
        customer?.phone ?? '',
        tech?.name  ?? '',
        tech?.email ?? '',
        sc?.name ?? '',
        sc?.code ?? '',
        (t as any).tenantId ?? '',
        fmtDate(t.sla?.responseDeadline),
        fmtDate(t.sla?.resolutionDeadline),
        t.sla?.isResponseBreached   ? 'Yes' : 'No',
        t.sla?.isResolutionBreached ? 'Yes' : 'No',
        fmtMs(t.sla?.responseTime),
        fmtMs(t.sla?.resolutionTime),
        fmtDate(t.estimatedCompletionDate),
        fmtDate(t.actualCompletionDate),
        String((t.notes ?? []).length),
        String((t.attachments ?? []).length),
        String((t.timeline ?? []).length),
        fmtDate(t.createdAt),
        fmtDate(t.updatedAt),
        t.description.replace(/\n/g, ' ').slice(0, 500),
      ].map(escapeCsv));
    }

    const csv = rows.map(r => r.join(',')).join('\n');
    const filename = `tickets-${period}-${new Date().toISOString().slice(0,10)}.csv`;

    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type':        'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control':       'no-store',
      },
    });
  } catch (error) {
    console.error('Ticket export error:', error);
    return errorResponse('An error occurred', 500);
  }
}