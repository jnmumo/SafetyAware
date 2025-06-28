import React, { useState } from 'react';
import { User, CheckCircle, Shield, Video, Sparkles, ArrowLeft } from 'lucide-react';
import { AuthUser } from '../services/authService';
import TavusVideoPlayer from '../components/TavusVideoPlayer';

interface PersonalizedVideosProps {
  user: AuthUser;
}

const PersonalizedVideos: React.FC<PersonalizedVideosProps> = ({ user }) => {
  const [currentVideo, setCurrentVideo] = useState<string | null>(null);
  const [completedVideos, setCompletedVideos] = useState<Set<string>>(new Set());

  // Get age-appropriate video content and vibrant colors
  const getVideoContent = () => {
    switch (user.ageGroup) {
      case '5-10':
        return {
          title: 'Your Personal Safety Adventure',
          subtitle: 'Fun and engaging safety lessons made just for you!',
          description: 'Watch your personalized video to learn about staying safe in a way that\'s perfect for your age.',
          color: 'from-pink-500 to-purple-600',
          bgColor: 'bg-gradient-to-br from-pink-100 to-purple-100',
          textColor: 'text-pink-800',
          borderColor: 'border-pink-300',
          features: [
            'Your name appears throughout the video',
            'Age-appropriate language and examples',
            'Interactive elements and questions',
            'Colorful animations and friendly characters'
          ]
        };
      case '11-15':
        return {
          title: 'Building Your Safety Skills',
          subtitle: 'Personalized guidance for navigating teenage challenges',
          description: 'Your custom video addresses the specific safety challenges you face as a teenager.',
          color: 'from-blue-500 to-cyan-600',
          bgColor: 'bg-gradient-to-br from-blue-100 to-cyan-100',
          textColor: 'text-blue-800',
          borderColor: 'border-blue-300',
          features: [
            'Scenarios relevant to your daily life',
            'Peer pressure and social media guidance',
            'Building confidence and self-esteem',
            'Real-world safety strategies'
          ]
        };
      case '16-19':
        return {
          title: 'Navigating Relationships Safely',
          subtitle: 'Mature guidance for healthy relationships and independence',
          description: 'Your personalized video helps you build healthy relationships and make safe choices as a young adult.',
          color: 'from-green-500 to-teal-600',
          bgColor: 'bg-gradient-to-br from-green-100 to-teal-100',
          textColor: 'text-green-800',
          borderColor: 'border-green-300',
          features: [
            'Relationship dynamics and consent',
            'Digital safety and privacy',
            'Supporting friends in crisis',
            'Professional and mature guidance'
          ]
        };
      default:
        return {
          title: 'Your Safety Journey',
          subtitle: 'Personalized safety education',
          description: 'Your custom video provides safety guidance tailored to your needs.',
          color: 'from-blue-500 to-purple-600',
          bgColor: 'bg-gradient-to-br from-blue-100 to-purple-100',
          textColor: 'text-blue-800',
          borderColor: 'border-blue-300',
          features: ['Personalized content', 'Age-appropriate guidance']
        };
    }
  };

  const content = getVideoContent();

  const handleVideoComplete = () => {
    if (currentVideo) {
      setCompletedVideos(prev => new Set(prev).add(currentVideo));
      setCurrentVideo(null);
    }
  };

  const handleWatchVideo = () => {
    setCurrentVideo(user.ageGroup);
  };

  if (currentVideo) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto p-6">
          <div className="mb-6">
            <button
              onClick={() => setCurrentVideo(null)}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors mb-4"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Videos</span>
            </button>
          </div>
          
          <TavusVideoPlayer
            ageGroup={user.ageGroup}
            userName={user.name}
            onComplete={handleVideoComplete}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="text-center mb-8">
          <div className={`w-20 h-20 bg-gradient-to-br ${content.color} rounded-full flex items-center justify-center mx-auto mb-4`}>
            <Video className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            Your Personalized Safety Video
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Watch a video created specifically for you using AI technology
          </p>
        </div>

        {/* Main Video Section */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 mb-8">
          {/* Video Player Area */}
          <div className="aspect-video bg-gray-900 relative">
            <TavusVideoPlayer
              ageGroup={user.ageGroup}
              userName={user.name}
              onComplete={handleVideoComplete}
            />
          </div>

          {/* Video Information */}
          <div className="p-8">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Hi {user.name}! 👋
              </h2>
              <p className="text-gray-700 text-lg">
                {content.description}
              </p>
            </div>

            {/* Features Grid */}
            <div className={`${content.bgColor} ${content.borderColor} border rounded-xl p-6 mb-6`}>
              <h3 className={`text-lg font-bold ${content.textColor} mb-4 text-center`}>
                Your Video Includes:
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {content.features.map((feature, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <CheckCircle className={`w-5 h-5 mt-0.5 flex-shrink-0 ${content.textColor}`} />
                    <span className={`text-sm ${content.textColor}`}>{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* How It Works */}
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-200">
              <h3 className="text-lg font-bold text-gray-800 mb-4 text-center flex items-center justify-center">
                <Sparkles className="w-5 h-5 mr-2 text-blue-600" />
                How It Works
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-3">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <h4 className="font-semibold text-gray-800 mb-2">Your Information</h4>
                  <p className="text-gray-600 text-sm">
                    We use your name and age group to create content that speaks directly to you
                  </p>
                </div>

                <div className="text-center">
                  <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <h4 className="font-semibold text-gray-800 mb-2">AI Generation</h4>
                  <p className="text-gray-600 text-sm">
                    Tavus AI creates a unique video with your name and age-appropriate safety content
                  </p>
                </div>

                <div className="text-center">
                  <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-3">
                    <CheckCircle className="w-6 h-6 text-white" />
                  </div>
                  <h4 className="font-semibold text-gray-800 mb-2">Personal Learning</h4>
                  <p className="text-gray-600 text-sm">
                    Watch your custom video and learn safety skills in a way that feels personal to you
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Privacy Notice */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mt-0.5">
              <Shield className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <h4 className="font-medium text-gray-800 mb-2">Privacy & Safety</h4>
              <p className="text-sm text-gray-600">
                Your personalized videos are created securely and are only accessible to you. 
                We never share your personal information, and all videos are generated using safe, 
                age-appropriate content reviewed by safety experts.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonalizedVideos;