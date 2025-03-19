
import React, { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import SupabaseSetupGuide from '@/components/SupabaseSetupGuide';

const Account = () => {
  const { user, isConfigured } = useAuth();
  
  // Supabaseが設定されていない場合
  if (!isConfigured) {
    return (
      <div className="container max-w-4xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold mb-6">アカウント設定</h1>
        <SupabaseSetupGuide />
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-6">アカウント設定</h1>
      
      {user ? (
        <div className="space-y-6">
          <div className="p-4 bg-muted rounded-lg">
            <p className="font-medium">ログイン中のユーザー:</p>
            <p className="text-muted-foreground">{user.email}</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg border shadow-sm">
            <h2 className="text-xl font-semibold mb-4">プロフィール情報</h2>
            <p className="text-muted-foreground mb-2">
              ここにユーザープロフィール情報を表示する機能を追加できます。
            </p>
          </div>
        </div>
      ) : (
        <div className="text-center py-10">
          <p>ログインしていません。ログインしてください。</p>
        </div>
      )}
    </div>
  );
};

export default Account;
