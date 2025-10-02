import React from 'react';
import { Heart, MessageCircle, Share, Camera, Users, Star, Zap, Sparkles } from 'lucide-react';

const AnimatedBackground = () => {
  const inlineStyles = `
    @keyframes float {
      0%, 100% { transform: translateY(0px) rotate(0deg); }
      25% { transform: translateY(-20px) rotate(5deg); }
      50% { transform: translateY(-10px) rotate(-5deg); }
      75% { transform: translateY(-15px) rotate(3deg); }
    }
    @keyframes floatSlow {
      0%, 100% { transform: translateY(0px) translateX(0px); }
      25% { transform: translateY(-30px) translateX(10px); }
      50% { transform: translateY(-15px) translateX(-10px); }
      75% { transform: translateY(-25px) translateX(5px); }
    }
    @keyframes floatReverse {
      0%, 100% { transform: translateY(0px) translateX(0px) rotate(0deg); }
      25% { transform: translateY(20px) translateX(-10px) rotate(-3deg); }
      50% { transform: translateY(10px) translateX(10px) rotate(3deg); }
      75% { transform: translateY(15px) translateX(-5px) rotate(-2deg); }
    }
    @keyframes gradientShift {
      0%, 100% { background-position: 0% 50%; }
      50% { background-position: 100% 50%; }
    }
    @keyframes twinkle {
      0%, 100% { opacity: 0; transform: scale(0.5); }
      50% { opacity: 1; transform: scale(1); }
    }
    @keyframes shimmer {
      0% { transform: translateX(-100%); }
      100% { transform: translateX(100%); }
    }
    .float-animation { animation: float 15s ease-in-out infinite; }
    .float-slow-animation { animation: floatSlow 25s ease-in-out infinite; }
    .float-reverse-animation { animation: floatReverse 20s ease-in-out infinite; }
    .gradient-shift-animation { 
      background-size: 400% 400%; 
      animation: gradientShift 15s ease infinite; 
    }
    .twinkle-animation { animation: twinkle 2s ease-in-out infinite; }
    .shimmer-animation { animation: shimmer 8s ease-in-out infinite; }
  `;

  // Generate random floating elements
  const floatingElements = Array.from({ length: 15 }, (_, i) => ({
    id: i,
    icon: [Heart, MessageCircle, Share, Camera, Users, Star, Zap, Sparkles][i % 8],
    size: Math.random() * 15 + 12,
    left: Math.random() * 100,
    top: Math.random() * 100,
    duration: Math.random() * 20 + 15,
    delay: Math.random() * 5,
    opacity: Math.random() * 0.2 + 0.1
  }));

  const FloatingIcon = ({ element }) => {
    const Icon = element.icon;
    return (
      <div
        className="absolute float-animation"
        style={{
          left: `${element.left}%`,
          top: `${element.top}%`,
          animationDuration: `${element.duration}s`,
          animationDelay: `${element.delay}s`,
          opacity: element.opacity
        }}
      >
        <Icon 
          size={element.size} 
          className="text-white/20"
        />
      </div>
    );
  };

  return (
    <>
      <style>{inlineStyles}</style>
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {/* Main Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-600">
          {/* Animated gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-tr from-purple-400/30 via-blue-400/30 to-indigo-400/30 gradient-shift-animation"></div>
        </div>

        {/* Floating geometric shapes */}
        <div className="absolute inset-0">
          {/* Large floating circles */}
          <div className="absolute w-96 h-96 bg-gradient-to-r from-purple-400/10 to-pink-400/10 rounded-full blur-3xl float-slow-animation top-10 -left-20"></div>
          <div className="absolute w-80 h-80 bg-gradient-to-r from-blue-400/10 to-cyan-400/10 rounded-full blur-3xl float-reverse-animation top-1/3 -right-20"></div>
          <div className="absolute w-64 h-64 bg-gradient-to-r from-indigo-400/10 to-purple-400/10 rounded-full blur-3xl float-slow-animation bottom-20 left-1/4"></div>
          
          {/* Medium floating shapes */}
          <div className="absolute w-32 h-32 bg-gradient-to-r from-pink-300/15 to-rose-300/15 rounded-full blur-2xl float-animation top-1/4 left-1/3"></div>
          <div className="absolute w-24 h-24 bg-gradient-to-r from-cyan-300/15 to-blue-300/15 rounded-full blur-2xl float-reverse-animation bottom-1/3 right-1/4"></div>
        </div>

        {/* Floating social media icons */}
        <div className="absolute inset-0">
          {floatingElements.map((element) => (
            <FloatingIcon key={element.id} element={element} />
          ))}
        </div>

        {/* Particle effect overlay */}
        <div className="absolute inset-0">
          {Array.from({ length: 30 }, (_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-white/20 rounded-full twinkle-animation"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${Math.random() * 2 + 1}s`
              }}
            ></div>
          ))}
        </div>

        {/* Mesh gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent shimmer-animation"></div>
      </div>
    </>
  );
};

export default AnimatedBackground;
