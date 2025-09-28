import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { messageAPI } from '../../utils/api';
import { 
  PencilIcon, 
  SparklesIcon, 
  DocumentTextIcon, 
  EyeIcon,
  ShareIcon,
  BookmarkIcon,
  TagIcon,
  PhotoIcon,
  GlobeAltIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

const BlogAssistant = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('create');
  const [blogContent, setBlogContent] = useState({
    title: '',
    content: '',
    tags: [],
    category: 'general',
    isPublic: true,
    featuredImage: null
  });
  
  // AI Assistant States
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [generatedContent, setGeneratedContent] = useState('');
  
  // Blog Management States
  const [savedBlogs, setSavedBlogs] = useState([]);
  const [publishedBlogs, setPublishedBlogs] = useState([]);
  const [previewMode, setPreviewMode] = useState(false);
  
  // Form States
  const [newTag, setNewTag] = useState('');
  const [wordCount, setWordCount] = useState(0);
  const [readingTime, setReadingTime] = useState(0);

  const categories = [
    'general', 'technology', 'lifestyle', 'travel', 'food', 
    'health', 'business', 'education', 'entertainment', 'sports'
  ];

  const blogPrompts = [
    'Write a comprehensive guide about',
    'Create an engaging story about',
    'Explain the benefits of',
    'Share tips and tricks for',
    'Write a review of',
    'Discuss the future of',
    'Compare and contrast',
    'Create a step-by-step tutorial for'
  ];

  useEffect(() => {
    // Calculate word count and reading time
    const words = blogContent.content.split(/\s+/).filter(word => word.length > 0).length;
    setWordCount(words);
    setReadingTime(Math.ceil(words / 200)); // Average reading speed: 200 words per minute
  }, [blogContent.content]);

  const generateAIContent = async () => {
    if (!aiPrompt.trim()) return;
    
    setIsGenerating(true);
    try {
      const response = await messageAPI.aiChatAssistant({
        message: `As a professional blog writer, ${aiPrompt}. Please write a comprehensive, engaging blog post with proper structure including introduction, main content with subheadings, and conclusion. Make it informative and engaging for readers.`,
        conversationId: null
      });
      
      setGeneratedContent(response.data.response);
    } catch (error) {
      console.error('AI generation error:', error);
      setGeneratedContent('Sorry, I couldn\'t generate content at the moment. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const improveContent = async () => {
    if (!blogContent.content.trim()) return;
    
    setIsGenerating(true);
    try {
      const response = await messageAPI.improveMessage({
        message: blogContent.content,
        tone: 'professional'
      });
      
      setBlogContent(prev => ({
        ...prev,
        content: response.data.improvedMessage || prev.content
      }));
    } catch (error) {
      console.error('Content improvement error:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const generateTitle = async () => {
    if (!blogContent.content.trim()) return;
    
    setIsGenerating(true);
    try {
      const response = await messageAPI.aiChatAssistant({
        message: `Based on this blog content, generate 5 catchy, SEO-friendly titles. Content: "${blogContent.content.substring(0, 500)}..."`,
        conversationId: null
      });
      
      setAiSuggestions(response.data.response.split('\n').filter(line => line.trim()));
    } catch (error) {
      console.error('Title generation error:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const generateTags = async () => {
    if (!blogContent.content.trim()) return;
    
    setIsGenerating(true);
    try {
      const response = await messageAPI.aiChatAssistant({
        message: `Generate 10 relevant tags for this blog post. Return only the tags separated by commas: "${blogContent.content.substring(0, 300)}..."`,
        conversationId: null
      });
      
      const tags = response.data.response.split(',').map(tag => tag.trim().replace('#', ''));
      setAiSuggestions(tags);
    } catch (error) {
      console.error('Tag generation error:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const addTag = () => {
    if (newTag.trim() && !blogContent.tags.includes(newTag.trim())) {
      setBlogContent(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove) => {
    setBlogContent(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const saveDraft = () => {
    const draft = {
      ...blogContent,
      id: Date.now(),
      createdAt: new Date(),
      status: 'draft'
    };
    setSavedBlogs(prev => [...prev, draft]);
    alert('Draft saved successfully!');
  };

  const publishBlog = () => {
    if (!blogContent.title.trim() || !blogContent.content.trim()) {
      alert('Please fill in both title and content before publishing.');
      return;
    }
    
    const published = {
      ...blogContent,
      id: Date.now(),
      createdAt: new Date(),
      status: 'published',
      author: user?.username || 'Anonymous'
    };
    setPublishedBlogs(prev => [...prev, published]);
    
    // Reset form
    setBlogContent({
      title: '',
      content: '',
      tags: [],
      category: 'general',
      isPublic: true,
      featuredImage: null
    });
    
    alert('Blog published successfully!');
  };

  const useGeneratedContent = () => {
    setBlogContent(prev => ({
      ...prev,
      content: generatedContent
    }));
    setGeneratedContent('');
  };

  const useSuggestion = (suggestion) => {
    if (aiSuggestions.length > 0 && aiSuggestions[0].includes('title') || aiSuggestions[0].includes('Title')) {
      // It's a title suggestion
      setBlogContent(prev => ({ ...prev, title: suggestion }));
    } else {
      // It's a tag suggestion
      if (!blogContent.tags.includes(suggestion)) {
        setBlogContent(prev => ({
          ...prev,
          tags: [...prev.tags, suggestion]
        }));
      }
    }
    setAiSuggestions([]);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <PencilIcon className="h-8 w-8 text-blue-600" />
                <h1 className="text-2xl font-bold text-gray-900">Blog Assistant</h1>
              </div>
              <div className="hidden md:flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setActiveTab('create')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === 'create' 
                      ? 'bg-white text-blue-600 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Create
                </button>
                <button
                  onClick={() => setActiveTab('manage')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === 'manage' 
                      ? 'bg-white text-blue-600 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Manage
                </button>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                Welcome, <span className="font-medium">{user?.username}</span>
              </div>
              <button
                onClick={() => setPreviewMode(!previewMode)}
                className="flex items-center space-x-2 px-3 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <EyeIcon className="h-4 w-4" />
                <span className="text-sm">Preview</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'create' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Editor */}
            <div className="lg:col-span-2 space-y-6">
              {/* Title Section */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">Blog Title</h2>
                  <button
                    onClick={generateTitle}
                    disabled={isGenerating || !blogContent.content.trim()}
                    className="flex items-center space-x-2 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 disabled:opacity-50 transition-colors"
                  >
                    <SparklesIcon className="h-4 w-4" />
                    <span className="text-sm">AI Suggest</span>
                  </button>
                </div>
                <input
                  type="text"
                  placeholder="Enter your blog title..."
                  value={blogContent.title}
                  onChange={(e) => setBlogContent(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full text-2xl font-bold border-none outline-none placeholder-gray-400 resize-none"
                />
              </div>

              {/* Content Editor */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">Content</h2>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={improveContent}
                      disabled={isGenerating || !blogContent.content.trim()}
                      className="flex items-center space-x-2 px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 disabled:opacity-50 transition-colors"
                    >
                      <SparklesIcon className="h-4 w-4" />
                      <span className="text-sm">Improve</span>
                    </button>
                    <div className="text-sm text-gray-500">
                      {wordCount} words • {readingTime} min read
                    </div>
                  </div>
                </div>
                
                {previewMode ? (
                  <div className="prose max-w-none">
                    <h1>{blogContent.title || 'Your Blog Title'}</h1>
                    <div className="whitespace-pre-wrap">{blogContent.content || 'Your blog content will appear here...'}</div>
                  </div>
                ) : (
                  <textarea
                    placeholder="Start writing your blog content..."
                    value={blogContent.content}
                    onChange={(e) => setBlogContent(prev => ({ ...prev, content: e.target.value }))}
                    className="w-full h-96 border-none outline-none placeholder-gray-400 resize-none text-gray-700 leading-relaxed"
                  />
                )}
              </div>

              {/* Generated Content Display */}
              {generatedContent && (
                <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-blue-900">AI Generated Content</h3>
                    <button
                      onClick={useGeneratedContent}
                      className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <CheckCircleIcon className="h-4 w-4" />
                      <span className="text-sm">Use This Content</span>
                    </button>
                  </div>
                  <div className="prose max-w-none text-gray-700 whitespace-pre-wrap">
                    {generatedContent}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* AI Content Generator */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Content Generator</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      What would you like to write about?
                    </label>
                    <textarea
                      placeholder="e.g., Write a guide about sustainable living practices..."
                      value={aiPrompt}
                      onChange={(e) => setAiPrompt(e.target.value)}
                      className="w-full h-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    {blogPrompts.slice(0, 4).map((prompt, index) => (
                      <button
                        key={index}
                        onClick={() => setAiPrompt(prompt + ' ')}
                        className="text-left px-3 py-2 text-sm bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        {prompt}...
                      </button>
                    ))}
                  </div>
                  
                  <button
                    onClick={generateAIContent}
                    disabled={isGenerating || !aiPrompt.trim()}
                    className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 transition-colors"
                  >
                    {isGenerating ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Generating...</span>
                      </>
                    ) : (
                      <>
                        <SparklesIcon className="h-4 w-4" />
                        <span>Generate Content</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Blog Settings */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Blog Settings</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                    <select
                      value={blogContent.category}
                      onChange={(e) => setBlogContent(prev => ({ ...prev, category: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {categories.map(category => (
                        <option key={category} value={category}>
                          {category.charAt(0).toUpperCase() + category.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-gray-700">Tags</label>
                      <button
                        onClick={generateTags}
                        disabled={isGenerating || !blogContent.content.trim()}
                        className="text-xs text-blue-600 hover:text-blue-800 disabled:opacity-50"
                      >
                        AI Suggest
                      </button>
                    </div>
                    <div className="flex space-x-2 mb-2">
                      <input
                        type="text"
                        placeholder="Add tag..."
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && addTag()}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      />
                      <button
                        onClick={addTag}
                        className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <TagIcon className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {blogContent.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                        >
                          #{tag}
                          <button
                            onClick={() => removeTag(tag)}
                            className="ml-1 text-blue-600 hover:text-blue-800"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="isPublic"
                      checked={blogContent.isPublic}
                      onChange={(e) => setBlogContent(prev => ({ ...prev, isPublic: e.target.checked }))}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor="isPublic" className="text-sm text-gray-700">
                      Make this blog public
                    </label>
                  </div>
                </div>
              </div>

              {/* AI Suggestions */}
              {aiSuggestions.length > 0 && (
                <div className="bg-yellow-50 rounded-xl p-6 border border-yellow-200">
                  <h3 className="text-lg font-semibold text-yellow-900 mb-4">AI Suggestions</h3>
                  <div className="space-y-2">
                    {aiSuggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => useSuggestion(suggestion)}
                        className="w-full text-left px-3 py-2 bg-white rounded-lg hover:bg-yellow-100 transition-colors text-sm border border-yellow-200"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="space-y-3">
                  <button
                    onClick={saveDraft}
                    className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    <BookmarkIcon className="h-4 w-4" />
                    <span>Save as Draft</span>
                  </button>
                  
                  <button
                    onClick={publishBlog}
                    className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <ShareIcon className="h-4 w-4" />
                    <span>Publish Blog</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'manage' && (
          <div className="space-y-8">
            {/* Published Blogs */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Published Blogs</h2>
              {publishedBlogs.length === 0 ? (
                <div className="text-center py-12">
                  <DocumentTextIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No published blogs yet. Create your first blog!</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {publishedBlogs.map((blog) => (
                    <div key={blog.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{blog.title}</h3>
                      <p className="text-gray-600 text-sm mb-3 line-clamp-3">{blog.content}</p>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>{blog.category}</span>
                        <span>{blog.createdAt.toLocaleDateString()}</span>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {blog.tags.slice(0, 3).map((tag, index) => (
                          <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Saved Drafts */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Saved Drafts</h2>
              {savedBlogs.length === 0 ? (
                <div className="text-center py-12">
                  <BookmarkIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No saved drafts. Start writing to save drafts!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {savedBlogs.map((blog) => (
                    <div key={blog.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 mb-1">{blog.title || 'Untitled Draft'}</h3>
                          <p className="text-gray-600 text-sm mb-2 line-clamp-2">{blog.content}</p>
                          <div className="flex items-center space-x-4 text-xs text-gray-500">
                            <span>{blog.category}</span>
                            <span>{blog.createdAt.toLocaleDateString()}</span>
                            <span>{blog.content.split(' ').length} words</span>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            setBlogContent(blog);
                            setActiveTab('create');
                          }}
                          className="ml-4 px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors text-sm"
                        >
                          Edit
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BlogAssistant;
