
import React from 'react';
import { ArrowLeft, CheckCircle, Settings, Database, BarChart, Monitor, Lightbulb, Zap, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { useIsMobile } from '../hooks/use-mobile';

const AdminGuide = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const handleBackClick = () => {
    navigate('/admin');
  };

  const steps = [
    {
      id: 1,
      title: "API Configuratie",
      description: "Configureer je OpenAI API keys voor optimale prestaties",
      icon: Settings,
      color: "bg-blue-500",
      tasks: [
        "Ga naar het tandwiel-icoon (⚙️) rechtsboven in de chat",
        "Vul je OpenAI API Key in voor de hoofdfunctionaliteit",
        "Optioneel: Voeg een tweede API Key toe voor geavanceerde analyse",
        "Optioneel: Configureer Vector API Key voor neurale zoekfuncties"
      ]
    },
    {
      id: 2,
      title: "Kennisbank Opbouwen",
      description: "Train de AI met relevante emotionele situaties",
      icon: Database,
      color: "bg-green-500",
      tasks: [
        "Ga naar de tab 'Kennisbank' in het admin dashboard",
        "Bekijk de bestaande emotion seeds in de Advanced Seed Manager",
        "Voeg handmatig nieuwe seeds toe voor specifieke situaties",
        "Gebruik de Autonomous AI Mode voor automatische seed generatie",
        "Controleer de Seed Learning Log voor inzicht in AI leerprocessen"
      ]
    },
    {
      id: 3,
      title: "Prestatie Monitoring",
      description: "Monitor hoe goed de AI presteert in gesprekken",
      icon: BarChart,
      color: "bg-orange-500",
      tasks: [
        "Ga naar de tab 'Analyse' om rubric-gebaseerde prestaties te bekijken",
        "Bekijk de rubrieken voor gedetailleerde analyse",
        "Bekijk feedback statistieken in de Data tab",
        "Monitor emotie detectie accuratesse en response kwaliteit"
      ]
    },
    {
      id: 4,
      title: "Systeem Gezondheid",
      description: "Zorg ervoor dat alle onderdelen correct functioneren",
      icon: Monitor,
      color: "bg-purple-500",
      tasks: [
        "Ga naar de tab 'Systeem' voor technische configuratie",
        "Controleer de Supabase verbindingsstatus",
        "Bekijk de Neurosymbolic Architecture voor systeemoverzicht",
        "Monitor API response tijden en foutmeldingen"
      ]
    }
  ];

  const tips = [
    {
      icon: Lightbulb,
      title: "Performance Tip",
      description: "Embedding generatie is nu geoptimaliseerd - het systeem creëert alleen embeddings wanneer echt nodig."
    },
    {
      icon: Zap,
      title: "Smart Features",
      description: "De AI leert automatisch van gesprekken en past zijn responses aan op basis van feedback."
    },
    {
      icon: Shield,
      title: "Data Privacy",
      description: "Alle data wordt veilig opgeslagen in je eigen Supabase instance met user-specifieke toegang."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 font-inter">
      {/* Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 via-blue-600/10 to-indigo-600/10" />
        <div className="relative container mx-auto px-3 sm:px-4 py-4 sm:py-6">
          <div className="flex items-center gap-2 sm:gap-3 mb-4">
            <Button
              variant="ghost"
              size={isMobile ? "sm" : "default"}
              onClick={handleBackClick}
              className="flex items-center gap-1.5 sm:gap-2 hover:bg-white/60 backdrop-blur-sm border border-white/20 bg-white/50"
            >
              <ArrowLeft size={isMobile ? 16 : 18} />
              <span className="text-sm sm:text-base">Terug naar Admin</span>
            </Button>
          </div>
          
          <div className="text-center">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-purple-700 via-blue-700 to-indigo-700 bg-clip-text text-transparent mb-2">
              EvAI Admin Handleiding
            </h1>
            <p className="text-gray-600 text-sm sm:text-base max-w-2xl mx-auto">
              Stap-voor-stap gids om EvAI optimaal te configureren en gebruiken
            </p>
            <Badge variant="secondary" className="bg-purple-100 text-purple-800 mt-2">
              v5.6 Pro Guide
            </Badge>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6">
        {/* Quick Start Steps */}
        <div className="space-y-6 mb-8">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 text-center mb-6">
            Quick Start in 4 Stappen
          </h2>
          
          <div className="grid gap-4 sm:gap-6">
            {steps.map((step, index) => (
              <Card key={step.id} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className={`${step.color} p-2 rounded-lg flex-shrink-0`}>
                      <step.icon className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg flex items-center gap-2">
                        Stap {step.id}: {step.title}
                        <Badge variant="outline" className="text-xs">
                          {index === 0 ? 'Start hier' : `${index + 1}/4`}
                        </Badge>
                      </CardTitle>
                      <CardDescription className="text-sm">
                        {step.description}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-2">
                    {step.tasks.map((task, taskIndex) => (
                      <div key={taskIndex} className="flex items-start gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">{task}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Tips Section */}
        <div className="space-y-6">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 text-center">
            Pro Tips & Features
          </h2>
          
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {tips.map((tip, index) => (
              <Card key={index} className="text-center">
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center space-y-3">
                    <div className="p-3 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full">
                      <tip.icon className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="font-semibold text-gray-800">{tip.title}</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {tip.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Getting Started CTA */}
        <div className="mt-8 text-center">
          <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
            <CardContent className="pt-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Klaar om te beginnen?
              </h3>
              <p className="text-gray-600 mb-4 text-sm">
                Start met stap 1 en werk je weg door de handleiding voor optimale resultaten.
              </p>
              <Button
                onClick={handleBackClick}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              >
                Ga naar Admin Dashboard
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminGuide;
