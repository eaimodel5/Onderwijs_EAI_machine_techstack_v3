
import React from 'react';
import ChatBubble from "./ChatBubble";
import { Message } from '../types';
import { ConversationHealthMonitor } from './ConversationHealthMonitor';
import { LoadingStateIndicator } from './LoadingStateIndicator';
import { TypingIndicator } from './TypingIndicator';
import { ErrorState } from './ErrorState';

interface ChatViewProps {
    messages: Message[];
    isProcessing: boolean;
    messageRefs: React.MutableRefObject<Map<string, HTMLDivElement | null>>;
    focusedMessageId: string | null;
    onFeedback?: (messageId: string, feedback: 'like' | 'dislike') => void;
    lastError?: string | null;
    onRetry?: () => void;
}

const ChatView: React.FC<ChatViewProps> = ({ 
    messages, 
    isProcessing, 
    messageRefs, 
    focusedMessageId, 
    onFeedback,
    lastError,
    onRetry
}) => {
    // Convert label to match ChatBubble's expected type
    const convertLabel = (label?: 'Valideren' | 'Reflectievraag' | 'Suggestie' | 'Interventie' | 'Fout' | null) => {
        if (label === 'Interventie') {
            return 'Suggestie'; // Map Interventie to Suggestie for ChatBubble compatibility
        }
        return label as 'Valideren' | 'Reflectievraag' | 'Suggestie' | 'Fout' | null;
    };

    return (
        <div className="space-y-3 pb-4">
            {/* System Health Monitor */}
            {messages && messages.length > 0 && (
                <div className="mb-3">
                    <ConversationHealthMonitor />
                </div>
            )}

            {/* Prominent Error Display */}
            {lastError && onRetry && (
                <ErrorState 
                    error={lastError} 
                    onRetry={onRetry}
                    className="mb-4"
                />
            )}
            
            {messages && messages.length > 0 && (
                messages.map((msg) => (
                    <ChatBubble
                        key={msg.id}
                        id={msg.id}
                        ref={(el) => {
                            if (el) {
                                messageRefs.current.set(msg.id, el);
                            } else {
                                messageRefs.current.delete(msg.id);
                            }
                        }}
                        isFocused={msg.id === focusedMessageId}
                        from={msg.from}
                        label={convertLabel(msg.label)}
                        emotionSeed={msg.emotionSeed}
                        animate={!!msg.animate}
                        feedback={msg.feedback}
                        symbolicInferences={msg.symbolicInferences}
                        v20Metadata={msg.v20Metadata}
                        explainText={msg.explainText}
                        meta={msg.meta}
                        onFeedback={msg.from === 'ai' && onFeedback ? (feedbackType) => onFeedback(msg.id, feedbackType) : undefined}
                    >
                        {msg.content}
                    </ChatBubble>
                ))
            )}
            
            {isProcessing && (
                <>
                    <TypingIndicator className="mb-2" />
                    <LoadingStateIndicator className="mb-4" />
                </>
            )}
        </div>
    );
};

export default ChatView;
