import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient();

export type { Trip, Experience, ItineraryItem, Inquiry, AdminUser } from '@prisma/client';
