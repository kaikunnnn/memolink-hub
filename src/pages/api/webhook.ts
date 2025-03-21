
import { NextApiRequest, NextApiResponse } from 'next';
import { buffer } from 'micro';
import Stripe from 'stripe';
import { supabase } from '@/lib/supabase';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

// このAPIルートでbodyパーサーを無効化（Stripeのwebhookで必要）
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const buf = await buffer(req);
  const sig = req.headers['stripe-signature'] as string;

  let event: Stripe.Event;

  try {
    // Webhook署名を検証
    event = stripe.webhooks.constructEvent(
      buf.toString(),
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error(`Webhook署名検証エラー: ${err.message}`);
    return res.status(400).json({ message: `Webhook Error: ${err.message}` });
  }

  // イベントタイプに基づいて処理
  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session);
        break;
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;
      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice);
        break;
      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
        break;
      default:
        console.log(`処理されないイベントタイプ: ${event.type}`);
    }

    res.status(200).json({ received: true });
  } catch (error: any) {
    console.error(`Webhookエラー: ${error.message}`);
    res.status(500).json({ message: `Webhook処理エラー: ${error.message}` });
  }
}

// チェックアウトセッション完了時の処理
async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  const { userId, planType, billingPeriod } = session.metadata || {};

  if (!userId || !planType || !billingPeriod) {
    throw new Error('セッションメタデータが不足しています');
  }

  // サブスクリプション情報を取得
  const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
  
  // サブスクリプションデータをSupabaseに保存
  await supabase.from('subscriptions').insert({
    id: session.id,
    user_id: userId,
    plan_type: planType,
    billing_period: billingPeriod,
    status: subscription.status,
    current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
    current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
    cancel_at_period_end: subscription.cancel_at_period_end,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    stripe_customer_id: subscription.customer as string,
    stripe_subscription_id: subscription.id,
  });
}

// サブスクリプション更新時の処理
async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  // Supabaseのサブスクリプション情報を更新
  await supabase
    .from('subscriptions')
    .update({
      status: subscription.status,
      current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      cancel_at_period_end: subscription.cancel_at_period_end,
      updated_at: new Date().toISOString(),
    })
    .eq('stripe_subscription_id', subscription.id);
}

// サブスクリプション削除時の処理
async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  // Supabaseのサブスクリプション情報を更新
  await supabase
    .from('subscriptions')
    .update({
      status: 'canceled',
      updated_at: new Date().toISOString(),
    })
    .eq('stripe_subscription_id', subscription.id);
}

// 請求書支払い成功時の処理
async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  if (!invoice.subscription) return;

  // 更新された請求期間を取得
  const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string);
  
  // Supabaseのサブスクリプション情報を更新
  await supabase
    .from('subscriptions')
    .update({
      current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      status: 'active',
      updated_at: new Date().toISOString(),
    })
    .eq('stripe_subscription_id', invoice.subscription);
}

// 請求書支払い失敗時の処理
async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  if (!invoice.subscription) return;

  // サブスクリプション情報を取得
  const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string);
  
  // Supabaseのサブスクリプション情報を更新
  await supabase
    .from('subscriptions')
    .update({
      status: subscription.status,
      updated_at: new Date().toISOString(),
    })
    .eq('stripe_subscription_id', invoice.subscription);
}
