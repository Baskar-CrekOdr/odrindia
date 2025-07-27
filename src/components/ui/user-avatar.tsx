"use client";

import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

interface UserAvatarProps {
  user?: {
    name?: string;
    imageAvatar?: string | null;
  };
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  fallbackClassName?: string;
}

const sizeClasses = {
  xs: 'h-6 w-6',
  sm: 'h-8 w-8',
  md: 'h-10 w-10',
  lg: 'h-12 w-12',
  xl: 'h-16 w-16',
};

const fallbackSizeClasses = {
  xs: 'text-xs',
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg',
  xl: 'text-xl',
};

export function UserAvatar({ 
  user, 
  className, 
  size = 'md', 
  fallbackClassName 
}: UserAvatarProps) {
  const initials = user?.name
    ?.split(' ')
    .map(n => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'U';

  const avatarSrc = user?.imageAvatar || 
    `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user?.name || 'User')}`;

  return (
    <Avatar className={cn(sizeClasses[size], className)}>
      <AvatarImage
        src={avatarSrc}
        alt={user?.name || 'User'}
        className="object-cover"
      />
      <AvatarFallback 
        className={cn(
          'font-semibold bg-gradient-to-br from-blue-500 to-indigo-600 text-white',
          fallbackSizeClasses[size],
          fallbackClassName
        )}
      >
        {initials}
      </AvatarFallback>
    </Avatar>
  );
}
