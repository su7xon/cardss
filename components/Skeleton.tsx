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

export const TestimonialCardSkeleton: React.FC = () => (
  <div className="bg-white p-6 md:p-8 rounded-2xl border border-rose-100 shadow-sm">
    <div className="flex gap-1 mb-4">
      {[1, 2, 3, 4, 5].map(i => (
        <Skeleton key={i} variant="circular" className="w-4 h-4" />
      ))}
    </div>
    <Skeleton variant="text" className="h-4 w-full mb-2" />
    <Skeleton variant="text" className="h-4 w-4/5 mb-6" />
    <div className="flex items-center gap-3">
      <Skeleton variant="circular" className="w-10 h-10" />
      <div>
        <Skeleton variant="text" className="h-4 w-24 mb-1" />
        <Skeleton variant="text" className="h-3 w-16" />
      </div>
    </div>
  </div>
);

export const ServiceCardSkeleton: React.FC = () => (
  <div className="bg-white border border-rose-100 rounded-xl md:rounded-2xl p-3 md:p-6">
    <div className="flex justify-between items-start mb-3">
      <Skeleton variant="text" className="h-4 w-20" />
      <Skeleton variant="circular" className="w-8 h-8" />
    </div>
    <Skeleton variant="text" className="h-5 w-3/4 mb-2" />
    <Skeleton variant="text" className="h-3 w-full mb-1" />
    <Skeleton variant="text" className="h-3 w-2/3 mb-4" />
    <div className="flex justify-between items-center mt-auto">
      <Skeleton variant="text" className="h-6 w-16" />
      <Skeleton variant="text" className="h-4 w-12" />
    </div>
  </div>
);

export const CategoryCardSkeleton: React.FC = () => (
  <div className="bg-white p-4 md:p-8 rounded-2xl md:rounded-3xl border border-rose-100 text-center">
    <Skeleton variant="circular" className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-3 md:mb-4" />
    <Skeleton variant="text" className="h-5 w-24 mx-auto mb-2" />
    <Skeleton variant="text" className="h-3 w-32 mx-auto" />
  </div>
);

export default Skeleton;
