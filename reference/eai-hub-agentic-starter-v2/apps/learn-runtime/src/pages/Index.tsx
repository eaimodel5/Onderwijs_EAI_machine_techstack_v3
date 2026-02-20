
import React, { useState, useEffect, useRef } from "react";
import SidebarEmotionHistory from "../components/SidebarEmotionHistory";
import InputBar from "../components/InputBar";
import { useIsMobile } from "../hooks/use-mobile";
import IntroAnimation from "../components/IntroAnimation";
import { getEmotionVisuals } from "../lib/emotion-visuals";
import { useChat } from "../hooks/useChat";
import ChatView from "../components/ChatView";
import DraggableEmotionHistoryButton from "../components/DraggableEmotionHistoryButton";
import MobileUIFixes from "../components/MobileUIFixes";
import TopBar from "../components/TopBar";
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import SettingsSheet from "../components/SettingsSheet";
import { useAuth } from "../hooks/useAuth";
import { EmptyState } from "../components/EmptyState";
import { EmotionTimeline } from "../components/EmotionTimeline";
import { EmotionPulse } from "../components/EmotionPulse";

const Index = () => {
  const { isAuthorized, authorizeChat, loading } = useAuth();
  const [showIntro, setShowIntro] = useState(!isAuthorized);
  const [focusedMessageId, setFocusedMessageId] = useState<string | null>(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [showEmotionPulse, setShowEmotionPulse] = useState(false);
  const [currentEmotion, setCurrentEmotion] = useState<{ label: string; icon: keyof typeof import('lucide-react/dynamicIconImports').default; gradientClass: string } | null>(null);
  const isMobile = useIsMobile();

  const handleFinishedIntro = () => {
    setShowIntro(false);
  };

  const [settingsOpen, setSettingsOpen] = useState(false);

  const messageRefs = useRef(new Map<string, HTMLDivElement | null>());
  const messagesEndRef = useRef<HTMLDivElement>(null);

  
  // Initialize chat hook
  const { 
    messages, 
    input, 
    setInput, 
    isProcessing, 
    onSend, 
    setFeedback,
    clearHistory,
    lastError,
    retryLastMessage
  } = useChat();

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isProcessing]);

  const handleFocusMessage = (id: string) => {
    const node = messageRefs.current.get(id);
    if (node) {
      node.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
      setFocusedMessageId(id);
      setTimeout(() => setFocusedMessageId(null), 2500);
    }
    if (isMobile) {
      setHistoryOpen(false);
    }
  };

  const handleClearHistory = () => {
    clearHistory();
    if (isMobile) {
      setHistoryOpen(false);
    }
  };

  const emotionHistory = messages
    .filter((msg) => msg.from === "ai" && msg.emotionSeed)
    .map((msg) => {
      const visual = getEmotionVisuals(msg.emotionSeed);
      const messageTimestamp = msg.timestamp || new Date();
      const emotionLabel = msg.emotionSeed!;
      return {
        id: msg.id,
        icon: visual.icon,
        label: emotionLabel.charAt(0).toUpperCase() + emotionLabel.slice(1),
        colorClass: visual.colorClass,
        gradientClass: visual.gradientClass,
        time: messageTimestamp.toLocaleTimeString("nl-NL", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
    })
    .reverse();

  // Trigger emotion pulse animation for new emotions
  useEffect(() => {
    if (messages.length > 0) {
      const lastMsg = messages[messages.length - 1];
      if (lastMsg.from === 'ai' && lastMsg.emotionSeed) {
        const visual = getEmotionVisuals(lastMsg.emotionSeed);
        setCurrentEmotion({
          label: lastMsg.emotionSeed.charAt(0).toUpperCase() + lastMsg.emotionSeed.slice(1),
          icon: visual.icon,
          gradientClass: visual.gradientClass
        });
        setShowEmotionPulse(true);
      }
    }
  }, [messages]);

  // Show intro animation if not authorized
  if (showIntro && !isAuthorized) {
    return <IntroAnimation onFinished={handleFinishedIntro} />;
  }

  return (
    <>
      <MobileUIFixes />
      
      {/* Emotion Pulse Animation */}
      {showEmotionPulse && currentEmotion && (
        <EmotionPulse
          emotion={currentEmotion.label}
          icon={currentEmotion.icon}
          gradientClass={currentEmotion.gradientClass}
          onComplete={() => setShowEmotionPulse(false)}
        />
      )}
      
      <div className={`w-full bg-background font-inter flex flex-col ${isMobile ? 'h-[100dvh]' : 'h-screen'} overflow-hidden`}>
        <TopBar onSettingsClick={() => setSettingsOpen(true)} />
        <SettingsSheet
          isOpen={settingsOpen}
          onOpenChange={setSettingsOpen}
        />
        <div className={`flex-1 flex flex-col ${isMobile ? '' : ''}`}
        >
        {/* Mobile drawer voor emotie geschiedenis */}
        <Drawer open={historyOpen} onOpenChange={setHistoryOpen}>
          <DrawerTrigger asChild>
            <DraggableEmotionHistoryButton onOpen={() => setHistoryOpen(true)} />
          </DrawerTrigger>
          <DrawerContent className="p-4 max-h-[80vh]">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-center">Emotie Geschiedenis</h3>
            </div>
            <SidebarEmotionHistory
              className="flex flex-row flex-wrap justify-center gap-4 overflow-y-auto"
              history={emotionHistory}
              onFocus={handleFocusMessage}
              onClear={handleClearHistory}
            />
          </DrawerContent>
        </Drawer>

        {/* Main Content Area */}
        <div className="flex flex-1 min-h-0">
          {/* Desktop sidebar */}
          <SidebarEmotionHistory
            className="hidden md:flex flex-shrink-0"
            history={emotionHistory}
            onFocus={handleFocusMessage}
            onClear={clearHistory}
          />
          
          {/* Chat Container */}
          <main className="flex-1 flex flex-col min-h-0">
            {/* Emotion Timeline */}
            {!isMobile && emotionHistory.length > 0 && (
              <EmotionTimeline 
                history={emotionHistory}
                onFocus={handleFocusMessage}
              />
            )}
            
            {/* Scrollable Messages Area */}
            <div className={`flex-1 overflow-y-auto ${isMobile ? 'px-2 py-2' : 'px-4 py-4'}`}>
              <div className={`max-w-4xl mx-auto w-full ${isMobile ? 'max-w-full' : 'max-w-2xl'}`}>
                {/* Enhanced Empty State */}
                {(!messages || messages.length === 0) && (
                  <EmptyState onPromptClick={(prompt) => {
                    setInput(prompt);
                    // Auto-focus input (optional)
                  }} />
                )}
                
                <ChatView
                  messages={messages || []}
                  isProcessing={isProcessing}
                  messageRefs={messageRefs}
                  focusedMessageId={focusedMessageId}
                  onFeedback={setFeedback}
                  lastError={lastError}
                  onRetry={retryLastMessage}
                />
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Fixed Input Bar */}
            <div className={`flex-shrink-0 border-t border-border bg-background ${isMobile ? 'pb-safe' : ''}`}>
              <div className={`max-w-4xl mx-auto w-full ${isMobile ? 'max-w-full px-2' : 'max-w-2xl px-4'}`}>
                <InputBar
                  value={input}
                  onChange={setInput}
                  onSend={onSend}
                  disabled={isProcessing}
                />
              </div>
            </div>
          </main>
        </div>
      </div>
      </div>
    </>
  );
};

export default Index;
