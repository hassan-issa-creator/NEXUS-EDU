import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 بدء إعادة تعيين وزرع البيانات المطلوبة...');

  const hashedPassword = await bcrypt.hash('123456', 10);

  // ==========================================
  // 1. تنظيف قاعدة البيانات (بالترتيب لتجنب مشاكل العلاقات)
  // ==========================================
  console.log('🗑️ تنظيف البيانات القديمة...');
  await prisma.auditLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.userAchievement.deleteMany();
  await prisma.millionScore.deleteMany();
  await prisma.millionProfile.deleteMany();
  await prisma.file.deleteMany();
  await prisma.messageReaction.deleteMany();
  await prisma.message.deleteMany();
  await prisma.conversationParticipant.deleteMany();
  await prisma.conversation.deleteMany();
  await prisma.submission.deleteMany();
  await prisma.grade.deleteMany();
  await prisma.attendance.deleteMany();
  await prisma.lesson.deleteMany();
  await prisma.assignment.deleteMany();
  await prisma.enrollment.deleteMany();
  await prisma.classSubject.deleteMany();
  await prisma.subject.deleteMany();
  await prisma.class.deleteMany();
  await prisma.parentStudent.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.user.deleteMany();

  // ==========================================
  // 2. المدرسة
  // ==========================================
  const school = await prisma.school.upsert({
    where: { slug: 'nexus-edu-riyadh' },
    update: {},
    create: {
      name: 'مدرسة نكسس الأهلية - الرياض',
      slug: 'nexus-edu-riyadh',
      description: 'مدرسة أهلية متميزة في الرياض تعتمد أحدث التقنيات التعليمية',
      isActive: true,
    },
  });
  console.log('✅ المدرسة:', school.name);

  // ==========================================
  // 3. الحسابات الإدارية (واحد من كل دور)
  // ==========================================
  const adminUsers = [
    { email: 'principal@nexusedu.sa', name: 'أ. صالح العمري', role: 'PRINCIPAL', firstName: 'صالح', lastName: 'العمري' },
    { email: 'vice.principal@nexusedu.sa', name: 'أ. ناصر السبيعي', role: 'VICE_PRINCIPAL', firstName: 'ناصر', lastName: 'السبيعي' },
    { email: 'counselor@nexusedu.sa', name: 'أ. بندر العتيبي', role: 'COUNSELOR', firstName: 'بندر', lastName: 'العتيبي' },
    { email: 'supervisor@nexusedu.sa', name: 'أ. منيرة القحطاني', role: 'SUPERVISOR', firstName: 'منيرة', lastName: 'القحطاني' },
    { email: 'accountant@nexusedu.sa', name: 'أ. فهد الدوسري', role: 'ACCOUNTANT', firstName: 'فهد', lastName: 'الدوسري' },
    { email: 'admin@nexusedu.sa', name: 'أدمن النظام', role: 'ADMIN', firstName: 'أدمن', lastName: 'النظام' },
  ];

  for (const admin of adminUsers) {
    await prisma.user.create({
      data: {
        email: admin.email,
        password: hashedPassword,
        name: admin.name,
        firstName: admin.firstName,
        lastName: admin.lastName,
        role: admin.role as any,
        schoolId: school.id,
        isActive: true,
      },
    });
  }
  console.log('✅ تم إنشاء الحسابات الإدارية');

  // ==========================================
  // 4. المعلمون (واحد لكل مادة)
  // ==========================================
  const teachersData = [
    { email: 'arabic.teacher@nexusedu.sa', name: 'أ. فاطمة الزهراني', firstName: 'فاطمة', lastName: 'الزهراني' },
    { email: 'math.teacher@nexusedu.sa', name: 'أ. خالد القحطاني', firstName: 'خالد', lastName: 'القحطاني' },
    { email: 'islamic.teacher@nexusedu.sa', name: 'أ. عبدالله الدوسري', firstName: 'عبدالله', lastName: 'الدوسري' },
    { email: 'science.teacher@nexusedu.sa', name: 'أ. سارة الشمري', firstName: 'سارة', lastName: 'الشمري' },
    { email: 'english.teacher@nexusedu.sa', name: 'Ms. Nora Al-Otaibi', firstName: 'نورة', lastName: 'العتيبي' },
  ];

  const teachers: any[] = [];
  for (const t of teachersData) {
    const teacher = await prisma.user.create({
      data: {
        email: t.email,
        password: hashedPassword,
        name: t.name,
        firstName: t.firstName,
        lastName: t.lastName,
        role: 'TEACHER',
        schoolId: school.id,
        isActive: true,
      },
    });
    teachers.push(teacher);
  }
  console.log('✅ تم إنشاء المعلمين (5 معلمين)');

  // ==========================================
  // 5. الطلاب (5 طلاب)
  // ==========================================
  const studentsData = [
    { email: 'student1@nexusedu.sa', name: 'أحمد فيصل الغامدي', firstName: 'أحمد', lastName: 'الغامدي' },
    { email: 'student2@nexusedu.sa', name: 'عمر سلطان الحربي', firstName: 'عمر', lastName: 'الحربي' },
    { email: 'student3@nexusedu.sa', name: 'يوسف ناصر الشهري', firstName: 'يوسف', lastName: 'الشهري' },
    { email: 'student4@nexusedu.sa', name: 'عبدالرحمن محمد العنزي', firstName: 'عبدالرحمن', lastName: 'العنزي' },
    { email: 'student5@nexusedu.sa', name: 'سلمان جابر القرني', firstName: 'سلمان', lastName: 'القرني' },
  ];

  const students: any[] = [];
  for (const s of studentsData) {
    const student = await prisma.user.create({
      data: {
        email: s.email,
        password: hashedPassword,
        name: s.name,
        firstName: s.firstName,
        lastName: s.lastName,
        role: 'STUDENT',
        schoolId: school.id,
        isActive: true,
        totalXP: 500,
        level: 2,
        streakDays: 5,
      },
    });
    students.push(student);
  }
  console.log('✅ تم إنشاء الطلاب (5 طلاب)');

  // ==========================================
  // 6. أولياء الأمور (5 أولياء أمور، واحد لكل طالب)
  // ==========================================
  const parentsData = [
    { email: 'parent1@nexusedu.sa', name: 'والد أحمد الغامدي', firstName: 'فيصل', lastName: 'الغامدي' },
    { email: 'parent2@nexusedu.sa', name: 'والد عمر الحربي', firstName: 'سلطان', lastName: 'الحربي' },
    { email: 'parent3@nexusedu.sa', name: 'والد يوسف الشهري', firstName: 'ناصر', lastName: 'الشهري' },
    { email: 'parent4@nexusedu.sa', name: 'والد عبدالرحمن العنزي', firstName: 'محمد', lastName: 'العنزي' },
    { email: 'parent5@nexusedu.sa', name: 'والد سلمان القرني', firstName: 'جابر', lastName: 'القرني' },
  ];

  for (let i = 0; i < parentsData.length; i++) {
    const p = parentsData[i];
    const parent = await prisma.user.create({
      data: {
        email: p.email,
        password: hashedPassword,
        name: p.name,
        firstName: p.firstName,
        lastName: p.lastName,
        role: 'PARENT',
        schoolId: school.id,
        isActive: true,
      },
    });
    // ربط ولي الأمر بالطالب
    await prisma.parentStudent.create({
      data: { parentId: parent.id, studentId: students[i].id },
    });
  }
  console.log('✅ تم إنشاء أولياء الأمور وربطهم بالطلاب');

  // ==========================================
  // 7. الفصل الدراسي والمواد
  // ==========================================
  const classRoom = await prisma.class.create({
    data: {
      name: 'الصف الأول الابتدائي - أ',
      description: 'فصل الصف الأول الابتدائي - عام 1446هـ',
      academicYear: '1446',
      teacherId: teachers[0].id,
      schoolId: school.id,
    },
  });

  // تسجيل جميع الطلاب في الفصل
  for (const s of students) {
    await prisma.enrollment.create({
      data: { studentId: s.id, classId: classRoom.id },
    });
  }

  const subjectsData = [
    { name: 'لغتي الجميلة', code: 'ARB101', teacherIdx: 0 },
    { name: 'الرياضيات', code: 'MTH101', teacherIdx: 1 },
    { name: 'التربية الإسلامية', code: 'ISL101', teacherIdx: 2 },
    { name: 'العلوم', code: 'SCI101', teacherIdx: 3 },
    { name: 'اللغة الإنجليزية', code: 'ENG101', teacherIdx: 4 },
  ];

  const subjects: any[] = [];
  for (const s of subjectsData) {
    const subject = await prisma.subject.create({
      data: {
        name: s.name,
        code: s.code,
        classId: classRoom.id,
        teacherId: teachers[s.teacherIdx].id,
        schoolId: school.id,
      },
    });
    subjects.push(subject);
  }
  console.log('✅ تم إنشاء الفصل والمواد وتوزيع المعلمين');

  // ==========================================
  // 8. بيانات تجريبية للتكامل (واجب لكل مادة)
  // ==========================================
  for (let i = 0; i < subjects.length; i++) {
    const sub = subjects[i];
    const teacher = teachers[i];
    
    await prisma.assignment.create({
      data: {
        title: `واجب مادة ${sub.name}`,
        description: `يرجى حل التمارين في الصفحة رقم ${i + 5}`,
        subjectId: sub.id,
        teacherId: teacher.id,
        classId: classRoom.id,
        schoolId: school.id,
        maxScore: 10,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      }
    });
  }
  console.log('✅ تم إنشاء واجبات تجريبية لجميع الطلاب');

  console.log('\n🎉 تم إعادة تعيين البيانات بنجاح!');
  console.log('\n🔑 بيانات الدخول الجديدة (كلمة المرور: 123456)');
  console.log('--------------------------------------------------');
  console.log('بوابه الطالب: student1@nexusedu.sa (إلى student5)');
  console.log('بوابه المعلم: arabic.teacher@nexusedu.sa (وغيرهم لكل مادة)');
  console.log('بوابه ولي الأمر: parent1@nexusedu.sa (إلى parent5)');
  console.log('مدير المدرسة: principal@nexusedu.sa');
  console.log('وكيل المدرسة: vice.principal@nexusedu.sa');
  console.log('التوجيه الطلابي: counselor@nexusedu.sa');
  console.log('الاشراف التربوي: supervisor@nexusedu.sa');
  console.log('الشئون الإدارية: accountant@nexusedu.sa');
  console.log('--------------------------------------------------');
}

main()
  .catch(e => { console.error('❌ خطأ:', e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
