
import { Suspense, lazy, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner, toast } from "@/components/ui/sonner";
import { AuthProvider } from "@/hooks/useAuth";
import { useBrowserTransformerEngine } from "@/hooks/useBrowserTransformerEngine";
import { ConsentBanner } from "@/components/ConsentBanner";
import { supabase } from "@/integrations/supabase/client";

const Index = lazy(() => import("./pages/Index"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const AdminGuide = lazy(() => import("./pages/AdminGuide"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

const AppContent = () => {
  const { preloadModel } = useBrowserTransformerEngine();

  // Preload ML model in background on app mount (non-blocking)
  useEffect(() => {
    const loadModel = async () => {
      try {
        console.log('🚀 App: Preloading Browser Transformer model...');
        await preloadModel();
      } catch (error) {
        console.warn('⚠️ App: ML model preload failed (app will continue without browser ML):', error);
        
        // Show user-friendly notification
        toast.info('Browser AI niet beschikbaar', {
          description: 'EvAI gebruikt nu Edge Functions voor emotie-detectie. Privacy blijft gewaarborgd.',
          duration: 5000,
        });
      }
    };
    loadModel();
  }, [preloadModel]);

  // Check knowledge base status on startup
  useEffect(() => {
    const checkKnowledgeBase = async () => {
      try {
        const { count, error } = await supabase
          .from('unified_knowledge')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', '00000000-0000-0000-0000-000000000001')
          .eq('active', true);
        
        if (error) {
          console.error('⚠️ Knowledge base check failed:', error);
          return;
        }
        
        if (!count || count === 0) {
          console.warn('⚠️ Knowledge Base is leeg!');
          toast.warning('Knowledge Base is leeg!', {
            description: 'EvAI draait nu in pure OpenAI modus. Ga naar Admin → Seed Manager om de knowledge base te vullen.',
            duration: 10000
          });
        } else {
          console.log(`✅ Knowledge Base actief: ${count} items`);
        }
      } catch (error) {
        console.error('⚠️ Knowledge base check error:', error);
      }
    };
    
    // Run check after a short delay to avoid blocking initial render
    const timer = setTimeout(checkKnowledgeBase, 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <BrowserRouter>
      <Suspense fallback={<div>Loading...</div>}>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/guide" element={<AdminGuide />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <ConsentBanner />
        <AppContent />
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
