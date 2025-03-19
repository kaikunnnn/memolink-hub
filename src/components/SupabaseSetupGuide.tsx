
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Code } from '@/components/ui/code';
import { InfoIcon, CheckCircle2, Database, ExternalLink } from 'lucide-react';

const SupabaseSetupGuide = () => {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Supabase設定ガイド</CardTitle>
        <CardDescription>
          新規登録機能を使用するには、以下の設定が必要です
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <h3 className="text-lg font-medium flex items-center">
            <InfoIcon className="h-5 w-5 mr-2 text-blue-500" />
            ステップ1: 認証設定
          </h3>
          <div className="ml-7 space-y-2">
            <p>Supabaseプロジェクト設定から、認証を有効にします:</p>
            <ol className="list-decimal pl-5 space-y-1">
              <li>Supabaseダッシュボードにログイン</li>
              <li>Authentication &gt; Providers を開く</li>
              <li>Email を有効にする</li>
              <li>必要に応じて「Confirm email」のチェックを外す（開発時は簡易化のため）</li>
            </ol>
          </div>
        </div>
        
        <Separator />
        
        <div className="space-y-2">
          <h3 className="text-lg font-medium flex items-center">
            <Database className="h-5 w-5 mr-2 text-green-500" />
            ステップ2: プロフィールテーブルの作成
          </h3>
          <div className="ml-7 space-y-2">
            <p>ユーザープロフィール情報を保存するためのテーブルを作成します:</p>
            <Alert>
              <AlertTitle>SQLクエリを実行</AlertTitle>
              <AlertDescription>
                Supabaseダッシュボードの「SQL Editor」で以下のSQLを実行してください:
              </AlertDescription>
            </Alert>
            
            <div className="bg-muted p-4 rounded-md">
              <pre className="text-xs text-muted-foreground overflow-auto">
{`-- profiles テーブルを作成
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Row Level Security (RLS) を設定
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- ユーザーが自分のプロフィールのみを閲覧・編集できるポリシーを作成
CREATE POLICY "ユーザーは自分のプロフィールを閲覧可能" 
  ON profiles FOR SELECT USING (auth.uid() = id);

CREATE POLICY "ユーザーは自分のプロフィールを更新可能" 
  ON profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "ユーザーは自分のプロフィールを作成可能" 
  ON profiles FOR INSERT WITH CHECK (auth.uid() = id);`}
              </pre>
            </div>
          </div>
        </div>
        
        <Separator />
        
        <div className="rounded-md border p-4 bg-blue-50">
          <div className="flex items-start">
            <CheckCircle2 className="h-5 w-5 mr-2 text-blue-500 mt-0.5" />
            <div>
              <h4 className="font-medium">これで設定完了です！</h4>
              <p className="text-sm text-muted-foreground mt-1">
                アプリケーションが自動的にこれらの設定を使用して、新規登録とログイン機能を提供します。
              </p>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button className="w-full" asChild>
          <a href="https://supabase.com/dashboard" target="_blank" rel="noopener noreferrer">
            Supabaseダッシュボードを開く <ExternalLink className="ml-2 h-4 w-4" />
          </a>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default SupabaseSetupGuide;
