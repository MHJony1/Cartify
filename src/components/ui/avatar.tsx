import React from 'react';

interface AvatarProps {
  image?: string | null;
  name?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function Avatar({ image, name = 'User', size = 'md', className = '' }: AvatarProps) {
  const getInitials = (nameStr: string) => {
    const parts = nameStr.split(' ').filter(Boolean);
    if (parts.length === 0) return 'U';
    if (parts.length === 1) return parts[0][0].toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const sizeClasses = {
    sm: 'w-8 h-8 text-[10px]',
    md: 'w-10 h-10 text-xs',
    lg: 'w-12 h-12 text-sm',
  };

  return (
    <div 
      className={`relative rounded-full overflow-hidden flex items-center justify-center bg-neutral-100 border border-neutral-200 text-black font-semibold tracking-widest flex-shrink-0 ${sizeClasses[size]} ${className}`}
    >
      {image ? (
        <img 
          src={image} 
          alt={name} 
          className="w-full h-full object-cover" 
          onError={(e) => {
            // fallback if image fails to load
            (e.target as HTMLImageElement).style.display = 'none';
            (e.target as HTMLImageElement).parentElement?.classList.add('fallback-visible');
          }}
        />
      ) : null}
      
      {/* Initials fallback (shown if no image, or if image fails via CSS trick) */}
      <span className={image ? "hidden [.fallback-visible_&]:inline" : ""}>
        {getInitials(name)}
      </span>
    </div>
  );
}
