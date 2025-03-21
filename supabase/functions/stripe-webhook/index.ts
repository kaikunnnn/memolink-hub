
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.8.0'
import Stripe from 'https://esm.sh/stripe@11.1.0?target=deno'

// 環境変数の取得
const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY') || ''
const stripeWebhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET') || ''

// Supabaseクライアントの初期化（サービスロールキーを使用）
const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Stripeクライアントの初期化
const stripe = new Stripe(stripeSecretKey, {
  apiVersion: '2022-11-15',
  httpClient: Stripe.createFetchHttpClient(),
})

serve(async (req) => {
  try {
    // リクエストデータの取得
    const body = await req.text()
    const signature = req.headers.get('Stripe-Signature')

    if (!signature) {
      return new Response(JSON.stringify({ error: 'No Stripe signature' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // Webhookイベントの検証
    let event
    try {
      event = stripe.webhooks.constructEvent(body, signature, stripeWebhookSecret)
    } catch (err) {
      return new Response(JSON.stringify({ error: `Webhook Error: ${err.message}` }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // イベントタイプ別の処理
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object
        const userId = session.metadata.user_id
        const planType = session.metadata.plan_type
        const billingPeriod = session.metadata.billing_period
        const subscriptionId = session.subscription

        // サブスクリプション詳細を取得
        const subscription = await stripe.subscriptions.retrieve(subscriptionId)
        
        const now = new Date()
        const currentPeriodStart = new Date(subscription.current_period_start * 1000)
        const currentPeriodEnd = new Date(subscription.current_period_end * 1000)

        // 既存のサブスクリプションを確認
        const { data: existingSubscription } = await supabase
          .from('subscriptions')
          .select('id, status')
          .eq('user_id', userId)
          .eq('status', 'active')
          .maybeSingle()

        if (existingSubscription) {
          // 既存のサブスクリプションをキャンセル済みにマーク
          await supabase
            .from('subscriptions')
            .update({
              status: 'canceled',
              cancel_at_period_end: true,
              updated_at: now.toISOString()
            })
            .eq('id', existingSubscription.id)
        }

        // 新しいサブスクリプションを登録
        await supabase.from('subscriptions').insert({
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
        
        break
      }
      
      case 'customer.subscription.updated': {
        const subscription = event.data.object
        const stripeSubId = subscription.id

        // サブスクリプション情報の更新
        await supabase
          .from('subscriptions')
          .update({
            status: subscription.status,
            current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            cancel_at_period_end: subscription.cancel_at_period_end,
            updated_at: new Date().toISOString()
          })
          .eq('stripe_subscription_id', stripeSubId)
        
        break
      }
      
      case 'customer.subscription.deleted': {
        const subscription = event.data.object
        const stripeSubId = subscription.id

        // サブスクリプションのステータスを更新
        await supabase
          .from('subscriptions')
          .update({
            status: 'canceled',
            cancel_at_period_end: true,
            updated_at: new Date().toISOString()
          })
          .eq('stripe_subscription_id', stripeSubId)
        
        break
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('Webhook error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
})
