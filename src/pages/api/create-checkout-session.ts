
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
    const { planType, billingPeriod, userId, planId } = req.body;

    // ユーザー情報をSupabaseから取得
    const { data: userData, error: userError } = await supabase
      .from('profiles')
      .select('email')
      .eq('id', userId)
      .single();

    if (userError) {
      throw new Error('ユーザー情報の取得に失敗しました');
    }

    // Stripeの顧客を作成または取得
    const { data: customerData, error: customerError } = await supabase
      .from('stripe_customers')
      .select('stripe_customer_id')
      .eq('user_id', userId)
      .single();

    let customerId: string;

    if (customerError || !customerData) {
      // 顧客が存在しない場合は新規作成
      const customer = await stripe.customers.create({
        email: userData.email,
        metadata: {
          userId,
        },
      });
      
      // Supabaseに顧客IDを保存
      await supabase.from('stripe_customers').insert({
        user_id: userId,
        stripe_customer_id: customer.id,
      });
      
      customerId = customer.id;
    } else {
      customerId = customerData.stripe_customer_id;
    }

    // 割引を適用（四半期プランの場合）
    let priceId = planId;
    let discountId = null;
    
    if (billingPeriod === 'quarterly') {
      discountId = 'quarterly_discount'; // Stripeに事前作成したクーポンID
    }

    // チェックアウトセッションを作成
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      discounts: discountId ? [{ coupon: discountId }] : [],
      success_url: `${process.env.NEXT_PUBLIC_URL}/account?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_URL}/pricing?canceled=true`,
      metadata: {
        userId,
        planType,
        billingPeriod,
      },
    });

    res.status(200).json({ sessionId: session.id });
  } catch (error: any) {
    console.error('Checkout session error:', error);
    res.status(500).json({ message: error.message || 'チェックアウトセッションの作成に失敗しました' });
  }
}
