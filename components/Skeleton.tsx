import React from 'react';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
}

export const Skeleton: React.FC<SkeletonProps> = ({ 
  className = '', 
  variant = 'rectangular',
  width,
  height 
}) => {
  const baseClasses = 'animate-pulse bg-gradient-to-r from-rose-100 via-rose-50 to-rose-100 bg-[length:200%_100%]';
  
  const variantClasses = {
    text: 'rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-xl'
  };

  return (
    <div 
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      style={{ width, height }}
    />
  );
};

export const ProductCardSkeleton: React.FC = () => (
  <div className="bg-white rounded-2xl md:rounded-3xl overflow-hidden border border-rose-100 shadow-sm">
    <Skeleton className="aspect-[4/5] w-full" />
    <div className="p-2 md:p-4 space-y-2">
      <Skeleton variant="text" className="h-4 w-3/4" />
      <Skeleton variant="text" className="h-5 w-1/3" />
      <div className="flex justify-between">
        <Skeleton variant="text" className="h-3 w-1/4" />
        <Skeleton variant="circular" className="h-4 w-8" />
      </div>
    </div>
  </div>
);

export default Skeleton;
