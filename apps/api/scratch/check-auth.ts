import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function check() {
  const email = 'student1@nexusedu.sa';
  const user = await prisma.user.findUnique({ where: { email } });
  
  if (!user) {
    console.log('❌ User not found');
    return;
  }
  
  console.log('✅ User found:', user.email);
  console.log('Role:', user.role);
  
  const isValid = await bcrypt.compare('Nexus@123', user.password);
  console.log('Password Nexus@123 valid?', isValid);
  
  await prisma.$disconnect();
}

check();
