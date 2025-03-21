
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.8.0'
import Stripe from 'https://esm.sh/stripe@11.1.0?target=deno'

// 環境変数の取得
const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') || ''
const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY') || ''
const baseUrl = Deno.env.get('BASE_URL') || 'http://localhost:5173'

// Supabaseクライアントの初期化
const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Stripeクライアントの初期化
const stripe = new Stripe(stripeSecretKey, {
  apiVersion: '2022-11-15',
  httpClient: Stripe.createFetchHttpClient(),
})

serve(async (req) => {
  try {
    // CORSヘッダー
    const headers = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    }

    // OPTIONSリクエストの処理
    if (req.method === 'OPTIONS') {
      return new Response('ok', { headers })
    }

    // リクエストデータの取得
    const { planType, billingPeriod, returnUrl } = await req.json()

    // JWTからユーザー情報を取得
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { status: 401, headers: { ...headers, 'Content-Type': 'application/json' } }
      )
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: userError } = await supabase.auth.getUser(token)

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        { status: 401, headers: { ...headers, 'Content-Type': 'application/json' } }
      )
    }

    // Stripe価格IDを取得
    let priceId
    if (planType === 'standard') {
      priceId = billingPeriod === 'monthly' 
        ? 'price_1234567890_standard_monthly' // 実際のIDに変更
        : 'price_1234567890_standard_quarterly' // 実際のIDに変更
    } else if (planType === 'feedback') {
      priceId = billingPeriod === 'monthly' 
        ? 'price_1234567890_feedback_monthly' // 実際のIDに変更
        : 'price_1234567890_feedback_quarterly' // 実際のIDに変更
    } else {
      return new Response(
        JSON.stringify({ error: 'Invalid plan type' }),
        { status: 400, headers: { ...headers, 'Content-Type': 'application/json' } }
      )
    }

    // 既存の顧客情報を取得
    const { data: customerData } = await supabase
      .from('customer_info')
      .select('stripe_customer_id')
      .eq('id', user.id)
      .single()

    let customerId
    if (customerData?.stripe_customer_id) {
      customerId = customerData.stripe_customer_id
    } else {
      // 新規顧客をStripeに作成
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          user_id: user.id
        }
      })
      customerId = customer.id

      // データベースに顧客情報を保存
      await supabase.from('customer_info').insert({
        id: user.id,
        stripe_customer_id: customerId
      })
    }

    // チェックアウトセッションの作成
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${returnUrl || baseUrl}/account?success=true`,
      cancel_url: `${returnUrl || baseUrl}/pricing?canceled=true`,
      metadata: {
        user_id: user.id,
        plan_type: planType,
        billing_period: billingPeriod
      },
    })

    return new Response(
      JSON.stringify({ url: session.url }),
      { headers: { ...headers, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error creating checkout session:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})
