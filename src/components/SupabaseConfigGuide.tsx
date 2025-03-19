
import React from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, ExternalLink } from 'lucide-react';

const SupabaseConfigGuide = () => {
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Supabase設定が必要です</CardTitle>
        <CardDescription>
          アプリケーションを使用するには、Supabaseの設定が必要です
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>設定が不足しています</AlertTitle>
          <AlertDescription>
            VITE_SUPABASE_URLとVITE_SUPABASE_ANON_KEYが設定されていません
          </AlertDescription>
        </Alert>
        
        <div className="space-y-2">
          <h3 className="font-medium">設定方法:</h3>
          <ol className="list-decimal pl-5 space-y-2">
            <li>Supabaseアカウントにログインし、プロジェクトを作成してください</li>
            <li>プロジェクト設定 &gt; API から以下の情報を取得:
              <ul className="list-disc pl-5 mt-1">
                <li><strong>Project URL</strong> = VITE_SUPABASE_URL</li>
                <li><strong>anon/public key</strong> = VITE_SUPABASE_ANON_KEY</li>
              </ul>
            </li>
            <li>取得した情報を環境変数として設定してください</li>
          </ol>
        </div>
      </CardContent>
      <CardFooter>
        <Button className="w-full" asChild>
          <a href="https://supabase.com" target="_blank" rel="noopener noreferrer">
            Supabaseにアクセス <ExternalLink className="ml-2 h-4 w-4" />
          </a>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default SupabaseConfigGuide;
