import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import { LANGUAGES } from '@/utils/languages';
import { translateText } from '@/utils/translationService';
import { Trophy, RefreshCw, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const SAMPLE_WORDS = [
  'hello', 'goodbye', 'thank you', 'please', 'yes', 'no',
  'water', 'food', 'help', 'friend', 'family', 'love',
  'happy', 'sad', 'beautiful', 'good', 'bad', 'big',
  'small', 'hot', 'cold', 'day', 'night', 'time'
];

export default function Quiz() {
  const [targetLang, setTargetLang] = useState('es');
  const [currentWord, setCurrentWord] = useState('');
  const [correctAnswer, setCorrectAnswer] = useState('');
  const [options, setOptions] = useState<string[]>([]);
  const [score, setScore] = useState(0);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [answered, setAnswered] = useState(false);

  useEffect(() => {
    generateQuestion();
  }, [targetLang]);

  const generateQuestion = async () => {
    setLoading(true);
    setAnswered(false);
    
    try {
      // Pick a random word
      const word = SAMPLE_WORDS[Math.floor(Math.random() * SAMPLE_WORDS.length)];
      setCurrentWord(word);

      // Get correct translation
      const correct = await translateText(word, 'en', targetLang);
      setCorrectAnswer(correct);

      // Generate wrong options
      const wrongWords = SAMPLE_WORDS.filter(w => w !== word).slice(0, 3);
      const wrongTranslations = await Promise.all(
        wrongWords.map(w => translateText(w, 'en', targetLang))
      );

      // Shuffle options
      const allOptions = [correct, ...wrongTranslations].sort(() => Math.random() - 0.5);
      setOptions(allOptions);
    } catch (error) {
      toast.error('Failed to generate question');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (selected: string) => {
    if (answered) return;
    
    setAnswered(true);
    setTotal(prev => prev + 1);
    
    if (selected === correctAnswer) {
      setScore(prev => prev + 1);
      toast.success('Correct! 🎉');
    } else {
      toast.error(`Wrong! The answer was: ${correctAnswer}`);
    }

    setTimeout(() => {
      generateQuestion();
    }, 2000);
  };

  const resetQuiz = () => {
    setScore(0);
    setTotal(0);
    generateQuestion();
  };

  const accuracy = total > 0 ? Math.round((score / total) * 100) : 0;

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col">
          <header className="h-16 flex items-center border-b border-border sticky top-0 bg-background/80 backdrop-blur-lg z-50">
            <SidebarTrigger className="ml-4" />
            <h1 className="text-2xl font-bold ml-4">Language Quiz</h1>
          </header>
          <div className="container mx-auto px-4 py-12 animate-fade-in">
            <div className="max-w-2xl mx-auto space-y-6">
              {/* Score Card */}
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Trophy className="h-6 w-6 text-accent" />
                    <div>
                      <p className="text-2xl font-bold">{score} / {total}</p>
                      <p className="text-sm text-muted-foreground">Accuracy: {accuracy}%</p>
                    </div>
                  </div>
                  <Button variant="outline" onClick={resetQuiz}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Reset
                  </Button>
                </div>
                {total > 0 && <Progress value={accuracy} className="h-2" />}
              </Card>

              {/* Language Selection */}
              <Card className="p-6">
                <label className="text-sm font-medium mb-2 block">Target Language</label>
                <Select value={targetLang} onValueChange={setTargetLang}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {LANGUAGES.filter(l => l.code !== 'en').map(lang => (
                      <SelectItem key={lang.code} value={lang.code}>
                        {lang.flag} {lang.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Card>

              {/* Quiz Question */}
              {loading ? (
                <Card className="p-12">
                  <div className="flex justify-center">
                    <Loader2 className="animate-spin h-8 w-8" />
                  </div>
                </Card>
              ) : (
                <Card className="p-8 hover-lift">
                  <div className="text-center mb-8">
                    <p className="text-sm text-muted-foreground mb-2">Translate this word:</p>
                    <h2 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                      {currentWord}
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {options.map((option, index) => (
                      <Button
                        key={index}
                        variant={answered ? (option === correctAnswer ? 'default' : 'outline') : 'outline'}
                        className={`h-20 text-lg ${
                          answered && option === correctAnswer ? 'bg-green-500 hover:bg-green-600' : ''
                        } ${
                          answered && option !== correctAnswer ? 'opacity-50' : ''
                        }`}
                        onClick={() => handleAnswer(option)}
                        disabled={answered}
                      >
                        {option}
                      </Button>
                    ))}
                  </div>
                </Card>
              )}

              <p className="text-center text-sm text-muted-foreground">
                Practice translating common words and improve your language skills!
              </p>
            </div>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
}
