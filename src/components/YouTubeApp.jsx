import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, RotateCcw, Upload, Download, Loader2 } from 'lucide-react';
import { VideoSnippet } from './VideoSnippet';

const YouTubeApp = ({ appData, audioFile }) => {
  const [currentSection, setCurrentSection] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [audioSrc, setAudioSrc] = useState(audioFile);
  const [isUploading, setIsUploading] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [isGeneratingSnippets, setIsGeneratingSnippets] = useState(false);
  const [extractionError, setExtractionError] = useState(null);
  const [videoSnippets, setVideoSnippets] = useState({});
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
      setExtractionError(null);
    }
  };

  const handleVideoUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    console.log('Starting video upload:', file.name);
    setIsUploading(true);
    setIsExtracting(false);
    setIsGeneratingSnippets(false);
    setExtractionError(null);

    try {
      const formData = new FormData();
      formData.append('video', file);

      console.log('Uploading video file...');
      const backendUrl = `${window.location.protocol}//${window.location.hostname}:3001`;
      const response = await fetch(`${backendUrl}/api/upload-video`, {
        method: 'POST',
        body: formData,
      });

      setIsUploading(false);
      setIsExtracting(true);
      
      console.log('Backend response status:', response.status);
      const result = await response.json();
      console.log('Backend response data:', result);

      if (result.success) {
        console.log('Setting audio source to:', result.audio_file);
        const audioPath = `${backendUrl}${result.audio_file}`;
        setAudioSrc(audioPath);
        setExtractionError(null);
        
        setIsExtracting(false);
        setIsGeneratingSnippets(true);
        
        console.log('Generating video snippets...');
        const snippetResponse = await fetch(`${backendUrl}/api/generate-video-snippets`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            videoFileName: result.video_file,
            sections: appData.sections
          }),
        });
        
        const snippetResult = await snippetResponse.json();
        console.log('Snippet generation result:', snippetResult);
        
        if (snippetResult.success) {
          const snippetsMap = {};
          snippetResult.snippets.forEach(snippet => {
            const snippetPath = `${backendUrl}${snippet.snippetUrl}`;
            snippetsMap[snippet.sectionIndex] = snippetPath;
          });
          setVideoSnippets(snippetsMap);
          console.log('Video snippets generated successfully');
        } else {
          console.error('Snippet generation failed:', snippetResult.error);
          setExtractionError(`Snippet generation failed: ${snippetResult.error}`);
        }
      } else {
        console.error('Upload failed:', result.error);
        setExtractionError(result.error || 'Failed to extract audio from video');
      }
    } catch (error) {
      console.error('Video upload error:', error);
      setExtractionError(`Video upload failed: ${error.message}`);
    } finally {
      console.log('Upload process completed');
      setIsUploading(false);
      setIsExtracting(false);
      setIsGeneratingSnippets(false);
    }
  };

  const extractAudioFromVideo = useCallback(async () => {
    setIsExtracting(true);
    setExtractionError(null);
    
    try {
      const apiUrl = `${window.location.protocol}//${window.location.host}/api/extract-audio`;
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          videoUrl: appData.videoUrl 
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to extract audio: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.success && result.audio_file) {
        const audioUrl = result.audio_file.replace('./public', '');
        setAudioSrc(audioUrl);
      } else {
        throw new Error(result.error || 'Audio extraction failed');
      }
    } catch (error) {
      console.error('Audio extraction error:', error);
      setExtractionError(error.message);
    } finally {
      setIsExtracting(false);
    }
  }, [appData.videoUrl]);

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
          <div style={{
            background: 'linear-gradient(135deg, #fffbeb 0%, #fed7aa 100%)',
            border: '1px solid #fbbf24',
            borderRadius: '0.75rem',
            padding: '2rem',
            marginBottom: '2rem'
          }}>
            <div className="text-center mb-6">
              <div className="w-20 h-20 mx-auto mb-4 bg-yellow-100 rounded-full flex items-center justify-center">
                <Upload className="w-10 h-10 text-yellow-600" />
              </div>
              <h3 className="text-2xl font-bold text-yellow-800 mb-2">Audio Required</h3>
              <p className="text-yellow-700 text-lg">
                Extract audio automatically from the YouTube video or upload your own content.
              </p>
            </div>
            
            {extractionError && (
              <div style={{
                background: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: '0.5rem',
                padding: '1rem',
                marginBottom: '1.5rem'
              }}>
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center mr-3">
                    <span className="text-red-600 font-bold">!</span>
                  </div>
                  <p className="text-red-700">
                    <strong>Extraction failed:</strong> {extractionError}
                  </p>
                </div>
              </div>
            )}
            
            <div className="grid sm:grid-cols-3 gap-4">
              <button
                onClick={extractAudioFromVideo}
                disabled={isExtracting}
                style={{
                  background: isExtracting ? '#9ca3af' : 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
                  color: 'white',
                  borderRadius: '0.75rem',
                  padding: '1rem 1.5rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: isExtracting ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                  border: 'none'
                }}
              >
                {isExtracting ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                    Extracting Audio...
                  </>
                ) : (
                  <>
                    <Download className="w-5 h-5 mr-3" />
                    Extract from Video
                  </>
                )}
              </button>
              
              <label style={{
                background: (isUploading || isExtracting || isGeneratingSnippets) ? '#9ca3af' : 'linear-gradient(135deg, #7c3aed 0%, #8b5cf6 100%)',
                color: 'white',
                borderRadius: '0.75rem',
                padding: '1rem 1.5rem',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: (isUploading || isExtracting || isGeneratingSnippets) ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
              }}>
                {isUploading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                    Uploading...
                  </>
                ) : isExtracting ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                    Extracting Audio...
                  </>
                ) : isGeneratingSnippets ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                    Generating Video Snippets...
                  </>
                ) : (
                  <>
                    <Upload className="w-5 h-5 mr-3" />
                    Upload Video
                  </>
                )}
                <input
                  type="file"
                  accept="video/*"
                  onChange={handleVideoUpload}
                  className="hidden"
                  disabled={isUploading || isExtracting || isGeneratingSnippets}
                />
              </label>
              
              <label style={{
                background: 'linear-gradient(135deg, #1d4ed8 0%, #3b82f6 100%)',
                color: 'white',
                borderRadius: '0.75rem',
                padding: '1rem 1.5rem',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
              }}>
                <Upload className="w-5 h-5 mr-3" />
                Upload Audio
                <input
                  type="file"
                  accept="audio/*"
                  onChange={handleAudioUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="p-6">
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
              
              <div className="border-t border-slate-200/60">
                {currentSectionData.image ? (
                  <img 
                    src={currentSectionData.image}
                    alt={currentSectionData.imageAlt || `Section ${currentSection + 1} visual`}
                    className="w-full h-72 object-cover"
                  />
                ) : (
                  <VideoSnippet 
                    sectionIndex={currentSection}
                    sectionData={currentSectionData}
                    snippetUrl={videoSnippets[currentSection]}
                    className="w-full h-72"
                    autoPlay={true}
                    muted={true}
                    controls={false}
                  />
                )}
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
                  className={`w-full text-left p-4 rounded-lg transition-all duration-200 flex gap-4 ${
                    index === currentSection
                      ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md'
                      : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  <div className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden">
                    {section.image ? (
                      <img 
                        src={section.image}
                        alt={section.imageAlt || `Section ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <VideoSnippet 
                        sectionIndex={index}
                        sectionData={section}
                        snippetUrl={videoSnippets[index]}
                        className="w-full h-full"
                        autoPlay={false}
                        muted={true}
                        controls={false}
                      />
                    )}
                  </div>
                  
                  <div className="flex justify-between items-start flex-1">
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
