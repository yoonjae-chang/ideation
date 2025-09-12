'use client';

import { useState, useEffect } from "react";
import { useChat } from '@ai-sdk/react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Bot, User, X } from "lucide-react";

interface IdeaModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function IdeaModal({
    isOpen,
    onClose,
  }: IdeaModalProps) {
    const [input, setInput] = useState('');
    const [lastSubmitTime, setLastSubmitTime] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { messages, sendMessage } = useChat();

    // Close on ESC key
    useEffect(() => {
      const handleEsc = (event: KeyboardEvent) => {
        if (event.key === "Escape") onClose();
      };
      document.addEventListener("keydown", handleEsc);
      return () => document.removeEventListener("keydown", handleEsc);
    }, [onClose]);
  
    useEffect(() => {
    if (isOpen) {
      // Lock scroll
      document.body.style.overflow = "hidden";
    } else {
      // Unlock scroll
      document.body.style.overflow = "";
    }
  
    // Cleanup on unmount
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);
  
    if (!isOpen) return null;
  
    return (
      <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onClick={onClose}
      >
        <div
                className="bg-card border-2 border-accent rounded-xl shadow-2xl max-h-[85vh] w-full max-w-4xl transform transition-all duration-300 scale-100 opacity-100 flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-border">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-accent to-accent/80 rounded-lg flex items-center justify-center">
                            <Bot className="w-6 h-6 text-primary-foreground" />
          </div>
                        <div>
                            <h2 className="text-xl font-bold text-foreground">AI Ideation Assistant</h2>
                                <p className="text-sm text-sub-foreground">Let&apos;s prototype and generate amazing ideas together</p>
              </div>
            </div>
                    <Button
                        onClick={onClose}
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 hover:bg-accent/20"
                    >
                        <X className="w-4 h-4" />
                    </Button>
            </div>
            
                {/* Chat Messages */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4 min-h-0">
                    {messages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
                            <div className="w-16 h-16 bg-gradient-to-br from-accent to-accent/80 rounded-full flex items-center justify-center">
                                <Bot className="w-8 h-8 text-primary-foreground" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-foreground mb-2">Welcome to AI Ideation!</h3>
                                <p className="text-sub-foreground max-w-md">
                                    I&apos;m here to help you generate, refine, and prototype amazing ideas. 
                                    Tell me about your project, goals, or what you&apos;d like to create!
                                </p>
                </div>
              </div>
                    ) : (
                        messages.map((message) => (
                            <div
                                key={message.id}
                                className={`flex items-start space-x-3 ${
                                    message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                                }`}
                            >
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                                    message.role === 'user' 
                                        ? 'bg-accent text-primary-foreground' 
                                        : 'bg-gradient-to-br from-accent to-accent/80 text-primary-foreground'
                                }`}>
                                    {message.role === 'user' ? (
                                        <User className="w-4 h-4" />
                                    ) : (
                                        <Bot className="w-4 h-4" />
                      )}
                    </div>
                                <div className={`flex-1 max-w-[80%] ${
                                    message.role === 'user' ? 'text-right' : 'text-left'
                                }`}>
                                    <div className={`inline-block p-3 rounded-lg ${
                                        message.role === 'user'
                                            ? 'bg-accent text-primary-foreground'
                                            : 'bg-muted text-foreground border border-border'
                                    }`}>
                                        <div className="whitespace-pre-wrap text-sm leading-relaxed">
                                            {message.parts.map((part, i) => {
                                                switch (part.type) {
                                                    case 'text':
                                                        return <span key={i}>{part.text}</span>;
                                                    default:
                                                        return null;
                                                }
                                            })}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                    {isSubmitting && (
                        <div className="flex items-start space-x-3">
                            <div className="w-8 h-8 bg-gradient-to-br from-accent to-accent/80 rounded-full flex items-center justify-center">
                                <Bot className="w-4 h-4 text-primary-foreground" />
                  </div>
                            <div className="bg-muted border border-border p-3 rounded-lg">
                                <div className="flex space-x-1">
                                    <div className="w-2 h-2 bg-sub-foreground rounded-full animate-bounce"></div>
                                    <div className="w-2 h-2 bg-sub-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                    <div className="w-2 h-2 bg-sub-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
                    )}
                </div>

                {/* Input Form */}
                <div className="border-t border-border p-6">
                    <form onSubmit={async (e) => {
                        e.preventDefault();
                        
                        const now = Date.now();
                        const timeSinceLastSubmit = now - lastSubmitTime;
                        
                        // Prevent double submissions (debounce with 1 second)
                        if (timeSinceLastSubmit < 1000) {
                            return;
                        }
                        
                        if (input.trim() && !isSubmitting) {
                            setLastSubmitTime(now);
                            setIsSubmitting(true);
                            const messageText = input.trim();
                            setInput(''); // Clear input immediately
                            
                            try {
                                sendMessage({ text: messageText });
                            } finally {
                                // Reset submitting state after a short delay
                                setTimeout(() => setIsSubmitting(false), 2000);
                            }
                        }
                    }} className="flex space-x-3">
                        <Input
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Describe your idea, ask for suggestions, or request help with prototyping..."
                            className="flex-1 border-2 border-accent/40 focus:border-accent"
                            disabled={isSubmitting}
                        />
            <Button
                            type="submit"
                            disabled={isSubmitting || !input.trim()}
                            className="px-4 py-2 bg-accent hover:bg-accent/90 text-primary-foreground"
            >
                            <Send className="w-4 h-4" />
            </Button>
                    </form>
                    <p className="text-xs text-sub-foreground mt-2 text-center">
                        Press Enter to send • ESC to close
                    </p>
          </div>
        </div>
      </div>
    );
  }
