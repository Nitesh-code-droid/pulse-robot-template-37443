import React, { useState, useRef, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Send, Bot, User, Heart, Calendar, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import ThemeToggle from '@/components/ThemeToggle';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

const AIChat = () => {
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
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const getAIResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();
    
    // Stress-related responses
    if (lowerMessage.includes('stress') || lowerMessage.includes('overwhelmed') || lowerMessage.includes('pressure')) {
      return "I hear you're feeling stressed. That's completely normal, especially as a student. Let's try a quick breathing exercise: Take a deep breath in for 4 counts... hold for 4... and out for 4. Repeat this 3 times. Would you like me to guide you through more stress management techniques, or would you prefer to book a session with a counsellor?";
    }
    
    // Anxiety-related responses
    if (lowerMessage.includes('anxious') || lowerMessage.includes('anxiety') || lowerMessage.includes('panic') || lowerMessage.includes('worried')) {
      return "Anxiety can feel overwhelming, but you're not alone in this. Try grounding yourself with the 5-4-3-2-1 technique: Name 5 things you can see, 4 you can touch, 3 you can hear, 2 you can smell, and 1 you can taste. This helps bring you back to the present moment. I'm here with you. Would you like to explore more coping strategies or connect with a professional counsellor?";
    }
    
    // Sleep-related responses
    if (lowerMessage.includes('sleep') || lowerMessage.includes('tired') || lowerMessage.includes('insomnia') || lowerMessage.includes('can\'t sleep')) {
      return "Sleep issues are very common among students. Good sleep hygiene can make a huge difference. Try creating a bedtime routine: no screens 1 hour before bed, keep your room cool and dark, and try some gentle stretching or meditation. Would you like me to share more sleep improvement tips from our Wellness Hub?";
    }
    
    // Depression/sadness responses
    if (lowerMessage.includes('sad') || lowerMessage.includes('depressed') || lowerMessage.includes('down') || lowerMessage.includes('lonely')) {
      return "I'm sorry you're feeling this way. Your feelings are valid, and it's brave of you to reach out. Remember that this feeling is temporary, even though it might not feel like it right now. Small steps can help - maybe try going for a short walk, listening to music you enjoy, or reaching out to a friend. If these feelings persist, I strongly encourage you to speak with a counsellor. You deserve support and care.";
    }
    
    // Academic stress
    if (lowerMessage.includes('exam') || lowerMessage.includes('study') || lowerMessage.includes('grades') || lowerMessage.includes('assignment')) {
      return "Academic pressure is one of the biggest stressors for students. Remember that your worth isn't defined by your grades. Try breaking large tasks into smaller, manageable chunks. Take regular breaks using the Pomodoro technique (25 minutes study, 5 minute break). It's also important to maintain perspective - one exam or assignment doesn't determine your entire future. Would you like study tips from our Wellness Hub or prefer to discuss this with a counsellor?";
    }
    
    // Social/relationship issues
    if (lowerMessage.includes('friend') || lowerMessage.includes('relationship') || lowerMessage.includes('social') || lowerMessage.includes('family')) {
      return "Relationship challenges can be really difficult to navigate. It's normal to have conflicts and misunderstandings with people we care about. Sometimes talking through these situations with an objective person can help provide clarity. Our peer support forum is also a great place to get advice from other students who might have faced similar situations. Would you like to explore our forum or speak with a counsellor about this?";
    }
    
    // General positive responses
    if (lowerMessage.includes('good') || lowerMessage.includes('fine') || lowerMessage.includes('okay') || lowerMessage.includes('well')) {
      return "I'm glad to hear you're doing well! It's wonderful that you're taking care of your mental health proactively. Remember, even on good days, it's important to maintain healthy habits. Is there anything specific you'd like to explore today? I can share wellness tips, or you can check out our resources for maintaining positive mental health.";
    }
    
    // Help/crisis keywords
    if (lowerMessage.includes('help') || lowerMessage.includes('crisis') || lowerMessage.includes('emergency') || lowerMessage.includes('hurt')) {
      return "I'm here to help, and I'm glad you reached out. If you're in immediate danger or having thoughts of self-harm, please contact emergency services or call Tele-MANAS at 1800-891-4416 right away. For non-emergency support, I can guide you through coping techniques, or you can book an appointment with one of our counsellors. You're not alone in this - there are people who want to help you.";
    }
    
    // Default response
    return "Thank you for sharing that with me. I'm here to listen and support you. While I can offer some guidance and coping strategies, remember that I'm an AI and can't replace professional help when needed. Would you like me to suggest some immediate coping techniques, share relevant resources from our Wellness Hub, or help you book a session with one of our counsellors?";
  };

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

    // Simulate AI thinking time
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: getAIResponse(inputMessage),
        sender: 'ai',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1500);
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