// import type { WhatsAppPayload } from '@/types/notification'

// /**
//  * WhatsApp sender using Twilio or Meta Cloud API.
//  * Set env vars: TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_WHATSAPP_FROM
//  * Or: META_WA_TOKEN, META_WA_PHONE_ID
//  */

// interface WAResult { success: boolean; messageId?: string; error?: string }

// export async function sendWhatsApp(payload: WhatsAppPayload): Promise<WAResult> {
//   const phone = payload.phone.startsWith('+') ? payload.phone : `+91${payload.phone}`

//   // ---------- Twilio ----------
//   if (process.env.TWILIO_ACCOUNT_SID) {
//     try {
//       const sid    = process.env.TWILIO_ACCOUNT_SID
//       const token  = process.env.TWILIO_AUTH_TOKEN!
//       const from   = process.env.TWILIO_WHATSAPP_FROM || 'whatsapp:+14155238886'
//       const res    = await fetch(
//         `https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`,
//         {
//           method:  'POST',
//           headers: {
//             'Content-Type':  'application/x-www-form-urlencoded',
//             Authorization:   'Basic ' + Buffer.from(`${sid}:${token}`).toString('base64'),
//           },
//           body: new URLSearchParams({
//             From: from,
//             To:   `whatsapp:${phone}`,
//             Body: payload.message,
//           }),
//         }
//       )
//       const data = await res.json()
//       if (data.sid) return { success: true, messageId: data.sid }
//       return { success: false, error: data.message }
//     } catch (err) {
//       return { success: false, error: String(err) }
//     }
//   }

//   // ---------- Meta Cloud API ----------
//   if (process.env.META_WA_TOKEN) {
//     try {
//       const res = await fetch(
//         `https://graph.facebook.com/v18.0/${process.env.META_WA_PHONE_ID}/messages`,
//         {
//           method:  'POST',
//           headers: {
//             'Content-Type': 'application/json',
//             Authorization:  `Bearer ${process.env.META_WA_TOKEN}`,
//           },
//           body: JSON.stringify({
//             messaging_product: 'whatsapp',
//             to:   phone.replace('+', ''),
//             type: payload.templateName ? 'template' : 'text',
//             ...(payload.templateName
//               ? { template: { name: payload.templateName, language: { code:'en_US' }, components: [] } }
//               : { text: { body: payload.message } }),
//           }),
//         }
//       )
//       const data = await res.json()
//       return data.messages?.[0]?.id
//         ? { success: true, messageId: data.messages[0].id }
//         : { success: false, error: JSON.stringify(data.error) }
//     } catch (err) {
//       return { success: false, error: String(err) }
//     }
//   }

//   console.warn('[whatsapp] No provider configured. Set TWILIO_* or META_WA_* env vars.')
//   return { success: false, error: 'No WhatsApp provider configured' }
// }

// export function buildFeedbackWhatsAppMessage(params: {
//   clientName: string; rating: number; comment: string
// }): string {
//   return `*Power India Services CRM*\n\n` +
//     `📬 New Feedback Received\n\n` +
//     `*Client:* ${params.clientName}\n` +
//     `*Rating:* ${'⭐'.repeat(params.rating)} (${params.rating}/5)\n\n` +
//     `_"${params.comment.slice(0, 200)}${params.comment.length > 200 ? '...' : ''}"_\n\n` +
//     `👉 Login to CRM to respond.`
// }

interface WhatsAppConfig {
  accountSid: string;
  authToken: string;
  phoneNumber: string;
}

const config: WhatsAppConfig = {
  accountSid: process.env.TWILIO_ACCOUNT_SID!,
  authToken: process.env.TWILIO_AUTH_TOKEN!,
  phoneNumber: process.env.TWILIO_WHATSAPP_NUMBER!,
};

export interface WhatsAppMessage {
  to: string;
  body?: string;
  templateSid?: string;
  templateVariables?: Record<string, string>;
}

export async function sendWhatsAppMessage(message: WhatsAppMessage): Promise<void> {
  const client = require('twilio')(config.accountSid, config.authToken);

  await client.messages.create({
    from: `whatsapp:${config.phoneNumber}`,
    to: `whatsapp:${message.to}`,
    body: message.body,
    contentSid: message.templateSid,
    contentVariables: message.templateVariables
      ? JSON.stringify(message.templateVariables)
      : undefined,
  });
}

export async function sendWhatsAppTemplate(
  to: string,
  templateName: string,
  variables: Record<string, string>
): Promise<void> {
  // Map template names to Twilio content SIDs
  const templateMap: Record<string, string> = {
    ticket_update: process.env.TWILIO_TEMPLATE_TICKET_UPDATE!,
    appointment_reminder: process.env.TWILIO_TEMPLATE_APPOINTMENT!,
    feedback_request: process.env.TWILIO_TEMPLATE_FEEDBACK!,
  };

  const templateSid = templateMap[templateName];
  if (!templateSid) {
    throw new Error(`Template ${templateName} not configured`);
  }

  await sendWhatsAppMessage({
    to,
    templateSid,
    templateVariables: variables,
  });
}
