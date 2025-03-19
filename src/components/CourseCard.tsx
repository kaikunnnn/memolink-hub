
import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Play } from 'lucide-react';

interface CourseCardProps {
  id: string;
  title: string;
  instructor: string;
  category: string;
  image: string;
  duration: string;
  level: string;
  isPremium?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

const CourseCard: React.FC<CourseCardProps> = ({
  id,
  title,
  instructor,
  category,
  image,
  duration,
  level,
  isPremium = false,
  className,
  style,
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const imageRef = useRef<HTMLImageElement>(null);
  
  useEffect(() => {
    if (imageRef.current && imageRef.current.complete) {
      setIsLoaded(true);
    }
  }, []);
  
  return (
    <Link 
      to={`/courses/${id}`}
      className={`block rounded-xl overflow-hidden hover-card ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={style}
    >
      <div className={`image-container aspect-video relative ${isLoaded ? 'image-loaded' : ''}`}>
        <div className="image-blur-wrapper">
          <img 
            src={image} 
            alt={title}
            className="w-full h-full object-cover"
            aria-hidden="true"
          />
        </div>
        <img
          ref={imageRef}
          src={image}
          alt={title}
          className="image-main w-full h-full object-cover"
          onLoad={() => setIsLoaded(true)}
        />
        <div 
          className={`absolute inset-0 bg-black/20 flex items-center justify-center transition-opacity duration-300 ${
            isHovered ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <div className="bg-white rounded-full p-3 shadow-lg transform transition-transform duration-300 hover:scale-110">
            <Play className="h-6 w-6 text-primary fill-primary" />
          </div>
        </div>
        {isPremium && (
          <div className="absolute top-3 right-3">
            <div className="chip bg-primary text-primary-foreground">
              プレミアム
            </div>
          </div>
        )}
      </div>
      <div className="p-4">
        <div className="chip mb-2">{category}</div>
        <h3 className="font-semibold mb-1 line-clamp-2">{title}</h3>
        <p className="text-sm text-muted-foreground mb-2">{instructor}</p>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{duration}</span>
          <span>{level}</span>
        </div>
      </div>
    </Link>
  );
};

export default CourseCard;
