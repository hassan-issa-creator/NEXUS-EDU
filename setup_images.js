const fs = require('fs');
const path = require('path');

const photoDir = 'C:\\Users\\hassa\\Desktop\\anti\\photo';
const targetDir = 'C:\\Users\\hassa\\Desktop\\anti\\million-platform\\apps\\web\\public\\images';
const authTargetDir = 'C:\\Users\\hassa\\Desktop\\anti\\million-platform\\apps\\web\\public\\images\\auth';

if (!fs.existsSync(authTargetDir)) {
    fs.mkdirSync(authTargetDir, { recursive: true });
}

// 1. Landing Page Mappings
const landingMappings = {
    // صورة الطالب المتجه نحو بوابة المستقبل (مستقبل التعليم يبدأ من هنا)
    'ChatGPT Image May 8, 2026, 11_46_44 PM.png': 'hero-banner-new.png',
    
    // صورة الطالب الذي يستخدم الذكاء الاصطناعي مع أيقونات العقل
    'ChatGPT Image May 8, 2026, 11_55_43 PM.png': 'ai-learning-new.png',
    
    // صورة إحصائيات الطالب (رحلة الطالب، 78%، التقدم)
    'ChatGPT Image May 9, 2026, 01_32_54 AM.png': 'stats-comparison-new.png',
    
    // صورة لوحة المتصدرين (الترتيب 1، 2، 3 ونقاط XP)
    'ChatGPT Image May 9, 2026, 01_32_58 AM.png': 'leaderboard-new.png',
    
    // صورة متابعة ولي الأمر (رحلة تعليمية ذكية تطمئن ولي الأمر)
    'ChatGPT Image May 9, 2026, 01_33_10 AM.png': 'parent-monitoring-new.png',
    
    // صورة رؤية المستقبل والقيادة (تعلم اليوم، لتقود الغد)
    'ChatGPT Image May 9, 2026, 01_32_50 AM.png': 'vision-2030-new.png',
};

// 2. Auth Page Mappings
const authMappings = {
    // بوابة الطالب: صورة الطالب الذي ينظر للكأس (رحلة الطالب نحو التميز)
    'ChatGPT Image May 9, 2026, 01_33_04 AM.png': 'student.png',
    
    // بوابة المعلم: صورة المعلم داخل الفصل الذكي (الفصل الذكي.. تجربة بلا حدود)
    'ChatGPT Image May 9, 2026, 01_32_55 AM.png': 'teacher.png',
    
    // بوابة ولي الأمر: صورة لوحة التحكم (مكتوب فيها: متابعة أولياء الأمور)
    'ChatGPT Image May 9, 2026, 01_33_08 AM.png': 'parent.png',
    
    // بوابة قائد المدرسة: صورة القائد ينظر لشاشة الإحصائيات الضخمة (إدارة ذكية.. قرارات أفضل)
    'ChatGPT Image May 9, 2026, 01_33_00 AM.png': 'principal.png',
    
    // بوابة الإدارة: صورة الذكاء الاصطناعي كدعم إداري
    'ChatGPT Image May 9, 2026, 01_33_02 AM.png': 'admin.png',

    // بوابة الموجه: روبوت الذكاء الاصطناعي (مساعد وداعم)
    'ChatGPT Image May 9, 2026, 12_44_27 AM.png': 'counselor.png',
    
    // بوابة المشرف: صورة منصة تعليمية متكاملة
    'ChatGPT Image May 9, 2026, 01_33_05 AM.png': 'supervisor.png',
};

console.log("=========================================");
console.log("Replacing Landing Page Images Scientifically...");
console.log("=========================================");
for (const [source, dest] of Object.entries(landingMappings)) {
    const srcPath = path.join(photoDir, source);
    if (fs.existsSync(srcPath)) {
        fs.copyFileSync(srcPath, path.join(targetDir, dest));
        console.log(`✅ [Landing] Mapped -> ${dest}`);
    } else {
        console.log(`❌ Missing: ${source}`);
    }
}

console.log("\n=========================================");
console.log("Replacing Auth Page Images Scientifically...");
console.log("=========================================");
for (const [source, dest] of Object.entries(authMappings)) {
    const srcPath = path.join(photoDir, source);
    if (fs.existsSync(srcPath)) {
        fs.copyFileSync(srcPath, path.join(authTargetDir, dest));
        console.log(`✅ [Auth] Mapped -> auth/${dest}`);
    } else {
        console.log(`❌ Missing: ${source}`);
    }
}

// Copy principal to vice principal as they share the same context
const principalPath = path.join(photoDir, 'ChatGPT Image May 9, 2026, 01_33_00 AM.png');
if (fs.existsSync(principalPath)) {
    fs.copyFileSync(principalPath, path.join(authTargetDir, 'vice_principal.png'));
    console.log(`✅ [Auth] Mapped -> auth/vice_principal.png`);
}

console.log('\n🎉 All 13 images have been intelligently mapped and imported!');
