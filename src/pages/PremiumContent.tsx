
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import PlanRestricted from '@/components/PlanRestricted';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const PremiumContent = () => {
  return (
    <div className="container max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-6">プレミアムコンテンツ</h1>
      
      <Tabs defaultValue="standard" className="mb-10">
        <TabsList className="grid grid-cols-2 w-full max-w-md mx-auto mb-8">
          <TabsTrigger value="standard">スタンダード</TabsTrigger>
          <TabsTrigger value="feedback">フィードバック</TabsTrigger>
        </TabsList>
        
        <TabsContent value="standard" className="space-y-6">
          <h2 className="text-2xl font-semibold mb-4">スタンダードプランコンテンツ</h2>
          
          {/* スタンダードプランのコンテンツ (だれでも閲覧可能) */}
          <Card>
            <CardHeader>
              <CardTitle>基本講座</CardTitle>
              <CardDescription>すべてのユーザーが利用できる基本コンテンツ</CardDescription>
            </CardHeader>
            <CardContent>
              <p>これは基本的なコンテンツです。すべてのユーザーが閲覧できます。</p>
            </CardContent>
          </Card>
          
          {/* スタンダードプラン以上で閲覧可能 */}
          <PlanRestricted requiredPlan="standard">
            <Card>
              <CardHeader>
                <CardTitle>スタンダードコンテンツ</CardTitle>
                <CardDescription>スタンダードプラン以上で利用可能</CardDescription>
              </CardHeader>
              <CardContent>
                <p>このコンテンツはスタンダードプラン以上のユーザーのみ閲覧できます。</p>
                <p className="mt-2">詳細な学習教材や動画へのアクセスが含まれています。</p>
              </CardContent>
            </Card>
          </PlanRestricted>
          
          {/* フィードバックプラン限定コンテンツ */}
          <PlanRestricted requiredPlan="feedback">
            <Card>
              <CardHeader>
                <CardTitle>プレミアムコンテンツ</CardTitle>
                <CardDescription>フィードバックプラン限定</CardDescription>
              </CardHeader>
              <CardContent>
                <p>このコンテンツはフィードバックプランのユーザーのみ閲覧できます。</p>
                <p className="mt-2">高度な内容と個別フィードバック機能が含まれています。</p>
              </CardContent>
            </Card>
          </PlanRestricted>
        </TabsContent>
        
        <TabsContent value="feedback" className="space-y-6">
          <h2 className="text-2xl font-semibold mb-4">フィードバックプランコンテンツ</h2>
          
          {/* フィードバックプラン限定コンテンツ */}
          <PlanRestricted requiredPlan="feedback" message="フィードバックプランにアップグレードして個別フィードバック機能をご利用ください">
            <Card>
              <CardHeader>
                <CardTitle>個別フィードバック</CardTitle>
                <CardDescription>フィードバックプラン限定機能</CardDescription>
              </CardHeader>
              <CardContent>
                <p>この機能ではあなたの学習進捗に対して専門家から個別のフィードバックを受けられます。</p>
                <p className="mt-2">質問への回答や課題の添削も含まれています。</p>
              </CardContent>
              <CardFooter>
                <p className="text-sm text-muted-foreground">月に3回まで利用可能</p>
              </CardFooter>
            </Card>
          </PlanRestricted>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PremiumContent;
