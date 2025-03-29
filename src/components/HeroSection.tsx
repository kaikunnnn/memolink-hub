
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ChevronRight, ArrowRight } from 'lucide-react';

interface HeroSectionProps {
  className?: string;
}

const HeroSection: React.FC<HeroSectionProps> = ({ className }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <section className={`relative overflow-hidden ${className}`}>
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20" />
      
      {/* Background patterns */}
      <div className="absolute inset-0 opacity-[0.03]" style={{ 
        backgroundImage: 'radial-gradient(circle at 25px 25px, black 2%, transparent 0%), radial-gradient(circle at 75px 75px, black 2%, transparent 0%)',
        backgroundSize: '100px 100px' 
      }} />
      
      <div className="container-wide relative pt-32 pb-20 md:pt-40 md:pb-32">
        <div className="max-w-3xl mx-auto text-center">
          <div 
            className="inline-block chip animate-fade-in bg-primary/10 text-primary font-medium mb-4" 
            style={{ animationDelay: '0.2s' }}
          >
            新しい学びの形
          </div>
          
          <h1 
            className="heading-1 mb-6 animate-fade-up"
            style={{ animationDelay: '0.3s' }}
          >
            プロから学ぶ、<br className="sm:hidden" />
            <span className="text-primary">究極の動画学習体験</span>
          </h1>
          
          <p 
            className="subheading max-w-2xl mx-auto mb-8 animate-fade-up"
            style={{ animationDelay: '0.4s' }}
          >
            トップクリエイターやプロフェッショナルが教える高品質な動画コースで、
            あなたのスキルを次のレベルへ。いつでもどこでも、自分のペースで学べます。
          </p>
          
          <div 
            className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-up"
            style={{ animationDelay: '0.5s' }}
          >
            <Button 
              size="lg" 
              className="relative overflow-hidden group w-full sm:w-auto"
              asChild
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              <Link to="/signup">
                <span className="relative z-10 flex items-center justify-center">
                  無料で始める
                  <span className={`transition-all duration-300 ml-1 ${isHovered ? 'opacity-0 -translate-x-2' : 'opacity-100'}`}>
                    <ChevronRight className="h-4 w-4" />
                  </span>
                  <span className={`absolute transition-all duration-300 ${isHovered ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-2'}`}>
                    <ArrowRight className="h-4 w-4" />
                  </span>
                </span>
              </Link>
            </Button>
            
            <Button 
              variant="outline" 
              size="lg" 
              className="w-full sm:w-auto"
              asChild
            >
              <Link to="/courses">コースを見る</Link>
            </Button>
          </div>
        </div>
        
        {/* Stats */}
        <div 
          className="mt-16 md:mt-24 grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 max-w-4xl mx-auto animate-fade-up"
          style={{ animationDelay: '0.6s' }}
        >
          {[
            { value: '200+', label: '高品質コース' },
            { value: '50+', label: 'トップ講師陣' },
            { value: '10万+', label: '受講生' },
            { value: '98%', label: '満足度' },
          ].map((stat, index) => (
            <div 
              key={index} 
              className="text-center p-4 bg-white/50 dark:bg-white/5 backdrop-blur-sm rounded-xl border border-border/50"
            >
              <div className="font-bold text-2xl md:text-3xl text-primary">{stat.value}</div>
              <div className="text-sm md:text-base text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
