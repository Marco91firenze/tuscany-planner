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
        // Duplicate inquiry for this trip
        const e: any = new Error('Inquiry already submitted for this trip');
        e.code = 'BAD_REQUEST';
        throw e;
      }
      if (err?.code === 'P2003') {
        // Foreign key constraint - trip doesn't exist
        const e: any = new Error('Trip not found');
        e.code = 'NOT_FOUND';
        throw e;
      }
      throw err;
    }

    // Format experiences for email
    const expSummary = inquiry.trip.items.map(
      (item) =>
        `${item.experience.slug} - ${new Date(item.date).toLocaleDateString()} (${item.slot}, ${item.participants} guests)`
    );

    const checkInStr = new Date(inquiry.trip.checkIn).toLocaleDateString();
    const checkOutStr = new Date(inquiry.trip.checkOut).toLocaleDateString();

    // Send confirmation to guest
    await sendEmail(
      inquiry.contactEmail,
      'Your Florence Premium Tours Itinerary',
      inquiryConfirmationTemplate({
        name: inquiry.contactName,
        checkIn: checkInStr,
        checkOut: checkOutStr,
        experiences: expSummary,
      })
    );

    // Notify operator
    const operatorEmail = process.env.OPERATOR_EMAIL || 'marcorome91@gmail.com';
    await sendEmail(
      operatorEmail,
      `New Inquiry: ${inquiry.contactName}`,
      operatorNotificationTemplate({
        name: inquiry.contactName,
        email: inquiry.contactEmail,
        phone: inquiry.contactPhone || '',
        checkIn: checkInStr,
        checkOut: checkOutStr,
        experiences: expSummary,
      })
    );

    return inquiry;
  }),

  getStatus: procedure.input(z.string()).query(async ({ input }) => {
    return prisma.inquiry.findUnique({
      where: { id: input },
      include: { trip: { include: { items: { include: { experience: true } } } } },
    });
  }),
});
