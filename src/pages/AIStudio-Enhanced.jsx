import React, { useState, useRef, useEffect, useMemo } from 'react';
import axios from 'axios';
import { serverUrl } from '../config/api';
import {
  Sparkles,
  Image as ImageIcon,
  FileText,
  Search,
  Download,
  Copy,
  Loader,
  AlertCircle,
  CheckCircle,
  Zap,
  ArrowLeft,
  Wand2,
  Brain,
  Flame,
  Lightbulb,
  Crown,
  Settings,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

// ============ ANIMATED PARTICLES BACKGROUND ============
const AnimatedParticles = () => {
  const particles = useMemo(() => 
    Array.from({ length: 30 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      duration: Math.random() * 20 + 20,
      delay: Math.random() * 5,
    })), 
    []
  );

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {particles.map(particle => (
        <motion.div
          key={particle.id}
          className="absolute bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 rounded-full blur-xl opacity-30"
          style={{
            width: particle.size,
            height: particle.size,
            left: `${particle.x}%`,
            top: `${particle.y}%`,
          }}
          animate={{
            y: [0, -window.innerHeight],
            opacity: [0, 0.5, 0],
          }}
          transition={{
            duration: particle.duration,
            delay: particle.delay,
            repeat: Infinity,
          }}
        />
      ))}
    </div>
  );
};

// ============ ANIMATED LOADING COMPONENT ============
const AnimatedLoading = ({ text = "Generating..." }) => {
  const steps = [
    "Reading your request",
    "Warming up AI",
    "Processing data",
    "Crafting response",
    "Finalizing output"
  ];
  
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep(prev => (prev + 1) % steps.length);
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center gap-6">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
        className="relative w-24 h-24"
      >
        <motion.div className="absolute inset-0 bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 rounded-full blur-xl" />
        <div className="absolute inset-2 bg-gray-900 rounded-full flex items-center justify-center">
          <Sparkles className="text-yellow-400 w-12 h-12 animate-pulse" />
        </div>
      </motion.div>
      
      <div className="text-center">
        <h3 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 mb-3">
          {text}
        </h3>
        <motion.p
          key={currentStep}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="text-sm text-gray-400"
        >
          {steps[currentStep]}
        </motion.p>
      </div>

      <div className="flex gap-2">
        {steps.map((_, i) => (
          <motion.div
            key={i}
            className={`h-2 rounded-full ${
              i <= currentStep ? 'bg-gradient-to-r from-cyan-400 to-purple-400' : 'bg-gray-700'
            }`}
            animate={{ width: i === currentStep ? 24 : 8 }}
            transition={{ duration: 0.3 }}
          />
        ))}
      </div>
    </div>
  );
};

// ============ MAIN AI STUDIO COMPONENT ============
const AIStudio = () => {
  const navigate = useNavigate();
  const { userData } = useSelector((state) => state.user);
  
  const [activeTab, setActiveTab] = useState('content');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);
  const [selectedModel, setSelectedModel] = useState({
    content: 'llama-2-70b',
    image: 'text-to-image',
    research: 'mistral-7b',
    advanced: 'mixtral-8x7b'
  });

  // Content Generation State
  const [contentType, setContentType] = useState('movie-description');
  const [contentPrompt, setContentPrompt] = useState('');
  const [generatedContent, setGeneratedContent] = useState('');
  const [contentStreaming, setContentStreaming] = useState(false);

  // Image Generation State
  const [imagePrompt, setImagePrompt] = useState('');
  const [generatedImages, setGeneratedImages] = useState([]);
  const [imageModel, setImageModel] = useState('text-to-image');

  // Research Generation State
  const [researchQuery, setResearchQuery] = useState('');
  const [researchType, setResearchType] = useState('movie-research');
  const [researchResults, setResearchResults] = useState('');
  const [researchStreaming, setResearchStreaming] = useState(false);

  // Advanced Generation State
  const [advancedPrompt, setAdvancedPrompt] = useState('');
  const [advancedType, setAdvancedType] = useState('advanced-content');
  const [advancedContent, setAdvancedContent] = useState('');
  const [advancedStreaming, setAdvancedStreaming] = useState(false);

  useEffect(() => {
    if (!userData) navigate('/auth');
  }, [userData, navigate]);

  const showMessage = (text, type = 'success') => {
    setMessage(text);
    setMessageType(type);
    setTimeout(() => setMessage(''), 4000);
  };

  const getErrorMessage = (error, fallbackText) => {
    const data = error?.response?.data;
    const parserErrorText = 'Unexpected non-whitespace character after JSON';

    if (typeof data?.message === 'string' && data.message.trim()) {
      if (data.message.includes(parserErrorText)) {
        return 'AI provider returned malformed response. Please retry in a few seconds.';
      }
      return data.message;
    }

    if (typeof data === 'string' && data.trim()) {
      if (data.includes(parserErrorText)) {
        return 'AI provider returned malformed response. Please retry in a few seconds.';
      }
      return data.slice(0, 240);
    }

    const baseMessage = error?.message || fallbackText;
    if (baseMessage.includes(parserErrorText)) {
      return 'AI provider returned malformed response. Please retry in a few seconds.';
    }

    return baseMessage;
  };

  // ============ CONTENT GENERATION ============
  const handleGenerateContent = async () => {
    if (!contentPrompt.trim()) {
      showMessage('Please enter a prompt', 'error');
      return;
    }

    try {
      setLoading(true);
      setContentStreaming(true);
      setGeneratedContent('');

      const response = await axios.post(
        `${serverUrl}/api/ai/generate-content`,
        {
          prompt: contentPrompt,
          type: contentType,
          model: selectedModel.content
        },
        { withCredentials: true }
      );

      setGeneratedContent(response.data.content);
      showMessage('✨ Content generated successfully!');
    } catch (error) {
      showMessage(getErrorMessage(error, 'Failed to generate content'), 'error');
    } finally {
      setLoading(false);
      setContentStreaming(false);
    }
  };

  // ============ IMAGE GENERATION ============
  const handleGenerateImage = async () => {
    if (!imagePrompt.trim()) {
      showMessage('Please enter an image description', 'error');
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post(
        `${serverUrl}/api/ai/generate-image`,
        {
          prompt: imagePrompt,
          model: imageModel,
          numberOfImages: 2
        },
        { withCredentials: true }
      );

      setGeneratedImages(response.data.images || []);
      showMessage('🖼️ Images generated successfully!');
    } catch (error) {
      showMessage(getErrorMessage(error, 'Failed to generate images'), 'error');
    } finally {
      setLoading(false);
    }
  };

  // ============ RESEARCH GENERATION ============
  const handleGenerateResearch = async () => {
    if (!researchQuery.trim()) {
      showMessage('Please enter a research query', 'error');
      return;
    }

    try {
      setLoading(true);
      setResearchStreaming(true);
      setResearchResults('');

      const response = await axios.post(
        `${serverUrl}/api/ai/generate-research`,
        {
          query: researchQuery,
          type: researchType,
          model: selectedModel.research
        },
        { withCredentials: true }
      );

      setResearchResults(response.data.research);
      showMessage('📚 Research generated successfully!');
    } catch (error) {
      showMessage(getErrorMessage(error, 'Failed to generate research'), 'error');
    } finally {
      setLoading(false);
      setResearchStreaming(false);
    }
  };

  // ============ ADVANCED GENERATION ============
  const handleGenerateAdvanced = async () => {
    if (!advancedPrompt.trim()) {
      showMessage('Please enter a prompt', 'error');
      return;
    }

    try {
      setLoading(true);
      setAdvancedStreaming(true);
      setAdvancedContent('');

      const response = await axios.post(
        `${serverUrl}/api/ai/generate-advanced`,
        {
          prompt: advancedPrompt,
          type: advancedType
        },
        { withCredentials: true }
      );

      setAdvancedContent(response.data.content);
      showMessage('👑 Premium content generated!');
    } catch (error) {
      showMessage(getErrorMessage(error, 'Failed to generate advanced content'), 'error');
    } finally {
      setLoading(false);
      setAdvancedStreaming(false);
    }
  };

  // ============ UTILITY FUNCTIONS ============
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const downloadAsFile = (content, filename) => {
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(content));
    element.setAttribute('download', filename);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const tabs = [
    { id: 'content', label: 'Content', icon: FileText, color: 'from-yellow-400 to-orange-500' },
    { id: 'image', label: 'Images', icon: ImageIcon, color: 'from-purple-400 to-pink-500' },
    { id: 'research', label: 'Research', icon: Search, color: 'from-cyan-400 to-blue-500' },
    { id: 'advanced', label: 'Premium', icon: Crown, color: 'from-amber-400 to-red-500' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black text-white overflow-hidden">
      <AnimatedParticles />
      
      {/* Animated Background Gradient */}
      <motion.div
        className="fixed inset-0 opacity-20 pointer-events-none"
        animate={{
          background: [
            'radial-gradient(circle at 20% 50%, rgba(6,182,212,0.4) 0%, transparent 50%)',
            'radial-gradient(circle at 80% 50%, rgba(168,85,247,0.4) 0%, transparent 50%)',
            'radial-gradient(circle at 50% 50%, rgba(236,72,153,0.4) 0%, transparent 50%)',
            'radial-gradient(circle at 20% 50%, rgba(6,182,212,0.4) 0%, transparent 50%)',
          ]
        }}
        transition={{ duration: 10, repeat: Infinity }}
      />

      {/* Header */}
      <motion.div
        className="sticky top-0 z-40 bg-gray-900/60 backdrop-blur-xl border-b border-gray-800/50"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <motion.button
            onClick={() => navigate('/dashboard')}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition group"
          >
            <motion.div animate={{ x: [-5, 0] }} transition={{ repeat: Infinity, duration: 2 }}>
              <ArrowLeft size={20} className="group-hover:scale-125 transition" />
            </motion.div>
            Back
          </motion.button>

          <motion.div
            className="flex items-center gap-3"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            >
              <Sparkles className="text-yellow-400" size={32} />
            </motion.div>
            <h1 className="text-3xl font-black bg-gradient-to-r from-yellow-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
              AI Studio
            </h1>
          </motion.div>

          <motion.button
            whileHover={{ scale: 1.1, rotate: 20 }}
            whileTap={{ scale: 0.9 }}
            className="p-3 rounded-lg bg-gray-800 hover:bg-gray-700 transition"
          >
            <Settings size={20} />
          </motion.button>
        </div>
      </motion.div>

      {/* Message Alert */}
      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className={`fixed top-24 left-1/2 transform -translate-x-1/2 px-6 py-4 rounded-xl flex items-center gap-3 z-50 backdrop-blur-lg border ${
              messageType === 'success'
                ? 'bg-green-500/20 border-green-500/50 text-green-300'
                : 'bg-red-500/20 border-red-500/50 text-red-300'
            }`}
          >
            {messageType === 'success' ? (
              <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity }}>
                <CheckCircle size={24} />
              </motion.div>
            ) : (
              <AlertCircle size={24} />
            )}
            <span className="font-semibold">{message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto px-4 py-12 relative z-10">
        {/* Tab Navigation */}
        <motion.div
          className="flex gap-3 mb-12 flex-wrap justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {tabs.map(({ id, label, icon: Icon, color }, idx) => (
            <motion.button
              key={id}
              onClick={() => setActiveTab(id)}
              whileHover={{ scale: 1.08, y: -4 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className={`flex items-center gap-2 px-8 py-4 rounded-xl font-bold transition-all relative group ${
                activeTab === id
                  ? `bg-gradient-to-r ${color} text-black shadow-2xl shadow-cyan-500/50`
                  : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700 border border-gray-700/50'
              }`}
            >
              <motion.div
                animate={activeTab === id ? { rotate: 360 } : {}}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              >
                <Icon size={22} />
              </motion.div>
              {label}
              {activeTab === id && (
                <motion.div
                  layoutId="underline"
                  className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-white/50 to-transparent rounded-full"
                />
              )}
            </motion.button>
          ))}
        </motion.div>

        {/* CONTENT TAB */}
        <AnimatePresence mode="wait">
          {activeTab === 'content' && (
            <motion.div
              key="content"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.5 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Input Panel */}
                <motion.div
                  className="lg:col-span-1 bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-8 border border-gray-700/50 backdrop-blur-sm relative overflow-hidden group"
                  whileHover={{ borderColor: 'rgba(251, 191, 36, 0.5)' }}
                  transition={{ duration: 0.3 }}
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-yellow-400/10 to-orange-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  />
                  
                  <h2 className="text-2xl font-bold mb-6 flex items-center gap-3 relative z-10">
                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 3, repeat: Infinity }}>
                      <Zap size={28} className="text-yellow-400" />
                    </motion.div>
                    Content Types
                  </h2>

                  <div className="space-y-2 mb-6 relative z-10">
                    {[
                      { value: 'movie-description', label: '🎬 Movie Description', desc: 'Engaging film synopsis' },
                      { value: 'movie-review', label: '⭐ Movie Review', desc: 'Detailed critical review' },
                      { value: 'plot-summary', label: '📖 Plot Summary', desc: 'Story overview' },
                      { value: 'character-analysis', label: '👤 Character Analysis', desc: 'Deep character insight' },
                      { value: 'screenplay', label: '🎞️ Screenplay', desc: 'Script format' },
                      { value: 'movie-trivia', label: '🎯 Movie Trivia', desc: 'Fun facts & secrets' },
                      { value: 'dialogue-writing', label: '💬 Dialogue', desc: 'Character conversations' },
                      { value: 'scene-description', label: '🎥 Scene Description', desc: 'Cinematic visuals' },
                    ].map(({ value, label, desc }) => (
                      <motion.label
                        key={value}
                        whileHover={{ paddingLeft: 16 }}
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-700/50 cursor-pointer transition border border-transparent hover:border-yellow-400/30"
                      >
                        <input
                          type="radio"
                          name="contentType"
                          value={value}
                          checked={contentType === value}
                          onChange={(e) => setContentType(e.target.value)}
                          className="w-4 h-4 accent-yellow-400"
                        />
                        <div>
                          <div className="font-semibold">{label}</div>
                          <div className="text-xs text-gray-400">{desc}</div>
                        </div>
                      </motion.label>
                    ))}
                  </div>

                  <div className="space-y-3 relative z-10">
                    <label className="block text-sm font-semibold">Llama 2 70B Model</label>
                    <div className="flex gap-2">
                      {['llama-2-70b', 'mixtral-8x7b'].map(model => (
                        <motion.button
                          key={model}
                          onClick={() => setSelectedModel({...selectedModel, content: model})}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className={`flex-1 py-2 px-3 rounded-lg text-sm font-bold transition ${
                            selectedModel.content === model
                              ? 'bg-yellow-500 text-black'
                              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                          }`}
                        >
                          {model === 'llama-2-70b' ? 'Llama 70B' : 'Mixtral 8x7B'}
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  <motion.div
                    className="mt-6 space-y-3 relative z-10"
                    animate={{ y: [0, -5, 0] }}
                    transition={{ duration: 3, repeat: Infinity }}
                  >
                    <label className="block text-sm font-semibold">Your Prompt</label>
                    <textarea
                      value={contentPrompt}
                      onChange={(e) => setContentPrompt(e.target.value)}
                      placeholder="Describe what you want to generate... Be detailed and creative!"
                      className="w-full h-48 bg-gray-700/50 rounded-xl p-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-0 resize-none border border-gray-600 backdrop-blur-sm"
                    />
                  </motion.div>

                  <motion.button
                    onClick={handleGenerateContent}
                    disabled={loading}
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.94 }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="w-full mt-6 bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-black font-bold py-4 rounded-xl flex items-center justify-center gap-3 transition shadow-lg shadow-yellow-500/30 relative z-10"
                  >
                    {loading ? (
                      <>
                        <Loader size={22} className="animate-spin" />
                        <span>Generating...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles size={22} />
                        <span>Generate Content</span>
                      </>
                    )}
                  </motion.button>
                </motion.div>

                {/* Output Panel */}
                <motion.div
                  className="lg:col-span-2 bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-8 border border-gray-700/50 backdrop-blur-sm"
                  whileHover={{ borderColor: 'rgba(251, 191, 36, 0.3)' }}
                  transition={{ duration: 0.3 }}
                >
                  <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                    <Flame className="text-yellow-400" size={28} />
                    Generated Content
                  </h2>
                  
                  {loading && contentStreaming ? (
                    <div className="h-96 flex items-center justify-center">
                      <AnimatedLoading text="Crafting your content..." />
                    </div>
                  ) : generatedContent ? (
                    <motion.div
                      className="space-y-4"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 }}
                    >
                      <motion.div
                        className="bg-gray-700/50 rounded-xl p-6 max-h-96 overflow-y-auto border border-gray-600 backdrop-blur-sm"
                        initial={{ y: 20 }}
                        animate={{ y: 0 }}
                      >
                        <p className="text-gray-100 whitespace-pre-wrap leading-relaxed text-justify font-light">{generatedContent}</p>
                      </motion.div>
                      
                      <div className="flex gap-3 flex-wrap">
                        <motion.button
                          onClick={() => copyToClipboard(generatedContent)}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 py-3 rounded-lg transition font-semibold shadow-md"
                        >
                          {copySuccess ? <CheckCircle size={20} /> : <Copy size={20} />}
                          {copySuccess ? 'Copied!' : 'Copy'}
                        </motion.button>
                        <motion.button
                          onClick={() => downloadAsFile(generatedContent, 'content.txt')}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 py-3 rounded-lg transition font-semibold shadow-md"
                        >
                          <Download size={20} />
                          Download
                        </motion.button>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      className="h-96 flex flex-col items-center justify-center text-gray-500 gap-4"
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 3, repeat: Infinity }}
                    >
                      <Sparkles size={48} />
                      <p className="text-lg">Your generated content will appear here</p>
                      <p className="text-sm">Write a prompt and click generate to get started</p>
                    </motion.div>
                  )}
                </motion.div>
              </div>
            </motion.div>
          )}

          {/* IMAGE TAB */}
          {activeTab === 'image' && (
            <motion.div
              key="image"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.5 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Input Panel */}
                <motion.div
                  className="lg:col-span-1 bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-8 border border-gray-700/50 backdrop-blur-sm relative overflow-hidden group"
                  whileHover={{ borderColor: 'rgba(168, 85, 247, 0.5)' }}
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-purple-400/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity"
                  />

                  <h2 className="text-2xl font-bold mb-6 flex items-center gap-3 relative z-10">
                    <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 2, repeat: Infinity }}>
                      <ImageIcon size={28} className="text-purple-400" />
                    </motion.div>
                    Image Settings
                  </h2>

                  <div className="space-y-4 relative z-10">
                    <div>
                      <label className="block text-sm font-semibold mb-2">Model Selection</label>
                      <select
                        value={imageModel}
                        onChange={(e) => setImageModel(e.target.value)}
                        className="w-full bg-gray-700/50 rounded-xl p-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-400 border border-gray-600 backdrop-blur-sm font-semibold"
                      >
                        <option value="text-to-image">🖼️ Stable Diffusion 3 (High Quality)</option>
                        <option value="flux-pro">⚡ FLUX Pro (Ultra Fast)</option>
                        <option value="flux-dev">🚀 FLUX Dev (Quality + Speed)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold mb-2">Image Description</label>
                      <textarea
                        value={imagePrompt}
                        onChange={(e) => setImagePrompt(e.target.value)}
                        placeholder="Describe the image you want to generate... Be specific with style, colors, mood, and composition!"
                        className="w-full h-48 bg-gray-700/50 rounded-xl p-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-400 resize-none border border-gray-600 backdrop-blur-sm"
                      />
                    </div>
                  </div>

                  <motion.button
                    onClick={handleGenerateImage}
                    disabled={loading}
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.94 }}
                    className="w-full mt-6 bg-gradient-to-r from-purple-400 to-pink-500 hover:from-purple-500 hover:to-pink-600 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl flex items-center justify-center gap-3 transition shadow-lg shadow-purple-500/30 relative z-10"
                  >
                    {loading ? (
                      <>
                        <Loader size={22} className="animate-spin" />
                        <span>Generating Images...</span>
                      </>
                    ) : (
                      <>
                        <ImageIcon size={22} />
                        <span>Generate Images</span>
                      </>
                    )}
                  </motion.button>
                </motion.div>

                {/* Output Panel */}
                <motion.div
                  className="lg:col-span-2 bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-8 border border-gray-700/50 backdrop-blur-sm"
                  whileHover={{ borderColor: 'rgba(168, 85, 247, 0.3)' }}
                >
                  <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                    <Wand2 className="text-purple-400" size={28} />
                    Generated Images
                  </h2>

                  {loading ? (
                    <div className="h-96 flex items-center justify-center">
                      <AnimatedLoading text="Creating your images..." />
                    </div>
                  ) : generatedImages.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      {generatedImages.map((image, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
                          animate={{ opacity: 1, scale: 1, rotate: 0 }}
                          transition={{ delay: index * 0.2 }}
                          className="relative group rounded-xl overflow-hidden bg-gray-700 border border-gray-600 shadow-lg"
                          whileHover={{ scale: 1.05, borderColor: 'rgba(168, 85, 247, 0.5)' }}
                        >
                          <img src={image.data} alt={`Generated ${index + 1}`} className="w-full h-64 object-cover" />
                          <motion.div
                            initial={{ opacity: 0 }}
                            whileHover={{ opacity: 1 }}
                            className="absolute inset-0 bg-black/60 flex items-center justify-center gap-3 backdrop-blur-sm"
                          >
                            <motion.button
                              whileHover={{ scale: 1.15 }}
                              whileTap={{ scale: 0.85 }}
                              onClick={() => {
                                const a = document.createElement('a');
                                a.href = image.data;
                                a.download = `image-${index + 1}.png`;
                                a.click();
                              }}
                              className="bg-blue-500 hover:bg-blue-600 p-4 rounded-lg transition shadow-lg"
                            >
                              <Download size={24} />
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.15 }}
                              whileTap={{ scale: 0.85 }}
                              onClick={() => window.open(image.data, '_blank')}
                              className="bg-green-500 hover:bg-green-600 p-4 rounded-lg transition shadow-lg"
                            >
                              <ImageIcon size={24} />
                            </motion.button>
                          </motion.div>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <motion.div
                      className="h-96 flex flex-col items-center justify-center text-gray-500 gap-4"
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 3, repeat: Infinity }}
                    >
                      <ImageIcon size={48} />
                      <p className="text-lg">Your images will appear here</p>
                      <p className="text-sm">Describe an image and generate it with AI</p>
                    </motion.div>
                  )}
                </motion.div>
              </div>
            </motion.div>
          )}

          {/* RESEARCH TAB */}
          {activeTab === 'research' && (
            <motion.div
              key="research"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.5 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Input Panel */}
                <motion.div
                  className="lg:col-span-1 bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-8 border border-gray-700/50 backdrop-blur-sm relative overflow-hidden group"
                  whileHover={{ borderColor: 'rgba(34, 211, 238, 0.5)' }}
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-cyan-400/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity"
                  />

                  <h2 className="text-2xl font-bold mb-6 flex items-center gap-3 relative z-10">
                    <motion.div animate={{ rotate: -360 }} transition={{ duration: 4, repeat: Infinity }}>
                      <Brain size={28} className="text-cyan-400" />
                    </motion.div>
                    Research Types
                  </h2>

                  <div className="space-y-2 mb-6 relative z-10">
                    {[
                      { value: 'movie-research', label: '🎥 Movie Research', desc: 'Complete film analysis' },
                      { value: 'actor-biography', label: '👨‍🎬 Actor Biography', desc: 'Career & life story' },
                      { value: 'director-analysis', label: '🎬 Director Analysis', desc: 'Style & influence' },
                      { value: 'genre-analysis', label: '📚 Genre Analysis', desc: 'Genre deep dive' },
                      { value: 'market-analysis', label: '📊 Box Office', desc: 'Financial analysis' },
                      { value: 'industry-trends', label: '📈 Industry Trends', desc: 'Market insights' },
                      { value: 'cinematography-analysis', label: '📷 Cinematography', desc: 'Visual storytelling' },
                      { value: 'soundtrack-analysis', label: '🎵 Soundtrack', desc: 'Music & scores' },
                    ].map(({ value, label, desc }) => (
                      <motion.label
                        key={value}
                        whileHover={{ paddingLeft: 16 }}
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-700/50 cursor-pointer transition border border-transparent hover:border-cyan-400/30"
                      >
                        <input
                          type="radio"
                          name="researchType"
                          value={value}
                          checked={researchType === value}
                          onChange={(e) => setResearchType(e.target.value)}
                          className="w-4 h-4 accent-cyan-400"
                        />
                        <div>
                          <div className="font-semibold">{label}</div>
                          <div className="text-xs text-gray-400">{desc}</div>
                        </div>
                      </motion.label>
                    ))}
                  </div>

                  <div className="space-y-3 mb-6 relative z-10">
                    <label className="block text-sm font-semibold">Mistral 7B Model</label>
                    <p className="text-xs text-gray-400">Fast & focused research generation</p>
                  </div>

                  <div className="relative z-10">
                    <label className="block text-sm font-semibold mb-2">Research Query</label>
                    <textarea
                      value={researchQuery}
                      onChange={(e) => setResearchQuery(e.target.value)}
                      placeholder="Enter your research query... Ask specific questions to get detailed answers!"
                      className="w-full h-48 bg-gray-700/50 rounded-xl p-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-400 resize-none border border-gray-600 backdrop-blur-sm"
                    />
                  </div>

                  <motion.button
                    onClick={handleGenerateResearch}
                    disabled={loading}
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.94 }}
                    className="w-full mt-6 bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-500 hover:to-blue-600 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-black font-bold py-4 rounded-xl flex items-center justify-center gap-3 transition shadow-lg shadow-cyan-500/30 relative z-10"
                  >
                    {loading ? (
                      <>
                        <Loader size={22} className="animate-spin" />
                        <span>Researching...</span>
                      </>
                    ) : (
                      <>
                        <Search size={22} />
                        <span>Generate Research</span>
                      </>
                    )}
                  </motion.button>
                </motion.div>

                {/* Output Panel */}
                <motion.div
                  className="lg:col-span-2 bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-8 border border-gray-700/50 backdrop-blur-sm"
                  whileHover={{ borderColor: 'rgba(34, 211, 238, 0.3)' }}
                >
                  <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                    <Lightbulb className="text-cyan-400" size={28} />
                    Research Results
                  </h2>

                  {loading && researchStreaming ? (
                    <div className="h-96 flex items-center justify-center">
                      <AnimatedLoading text="Researching your topic..." />
                    </div>
                  ) : researchResults ? (
                    <motion.div
                      className="space-y-4"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 }}
                    >
                      <motion.div
                        className="bg-gray-700/50 rounded-xl p-6 max-h-96 overflow-y-auto border border-gray-600 backdrop-blur-sm"
                        initial={{ y: 20 }}
                        animate={{ y: 0 }}
                      >
                        <p className="text-gray-100 whitespace-pre-wrap leading-relaxed text-justify font-light">{researchResults}</p>
                      </motion.div>

                      <div className="flex gap-3 flex-wrap">
                        <motion.button
                          onClick={() => copyToClipboard(researchResults)}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 py-3 rounded-lg transition font-semibold shadow-md"
                        >
                          {copySuccess ? <CheckCircle size={20} /> : <Copy size={20} />}
                          {copySuccess ? 'Copied!' : 'Copy'}
                        </motion.button>
                        <motion.button
                          onClick={() => downloadAsFile(researchResults, 'research.txt')}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 py-3 rounded-lg transition font-semibold shadow-md"
                        >
                          <Download size={20} />
                          Download
                        </motion.button>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      className="h-96 flex flex-col items-center justify-center text-gray-500 gap-4"
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 3, repeat: Infinity }}
                    >
                      <Brain size={48} />
                      <p className="text-lg">Your research will appear here</p>
                      <p className="text-sm">Ask a research question to get detailed insights</p>
                    </motion.div>
                  )}
                </motion.div>
              </div>
            </motion.div>
          )}

          {/* ADVANCED TAB */}
          {activeTab === 'advanced' && (
            <motion.div
              key="advanced"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.5 }}
              className="space-y-6"
            >
              <motion.div
                className="bg-gradient-to-r from-amber-400/20 to-red-500/20 border border-amber-400/50 rounded-2xl p-6 backdrop-blur-sm flex items-start gap-4"
                animate={{ borderColor: ['rgba(251, 191, 36, 0.5)', 'rgba(239, 68, 68, 0.5)', 'rgba(251, 191, 36, 0.5)'] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                <Crown className="text-amber-400 flex-shrink-0 mt-1" size={24} />
                <div>
                  <h3 className="font-bold text-lg text-amber-300 mb-1">Premium Content Generation</h3>
                  <p className="text-sm text-gray-300">Powered by Mixtral 8x7B - Our most advanced model for highest quality outputs</p>
                </div>
              </motion.div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Input Panel */}
                <motion.div
                  className="lg:col-span-1 bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-8 border border-gray-700/50 backdrop-blur-sm relative overflow-hidden group"
                  whileHover={{ borderColor: 'rgba(251, 191, 36, 0.5)' }}
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-amber-400/10 to-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity"
                  />

                  <h2 className="text-2xl font-bold mb-6 flex items-center gap-3 relative z-10">
                    <motion.div animate={{ y: [0, -5, 0] }} transition={{ duration: 2, repeat: Infinity }}>
                      <Crown size={28} className="text-amber-400" />
                    </motion.div>
                    Premium Modes
                  </h2>

                  <div className="space-y-2 mb-6 relative z-10">
                    {[
                      { value: 'advanced-content', label: '⚡ Advanced Content', desc: 'High-quality writing' },
                      { value: 'screenplay-advanced', label: '🎬 Screenplay Pro', desc: 'Professional scripts' },
                      { value: 'book-adaptation', label: '📚 Book Adaptation', desc: 'Book to film' },
                      { value: 'marketing-campaign', label: '📢 Marketing', desc: 'Campaign strategy' },
                      { value: 'franchise-strategy', label: '🎯 Franchise', desc: 'Franchise planning' },
                    ].map(({ value, label, desc }) => (
                      <motion.label
                        key={value}
                        whileHover={{ paddingLeft: 16 }}
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-amber-500/10 cursor-pointer transition border border-transparent hover:border-amber-400/30"
                      >
                        <input
                          type="radio"
                          name="advancedType"
                          value={value}
                          checked={advancedType === value}
                          onChange={(e) => setAdvancedType(e.target.value)}
                          className="w-4 h-4 accent-amber-400"
                        />
                        <div>
                          <div className="font-semibold">{label}</div>
                          <div className="text-xs text-gray-400">{desc}</div>
                        </div>
                      </motion.label>
                    ))}
                  </div>

                  <div className="space-y-3 mb-6 relative z-10">
                    <label className="block text-sm font-semibold">Mixtral 8x7B Model</label>
                    <p className="text-xs text-gray-400">Best-in-class generation quality</p>
                  </div>

                  <div className="relative z-10">
                    <label className="block text-sm font-semibold mb-2">Your Prompt</label>
                    <textarea
                      value={advancedPrompt}
                      onChange={(e) => setAdvancedPrompt(e.target.value)}
                      placeholder="Describe your advanced requirements... Premium quality awaits!"
                      className="w-full h-48 bg-gray-700/50 rounded-xl p-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none border border-gray-600 backdrop-blur-sm"
                    />
                  </div>

                  <motion.button
                    onClick={handleGenerateAdvanced}
                    disabled={loading}
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.94 }}
                    className="w-full mt-6 bg-gradient-to-r from-amber-400 to-red-500 hover:from-amber-500 hover:to-red-600 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-black font-bold py-4 rounded-xl flex items-center justify-center gap-3 transition shadow-lg shadow-amber-500/30 relative z-10"
                  >
                    {loading ? (
                      <>
                        <Loader size={22} className="animate-spin" />
                        <span>Premium Generation...</span>
                      </>
                    ) : (
                      <>
                        <Crown size={22} />
                        <span>Generate Premium</span>
                      </>
                    )}
                  </motion.button>
                </motion.div>

                {/* Output Panel */}
                <motion.div
                  className="lg:col-span-2 bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-8 border border-gray-700/50 backdrop-blur-sm"
                  whileHover={{ borderColor: 'rgba(251, 191, 36, 0.3)' }}
                >
                  <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                    <Flame className="text-amber-400" size={28} />
                    Premium Output
                  </h2>

                  {loading && advancedStreaming ? (
                    <div className="h-96 flex items-center justify-center">
                      <AnimatedLoading text="Creating premium content..." />
                    </div>
                  ) : advancedContent ? (
                    <motion.div
                      className="space-y-4"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 }}
                    >
                      <motion.div
                        className="bg-gradient-to-br from-gray-700/50 to-gray-600/30 rounded-xl p-6 max-h-96 overflow-y-auto border border-amber-400/30 backdrop-blur-sm"
                        initial={{ y: 20 }}
                        animate={{ y: 0 }}
                      >
                        <p className="text-gray-100 whitespace-pre-wrap leading-relaxed text-justify font-light">{advancedContent}</p>
                      </motion.div>

                      <div className="flex gap-3 flex-wrap">
                        <motion.button
                          onClick={() => copyToClipboard(advancedContent)}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 py-3 rounded-lg transition font-semibold shadow-md"
                        >
                          {copySuccess ? <CheckCircle size={20} /> : <Copy size={20} />}
                          {copySuccess ? 'Copied!' : 'Copy'}
                        </motion.button>
                        <motion.button
                          onClick={() => downloadAsFile(advancedContent, 'premium-content.txt')}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 py-3 rounded-lg transition font-semibold shadow-md"
                        >
                          <Download size={20} />
                          Download
                        </motion.button>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      className="h-96 flex flex-col items-center justify-center text-gray-500 gap-4"
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 3, repeat: Infinity }}
                    >
                      <Crown size={48} className="text-amber-400" />
                      <p className="text-lg">Your premium content will appear here</p>
                      <p className="text-sm">Experience the best AI-generated content quality</p>
                    </motion.div>
                  )}
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AIStudio;
