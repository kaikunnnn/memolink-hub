
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.8.0'
import Stripe from 'https://esm.sh/stripe@11.1.0?target=deno'

// 環境変数の取得
const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY') || ''
const stripeWebhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET') || ''

// CORSヘッダー設定
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, stripe-signature',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json'
}

// Supabaseクライアントの初期化（サービスロールキーを使用）
const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Stripeクライアントの初期化
const stripe = new Stripe(stripeSecretKey, {
  apiVersion: '2022-11-15',
  httpClient: Stripe.createFetchHttpClient(),
})

console.log('Stripe webhook function loaded')

serve(async (req) => {
  console.log('Webhook received:', req.method)
  
  try {
    // OPTIONSリクエスト（CORS preflight）の処理
    if (req.method === 'OPTIONS') {
      console.log('Handling CORS preflight request')
      return new Response(null, {
        status: 204,
        headers: corsHeaders
      })
    }

    // リクエストデータの取得
    const body = await req.text()
    const signature = req.headers.get('Stripe-Signature')

    if (!signature) {
      console.error('No Stripe signature in request headers')
      return new Response(JSON.stringify({ error: 'No Stripe signature' }), {
        status: 400,
        headers: corsHeaders
      })
    }

    console.log('Validating Stripe signature')

    // Webhookイベントの検証
    let event
    try {
      event = stripe.webhooks.constructEvent(body, signature, stripeWebhookSecret)
      console.log('Event validated successfully:', event.type)
    } catch (err) {
      console.error('Webhook signature verification failed:', err.message)
      return new Response(JSON.stringify({ error: `Webhook Error: ${err.message}` }), {
        status: 400,
        headers: corsHeaders
      })
    }

    // イベントタイプ別の処理
    switch (event.type) {
      case 'checkout.session.completed': {
        console.log('Processing checkout.session.completed event')
        const session = event.data.object
        const userId = session.metadata.user_id
        const planType = session.metadata.plan_type
        const billingPeriod = session.metadata.billing_period
        const subscriptionId = session.subscription

        console.log(`Checkout completed for user: ${userId}, plan: ${planType}, period: ${billingPeriod}`)

        // サブスクリプション詳細を取得
        console.log(`Retrieving subscription details for: ${subscriptionId}`)
        const subscription = await stripe.subscriptions.retrieve(subscriptionId)
        
        const now = new Date()
        const currentPeriodStart = new Date(subscription.current_period_start * 1000)
        const currentPeriodEnd = new Date(subscription.current_period_end * 1000)

        // 既存のサブスクリプションを確認
        console.log(`Checking for existing subscriptions for user: ${userId}`)
        const { data: existingSubscription, error: subscriptionError } = await supabase
          .from('subscriptions')
          .select('id, status')
          .eq('user_id', userId)
          .eq('status', 'active')
          .maybeSingle()

        if (subscriptionError) {
          console.error('Error checking existing subscription:', subscriptionError)
        }

        if (existingSubscription) {
          console.log(`Found existing subscription: ${existingSubscription.id}, marking as canceled`)
          // 既存のサブスクリプションをキャンセル済みにマーク
          const { error: updateError } = await supabase
            .from('subscriptions')
            .update({
              status: 'canceled',
              cancel_at_period_end: true,
              updated_at: now.toISOString()
            })
            .eq('id', existingSubscription.id)

          if (updateError) {
            console.error('Error updating existing subscription:', updateError)
          }
        }

        // 新しいサブスクリプションを登録
        console.log('Inserting new subscription record')
        const { data: insertData, error: insertError } = await supabase
          .from('subscriptions')
          .insert({
            user_id: userId,
            plan_type: planType,
            billing_period: billingPeriod,
            status: subscription.status,
            current_period_start: currentPeriodStart.toISOString(),
            current_period_end: currentPeriodEnd.toISOString(),
            cancel_at_period_end: subscription.cancel_at_period_end,
            stripe_subscription_id: subscriptionId,
            stripe_customer_id: subscription.customer
          })

        if (insertError) {
          console.error('Error inserting subscription record:', insertError)
          return new Response(JSON.stringify({ error: insertError.message }), {
            status: 500,
            headers: corsHeaders
          })
        }

        console.log('Subscription record inserted successfully')
        break
      }
      
      case 'customer.subscription.updated': {
        console.log('Processing customer.subscription.updated event')
        const subscription = event.data.object
        const stripeSubId = subscription.id

        // サブスクリプション情報の更新
        console.log(`Updating subscription: ${stripeSubId}`)
        const { error: updateError } = await supabase
          .from('subscriptions')
          .update({
            status: subscription.status,
            current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            cancel_at_period_end: subscription.cancel_at_period_end,
            updated_at: new Date().toISOString()
          })
          .eq('stripe_subscription_id', stripeSubId)
        
        if (updateError) {
          console.error('Error updating subscription:', updateError)
        } else {
          console.log('Subscription updated successfully')
        }
        
        break
      }
      
      case 'customer.subscription.deleted': {
        console.log('Processing customer.subscription.deleted event')
        const subscription = event.data.object
        const stripeSubId = subscription.id

        // サブスクリプションのステータスを更新
        console.log(`Marking subscription as canceled: ${stripeSubId}`)
        const { error: updateError } = await supabase
          .from('subscriptions')
          .update({
            status: 'canceled',
            cancel_at_period_end: true,
            updated_at: new Date().toISOString()
          })
          .eq('stripe_subscription_id', stripeSubId)
        
        if (updateError) {
          console.error('Error marking subscription as canceled:', updateError)
        } else {
          console.log('Subscription marked as canceled successfully')
        }
        
        break
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: corsHeaders
    })
  } catch (error) {
    console.error('Webhook general error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: corsHeaders
    })
  }
})
