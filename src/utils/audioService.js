export async function extractAudioFromYouTube(videoUrl) {
  try {
    const response = await fetch('/api/extract-audio', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ videoUrl }),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error extracting audio:', error);
    return {
      success: false,
      error: error.message
    };
  }
}
