import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Trash2, X } from 'lucide-react';
import { toast } from 'sonner';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import { format } from 'date-fns';
import { Navbar } from '@/components/Navbar';

export default function History() {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    const { data } = await supabase
      // @ts-ignore - translation_history table exists but types not updated
      .from('translation_history')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);
    
    setHistory(data || []);
    setLoading(false);
  };

  const clearHistory = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      // @ts-ignore - translation_history table exists but types not updated
      .from('translation_history')
      .delete()
      .eq('user_id', user.id);

    if (error) {
      toast.error('Failed to clear history');
    } else {
      setHistory([]);
      toast.success('History cleared successfully');
    }
  };

  const deleteHistoryItem = async (id: string) => {
    const { error } = await supabase
      // @ts-ignore
      .from('translation_history')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error('Failed to delete item');
    } else {
      setHistory(prev => prev.filter(item => item.id !== id));
      toast.success('Deleted successfully');
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
              <h1 className="text-2xl font-bold ml-4">Translation History</h1>
              {history.length > 0 && (
                <Button onClick={clearHistory} variant="destructive" className="ml-auto mr-4">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear History
                </Button>
              )}
            </header>
            <div className="container mx-auto px-4 py-12 animate-fade-in">
              {loading ? (
                <div className="flex justify-center"><Loader2 className="animate-spin h-8 w-8" /></div>
              ) : history.length === 0 ? (
                <p className="text-center text-muted-foreground">No translation history yet</p>
              ) : (
                <div className="grid gap-4">
                  {history.map((item) => (
                    <Card key={item.id} className="p-6 hover-lift animate-slide-up">
                      <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(item.created_at), 'PPpp')}
                          </span>
                          <span className="text-xs text-muted-foreground bg-secondary px-2 py-1 rounded">
                            {item.translation_type}
                          </span>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteHistoryItem(item.id)}
                        >
                          <X className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground mb-2">{item.source_language}</p>
                          <p className="text-lg">{item.source_text}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground mb-2">{item.target_language}</p>
                          <p className="text-lg">{item.translated_text}</p>
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
