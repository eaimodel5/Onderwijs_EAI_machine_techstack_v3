
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Heart, Brain, Sparkles, Shield, Zap, Eye, ChevronRight, ChevronLeft } from 'lucide-react';

const IntroAnimation = ({ onFinished }: { onFinished: () => void }) => {
  const [step, setStep] = useState(0);
  const [animationState, setAnimationState] = useState('in');
  const { authorizeChat } = useAuth();

  useEffect(() => {
    authorizeChat();
  }, [authorizeChat]);

  const handleNext = () => {
    if (step < 2) {
      setStep(step + 1);
    } else {
      setAnimationState('out');
      setTimeout(() => onFinished(), 500);
    }
  };

  const handlePrev = () => {
    if (step > 0) setStep(step - 1);
  };

  const handleSkip = () => {
    setAnimationState('out');
    setTimeout(() => onFinished(), 500);
  };

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <div className="text-center space-y-8 animate-fade-slide-in">
            {/* Animated logo */}
            <div className="relative mx-auto w-32 h-32 mb-8">
              <div className="absolute inset-0 bg-gradient-to-br from-primary-coral/30 to-primary-purple/30 blur-3xl animate-pulse" />
              <div className="relative w-32 h-32 rounded-3xl bg-gradient-to-br from-primary-coral to-primary-purple flex items-center justify-center shadow-glow spring">
                <Heart className="h-16 w-16 text-white" />
              </div>
            </div>

            <div className="space-y-4">
              <h1 className="text-5xl font-display font-bold gradient-text">
                Welkom bij EvAI
              </h1>
              <p className="text-xl text-muted-foreground max-w-lg mx-auto leading-relaxed">
                Je empathische AI-partner voor emotionele intelligentie en persoonlijke groei
              </p>
            </div>
          </div>
        );

      case 1:
        return (
          <div className="text-center space-y-8 animate-fade-slide-in">
            <h2 className="text-3xl font-display font-bold gradient-text">
              Wat maakt EvAI uniek?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto mt-8">
              {[
                { 
                  icon: Heart, 
                  title: "Empathisch", 
                  desc: "Herkent en begrijpt je emoties met geavanceerde AI",
                  gradient: "from-primary-coral to-rose-500"
                },
                { 
                  icon: Brain, 
                  title: "Neurosymbolisch", 
                  desc: "Combineert neural AI met symbolische regels voor betrouwbare antwoorden",
                  gradient: "from-primary-purple to-violet-500"
                },
                { 
                  icon: Sparkles, 
                  title: "Adaptief", 
                  desc: "Past zich aan jouw behoeften aan met zelflerend systeem",
                  gradient: "from-teal-cyan to-blue-500"
                }
              ].map((feature, i) => (
                <div 
                  key={i} 
                  className="glass-strong p-6 rounded-2xl border border-border/20 hover:scale-105 hover:shadow-glow-sm transition-all duration-300 group"
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  <div className={`w-14 h-14 mx-auto mb-4 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center shadow-elegant group-hover:shadow-glow-sm transition-all duration-300`}>
                    <feature.icon className="h-7 w-7 text-white" />
                  </div>
                  <h3 className="font-semibold mb-2 text-lg">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="text-center space-y-8 animate-fade-slide-in">
            <h2 className="text-3xl font-display font-bold gradient-text">
              Hoe werkt EvAI?
            </h2>
            <div className="space-y-4 max-w-2xl mx-auto">
              {[
                { 
                  icon: Eye, 
                  title: "Emotie Detectie", 
                  desc: "Analyseert je bericht met lokale AI voor snelle en veilige verwerking",
                  color: "from-primary-coral/20 to-rose-500/20"
                },
                { 
                  icon: Brain, 
                  title: "Intelligente Verwerking", 
                  desc: "14-laags v20 pipeline combineert emotie-analyse, veiligheid en context",
                  color: "from-primary-purple/20 to-violet-500/20"
                },
                { 
                  icon: Shield, 
                  title: "Veiligheid & Privacy", 
                  desc: "Rubrics-engine en safety checks zorgen voor ethische en betrouwbare antwoorden",
                  color: "from-teal-cyan/20 to-blue-500/20"
                },
                { 
                  icon: Zap, 
                  title: "Transparantie", 
                  desc: "Zie precies hoe EvAI tot een antwoord komt met volledige metadata",
                  color: "from-amber-500/20 to-orange-500/20"
                }
              ].map((step, i) => (
                <div 
                  key={i} 
                  className="glass-strong p-5 rounded-xl border border-border/20 flex items-start gap-4 text-left hover:scale-[1.02] transition-all duration-300"
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${step.color} backdrop-blur-sm flex items-center justify-center flex-shrink-0`}>
                    <step.icon className="h-6 w-6 text-foreground" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold mb-1">{step.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div
      className={`fixed inset-0 bg-background z-50 flex flex-col items-center justify-center p-4 transition-opacity duration-500 ${
        animationState === 'in' ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <div className="w-full max-w-3xl">
        <div className="min-h-[500px] flex items-center justify-center">
          {renderStep()}
        </div>
        
        {/* Progress dots */}
        <div className="flex justify-center items-center gap-2 mt-12 mb-6">
          {[0, 1, 2].map((i) => (
            <button
              key={i}
              onClick={() => setStep(i)}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === step 
                  ? 'w-8 bg-gradient-to-r from-primary-coral to-primary-purple shadow-glow-sm' 
                  : 'w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50'
              }`}
              aria-label={`Go to step ${i + 1}`}
            />
          ))}
        </div>

        {/* Navigation buttons */}
        <div className="flex justify-between items-center gap-4">
          <Button 
            onClick={handleSkip}
            variant="ghost"
            className="glass hover:glass-strong"
          >
            Overslaan
          </Button>

          <div className="flex gap-3">
            {step > 0 && (
              <Button 
                onClick={handlePrev}
                variant="outline"
                className="glass hover:glass-strong"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Vorige
              </Button>
            )}
            <Button 
              onClick={handleNext} 
              size="lg" 
              className="min-w-32 bg-gradient-to-r from-primary-coral to-primary-purple hover:shadow-glow transition-all duration-300 hover:scale-105 group"
            >
              {step === 2 ? 'Start gesprek' : 'Volgende'}
              {step < 2 && <ChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform duration-300" />}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IntroAnimation;
