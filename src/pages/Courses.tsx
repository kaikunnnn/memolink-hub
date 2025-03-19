
import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import CourseCard from '@/components/CourseCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Filter, ChevronDown } from 'lucide-react';

const coursesData = [
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
  {
    id: '4',
    title: 'データ分析と可視化の実践テクニック',
    instructor: '中村 健太',
    category: 'データサイエンス',
    image: '/images/course1.jpg',
    duration: '7時間 20分',
    level: '中級者',
    isPremium: true,
  },
  {
    id: '5',
    title: 'モバイルアプリUXデザイン講座',
    instructor: '田中 美咲',
    category: 'デザイン',
    image: '/images/course2.jpg',
    duration: '6時間 10分',
    level: '初級者',
    isPremium: false,
  },
  {
    id: '6',
    title: 'AIと機械学習の基礎概念',
    instructor: '高橋 誠',
    category: 'AI・機械学習',
    image: '/images/course3.jpg',
    duration: '9時間 15分',
    level: '上級者',
    isPremium: true,
  },
];

const categories = [
  'すべて',
  'デザイン',
  'プログラミング',
  'マーケティング',
  'データサイエンス',
  'AI・機械学習',
  'ビジネス',
];

const levels = ['すべて', '初級者', '中級者', '上級者'];

const Courses = () => {
  const [filteredCourses, setFilteredCourses] = useState(coursesData);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('すべて');
  const [selectedLevel, setSelectedLevel] = useState('すべて');
  const [filtersOpen, setFiltersOpen] = useState(false);
  
  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  
  // Filter courses based on search query, category, and level
  useEffect(() => {
    let result = coursesData;
    
    // Filter by search query
    if (searchQuery) {
      result = result.filter(course => 
        course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.instructor.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Filter by category
    if (selectedCategory !== 'すべて') {
      result = result.filter(course => course.category === selectedCategory);
    }
    
    // Filter by level
    if (selectedLevel !== 'すべて') {
      result = result.filter(course => course.level === selectedLevel);
    }
    
    setFilteredCourses(result);
  }, [searchQuery, selectedCategory, selectedLevel]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="pt-16 flex-grow">
        {/* Header */}
        <section className="bg-secondary/50 border-b py-16 md:py-24">
          <div className="container-wide">
            <div className="max-w-3xl">
              <div className="chip mb-3 animate-fade-in">コース一覧</div>
              <h1 className="heading-2 mb-4 animate-fade-up" style={{ animationDelay: '0.1s' }}>
                あなたのスキルを高める<br className="sm:hidden" />すべてのコース
              </h1>
              <p className="subheading animate-fade-up" style={{ animationDelay: '0.2s' }}>
                様々な分野のプロフェッショナルが教える高品質なコースをご覧ください。
                初級者から上級者まで、あなたのレベルに合ったコンテンツが見つかります。
              </p>
            </div>
          </div>
        </section>
        
        {/* Search and filters */}
        <section className="py-8 border-b sticky top-16 md:top-20 bg-background/80 backdrop-blur-lg z-10">
          <div className="container-wide">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-grow">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  type="search"
                  placeholder="コースを検索..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <div className="flex flex-col sm:flex-row gap-2">
                <Button 
                  variant="outline" 
                  className="md:hidden flex items-center justify-between"
                  onClick={() => setFiltersOpen(!filtersOpen)}
                >
                  <div className="flex items-center">
                    <Filter className="h-4 w-4 mr-2" />
                    フィルター
                  </div>
                  <ChevronDown className={`h-4 w-4 transition-transform ${filtersOpen ? 'rotate-180' : ''}`} />
                </Button>
                
                <div className={`md:flex gap-2 ${filtersOpen ? 'block' : 'hidden'}`}>
                  <select
                    className="bg-secondary text-secondary-foreground px-4 py-2 rounded-md border border-border"
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                  >
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                  
                  <select
                    className="bg-secondary text-secondary-foreground px-4 py-2 rounded-md border border-border"
                    value={selectedLevel}
                    onChange={(e) => setSelectedLevel(e.target.value)}
                  >
                    {levels.map((level) => (
                      <option key={level} value={level}>
                        {level}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Course grid */}
        <section className="py-12 md:py-16">
          <div className="container-wide">
            <div className="mb-8">
              <p className="text-muted-foreground">
                {filteredCourses.length} コースが見つかりました
              </p>
            </div>
            
            {filteredCourses.length > 0 ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                {filteredCourses.map((course, index) => (
                  <CourseCard
                    key={course.id}
                    {...course}
                    className="animate-fade-up"
                    style={{ animationDelay: `${0.05 * index}s` }}
                  />
                ))}
              </div>
            ) : (
              <div className="py-16 text-center animate-fade-in">
                <h3 className="text-xl font-medium mb-2">検索結果が見つかりませんでした</h3>
                <p className="text-muted-foreground mb-6">検索条件を変更してお試しください。</p>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('すべて');
                    setSelectedLevel('すべて');
                  }}
                >
                  フィルターをリセット
                </Button>
              </div>
            )}
          </div>
        </section>
      </main>
      
      {/* Footer */}
      <footer className="bg-secondary/70 border-t py-12">
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
                <li><a href="#" className="text-muted-foreground hover:text-foreground">すべてのコース</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-foreground">カテゴリー</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-foreground">講師一覧</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-3">MemoLearn</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-muted-foreground hover:text-foreground">会社情報</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-foreground">採用情報</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-foreground">ブログ</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-3">サポート</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-muted-foreground hover:text-foreground">よくある質問</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-foreground">お問い合わせ</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-foreground">ヘルプセンター</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-muted-foreground">
              © 2023 MemoLearn. All rights reserved.
            </p>
            
            <div className="mt-4 md:mt-0 flex items-center space-x-4">
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground">
                プライバシーポリシー
              </a>
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground">
                利用規約
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Courses;
