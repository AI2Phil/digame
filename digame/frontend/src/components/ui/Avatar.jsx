import React, { useState } from 'react';

// Main Avatar component
export const Avatar = ({ 
  src,
  alt = '',
  name = '',
  size = 'md', // xs, sm, md, lg, xl, 2xl
  variant = 'circular', // circular, rounded, square
  fallback,
  className = '',
  status,
  statusPosition = 'bottom-right', // top-left, top-right, bottom-left, bottom-right
  border = false,
  borderColor = 'white'
}) => {
  const [imageError, setImageError] = useState(false);

  const sizeClasses = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg',
    xl: 'w-16 h-16 text-xl',
    '2xl': 'w-20 h-20 text-2xl'
  };

  const variantClasses = {
    circular: 'rounded-full',
    rounded: 'rounded-lg',
    square: 'rounded-none'
  };

  const statusSizes = {
    xs: 'w-2 h-2',
    sm: 'w-2.5 h-2.5',
    md: 'w-3 h-3',
    lg: 'w-3.5 h-3.5',
    xl: 'w-4 h-4',
    '2xl': 'w-5 h-5'
  };

  const statusPositions = {
    'top-left': 'top-0 left-0',
    'top-right': 'top-0 right-0',
    'bottom-left': 'bottom-0 left-0',
    'bottom-right': 'bottom-0 right-0'
  };

  const statusColors = {
    online: 'bg-green-400',
    offline: 'bg-gray-400',
    away: 'bg-yellow-400',
    busy: 'bg-red-400'
  };

  const getInitials = (name) => {
    if (!name) return '';
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleImageError = () => {
    setImageError(true);
  };

  const showImage = src && !imageError;
  const initials = getInitials(name);

  return (
    <div className={`relative inline-block ${className}`}>
      <div className={`
        flex items-center justify-center overflow-hidden
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        ${border ? `ring-2 ring-${borderColor}` : ''}
        ${showImage ? '' : 'bg-gray-300 text-gray-600 font-medium'}
      `}>
        {showImage ? (
          <img
            src={src}
            alt={alt || name}
            className="w-full h-full object-cover"
            onError={handleImageError}
          />
        ) : fallback ? (
          fallback
        ) : initials ? (
          <span>{initials}</span>
        ) : (
          <svg className="w-2/3 h-2/3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
          </svg>
        )}
      </div>
      
      {status && (
        <div className={`
          absolute rounded-full border-2 border-white
          ${statusSizes[size]}
          ${statusPositions[statusPosition]}
          ${statusColors[status]}
        `} />
      )}
    </div>
  );
};

// Avatar Group
export const AvatarGroup = ({ 
  children,
  max = 3,
  size = 'md',
  className = '',
  spacing = 'normal', // tight, normal, loose
  showMore = true
}) => {
  const avatars = React.Children.toArray(children);
  const visibleAvatars = avatars.slice(0, max);
  const remainingCount = avatars.length - max;

  const spacingClasses = {
    tight: '-space-x-1',
    normal: '-space-x-2',
    loose: '-space-x-1'
  };

  return (
    <div className={`flex items-center ${spacingClasses[spacing]} ${className}`}>
      {visibleAvatars.map((avatar, index) => (
        <div key={index} className="relative">
          {React.cloneElement(avatar, { 
            size,
            border: true,
            className: 'ring-2 ring-white'
          })}
        </div>
      ))}
      
      {remainingCount > 0 && showMore && (
        <Avatar
          size={size}
          fallback={`+${remainingCount}`}
          className="ring-2 ring-white bg-gray-100 text-gray-600"
        />
      )}
    </div>
  );
};

// Avatar with Name
export const AvatarWithName = ({ 
  src,
  name,
  subtitle,
  size = 'md',
  layout = 'horizontal', // horizontal, vertical
  className = '',
  ...avatarProps
}) => {
  const layoutClasses = {
    horizontal: 'flex items-center space-x-3',
    vertical: 'flex flex-col items-center space-y-2'
  };

  const textAlignClasses = {
    horizontal: 'text-left',
    vertical: 'text-center'
  };

  return (
    <div className={`${layoutClasses[layout]} ${className}`}>
      <Avatar src={src} name={name} size={size} {...avatarProps} />
      <div className={textAlignClasses[layout]}>
        <div className="text-sm font-medium text-gray-900">{name}</div>
        {subtitle && (
          <div className="text-xs text-gray-500">{subtitle}</div>
        )}
      </div>
    </div>
  );
};

// Clickable Avatar
export const ClickableAvatar = ({ 
  onClick,
  href,
  className = '',
  ...avatarProps
}) => {
  const baseClasses = `
    cursor-pointer transition-transform duration-200
    hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
  `;

  const content = <Avatar className={`${baseClasses} ${className}`} {...avatarProps} />;

  if (href) {
    return (
      <a href={href} className="inline-block">
        {content}
      </a>
    );
  }

  return (
    <button onClick={onClick} className="inline-block">
      {content}
    </button>
  );
};

// Avatar with Badge
export const AvatarWithBadge = ({ 
  badge,
  badgePosition = 'bottom-right',
  className = '',
  ...avatarProps
}) => {
  const badgePositions = {
    'top-left': 'top-0 left-0 transform -translate-x-1/2 -translate-y-1/2',
    'top-right': 'top-0 right-0 transform translate-x-1/2 -translate-y-1/2',
    'bottom-left': 'bottom-0 left-0 transform -translate-x-1/2 translate-y-1/2',
    'bottom-right': 'bottom-0 right-0 transform translate-x-1/2 translate-y-1/2'
  };

  return (
    <div className={`relative inline-block ${className}`}>
      <Avatar {...avatarProps} />
      {badge && (
        <div className={`absolute ${badgePositions[badgePosition]}`}>
          {badge}
        </div>
      )}
    </div>
  );
};

// Avatar Stack (overlapping avatars)
export const AvatarStack = ({ 
  children,
  max = 4,
  size = 'md',
  className = '',
  reverse = false
}) => {
  const avatars = React.Children.toArray(children);
  const visibleAvatars = avatars.slice(0, max);
  const remainingCount = avatars.length - max;

  return (
    <div className={`flex ${reverse ? 'flex-row-reverse' : ''} ${className}`}>
      {visibleAvatars.map((avatar, index) => (
        <div 
          key={index} 
          className={`
            ${index > 0 ? (reverse ? 'mr-2' : '-ml-2') : ''}
            relative z-${10 + index}
          `}
        >
          {React.cloneElement(avatar, { 
            size,
            border: true,
            className: 'ring-2 ring-white'
          })}
        </div>
      ))}
      
      {remainingCount > 0 && (
        <div className={`${reverse ? 'mr-2' : '-ml-2'} relative z-${10 + visibleAvatars.length}`}>
          <Avatar
            size={size}
            fallback={`+${remainingCount}`}
            className="ring-2 ring-white bg-gray-100 text-gray-600"
          />
        </div>
      )}
    </div>
  );
};

// Animated Avatar
export const AnimatedAvatar = ({ 
  animation = 'pulse', // pulse, bounce, spin, ping
  className = '',
  ...avatarProps
}) => {
  const animationClasses = {
    pulse: 'animate-pulse',
    bounce: 'animate-bounce',
    spin: 'animate-spin',
    ping: 'animate-ping'
  };

  return (
    <Avatar 
      className={`${animationClasses[animation]} ${className}`} 
      {...avatarProps} 
    />
  );
};

// Avatar Placeholder
export const AvatarPlaceholder = ({ 
  size = 'md',
  variant = 'circular',
  className = ''
}) => {
  const sizeClasses = {
    xs: 'w-6 h-6',
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
    '2xl': 'w-20 h-20'
  };

  const variantClasses = {
    circular: 'rounded-full',
    rounded: 'rounded-lg',
    square: 'rounded-none'
  };

  return (
    <div className={`
      bg-gray-200 animate-pulse
      ${sizeClasses[size]}
      ${variantClasses[variant]}
      ${className}
    `} />
  );
};

// Avatar Upload
export const AvatarUpload = ({ 
  src,
  onUpload,
  size = 'xl',
  className = '',
  ...avatarProps
}) => {
  const [dragOver, setDragOver] = useState(false);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      onUpload?.(files[0]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleFileInput = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      onUpload?.(files[0]);
    }
  };

  return (
    <div className={`relative group ${className}`}>
      <Avatar src={src} size={size} {...avatarProps} />
      
      <div
        className={`
          absolute inset-0 flex items-center justify-center
          bg-black bg-opacity-50 rounded-full opacity-0 group-hover:opacity-100
          transition-opacity duration-200 cursor-pointer
          ${dragOver ? 'opacity-100 bg-opacity-70' : ''}
        `}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <label className="cursor-pointer">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileInput}
            className="hidden"
          />
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </label>
      </div>
    </div>
  );
};

export default Avatar;