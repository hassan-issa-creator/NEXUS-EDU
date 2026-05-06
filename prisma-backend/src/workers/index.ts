import { Queue, Worker } from 'bullmq';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const connection = {
    host: process.env.REDIS_HOST || 'localhost',
    port: Number(process.env.REDIS_PORT) || 6379,
};

// Invoice Queue
export const invoiceQueue = new Queue('invoices', { connection });

// Worker
new Worker('invoices', async (job) => {
    if (job.name === 'generate-monthly-invoices') {
        const { month, year } = job.data;

        const enrollments = await prisma.enrollment.findMany({
            where: { status: 'active' },
            include: { student: true, class: true }
        });

        for (const enrollment of enrollments) {
            await prisma.payment.create({
                data: {
                    studentId: enrollment.studentId,
                    amount: 1500, // Default amount
                    description: `School Fee - ${month}/${year}`,
                    dueDate: new Date(year, month, 15)
                }
            });

            await prisma.notification.create({
                data: {
                    userId: enrollment.studentId,
                    type: 'PAYMENT',
                    title: 'New Invoice',
                    message: `Invoice for ${month}/${year} has been generated`
                }
            });
        }

        return { invoicesGenerated: enrollments.length };
    }
}, { connection });

// Schedule job (call this monthly)
export const scheduleMonthlyInvoices = async () => {
    const now = new Date();
    await invoiceQueue.add('generate-monthly-invoices', {
        month: now.getMonth() + 1,
        year: now.getFullYear()
    });
};
