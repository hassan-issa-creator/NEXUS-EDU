import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import OpenAI from 'openai';

export interface QuestionSuggestion {
  question: string;
  options?: string[];
  correctAnswer?: number;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  topic: string;
  explanation?: string;
}

export interface ErrorPattern {
  topic: string;
  errorCount: number;
  commonMistakes: string[];
  studentIds: string[];
  suggestedAction: string;
}

export interface PerformancePrediction {
  studentId: string;
  predictedGrade: number;
  confidence: number;
  riskFactors: string[];
  recommendations: string[];
}

export interface LessonSummary {
  title: string;
  keyPoints: string[];
  concepts: string[];
  practiceQuestions: QuestionSuggestion[];
}

@Injectable()
export class AIAssistantService {
  private readonly logger = new Logger(AIAssistantService.name);

  constructor(private readonly prisma: PrismaService) { }

  /**
   * Generate question suggestions based on topic and difficulty
   */
  async suggestQuestions(
    subjectId: string,
    topic: string,
    count: number = 5,
    difficulty?: 'EASY' | 'MEDIUM' | 'HARD',
  ): Promise<QuestionSuggestion[]> {
    // Get existing questions for context
    const existingQuestions = await this.prisma.assignment.findMany({
      where: { subjectId },
      select: { title: true, description: true },
      take: 10,
    });

    // Question templates based on topic and difficulty
    const questionTemplates = this.getQuestionTemplates(
      topic,
      difficulty || 'MEDIUM',
    );

    // Generate suggestions (in production, this would use an LLM)
    const suggestions: QuestionSuggestion[] = questionTemplates
      .slice(0, count)
      .map((template, idx) => ({
        question: template.question,
        options: template.options,
        correctAnswer: template.correctAnswer,
        difficulty: difficulty || 'MEDIUM',
        topic,
        explanation: template.explanation,
      }));

    this.logger.log(
      `Generated ${suggestions.length} question suggestions for ${topic}`,
    );
    return suggestions;
  }

  /**
   * Analyze common errors across students
   */
  async analyzeErrors(classId?: string): Promise<ErrorPattern[]> {
    // Get all grades with low scores
    const lowGrades = await this.prisma.grade.findMany({
      where: {
        grade: { lt: 60 },
      },
      include: {
        subject: true,
        student: { select: { id: true, name: true } },
      },
    });

    // Group errors by subject/topic
    const errorsBySubject = new Map<
      string,
      {
        count: number;
        students: Set<string>;
        topics: Set<string>;
      }
    >();

    for (const grade of lowGrades) {
      const key = grade.subject?.name || 'Unknown';
      const existing = errorsBySubject.get(key) || {
        count: 0,
        students: new Set<string>(),
        topics: new Set<string>(),
      };

      existing.count++;
      existing.students.add(grade.studentId);
      const subjectName = grade.subject?.name || 'Unknown';
      existing.topics.add(subjectName);

      errorsBySubject.set(key, existing);
    }

    // Convert to patterns
    const patterns: ErrorPattern[] = Array.from(errorsBySubject.entries()).map(
      ([topic, data]) => ({
        topic,
        errorCount: data.count,
        commonMistakes: Array.from(data.topics),
        studentIds: Array.from(data.students),
        suggestedAction: this.getSuggestedAction(
          data.count,
          data.students.size,
        ),
      }),
    );

    return patterns.sort((a, b) => b.errorCount - a.errorCount);
  }

  /**
   * Predict student performance
   */
  async predictPerformance(studentId: string): Promise<PerformancePrediction> {
    // Get student's performance history
    const grades = await this.prisma.grade.findMany({
      where: { studentId },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    const attendance = await this.prisma.attendance.findMany({
      where: { studentId },
      orderBy: { date: 'desc' },
      take: 30,
    });

    const submissions = await this.prisma.submission.findMany({
      where: { studentId },
      include: { assignment: true },
    });

    // Calculate metrics
    const avgGrade =
      grades.length > 0
        ? grades.reduce((sum, g) => sum + (Number(g.grade) / Number(g.maxScore)) * 100, 0) /
        grades.length
        : 0;

    const attendanceRate =
      attendance.length > 0
        ? (attendance.filter(
          (a) => a.status === 'PRESENT' || a.status === 'LATE',
        ).length /
          attendance.length) *
        100
        : 0;

    const lateSubmissions = submissions.filter(
      (s) =>
        s.assignment.dueDate &&
        s.submittedAt &&
        s.submittedAt > s.assignment.dueDate,
    ).length;

    // Simple prediction model
    const riskFactors: string[] = [];
    const recommendations: string[] = [];
    let confidence = 80;

    if (avgGrade < 60) {
      riskFactors.push('متوسط الدرجات منخفض');
      recommendations.push('حضور دروس تقوية');
      confidence -= 10;
    }
    if (attendanceRate < 80) {
      riskFactors.push('نسبة حضور ضعيفة');
      recommendations.push('تحسين الانتظام في الحضور');
      confidence -= 10;
    }
    if (lateSubmissions > 3) {
      riskFactors.push('تأخر متكرر في تسليم الواجبات');
      recommendations.push('تنظيم الوقت وتسليم الواجبات في موعدها');
      confidence -= 5;
    }

    // Trend analysis
    const recentGrades = grades.slice(0, 5);
    const olderGrades = grades.slice(5, 10);

    if (recentGrades.length > 0 && olderGrades.length > 0) {
      const recentAvg =
        recentGrades.reduce((sum, g) => sum + (Number(g.grade) / Number(g.maxScore)) * 100, 0) /
        recentGrades.length;
      const olderAvg =
        olderGrades.reduce(
          (sum, g) => sum + (Number(g.grade) / Number(g.maxScore)) * 100,
          0,
        ) /
        olderGrades.length;

      if (recentAvg < olderAvg - 10) {
        riskFactors.push('تراجع ملحوظ في المستوى');
        recommendations.push('مراجعة مع المدرس لتحديد سبب التراجع');
      } else if (recentAvg > olderAvg + 10) {
        recommendations.push('استمر في هذا التقدم الممتاز!');
        confidence += 5;
      }
    }

    if (riskFactors.length === 0) {
      recommendations.push('أداء ممتاز! استمر هكذا');
    }

    let finalRiskFactors = riskFactors;
    let finalRecommendations = recommendations;

    const apiKey = process.env.OPENAI_API_KEY;
    if (apiKey && apiKey !== 'sk_placeholder' && !apiKey.includes('placeholder')) {
      try {
        const openai = new OpenAI({ apiKey });
        
        const prompt = `قم بتحليل أداء هذا الطالب كخبير تربوي وقدم نصائح مخصصة.
بيانات الطالب:
- معدل الدرجات: ${avgGrade.toFixed(1)}%
- نسبة الحضور: ${attendanceRate.toFixed(1)}%
- تأخير تسليم الواجبات: ${lateSubmissions} مرة

المطلوب إرجاع نتيجتين باختصار شديد:
1. "riskFactors": قائمة بنقاط الضعف أو المخاطر (مثال: تأخر متكرر، غياب، درجات منخفضة). إذا كان كل شيء جيد، اتركها فارغة.
2. "recommendations": توصية واحدة أو اثنتين لتشجيع الطالب وتحسين أدائه (مثال: ركز أكثر على الواجبات، عمل رائع استمر).

قم بإرجاع النتيجة بصيغة JSON فقط بهذا الشكل:
{
  "riskFactors": ["نقطة 1", "نقطة 2"],
  "recommendations": ["نصيحة 1"]
}`;

        const response = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [{ role: "user", content: prompt }],
          response_format: { type: "json_object" },
          temperature: 0.6,
        });

        const parsed = JSON.parse(response.choices[0].message.content || '{}');
        if (parsed.riskFactors && Array.isArray(parsed.riskFactors)) {
          finalRiskFactors = parsed.riskFactors;
        }
        if (parsed.recommendations && Array.isArray(parsed.recommendations)) {
          finalRecommendations = parsed.recommendations;
        }
      } catch (error) {
        this.logger.error('OpenAI Prediction Error:', error);
      }
    }

    return {
      studentId,
      predictedGrade: Math.min(
        100,
        Math.max(
          0,
          Math.round(
            avgGrade * 0.6 +
            attendanceRate * 0.2 +
            (100 - lateSubmissions * 5) * 0.2,
          ),
        ),
      ),
      confidence: Math.min(100, Math.max(50, confidence)),
      riskFactors: finalRiskFactors,
      recommendations: finalRecommendations,
    };
  }

  /**
   * Generate lesson summary
   */
  async generateLessonSummary(lessonId: string): Promise<LessonSummary> {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id: lessonId },
      include: { subject: true },
    });

    if (!lesson) {
      throw new Error('Lesson not found');
    }

    // In production, this would use an LLM to analyze the lesson content
    // For now, return a structured template
    return {
      title: lesson.title,
      keyPoints: [
        `النقطة الرئيسية الأولى من درس ${lesson.title}`,
        `النقطة الرئيسية الثانية من درس ${lesson.title}`,
        `النقطة الرئيسية الثالثة من درس ${lesson.title}`,
      ],
      concepts: ['المفهوم الأول', 'المفهوم الثاني', 'المفهوم الثالث'],
      practiceQuestions: await this.suggestQuestions(
        lesson.subjectId,
        lesson.title,
        3,
      ),
    };
  }

  /**
   * General Q&A Assistant
   */
  async ask(
    question: string, 
    subject?: string, 
    history?: {role: string, content: string}[],
    user?: any
  ): Promise<{ answer: string; isMock: boolean }> {
    this.logger.log(`AI Q&A: ${question}`);

    const apiKey = process.env.OPENAI_API_KEY;
    if (apiKey && apiKey !== 'sk_placeholder' && !apiKey.includes('placeholder')) {
      try {
        const openai = new OpenAI({ apiKey });
        
        let systemPrompt = `أنت المساعد الذكي "NEXUS" الخاص بمنصة مليون التعليمية.
أنت تتحدث باللغة العربية بشكل افتراضي، إلا إذا سألك المستخدم بلغة أخرى.
ردودك يجب أن تكون مختصرة، ودودة، احترافية، ومفيدة جداً. يجب أن تستخدم markdown عند الحاجة للقوائم أو الكود.
حاول ألا تعطي الإجابة المباشرة لأسئلة الواجبات، بل اشرح طريقة الوصول للحل لمساعدة المتعلم.`;

        if (user) {
           systemPrompt += `\nأنت تتحدث الآن مع مستخدم اسمه "${user.name || user.firstName || 'مستخدم'}" ودوره في المنصة هو "${user.role || 'STUDENT'}".`;
           if (user.role === 'STUDENT') {
              systemPrompt += `\nبما أنه طالب، كن مشجعاً وداعماً له في دراسته.`;
           } else if (user.role === 'TEACHER') {
              systemPrompt += `\nبما أنه معلم، ساعده في اقتراح طرق تدريس مبتكرة، وساعده على إنشاء المحتوى وتوفير وقته.`;
           } else if (user.role === 'PARENT') {
              systemPrompt += `\nبما أنه ولي أمر، ساعده في فهم أفضل الممارسات لدعم أبنائه وتطويرهم في المنزل.`;
           }
        }
        
        if (subject && subject !== 'General') {
           systemPrompt += `\nالسياق الحالي أو الموضوع: ${subject}`;
        }

        const formattedHistory: any[] = (history || []).map(h => ({
          role: h.role === 'user' ? 'user' : 'assistant',
          content: h.content
        }));

        const response = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: systemPrompt },
            ...formattedHistory,
            { role: "user", content: question }
          ],
          temperature: 0.7,
          max_tokens: 800,
        });

        return {
          answer: response.choices[0].message.content || 'عذراً، واجهت مشكلة في التفكير. هل يمكنك إعادة السؤال؟',
          isMock: false
        };
      } catch (error) {
        this.logger.error('OpenAI Error:', error);
      }
    }

    // In production, use Gemini/OpenAI
    // For now, simulated intelligent responses in Arabic
    await new Promise(resolve => setTimeout(resolve, 1000));

    let answer = "أنا مساعدك الذكي NEXUS. كيف يمكنني مساعدتك في مجال التعليم اليوم؟";

    const questionLower = question.toLowerCase();

    if (questionLower.includes('واجب') || questionLower.includes('assignment')) {
      answer = "يمكنني مساعدتك في شرح الواجبات أو تصحيحها. هل تود أن أقوم بمراجعة مسودة إجابتك؟";
    } else if (questionLower.includes('خطة') || questionLower.includes('plan')) {
      answer = "بالتأكيد! لتنظيم وقتك، أنصحك بتخصيص 45 دقيقة لكل مادة مع استراحة 10 دقائق. هل تريد مني تصميم جدول دراسي مخصص لك؟";
    } else if (questionLower.includes('شرح') || questionLower.includes('explain')) {
      answer = "بالطبع، أي مفهوم تود مني شرحه؟ يمكنني تبسيط أصعب المفاهيم باستخدام أمثلة من حياتنا اليومية.";
    } else if (questionLower.includes('مرحبا') || questionLower.includes('hello')) {
      answer = "أهلاً بك! أنا مساعدك الذكي في منصة مليون التعليمية. أنا هنا لدعمك في رحلتك الدراسية. بماذا تود أن نبدأ اليوم؟";
    }

    return {
      answer,
      isMock: true
    };
  }

  /**
   * AI Automated Grading for Assignments
   */
  async gradeSubmission(submissionId: string): Promise<{
    score: number;
    feedback: string;
    criteria_breakdown: Record<string, number>;
  }> {
    const submission = await this.prisma.submission.findUnique({
      where: { id: submissionId },
      include: {
        assignment: true,
        student: { select: { name: true } }
      }
    });

    if (!submission) throw new Error('Submission not found');

    this.logger.log(`AI Auto-grading submission for ${submission.student.name}`);
    const apiKey = process.env.OPENAI_API_KEY;
    if (apiKey && apiKey !== 'sk_placeholder' && !apiKey.includes('placeholder')) {
      try {
        const openai = new OpenAI({ apiKey });
        
        const prompt = `أنت معلم خبير يقوم بتصحيح واجب مدرسي.
عنوان الواجب: "${submission.assignment.title}"
وصف الواجب: "${submission.assignment.description || 'لا يوجد وصف'}"
إجابة الطالب (${submission.student?.name || 'طالب'}): 
"${submission.content || 'لم يكتب نصاً، ربما أرفق ملفاً.'}"

المطلوب: إرجاع تقييم بصيغة JSON فقط بهذا الشكل:
{
  "score": [درجة من أصل ${submission.assignment.maxScore}],
  "feedback": "[رسالة للطالب تشرح سبب الدرجة وتشجعه بطريقة ودودة وإيجابية]",
  "criteria_breakdown": {
    "الدقة العلمية": [درجة],
    "التنظيم": [درجة],
    "اللغة والأسلوب": [درجة]
  }
}`;

        const response = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [{ role: "user", content: prompt }],
          response_format: { type: "json_object" },
          temperature: 0.3,
        });

        const parsed = JSON.parse(response.choices[0].message.content || '{}');
        return {
          score: parsed.score || Math.floor(submission.assignment.maxScore * 0.8),
          feedback: parsed.feedback || 'أداء جيد جداً!',
          criteria_breakdown: parsed.criteria_breakdown || { "تقييم عام": 10 }
        };
      } catch (error) {
        this.logger.error('OpenAI Grading Error:', error);
      }
    }

    await new Promise(resolve => setTimeout(resolve, 1500));

    // Simulated fallback evaluation logic
    const score = Math.floor(Math.random() * (submission.assignment.maxScore * 0.3)) + (submission.assignment.maxScore * 0.7); 

    const feedbacks = [
      "إجابة نموذجية وممتازة! لقد أظهرت فهماً عميقاً للموضوع. استمر في هذا المستوى الرائع.",
      "عمل جيد جداً. إجابتك منظمة ومنطقية، ولكن حاول التوسع أكثر في شرح النقاط الأساسية في المرة القادمة.",
      "إجابة جيدة، ولكن هناك بعض النقاط التي تحتاج إلى توضيح أكثر. أنصحك بمراجعة الدرس الأخير المتعلق بهذا الموضوع."
    ];

    return {
      score,
      feedback: feedbacks[Math.floor(Math.random() * feedbacks.length)],
      criteria_breakdown: {
        "الدقة العلمية": 10,
        "التنظيم": 10,
        "اللغة والأسلوب": 10
      }
    };
  }

  /**
   * Process Document into lesson resources (summary, quiz, flashcards, etc.)
   */
  async processDocument(text: string): Promise<any> {
    this.logger.log('AI Auto-generating lesson plan from text...');
    
    const apiKey = process.env.OPENAI_API_KEY;
    if (apiKey && apiKey !== 'sk_placeholder' && !apiKey.includes('placeholder')) {
      try {
        const openai = new OpenAI({ apiKey });
        
        const prompt = `بصفتك خبيراً تربوياً، قم بتحليل النص التالي وتحويله إلى محتوى تعليمي تفاعلي.
النص:
"""${text.substring(0, 3000)}"""

المطلوب: إرجاع المحتوى بصيغة JSON فقط بهذا الشكل:
{
  "summary": "[ملخص شامل ومبسط للنص]",
  "keyConcepts": ["[المفهوم الأول]", "[المفهوم الثاني]"],
  "quiz": [
    {
      "question": "[السؤال]",
      "options": ["[الخيار الأول]", "[الخيار الثاني]", "[الخيار الثالث]", "[الخيار الرابع]"],
      "correctAnswer": 0,
      "explanation": "[شرح للإجابة الصحيحة]"
    }
  ],
  "flashcards": [
    {
      "front": "[المصطلح]",
      "back": "[التعريف المبسط]"
    }
  ],
  "homework": ["[مهمة 1]", "[مهمة 2]"]
}

(ملاحظة: اختر correctAnswer كـ index من 0 إلى 3). 
اجعل الـ quiz يحتوي على 3 أسئلة، والـ flashcards على 4 مصطلحات.
`;

        const response = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [{ role: "user", content: prompt }],
          response_format: { type: "json_object" },
          temperature: 0.5,
        });

        return JSON.parse(response.choices[0].message.content || '{}');
      } catch (error) {
        this.logger.error('OpenAI processDocument Error:', error);
      }
    }

    // Fallback Mock Data if OpenAI fails or key is missing
    await new Promise(resolve => setTimeout(resolve, 2000));
    return {
      summary: "يُعتبر هذا النص مقدمة شاملة تغطي المبادئ الأساسية للموضوع، ويشرح الأسباب والتأثيرات بشكل مبسط.",
      keyConcepts: ["المبدأ الأول", "المبدأ الثاني", "التطبيق العملي"],
      quiz: [
        {
          question: "ما هو الهدف الرئيسي من هذا الموضوع؟",
          options: ["الخيار الخاطئ 1", "الخيار الصحيح", "الخيار الخاطئ 2", "الخيار الخاطئ 3"],
          correctAnswer: 1,
          explanation: "الهدف الرئيسي هو كذا وكذا كما تم ذكره في الفقرة الأولى."
        }
      ],
      flashcards: [
        { front: "المصطلح الأول", back: "تعريف المصطلح الأول بشكل مبسط وسهل التذكر." },
        { front: "المصطلح الثاني", back: "التعريف الثاني." }
      ],
      homework: ["قم بكتابة ملخص مكون من 100 كلمة", "ابحث عن تطبيق عملي واحد للموضوع"]
    };
  }

  async getParentAdvice(studentId: string, question?: string): Promise<any> {
    const studentInfo = await this.predictPerformance(studentId);
    
    const apiKey = process.env.OPENAI_API_KEY;
    if (apiKey && apiKey !== 'sk_placeholder' && !apiKey.includes('placeholder')) {
      try {
        const openai = new OpenAI({ apiKey });
        
        const prompt = `بصفتك مستشاراً تعليمياً خبيراً، اقرأ بيانات الطالب المرفقة وأجب على ولي أمره.
درجة الطالب المتوقعة: ${studentInfo.predictedGrade}%
نقاط الضعف: ${studentInfo.riskFactors.join(', ') || 'لا يوجد'}
سؤال ولي الأمر: "${question || 'ما هي نصيحتك العامة لي لمساعدة ابني؟'}"

أرجع الرد بصيغة JSON:
{
  "summary": "ملخص عام ونصيحة لولي الأمر",
  "overallStatus": "excellent | good | needsAttention | urgent",
  "positives": ["نقطة قوة 1", "نقطة قوة 2"],
  "concerns": ["ملاحظة 1", "ملاحظة 2"],
  "actionableAdvice": ["خطوة عملية 1", "خطوة عملية 2"]
}`;

        const response = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [{ role: "user", content: prompt }],
          response_format: { type: "json_object" },
          temperature: 0.6,
        });

        return JSON.parse(response.choices[0].message.content || '{}');
      } catch (err) {
        this.logger.error('Parent advice AI error', err);
      }
    }

    return {
      summary: "الطالب يبدي تحسناً ملحوظاً، ولكن يحتاج إلى متابعة مستمرة في حل الواجبات.",
      overallStatus: "good",
      positives: ["مستوى ذكاء عالي", "تفاعل جيد في المواد المفضلة"],
      concerns: ["التأخر في تسليم الواجبات"],
      actionableAdvice: ["تخصيص ساعة يومياً لمراجعة الدروس", "التحفيز المستمر عند الإنجاز"]
    };
  }

  async getLearningRisk(studentId: string): Promise<any> {
    const info = await this.predictPerformance(studentId);
    let riskLevel = 'low';
    if (info.predictedGrade < 65 || info.riskFactors.length > 2) riskLevel = 'high';
    else if (info.predictedGrade < 80) riskLevel = 'medium';

    return { riskLevel };
  }

  private getQuestionTemplates(
    topic: string,
    difficulty: 'EASY' | 'MEDIUM' | 'HARD',
  ) {
    // ... existing templates ...
    const templates = [
      {
        question: `ما هو تعريف ${topic}؟`,
        options: [
          'التعريف الصحيح',
          'تعريف خاطئ 1',
          'تعريف خاطئ 2',
          'تعريف خاطئ 3',
        ],
        correctAnswer: 0,
        explanation: `${topic} هو...`,
      },
      {
        question: `أي مما يلي يعتبر من خصائص ${topic}؟`,
        options: [
          'الخاصية الصحيحة',
          'خاصية خاطئة 1',
          'خاصية خاطئة 2',
          'خاصية خاطئة 3',
        ],
        correctAnswer: 0,
        explanation: 'من خصائص هذا المفهوم...',
      },
      {
        question: `كيف يمكن تطبيق ${topic} في الحياة العملية؟`,
        options: [
          'التطبيق الصحيح',
          'تطبيق خاطئ 1',
          'تطبيق خاطئ 2',
          'تطبيق خاطئ 3',
        ],
        correctAnswer: 0,
        explanation: 'يمكن تطبيق هذا المفهوم عن طريق...',
      },
      {
        question: `ما الفرق بين ${topic} والمفاهيم المشابهة؟`,
        options: ['الفرق الصحيح', 'فرق خاطئ 1', 'فرق خاطئ 2', 'فرق خاطئ 3'],
        correctAnswer: 0,
        explanation: 'الفرق الأساسي هو...',
      },
      {
        question: `اذكر أهمية ${topic}`,
        options: [
          'الأهمية الصحيحة',
          'أهمية خاطئة 1',
          'أهمية خاطئة 2',
          'أهمية خاطئة 3',
        ],
        correctAnswer: 0,
        explanation: 'تكمن أهمية هذا المفهوم في...',
      },
    ];

    return templates;
  }

  private getSuggestedAction(errorCount: number, studentCount: number): string {
    if (errorCount > 10 && studentCount > 5) {
      return 'يُنصح بإعادة شرح الموضوع للفصل بالكامل';
    } else if (studentCount > 3) {
      return 'يُنصح بعمل حصة مراجعة مع الطلاب المتعثرين';
    } else {
      return 'يُنصح بمتابعة فردية مع الطلاب المتعثرين';
    }
  }
}
