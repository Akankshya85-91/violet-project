import { pipeline } from '@huggingface/transformers';

let transcriber: any = null;

export async function initializeTranscriber() {
  if (!transcriber) {
    // Using whisper-tiny for faster performance with good accuracy
    transcriber = await pipeline(
      'automatic-speech-recognition',
      'Xenova/whisper-tiny',
      { 
        dtype: 'q8',
        device: 'wasm'
      }
    );
  }
  return transcriber;
}

export async function extractAudioFromVideo(videoFile: File): Promise<AudioBuffer> {
  return new Promise((resolve, reject) => {
    const audioContext = new AudioContext({ sampleRate: 16000 });
    const fileReader = new FileReader();
    
    fileReader.onload = async (e) => {
      try {
        const arrayBuffer = e.target?.result as ArrayBuffer;
        if (!arrayBuffer) {
          reject(new Error('Failed to read video file'));
          return;
        }
        
        // Decode audio directly from video file
        const decodedBuffer = await audioContext.decodeAudioData(arrayBuffer);
        resolve(decodedBuffer);
      } catch (error) {
        console.error('Audio extraction error:', error);
        reject(new Error('Failed to extract audio from video. The video format may not be supported.'));
      }
    };
    
    fileReader.onerror = () => {
      reject(new Error('Failed to read video file'));
    };
    
    fileReader.readAsArrayBuffer(videoFile);
  });
}

function removeRepetitiveText(text: string): string {
  // Remove excessive repetition patterns
  const sentences = text.split(/[.!?]+/).map(s => s.trim()).filter(s => s.length > 0);
  const uniqueSentences: string[] = [];
  const seenRecently = new Set<string>();
  
  for (let i = 0; i < sentences.length; i++) {
    const normalized = sentences[i].toLowerCase().trim();
    
    // Skip if we've seen this exact sentence in the last 3 sentences
    if (!seenRecently.has(normalized)) {
      uniqueSentences.push(sentences[i]);
      seenRecently.add(normalized);
      
      // Only keep track of last 3 sentences to allow some natural repetition
      if (seenRecently.size > 3) {
        const firstSeen = Array.from(seenRecently)[0];
        seenRecently.delete(firstSeen);
      }
    }
  }
  
  return uniqueSentences.join('. ') + '.';
}

export async function transcribeAudio(audioBuffer: AudioBuffer, onProgress?: (progress: number) => void): Promise<string> {
  try {
    const transcriber = await initializeTranscriber();
    
    const audioData = audioBuffer.getChannelData(0);
    
    // Optimize for speed and accuracy with repetition penalty
    const result = await transcriber(audioData, {
      chunk_length_s: 15,
      stride_length_s: 3,
      return_timestamps: false,
      task: 'transcribe',
      repetition_penalty: 1.2,
      no_repeat_ngram_size: 3,
    });
    
    let text = result.text?.trim() || '';
    
    if (!text) {
      throw new Error('No speech detected in audio');
    }
    
    // Remove repetitive patterns
    text = removeRepetitiveText(text);
    
    return text;
  } catch (error) {
    console.error('Transcription error:', error);
    throw new Error('Failed to transcribe audio. The video may not contain clear speech.');
  }
}

export async function transcribeVideoAudio(
  videoFile: File,
  onProgress?: (stage: string, progress: number) => void
): Promise<string> {
  try {
    onProgress?.('Initializing transcription model...', 10);
    await initializeTranscriber();
    
    onProgress?.('Extracting audio from video...', 30);
    const audioBuffer = await extractAudioFromVideo(videoFile);
    
    onProgress?.('Transcribing speech to text...', 60);
    const transcription = await transcribeAudio(audioBuffer, (p) => {
      onProgress?.('Transcribing speech to text...', 60 + p * 0.35);
    });
    
    if (!transcription || transcription.trim().length === 0) {
      throw new Error('No speech detected in the video');
    }
    
    onProgress?.('Complete', 100);
    return transcription;
  } catch (error) {
    console.error('Video transcription error:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to transcribe video. Please ensure the video contains clear speech.');
  }
}
