// Supabase Edge Function: create-assignment
// Deployed to: https://<project-ref>.supabase.co/functions/v1/create-assignment

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        // Create Supabase client
        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_ANON_KEY') ?? '',
            {
                global: {
                    headers: { Authorization: req.headers.get('Authorization')! },
                },
            }
        )

        // Get user from auth
        const {
            data: { user },
        } = await supabaseClient.auth.getUser()

        if (!user) {
            throw new Error('User not authenticated')
        }

        // Verify user is a teacher
        const { data: userData } = await supabaseClient
            .from('users')
            .select('role')
            .eq('id', user.id)
            .single()

        if (userData?.role !== 'teacher') {
            throw new Error('Only teachers can create assignments')
        }

        // Get assignment data from request
        const {
            class_id,
            subject_id,
            title,
            description,
            instructions,
            due_date,
            total_points,
            attachment_urls,
            status = 'published'
        } = await req.json()

        // Create assignment
        const { data: assignment, error: assignmentError } = await supabaseClient
            .from('assignments')
            .insert({
                class_id,
                subject_id,
                teacher_id: user.id,
                title,
                description,
                instructions,
                due_date,
                total_points,
                status,
                attachment_urls
            })
            .select()
            .single()

        if (assignmentError) {
            throw assignmentError
        }

        // Get all students enrolled in the class
        const { data: enrollments } = await supabaseClient
            .from('enrollments')
            .select('student_id, students:student_id(full_name, email)')
            .eq('class_id', class_id)

        console.log(`Found ${enrollments?.length || 0} students to notify`)

        // Create notifications for all students
        if (enrollments && enrollments.length > 0) {
            const notifications = enrollments.map(enrollment => ({
                user_id: enrollment.student_id,
                type: 'assignment',
                title: 'واجب جديد',
                message: `تم إضافة واجب جديد: ${title}`,
                link: `/assignments/${assignment.id}`,
                metadata: {
                    assignment_id: assignment.id,
                    class_id,
                    due_date
                }
            }))

            const { error: notifError } = await supabaseClient
                .from('notifications')
                .insert(notifications)

            if (notifError) {
                console.error('Error creating notifications:', notifError)
            }
        }

        // Optional: Send email notifications (requires email service integration)
        // You can integrate with SendGrid, AWS SES, or Supabase's built-in email

        return new Response(
            JSON.stringify({
                success: true,
                assignment,
                notifications_sent: enrollments?.length || 0
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
