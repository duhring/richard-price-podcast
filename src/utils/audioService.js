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

export async function extractAudioClientSide(videoUrl) {
  try {
    const { spawn } = require('child_process');
    const path = require('path');
    
    return new Promise((resolve, reject) => {
      const pythonScript = path.join(__dirname, 'audioExtractor.py');
      const process = spawn('python3', [pythonScript, videoUrl]);
      
      let output = '';
      let error = '';
      
      process.stdout.on('data', (data) => {
        output += data.toString();
      });
      
      process.stderr.on('data', (data) => {
        error += data.toString();
      });
      
      process.on('close', (code) => {
        if (code === 0) {
          try {
            const result = JSON.parse(output);
            resolve(result);
          } catch (e) {
            reject(new Error('Failed to parse extraction result'));
          }
        } else {
          reject(new Error(error || 'Audio extraction failed'));
        }
      });
    });
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}
