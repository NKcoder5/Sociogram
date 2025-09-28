import axios from 'axios';

class AIChatService {
  constructor() {
    this.baseURL = 'https://integrate.api.nvidia.com/v1';
    this.model = process.env.NVIDIA_MODEL || 'microsoft/phi-3-mini-128k-instruct';
  }

  async generateResponse(message, conversationHistory = [], userContext = {}) {
    console.log('AI Chat Request:', { message, userContext });
    
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

      const systemPrompt = this.buildSystemPrompt(userContext);
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
      return {
        success: true,
        response: this.getFallbackResponse(message),
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
    
    // Context-aware responses
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
      return "Hello! 👋 Nice to meet you! How are you doing today?";
    }
    
    if (lowerMessage.includes('how are you')) {
      return "I'm doing great, thank you for asking! 😊 How about you?";
    }
    
    if (lowerMessage.includes('help')) {
      return "I'd be happy to help you! 🤝 What do you need assistance with?";
    }
    
    if (lowerMessage.includes('thank')) {
      return "You're very welcome! 😊 Is there anything else I can help you with?";
    }
    
    if (lowerMessage.includes('?')) {
      return "That's a great question! 🤔 Let me think about that for you.";
    }
    
    // Default fallbacks
    const fallbacks = [
      "I'm here to help! Could you tell me more about what you need? 😊",
      "That's interesting! What would you like to know more about? 🤔",
      "I'd be happy to assist you with that. Can you provide more details? 💭",
      "Thanks for reaching out! How can I help you today? 👋",
      "I'm listening! What's on your mind? 💬",
      "Great to chat with you! What brings you here today? ✨"
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
