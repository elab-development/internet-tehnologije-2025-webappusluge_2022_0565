import { redirect } from 'next/navigation';
import { requireRole } from '@/lib/auth-helpers';
import { UserRole } from '@prisma/client';
import CalendarClient from './CalendarClient';

/**
 * Calendar Page
 * Samo za FREELANCER i COMPANY
 */
export default async function CalendarPage() {
    const user = await requireRole([UserRole.FREELANCER, UserRole.COMPANY]);

    if (!user) {
        redirect('/auth/login');
    }

    return <CalendarClient />;
}
