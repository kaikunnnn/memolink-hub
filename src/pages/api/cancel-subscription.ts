
import { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';
import { supabase } from '@/lib/supabase';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { subscriptionId } = req.body;

    // Stripeでサブスクリプションをキャンセル（期間終了時）
    await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true,
    });

    // サブスクリプション情報を更新
    const { data: subscription } = await stripe.subscriptions.retrieve(subscriptionId);

    // Supabaseでサブスクリプション情報を更新
    const { data, error } = await supabase
      .from('subscriptions')
      .update({
        status: 'canceled',
        cancel_at_period_end: true,
        updated_at: new Date().toISOString(),
      })
      .eq('stripe_subscription_id', subscriptionId)
      .select()
      .single();

    if (error) {
      throw new Error('サブスクリプション情報の更新に失敗しました');
    }

    res.status(200).json(data);
  } catch (error: any) {
    console.error('Cancel subscription error:', error);
    res.status(500).json({ message: error.message || 'サブスクリプションのキャンセルに失敗しました' });
  }
}
