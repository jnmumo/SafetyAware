import React from 'react';
import { MessageCircle, Shield, AlertTriangle, Lightbulb, Heart, Users, Star, Target } from 'lucide-react';
import { User } from '../types';
import ChatInterface from '../components/ChatInterface';

interface ChatProps {
  user: User;
}

const Chat: React.FC<ChatProps> = ({ user }) => {
  // Get age-appropriate content
  const getAgeAppropriateContent = (age: number) => {
    if (age >= 5 && age <= 8) {
      return {
        title: "Safety Helper Chat",
        subtitle: "Ask your friendly safety helper about staying safe! 🛡️",
        safetyTips: [
          {
            title: 'Trust your feelings',
            description: 'If something feels scary or wrong, tell a safe adult',
            icon: Heart,
            color: 'text-pink-600'
          },
          {
            title: 'Know your safe adults',
            description: 'Remember who you can always talk to when you need help',
            icon: Users,
            color: 'text-blue-600'
          },
          {
            title: 'It\'s okay to say no',
            description: 'You can say no if someone makes you uncomfortable',
            icon: Shield,
            color: 'text-green-600'
          }
        ],
        emergencyTitle: "When You Need Help",
        emergencyInfo: [
          {
            title: "Ask for Emergency Numbers",
            description: "Ask me 'What are emergency contact numbers for my country?' to get help numbers for where you live"
          },
          {
            title: "Tell a Safe Adult",
            description: "Always tell a parent, teacher, or family member when you need help"
          }
        ],
        guidelines: [
          "• Ask about strangers and staying safe",
          "• Learn about good and bad touches",
          "• Practice saying no when uncomfortable",
          "• Find out who your safe adults are",
          "• Ask for emergency numbers in your country",
          "• All conversations are private and safe"
        ]
      };
    } else if (age >= 9 && age <= 12) {
      return {
        title: "Safety Assistant Chat",
        subtitle: "Get help with bullying, online safety, emergencies, and more! 🌟",
        safetyTips: [
          {
            title: 'Stand up to bullying',
            description: 'Tell a trusted adult and don\'t face bullying alone',
            icon: Shield,
            color: 'text-red-600'
          },
          {
            title: 'Stay smart online',
            description: 'Keep personal information private and be careful what you share',
            icon: AlertTriangle,
            color: 'text-blue-600'
          },
          {
            title: 'Know emergency steps',
            description: 'Learn what to do in different emergency situations',
            icon: Target,
            color: 'text-orange-600'
          }
        ],
        emergencyTitle: "Getting Help",
        emergencyInfo: [
          {
            title: "Country-Specific Emergency Numbers",
            description: "Ask me 'What are emergency contact numbers for my country?' for local emergency services"
          },
          {
            title: "Trusted Adults",
            description: "Parents, teachers, school counselors, and family members who can help"
          },
          {
            title: "School Resources",
            description: "Talk to teachers, counselors, or the principal about safety concerns"
          }
        ],
        guidelines: [
          "• Ask about bullying and how to handle it",
          "• Learn about staying safe online",
          "• Understand body boundaries and respect",
          "• Know what to do in emergencies",
          "• Get emergency contact numbers for your country",
          "• Get help with any safety concerns"
        ]
      };
    } else if (age >= 13 && age <= 15) {
      return {
        title: "Safety Guide Chat",
        subtitle: "Navigate friendships, build confidence, and develop your self-worth! 💪",
        safetyTips: [
          {
            title: 'Resist peer pressure',
            description: 'Stay true to your values even when others pressure you',
            icon: Star,
            color: 'text-purple-600'
          },
          {
            title: 'Recognize toxic friendships',
            description: 'Healthy friends support and respect you',
            icon: Heart,
            color: 'text-pink-600'
          },
          {
            title: 'Build your confidence',
            description: 'Believe in yourself and your abilities',
            icon: Target,
            color: 'text-green-600'
          }
        ],
        emergencyTitle: "Support Resources",
        emergencyInfo: [
          {
            title: "Emergency Services",
            description: "Ask me for emergency contact numbers specific to your country"
          },
          {
            title: "School Support",
            description: "Counselors, teachers, and trusted school staff"
          },
          {
            title: "Family & Friends",
            description: "Trusted family members and mature friends who can provide guidance"
          }
        ],
        guidelines: [
          "• Discuss peer pressure and how to handle it",
          "• Learn to identify toxic friendships",
          "• Build confidence and self-esteem",
          "• Develop a strong sense of self-worth",
          "• Get emergency contact numbers for your country",
          "• Get support for social challenges"
        ]
      };
    } else if (age >= 16 && age <= 19) {
      return {
        title: "Safety Advisor Chat",
        subtitle: "Discuss consent, digital safety, reporting, and healthy boundaries! 🎯",
        safetyTips: [
          {
            title: 'Understand consent',
            description: 'Consent is clear, ongoing, and can be withdrawn at any time',
            icon: Shield,
            color: 'text-blue-600'
          },
          {
            title: 'Recognize digital abuse',
            description: 'Online harassment and manipulation are serious issues',
            icon: AlertTriangle,
            color: 'text-red-600'
          },
          {
            title: 'Set emotional boundaries',
            description: 'Protect your mental health with healthy limits',
            icon: Heart,
            color: 'text-green-600'
          }
        ],
        emergencyTitle: "Support & Resources",
        emergencyInfo: [
          {
            title: "Emergency Services",
            description: "Ask me for emergency contact numbers and crisis support in your country"
          },
          {
            title: "Professional Support",
            description: "Counselors, therapists, and mental health professionals"
          },
          {
            title: "Legal Resources",
            description: "Know your rights and how to report abuse or harassment"
          }
        ],
        guidelines: [
          "• Learn about consent in all contexts",
          "• Recognize and report digital abuse",
          "• Understand how to report abuse safely",
          "• Develop healthy emotional boundaries",
          "• Get emergency contact numbers for your country",
          "• Get confidential support and guidance"
        ]
      };
    } else {
      // Default fallback
      return {
        title: "Safety Chat Assistant",
        subtitle: "Ask me anything about staying safe! I'm here to help you learn.",
        safetyTips: [
          {
            title: 'Always trust your instincts',
            description: 'If something feels wrong, it probably is',
            icon: AlertTriangle,
            color: 'text-red-600'
          },
          {
            title: 'Find a trusted adult',
            description: 'Never hesitate to ask for help when needed',
            icon: Shield,
            color: 'text-blue-600'
          },
          {
            title: 'Think before you share',
            description: 'Personal information should stay private',
            icon: Lightbulb,
            color: 'text-yellow-600'
          }
        ],
        emergencyTitle: "Getting Help",
        emergencyInfo: [
          {
            title: "Emergency Services",
            description: "Ask me for emergency contact numbers for your country"
          },
          {
            title: "Trusted Adults",
            description: "Parents, teachers, and family members who can help"
          }
        ],
        guidelines: [
          "• Ask questions about any safety topic",
          "• Share situations you're unsure about",
          "• Get help with safety decisions",
          "• Learn about online and offline safety",
          "• Get emergency contact numbers for your country",
          "• All conversations are private and secure"
        ]
      };
    }
  };

  const content = getAgeAppropriateContent(user.age);

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
          {content.title}
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          {content.subtitle}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Chat Interface */}
        <div className="lg:col-span-2">
          <ChatInterface userAge={user.age} />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Safety Tips */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <MessageCircle className="w-5 h-5 mr-2 text-blue-600" />
              Safety Tips
            </h3>
            <div className="space-y-4">
              {content.safetyTips.map((tip, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <tip.icon className={`w-5 h-5 mt-0.5 ${tip.color}`} />
                  <div>
                    <h4 className="font-medium text-gray-800 text-sm">{tip.title}</h4>
                    <p className="text-gray-600 text-xs mt-1">{tip.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Support Resources */}
          <div className="bg-blue-50 rounded-xl shadow-sm p-6 border border-blue-100">
            <h3 className="text-lg font-semibold text-blue-800 mb-4 flex items-center">
              <Shield className="w-5 h-5 mr-2" />
              {content.emergencyTitle}
            </h3>
            <div className="space-y-3">
              {content.emergencyInfo.map((info, index) => (
                <div key={index} className="bg-white rounded-lg p-3">
                  <p className="font-semibold text-gray-800 text-sm">{info.title}</p>
                  <p className="text-gray-600 text-xs mt-1">{info.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Chat Guidelines */}
          <div className="bg-green-50 rounded-xl shadow-sm p-6 border border-green-100">
            <h3 className="text-lg font-semibold text-green-800 mb-4">Chat Guidelines</h3>
            <ul className="text-sm text-green-700 space-y-2">
              {content.guidelines.map((guideline, index) => (
                <li key={index}>{guideline}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;