
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
    const { userId } = req.body;

    // ユーザーのStripe顧客IDを取得
    const { data: customerData, error: customerError } = await supabase
      .from('stripe_customers')
      .select('stripe_customer_id')
      .eq('user_id', userId)
      .single();

    if (customerError || !customerData) {
      return res.status(404).json({ message: 'Stripe顧客情報が見つかりません' });
    }

    // カスタマーポータルセッションを作成
    const session = await stripe.billingPortal.sessions.create({
      customer: customerData.stripe_customer_id,
      return_url: `${process.env.NEXT_PUBLIC_URL}/account`,
    });

    res.status(200).json({ url: session.url });
  } catch (error: any) {
    console.error('Portal session error:', error);
    res.status(500).json({ message: error.message || 'ポータルセッションの作成に失敗しました' });
  }
}
