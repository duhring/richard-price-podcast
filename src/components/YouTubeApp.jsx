import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, RotateCcw, Upload, Download } from 'lucide-react';

const YouTubeApp = ({ appData, audioFile }) => {
  const [currentSection, setCurrentSection] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [audioSrc, setAudioSrc] = useState(audioFile);
  const audioRef = useRef(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      let timeUpdateThrottle = null;
      
      const updateTime = () => {
        if (timeUpdateThrottle) return;
        timeUpdateThrottle = setTimeout(() => {
          setCurrentTime(audio.currentTime);
          timeUpdateThrottle = null;
        }, 100);
      };
      
      const updateDuration = () => setDuration(audio.duration);
      const handleEnded = () => setIsPlaying(false);
      
      audio.addEventListener('timeupdate', updateTime);
      audio.addEventListener('loadedmetadata', updateDuration);
      audio.addEventListener('ended', handleEnded);
      
      return () => {
        if (timeUpdateThrottle) clearTimeout(timeUpdateThrottle);
        audio.removeEventListener('timeupdate', updateTime);
        audio.removeEventListener('loadedmetadata', updateDuration);
        audio.removeEventListener('ended', handleEnded);
      };
    }
  }, [audioSrc]);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      const currentSectionIndex = appData.sections.findIndex(
        section => currentTime >= section.startTime && currentTime < section.endTime
      );
      if (currentSectionIndex !== -1 && currentSectionIndex !== currentSection) {
        setCurrentSection(currentSectionIndex);
      }
    }, 50);
    
    return () => clearTimeout(debounceTimer);
  }, [currentTime, currentSection, appData.sections]);

  const togglePlayPause = useCallback(() => {
    const audio = audioRef.current;
    if (audio && audioSrc) {
      if (isPlaying) {
        audio.pause();
      } else {
        audio.play().catch(console.error);
      }
      setIsPlaying(!isPlaying);
    }
  }, [isPlaying, audioSrc]);

  const seekToSection = useCallback((sectionIndex) => {
    const audio = audioRef.current;
    if (audio && audioSrc && sectionIndex >= 0 && sectionIndex < appData.sections.length) {
      audio.currentTime = appData.sections[sectionIndex].startTime;
      setCurrentSection(sectionIndex);
      audio.play().catch(console.error);
      setIsPlaying(true);
    }
  }, [audioSrc, appData.sections]);

  const navigateSection = useCallback((direction) => {
    let newIndex;
    if (direction === 'prev') {
      newIndex = Math.max(0, currentSection - 1);
    } else if (direction === 'next') {
      newIndex = Math.min(appData.sections.length - 1, currentSection + 1);
    }
    
    if (newIndex !== undefined && newIndex !== currentSection) {
      seekToSection(newIndex);
    }
  }, [currentSection, seekToSection, appData.sections.length]);

  const handleAudioUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setAudioSrc(url);
    }
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const currentSectionData = appData.sections[currentSection] || appData.sections[0];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">{appData.title}</h1>
          <p className="text-gray-600">Interactive YouTube Transcript Walkthrough</p>
          <a 
            href={appData.videoUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 underline mt-2 inline-block"
          >
            View Original Video
          </a>
        </header>

        {!audioSrc && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8">
            <h3 className="text-lg font-semibold text-yellow-800 mb-2">Audio Required</h3>
            <p className="text-yellow-700 mb-4">
              Please upload an audio file extracted from the YouTube video to enable playback.
            </p>
            <label className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer">
              <Upload className="w-4 h-4 mr-2" />
              Upload Audio File
              <input
                type="file"
                accept="audio/*"
                onChange={handleAudioUpload}
                className="hidden"
              />
            </label>
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                {currentSectionData.title}
              </h2>
              <div className="prose prose-lg text-gray-700">
                <p>{currentSectionData.text}</p>
              </div>
              <div className="mt-4 text-sm text-gray-500">
                Section {currentSection + 1} of {appData.sections.length} • 
                {formatTime(currentSectionData.startTime)} - {formatTime(currentSectionData.endTime)}
              </div>
            </div>

            {audioSrc && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <audio ref={audioRef} src={audioSrc} preload="metadata" />
                
                <div className="flex items-center justify-center space-x-4 mb-6">
                  <button
                    onClick={() => navigateSection('prev')}
                    className="p-3 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
                    disabled={currentSection === 0}
                  >
                    <SkipBack className="w-5 h-5" />
                  </button>
                  
                  <button
                    onClick={togglePlayPause}
                    className="p-4 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-110 active:scale-95"
                  >
                    {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-0.5" />}
                  </button>
                  
                  <button
                    onClick={() => navigateSection('next')}
                    className="p-3 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
                    disabled={currentSection === appData.sections.length - 1}
                  >
                    <SkipForward className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(duration)}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-200"
                      style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Sections</h3>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {appData.sections.map((section, index) => (
                <button
                  key={index}
                  onClick={() => seekToSection(index)}
                  className={`w-full text-left p-4 rounded-lg transition-all duration-200 ${
                    index === currentSection
                      ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md'
                      : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-semibold mb-1">{section.title}</h4>
                      <p className={`text-sm line-clamp-2 ${
                        index === currentSection ? 'text-blue-100' : 'text-gray-600'
                      }`}>
                        {section.text}
                      </p>
                    </div>
                    <span className={`text-xs ml-2 ${
                      index === currentSection ? 'text-blue-200' : 'text-gray-500'
                    }`}>
                      {formatTime(section.startTime)}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default YouTubeApp;
