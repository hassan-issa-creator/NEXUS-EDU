export interface EmailTemplateData {
  studentName?: string;
  parentName?: string;
  className?: string;
  subjectName?: string;
  date?: string;
  grade?: number;
  assignmentTitle?: string;
  examTitle?: string;
  dueDate?: string;
  message?: string;
  attendanceStats?: { present: number; absent: number; late: number };
  recentGrades?: {
    subject: string;
    score: number;
    max: number;
    name: string;
  }[];
  assignmentsPending?: number;
  aiSummary?: string;
}

export class EmailTemplates {
  private static readonly baseStyle = `
    <style>
      body { 
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        direction: rtl;
        text-align: right;
        background-color: #f5f5f5;
        margin: 0;
        padding: 0;
      }
      .container {
        max-width: 600px;
        margin: 20px auto;
        background-color: white;
        border-radius: 12px;
        overflow: hidden;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      }
      .header {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 30px;
        text-align: center;
      }
      .header h1 {
        margin: 0;
        font-size: 28px;
      }
      .content {
        padding: 30px;
        color: #333;
        line-height: 1.8;
      }
      .info-box {
        background-color: #f8f9fa;
        border-right: 4px solid #667eea;
        padding: 15px;
        margin: 20px 0;
        border-radius: 4px;
      }
      .button {
        display: inline-block;
        background-color: #667eea;
        color: white !important;
        padding: 12px 30px;
        text-decoration: none;
        border-radius: 6px;
        margin: 20px 0;
      }
      .footer {
        background-color: #f8f9fa;
        padding: 20px;
        text-align: center;
        color: #666;
        font-size: 14px;
      }
      .grade-badge {
        display: inline-block;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 10px 20px;
        border-radius: 20px;
        font-size: 24px;
        font-weight: bold;
        margin: 10px 0;
      }
    </style>
  `;

  static absenceNotification(data: EmailTemplateData): string {
    return `
      <!DOCTYPE html>
      <html lang="ar">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        ${this.baseStyle}
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📢 إشعار غياب</h1>
          </div>
          <div class="content">
            <p>عزيزي/عزيزتي <strong>${data.parentName}</strong>،</p>
            
            <p>نود إبلاغكم بأن ابنكم/ابنتكم <strong>${data.studentName}</strong> 
            في الصف <strong>${data.className}</strong> كان غائباً بتاريخ <strong>${data.date}</strong>.</p>
            
            <div class="info-box">
              <p><strong>معلومات الغياب:</strong></p>
              <p>📅 التاريخ: ${data.date}</p>
              <p>🏫 الصف: ${data.className}</p>
              <p>👨‍🎓 الطالب: ${data.studentName}</p>
            </div>
            
            <p>يرجى التواصل مع إدارة المدرسة في حال كان هناك أي استفسار.</p>
            
            <p>مع تحياتنا،<br>
            <strong>منصة المليون التعليمية</strong></p>
          </div>
          <div class="footer">
            <p>هذه رسالة آلية، يرجى عدم الرد عليها</p>
            <p>© 2026 منصة المليون - جميع الحقوق محفوظة</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  static examReminder(data: EmailTemplateData): string {
    return `
      <!DOCTYPE html>
      <html lang="ar">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        ${this.baseStyle}
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📝 تذكير بامتحان قادم</h1>
          </div>
          <div class="content">
            <p>عزيزي/عزيزتي <strong>${data.studentName}</strong>،</p>
            
            <p>نذكرك بأن لديك امتحان قادم!</p>
            
            <div class="info-box">
              <p><strong>تفاصيل الامتحان:</strong></p>
              <p>📚 المادة: ${data.subjectName}</p>
              <p>📖 الامتحان: ${data.examTitle}</p>
              <p>📅 التاريخ: ${data.date}</p>
            </div>
            
            <p>نتمنى لك التوفيق والنجاح! 🌟</p>
            
            <a href="#" class="button">مراجعة المادة</a>
            
            <p>مع تحياتنا،<br>
            <strong>منصة المليون التعليمية</strong></p>
          </div>
          <div class="footer">
            <p>هذه رسالة آلية، يرجى عدم الرد عليها</p>
            <p>© 2026 منصة المليون - جميع الحقوق محفوظة</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  static lateAssignment(data: EmailTemplateData): string {
    return `
      <!DOCTYPE html>
      <html lang="ar">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        ${this.baseStyle}
      </head>
      <body>
        <div class="container">
          <div class="header" style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);">
            <h1>⏰ واجب متأخر</h1>
          </div>
          <div class="content">
            <p>عزيزي/عزيزتي <strong>${data.studentName}</strong>،</p>
            
            <p>لديك واجب لم يتم تسليمه بعد!</p>
            
            <div class="info-box" style="border-right-color: #f5576c;">
              <p><strong>تفاصيل الواجب:</strong></p>
              <p>📚 المادة: ${data.subjectName}</p>
              <p>📝 الواجب: ${data.assignmentTitle}</p>
              <p>📅 آخر موعد للتسليم: ${data.dueDate}</p>
            </div>
            
            <p><strong>يرجى تسليم الواجب في أقرب وقت ممكن.</strong></p>
            
            <a href="#" class="button" style="background-color: #f5576c;">تسليم الواجب الآن</a>
            
            <p>مع تحياتنا،<br>
            <strong>منصة المليون التعليمية</strong></p>
          </div>
          <div class="footer">
            <p>هذه رسالة آلية، يرجى عدم الرد عليها</p>
            <p>© 2026 منصة المليون - جميع الحقوق محفوظة</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  static gradeNotification(data: EmailTemplateData): string {
    const gradeColor =
      (data.grade || 0) >= 70
        ? '#10b981'
        : (data.grade || 0) >= 50
          ? '#f59e0b'
          : '#ef4444';

    return `
      <!DOCTYPE html>
      <html lang="ar">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        ${this.baseStyle}
      </head>
      <body>
        <div class="container">
          <div class="header" style="background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);">
            <h1>✨ درجة جديدة</h1>
          </div>
          <div class="content">
            <p>عزيزي/عزيزتي <strong>${data.studentName}</strong>،</p>
            
            <p>تم رصد درجة جديدة لك!</p>
            
            <div class="info-box" style="border-right-color: ${gradeColor};">
              <p><strong>تفاصيل الدرجة:</strong></p>
              <p>📚 المادة: ${data.subjectName}</p>
              <p>📝 التقييم: ${data.assignmentTitle || data.examTitle}</p>
              <p>📅 التاريخ: ${data.date}</p>
              <div style="text-align: center; margin: 20px 0;">
                <span class="grade-badge" style="background: ${gradeColor};">
                  ${data.grade}/100
                </span>
              </div>
            </div>
            
            ${data.message ? `<p><strong>تعليق المدرس:</strong> ${data.message}</p>` : ''}
            
            <a href="#" class="button" style="background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);">
              عرض التفاصيل
            </a>
            
            <p>مع تحياتنا،<br>
            <strong>منصة المليون التعليمية</strong></p>
          </div>
          <div class="footer">
            <p>هذه رسالة آلية، يرجى عدم الرد عليها</p>
            <p>© 2026 منصة المليون - جميع الحقوق محفوظة</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  static weeklyReport(data: EmailTemplateData & { reportData?: any }): string {
    return `
      <!DOCTYPE html>
      <html lang="ar">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        ${this.baseStyle}
      </head>
      <body>
        <div class="container">
          <div class="header" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
            <h1>📊 التقرير الأسبوعي</h1>
          </div>
          <div class="content">
            <p>عزيزي/عزيزتي <strong>${data.parentName}</strong>،</p>
            
            <p>إليك ملخص أداء ابنك/ابنتك <strong>${data.studentName}</strong> لهذا الأسبوع:</p>
            
            <div class="info-box">
              <p><strong>📈 ملخص الأداء:</strong></p>
              <p>✅ الحضور: ${data.attendanceStats?.present || 0} حاضر - ${data.attendanceStats?.absent || 0} غائب</p>
              <p>📝 امتحانات/واجبات حديثة: ${data.recentGrades?.length || 0}</p>
              <p>⏳ واجبات معلقة: ${data.assignmentsPending || 0}</p>
            </div>

            ${
              data.recentGrades && data.recentGrades.length > 0
                ? `
            <div class="info-box">
              <p><strong>آخر الدرجات:</strong></p>
              <ul>
                ${data.recentGrades.map((g) => `<li>${g.subject}: ${g.score}/${g.max} (${g.name})</li>`).join('')}
              </ul>
            </div>
            `
                : ''
            }
            
            <div class="info-box">
              <p><strong>🤖 تحليل الذكاء الاصطناعي لمستوى الطالب:</strong></p>
              <p style="white-space: pre-wrap; font-size: 15px;">${data.aiSummary || 'جاري تجميع البيانات وتحليلها...'}</p>
            </div>
            
            <a href="#" class="button">عرض التقرير الكامل</a>
            
            <p>مع تحياتنا،<br>
            <strong>منصة المليون التعليمية</strong></p>
          </div>
          <div class="footer">
            <p>هذه رسالة آلية، يرجى عدم الرد عليها</p>
            <p>© 2026 منصة المليون - جميع الحقوق محفوظة</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }
}
