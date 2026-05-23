// app/api/contact/route.ts  — NEW FILE

import { NextRequest, NextResponse } from 'next/server';
import { successResponse, errorResponse } from '@/utils/apiResponse';
import { getAuthUser } from '@/lib/auth-helper';
import connectDB from '@/lib/db';
import Contact from '@/models/Contact';

/* ── POST /api/contact — public, no auth needed ─────────────────────────── */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, phone, company, teamSize, inquiryType, message } = body;

    if (!name?.trim())    return errorResponse('Name is required', 400);
    if (!email?.trim())   return errorResponse('Email is required', 400);
    if (!company?.trim()) return errorResponse('Company is required', 400);
    if (!message?.trim()) return errorResponse('Message is required', 400);
    if (!/^\S+@\S+\.\S+$/.test(email)) return errorResponse('Invalid email', 400);

    await connectDB();

    // Generate unique reference ID
    const referenceId = `TCH-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2,6).toUpperCase()}`;

    const contact = await Contact.create({
      name:        name.trim(),
      email:       email.trim().toLowerCase(),
      phone:       phone?.trim() || undefined,
      company:     company.trim(),
      teamSize:    teamSize || undefined,
      inquiryType: inquiryType || undefined,
      message:     message.trim(),
      referenceId,
      status:      'new',
    });

    return successResponse(
      { referenceId: contact.referenceId },
      'Your message has been received. We will get back to you within 24 hours.',
      201
    );
  } catch (error) {
    console.error('Contact POST error:', error);
    return errorResponse('An error occurred. Please try again.', 500);
  }
}

/* ── GET /api/contact — admin only, lists all inquiries ─────────────────── */
export async function GET(request: NextRequest) {
  try {
    const user = getAuthUser(request);
    if (!user) return errorResponse('Unauthorized', 401);
    if (user.role !== 'admin') return errorResponse('Forbidden', 403);

    await connectDB();

    const { searchParams } = new URL(request.url);
    const page   = parseInt(searchParams.get('page')  ?? '1');
    const limit  = parseInt(searchParams.get('limit') ?? '20');
    const status = searchParams.get('status') ?? '';
    const search = searchParams.get('search') ?? '';

    const filter: Record<string, any> = {};
    if (status) filter.status = status;
    if (search) {
      filter.$or = [
        { name:    { $regex: search, $options: 'i' } },
        { email:   { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } },
        { referenceId: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (page - 1) * limit;
    const [contacts, total] = await Promise.all([
      Contact.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Contact.countDocuments(filter),
    ]);

    const newCount = await Contact.countDocuments({ status: 'new' });

    return successResponse({
      contacts,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      newCount,
    }, 'Contacts fetched');
  } catch (error) {
    console.error('Contact GET error:', error);
    return errorResponse('An error occurred', 500);
  }
}

/* ── PATCH /api/contact — admin updates status ───────────────────────────── */
export async function PATCH(request: NextRequest) {
  try {
    const user = getAuthUser(request);
    if (!user) return errorResponse('Unauthorized', 401);
    if (user.role !== 'admin') return errorResponse('Forbidden', 403);

    await connectDB();
    const body = await request.json();
    const { id, status, notes } = body;

    if (!id) return errorResponse('Contact id required', 400);

    const update: Record<string, any> = {};
    if (status) update.status = status;
    if (notes)  update.notes  = notes;
    if (status === 'replied') update.repliedAt = new Date();

    const contact = await Contact.findByIdAndUpdate(id, update, { new: true });
    if (!contact) return errorResponse('Contact not found', 404);

    return successResponse(contact, 'Contact updated');
  } catch (error) {
    console.error('Contact PATCH error:', error);
    return errorResponse('An error occurred', 500);
  }
}