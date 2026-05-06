// Supabase Edge Function: generate-invoices
// Deployed to: https://<project-ref>.supabase.co/functions/v1/generate-invoices
// Scheduled to run monthly using Supabase Cron

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface FeeStructure {
    tuition: number;
    bus?: number;
    activities?: number;
    meals?: number;
}

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        // Use service role key for admin operations
        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        )

        const { month, year } = await req.json().catch(() => {
            const now = new Date()
            return {
                month: now.getMonth() + 1,
                year: now.getFullYear()
            }
        })

        console.log(`Generating invoices for ${month}/${year}`)

        // Get all active enrollments
        const { data: enrollments, error: enrollmentsError } = await supabaseClient
            .from('enrollments')
            .select(`
        id,
        student_id,
        class_id,
        students:users!enrollments_student_id_fkey(
          id,
          full_name,
          email,
          metadata
        ),
        classes:classes(
          id,
          name,
          school_id,
          schools:schools(
            name,
            settings
          )
        )
      `)
            .eq('status', 'active')

        if (enrollmentsError) {
            throw enrollmentsError
        }

        console.log(`Found ${enrollments?.length || 0} active enrollments`)

        const invoices = []
        const errors = []

        for (const enrollment of enrollments || []) {
            try {
                // Get fee structure from school settings or use defaults
                const feeStructure: FeeStructure =
                    enrollment.classes.schools.settings?.fee_structure || {
                        tuition: 1500, // Default SAR
                        bus: 300,
                        activities: 200,
                        meals: 250
                    }

                // Get student preferences from metadata
                const studentPrefs = enrollment.students.metadata || {}

                // Calculate total amount
                let totalAmount = feeStructure.tuition

                if (studentPrefs.bus_service) {
                    totalAmount += feeStructure.bus || 0
                }
                if (studentPrefs.activities) {
                    totalAmount += feeStructure.activities || 0
                }
                if (studentPrefs.meals) {
                    totalAmount += feeStructure.meals || 0
                }

                // Apply any discounts
                const discount = studentPrefs.discount_percentage || 0
                if (discount > 0) {
                    totalAmount = totalAmount * (1 - discount / 100)
                }

                // Set due date (15th of next month)
                const dueDate = new Date(year, month, 15)

                const description = `الرسوم الدراسية - ${enrollment.classes.name} - ${month}/${year}`

                // Create payment record
                const { data: payment, error: paymentError } = await supabaseClient
                    .from('payments')
                    .insert({
                        student_id: enrollment.student_id,
                        amount: totalAmount,
                        currency: 'SAR',
                        status: 'pending',
                        due_date: dueDate.toISOString().split('T')[0],
                        description,
                        metadata: {
                            month,
                            year,
                            enrollment_id: enrollment.id,
                            class_id: enrollment.class_id,
                            fee_breakdown: {
                                tuition: feeStructure.tuition,
                                bus: studentPrefs.bus_service ? feeStructure.bus : 0,
                                activities: studentPrefs.activities ? feeStructure.activities : 0,
                                meals: studentPrefs.meals ? feeStructure.meals : 0,
                                discount_percentage: discount
                            }
                        }
                    })
                    .select()
                    .single()

                if (paymentError) {
                    errors.push({
                        student_id: enrollment.student_id,
                        error: paymentError.message
                    })
                    continue
                }

                invoices.push(payment)

                // Create notification for student/parent
                await supabaseClient
                    .from('notifications')
                    .insert({
                        user_id: enrollment.student_id,
                        type: 'payment',
                        title: 'فاتورة جديدة',
                        message: `تم إصدار فاتورة جديدة بقيمة ${totalAmount} ريال سعودي`,
                        link: `/payments/${payment.id}`,
                        metadata: {
                            payment_id: payment.id,
                            amount: totalAmount,
                            due_date: dueDate
                        }
                    })

                // If student has parents, notify them too
                const { data: parents } = await supabaseClient
                    .from('parent_students')
                    .select('parent_id')
                    .eq('student_id', enrollment.student_id)

                if (parents && parents.length > 0) {
                    const parentNotifications = parents.map(p => ({
                        user_id: p.parent_id,
                        type: 'payment',
                        title: 'فاتورة جديدة',
                        message: `تم إصدار فاتورة لـ ${enrollment.students.full_name} بقيمة ${totalAmount} ريال`,
                        link: `/payments/${payment.id}`,
                        metadata: {
                            payment_id: payment.id,
                            student_id: enrollment.student_id,
                            amount: totalAmount
                        }
                    }))

                    await supabaseClient
                        .from('notifications')
                        .insert(parentNotifications)
                }

            } catch (error) {
                errors.push({
                    student_id: enrollment.student_id,
                    error: error.message
                })
            }
        }

        return new Response(
            JSON.stringify({
                success: true,
                month,
                year,
                invoices_generated: invoices.length,
                total_amount: invoices.reduce((sum, inv) => sum + inv.amount, 0),
                errors: errors.length > 0 ? errors : undefined
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
                status: 500,
            }
        )
    }
})
