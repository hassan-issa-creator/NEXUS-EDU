import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import PDFDocument from 'pdfkit';
import * as ExcelJS from 'exceljs';
import * as fs from 'fs';
import * as path from 'path';

export interface ReportJobData {
  type: 'student-certificate' | 'attendance-report' | 'grades-report';
  format: 'pdf' | 'excel';
  data: Record<string, any>;
  userId: string;
}

@Processor('reports')
export class ReportProcessor extends WorkerHost {
  private readonly logger = new Logger(ReportProcessor.name);
  private readonly reportsDir = path.join(process.cwd(), 'uploads', 'reports');

  constructor() {
    super();
    // Ensure reports directory exists
    if (!fs.existsSync(this.reportsDir)) {
      fs.mkdirSync(this.reportsDir, { recursive: true });
    }
  }

  async process(job: Job<ReportJobData>): Promise<string> {
    this.logger.log(`Processing report job ${job.id}: ${job.data.type}`);

    const { type, format, data, userId } = job.data;
    const filename = `${type}-${userId}-${Date.now()}.${format}`;
    const filepath = path.join(this.reportsDir, filename);

    try {
      if (format === 'pdf') {
        await this.generatePDF(type, data, filepath);
      } else {
        await this.generateExcel(type, data, filepath);
      }

      this.logger.log(`Report generated: ${filepath}`);
      return `/uploads/reports/${filename}`;
    } catch (error) {
      this.logger.error(`Failed to generate report:`, error);
      throw error;
    }
  }

  private async generatePDF(
    type: string,
    data: Record<string, any>,
    filepath: string,
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ size: 'A4', margin: 50 });
      const stream = fs.createWriteStream(filepath);

      doc.pipe(stream);

      // Header
      doc.fontSize(24).text('Million Platform', { align: 'center' });
      doc.moveDown();

      // Report title
      const titles: Record<string, string> = {
        'student-certificate': 'شهادة الطالب',
        'attendance-report': 'تقرير الحضور',
        'grades-report': 'تقرير الدرجات',
      };
      doc.fontSize(18).text(titles[type] || 'Report', { align: 'center' });
      doc.moveDown(2);

      // Report content
      doc.fontSize(12);
      Object.entries(data).forEach(([key, value]) => {
        doc.text(`${key}: ${value}`);
        doc.moveDown(0.5);
      });

      // Footer
      doc.moveDown(2);
      doc
        .fontSize(10)
        .text(`Generated: ${new Date().toISOString()}`, { align: 'right' });

      doc.end();

      stream.on('finish', resolve);
      stream.on('error', reject);
    });
  }

  private async generateExcel(
    type: string,
    data: Record<string, any>,
    filepath: string,
  ): Promise<void> {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Million Platform';
    workbook.created = new Date();

    const sheet = workbook.addWorksheet('Report');

    // Add headers
    if (Array.isArray(data.rows) && data.rows.length > 0) {
      const headers = Object.keys(data.rows[0]);
      sheet.addRow(headers);

      // Style header row
      sheet.getRow(1).font = { bold: true };
      sheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: '3B82F6' },
      };

      // Add data rows
      data.rows.forEach((row: Record<string, any>) => {
        sheet.addRow(Object.values(row));
      });

      // Auto-fit columns
      sheet.columns.forEach((column) => {
        column.width = 15;
      });
    }

    await workbook.xlsx.writeFile(filepath);
  }
}
