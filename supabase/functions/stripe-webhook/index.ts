import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@14.21.0'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2023-10-16',
})

const supabase = createClient(
  Deno.env.get('NEXT_PUBLIC_SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
)

serve(async (req) => {
  const signature = req.headers.get('stripe-signature')
  
  if (!signature) {
    return new Response('No signature', { status: 400 })
  }

  try {
    const body = await req.text()
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      Deno.env.get('STRIPE_WEBHOOK_SECRET') || ''
    )

    console.log('Webhook event type:', event.type)

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        
        // Extract metadata
        const userId = session.metadata?.user_id
        const plan = session.metadata?.plan
        const couponCode = session.metadata?.coupon_code
        const employeeId = session.metadata?.employee_id

        if (!userId || !plan) {
          console.error('Missing required metadata:', { userId, plan })
          return new Response('Missing metadata', { status: 400 })
        }

        // Create subscription record
        const { data: subscription, error: subError } = await supabase
          .from('subscriptions')
          .insert([{
            user_id: userId,
            plan: plan,
            price: session.amount_total ? session.amount_total / 100 : 0,
            stripe_session_id: session.id,
            status: 'active'
          }])
          .select()
          .single()

        if (subError) {
          console.error('Error creating subscription:', subError)
          return new Response('Subscription creation failed', { status: 500 })
        }

        // Update user profile
        const { error: profileError } = await supabase
          .from('profiles')
          .update({
            is_subscribed: true,
            subscription_plan: plan
          })
          .eq('id', userId)

        if (profileError) {
          console.error('Error updating profile:', profileError)
        }

        // Handle coupon usage and commission
        if (couponCode && employeeId) {
          // Get coupon details
          const { data: coupon } = await supabase
            .from('coupons')
            .select('*')
            .eq('code', couponCode)
            .eq('employee_profile_id', employeeId)
            .single()

          if (coupon) {
            const revenue = session.amount_total ? session.amount_total / 100 : 0
            const commission = revenue * 0.05 // 5% commission

            // Create transaction record
            const { data: transaction } = await supabase
              .from('transactions')
              .insert([{
                user_id: userId,
                subscription_id: subscription.id,
                amount_cents: session.amount_total || 0,
                coupon_id: coupon.id,
                employee_profile_id: employeeId,
                commission_paid: false
              }])
              .select()
              .single()

            // Create coupon usage record
            await supabase
              .from('coupon_usage')
              .insert([{
                coupon_id: coupon.id,
                employee_profile_id: employeeId,
                user_id: userId,
                subscription_id: subscription.id,
                revenue: revenue
              }])

            // Update employee points and commission
            const { data: employee } = await supabase
              .from('profiles')
              .select('points, commission_earned')
              .eq('id', employeeId)
              .single()

            if (employee) {
              await supabase
                .from('profiles')
                .update({
                  points: (employee.points || 0) + 1,
                  commission_earned: (employee.commission_earned || 0) + commission
                })
                .eq('id', employeeId)

              // Update employee metadata
              await supabase
                .from('employees_meta')
                .update({
                  points: (employee.points || 0) + 1,
                  commission_earned: (employee.commission_earned || 0) + commission
                })
                .eq('profile_id', employeeId)
            }
          }
        } else {
          // Create transaction without coupon
          await supabase
            .from('transactions')
            .insert([{
              user_id: userId,
              subscription_id: subscription.id,
              amount_cents: session.amount_total || 0,
              commission_paid: false
            }])
        }

        console.log('Successfully processed checkout session:', session.id)
        break
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice
        
        // Handle recurring payment success
        if (invoice.subscription) {
          const { data: subscription } = await supabase
            .from('subscriptions')
            .select('*')
            .eq('stripe_session_id', invoice.subscription)
            .single()

          if (subscription) {
            await supabase
              .from('subscriptions')
              .update({ status: 'active' })
              .eq('id', subscription.id)
          }
        }
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        
        // Handle payment failure
        if (invoice.subscription) {
          const { data: subscription } = await supabase
            .from('subscriptions')
            .select('*')
            .eq('stripe_session_id', invoice.subscription)
            .single()

          if (subscription) {
            await supabase
              .from('subscriptions')
              .update({ status: 'cancelled' })
              .eq('id', subscription.id)

            // Update user profile
            await supabase
              .from('profiles')
              .update({
                is_subscribed: false,
                subscription_plan: null
              })
              .eq('id', subscription.user_id)
          }
        }
        break
      }

      default:
        console.log('Unhandled event type:', event.type)
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error('Webhook error:', error)
    return new Response(`Webhook error: ${error.message}`, { status: 400 })
  }
})