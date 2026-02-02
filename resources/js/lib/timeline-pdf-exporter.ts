import { format, parseISO } from 'date-fns';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { Activity, ActivityType } from '@/types';
import { groupActivitiesByDate } from './activity-utils';

/**
 * Get activity type label
 */
function getTypeLabel(type: ActivityType): string {
    const labels = {
        call: 'Call',
        email: 'Email',
        meeting: 'Meeting',
        transaction: 'Transaction',
        note: 'Note',
    };
    return labels[type];
}

/**
 * Format activity details as a simple string
 */
function getDetails(activity: Activity): string {
    const parts: string[] = [];
    const data = activity.data || {};

    if (data.duration) parts.push(`Duration: ${data.duration}`);
    if (data.outcome) parts.push(`Outcome: ${data.outcome}`);
    if (data.meeting_type) parts.push(`Type: ${data.meeting_type}`);
    if (data.attendees) parts.push(`Attendees: ${data.attendees}`);
    if (data.transaction_type) parts.push(`Type: ${data.transaction_type}`);
    if (data.amount) parts.push(`Amount: ${data.amount}`);

    return parts.join(', ');
}

/**
 * Export timeline to PDF - Simple and reliable version
 */
export function exportTimelineToPDF(
    activities: Activity[],
    clientName: string = 'Client',
): void {
    // Create new PDF document
    const doc = new jsPDF();

    // Add title
    doc.setFontSize(16);
    doc.text('Activity Timeline', 14, 15);

    // Add client info
    doc.setFontSize(11);
    doc.text(`Client: ${clientName}`, 14, 23);
    doc.text(`Total Activities: ${activities.length}`, 14, 30);
    doc.text(`Date: ${format(new Date(), 'PPP')}`, 14, 37);

    // Group activities
    const grouped = groupActivitiesByDate(activities);
    let currentY = 45;

    // Process each group
    grouped.forEach((group) => {
        // Check if need new page
        if (currentY > 250) {
            doc.addPage();
            currentY = 20;
        }

        // Add group header
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text(`${group.label} (${group.activities.length})`, 14, currentY);
        currentY += 5;

        // Prepare table data
        const tableData = group.activities.map((activity) => [
            format(parseISO(activity.created_at), 'MMM d, h:mm a'),
            getTypeLabel(activity.type),
            activity.summary,
            getDetails(activity),
            activity.data?.notes || '',
        ]);

        // Add table
        autoTable(doc, {
            startY: currentY,
            head: [['Date', 'Type', 'Summary', 'Details', 'Notes']],
            body: tableData,
            theme: 'striped',
            styles: {
                fontSize: 8,
                cellPadding: 2,
            },
            headStyles: {
                fillColor: [71, 85, 105],
                fontSize: 9,
            },
            columnStyles: {
                0: { cellWidth: 30 },
                1: { cellWidth: 18 },
                2: { cellWidth: 45 },
                3: { cellWidth: 50 },
                4: { cellWidth: 'auto' },
            },
            margin: { left: 14, right: 14 },
        });

        // Update position
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        currentY = (doc as any).lastAutoTable.finalY + 10;
    });

    // Add page numbers
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const pageCount = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.text(
            `Page ${i} of ${pageCount}`,
            doc.internal.pageSize.getWidth() / 2,
            doc.internal.pageSize.getHeight() - 10,
            { align: 'center' }
        );
    }

    // Save file
    const fileName = `${clientName.replace(/\s+/g, '_')}_Timeline_${format(new Date(), 'yyyy-MM-dd')}.pdf`;
    doc.save(fileName);
}
