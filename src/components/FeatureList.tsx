
import React from 'react';
import { cn } from '@/lib/utils';

interface Feature {
  title: string;
  description: string;
  icon: React.ReactNode;
}

interface FeatureListProps {
  title: string;
  subtitle: string;
  features: Feature[];
  className?: string;
}

const FeatureList: React.FC<FeatureListProps> = ({
  title,
  subtitle,
  features,
  className,
}) => {
  return (
    <section className={cn("py-16 md:py-24", className)}>
      <div className="container-wide">
        <div className="max-w-3xl mx-auto text-center mb-12 md:mb-16">
          <h2 className="heading-2 mb-4">{title}</h2>
          <p className="subheading">{subtitle}</p>
        </div>
        
        <div className="grid gap-8 md:grid-cols-3">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="bg-background border rounded-xl p-6 transition-all duration-300 hover:shadow-md hover:-translate-y-1"
            >
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 text-primary">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeatureList;
