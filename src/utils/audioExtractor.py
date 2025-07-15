#!/usr/bin/env python3
import yt_dlp
import os
import sys
import json
from pathlib import Path

def extract_audio_from_youtube(video_url, output_dir="./public/audio"):
    """
    Extract audio from YouTube video using yt-dlp
    Returns the path to the extracted audio file
    """
    try:
        Path(output_dir).mkdir(parents=True, exist_ok=True)
        
        ydl_opts = {
            'format': 'bestaudio/best',
            'outtmpl': f'{output_dir}/%(title)s.%(ext)s',
            'postprocessors': [{
                'key': 'FFmpegExtractAudio',
                'preferredcodec': 'mp3',
                'preferredquality': '192',
            }],
            'extractaudio': True,
            'audioformat': 'mp3',
            'noplaylist': True,
            'quiet': True,
            'no_warnings': True,
        }
        
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(video_url, download=False)
            title = info.get('title', 'audio')
            
            ydl.download([video_url])
            
            audio_file = None
            for file in os.listdir(output_dir):
                if file.endswith('.mp3') and title.replace('/', '_').replace('\\', '_') in file:
                    audio_file = os.path.join(output_dir, file)
                    break
            
            if not audio_file:
                for file in os.listdir(output_dir):
                    if file.endswith('.mp3'):
                        audio_file = os.path.join(output_dir, file)
                        break
            
            return {
                'success': True,
                'audio_file': audio_file,
                'title': title,
                'duration': info.get('duration', 0)
            }
            
    except Exception as e:
        return {
            'success': False,
            'error': str(e)
        }

def main():
    if len(sys.argv) != 2:
        print(json.dumps({'success': False, 'error': 'Usage: python audioExtractor.py <youtube_url>'}))
        sys.exit(1)
    
    video_url = sys.argv[1]
    result = extract_audio_from_youtube(video_url)
    print(json.dumps(result))

if __name__ == "__main__":
    main()
