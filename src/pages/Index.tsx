
import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, PlayCircle, BookOpen, Users, Award, Monitor, Zap, Lock } from 'lucide-react';
import Navbar from '@/components/Navbar';
import HeroSection from '@/components/HeroSection';
import CourseCard from '@/components/CourseCard';
import FeatureList from '@/components/FeatureList';
import MembershipTier from '@/components/MembershipTier';

const courses = [
  {
    id: '1',
    title: 'デザイン思考の基礎から応用まで',
    instructor: '山田 太郎',
    category: 'デザイン',
    image: '/images/course1.jpg',
    duration: '6時間 30分',
    level: '中級者',
    isPremium: true,
  },
  {
    id: '2',
    title: 'Webアプリケーション開発実践講座',
    instructor: '佐藤 一郎',
    category: 'プログラミング',
    image: '/images/course2.jpg',
    duration: '8時間 45分',
    level: '上級者',
    isPremium: true,
  },
  {
    id: '3',
    title: 'デジタルマーケティングの最新トレンド',
    instructor: '鈴木 花子',
    category: 'マーケティング',
    image: '/images/course3.jpg',
    duration: '5時間 15分',
    level: '初級者',
    isPremium: false,
  },
];

const features = [
  {
    title: '高品質な動画コンテンツ',
    description: '4K画質とプロフェッショナルな編集で、クリアでわかりやすい学習体験を提供します。',
    icon: <PlayCircle className="h-6 w-6" />,
  },
  {
    title: '実践的なプロジェクト',
    description: '実際のプロジェクトに取り組みながら学べるため、理論だけでなく実践力も身につきます。',
    icon: <BookOpen className="h-6 w-6" />,
  },
  {
    title: 'エキスパート講師陣',
    description: '各分野のトッププロフェッショナルが、独自のノウハウと経験を惜しみなく共有します。',
    icon: <Users className="h-6 w-6" />,
  },
  {
    title: '修了証明書の発行',
    description: 'コース完了後に認定証を取得でき、あなたのスキルをアピールする証明になります。',
    icon: <Award className="h-6 w-6" />,
  },
  {
    title: 'オフライン再生対応',
    description: '動画をダウンロードしてオフラインで視聴できるため、どこでも学習を継続できます。',
    icon: <Monitor className="h-6 w-6" />,
  },
  {
    title: '迅速なコンテンツ更新',
    description: '常に最新の情報やトレンドを反映した内容で、時代に即したスキルが学べます。',
    icon: <Zap className="h-6 w-6" />,
  },
];

const Index = () => {
  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main>
        <HeroSection />
        
        {/* Featured courses */}
        <section className="py-16 md:py-24 bg-secondary/50">
          <div className="container-wide">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 md:mb-12">
              <div>
                <div className="chip mb-3">注目のコース</div>
                <h2 className="heading-3">人気コンテンツをチェック</h2>
              </div>
              <Button variant="ghost" size="sm" className="mt-4 sm:mt-0" asChild>
                <Link to="/courses" className="flex items-center">
                  すべてのコースを見る
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {courses.map((course, index) => (
                <CourseCard
                  key={course.id}
                  {...course}
                  className="animate-fade-up"
                  style={{ animationDelay: `${0.1 * index}s` }}
                />
              ))}
            </div>
          </div>
        </section>
        
        {/* Features */}
        <FeatureList
          title="スキルを加速する特徴"
          subtitle="MemoLearnは、効果的な学習体験を実現するための様々な機能を提供しています。"
          features={features}
        />
        
        {/* Membership plans */}
        <section className="py-16 md:py-24 bg-secondary/50">
          <div className="container-wide">
            <div className="max-w-3xl mx-auto text-center mb-12 md:mb-16">
              <div className="chip mb-3">会員プラン</div>
              <h2 className="heading-2 mb-4">あなたに合った学習プランを選択</h2>
              <p className="subheading">
                あなたの目標やペースに合わせて、最適なプランをお選びいただけます。
                いつでもプランの変更や解約が可能です。
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              <MembershipTier
                title="フリー"
                price="¥0"
                period="永久無料"
                description="学習を始めるための基本プラン"
                features={[
                  '厳選された無料コースへのアクセス',
                  'コミュニティへの参加',
                  'モバイル対応',
                  '基本的な学習トラッキング'
                ]}
                className="animate-fade-up"
                style={{ animationDelay: '0.1s' }}
              />
              
              <MembershipTier
                title="プロ"
                price="¥1,980"
                period="月額"
                description="すべての機能へのフルアクセス"
                features={[
                  'すべてのコースへの無制限アクセス',
                  'プロジェクト課題の評価とフィードバック',
                  'オフライン視聴',
                  '修了証明書の発行',
                  '優先サポート'
                ]}
                isPopular={true}
                className="animate-fade-up"
                style={{ animationDelay: '0.2s' }}
              />
              
              <MembershipTier
                title="チーム"
                price="¥8,980"
                period="月額"
                description="5名までのチーム向けプラン"
                features={[
                  'チームメンバー5名までご利用可能',
                  'すべてのコースへの無制限アクセス',
                  'チーム進捗管理ダッシュボード',
                  'カスタム学習パスの作成',
                  '専任サポートマネージャー'
                ]}
                className="animate-fade-up"
                style={{ animationDelay: '0.3s' }}
              />
            </div>
          </div>
        </section>
        
        {/* CTA section */}
        <section className="py-16 md:py-24">
          <div className="container-wide">
            <div className="bg-primary/5 border border-primary/20 rounded-2xl p-8 md:p-12 relative overflow-hidden">
              <div className="absolute right-0 bottom-0 opacity-10">
                <Lock className="w-64 h-64" />
              </div>
              
              <div className="relative z-10 max-w-2xl">
                <div className="chip bg-primary/20 text-primary mb-4">今すぐ始める</div>
                <h2 className="heading-2 mb-4">学びを止めない。<br />成長を止めない。</h2>
                <p className="subheading mb-8">
                  MemoLearnの会員になって、トップレベルの講師から学び、キャリアを次のステージへと導きましょう。
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button size="lg" asChild>
                    <Link to="/signup">
                      7日間無料トライアル
                    </Link>
                  </Button>
                  <Button variant="outline" size="lg" asChild>
                    <Link to="/courses">
                      コースを見る
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      {/* Footer */}
      <footer className="bg-secondary/70 border-t py-12 mt-auto">
        <div className="container-wide">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-bold mb-4">MemoLearn</h3>
              <p className="text-sm text-muted-foreground">
                プロフェッショナルから学ぶ、究極の動画学習プラットフォーム
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-3">コンテンツ</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/courses" className="text-muted-foreground hover:text-foreground">すべてのコース</Link></li>
                <li><Link to="/categories" className="text-muted-foreground hover:text-foreground">カテゴリー</Link></li>
                <li><Link to="/instructors" className="text-muted-foreground hover:text-foreground">講師一覧</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-3">MemoLearn</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/about" className="text-muted-foreground hover:text-foreground">会社情報</Link></li>
                <li><Link to="/careers" className="text-muted-foreground hover:text-foreground">採用情報</Link></li>
                <li><Link to="/blog" className="text-muted-foreground hover:text-foreground">ブログ</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-3">サポート</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/faq" className="text-muted-foreground hover:text-foreground">よくある質問</Link></li>
                <li><Link to="/contact" className="text-muted-foreground hover:text-foreground">お問い合わせ</Link></li>
                <li><Link to="/help" className="text-muted-foreground hover:text-foreground">ヘルプセンター</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-muted-foreground">
              © 2023 MemoLearn. All rights reserved.
            </p>
            
            <div className="mt-4 md:mt-0 flex items-center space-x-4">
              <Link to="/privacy" className="text-sm text-muted-foreground hover:text-foreground">
                プライバシーポリシー
              </Link>
              <Link to="/terms" className="text-sm text-muted-foreground hover:text-foreground">
                利用規約
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
