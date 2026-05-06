import { Injectable } from '@nestjs/common';
import { unlink } from 'fs/promises';
import { join } from 'path';
import { PrismaService } from '../prisma.service';

@Injectable()
export class UploadService {
  private readonly uploadPath = './uploads';

  constructor(private prisma: PrismaService) {}

  getFileUrl(filename: string): string {
    return `/uploads/${filename}`;
  }

  async saveFileMetadata(
    filename: string,
    originalName: string,
    mimeType: string,
    size: number,
    userId: string,
  ) {
    const url = this.getFileUrl(filename);

    return this.prisma.file.create({
      data: {
        filename,
        originalName,
        mimeType,
        size,
        url,
        uploadedById: userId,
      },
    });
  }

  async getFile(id: string) {
    return this.prisma.file.findUnique({
      where: { id },
      include: {
        uploadedBy: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    });
  }

  async getUserFiles(userId: string) {
    return this.prisma.file.findMany({
      where: { uploadedById: userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async deleteFile(id: string): Promise<void> {
    try {
      const file = await this.prisma.file.findUnique({
        where: { id },
      });

      if (!file) {
        throw new Error('File not found');
      }

      const filePath = join(this.uploadPath, file.filename);
      await unlink(filePath);

      await this.prisma.file.delete({
        where: { id },
      });
    } catch (error) {
      console.error('Failed to delete file:', error);
      throw new Error('Failed to delete file');
    }
  }

  validateFileSize(size: number, maxSize: number = 10): boolean {
    const maxSizeInBytes = maxSize * 1024 * 1024;
    return size <= maxSizeInBytes;
  }
}
