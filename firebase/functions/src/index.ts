import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();
const db = admin.firestore();
const auth = admin.auth();

// =====================================================
// ON CREATE ASSIGNMENT - Send Notifications
// =====================================================

export const onCreateAssignment = functions.firestore
    .document('assignments/{assignmentId}')
    .onCreate(async (snap, context) => {
        const assignment = snap.data();
        const assignmentId = context.params.assignmentId;

        try {
            // Get all students enrolled in the class
            const enrollmentsSnapshot = await db
                .collection('enrollments')
                .where('classId', '==', assignment.classId)
                .get();

            const notifications: any[] = [];
            const tokens: string[] = [];

            // Create notification for each student
            for (const enrollmentDoc of enrollmentsSnapshot.docs) {
                const enrollment = enrollmentDoc.data();

                notifications.push({
                    userId: enrollment.studentId,
                    type: 'assignment',
                    title: 'واجب جديد',
                    message: `تم إضافة واجب جديد: ${assignment.title}`,
                    link: `/assignments/${assignmentId}`,
                    isRead: false,
                    createdAt: admin.firestore.FieldValue.serverTimestamp(),
                    metadata: {
                        assignmentId,
                        classId: assignment.classId,
                        dueDate: assignment.dueDate
                    }
                });

                // Get user's FCM token for push notification
                const userDoc = await db.collection('users').doc(enrollment.studentId).get();
                if (userDoc.exists && userDoc.data()?.fcmToken) {
                    tokens.push(userDoc.data()!.fcmToken);
                }
            }

            // Batch write notifications
            const batch = db.batch();
            notifications.forEach(notification => {
                const notifRef = db.collection('notifications').doc();
                batch.set(notifRef, notification);
            });
            await batch.commit();

            // Send push notifications
            if (tokens.length > 0) {
                await admin.messaging().sendMulticast({
                    tokens,
                    notification: {
                        title: 'واجب جديد',
                        body: assignment.title
                    },
                    data: {
                        type: 'assignment',
                        assignmentId,
                        classId: assignment.classId
                    }
                });
            }

            // Create assignment summary for analytics
            await db.collection('assignmentSummaries').doc(assignmentId).set({
                assignmentId,
                classId: assignment.classId,
                teacherId: assignment.teacherId,
                totalStudents: enrollmentsSnapshot.size,
                notificationsSent: notifications.length,
                createdAt: admin.firestore.FieldValue.serverTimestamp()
            });

            console.log(`Created assignment ${assignmentId} and sent ${notifications.length} notifications`);

        } catch (error) {
            console.error('Error in onCreateAssignment:', error);
            throw error;
        }
    });

// =====================================================
// ON SUBMISSION - Auto-Grade (if applicable)
// =====================================================

export const onSubmission = functions.firestore
    .document('submissions/{submissionId}')
    .onCreate(async (snap, context) => {
        const submission = snap.data();
        const submissionId = context.params.submissionId;

        try {
            // Get assignment details
            const assignmentDoc = await db.collection('assignments').doc(submission.assignmentId).get();
            if (!assignmentDoc.exists) {
                throw new Error('Assignment not found');
            }

            const assignment = assignmentDoc.data()!;

            // Check if assignment has auto-gradable questions
            if (assignment.metadata?.questions && assignment.metadata.questions.length > 0) {
                const questions = assignment.metadata.questions;
                const studentAnswers = submission.answers || [];

                let totalPoints = 0;
                let earnedPoints = 0;
                const gradingDetails: any[] = [];

                // Auto-grade each question
                questions.forEach((question: any) => {
                    totalPoints += question.points;
                    const studentAnswer = studentAnswers.find((a: any) => a.questionId === question.id);

                    if (!studentAnswer) {
                        gradingDetails.push({
                            questionId: question.id,
                            correct: false,
                            pointsEarned: 0,
                            correctAnswer: question.correctAnswer,
                            studentAnswer: null
                        });
                        return;
                    }

                    let isCorrect = false;

                    // Check based on question type
                    if (question.type === 'multiple_choice' || question.type === 'true_false') {
                        isCorrect = studentAnswer.answer.toLowerCase().trim() ===
                            question.correctAnswer.toLowerCase().trim();
                    }

                    const pointsEarned = isCorrect ? question.points : 0;
                    earnedPoints += pointsEarned;

                    gradingDetails.push({
                        questionId: question.id,
                        correct: isCorrect,
                        pointsEarned,
                        correctAnswer: question.correctAnswer,
                        studentAnswer: studentAnswer.answer
                    });
                });

                const percentage = (earnedPoints / totalPoints) * 100;

                // Update submission with grade
                await snap.ref.update({
                    status: 'graded',
                    grade: earnedPoints,
                    gradedAt: admin.firestore.FieldValue.serverTimestamp(),
                    gradedBy: 'system',
                    metadata: {
                        ...submission.metadata,
                        gradingDetails,
                        autoGraded: true
                    }
                });

                // Create grade record
                await db.collection('grades').add({
                    studentId: submission.studentId,
                    classId: assignment.classId,
                    subjectId: assignment.subjectId,
                    assignmentId: submission.assignmentId,
                    gradeValue: earnedPoints,
                    maxPoints: totalPoints,
                    percentage,
                    gradedBy: 'system',
                    gradedAt: admin.firestore.FieldValue.serverTimestamp(),
                    comments: 'Auto-graded'
                });

                // Send notification to student
                await db.collection('notifications').add({
                    userId: submission.studentId,
                    type: 'grade',
                    title: 'تم تقييم الواجب',
                    message: `تم تصحيح واجبك: ${assignment.title} - الدرجة: ${earnedPoints}/${totalPoints}`,
                    link: `/submissions/${submissionId}`,
                    isRead: false,
                    createdAt: admin.firestore.FieldValue.serverTimestamp(),
                    metadata: {
                        submissionId,
                        assignmentId: submission.assignmentId,
                        grade: earnedPoints,
                        percentage: percentage.toFixed(2)
                    }
                });

                console.log(`Auto-graded submission ${submissionId}: ${earnedPoints}/${totalPoints}`);
            }

        } catch (error) {
            console.error('Error in onSubmission:', error);
            throw error;
        }
    });

// =====================================================
// SCHEDULED FUNCTION - Monthly Billing/Invoices
// =====================================================

export const generateMonthlyInvoices = functions.pubsub
    .schedule('0 0 1 * *') // Run at midnight on the 1st of every month
    .timeZone('Asia/Riyadh')
    .onRun(async (context) => {
        const now = new Date();
        const month = now.getMonth() + 1;
        const year = now.getFullYear();

        console.log(`Generating invoices for ${month}/${year}`);

        try {
            // Get all active enrollments
            const enrollmentsSnapshot = await db
                .collection('enrollments')
                .where('status', '==', 'active')
                .get();

            const batch = db.batch();
            let invoiceCount = 0;

            for (const enrollmentDoc of enrollmentsSnapshot.docs) {
                const enrollment = enrollmentDoc.data();

                // Get student details
                const studentDoc = await db.collection('users').doc(enrollment.studentId).get();
                if (!studentDoc.exists) continue;

                const student = studentDoc.data()!;

                // Get class details for fee structure
                const classDoc = await db.collection('classes').doc(enrollment.classId).get();
                if (!classDoc.exists) continue;

                const classData = classDoc.data()!;

                // Get school fee structure
                const schoolDoc = await db.collection('schools').doc(classData.schoolId).get();
                const feeStructure = schoolDoc.exists ? schoolDoc.data()?.settings?.feeStructure : null;

                // Calculate amount
                const tuitionFee = feeStructure?.tuition || 1500; // Default SAR
                let totalAmount = tuitionFee;

                // Add optional services
                const studentPrefs = student.metadata || {};
                if (studentPrefs.busService) totalAmount += (feeStructure?.bus || 300);
                if (studentPrefs.activities) totalAmount += (feeStructure?.activities || 200);
                if (studentPrefs.meals) totalAmount += (feeStructure?.meals || 250);

                // Apply discount
                const discountPercent = studentPrefs.discountPercentage || 0;
                if (discountPercent > 0) {
                    totalAmount = totalAmount * (1 - discountPercent / 100);
                }

                // Create payment record
                const paymentRef = db.collection('payments').doc();
                batch.set(paymentRef, {
                    studentId: enrollment.studentId,
                    parentId: student.parentId || null,
                    amount: totalAmount,
                    currency: 'SAR',
                    status: 'pending',
                    dueDate: new Date(year, month, 15), // Due on 15th of next month
                    description: `الرسوم الدراسية - ${month}/${year}`,
                    createdAt: admin.firestore.FieldValue.serverTimestamp(),
                    metadata: {
                        month,
                        year,
                        enrollmentId: enrollmentDoc.id,
                        classId: enrollment.classId,
                        feeBreakdown: {
                            tuition: tuitionFee,
                            bus: studentPrefs.busService ? (feeStructure?.bus || 300) : 0,
                            activities: studentPrefs.activities ? (feeStructure?.activities || 200) : 0,
                            meals: studentPrefs.meals ? (feeStructure?.meals || 250) : 0,
                            discountPercent
                        }
                    }
                });

                // Create notification for student
                const notifRef = db.collection('notifications').doc();
                batch.set(notifRef, {
                    userId: enrollment.studentId,
                    type: 'payment',
                    title: 'فاتورة جديدة',
                    message: `تم إصدار فاتورة جديدة بقيمة ${totalAmount} ريال`,
                    link: `/payments/${paymentRef.id}`,
                    isRead: false,
                    createdAt: admin.firestore.FieldValue.serverTimestamp(),
                    metadata: {
                        paymentId: paymentRef.id,
                        amount: totalAmount
                    }
                });

                invoiceCount++;
            }

            // Commit all payments and notifications
            await batch.commit();

            console.log(`Successfully generated ${invoiceCount} invoices for ${month}/${year}`);

            return { success: true, invoicesGenerated: invoiceCount, month, year };

        } catch (error) {
            console.error('Error generating invoices:', error);
            throw error;
        }
    });

// =====================================================
// CALLABLE FUNCTION - Set User Role (Admin only)
// =====================================================

export const setUserRole = functions.https.onCall(async (data, context) => {
    // Check if request is made by an admin
    if (!context.auth || context.auth.token.role !== 'admin') {
        throw new functions.https.HttpsError(
            'permission-denied',
            'Only admins can set user roles'
        );
    }

    const { userId, role } = data;

    // Validate role
    const validRoles = ['student', 'teacher', 'parent', 'admin'];
    if (!validRoles.includes(role)) {
        throw new functions.https.HttpsError(
            'invalid-argument',
            'Invalid role specified'
        );
    }

    try {
        // Set custom claim
        await auth.setCustomUserClaims(userId, { role });

        // Update Firestore user document
        await db.collection('users').doc(userId).update({ role });

        return { success: true, userId, role };

    } catch (error) {
        console.error('Error setting user role:', error);
        throw new functions.https.HttpsError('internal', 'Failed to set user role');
    }
});

// =====================================================
// ON USER CREATE - Initialize User Document
// =====================================================

export const onUserCreate = functions.auth.user().onCreate(async (user) => {
    try {
        await db.collection('users').doc(user.uid).set({
            email: user.email,
            fullName: user.displayName || '',
            role: 'student', // Default role
            phoneNumber: user.phoneNumber || '',
            avatarUrl: user.photoURL || '',
            isActive: true,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            metadata: {}
        });

        console.log(`Created user document for ${user.uid}`);
    } catch (error) {
        console.error('Error creating user document:', error);
    }
});
