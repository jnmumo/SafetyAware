import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, AlertCircle, Shield, Lightbulb, Loader2, Volume2, VolumeX, Pause, Play, Phone, Mic, MicOff, Square } from 'lucide-react';
import { ChatMessage, SafetyCategory } from '../types';
import { geminiService } from '../services/geminiService';
import { elevenLabsService } from '../services/elevenLabsService';

interface ChatInterfaceProps {
  userAge: number;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ userAge }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      content: getWelcomeMessage(userAge),
      sender: 'ai',
      timestamp: new Date(),
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [conversationHistory, setConversationHistory] = useState<Array<{
    role: 'user' | 'model';
    parts: Array<{ text: string }>;
  }>>([]);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [isGeneratingAudio, setIsGeneratingAudio] = useState<string | null>(null);
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);
  const [audioElements, setAudioElements] = useState<Map<string, HTMLAudioElement>>(new Map());
  
  // Voice input states
  const [isListening, setIsListening] = useState(false);
  const [speechRecognition, setSpeechRecognition] = useState<SpeechRecognition | null>(null);
  const [voiceInputSupported, setVoiceInputSupported] = useState(false);
  const [voiceInputEnabled, setVoiceInputEnabled] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize speech recognition for all age groups
  useEffect(() => {
    // Check if speech recognition is supported
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';
      
      recognition.onstart = () => {
        console.log('🎤 Voice recognition started');
        setIsListening(true);
      };
      
      recognition.onend = () => {
        console.log('🎤 Voice recognition ended');
        setIsListening(false);
      };
      
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        console.log('🎤 Voice input received:', transcript);
        setInputValue(transcript);
        setIsListening(false);
      };
      
      recognition.onerror = (event) => {
        console.error('🎤 Voice recognition error:', event.error);
        setIsListening(false);
        
        // Show age-appropriate error messages
        if (event.error === 'no-speech') {
          if (userAge >= 5 && userAge <= 10) {
            alert('I didn\'t hear anything. Try speaking a little louder!');
          } else {
            alert('No speech detected. Please try speaking again.');
          }
        } else if (event.error === 'not-allowed') {
          alert('Microphone access is required for voice input. Please allow microphone access and try again.');
        } else {
          if (userAge >= 5 && userAge <= 10) {
            alert('Sorry, I had trouble hearing you. You can try again or just type your message!');
          } else {
            alert('Voice recognition error. Please try again or use text input.');
          }
        }
      };
      
      setSpeechRecognition(recognition);
      setVoiceInputSupported(true);
      
      // Auto-enable for young children, optional for others
      if (userAge >= 5 && userAge <= 10) {
        setVoiceInputEnabled(true);
        console.log('✅ Voice input auto-enabled for young learner');
      } else {
        setVoiceInputEnabled(false);
        console.log('✅ Voice input available for user (manual enable)');
      }
    } else {
      console.log('❌ Speech recognition not supported in this browser');
      setVoiceInputSupported(false);
    }
  }, [userAge]);

  // Get age-appropriate welcome message
  function getWelcomeMessage(age: number): string {
    if (age >= 5 && age <= 8) {
      return "Hi there! I'm your safety helper! 🛡️ I can help you learn about staying safe with strangers, good and bad touches, saying no when you feel uncomfortable, and finding safe adults to talk to. You can talk to me or type your questions! What would you like to know about?";
    } else if (age >= 9 && age <= 12) {
      return "Hello! I'm your safety assistant! 🌟 I'm here to help you learn about bullying, staying safe online, body boundaries, and what to do in emergencies. You can speak or type your questions. What safety topic would you like to explore today?";
    } else if (age >= 13 && age <= 15) {
      return "Hey! I'm your safety guide! 💪 I can help you navigate peer pressure, recognize toxic friendships, build confidence, and develop your self-worth. Feel free to speak or type your questions. What's on your mind today?";
    } else if (age >= 16 && age <= 19) {
      return "Hi! I'm your safety advisor! 🎯 I'm here to discuss consent, digital abuse, reporting abuse, and setting emotional boundaries. You can use voice input or type your questions. What would you like to talk about?";
    } else {
      return "Hi! I'm your AI safety assistant. I'm here to help you learn about staying safe. You can speak or type your questions. What would you like to know about today?";
    }
  }

  // Get age-appropriate header info
  function getHeaderInfo(age: number) {
    if (age >= 5 && age <= 8) {
      return {
        title: "Safety Helper",
        subtitle: "Ask me about staying safe! You can talk or type!"
      };
    } else if (age >= 9 && age <= 12) {
      return {
        title: "Safety Assistant",
        subtitle: "Learn about bullying, online safety & more - speak or type!"
      };
    } else if (age >= 13 && age <= 15) {
      return {
        title: "Safety Guide",
        subtitle: "Navigate friendships, confidence & self-worth - voice or text"
      };
    } else if (age >= 16 && age <= 19) {
      return {
        title: "Safety Advisor",
        subtitle: "Discuss consent, boundaries & reporting - speak or type"
      };
    } else {
      return {
        title: "Safety Assistant",
        subtitle: "Ask me anything about staying safe - voice or text"
      };
    }
  }

  // Get age-appropriate quick questions
  function getQuickQuestions(age: number): string[] {
    if (age >= 5 && age <= 8) {
      return [
        "What should I do if a stranger talks to me?",
        "What are good touches and bad touches?",
        "When is it okay to say no?",
        "Who are my safe adults?",
        "What are emergency contact numbers for my country?"
      ];
    } else if (age >= 9 && age <= 12) {
      return [
        "How do I deal with bullying?",
        "How do I stay safe online?",
        "What are body boundaries?",
        "What should I do in an emergency?",
        "What are emergency contact numbers for my country?"
      ];
    } else if (age >= 13 && age <= 15) {
      return [
        "How do I handle peer pressure?",
        "What makes a friendship toxic?",
        "How can I build more confidence?",
        "How do I improve my self-worth?",
        "What are emergency contact numbers for my country?"
      ];
    } else if (age >= 16 && age <= 19) {
      return [
        "What does consent really mean?",
        "How do I recognize digital abuse?",
        "How do I report abuse safely?",
        "How do I set emotional boundaries?",
        "What are emergency contact numbers for my country?"
      ];
    } else {
      return [
        "How do I stay safe online?",
        "What should I do if someone is bullying me?",
        "How do I create a strong password?",
        "What if a stranger approaches me?",
        "What are emergency contact numbers for my country?"
      ];
    }
  }

  // Get age-appropriate placeholder text
  function getPlaceholderText(age: number): string {
    if (age >= 5 && age <= 8) {
      return "Ask me about staying safe or click the microphone to talk...";
    } else if (age >= 9 && age <= 12) {
      return "Ask about bullying, online safety, emergencies... (speak or type)";
    } else if (age >= 13 && age <= 15) {
      return "Ask about friendships, confidence, peer pressure... (voice or text)";
    } else if (age >= 16 && age <= 19) {
      return "Ask about consent, boundaries, reporting... (speak or type)";
    } else {
      return "Ask me about staying safe... (voice or text input available)";
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Voice input functions
  const startVoiceInput = () => {
    if (speechRecognition && !isListening) {
      try {
        speechRecognition.start();
      } catch (error) {
        console.error('Error starting voice recognition:', error);
        if (userAge >= 5 && userAge <= 10) {
          alert('Sorry, I had trouble starting voice input. You can try again or just type your message!');
        } else {
          alert('Unable to start voice input. Please try again or use text input.');
        }
      }
    }
  };

  const stopVoiceInput = () => {
    if (speechRecognition && isListening) {
      speechRecognition.stop();
    }
  };

  // Generate audio for AI messages
  const generateAudio = async (messageId: string, text: string) => {
    if (!audioEnabled || isGeneratingAudio === messageId) return;

    setIsGeneratingAudio(messageId);
    try {
      const audioBlob = await elevenLabsService.generateSpeech(text, userAge);
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      
      audio.onended = () => {
        setPlayingAudio(null);
        URL.revokeObjectURL(audioUrl);
      };

      setAudioElements(prev => new Map(prev.set(messageId, audio)));
    } catch (error) {
      console.error('Error generating audio:', error);
    } finally {
      setIsGeneratingAudio(null);
    }
  };

  // Play/pause audio
  const toggleAudio = (messageId: string) => {
    const audio = audioElements.get(messageId);
    if (!audio) return;

    if (playingAudio === messageId) {
      audio.pause();
      setPlayingAudio(null);
    } else {
      // Stop any currently playing audio
      if (playingAudio) {
        const currentAudio = audioElements.get(playingAudio);
        if (currentAudio) {
          currentAudio.pause();
          currentAudio.currentTime = 0;
        }
      }
      
      audio.play();
      setPlayingAudio(messageId);
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isTyping) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: inputValue,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = inputValue;
    setInputValue('');
    setIsTyping(true);

    try {
      const response = await geminiService.sendChatMessage(
        currentInput,
        userAge,
        conversationHistory
      );

      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: response.response,
        sender: 'ai',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, aiMessage]);
      setConversationHistory(response.conversationHistory);

      // Generate audio for AI response if enabled
      if (audioEnabled) {
        setTimeout(() => {
          generateAudio(aiMessage.id, response.response);
        }, 500);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: "I'm sorry, I'm having trouble responding right now. Please try again in a moment, or if you have an emergency, contact a trusted adult immediately.",
        sender: 'ai',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const headerInfo = getHeaderInfo(userAge);
  const quickQuestions = getQuickQuestions(userAge);
  const placeholderText = getPlaceholderText(userAge);

  return (
    <div className="flex flex-col h-full bg-white rounded-xl shadow-sm">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50 rounded-t-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">{headerInfo.title}</h3>
              <p className="text-sm text-gray-600">{headerInfo.subtitle}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {/* Voice Input Toggle */}
            {voiceInputSupported && (
              <button
                onClick={() => setVoiceInputEnabled(!voiceInputEnabled)}
                className={`p-2 rounded-lg transition-colors ${
                  voiceInputEnabled 
                    ? 'bg-green-100 text-green-600 hover:bg-green-200' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                title={voiceInputEnabled ? 'Voice input enabled' : 'Enable voice input'}
              >
                {voiceInputEnabled ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
              </button>
            )}
            
            {/* Audio Toggle */}
            <button
              onClick={() => setAudioEnabled(!audioEnabled)}
              className={`p-2 rounded-lg transition-colors ${
                audioEnabled 
                  ? 'bg-blue-100 text-blue-600 hover:bg-blue-200' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              title={audioEnabled ? 'Disable voice responses' : 'Enable voice responses'}
            >
              {audioEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-96">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`flex space-x-3 max-w-xs lg:max-w-md ${message.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                message.sender === 'user' 
                  ? 'bg-blue-600' 
                  : 'bg-gradient-to-br from-purple-500 to-pink-500'
              }`}>
                {message.sender === 'user' ? (
                  <User className="w-4 h-4 text-white" />
                ) : (
                  <Bot className="w-4 h-4 text-white" />
                )}
              </div>
              <div className={`rounded-2xl px-4 py-2 ${
                message.sender === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-800'
              }`}>
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                <div className="flex items-center justify-between mt-2">
                  <p className={`text-xs ${
                    message.sender === 'user' ? 'text-blue-100' : 'text-gray-500'
                  }`}>
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                  
                  {/* Audio controls for AI messages */}
                  {message.sender === 'ai' && audioEnabled && (
                    <div className="flex items-center space-x-1 ml-2">
                      {isGeneratingAudio === message.id ? (
                        <Loader2 className="w-3 h-3 text-gray-400 animate-spin" />
                      ) : audioElements.has(message.id) ? (
                        <button
                          onClick={() => toggleAudio(message.id)}
                          className="p-1 rounded hover:bg-gray-200 transition-colors"
                          title={playingAudio === message.id ? 'Pause' : 'Play'}
                        >
                          {playingAudio === message.id ? (
                            <Pause className="w-3 h-3 text-gray-600" />
                          ) : (
                            <Play className="w-3 h-3 text-gray-600" />
                          )}
                        </button>
                      ) : (
                        <button
                          onClick={() => generateAudio(message.id, message.content)}
                          className="p-1 rounded hover:bg-gray-200 transition-colors"
                          title="Generate audio"
                        >
                          <Volume2 className="w-3 h-3 text-gray-600" />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex justify-start">
            <div className="flex space-x-3 max-w-xs lg:max-w-md">
              <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-gradient-to-br from-purple-500 to-pink-500">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="bg-gray-100 text-gray-800 rounded-2xl px-4 py-2">
                <div className="flex items-center space-x-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm">Thinking...</span>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Questions */}
      {messages.length === 1 && (
        <div className="p-4 border-t border-gray-100">
          <p className="text-sm text-gray-600 mb-3 flex items-center">
            <Lightbulb className="w-4 h-4 mr-1" />
            {userAge >= 5 && userAge <= 8 ? "Try asking about:" :
             userAge >= 9 && userAge <= 12 ? "Quick questions to get started:" :
             userAge >= 13 && userAge <= 15 ? "Popular topics to explore:" :
             "Common questions:"}
          </p>
          <div className="flex flex-wrap gap-2">
            {quickQuestions.map((question, index) => (
              <button
                key={index}
                onClick={() => setInputValue(question)}
                className="text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 px-3 py-2 rounded-full transition-colors"
              >
                {question}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Emergency Contact Notice */}
      <div className="p-4 border-t border-gray-100 bg-red-50">
        <div className="flex items-start space-x-2">
          <Phone className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-red-800">Emergency Contacts</p>
            <p className="text-xs text-red-700 mt-1">
              Ask me "What are emergency contact numbers for my country?" to get country-specific emergency contacts and safety resources.
            </p>
          </div>
        </div>
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex space-x-3">
          <div className="flex-1 relative">
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={placeholderText}
              className="w-full px-4 py-2 pr-12 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows={1}
              disabled={isTyping}
            />
            
            {/* Voice Input Button */}
            {voiceInputSupported && voiceInputEnabled && (
              <button
                onClick={isListening ? stopVoiceInput : startVoiceInput}
                disabled={isTyping}
                className={`absolute right-2 top-1/2 transform -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                  isListening 
                    ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse' 
                    : 'bg-green-500 hover:bg-green-600 text-white'
                }`}
                title={isListening ? 'Stop listening' : 'Click to talk'}
              >
                {isListening ? <Square className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>
            )}
          </div>
          
          <button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isTyping}
            className="w-10 h-10 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white rounded-full flex items-center justify-center transition-colors"
          >
            {isTyping ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </div>
        
        {/* Status indicators */}
        <div className="flex items-center justify-center mt-2 space-x-4">
          {/* Audio status */}
          {audioEnabled && (
            <div className="flex items-center space-x-2 text-xs text-gray-500 bg-blue-50 px-3 py-1 rounded-full">
              <Volume2 className="w-3 h-3" />
              <span>Voice responses enabled</span>
            </div>
          )}
          
          {/* Voice input status */}
          {voiceInputSupported && voiceInputEnabled && (
            <div className={`flex items-center space-x-2 text-xs px-3 py-1 rounded-full ${
              isListening 
                ? 'text-red-600 bg-red-50' 
                : 'text-green-600 bg-green-50'
            }`}>
              <Mic className="w-3 h-3" />
              <span>{isListening ? 'Listening...' : 'Voice input ready'}</span>
            </div>
          )}
          
          {/* Voice input not supported message */}
          {!voiceInputSupported && (
            <div className="flex items-center space-x-2 text-xs text-gray-500 bg-gray-50 px-3 py-1 rounded-full">
              <MicOff className="w-3 h-3" />
              <span>Voice input not supported in this browser</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;