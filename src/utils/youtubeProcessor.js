export function processTranscriptToSections(transcriptSegments) {
  const sections = [];
  let currentSection = null;
  let currentText = '';
  
  for (const segment of transcriptSegments) {
    if (!currentSection) {
      currentSection = {
        startTime: segment.start_time,
        endTime: segment.end_time,
        text: segment.text
      };
      currentText = segment.text;
    } else {
      const timeDiff = segment.start_time - currentSection.endTime;
      const textLength = currentText.length;
      
      if (timeDiff > 5 || textLength > 200) {
        sections.push({
          ...currentSection,
          text: currentText.trim()
        });
        
        currentSection = {
          startTime: segment.start_time,
          endTime: segment.end_time,
          text: segment.text
        };
        currentText = segment.text;
      } else {
        currentSection.endTime = segment.end_time;
        currentText += ' ' + segment.text;
      }
    }
  }
  
  if (currentSection) {
    sections.push({
      ...currentSection,
      text: currentText.trim()
    });
  }
  
  return sections;
}

export function generateSectionTitles(sections) {
  return sections.map((section, index) => {
    const text = section.text.toLowerCase();
    let title = `Section ${index + 1}`;
    
    if (text.includes('historical') || text.includes('footage')) {
      title = 'Historical Introduction';
    } else if (text.includes('father') || text.includes('family') || text.includes('born')) {
      title = 'Family Background';
    } else if (text.includes('work') || text.includes('store') || text.includes('job')) {
      title = 'Work Life';
    } else if (text.includes('interview') || text.includes('sound') || text.includes('footage')) {
      title = 'Video Context';
    } else if (text.includes('office') || text.includes('place') || text.includes('busy')) {
      title = 'Workspace Tour';
    }
    
    return {
      ...section,
      title,
      id: index
    };
  });
}

export function createYouTubeApp(videoData) {
  const sections = processTranscriptToSections(videoData.transcript_segments);
  const sectionsWithTitles = generateSectionTitles(sections);
  
  return {
    title: videoData.title,
    videoUrl: videoData.video_url,
    duration: videoData.duration,
    sections: sectionsWithTitles,
    audioFile: null // Will be set when audio is provided
  };
}
