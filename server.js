import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'video-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 500 * 1024 * 1024 // 500MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /\.(mp4|avi|mov|mkv|webm|flv|wmv)$/i;
    if (allowedTypes.test(file.originalname)) {
      cb(null, true);
    } else {
      cb(new Error('Only video files are allowed'));
    }
  }
});

const audioDir = path.join(__dirname, 'public', 'audio');
const videoSnippetsDir = path.join(__dirname, 'public', 'video-snippets');
if (!fs.existsSync(audioDir)) {
  fs.mkdirSync(audioDir, { recursive: true });
}
if (!fs.existsSync(videoSnippetsDir)) {
  fs.mkdirSync(videoSnippetsDir, { recursive: true });
}

app.use('/audio', express.static(path.join(__dirname, 'public', 'audio')));
app.use('/video-snippets', express.static(path.join(__dirname, 'public', 'video-snippets')));

app.post('/api/upload-video', upload.single('video'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      error: 'No video file uploaded'
    });
  }

  try {
    console.log('Extracting audio from uploaded video:', req.file.filename);
    
    const videoPath = req.file.path;
    const audioDir = path.join(__dirname, 'public', 'audio');
    if (!fs.existsSync(audioDir)) {
      fs.mkdirSync(audioDir, { recursive: true });
    }
    
    const audioFileName = `extracted-${Date.now()}.mp3`;
    const audioPath = path.join(audioDir, audioFileName);
    
    let responseSent = false;
    
    const ffmpegProcess = spawn('ffmpeg', [
      '-i', videoPath,
      '-vn', // No video
      '-acodec', 'mp3',
      '-ab', '192k',
      '-ar', '44100',
      '-y', // Overwrite output file
      audioPath
    ]);
    
    let error = '';
    
    ffmpegProcess.stderr.on('data', (data) => {
      error += data.toString();
    });
    
    ffmpegProcess.on('close', (code) => {
      if (responseSent) return;
      
      if (code === 0) {
        console.log('Audio extraction successful:', audioFileName);
        responseSent = true;
        res.json({
          success: true,
          audio_file: `/audio/${audioFileName}`,
          video_file: req.file.filename,
          title: req.file.originalname,
          message: 'Audio extracted successfully from uploaded video'
        });
      } else {
        console.error('FFmpeg extraction failed:', error);
        fs.unlink(videoPath, (err) => {
          if (err) console.error('Error deleting video file:', err);
        });
        responseSent = true;
        res.status(500).json({
          success: false,
          error: 'Failed to extract audio from video'
        });
      }
    });
    
    const timeoutId = setTimeout(() => {
      if (!responseSent) {
        ffmpegProcess.kill('SIGTERM');
        responseSent = true;
        res.status(408).json({
          success: false,
          error: 'Audio extraction timed out'
        });
      }
    }, 300000); // 5 minutes timeout for video processing
    
    ffmpegProcess.on('close', () => {
      clearTimeout(timeoutId);
    });
    
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.post('/api/extract-audio', async (req, res) => {
  const { videoUrl } = req.body;
  
  if (!videoUrl) {
    return res.status(400).json({ 
      success: false, 
      error: 'Video URL is required' 
    });
  }

  try {
    console.log('Extracting audio from:', videoUrl);
    
    const pythonScript = path.join(__dirname, 'src', 'utils', 'audioExtractor.py');
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
          console.log('Audio extraction result:', result);
          res.json(result);
        } catch (e) {
          console.error('Failed to parse extraction result:', e);
          res.status(500).json({
            success: false,
            error: 'Failed to parse extraction result'
          });
        }
      } else {
        console.error('Audio extraction failed:', error);
        res.status(500).json({
          success: false,
          error: error || 'Audio extraction failed'
        });
      }
    });
    
    setTimeout(() => {
      process.kill('SIGTERM');
      res.status(408).json({
        success: false,
        error: 'Audio extraction timed out'
      });
    }, 120000); // 2 minutes timeout
    
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.post('/api/generate-video-snippets', async (req, res) => {
  const { videoFileName, sections } = req.body;
  
  if (!videoFileName || !sections) {
    return res.status(400).json({
      success: false,
      error: 'Video filename and sections are required'
    });
  }

  try {
    const videoPath = path.join(__dirname, 'uploads', videoFileName);
    const videoSnippetsDir = path.join(__dirname, 'public', 'video-snippets');
    
    if (!fs.existsSync(videoPath)) {
      return res.status(404).json({
        success: false,
        error: 'Video file not found'
      });
    }
    
    const snippetPromises = sections.map((section, index) => {
      return new Promise((resolve, reject) => {
        const snippetFileName = `snippet-${Date.now()}-${index}.mp4`;
        const snippetPath = path.join(videoSnippetsDir, snippetFileName);
        const duration = section.endTime - section.startTime;
        
        const ffmpegProcess = spawn('ffmpeg', [
          '-i', videoPath,
          '-ss', section.startTime.toString(),
          '-t', duration.toString(),
          '-c:v', 'libx264',
          '-c:a', 'aac',
          '-crf', '23',
          '-preset', 'fast',
          '-movflags', '+faststart',
          '-y',
          snippetPath
        ]);
        
        let error = '';
        
        ffmpegProcess.stderr.on('data', (data) => {
          error += data.toString();
        });
        
        ffmpegProcess.on('close', (code) => {
          if (code === 0) {
            resolve({
              sectionIndex: index,
              snippetUrl: `/video-snippets/${snippetFileName}`,
              startTime: section.startTime,
              endTime: section.endTime
            });
          } else {
            console.error(`Snippet generation failed for section ${index}:`, error);
            reject(new Error(`Failed to generate snippet for section ${index}`));
          }
        });
      });
    });
    
    try {
      const snippets = await Promise.all(snippetPromises);
      
      fs.unlink(videoPath, (err) => {
        if (err) console.error('Error deleting video file:', err);
      });
      
      res.json({
        success: true,
        snippets: snippets,
        message: 'Video snippets generated successfully'
      });
    } catch (snippetError) {
      console.error('Snippet generation error:', snippetError);
      res.status(500).json({
        success: false,
        error: 'Failed to generate one or more video snippets'
      });
    }
    
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.listen(PORT, () => {
  console.log(`Audio extraction server running on port ${PORT}`);
});
