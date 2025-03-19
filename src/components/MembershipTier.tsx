
import React from 'react';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MembershipTierProps {
  title: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  isPopular?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

const MembershipTier: React.FC<MembershipTierProps> = ({
  title,
  price,
  period,
  description,
  features,
  isPopular = false,
  className,
  style,
}) => {
  return (
    <div 
      className={cn(
        "relative rounded-2xl overflow-hidden transition-all duration-300",
        isPopular 
          ? "border-2 border-primary shadow-lg shadow-primary/10" 
          : "border border-border hover:border-primary/30 hover:shadow-md",
        className
      )}
      style={style}
    >
      {isPopular && (
        <div className="absolute top-0 right-0 bg-primary py-1 px-3 text-xs font-medium text-primary-foreground">
          おすすめ
        </div>
      )}
      
      <div className="p-6 md:p-8">
        <h3 className="text-xl font-semibold mb-2">{title}</h3>
        <p className="text-muted-foreground text-sm mb-4">{description}</p>
        
        <div className="mb-6">
          <div className="flex items-end">
            <span className="text-3xl md:text-4xl font-bold">{price}</span>
            <span className="text-muted-foreground ml-2">/ {period}</span>
          </div>
        </div>
        
        <Button 
          className={cn(
            "w-full mb-6",
            !isPopular && "bg-secondary text-secondary-foreground hover:bg-secondary/80"
          )}
        >
          今すぐ登録
        </Button>
        
        <div className="space-y-3">
          {features.map((feature, index) => (
            <div key={index} className="flex items-start">
              <div className="flex-shrink-0 mt-1">
                <Check className="h-4 w-4 text-primary" />
              </div>
              <span className="ml-3 text-sm">{feature}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MembershipTier;
