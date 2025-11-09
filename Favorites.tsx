import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Star, Trash2, Volume2, Copy } from 'lucide-react';
import { toast } from 'sonner';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import { format } from 'date-fns';
import { speakText } from '@/utils/translationService';
import { Navbar } from '@/components/Navbar';

export default function Favorites() {
  const [favorites, setFavorites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    const { data } = await supabase
      // @ts-ignore
      .from('favorite_translations')
      .select('*')
      .order('created_at', { ascending: false });
    
    setFavorites(data || []);
    setLoading(false);
  };

  const removeFavorite = async (id: string) => {
    const { error } = await supabase
      // @ts-ignore
      .from('favorite_translations')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error('Failed to remove favorite');
    } else {
      setFavorites(prev => prev.filter(f => f.id !== id));
      toast.success('Removed from favorites');
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

  return (
    <>
      <Navbar />
      <SidebarProvider>
        <div className="min-h-screen flex w-full pt-16">
          <AppSidebar />
          <div className="flex-1 flex flex-col">
            <header className="h-16 flex items-center border-b border-border bg-background/80 backdrop-blur-lg z-10">
              <SidebarTrigger className="ml-4" />
              <h1 className="text-2xl font-bold ml-4">Favorite Translations</h1>
            </header>
            <div className="container mx-auto px-4 py-12 animate-fade-in">
              {loading ? (
                <div className="flex justify-center"><Loader2 className="animate-spin h-8 w-8" /></div>
              ) : favorites.length === 0 ? (
                <div className="text-center text-muted-foreground">
                  <Star className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p>No favorite translations yet</p>
                  <p className="text-sm mt-2">Star translations to save them here</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {favorites.map((item) => (
                    <Card key={item.id} className="p-6 hover-lift animate-slide-up">
                      <div className="flex justify-between items-start mb-4">
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(item.created_at), 'PPpp')}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeFavorite(item.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground mb-2">{item.source_language}</p>
                          <p className="text-lg mb-2">{item.source_text}</p>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={() => handleCopy(item.source_text)}>
                              <Copy className="h-3 w-3" />
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => handleSpeak(item.source_text, item.source_language)}>
                              <Volume2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground mb-2">{item.target_language}</p>
                          <p className="text-lg mb-2">{item.translated_text}</p>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={() => handleCopy(item.translated_text)}>
                              <Copy className="h-3 w-3" />
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => handleSpeak(item.translated_text, item.target_language)}>
                              <Volume2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </SidebarProvider>
    </>
  );
}
