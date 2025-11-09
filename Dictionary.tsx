import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BookOpen, Loader2, Volume2 } from 'lucide-react';
import { toast } from 'sonner';
import { LANGUAGES } from '@/utils/languages';
import { translateText, speakText } from '@/utils/translationService';

export function Dictionary() {
  const [word, setWord] = useState('');
  const [targetLang, setTargetLang] = useState('es');
  const [translation, setTranslation] = useState('');
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const handleLookup = async () => {
    if (!word.trim()) {
      toast.error('Please enter a word');
      return;
    }

    setLoading(true);
    try {
      // Always translate from English to target language
      const result = await translateText(word.toLowerCase().trim(), 'en', targetLang);
      setTranslation(result);
      toast.success('Translation found!');
    } catch (error) {
      console.error('Dictionary lookup error:', error);
      toast.error('Failed to find translation. Please try another word.');
    } finally {
      setLoading(false);
    }
  };

  const handleSpeak = (text: string) => {
    try {
      speakText(text, targetLang);
    } catch {
      toast.error('Text-to-speech not supported');
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="w-full justify-start">
          <BookOpen className="h-4 w-4 mr-2" />
          Dictionary
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[95vw] sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Quick Dictionary</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Input
            placeholder="Enter a word..."
            value={word}
            onChange={(e) => setWord(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleLookup()}
          />
          
          <Select value={targetLang} onValueChange={setTargetLang}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {LANGUAGES.map(lang => (
                <SelectItem key={lang.code} value={lang.code}>
                  {lang.flag} {lang.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button onClick={handleLookup} disabled={loading} className="w-full">
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <BookOpen className="h-4 w-4 mr-2" />}
            Look Up
          </Button>

          {translation && (
            <Card className="p-4 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <p className="text-base sm:text-lg font-semibold break-words flex-1">{translation}</p>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleSpeak(translation)}
                  className="flex-shrink-0"
                >
                  <Volume2 className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
