import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@14.21.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2023-10-16',
})

// Price mapping for subscription plans
const PRICE_MAP = {
  one_letter: {
    price: 29900, // $299.00 in cents
    mode: 'payment' as const,
    name: 'Single Letter Generation',
    description: 'Generate one professional legal letter'
  },
  four_letters: {
    price: 29900, // $299.00 in cents
    mode: 'subscription' as const,
    interval: 'year' as const,
    name: 'Four Letters Monthly',
    description: 'Generate up to 4 letters per month, billed yearly'
  },
  eight_letters: {
    price: 59900, // $599.00 in cents
    mode: 'subscription' as const,
    interval: 'year' as const,
    name: 'Eight Letters Monthly',
    description: 'Generate up to 8 letters per month, billed yearly'
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('NEXT_PUBLIC_SUPABASE_URL') ?? '',
      Deno.env.get('NEXT_PUBLIC_SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // Get user from JWT
    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser()

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { plan, couponCode, successUrl, cancelUrl } = await req.json()

    if (!plan || !PRICE_MAP[plan as keyof typeof PRICE_MAP]) {
      return new Response(
        JSON.stringify({ error: 'Invalid plan selected' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const planConfig = PRICE_MAP[plan as keyof typeof PRICE_MAP]
    let employeeId = null
    let discountAmount = 0

    // Validate coupon if provided
    if (couponCode) {
      const { data: coupon, error: couponError } = await supabaseClient
        .from('coupons')
        .select('*, employee_profile_id')
        .eq('code', couponCode)
        .eq('active', true)
        .single()

      if (couponError || !coupon) {
        return new Response(
          JSON.stringify({ error: 'Invalid or inactive coupon code' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      employeeId = coupon.employee_profile_id
      discountAmount = Math.floor(planConfig.price * (coupon.percent_off / 100))
    }

    // Create Stripe checkout session
    const sessionConfig: Stripe.Checkout.SessionCreateParams = {
      payment_method_types: ['card'],
      mode: planConfig.mode,
      success_url: successUrl || `${req.headers.get('origin')}/dashboard?success=true`,
      cancel_url: cancelUrl || `${req.headers.get('origin')}/dashboard?cancelled=true`,
      metadata: {
        user_id: user.id,
        plan: plan,
        ...(couponCode && { coupon_code: couponCode }),
        ...(employeeId && { employee_id: employeeId }),
      },
      customer_email: user.email,
    }

    if (planConfig.mode === 'payment') {
      // One-time payment
      sessionConfig.line_items = [{
        price_data: {
          currency: 'usd',
          product_data: {
            name: planConfig.name,
            description: planConfig.description,
          },
          unit_amount: planConfig.price - discountAmount,
        },
        quantity: 1,
      }]
    } else {
      // Subscription
      sessionConfig.line_items = [{
        price_data: {
          currency: 'usd',
          product_data: {
            name: planConfig.name,
            description: planConfig.description,
          },
          unit_amount: planConfig.price - discountAmount,
          recurring: {
            interval: planConfig.interval,
          },
        },
        quantity: 1,
      }]
    }

    // Add discount if coupon is applied
    if (discountAmount > 0) {
      sessionConfig.discounts = [{
        coupon: await stripe.coupons.create({
          percent_off: Math.floor((discountAmount / planConfig.price) * 100),
          duration: 'once',
          name: `Employee Discount - ${couponCode}`,
        }).then(coupon => coupon.id)
      }]
    }

    const session = await stripe.checkout.sessions.create(sessionConfig)

    return new Response(
      JSON.stringify({ 
        sessionId: session.id,
        url: session.url 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error creating checkout session:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})