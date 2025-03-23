
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

    console.log('Validating Stripe signature:', signature.substring(0, 20) + '...')

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
        console.log('Session object:', JSON.stringify(session, null, 2))
        
        const userId = session.metadata?.user_id
        const planType = session.metadata?.plan_type
        const billingPeriod = session.metadata?.billing_period
        const subscriptionId = session.subscription
        
        if (!userId || !planType || !billingPeriod || !subscriptionId) {
          console.error('Missing required metadata in session', { 
            userId, planType, billingPeriod, subscriptionId 
          })
          return new Response(JSON.stringify({ error: 'Missing required metadata' }), {
            status: 400,
            headers: corsHeaders
          })
        }

        console.log(`Checkout completed for user: ${userId}, plan: ${planType}, period: ${billingPeriod}`)

        // サブスクリプション詳細を取得
        console.log(`Retrieving subscription details for: ${subscriptionId}`)
        const subscription = await stripe.subscriptions.retrieve(subscriptionId)
        console.log('Subscription details:', JSON.stringify({
          id: subscription.id,
          status: subscription.status,
          customer: subscription.customer,
          current_period_start: subscription.current_period_start,
          current_period_end: subscription.current_period_end
        }, null, 2))
        
        const now = new Date()
        const currentPeriodStart = new Date(subscription.current_period_start * 1000)
        const currentPeriodEnd = new Date(subscription.current_period_end * 1000)

        // 既存のサブスクリプションを確認
        console.log(`Checking for existing subscriptions for user: ${userId}`)
        const { data: existingSubscriptions, error: subscriptionError } = await supabase
          .from('subscriptions')
          .select('id, status, stripe_subscription_id')
          .eq('user_id', userId)
          .eq('status', 'active')

        if (subscriptionError) {
          console.error('Error checking existing subscription:', subscriptionError)
          return new Response(JSON.stringify({ error: subscriptionError.message }), {
            status: 500,
            headers: corsHeaders
          })
        }

        console.log(`Found ${existingSubscriptions?.length || 0} existing active subscriptions`)

        // 既存のアクティブなサブスクリプションがあれば更新
        if (existingSubscriptions && existingSubscriptions.length > 0) {
          for (const existingSub of existingSubscriptions) {
            // 同じStripeサブスクリプションIDの場合はスキップ（重複処理防止）
            if (existingSub.stripe_subscription_id === subscriptionId) {
              console.log(`Subscription ${subscriptionId} already exists, skipping update`)
              continue
            }
            
            console.log(`Marking existing subscription ${existingSub.id} as canceled`)
            // 既存のサブスクリプションをキャンセル済みにマーク
            const { error: updateError } = await supabase
              .from('subscriptions')
              .update({
                status: 'canceled',
                cancel_at_period_end: true,
                updated_at: now.toISOString()
              })
              .eq('id', existingSub.id)

            if (updateError) {
              console.error(`Error updating existing subscription ${existingSub.id}:`, updateError)
            } else {
              console.log(`Successfully marked subscription ${existingSub.id} as canceled`)
            }
          }
        }

        // 同じstripe_subscription_idのレコードが既に存在するか確認（冪等性の確保）
        const { data: existingSubWithSameId } = await supabase
          .from('subscriptions')
          .select('id')
          .eq('stripe_subscription_id', subscriptionId)
          .maybeSingle()

        if (existingSubWithSameId) {
          console.log(`Subscription with stripe_subscription_id ${subscriptionId} already exists, updating instead of inserting`)
          
          // 既存レコードを更新
          const { error: updateError } = await supabase
            .from('subscriptions')
            .update({
              plan_type: planType,
              billing_period: billingPeriod,
              status: subscription.status,
              current_period_start: currentPeriodStart.toISOString(),
              current_period_end: currentPeriodEnd.toISOString(),
              cancel_at_period_end: subscription.cancel_at_period_end,
              updated_at: now.toISOString(),
              stripe_customer_id: subscription.customer
            })
            .eq('id', existingSubWithSameId.id)

          if (updateError) {
            console.error('Error updating existing subscription record:', updateError)
            return new Response(JSON.stringify({ error: updateError.message }), {
              status: 500,
              headers: corsHeaders
            })
          }
          
          console.log(`Successfully updated subscription record ${existingSubWithSameId.id}`)
        } else {
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
            .select()

          if (insertError) {
            console.error('Error inserting subscription record:', insertError)
            return new Response(JSON.stringify({ error: insertError.message }), {
              status: 500,
              headers: corsHeaders
            })
          }

          console.log('Subscription record inserted successfully:', insertData)
        }
        
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
          return new Response(JSON.stringify({ error: updateError.message }), {
            status: 500,
            headers: corsHeaders
          })
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
          return new Response(JSON.stringify({ error: updateError.message }), {
            status: 500,
            headers: corsHeaders
          })
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
