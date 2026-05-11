// import type { EmailNotificationPayload } from '@/types/notification'

// /**
//  * Email sender — uses Nodemailer + SMTP or SendGrid.
//  * Set env vars: SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM
//  * Or: SENDGRID_API_KEY
//  */

// interface EmailResult { success: boolean; messageId?: string; error?: string }

// export async function sendEmail(payload: EmailNotificationPayload): Promise<EmailResult> {
//   try {
//     // ---------- SendGrid ----------
//     if (process.env.SENDGRID_API_KEY) {
//       const res = await fetch('https://api.sendgrid.com/v3/mail/send', {
//         method: 'POST',
//         headers: {
//           'Content-Type':  'application/json',
//           Authorization:   `Bearer ${process.env.SENDGRID_API_KEY}`,
//         },
//         body: JSON.stringify({
//           personalizations: [{
//             to: [{ email: payload.to }],
//             dynamic_template_data: payload.variables,
//           }],
//           from:        { email: process.env.SMTP_FROM || 'noreply@powerindiaservices.com' },
//           subject:     payload.subject,
//           template_id: payload.templateId,
//           content:     payload.html ? [{ type:'text/html', value: payload.html }] : undefined,
//         }),
//       })
//       if (res.ok || res.status === 202) return { success: true, messageId: res.headers.get('x-message-id') || undefined }
//       return { success: false, error: `SendGrid ${res.status}` }
//     }

//     // ---------- Nodemailer / SMTP ----------
//     const nodemailer = await import('nodemailer')
//     const transporter = nodemailer.default.createTransport({
//       host:   process.env.SMTP_HOST || 'smtp.gmail.com',
//       port:   Number(process.env.SMTP_PORT) || 587,
//       secure: false,
//       auth: {
//         user: process.env.SMTP_USER,
//         pass: process.env.SMTP_PASS,
//       },
//     })
//     const info = await transporter.sendMail({
//       from:    process.env.SMTP_FROM || 'noreply@powerindiaservices.com',
//       to:      payload.to,
//       subject: payload.subject,
//       html:    payload.html || '',
//     })
//     return { success: true, messageId: info.messageId }
//   } catch (err: unknown) {
//     console.error('[email] send error', err)
//     return { success: false, error: String(err) }
//   }
// }

// export function buildFeedbackEmailHtml(params: {
//   clientName: string
//   rating:     number
//   comment:    string
//   dashboardUrl?: string
// }): string {
//   return `
// <!DOCTYPE html>
// <html>
// <head><meta charset="utf-8" /><title>New Feedback</title></head>
// <body style="font-family:Inter,sans-serif;background:#f8fafc;padding:32px">
//   <div style="max-width:560px;margin:0 auto;background:#fff;border-radius:12px;padding:32px;border:1px solid #e2e8f0">
//     <h2 style="color:#1e1b4b;margin-bottom:8px">New Feedback Received</h2>
//     <p style="color:#64748b;font-size:14px;margin-bottom:24px">A client has submitted new feedback.</p>
//     <table style="width:100%;font-size:14px;color:#1e293b">
//       <tr><td style="padding:6px 0;color:#64748b">Client</td><td style="font-weight:600">${params.clientName}</td></tr>
//       <tr><td style="padding:6px 0;color:#64748b">Rating</td><td style="font-weight:600">${'★'.repeat(params.rating)}${'☆'.repeat(5-params.rating)} (${params.rating}/5)</td></tr>
//     </table>
//     <div style="margin-top:16px;background:#f8fafc;border-radius:8px;padding:16px;font-size:14px;color:#475569;line-height:1.6">
//       "${params.comment}"
//     </div>
//     ${params.dashboardUrl ? `<a href="${params.dashboardUrl}" style="display:inline-block;margin-top:24px;background:#3730a3;color:#fff;padding:10px 20px;border-radius:8px;font-size:14px;font-weight:600;text-decoration:none">View in Dashboard →</a>` : ''}
//     <p style="font-size:12px;color:#94a3b8;margin-top:24px">Power India Services CRM</p>
//   </div>
// </body>
// </html>`
// }

import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export interface EmailOptions {
  to: string | string[];
  subject: string;
  text?: string;
  html?: string;
  attachments?: {
    filename: string;
    content: Buffer | string;
    contentType?: string;
  }[];
}

export async function sendEmail(options: EmailOptions): Promise<void> {
  await transporter.sendMail({
    from: process.env.EMAIL_FROM || 'noreply@example.com',
    to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
    subject: options.subject,
    text: options.text,
    html: options.html,
    attachments: options.attachments,
  });
}

export async function sendTemplatedEmail(
  to: string,
  templateName: string,
  data: Record<string, any>
): Promise<void> {
  // In production, use template engine like Handlebars
  const templates: Record<string, { subject: string; html: string }> = {
    ticket_created: {
      subject: `Ticket #${data.ticketNumber} Created`,
      html: `
        <h1>Your ticket has been created</h1>
        <p>Ticket Number: ${data.ticketNumber}</p>
        <p>Title: ${data.title}</p>
        <p>We'll get back to you soon.</p>
      `,
    },
    ticket_resolved: {
      subject: `Ticket #${data.ticketNumber} Resolved`,
      html: `
        <h1>Your ticket has been resolved</h1>
        <p>Ticket Number: ${data.ticketNumber}</p>
        <p>Please let us know if you need further assistance.</p>
      `,
    },
    password_reset: {
      subject: 'Password Reset Request',
      html: `
        <h1>Password Reset</h1>
        <p>Click the link below to reset your password:</p>
        <a href="${data.resetLink}">${data.resetLink}</a>
        <p>This link expires in 1 hour.</p>
      `,
    },
  };

  const template = templates[templateName];
  if (!template) {
    throw new Error(`Template ${templateName} not found`);
  }

  await sendEmail({
    to,
    subject: template.subject,
    html: template.html,
  });
}
