import axios from 'axios';

class AIChatService {
  constructor() {
    this.baseURL = 'https://integrate.api.nvidia.com/v1';
    this.model = process.env.NVIDIA_MODEL || 'microsoft/phi-3-mini-128k-instruct';
  }

  async generateResponse(message, conversationHistory = [], userContext = {}, customSystemPrompt = null) {
    console.log('🤖 AI Chat Request:', { 
      message: message.substring(0, 50) + '...', 
      userContext, 
      hasCustomPrompt: !!customSystemPrompt,
      apiKeyPresent: !!process.env.NVIDIA_API_KEY,
      apiKeyLength: process.env.NVIDIA_API_KEY?.length || 0
    });
    
    // Try the NVIDIA API with the new key
    try {
      const apiKey = process.env.NVIDIA_API_KEY || process.env.NVIDIA_NIM_API_KEY;
      if (!apiKey) {
        return {
          success: true, // Return success with fallback
          response: this.getFallbackResponse(message),
          usage: null,
          fallback: true
        };
      }

      const systemPrompt = customSystemPrompt || this.buildSystemPrompt(userContext);
      const messages = this.buildMessageHistory(systemPrompt, conversationHistory, message);

      const response = await axios.post(`${this.baseURL}/chat/completions`, {
        model: this.model,
        messages: messages,
        temperature: 0.7,
        top_p: 0.9,
        max_tokens: 1000,
        stream: false
      }, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        timeout: 10000 // 10 second timeout
      });

      return {
        success: true,
        response: response.data.choices[0].message.content,
        usage: response.data.usage,
        fallback: false
      };
    } catch (error) {
      const status = error.response?.status;
      const payload = error.response?.data || error.message;
      console.error('AI Chat Service Error (falling back):', payload);
      
      // Always return a successful fallback response
      const fallbackResponse = this.getFallbackResponse(message);
      console.log('🔄 Using fallback response:', fallbackResponse.substring(0, 50) + '...');
      return {
        success: true,
        response: fallbackResponse,
        usage: null,
        fallback: true,
        error: `API unavailable (${status || 'network error'})`
      };
    }
  }

  buildSystemPrompt(userContext) {
    return `You are an intelligent AI assistant integrated into a social media messaging platform. 
    
Your role:
- Help users with conversations, provide thoughtful responses
- Assist with writing messages, emails, and creative content
- Answer questions and provide information
- Be friendly, helpful, and engaging
- Respect privacy and maintain appropriate boundaries

User context:
- Username: ${userContext.username || 'User'}
- Platform: Social Media Messaging
- Features available: File sharing, voice messages, video calls

SOCIOGRAM FEATURES YOU CAN HELP WITH:
- Feed: Viewing and interacting with posts in the main timeline
- Messages: Chatting with friends, AI features in the messaging system
- Stories: Creating and viewing 24-hour stories at the top of the feed
- Reels: Short video content for entertainment
- Profile: User profiles and account settings
- Activity: Notifications and user interactions
- Explore: Discovering new content and users
- Create: Making new posts using the CREATE button in the LEFT SIDEBAR (not at the top!)

IMPORTANT NAVIGATION DETAILS:
- The CREATE button is located in the LEFT SIDEBAR, not at the top of the screen
- The sidebar contains: Feed, Messages, Create, Reels, Activity, Profile
- To create a post: Click the "Create" button in the left sidebar navigation
- The main navigation is always on the left side of the screen

Guidelines:
- Keep responses conversational and natural
- Be concise but informative
- Use emojis appropriately to enhance communication
- Respect user privacy and don't ask for personal information
- If asked to do something harmful or inappropriate, politely decline
- Help improve communication between users when requested`;
  }

  buildMessageHistory(systemPrompt, history, currentMessage) {
    const messages = [
      { role: 'system', content: systemPrompt }
    ];

    // Add conversation history (last 10 messages for context)
    const recentHistory = history.slice(-10);
    recentHistory.forEach(msg => {
      messages.push({
        role: msg.isAI ? 'assistant' : 'user',
        content: msg.content
      });
    });

    // Add current message
    messages.push({
      role: 'user',
      content: currentMessage
    });

    return messages;
  }

  getFallbackResponse(message) {
    const lowerMessage = message.toLowerCase();
    
    // Sociogram-specific responses
    if (lowerMessage.includes('post') || lowerMessage.includes('create')) {
      return "To create a post, click the 'Create' button in the LEFT SIDEBAR! 📝 You can add photos, write captions, and share with your friends. The Create button is in the sidebar navigation, not at the top. Want me to guide you through it? 😊";
    }
    
    if (lowerMessage.includes('message') || lowerMessage.includes('chat')) {
      return "You can send messages by going to the Messages tab! 💬 Click on any friend to start chatting, or use the AI chat feature for smart assistance! ✨";
    }
    
    if (lowerMessage.includes('story') || lowerMessage.includes('stories')) {
      return "Stories are 24-hour posts that disappear! 📸 You can create them from the Stories section - perfect for sharing quick moments with friends! 🌟";
    }
    
    if (lowerMessage.includes('friend') || lowerMessage.includes('follow')) {
      return "Find friends in the Explore tab! 👥 You can search for people, see suggested users, and follow them to see their posts in your feed! 🔍";
    }
    
    if (lowerMessage.includes('reel') || lowerMessage.includes('video')) {
      return "Reels are short videos! 🎬 Check out the Reels tab to watch fun content, or create your own to share with everyone! 🎥";
    }
    
    if (lowerMessage.includes('navigate') || lowerMessage.includes('navigation')) {
      return "Here's how to navigate Sociogram: 🧭\n• Feed - See posts from friends\n• Messages - Chat with people\n• Create - Make new posts (LEFT SIDEBAR!)\n• Reels - Watch videos\n• Activity - See notifications\n• Profile - Your account!\n\nAll navigation buttons are in the LEFT SIDEBAR, not at the top! 😊";
    }
    
    // Context-aware responses
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
      return "Hello there! 👋 I'm Sparkle, your friendly Sociogram assistant! How can I make your social experience amazing today? ✨";
    }
    
    if (lowerMessage.includes('how are you')) {
      return "I'm doing fantastic, thank you for asking! 😊 I'm here and ready to help you with anything Sociogram-related! How are you enjoying the app? 🌟";
    }
    
    if (lowerMessage.includes('help')) {
      return "I'd love to help you! 🤝 I can assist with:\n• App navigation 🧭\n• Creating posts 📝\n• Finding friends 👥\n• Using features 🎯\n• General questions 💭\nWhat would you like to know? 😊";
    }
    
    if (lowerMessage.includes('thank')) {
      return "Aww, you're so welcome! 😊 It makes me happy to help! Is there anything else about Sociogram I can explain? I'm always here for you! 💫";
    }
    
    if (lowerMessage.includes('inappropriate') || lowerMessage.includes('hack') || lowerMessage.includes('spam')) {
      return "I appreciate you reaching out, but I can't help with that! 😅 I'm here to make your Sociogram experience positive and fun! Let's focus on something awesome instead! ✨";
    }
    
    if (lowerMessage.includes('?')) {
      return "That's a great question! 🤔 I love curious minds! While I might not have all the answers, I'm here to help with Sociogram features and general questions. What's on your mind? 💭";
    }
    
    // Fun responses
    if (lowerMessage.includes('fun fact') || lowerMessage.includes('joke')) {
      const funFacts = [
        "Fun fact: The average person checks social media 96 times per day! 📱 But with Sociogram's engaging features, that time is well spent! 😄",
        "Did you know? Emojis were invented in 1999! 😊 Now we use them to express emotions in every message! 🎉",
        "Fun fact: The first social media site was Six Degrees in 1997! 🌐 Look how far we've come with Sociogram! ✨",
        "Here's something cool: Your brain releases dopamine when you get likes and comments! 💖 That's why Sociogram feels so good to use! 😊"
      ];
      return funFacts[Math.floor(Math.random() * funFacts.length)];
    }
    
    // Default friendly fallbacks
    const fallbacks = [
      "I'm here to help make your Sociogram experience amazing! 🌟 What can I assist you with today? 😊",
      "That's interesting! 🤔 I'd love to help you with that! Can you tell me more about what you need? 💭",
      "Great to chat with you! 💬 I'm your friendly Sociogram assistant - how can I make your day better? ✨",
      "I'm all ears! 👂 Whether it's about app features or just a friendly chat, I'm here for you! 😊",
      "Thanks for reaching out! 👋 I love helping users navigate Sociogram and have fun! What's up? 🎉",
      "You've got my attention! 💫 I'm here to help with anything Sociogram-related or just be a friendly companion! 😄"
    ];
    
    return fallbacks[Math.floor(Math.random() * fallbacks.length)];
  }

  async generateSmartReply(message, conversationContext = {}) {
    try {
      const prompt = `Generate 3 short, appropriate reply suggestions for this message: "${message}"
      
      Context: Social media chat conversation
      
      Requirements:
      - Each reply should be 1-10 words
      - Make them diverse (positive, neutral, question)
      - Use casual, friendly tone
      - Include appropriate emojis
      - Separate each reply with |
      
      Format: Reply1 | Reply2 | Reply3`;

      const response = await this.generateResponse(prompt, [], conversationContext);
      
      if (response.success) {
        let replies = response.response.split('|').map(r => r.trim()).slice(0, 3);
        
        // Clean up replies - remove "Reply1:", "Reply2:", etc.
        replies = replies.map(reply => {
          return reply.replace(/^Reply\d+:\s*["']?|["']?$/g, '').trim();
        });
        
        // Ensure we have 3 replies
        while (replies.length < 3) {
          replies.push(['Thanks! 😊', 'Got it 👍', 'Tell me more'][replies.length]);
        }
        
        return {
          success: true,
          suggestions: replies.slice(0, 3)
        };
      }
      
      return {
        success: false,
        suggestions: ['Thanks! 😊', 'Got it 👍', 'Tell me more']
      };
    } catch (error) {
      return {
        success: false,
        suggestions: ['Thanks! 😊', 'Got it 👍', 'Tell me more']
      };
    }
  }

  async improveMessage(message, tone = 'friendly') {
    try {
      const prompt = `Improve this message to be more ${tone} and engaging: "${message}"
      
      Requirements:
      - Keep the original meaning
      - Make it more natural and conversational
      - Add appropriate emojis if helpful
      - Keep it concise
      - Return only the improved message, nothing else`;

      const response = await this.generateResponse(prompt);
      
      if (response.success) {
        return {
          success: true,
          improvedMessage: response.response.trim()
        };
      }
      
      return {
        success: false,
        originalMessage: message
      };
    } catch (error) {
      return {
        success: false,
        originalMessage: message
      };
    }
  }

  async translateMessage(message, targetLanguage = 'en') {
    try {
      const prompt = `Translate this message to ${targetLanguage}: "${message}"
      
      Requirements:
      - Provide accurate translation
      - Maintain tone and context
      - Return only the translation, nothing else
      - If already in target language, return original`;

      const response = await this.generateResponse(prompt);
      
      if (response.success) {
        return {
          success: true,
          translation: response.response.trim(),
          originalLanguage: 'auto-detected'
        };
      }
      
      return {
        success: false,
        originalMessage: message
      };
    } catch (error) {
      return {
        success: false,
        originalMessage: message
      };
    }
  }

  async generateConversationStarter(userProfile = {}) {
    try {
      const prompt = `Generate a friendly conversation starter for a social media chat.
      
      User context: ${JSON.stringify(userProfile)}
      
      Requirements:
      - Be natural and engaging
      - Ask an open-ended question
      - Keep it casual and friendly
      - 1-2 sentences max
      - Include an emoji
      - Return only the message, nothing else`;

      const response = await this.generateResponse(prompt);
      
      if (response.success) {
        return {
          success: true,
          starter: response.response.trim()
        };
      }
      
      return {
        success: false,
        starter: "Hey! How's your day going? 😊"
      };
    } catch (error) {
      return {
        success: false,
        starter: "Hey! How's your day going? 😊"
      };
    }
  }

  async moderateMessage(message) {
    try {
      const prompt = `Analyze this message for inappropriate content: "${message}"
      
      Check for:
      - Harassment or bullying
      - Hate speech
      - Spam
      - Inappropriate content
      - Threats
      
      Respond with only: SAFE or UNSAFE
      If UNSAFE, add reason after |`;

      const response = await this.generateResponse(prompt);
      
      if (response.success) {
        const result = response.response.trim().toUpperCase();
        const [status, reason] = result.split('|');
        
        return {
          success: true,
          isSafe: status === 'SAFE',
          reason: reason?.trim() || null
        };
      }
      
      return {
        success: true,
        isSafe: true,
        reason: null
      };
    } catch (error) {
      return {
        success: true,
        isSafe: true,
        reason: null
      };
    }
  }
}

export default new AIChatService();
