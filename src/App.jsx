import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, RotateCcw } from 'lucide-react';

// Import assets
import podcastAudio from './assets/Podcastreviewsound.m4a';
import richardPriceImg from './assets/IMG_2885.JPG';
import section1Img from './assets/section1.png';
import section2Img from './assets/section2.png';
import section3Img from './assets/section3.png';
import section4Img from './assets/section4.png';
import section5Img from './assets/section5.png';
import section6Img from './assets/section6.png';
import section7Img from './assets/section7.png';
import section8Img from './assets/section8.png';
import section9Img from './assets/section9.png';
import section10Img from './assets/section10.png';
import section11Img from './assets/section11.png';
import section12Img from './assets/section12.png';
import section13Img from './assets/section13.png';

const transcriptSections = [
  {
    id: 1,
    title: "Surprise email: my paper becomes an AI-generated podcast",
    startTime: 0,
    endTime: 27,
    content: "A day ago, I got an email from academia.edu informing me that a paper that I had written 10 years ago had been turned into a podcast, AI generated podcast.",
    image: section1Img,
    imageAlt: "Richard Price reading an email notification about AI podcast generation"
  },
  {
    id: 2,
    title: "Wait—that's Richard Price's cloned voice!",
    startTime: 24,
    endTime: 44,
    content: "So I listened to it and it was my voice. It was my cloned voice reading out the paper that I had written 10 years ago.",
    image: section2Img,
    imageAlt: "Richard Price listening with amazement to his cloned voice"
  },
  {
    id: 3,
    title: "Why I hit record: today's agenda",
    startTime: 45,
    endTime: 84,
    content: "So I recorded mine along with walking through the paper just to give an idea of what it is in today's world. Welcome to another edition of In-Depth with Academia, your go-to podcast for diving deep into the world of academic research and discoveries.",
    image: section3Img,
    imageAlt: "Richard Price in a professional podcast studio setting"
  },
  {
    id: 4,
    title: "Project-Based Learning Kickstart Tips",
    startTime: 84,
    endTime: 98,
    content: "The paper we're dissecting today written by John Duhring is called Projectbased Learning Kickstart Tips: Hackathon Pedigogies as Educational Technology.",
    image: section4Img,
    imageAlt: "Academic paper with hackathon and educational technology elements"
  },
  {
    id: 5,
    title: "Why hackathons matter in education",
    startTime: 98,
    endTime: 119,
    content: "I mean, why do hackathons matter in education? Isn't that a question worth pondering? The crux of Duhring's paper addresses how face-to-face educational experiences like hackathons can complement, perhaps even enhance traditional learning methods.",
    image: section5Img,
    imageAlt: "Students collaborating intensively in a hackathon environment"
  },
  {
    id: 6,
    title: "Engagement gains & learning outcomes",
    startTime: 119,
    endTime: 146,
    content: "The significance is clear. If we can harness these dynamic technologydriven environments, the potential for student engagement and learning outcomes is well, it's pretty significant.",
    image: section6Img,
    imageAlt: "Engaged students working with technology in collaborative learning"
  },
  {
    id: 7,
    title: "Not one-size-fits-all: hackathons as catalysts",
    startTime: 146,
    endTime: 159,
    content: "The paper isn't prescribing hackathons as a one-sizefits-all solution. Rather, it views them as a catalyzing element in academia. It's all about kickstarting projects, themes, and interests, giving students a platform to shine.",
    image: section7Img,
    imageAlt: "Spark igniting student creativity and innovation"
  },
  {
    id: 8,
    title: "Teacher 2.0 – facilitator, observer, co-learner",
    startTime: 159,
    endTime: 203,
    content: "Now, um let's pause for a moment because something Duhring said got me thinking about teaching styles. Isn't it funny how the more we embrace these new tools, the more the role of a teacher evolves from a traditional lecturer to a facilitator or observer?",
    image: section8Img,
    imageAlt: "Modern teacher as facilitator among students in collaborative environment"
  },
  {
    id: 9,
    title: "Reality check: planning, chaos vs. structured creativity",
    startTime: 203,
    endTime: 219,
    content: "But it's not all rainbows and unicorns. The reality is execution of hackathons in educational curricula requires careful planning ensuring the experiences are meaningful and well integrated. Are we just organizing chaos or is it structured creativity?",
    image: section9Img,
    imageAlt: "Balance between chaos and structured creativity in education"
  },
  {
    id: 10,
    title: "The magic of self-organization under pressure",
    startTime: 219,
    endTime: 240,
    content: "There's a certain magic in this ethos of self-organization and problem solving within a compressed time frame that sets the stage for learning beyond the ordinary.",
    image: section10Img,
    imageAlt: "Students self-organizing under time pressure"
  },
  {
    id: 11,
    title: "Can hackathon energy fuel semester-long projects?",
    startTime: 240,
    endTime: 264,
    content: "Listen, if hackathons genuinely enhance course design and learning objectives, there lies immense potential to foster creativity and competency in measurable ways. Duhring urges us to consider, could the intense high energy environment of a hackathon be leveraged to foster long-term course projects?",
    image: section11Img,
    imageAlt: "Energy and momentum carrying from hackathon to extended projects"
  },
  {
    id: 12,
    title: "Innovation ✕ tradition: the ongoing waltz",
    startTime: 264,
    endTime: 288,
    content: "As we wind down today's exploration, remember folks, academic research, like Duhring's paper, is about presenting paradigms to consider, not irrefutable truths. There's a waltz occurring between innovation and tradition.",
    image: section12Img,
    imageAlt: "Dance between traditional and innovative education methods"
  },
  {
    id: 13,
    title: "Let's keep the discourse lively—join the conversation",
    startTime: 288,
    endTime: 303,
    content: "So, let's keep the discourse lively, share our thoughts, and carry this discussion forward. Thanks for tuning in to In-Depth with Academia. Stay curious, stay informed, and until next time, keep exploring the depths of scholarly pursuits.",
    image: section13Img,
    imageAlt: "Richard Price encouraging community discussion and engagement"
  }
];

function App() {
  const [currentSection, setCurrentSection] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      const updateTime = () => setCurrentTime(audio.currentTime);
      const updateDuration = () => setDuration(audio.duration);
      
      audio.addEventListener('timeupdate', updateTime);
      audio.addEventListener('loadedmetadata', updateDuration);
      audio.addEventListener('ended', () => setIsPlaying(false));
      
      return () => {
        audio.removeEventListener('timeupdate', updateTime);
        audio.removeEventListener('loadedmetadata', updateDuration);
        audio.removeEventListener('ended', () => setIsPlaying(false));
      };
    }
  }, []);

  useEffect(() => {
    // Auto-advance sections based on audio time
    const currentSectionIndex = transcriptSections.findIndex(
      section => currentTime >= section.startTime && currentTime < section.endTime
    );
    if (currentSectionIndex !== -1 && currentSectionIndex !== currentSection) {
      setCurrentSection(currentSectionIndex);
    }
  }, [currentTime, currentSection]);

  const togglePlayPause = () => {
    const audio = audioRef.current;
    if (audio) {
      if (isPlaying) {
        audio.pause();
      } else {
        audio.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const seekToSection = (sectionIndex) => {
    const audio = audioRef.current;
    if (audio && sectionIndex >= 0 && sectionIndex < transcriptSections.length) {
      audio.currentTime = transcriptSections[sectionIndex].startTime;
      setCurrentSection(sectionIndex);
    }
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const navigateSection = (direction) => {
    let newIndex;
    if (direction === 'prev') {
      newIndex = Math.max(0, currentSection - 1);
    } else if (direction === 'next') {
      newIndex = Math.min(transcriptSections.length - 1, currentSection + 1);
    }
    
    if (newIndex !== undefined && newIndex !== currentSection) {
      seekToSection(newIndex);
    }
  };

  const goToStart = () => {
    const audio = audioRef.current;
    if (audio) {
      audio.currentTime = 0;
      setCurrentSection(0);
    }
  };

  const handleProgressClick = (e) => {
    const audio = audioRef.current;
    if (audio && duration) {
      const rect = e.currentTarget.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const newTime = (clickX / rect.width) * duration;
      audio.currentTime = newTime;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <audio ref={audioRef} src={podcastAudio} />
      
      {/* Header */}
      <header className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-b border-slate-200 dark:border-slate-700 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <img 
              src={richardPriceImg} 
              alt="Richard Price" 
              className="w-12 h-12 rounded-full object-cover border-2 border-slate-200 dark:border-slate-600"
            />
            <div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                AI Podcast Transcript Walkthrough
              </h1>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Richard Price • In-Depth with Academia
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Timeline Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 sticky top-24">
              <h2 className="text-lg font-semibold mb-4 text-slate-900 dark:text-slate-100">Sections</h2>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {transcriptSections.map((section, index) => (
                  <button
                    key={section.id}
                    onClick={() => seekToSection(index)}
                    className={`w-full text-left p-3 rounded-lg transition-colors ${
                      index === currentSection
                        ? 'bg-blue-100 dark:bg-blue-900/30 border-l-4 border-blue-500'
                        : 'hover:bg-slate-100 dark:hover:bg-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        {formatTime(section.startTime)} - {formatTime(section.endTime)}
                      </span>
                      <span className="bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-300 px-2 py-1 rounded text-xs">
                        {index + 1}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100 line-clamp-2">
                      {section.title}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Audio Controls */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <button
                    onClick={goToStart}
                    className="p-2 rounded-full bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                    title="Go to start"
                  >
                    <RotateCcw className="w-5 h-5" />
                  </button>
                  
                  <button
                    onClick={() => navigateSection('prev')}
                    className="p-2 rounded-full bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                    disabled={currentSection === 0}
                  >
                    <SkipBack className="w-5 h-5" />
                  </button>
                  
                  <button
                    onClick={togglePlayPause}
                    className="p-3 rounded-full bg-blue-500 hover:bg-blue-600 text-white transition-colors"
                  >
                    {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
                  </button>
                  
                  <button
                    onClick={() => navigateSection('next')}
                    className="p-2 rounded-full bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                    disabled={currentSection === transcriptSections.length - 1}
                  >
                    <SkipForward className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                  <Volume2 className="w-4 h-4" />
                  <span>{formatTime(currentTime)} / {formatTime(duration)}</span>
                </div>
              </div>
              
              {/* Progress Bar */}
              <div 
                className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 cursor-pointer"
                onClick={handleProgressClick}
              >
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(currentTime / duration) * 100}%` }}
                />
              </div>
            </div>

            {/* Current Section Content */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg overflow-hidden">
              <div className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-full text-sm font-medium">
                    Section {currentSection + 1} of {transcriptSections.length}
                  </span>
                  <span className="text-sm text-slate-500 dark:text-slate-400">
                    {formatTime(transcriptSections[currentSection].startTime)} - {formatTime(transcriptSections[currentSection].endTime)}
                  </span>
                </div>
                
                <h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-slate-100">
                  {transcriptSections[currentSection].title}
                </h2>
                
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-6">
                  {transcriptSections[currentSection].content}
                </p>
              </div>
              
              {/* Generated Image */}
              <div className="border-t border-slate-200 dark:border-slate-600">
                <img 
                  src={transcriptSections[currentSection].image}
                  alt={transcriptSections[currentSection].imageAlt}
                  className="w-full h-64 object-cover"
                />
              </div>
            </div>

            {/* Section Navigation */}
            <div className="flex justify-between items-center">
              <button
                onClick={() => navigateSection('prev')}
                disabled={currentSection === 0}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  currentSection === 0 
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed dark:bg-slate-700 dark:text-slate-500' 
                    : 'bg-blue-500 text-white hover:bg-blue-600'
                }`}
              >
                <SkipBack className="w-4 h-4" />
                Previous Section
              </button>
              
              <span className="text-sm text-slate-600 dark:text-slate-400">
                {currentSection + 1} / {transcriptSections.length}
              </span>
              
              <button
                onClick={() => navigateSection('next')}
                disabled={currentSection === transcriptSections.length - 1}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  currentSection === transcriptSections.length - 1
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed dark:bg-slate-700 dark:text-slate-500' 
                    : 'bg-blue-500 text-white hover:bg-blue-600'
                }`}
              >
                Next Section
                <SkipForward className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;

