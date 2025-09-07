import React, { useState, useRef, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import GlobalButtons from '@/components/GlobalButtons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Send, Bot, User, Heart, Calendar, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';


import { API_BASE } from '@/lib/config';
import { toast } from 'sonner';


interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

const AIChat = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: "Hello! I'm PulseBot 🤖💙, your mental wellness companion. I'm here to provide immediate support and guidance. How are you feeling today?",
      sender: 'ai',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  // Simple conversational memory
  const [memory, setMemory] = useState<{ topic?: string; lastPromptKey?: string; triedTechnique?: 'yes' | 'no' | undefined }>({});
  const [lastTopic, setLastTopic] = useState<string | undefined>(undefined);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);

  // Persist memory per session (lightweight)
  useEffect(() => {
    try {
      const saved = localStorage.getItem('aichat_memory');
      if (saved) setMemory(JSON.parse(saved));
      let sid = localStorage.getItem('chat_session_id');
      if (!sid) {
        try {
          // Generate a lightweight session id
          const rand = Math.random().toString(36).slice(2);
          sid = `sess_${Date.now()}_${rand}`;
        } catch {
          sid = `sess_${Date.now()}`;
        }
        localStorage.setItem('chat_session_id', sid);
      }
      setSessionId(sid);
    } catch {}
  }, []);

  useEffect(() => {
    try { localStorage.setItem('aichat_memory', JSON.stringify(memory)); } catch {}
  }, [memory]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Backend-powered responses via FastAPI

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    try {
      // Map affirmative short replies to an 'explain more' intent if we have a lastTopic
      const lower = userMessage.content.toLowerCase().trim();
      const affirmative = /^(yes|yeah|yep|y|sure|ok|okay|please|pls|plz|s)$/i.test(lower) || lower.includes('yes please') || lower.includes('yes plz');
      const outboundMessage = affirmative && lastTopic ? 'explain more' : userMessage.content;

      const res = await fetch(`${API_BASE}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: outboundMessage, session_id: sessionId ?? undefined }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.detail || `Server error (${res.status})`);
      }

      const data: { reply: string; last_topic?: string } = await res.json();
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: data.reply,
        sender: 'ai',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiResponse]);
      setLastTopic(data.last_topic);
    } catch (e: any) {
      // Fallback to local rule-based response if server is down
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: getAIResponse(inputMessage),
        sender: 'ai',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiResponse]);
      // Optionally surface a toast once
      // toast.error(e?.message || 'Using offline response');
    } finally {
      setIsTyping(false);
    }
  };

  const getAIResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();
    // Track yes/no style responses if we asked a specific follow-up
    const isYes = /^(yes|yeah|yep|y|i have|i did)/i.test(lowerMessage);
    const isNo = /^(no|nope|n|not yet|didn't|didnt|haven't|havent)/i.test(lowerMessage);

    // Handle follow-up to previously asked prompt
    if (memory.lastPromptKey === 'tried_technique') {
      if (isYes) {
        setMemory(prev => ({ ...prev, triedTechnique: 'yes', lastPromptKey: undefined }));
        return "Great! If that helped even a little, we can build on it. Would you like more techniques or prefer booking a counsellor session?";
      }
      if (isNo) {
        setMemory(prev => ({ ...prev, triedTechnique: 'no', lastPromptKey: undefined }));
        return "No worries. Let's try a quick, simple exercise together now: inhale 4s, hold 4s, exhale 4s — repeat 4 rounds. I can also share more options or help you book a counsellor. Which would you prefer?";
      }
      // If ambiguous, gently re-ask
      return "Just to check — have you tried any of the techniques I mentioned? A simple yes or no is fine.";
    }

    // Anxiety-related responses
    if (lowerMessage.includes('anxious') || lowerMessage.includes('anxiety') || lowerMessage.includes('panic') || lowerMessage.includes('worried')) {
      setMemory(prev => ({ ...prev, topic: 'anxiety', lastPromptKey: 'tried_technique' }));
      return "Anxiety can feel overwhelming. Have you tried simple grounding like the 5-4-3-2-1 technique or slow breathing?";
    }

    // After default or other cases, clear prompt key to avoid loops
    return "Thank you for sharing that with me. I'm here to listen and support you. While I can offer some guidance and coping strategies, remember that I'm an AI and can't replace professional help when needed. Would you like me to suggest some immediate coping techniques, share relevant resources from our Wellness Hub, or help you book a session with one of our counsellors?";
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const quickResponses = [
    "I'm feeling anxious",
    "I'm stressed about exams",
    "I can't sleep",
    "I feel overwhelmed",
    "I'm having relationship issues"
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
      <GlobalButtons
        sidebarOpen={sidebarOpen}
        onMenuClick={() => setSidebarOpen(true)}
      />
      
      {/* Floating Theme Toggle - Always Visible */}
      <ThemeToggle variant="floating" />
      
      <main className="pt-24 pb-4">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary/10 text-primary mb-4 border border-primary/20">
              <Bot className="h-4 w-4 mr-2" />
              <span className="text-sm font-medium">AI First-Aid • Available 24/7</span>
            </div>
            <h1 className="text-3xl lg:text-5xl font-display font-bold text-foreground mb-4">
              Chat with PulseBot 🤖💙
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Get immediate mental health support through AI-powered conversation. 
              Remember, this is a supportive tool - for serious concerns, please reach out to a professional.
            </p>
          </div>

          {/* Chat Container */}
          <Card className="h-[500px] flex flex-col">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex items-start space-x-3 max-w-xs lg:max-w-md ${message.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      message.sender === 'user' 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-mindbridge-gradient text-white'
                    }`}>
                      {message.sender === 'user' ? (
                        <User className="h-4 w-4" />
                      ) : (
                        <Bot className="h-4 w-4" />
                      )}
                    </div>
                    <div className={`chat-bubble ${
                      message.sender === 'user' 
                        ? 'chat-bubble-user' 
                        : 'chat-bubble-ai'
                    }`}>
                      <p className="text-sm leading-relaxed">{message.content}</p>
                      <div className="text-xs opacity-70 mt-2">
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {isTyping && (
                <div className="flex justify-start">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 rounded-full bg-mindbridge-gradient flex items-center justify-center text-white">
                      <Bot className="h-4 w-4" />
                    </div>
                    <div className="chat-bubble chat-bubble-ai">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Response Buttons */}
            <div className="p-4 border-t border-border">
              <div className="flex flex-wrap gap-2 mb-4">
                {quickResponses.map((response, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => setInputMessage(response)}
                    className="text-xs"
                  >
                    {response}
                  </Button>
                ))}
              </div>

              {/* Input */}
              <div className="flex space-x-2">
                <Input
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message here..."
                  className="flex-1"
                  disabled={isTyping}
                />
                <Button 
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim() || isTyping}
                  className="gradient-button"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>

          {/* Action Cards */}
          <div className="grid md:grid-cols-2 gap-6 mt-8">
            <Card className="hover-lift border-primary/20 bg-primary/5">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <Heart className="h-8 w-8 text-primary" />
                  <div>
                    <h3 className="font-semibold text-foreground">Need Professional Support?</h3>
                    <p className="text-sm text-muted-foreground">Connect with certified counsellors</p>
                  </div>
                </div>
                <Link to="/booking">
                  <Button className="w-full gradient-button">
                    Book a Counsellor
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="hover-lift border-healing-200 bg-healing-50">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <Calendar className="h-8 w-8 text-healing-600" />
                  <div>
                    <h3 className="font-semibold text-foreground">Explore Wellness Resources</h3>
                    <p className="text-sm text-muted-foreground">Self-help tools and educational content</p>
                  </div>
                </div>
                <Link to="/resources">
                  <Button variant="outline" className="w-full border-healing-300 text-healing-700 hover:bg-healing-100">
                    Visit Wellness Hub
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>

          {/* Emergency Notice */}
          <Card className="mt-8 bg-red-50 border-red-200">
            <CardContent className="p-6 text-center">
              <h3 className="text-lg font-semibold text-red-800 mb-2">Emergency Support</h3>
              <p className="text-red-700 mb-4">
                If you're experiencing a mental health crisis or having thoughts of self-harm, please seek immediate help.
              </p>
              <a 
                href="tel:1800-891-4416" 
                className="inline-flex items-center justify-center bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-full font-semibold transition-colors"
              >
                📞 Call Tele-MANAS: 1800-891-4416
              </a>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default AIChat;