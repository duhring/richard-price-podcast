import React from 'react';
import { Volume2, Play, Mic, Headphones, Radio, Music } from 'lucide-react';

const icons = [Volume2, Play, Mic, Headphones, Radio, Music];
const gradientStyles = [
  { background: 'linear-gradient(135deg, #dbeafe 0%, #e0e7ff 100%)', primary: '#1d4ed8', secondary: '#3b82f6' },
  { background: 'linear-gradient(135deg, #fdf2f8 0%, #fce7f3 100%)', primary: '#be185d', secondary: '#ec4899' },
  { background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)', primary: '#059669', secondary: '#10b981' },
  { background: 'linear-gradient(135deg, #fff7ed 0%, #fed7aa 100%)', primary: '#ea580c', secondary: '#f97316' },
  { background: 'linear-gradient(135deg, #f0fdfa 0%, #ccfbf1 100%)', primary: '#0f766e', secondary: '#14b8a6' },
  { background: 'linear-gradient(135deg, #faf5ff 0%, #e9d5ff 100%)', primary: '#7c3aed', secondary: '#8b5cf6' }
];

const formatTime = (time) => {
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

export const PlaceholderImage = ({ sectionIndex, sectionData, className = "w-full h-72" }) => {
  const iconIndex = sectionIndex % icons.length;
  const gradientIndex = sectionIndex % gradientStyles.length;
  const IconComponent = icons[iconIndex];
  const gradientStyle = gradientStyles[gradientIndex];
  
  const title = `Section ${sectionIndex + 1}`;
  const timeRange = `${formatTime(sectionData.startTime)} - ${formatTime(sectionData.endTime)}`;
  const description = sectionData.title;
  
  const containerStyle = {
    background: gradientStyle.background,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
    borderRadius: '0.5rem'
  };
  
  const iconContainerStyle = {
    width: '4rem',
    height: '4rem',
    margin: '0 auto 1rem auto',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    backdropFilter: 'blur(4px)',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  };
  
  const titleStyle = {
    color: gradientStyle.primary,
    fontWeight: 'bold',
    fontSize: '1.125rem',
    marginBottom: '0.25rem'
  };
  
  const timeStyle = {
    color: gradientStyle.secondary,
    fontSize: '0.875rem',
    fontWeight: '500',
    marginBottom: '0.5rem'
  };
  
  const descriptionStyle = {
    color: gradientStyle.primary,
    fontSize: '0.75rem',
    maxWidth: '20rem',
    overflow: 'hidden',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical'
  };
  
  return (
    <div className={className} style={containerStyle}>
      <div style={{ textAlign: 'center', padding: '1.5rem' }}>
        <div style={iconContainerStyle}>
          <IconComponent size={32} color={gradientStyle.secondary} />
        </div>
        <p style={titleStyle}>{title}</p>
        <p style={timeStyle}>{timeRange}</p>
        <p style={descriptionStyle}>{description}</p>
      </div>
    </div>
  );
};
