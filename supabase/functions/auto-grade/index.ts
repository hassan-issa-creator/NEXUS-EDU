// Supabase Edge Function: auto-grade
// Deployed to: https://<project-ref>.supabase.co/functions/v1/auto-grade

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface Question {
    id: string;
    type: 'multiple_choice' | 'true_false' | 'fill_blank';
    question: string;
    correct_answer: string | string[];
    points: number;
}

interface StudentAnswer {
    question_id: string;
    answer: string;
}

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_ANON_KEY') ?? '',
            {
                global: {
                    headers: { Authorization: req.headers.get('Authorization')! },
                },
            }
        )

        const {
            data: { user },
        } = await supabaseClient.auth.getUser()

        if (!user) {
            throw new Error('User not authenticated')
        }

        // Get submission data
        const {
            submission_id,
            answers
        }: {
            submission_id: string;
            answers: StudentAnswer[]
        } = await req.json()

        // Get submission details
        const { data: submission, error: submissionError } = await supabaseClient
            .from('submissions')
            .select(`
        *,
        assignment:assignments(
          id,
          title,
          total_points,
          metadata
        )
      `)
            .eq('id', submission_id)
            .single()

        if (submissionError || !submission) {
            throw new Error('Submission not found')
        }

        // Verify user owns this submission
        if (submission.student_id !== user.id) {
            throw new Error('Unauthorized')
        }

        // Get questions from assignment metadata
        const questions: Question[] = submission.assignment.metadata?.questions || []

        if (questions.length === 0) {
            throw new Error('Assignment does not have auto-gradable questions')
        }

        // Calculate grade
        let totalPoints = 0
        let earnedPoints = 0
        const gradingDetails: Array<{
            question_id: string;
            correct: boolean;
            points_earned: number;
            correct_answer: string | string[];
            student_answer: string;
        }> = []

        questions.forEach(question => {
            totalPoints += question.points
            const studentAnswer = answers.find(a => a.question_id === question.id)

            if (!studentAnswer) {
                gradingDetails.push({
                    question_id: question.id,
                    correct: false,
                    points_earned: 0,
                    correct_answer: question.correct_answer,
                    student_answer: 'No answer provided'
                })
                return
            }

            let isCorrect = false

            // Check answer based on question type
            if (Array.isArray(question.correct_answer)) {
                // Multiple correct answers (e.g., select all that apply)
                isCorrect = question.correct_answer.includes(studentAnswer.answer.trim().toLowerCase())
            } else {
                // Single correct answer
                isCorrect = studentAnswer.answer.trim().toLowerCase() ===
                    question.correct_answer.toString().toLowerCase()
            }

            const pointsEarned = isCorrect ? question.points : 0
            earnedPoints += pointsEarned

            gradingDetails.push({
                question_id: question.id,
                correct: isCorrect,
                points_earned: pointsEarned,
                correct_answer: question.correct_answer,
                student_answer: studentAnswer.answer
            })
        })

        const percentageGrade = (earnedPoints / totalPoints) * 100

        // Update submission with grade
        const { error: updateError } = await supabaseClient
            .from('submissions')
            .update({
                status: 'graded',
                grade: earnedPoints,
                graded_at: new Date().toISOString(),
                graded_by: user.id, // Auto-graded, so graded_by is the student
                metadata: {
                    ...submission.metadata,
                    grading_details: gradingDetails,
                    auto_graded: true
                }
            })
            .eq('id', submission_id)

        if (updateError) {
            throw updateError
        }

        // Create notification for student
        await supabaseClient
            .from('notifications')
            .insert({
                user_id: user.id,
                type: 'grade',
                title: 'تم تقييم الواجب',
                message: `تم تصحيح واجبك: ${submission.assignment.title}`,
                link: `/submissions/${submission_id}`,
                metadata: {
                    submission_id,
                    grade: earnedPoints,
                    total_points: totalPoints,
                    percentage: percentageGrade.toFixed(2)
                }
            })

        return new Response(
            JSON.stringify({
                success: true,
                submission_id,
                grade: earnedPoints,
                total_points: totalPoints,
                percentage: percentageGrade.toFixed(2),
                grading_details: gradingDetails
            }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200,
            }
        )

    } catch (error) {
        return new Response(
            JSON.stringify({ error: error.message }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 400,
            }
        )
    }
})
