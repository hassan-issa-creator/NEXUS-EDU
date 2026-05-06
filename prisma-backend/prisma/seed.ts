import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    // Create admin
    const admin = await prisma.user.create({
        data: {
            email: 'admin@kfis.edu.sa',
            password: await bcrypt.hash('admin123', 10),
            fullName: 'Ahmed Al-Mansour',
            role: 'ADMIN'
        }
    });

    // Create school
    const school = await prisma.school.create({
        data: {
            name: 'King Fahad International School',
            nameAr: 'مدرسة الملك فهد الدولية',
            city: 'Riyadh',
            country: 'Saudi Arabia'
        }
    });

    console.log('Seed completed!');
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
