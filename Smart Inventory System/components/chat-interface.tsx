"use client";

import { useState, useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Loader2, Send, Bot, User, X, Minimize2, Maximize2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface ChatMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: string;
}

interface ChatInterfaceProps {
  isOpen: boolean;
  onClose: () => void;
  onMinimize?: () => void;
  isMinimized?: boolean;
}

export function ChatInterface({ isOpen, onClose, onMinimize, isMinimized }: ChatInterfaceProps) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Initialize socket connection
  useEffect(() => {
    if (isOpen && !socket) {
      const newSocket = io('http://localhost:3001', {
        withCredentials: true,
        transports: ['websocket', 'polling']
      });

      newSocket.on('connect', () => {
        console.log('Connected to chatbot server');
        setIsConnected(true);
        setSocket(newSocket);
        
        // Initialize chat session
        const newSessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        setSessionId(newSessionId);
        newSocket.emit('initChat', { sessionId: newSessionId });
      });

      newSocket.on('disconnect', () => {
        console.log('Disconnected from chatbot server');
        setIsConnected(false);
      });

      newSocket.on('connect_error', (error) => {
        console.error('Connection error:', error);
        setIsConnected(false);
        toast({
          title: "Connection Error",
          description: "Unable to connect to the AI assistant. Please try again later.",
          variant: "destructive",
        });
      });

      newSocket.on('chatInitialized', (data) => {
        const welcomeMessage: ChatMessage = {
          id: `welcome_${Date.now()}`,
          content: data.message,
          role: 'assistant',
          timestamp: new Date().toISOString()
        };
        setMessages([welcomeMessage]);
      });

      newSocket.on('chatResponse', (data) => {
        const aiMessage: ChatMessage = {
          id: data.messageId || `ai_${Date.now()}`,
          content: data.message,
          role: 'assistant',
          timestamp: data.timestamp
        };
        setMessages(prev => [...prev, aiMessage]);
      });

      newSocket.on('botTyping', (data) => {
        setIsTyping(data.typing);
      });

      newSocket.on('chatError', (data) => {
        toast({
          title: "Chat Error",
          description: data.error,
          variant: "destructive",
        });
        setIsTyping(false);
      });

      return () => {
        newSocket.disconnect();
      };
    }
  }, [isOpen, socket, toast]);

  // Cleanup socket on component unmount
  useEffect(() => {
    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [socket]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && !isMinimized && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen, isMinimized]);

  const sendMessage = async () => {
    if (!inputMessage.trim() || !socket || !sessionId) return;

    const userMessage: ChatMessage = {
      id: `user_${Date.now()}`,
      content: inputMessage.trim(),
      role: 'user',
      timestamp: new Date().toISOString()
    };

    // Add user message to chat
    setMessages(prev => [...prev, userMessage]);
    
    // Send to backend
    socket.emit('chatMessage', {
      sessionId,
      message: inputMessage.trim(),
      userId: 'current_user' // Replace with actual user ID if available
    });

    // Clear input
    setInputMessage("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!isOpen) return null;

  return (
    <Card className={cn(
      "fixed z-50 transition-all duration-300 ease-in-out",
      isMinimized 
        ? "bottom-4 right-4 w-80 h-16" 
        : "bottom-4 right-4 w-96 h-[600px] shadow-2xl"
    )}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-4 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-t-lg">
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-white text-purple-600">
              <Bot className="h-4 w-4" />
            </AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-sm font-medium">AI Assistant</CardTitle>
            {!isMinimized && (
              <div className="flex items-center gap-2 text-xs opacity-90">
                <div className={cn(
                  "w-2 h-2 rounded-full",
                  isConnected ? "bg-green-400" : "bg-red-400"
                )} />
                {isConnected ? "Connected" : "Disconnected"}
              </div>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-1">
          {onMinimize && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-white hover:bg-white/20"
              onClick={onMinimize}
            >
              {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-white hover:bg-white/20"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      {!isMinimized && (
        <CardContent className="flex flex-col h-full p-0">
          {/* Messages Area */}
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "flex gap-3",
                    message.role === 'user' ? "justify-end" : "justify-start"
                  )}
                >
                  {message.role === 'assistant' && (
                    <Avatar className="h-8 w-8 mt-0.5">
                      <AvatarFallback className="bg-purple-100 text-purple-600">
                        <Bot className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                  
                  <div
                    className={cn(
                      "max-w-[80%] rounded-lg px-3 py-2 text-sm",
                      message.role === 'user'
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-900 border"
                    )}
                  >
                    <div className="whitespace-pre-wrap">{message.content}</div>
                    <div className={cn(
                      "text-xs mt-1 opacity-70",
                      message.role === 'user' ? "text-blue-100" : "text-gray-500"
                    )}>
                      {new Date(message.timestamp).toLocaleTimeString()}
                    </div>
                  </div>

                  {message.role === 'user' && (
                    <Avatar className="h-8 w-8 mt-0.5">
                      <AvatarFallback className="bg-blue-100 text-blue-600">
                        <User className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}

              {/* Typing Indicator */}
              {isTyping && (
                <div className="flex gap-3 justify-start">
                  <Avatar className="h-8 w-8 mt-0.5">
                    <AvatarFallback className="bg-purple-100 text-purple-600">
                      <Bot className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="bg-gray-100 border rounded-lg px-3 py-2">
                    <div className="flex items-center gap-1">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      <span className="text-sm text-gray-600">Thinking...</span>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Input Area */}
          <div className="border-t p-4">
            <div className="flex gap-2">
              <Input
                ref={inputRef}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me about inventory management..."
                disabled={!isConnected || isTyping}
                className="flex-1"
              />
              <Button
                onClick={sendMessage}
                disabled={!inputMessage.trim() || !isConnected || isTyping}
                size="sm"
                className="px-3"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            
            {!isConnected && (
              <div className="mt-2 text-center">
                <Badge variant="destructive" className="text-xs">
                  Disconnected - Trying to reconnect...
                </Badge>
              </div>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  );
}