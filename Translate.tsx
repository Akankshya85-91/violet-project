import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { LANGUAGES } from '@/utils/languages';
import { translateText, speakText } from '@/utils/translationService';
import { Copy, Volume2, Loader2, ArrowLeftRight, ArrowRightLeft, Star, Home } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import textBg from '@/assets/text-bg.jpg';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import { Navbar } from '@/components/Navbar';

export default function Translate() {
  const [sourceText, setSourceText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [sourceLang, setSourceLang] = useState('en');
  const [targetLang, setTargetLang] = useState('es');
  const [loading, setLoading] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);

  const swapLanguages = () => {
    const tempLang = sourceLang;
    const tempText = sourceText;
    setSourceLang(targetLang);
    setTargetLang(tempLang);
    setSourceText(translatedText);
    setTranslatedText(tempText);
  };

  const handleTranslate = async () => {
    if (!sourceText.trim()) return;
    
    setLoading(true);
    try {
      const result = await translateText(sourceText, sourceLang, targetLang);
      setTranslatedText(result);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('translation_history').insert([{
          user_id: user.id,
          source_text: sourceText,
          translated_text: result,
          source_language: sourceLang,
          target_language: targetLang,
          translation_type: 'text'
        }]);
      }
    } catch (error) {
      console.error('Translation error:', error);
      toast.error(error instanceof Error ? error.message : 'Translation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  const handleSpeak = (text: string, lang: string) => {
    try {
      speakText(text, lang);
    } catch {
      toast.error('Text-to-speech not supported');
    }
  };

  const toggleFavorite = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !translatedText) {
      toast.error('Please translate some text first');
      return;
    }

    if (isFavorited) {
      toast.info('Already in favorites');
      return;
    }

    // Check if this exact translation already exists
    const { data: existing } = await supabase
      .from('favorite_translations')
      .select('id')
      .eq('user_id', user.id)
      .eq('source_text', sourceText)
      .eq('translated_text', translatedText)
      .maybeSingle();

    if (existing) {
      toast.info('This translation is already in favorites');
      setIsFavorited(true);
      return;
    }

    const { error } = await supabase
      .from('favorite_translations')
      .insert([{
        user_id: user.id,
        source_text: sourceText,
        translated_text: translatedText,
        source_language: sourceLang,
        target_language: targetLang,
      }]);

    if (error) {
      toast.error('Failed to add to favorites');
    } else {
      setIsFavorited(true);
      toast.success('Liked ⭐');
    }
  };

  return (
    <>
      <Navbar />
      <SidebarProvider>
        <div className="min-h-screen flex w-full pt-16">
          <AppSidebar />
          <div className="flex-1 flex flex-col" style={{ backgroundImage: `url(${textBg})`, backgroundSize: 'cover' }}>
            <div className="absolute inset-0 bg-background/95" />
            <header className="h-16 flex items-center justify-between border-b border-border bg-background/80 backdrop-blur-lg relative z-10">
              <div className="flex items-center gap-2">
                <SidebarTrigger className="ml-4" />
                <h1 className="text-2xl font-bold ml-4">Text Translation</h1>
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
          
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="p-6 space-y-4 hover-lift animate-slide-up">
              <div className="flex items-center gap-2">
                <Select value={sourceLang} onValueChange={setSourceLang}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {LANGUAGES.map(lang => (
                      <SelectItem key={lang.code} value={lang.code}>
                        {lang.flag} {lang.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button size="icon" variant="outline" onClick={swapLanguages} title="Swap languages">
                  <ArrowRightLeft className="h-4 w-4" />
                </Button>
              </div>
              <Textarea
                value={sourceText}
                onChange={(e) => {
                  const newValue = e.target.value;
                  setSourceText(newValue);
                  if (newValue === '') {
                    setTranslatedText('');
                  }
                }}
                placeholder="Enter text to translate..."
                className="min-h-[250px] text-lg"
              />

              <div className="flex gap-2">
                <Button onClick={handleTranslate} disabled={loading} className="flex-1">
                  {loading ? <Loader2 className="animate-spin" /> : <ArrowLeftRight />}
                  Translate
                </Button>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => handleCopy(sourceText)} disabled={!sourceText}>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleSpeak(sourceText, sourceLang)} disabled={!sourceText}>
                  <Volume2 className="h-4 w-4 mr-2" />
                  Speak
                </Button>
              </div>
            </Card>

            <Card className="p-6 space-y-4 hover-lift animate-slide-up">
              <Select value={targetLang} onValueChange={setTargetLang}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {LANGUAGES.map(lang => (
                    <SelectItem key={lang.code} value={lang.code}>
                      {lang.flag} {lang.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Textarea
                value={translatedText}
                readOnly
                placeholder="Translation will appear here..."
                className="min-h-[300px] text-lg bg-secondary/50"
              />
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => handleCopy(translatedText)} disabled={!translatedText}>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy
                </Button>
                <Button variant="outline" onClick={() => handleSpeak(translatedText, targetLang)} disabled={!translatedText}>
                  <Volume2 className="h-4 w-4 mr-2" />
                  Speak
                </Button>
              </div>
            </Card>
          </div>
            </div>
            </div>
          </div>
        </div>
      </SidebarProvider>
    </>
  );
}
