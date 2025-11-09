import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Navbar } from '@/components/Navbar';
import { Languages, Image, Mic, Video, CheckCircle2, Zap, Globe, ArrowRight } from 'lucide-react';
import heroBg from '@/assets/hero-bg.jpg';
export default function Index() {
  const {
    user
  } = useAuth();
  const navigate = useNavigate();
  useEffect(() => {
    if (user) {
      // User is logged in, stay on home page
    }
  }, [user]);
  const features = [{
    icon: Languages,
    title: 'Text Translation',
    description: '50+ languages with real-time translation'
  }, {
    icon: Image,
    title: 'Image to Text',
    description: 'Extract and translate text from images'
  }, {
    icon: Mic,
    title: 'Speech Recognition',
    description: 'Speak and get instant translations'
  }, {
    icon: Video,
    title: 'Video Translation',
    description: 'Translate audio and text from videos'
  }];
  const benefits = ['Support for 50+ global and Indian languages', 'Automatic language detection', 'Text-to-speech for translations', 'Translation history and favorites', 'Grammar correction', 'Free and unlimited usage'];
  return <div className="min-h-screen">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 bg-cover bg-center" style={{
      backgroundImage: `url(${heroBg})`
    }}>
        <div className="absolute inset-0 bg-gradient-to-b from-background/95 via-background/90 to-background" />
        
        <div className="container mx-auto relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            

            <h1 className="text-5xl md:text-7xl font-bold leading-tight animate-fade-in">
              <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                Break Language
              </span>
              <br />
              <span className="text-foreground">Barriers Instantly</span>
            </h1>

            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto animate-slide-up">
              Translate text, images, and videos in 50+ languages powered by advanced AI technology
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-scale-in">
              <Button size="lg" onClick={() => navigate('/translate')} className="text-lg px-8 py-6">
                Start Translating
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              {!user && (
                <Button size="lg" variant="outline" onClick={() => navigate('/auth')} className="text-lg px-8 py-6">
                  Sign In
                </Button>
              )}
            </div>

            
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-gradient-to-b from-background to-secondary/30">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Powerful Features
              </span>
            </h2>
            <p className="text-xl text-muted-foreground">
              Everything you need for seamless multilingual communication
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index} 
                className="group p-8 rounded-2xl border-2 border-border bg-card hover:border-primary/50 transition-all duration-300 hover:shadow-2xl hover:-translate-y-2"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg">
                  <feature.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-4 bg-secondary/50">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Why Choose <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">LinguaConnect</span>
            </h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {benefits.map((benefit, index) => (
              <div 
                key={index} 
                className="flex items-start gap-4 p-6 rounded-xl bg-card border border-border hover:border-primary/50 transition-all hover-lift"
              >
                <CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                <p className="text-lg">{benefit}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-accent/20 to-primary/20" />
        <div className="container mx-auto relative z-10">
          <div className="max-w-3xl mx-auto text-center space-y-8">
            <Globe className="h-20 w-20 mx-auto text-primary animate-pulse" />
            <h2 className="text-4xl md:text-6xl font-bold">
              Ready to Connect with the <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">World?</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Join thousands of users breaking language barriers every day. Start translating for free now.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button size="lg" onClick={() => navigate('/translate')} className="text-lg px-10 py-6 shadow-lg">
                <Zap className="mr-2 h-5 w-5" />
                Start Translating Now
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-border bg-secondary/30">
        <div className="container mx-auto">
          <div className="flex flex-col items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-gradient-to-br from-primary to-accent">
                <Languages className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                LinguaConnect
              </span>
            </div>
            <p className="text-muted-foreground text-center max-w-md">
              Breaking language barriers with AI-powered translation technology
            </p>
            <p className="text-sm text-muted-foreground">
              © 2025 LinguaConnect. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>;
}