import { toast } from 'sonner';

export async function downloadTranslatedAudio(text: string, lang: string) {
  try {
    // Create speech synthesis utterance
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;

    // Get available voices
    const voices = speechSynthesis.getVoices();
    const voice = voices.find(v => v.lang.startsWith(lang)) || voices[0];
    if (voice) {
      utterance.voice = voice;
    }

    // Create audio context for recording
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const destination = audioContext.createMediaStreamDestination();
    
    // For downloading, we'll use a simpler approach with TTS
    // Note: Direct audio capture from Web Speech API is limited
    // This will speak the text and provide feedback
    speechSynthesis.speak(utterance);
    
    toast.info('Audio playback started. For download, consider using a browser extension to capture system audio.');
    
    // Alternative: Generate filename and trigger download intent
    utterance.onend = () => {
      toast.success('Audio completed');
    };

  } catch (error) {
    console.error('Audio download error:', error);
    toast.error('Audio download not fully supported in this browser');
  }
}

// Utility to create a downloadable text file with the translation
export function downloadAsText(text: string, filename: string = 'translation.txt') {
  const blob = new Blob([text], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  toast.success('Translation downloaded');
}
