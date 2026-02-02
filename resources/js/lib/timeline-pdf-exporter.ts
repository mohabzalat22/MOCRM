import { format, parseISO, differenceInMonths } from 'date-fns';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { Activity, ActivityType, Client } from '@/types';
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
 * Parse currency string to number
 */
function parseCurrency(value: string | undefined): number {
    if (!value) return 0;
    // Remove non-numeric characters except decimal point and minus sign
    const cleanValue = value.replace(/[^0-9.-]+/g, '');
    const num = parseFloat(cleanValue);
    return isNaN(num) ? 0 : num;
}

/**
 * Calculate financial metrics
 */
function calculateFinancials(activities: Activity[], clientCreatedAt: string) {
    let totalValue = 0;
    const monthlyValues: Record<string, number> = {};

    activities.forEach((activity) => {
        if (activity.type === 'transaction' && activity.data?.amount) {
            const amount = parseCurrency(activity.data.amount as string);
            totalValue += amount;

            const monthKey = format(parseISO(activity.created_at), 'yyyy-MM');
            monthlyValues[monthKey] = (monthlyValues[monthKey] || 0) + amount;
        }
    });

    let monthsActive = 1;
    try {
        if (clientCreatedAt) {
            monthsActive = Math.max(
                1,
                differenceInMonths(new Date(), parseISO(clientCreatedAt)) + 1,
            );
        }
    } catch (e) {
        console.warn('Error calculating months active:', e);
    }

    const monthlyAverage = totalValue / monthsActive;

    return {
        totalValue,
        monthlyAverage,
        monthlyValues,
    };
}

/**
 * Export timeline to PDF - Detailed version with Financials
 */
export function exportTimelineToPDF(
    activities: Activity[],
    client: Client,
): void {
    // Create new PDF document
    const doc = new jsPDF();
    // Safe date formatting helper
    const getSafeDate = (
        dateString: string | undefined,
        activities: Activity[],
    ) => {
        if (dateString && !isNaN(parseISO(dateString).getTime())) {
            return parseISO(dateString);
        }

        // Fallback: Find earliest activity date
        if (activities.length > 0) {
            const sorted = [...activities].sort(
                (a, b) =>
                    new Date(a.created_at).getTime() -
                    new Date(b.created_at).getTime(),
            );
            return parseISO(sorted[0].created_at);
        }

        return new Date(); // Default to now if nothing else
    };

    const clientDate = getSafeDate(client.created_at, activities);
    const financials = calculateFinancials(
        activities,
        clientDate.toISOString(),
    );

    // --- Header Section ---
    doc.setFontSize(22);
    doc.setTextColor(30, 41, 59); // Slate 800
    doc.text('Activity Timeline', 14, 20);

    // Client Name & Company
    doc.setFontSize(16);
    doc.text(client.name, 14, 32);
    if (client.company_name) {
        doc.setFontSize(12);
        doc.setTextColor(100, 116, 139); // Slate 500
        doc.text(client.company_name, 14, 38);
    }

    // --- Client Details Box ---
    doc.setDrawColor(226, 232, 240); // Slate 200
    doc.setFillColor(248, 250, 252); // Slate 50
    doc.rect(14, 45, 182, 45, 'F');
    doc.setLineWidth(0.1);
    doc.rect(14, 45, 182, 45, 'S');

    doc.setFontSize(10);
    doc.setTextColor(71, 85, 105); // Slate 600

    // Left Column
    let leftY = 52;
    doc.text(`Email: ${client.email}`, 20, leftY);
    leftY += 6;
    if (client.phone) {
        doc.text(`Phone: ${client.phone}`, 20, leftY);
        leftY += 6;
    }
    doc.text(`Client Since: ${format(clientDate, 'MMM d, yyyy')}`, 20, leftY);
    leftY += 6;
    if (client.website) {
        doc.text(`Website: ${client.website}`, 20, leftY);
        leftY += 6;
    }

    // Right Column (Address & Custom Fields)
    let rightY = 52;
    const rightX = 110;

    if (client.address) {
        // Simple wrap for address if needed, though usually short
        doc.text(`Address: ${client.address}`, rightX, rightY);
        rightY += 6;
    }

    // Display first 3 custom fields
    if (client.custom_fields && client.custom_fields.length > 0) {
        client.custom_fields.slice(0, 3).forEach((field) => {
            if (field.key && field.value) {
                doc.text(`${field.key}: ${field.value}`, rightX, rightY);
                rightY += 6;
            }
        });
    }

    // --- Financial Summary ---
    const startYval = 100;
    doc.setFontSize(12);
    doc.setTextColor(30, 41, 59);
    doc.text('Financial Summary', 14, startYval);

    // Financial Table (Small)
    const avgValue = isNaN(financials.monthlyAverage)
        ? 0
        : financials.monthlyAverage;
    const totalVal = isNaN(financials.totalValue) ? 0 : financials.totalValue;

    autoTable(doc, {
        startY: startYval + 3,
        head: [['Total Value', 'Monthly Average', 'Total Activities']],
        body: [
            [
                `$${totalVal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
                `$${avgValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
                activities.length.toString(),
            ],
        ],
        theme: 'plain',
        styles: {
            fontSize: 10,
            cellPadding: 4,
            textColor: [30, 41, 59],
        },
        headStyles: {
            fontStyle: 'bold',
            fillColor: [241, 245, 249],
        },
        columnStyles: {
            0: { cellWidth: 50 },
            1: { cellWidth: 50 },
            2: { cellWidth: 40 },
        },
        margin: { left: 14, right: 14 },
    });

    // --- Activity Timeline ---
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let currentY = (doc as any).lastAutoTable.finalY + 15;

    // Group activities
    const grouped = groupActivitiesByDate(activities);

    // Process each group
    grouped.forEach((group) => {
        // Check if need new page
        if (currentY > 250) {
            doc.addPage();
            currentY = 20;
        }

        // Add group header
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(71, 85, 105);
        doc.text(`${group.label} (${group.activities.length})`, 14, currentY);
        currentY += 4;

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
                cellPadding: 3,
            },
            headStyles: {
                fillColor: [71, 85, 105],
                fontSize: 9,
                fontStyle: 'bold',
            },
            columnStyles: {
                0: { cellWidth: 30 },
                1: { cellWidth: 18 },
                2: { cellWidth: 40 },
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
        doc.setTextColor(148, 163, 184);
        doc.text(
            `Page ${i} of ${pageCount}`,
            doc.internal.pageSize.getWidth() / 2,
            doc.internal.pageSize.getHeight() - 10,
            { align: 'center' },
        );
    }

    // Save file
    const fileName = `${client.name.replace(/\s+/g, '_')}_Timeline_${format(new Date(), 'yyyy-MM-dd')}.pdf`;
    doc.save(fileName);
}
