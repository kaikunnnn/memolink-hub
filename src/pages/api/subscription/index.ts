
import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabase';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ message: 'ユーザーIDが必要です' });
    }

    // ユーザーのサブスクリプション情報を取得
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      // .single()はレコードがない場合にもエラーを返す
      if (error.code === 'PGRST116') {
        return res.status(404).json({ message: 'サブスクリプションが見つかりません' });
      }
      throw error;
    }

    res.status(200).json(data);
  } catch (error: any) {
    console.error('Get subscription error:', error);
    res.status(500).json({ message: error.message || 'サブスクリプション情報の取得に失敗しました' });
  }
}
