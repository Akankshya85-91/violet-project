import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { LANGUAGES } from '@/utils/languages';
import { translateText } from '@/utils/translationService';
import { extractTextFromImage } from '@/utils/ocrService';
import { Upload, Loader2, Copy, Volume2, Image as ImageIcon, Trash2, AlertCircle, Star, Home } from 'lucide-react';
import { toast } from 'sonner';
import { useDropzone } from 'react-dropzone';
import { supabase } from '@/integrations/supabase/client';
import textBg from '@/assets/text-bg.jpg';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import { speakText, stopSpeech } from '@/utils/translationService';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Navbar } from '@/components/Navbar';

export default function ImageTranslate() {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [extractedText, setExtractedText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [targetLang, setTargetLang] = useState('es');
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showInvalidError, setShowInvalidError] = useState(false);
  const [isSpeakingExtracted, setIsSpeakingExtracted] = useState(false);
  const [isSpeakingTranslated, setIsSpeakingTranslated] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const {
    getRootProps,
    getInputProps,
    isDragActive
  } = useDropzone({
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.bmp', '.tiff', '.webp'],
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    },
    maxFiles: 1,
    onDrop: acceptedFiles => {
      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0];
        setImageFile(file);
        setImagePreview(URL.createObjectURL(file));
        setShowInvalidError(false);
        setExtractedText('');
        setTranslatedText('');
      }
    }
  });
  const handleRemoveFile = () => {
    setImageFile(null);
    setImagePreview('');
    setExtractedText('');
    setTranslatedText('');
    setShowInvalidError(false);
  };
  const handleExtractAndTranslate = async () => {
    if (!imageFile) {
      toast.error('Please upload an image first');
      return;
    }
    setLoading(true);
    setProgress(0);
    setShowInvalidError(false);
    try {
      // Extract text using OCR
      const text = await extractTextFromImage(imageFile, setProgress);
      setExtractedText(text);
      if (!text.trim()) {
        setShowInvalidError(true);
        toast.error('No text found in image');
        setLoading(false);
        return;
      }

      // Translate extracted text
      const result = await translateText(text, 'en', targetLang);
      setTranslatedText(result);

      // Save to history
      const {
        data: {
          user
        }
      } = await supabase.auth.getUser();
      if (user) {
        // @ts-ignore - translation_history table exists but types not updated
        await supabase.from('translation_history').insert([{
          user_id: user.id,
          source_text: text,
          translated_text: result,
          source_language: 'en',
          target_language: targetLang,
          translation_type: 'image'
        }]);
      }
      toast.success('Image translated successfully');
    } catch (error) {
      console.error('Image translation error:', error);
      setShowInvalidError(true);
      toast.error(error instanceof Error ? error.message : 'Translation failed');
    } finally {
      setLoading(false);
    }
  };
  const handleSpeak = (text: string, isExtracted: boolean) => {
    try {
      const isSpeaking = isExtracted ? isSpeakingExtracted : isSpeakingTranslated;
      if (isSpeaking) {
        stopSpeech();
        if (isExtracted) {
          setIsSpeakingExtracted(false);
        } else {
          setIsSpeakingTranslated(false);
        }
      } else {
        speakText(text, targetLang);
        if (isExtracted) {
          setIsSpeakingExtracted(true);
        } else {
          setIsSpeakingTranslated(true);
        }

        // Reset state when speech ends
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.onend = () => {
          if (isExtracted) {
            setIsSpeakingExtracted(false);
          } else {
            setIsSpeakingTranslated(false);
          }
        };
      }
    } catch {
      toast.error('Text-to-speech not supported');
    }
  };
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  const toggleFavorite = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !translatedText) return;

    if (isFavorited) {
      toast.error('Already in favorites');
      return;
    }

    const { error } = await supabase
      // @ts-ignore
      .from('favorite_translations')
      .insert([{
        user_id: user.id,
        source_text: extractedText,
        translated_text: translatedText,
        source_language: 'en',
        target_language: targetLang,
      }]);

    if (error) {
      toast.error('Failed to add to favorites');
    } else {
      setIsFavorited(true);
      toast.success('Added to favorites');
    }
  };

  return <>
    <Navbar />
    <SidebarProvider>
      <div className="min-h-screen flex w-full pt-16">
        <AppSidebar />
        <div className="flex-1 flex flex-col" style={{
        backgroundImage: `url(${textBg})`,
        backgroundSize: 'cover'
      }}>
          <div className="absolute inset-0 bg-background/95" />
          <header className="h-16 flex items-center justify-between border-b border-border bg-background/80 backdrop-blur-lg relative z-10">
            <div className="flex items-center gap-2">
              <SidebarTrigger className="ml-4" />
              <h1 className="text-2xl font-bold ml-4">Image Translation</h1>
            </div>
            <div className="flex items-center gap-2 mr-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.location.href = '/'}
              >
                <Home className="h-4 w-4 mr-2" />
                Home
              </Button>
              {translatedText && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={toggleFavorite}
                  disabled={isFavorited}
                >
                  <Star className={`h-4 w-4 mr-2 ${isFavorited ? 'fill-yellow-500 text-yellow-500' : ''}`} />
                  {isFavorited ? 'Liked' : 'Like'}
                </Button>
              )}
            </div>
          </header>
          <div className="container mx-auto px-4 py-12 relative z-10 animate-fade-in">
            <div className="max-w-6xl mx-auto space-y-6">
              {showInvalidError && <Alert variant="destructive" className="animate-scale-in">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="flex items-center justify-between">
                    <span>Invalid Input: No text detected in the uploaded file.</span>
                    <Button variant="outline" size="sm" onClick={handleRemoveFile}>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Remove File
                    </Button>
                  </AlertDescription>
                </Alert>}

              <div className="grid md:grid-cols-2 gap-6">
                {/* Image Upload */}
                <Card className="p-6 space-y-4 hover-lift animate-slide-up">
                  <div {...getRootProps()} className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${isDragActive ? 'border-primary bg-primary/10' : 'border-border'}`}>
                    <input {...getInputProps()} />
                    {imagePreview ? <div className="relative">
                        <img src={imagePreview} alt="Preview" className="max-h-64 mx-auto rounded-lg" />
                        <Button variant="destructive" size="icon" className="absolute top-2 right-2" onClick={e => {
                      e.stopPropagation();
                      handleRemoveFile();
                    }}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div> : <div className="space-y-4">
                        <ImageIcon className="h-16 w-16 mx-auto text-muted-foreground" />
                        
                        
                      </div>}
                  </div>

                  {loading && <div className="space-y-2">
                      <Progress value={progress} />
                      <p className="text-sm text-center text-muted-foreground">Extracting text: {progress}%</p>
                    </div>}

                  <Select value={targetLang} onValueChange={setTargetLang}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {LANGUAGES.map(lang => <SelectItem key={lang.code} value={lang.code}>
                          {lang.flag} {lang.name}
                        </SelectItem>)}
                    </SelectContent>
                  </Select>

                  <Button onClick={handleExtractAndTranslate} disabled={loading || !imageFile} className="w-full">
                    {loading ? <Loader2 className="animate-spin mr-2" /> : <Upload className="mr-2" />}
                    Extract & Translate
                  </Button>
                </Card>

                {/* Results */}
                <Card className="p-6 space-y-4 hover-lift animate-slide-up">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Extracted Text</label>
                    <Textarea value={extractedText} readOnly placeholder="Extracted text will appear here..." className="min-h-[150px] bg-secondary/50" />
                    {extractedText && <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleCopy(extractedText)}>
                          <Copy className="h-4 w-4 mr-2" />
                          Copy
                        </Button>
                        <Button variant={isSpeakingExtracted ? "default" : "outline"} size="sm" onClick={() => handleSpeak(extractedText, true)}>
                          <Volume2 className="h-4 w-4 mr-2" />
                          {isSpeakingExtracted ? 'Stop' : 'Speak'}
                        </Button>
                      </div>}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Translation</label>
                    <Textarea value={translatedText} readOnly placeholder="Translation will appear here..." className="min-h-[150px] bg-secondary/50" />
                    {translatedText && <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleCopy(translatedText)}>
                          <Copy className="h-4 w-4 mr-2" />
                          Copy
                        </Button>
                        <Button variant={isSpeakingTranslated ? "default" : "outline"} size="sm" onClick={() => handleSpeak(translatedText, false)}>
                          <Volume2 className="h-4 w-4 mr-2" />
                          {isSpeakingTranslated ? 'Stop' : 'Speak'}
                        </Button>
                      </div>}
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SidebarProvider>
  </>;
}