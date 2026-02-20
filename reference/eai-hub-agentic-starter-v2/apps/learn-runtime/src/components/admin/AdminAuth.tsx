
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { Brain, Shield, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

interface AdminAuthProps {
  onAuthenticated: () => void;
}

const AdminAuth: React.FC<AdminAuthProps> = ({ onAuthenticated }) => {
  const [password, setPassword] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!password.trim()) {
      toast({
        title: "Wachtwoord vereist",
        description: "Voer een wachtwoord in.",
        variant: "destructive",
      });
      return;
    }

    setIsAuthenticating(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('evai-admin', {
        body: { operation: 'auth', password }
      });
      
      if (error) {
        console.error('Admin auth error:', error);
        toast({
          title: "Authenticatie fout",
          description: "Er is een fout opgetreden tijdens authenticatie.",
          variant: "destructive",
        });
        return;
      }
      
      if (data?.authenticated) {
        onAuthenticated();
        toast({
          title: "Toegang verleend",
          description: "Welkom in het EvAI Admin Dashboard.",
        });
      } else {
        toast({
          title: "Verkeerd wachtwoord",
          description: "De ingevoerde code is onjuist.",
          variant: "destructive",
        });
        setPassword('');
      }
    } catch (error) {
      console.error('Authentication error:', error);
      toast({
        title: "Authenticatie gefaald",
        description: "Kan geen verbinding maken met authenticatie service.",
        variant: "destructive"
      });
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleBack = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center pb-4">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full">
              <Shield className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-lg sm:text-xl font-bold bg-gradient-to-r from-purple-700 via-blue-700 to-indigo-700 bg-clip-text text-transparent">
            EvAI Admin Toegang
          </CardTitle>
          <CardDescription className="text-gray-600 text-sm sm:text-base">
            Voer het admin wachtwoord in om toegang te krijgen tot het dashboard.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <form onSubmit={(e) => { e.preventDefault(); handleLogin(); }} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-gray-700">
                Admin Wachtwoord
              </label>
              <Input
                id="password"
                type="password"
                placeholder="Voer wachtwoord in..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="text-center"
                autoFocus
              />
            </div>

            <Button type="submit" className="w-full" disabled={isAuthenticating}>
              <Brain className="h-4 w-4 mr-2" />
              {isAuthenticating ? 'Authenticeren...' : 'Toegang Verkrijgen'}
            </Button>
          </form>
          
          <Button 
            variant="outline" 
            onClick={handleBack}
            className="w-full"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Terug naar Hoofdpagina
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminAuth;
