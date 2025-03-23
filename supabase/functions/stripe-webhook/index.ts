
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.8.0'
import Stripe from 'https://esm.sh/stripe@11.1.0?target=deno'
import { Buffer } from 'https://deno.land/std@0.168.0/node/buffer.ts'

// 環境変数の取得
const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY') || ''
const stripeWebhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET') || ''

// CORSヘッダー設定
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

// Supabaseクライアントとサービスロールクライアントの初期化
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

// Stripeの初期化
const stripe = new Stripe(stripeSecretKey, {
  apiVersion: '2022-11-15',
  httpClient: Stripe.createFetchHttpClient(),
})

console.log('Stripe webhook function loaded successfully')

serve(async (req) => {
  try {
    // CORS対応
    if (req.method === 'OPTIONS') {
      console.log('Handling CORS preflight request')
      return new Response(null, {
        status: 204,
        headers: corsHeaders,
      })
    }

    if (req.method !== 'POST') {
      console.error(`Unsupported method: ${req.method}`)
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // リクエストの検証
    console.log('Verifying webhook signature')
    const body = await req.text()
    let signature = req.headers.get('stripe-signature')

    if (!signature) {
      console.error('No Stripe signature found in request headers')
      return new Response(JSON.stringify({ error: 'No signature' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Stripeイベントの構築と検証
    let event
    try {
      event = stripe.webhooks.constructEvent(body, signature, stripeWebhookSecret)
      console.log(`Webhook event verified: ${event.type}`)
    } catch (err) {
      console.error(`Webhook signature verification failed: ${err.message}`)
      return new Response(JSON.stringify({ error: `Webhook signature verification failed: ${err.message}` }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // イベントタイプに基づく処理
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object)
        break
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object)
        break
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object)
        break
      case 'invoice.payment_succeeded':
        // 定期支払いの成功処理
        await handleInvoicePaymentSucceeded(event.data.object)
        break
      case 'invoice.payment_failed':
        // 定期支払い失敗の処理
        await handleInvoicePaymentFailed(event.data.object)
        break
      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error(`Webhook error: ${error.message}`)
    return new Response(JSON.stringify({ error: `Webhook error: ${error.message}` }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})

// チェックアウトセッション完了時の処理
async function handleCheckoutSessionCompleted(session) {
  console.log(`Processing checkout.session.completed for session ${session.id}`)
  
  try {
    // セッションに関連するサブスクリプションを取得
    if (session.subscription) {
      const subscription = await stripe.subscriptions.retrieve(session.subscription)
      console.log(`Retrieved subscription: ${subscription.id}`)
      
      // Supabaseにサブスクリプション情報を保存
      await saveSubscriptionToDatabase(subscription, session.customer, session.metadata)
    } else {
      console.log('No subscription found in the checkout session')
    }
  } catch (error) {
    console.error(`Error processing checkout session: ${error.message}`)
    throw error
  }
}

// サブスクリプションの更新処理
async function handleSubscriptionUpdated(subscription) {
  console.log(`Processing customer.subscription.updated for subscription ${subscription.id}`)
  
  try {
    // メタデータを取得するために顧客情報も取得
    const customer = await stripe.customers.retrieve(subscription.customer)
    console.log(`Retrieved customer: ${customer.id}`)
    
    // メタデータをチェック（user_idがある場合）
    const metadata = customer.metadata || {}
    
    // Supabaseにサブスクリプション情報を保存/更新
    await saveSubscriptionToDatabase(subscription, subscription.customer, metadata)
  } catch (error) {
    console.error(`Error processing subscription update: ${error.message}`)
    throw error
  }
}

// サブスクリプションの削除処理
async function handleSubscriptionDeleted(subscription) {
  console.log(`Processing customer.subscription.deleted for subscription ${subscription.id}`)
  
  try {
    // メタデータを取得するために顧客情報も取得
    const customer = await stripe.customers.retrieve(subscription.customer)
    console.log(`Retrieved customer: ${customer.id}`)
    
    // Supabaseでサブスクリプションのステータスを更新
    const { data, error } = await supabaseAdmin
      .from('subscriptions')
      .update({
        status: 'canceled',
        updated_at: new Date().toISOString(),
      })
      .eq('stripe_subscription_id', subscription.id)
    
    if (error) {
      console.error(`Error updating subscription status: ${error.message}`)
      throw error
    }
    
    console.log(`Successfully updated subscription status for ${subscription.id}`)
  } catch (error) {
    console.error(`Error processing subscription deletion: ${error.message}`)
    throw error
  }
}

// 請求書支払い成功時の処理
async function handleInvoicePaymentSucceeded(invoice) {
  console.log(`Processing invoice.payment_succeeded for invoice ${invoice.id}`)
  
  try {
    if (invoice.subscription) {
      // 関連するサブスクリプションを取得
      const subscription = await stripe.subscriptions.retrieve(invoice.subscription)
      console.log(`Retrieved subscription: ${subscription.id}`)
      
      // メタデータを取得するために顧客情報も取得
      const customer = await stripe.customers.retrieve(invoice.customer)
      console.log(`Retrieved customer: ${customer.id}`)
      
      // Supabaseでサブスクリプション情報を更新
      await saveSubscriptionToDatabase(subscription, invoice.customer, customer.metadata || {})
    } else {
      console.log('No subscription found in the invoice')
    }
  } catch (error) {
    console.error(`Error processing invoice payment success: ${error.message}`)
    throw error
  }
}

// 請求書支払い失敗時の処理
async function handleInvoicePaymentFailed(invoice) {
  console.log(`Processing invoice.payment_failed for invoice ${invoice.id}`)
  
  // ここでは、通知や他のアクションを実装できます
  try {
    if (invoice.subscription) {
      // サブスクリプションの状態を更新
      const { data, error } = await supabaseAdmin
        .from('subscriptions')
        .update({
          status: 'past_due',
          updated_at: new Date().toISOString(),
        })
        .eq('stripe_subscription_id', invoice.subscription)
      
      if (error) {
        console.error(`Error updating subscription status: ${error.message}`)
        throw error
      }
      
      console.log(`Successfully updated subscription status for ${invoice.subscription}`)
    }
  } catch (error) {
    console.error(`Error processing invoice payment failure: ${error.message}`)
    throw error
  }
}

// サブスクリプション情報をデータベースに保存
async function saveSubscriptionToDatabase(subscription, customerId, metadata) {
  console.log(`Saving subscription ${subscription.id} to database`)
  
  try {
    // サブスクリプションの重要な情報を取得
    const status = subscription.status
    const planId = subscription.items.data[0].price.id
    const currentPeriodStart = new Date(subscription.current_period_start * 1000).toISOString()
    const currentPeriodEnd = new Date(subscription.current_period_end * 1000).toISOString()
    const cancelAtPeriodEnd = subscription.cancel_at_period_end
    
    // プランタイプとビリングピリオドを価格IDから判断
    let planType, billingPeriod
    
    // 価格IDに基づいて判断（Stripeダッシュボードの実際の価格IDに合わせる必要があります）
    switch (planId) {
      case 'price_1OIiOUKUVUnt8GtyOfXEoEvW':
        planType = 'standard'
        billingPeriod = 'monthly'
        break
      case 'price_1OIiPpKUVUnt8Gty0OH3Pyip':
        planType = 'standard'
        billingPeriod = 'quarterly'
        break
      case 'price_1OIiMRKUVUnt8GtyMGSJIH8H':
        planType = 'feedback'
        billingPeriod = 'monthly'
        break
      case 'price_1OIiMRKUVUnt8GtyttXJ71Hz':
        planType = 'feedback'
        billingPeriod = 'quarterly'
        break
      default:
        planType = 'standard'
        billingPeriod = 'monthly'
    }
    
    // メタデータからユーザーIDを取得（または他のソースから）
    const userId = metadata.user_id || null
    
    if (!userId) {
      console.warn(`No userId found in metadata for subscription ${subscription.id}`)
    } else {
      console.log(`Found userId ${userId} in metadata`)
    }
    
    // 既存のサブスクリプションを確認
    console.log(`Checking for existing subscription with ID ${subscription.id}`)
    const { data: existingSubscription, error: fetchError } = await supabaseAdmin
      .from('subscriptions')
      .select('*')
      .eq('stripe_subscription_id', subscription.id)
      .single()
    
    if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116はデータが見つからないエラー
      console.error(`Error fetching existing subscription: ${fetchError.message}`)
      throw fetchError
    }
    
    if (existingSubscription) {
      // 既存のサブスクリプションを更新
      console.log(`Updating existing subscription ${subscription.id}`)
      const { data, error } = await supabaseAdmin
        .from('subscriptions')
        .update({
          status,
          current_period_start: currentPeriodStart,
          current_period_end: currentPeriodEnd,
          cancel_at_period_end: cancelAtPeriodEnd,
          plan_type: planType,
          billing_period: billingPeriod,
          updated_at: new Date().toISOString(),
        })
        .eq('stripe_subscription_id', subscription.id)
      
      if (error) {
        console.error(`Error updating subscription: ${error.message}`)
        throw error
      }
      
      console.log(`Successfully updated subscription ${subscription.id}`)
    } else {
      // 新しいサブスクリプションを作成
      console.log(`Creating new subscription record for ${subscription.id}`)
      const { data, error } = await supabaseAdmin
        .from('subscriptions')
        .insert({
          user_id: userId,
          stripe_subscription_id: subscription.id,
          stripe_customer_id: customerId,
          status,
          current_period_start: currentPeriodStart,
          current_period_end: currentPeriodEnd,
          cancel_at_period_end: cancelAtPeriodEnd,
          plan_type: planType,
          billing_period: billingPeriod,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
      
      if (error) {
        console.error(`Error inserting subscription: ${error.message}`)
        throw error
      }
      
      console.log(`Successfully created subscription record for ${subscription.id}`)
    }
  } catch (error) {
    console.error(`Error saving subscription to database: ${error.message}`)
    throw error
  }
}
