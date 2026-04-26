import { router, procedure } from '../trpc';
import { prisma } from '../../lib/prisma';
import { z } from 'zod';
import { inquiryConfirmationTemplate, operatorNotificationTemplate } from '../../lib/email-templates';

const SubmitInquiryInput = z.object({
  tripId: z.string(),
  contactName: z.string().min(2),
  contactEmail: z.string().email(),
  contactPhone: z.string().optional(),
  specialNotes: z.string().optional(),
});

const EXPERIENCE_TITLES: Record<string, string> = {
  'mugello-racing': 'Mugello Racing Test Drive',
  'personal-shopper': 'Personal Shopper - Via Tornabuoni',
  'boat-tour': 'Boat Tour - Forte dei Marmi & Elba',
  'yacht-itinerary': 'Yacht Custom Itinerary',
  'private-chef-dinner': 'Private Chef Dinner',
  'cooking-class': 'Tuscan Cooking Class',
  'helicopter-flight': 'Helicopter Flight over Tuscany',
  'quad-motocross': 'Quad/Motocross through Chianti',
  'horse-riding-wine': 'Horse Riding + Wine Tasting',
  'cantina-antinori': 'Cantina Antinori Winery',
};

const SLOT_LABELS: Record<string, string> = {
  MORNING: '🌅 Morning',
  AFTERNOON: '☀️ Afternoon',
  EVENING: '🌆 Evening',
  FULL_DAY: '🌞 Full Day',
};

async function sendEmail(to: string, subject: string, html: string) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn('RESEND_API_KEY not set, skipping email');
    return null;
  }

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Florence Premium Tours <onboarding@resend.dev>',
        to: [to],
        subject,
        html,
      }),
    });

    if (!res.ok) {
      const error = await res.text();
      console.error('Resend error:', error);
      return null;
    }

    return await res.json();
  } catch (err) {
    console.error('Email send failed:', err);
    return null;
  }
}

async function sendTelegram(message: string) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) {
    console.warn('TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID not set, skipping telegram');
    return null;
  }

  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'HTML',
        disable_web_page_preview: true,
      }),
    });

    if (!res.ok) {
      const error = await res.text();
      console.error('Telegram error:', error);
      return null;
    }
    return await res.json();
  } catch (err) {
    console.error('Telegram send failed:', err);
    return null;
  }
}

function escapeHtml(s: string) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function formatTelegramMessage(inquiry: any): string {
  const trip = inquiry.trip;
  const checkIn = new Date(trip.checkIn).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  const checkOut = new Date(trip.checkOut).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  const guestNames: string[] = trip.guestNames || [];
  const guestList = guestNames.length > 0 ? guestNames.filter((n: string) => n.trim()) : [];

  // Group items by date
  const itemsByDate = new Map<string, any[]>();
  for (const item of trip.items) {
    const key = new Date(item.date).toDateString();
    if (!itemsByDate.has(key)) itemsByDate.set(key, []);
    itemsByDate.get(key)!.push(item);
  }

  // Sort dates
  const sortedDates = Array.from(itemsByDate.keys()).sort(
    (a, b) => new Date(a).getTime() - new Date(b).getTime()
  );

  let calendarStr = '';
  for (const dateStr of sortedDates) {
    const items = itemsByDate.get(dateStr)!;
    const dateFmt = new Date(dateStr).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
    calendarStr += `\n📅 <b>${escapeHtml(dateFmt)}</b>\n`;
    for (const item of items) {
      const title = EXPERIENCE_TITLES[item.experience.slug] || item.experience.slug;
      const slotLabel = SLOT_LABELS[item.slot] || item.slot;
      const names: string[] = item.participantNames || [];
      const guestText = names.length > 0
        ? names.map((n) => escapeHtml(n)).join(', ')
        : `${item.participants} guest${item.participants > 1 ? 's' : ''}`;
      calendarStr += `   ${slotLabel} <b>${escapeHtml(title)}</b>\n   👥 ${guestText}\n`;
    }
  }

  const guestsBlock = guestList.length > 0
    ? guestList.map((n: string, i: number) => `   ${i + 1}. ${escapeHtml(n)}`).join('\n')
    : `   (${trip.partySize} unnamed guests)`;

  return `🎯 <b>NEW INQUIRY — Florence Premium Tours</b>

👤 <b>Contact</b>
   Name: ${escapeHtml(inquiry.contactName)}
   Email: ${escapeHtml(inquiry.contactEmail)}
   Phone: ${escapeHtml(inquiry.contactPhone || 'not provided')}
   Hotel: ${escapeHtml(trip.hotelName || 'not provided')}

🏨 <b>Stay</b>
   ${checkIn} → ${checkOut}
   Party size: ${trip.partySize}
   Language: ${escapeHtml(trip.language)}

👥 <b>Guests</b>
${guestsBlock}

📆 <b>Calendar (${trip.items.length} experience${trip.items.length !== 1 ? 's' : ''})</b>${calendarStr || '\n   (none)'}

📝 <b>Special notes</b>
${escapeHtml(inquiry.specialNotes || '(none)')}

🆔 Inquiry: <code>${inquiry.id}</code>
🆔 Trip: <code>${trip.id}</code>`;
}

export const inquiryRouter = router({
  submit: procedure.input(SubmitInquiryInput).mutation(async ({ input }) => {
    let inquiry;
    try {
      inquiry = await prisma.inquiry.create({
        data: {
          ...input,
          status: 'NEW',
        },
        include: { trip: { include: { items: { include: { experience: true } } } } },
      });
    } catch (err: any) {
      if (err?.code === 'P2002') {
        const e: any = new Error('Inquiry already submitted for this trip');
        e.code = 'BAD_REQUEST';
        throw e;
      }
      if (err?.code === 'P2003') {
        const e: any = new Error('Trip not found');
        e.code = 'NOT_FOUND';
        throw e;
      }
      throw err;
    }

    // Format experiences for email
    const expSummary = inquiry.trip.items.map(
      (item) => {
        const title = EXPERIENCE_TITLES[item.experience.slug] || item.experience.slug;
        const date = new Date(item.date).toLocaleDateString();
        const names = (item.participantNames || []).filter(Boolean);
        const guestText = names.length > 0 ? names.join(', ') : `${item.participants} guests`;
        return `${title} — ${date} (${item.slot}, ${guestText})`;
      }
    );

    const checkInStr = new Date(inquiry.trip.checkIn).toLocaleDateString();
    const checkOutStr = new Date(inquiry.trip.checkOut).toLocaleDateString();

    // Run all notifications in parallel — failure of one does not block others
    await Promise.allSettled([
      sendEmail(
        inquiry.contactEmail,
        'Your Florence Premium Tours Itinerary',
        inquiryConfirmationTemplate({
          name: inquiry.contactName,
          checkIn: checkInStr,
          checkOut: checkOutStr,
          experiences: expSummary,
        })
      ),
      sendEmail(
        process.env.OPERATOR_EMAIL || 'marcorome91@gmail.com',
        `New Inquiry: ${inquiry.contactName}`,
        operatorNotificationTemplate({
          name: inquiry.contactName,
          email: inquiry.contactEmail,
          phone: inquiry.contactPhone || '',
          checkIn: checkInStr,
          checkOut: checkOutStr,
          experiences: expSummary,
        })
      ),
      sendTelegram(formatTelegramMessage(inquiry)),
    ]);

    return inquiry;
  }),

  getStatus: procedure.input(z.string()).query(async ({ input }) => {
    return prisma.inquiry.findUnique({
      where: { id: input },
      include: { trip: { include: { items: { include: { experience: true } } } } },
    });
  }),
});
