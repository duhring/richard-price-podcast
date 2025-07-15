import React from 'react';
import { PlaceholderImage } from '../utils/placeholderGenerator';

export const VideoSnippet = ({ 
  sectionIndex, 
  sectionData, 
  snippetUrl, 
  className = "w-full h-72",
  autoPlay = false,
  muted = true,
  controls = false 
}) => {
  if (!snippetUrl) {
    return (
      <PlaceholderImage 
        sectionIndex={sectionIndex}
        sectionData={sectionData}
        className={className}
      />
    );
  }

  return (
    <video
      className={className}
      src={snippetUrl}
      autoPlay={autoPlay}
      muted={muted}
      controls={controls}
      loop={true}
      style={{
        objectFit: 'cover',
        borderRadius: '0.5rem'
      }}
      onError={() => {
        console.error(`Failed to load video snippet: ${snippetUrl}`);
      }}
    >
      Your browser does not support the video tag.
    </video>
  );
};
