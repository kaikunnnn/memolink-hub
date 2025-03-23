
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.8.0'
import Stripe from 'https://esm.sh/stripe@11.1.0?target=deno'

// 環境変数の取得
const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') || ''
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY') || ''
const baseUrl = Deno.env.get('BASE_URL') || 'http://localhost:5173'

// CORSヘッダー設定
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json'
}

// Supabaseクライアントの初期化（通常キーとサービスロールキーの両方）
const supabase = createClient(supabaseUrl, supabaseAnonKey)
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

// Stripeクライアントの初期化
const stripe = new Stripe(stripeSecretKey, {
  apiVersion: '2022-11-15',
  httpClient: Stripe.createFetchHttpClient(),
})

console.log('Create checkout session function loaded')

serve(async (req) => {
  try {
    // CORSヘッダー処理
    if (req.method === 'OPTIONS') {
      console.log('Handling CORS preflight request')
      return new Response(null, {
        status: 204,
        headers: corsHeaders
      })
    }

    // リクエストデータの取得
    const { planType, billingPeriod, returnUrl } = await req.json()
    console.log(`Request received: planType=${planType}, billingPeriod=${billingPeriod}`)

    // JWTからユーザー情報を取得
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      console.error('Missing authorization header')
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { status: 401, headers: corsHeaders }
      )
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: userError } = await supabase.auth.getUser(token)

    if (userError || !user) {
      console.error('Invalid token or user not found:', userError)
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        { status: 401, headers: corsHeaders }
      )
    }

    console.log(`User authenticated: ${user.id}, ${user.email}`)

    // Stripe価格IDを取得
    let priceId
    if (planType === 'standard') {
      priceId = billingPeriod === 'monthly' 
        ? 'price_1OIiOUKUVUnt8GtyOfXEoEvW' // スタンダード1ヶ月月額
        : 'price_1OIiPpKUVUnt8Gty0OH3Pyip' // スタンダード3ヶ月
    } else if (planType === 'feedback') {
      priceId = billingPeriod === 'monthly' 
        ? 'price_1OIiMRKUVUnt8GtyMGSJIH8H' // フィードバック月額
        : 'price_1OIiMRKUVUnt8GtyttXJ71Hz' // フィードバック3ヶ月
    } else {
      console.error(`Invalid plan type: ${planType}`)
      return new Response(
        JSON.stringify({ error: 'Invalid plan type' }),
        { status: 400, headers: corsHeaders }
      )
    }

    console.log(`Using price ID: ${priceId}`)

    // まずStripeで顧客検索を試みる
    console.log(`Searching for existing Stripe customer with email: ${user.email}`)
    const customers = await stripe.customers.list({
      email: user.email,
      limit: 1
    })

    let customerId

    // 既存の顧客情報をデータベースから取得
    console.log(`Checking customer_info table for user: ${user.id}`)
    const { data: customerData, error: customerError } = await supabaseAdmin
      .from('customer_info')
      .select('stripe_customer_id')
      .eq('id', user.id)
      .maybeSingle()

    if (customerError) {
      console.error('Error querying customer_info:', customerError)
    }

    // 優先順位: 1. DB内の顧客ID、2. Stripeから検索した顧客、3. 新規作成
    if (customerData?.stripe_customer_id) {
      // データベースに顧客IDが存在する場合
      customerId = customerData.stripe_customer_id
      console.log(`Found customer ID in database: ${customerId}`)
    } else if (customers.data.length > 0) {
      // Stripeに同じメールアドレスの顧客が存在する場合
      customerId = customers.data[0].id
      console.log(`Found existing Stripe customer: ${customerId}`)

      // データベースに顧客情報を保存/更新
      const { error: upsertError } = await supabaseAdmin
        .from('customer_info')
        .upsert({
          id: user.id,
          stripe_customer_id: customerId
        })

      if (upsertError) {
        console.error('Error upserting customer info:', upsertError)
      } else {
        console.log('Updated customer info in database')
      }
    } else {
      // 新規顧客をStripeに作成
      console.log('Creating new Stripe customer')
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          user_id: user.id
        }
      })
      customerId = customer.id
      console.log(`Created new customer: ${customerId}`)

      // データベースに顧客情報を保存
      const { error: insertError } = await supabaseAdmin
        .from('customer_info')
        .insert({
          id: user.id,
          stripe_customer_id: customerId
        })

      if (insertError) {
        console.error('Error inserting customer info:', insertError)
      } else {
        console.log('Inserted customer info in database')
      }
    }

    // チェックアウトセッションの作成
    console.log('Creating Stripe checkout session')
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

    console.log(`Checkout session created: ${session.id}, URL: ${session.url}`)
    return new Response(
      JSON.stringify({ url: session.url }),
      { headers: corsHeaders }
    )
  } catch (error) {
    console.error('Error creating checkout session:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: corsHeaders }
    )
  }
})
