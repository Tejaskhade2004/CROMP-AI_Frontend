import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { serverUrl } from '../App';
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
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const AIStudio = () => {
  const navigate = useNavigate();
  const { userData } = useSelector((state) => state.user);
  
  const [activeTab, setActiveTab] = useState('content'); // content, image, research
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // success, error
  const [copySuccess, setCopySuccess] = useState(false);

  // Content Generation
  const [contentType, setContentType] = useState('movie-description');
  const [contentPrompt, setContentPrompt] = useState('');
  const [generatedContent, setGeneratedContent] = useState('');
  const [contentStreaming, setContentStreaming] = useState(false);

  // Image Generation
  const [imagePrompt, setImagePrompt] = useState('');
  const [generatedImages, setGeneratedImages] = useState([]);
  const [imageModel, setImageModel] = useState('text-to-image');

  // Research Generation
  const [researchQuery, setResearchQuery] = useState('');
  const [researchType, setResearchType] = useState('movie-research');
  const [researchResults, setResearchResults] = useState('');
  const [researchStreaming, setResearchStreaming] = useState(false);

  useEffect(() => {
    if (!userData) {
      navigate('/auth');
    }
  }, [userData, navigate]);

  const showMessage = (text, type = 'success') => {
    setMessage(text);
    setMessageType(type);
    setTimeout(() => setMessage(''), 3000);
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
          model: 'llama-2-70b'
        },
        { withCredentials: true }
      );

      setGeneratedContent(response.data.content);
      showMessage('Content generated successfully!');
    } catch (error) {
      showMessage(
        error.response?.data?.message || 'Failed to generate content',
        'error'
      );
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
      showMessage('Images generated successfully!');
    } catch (error) {
      showMessage(
        error.response?.data?.message || 'Failed to generate images',
        'error'
      );
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
          model: 'mistral-7b'
        },
        { withCredentials: true }
      );

      setResearchResults(response.data.research);
      showMessage('Research generated successfully!');
    } catch (error) {
      showMessage(
        error.response?.data?.message || 'Failed to generate research',
        'error'
      );
    } finally {
      setLoading(false);
      setResearchStreaming(false);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-gray-900/80 backdrop-blur-md border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition"
          >
            <ArrowLeft size={20} />
            Back
          </button>
          <div className="flex items-center gap-2">
            <Sparkles className="text-yellow-400" size={28} />
            <h1 className="text-2xl font-bold">AI Studio</h1>
          </div>
          <div className="w-16"></div>
        </div>
      </div>

      {/* Message Alert */}
      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`fixed top-20 left-1/2 transform -translate-x-1/2 p-4 rounded-lg flex items-center gap-2 z-40 ${
              messageType === 'success'
                ? 'bg-green-500/10 border border-green-500 text-green-300'
                : 'bg-red-500/10 border border-red-500 text-red-300'
            }`}
          >
            {messageType === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
            {message}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Tab Navigation */}
        <div className="flex gap-4 mb-8 flex-wrap">
          {[
            { id: 'content', label: 'Content Generator', icon: FileText },
            { id: 'image', label: 'Image Generator', icon: ImageIcon },
            { id: 'research', label: 'Research Generator', icon: Search }
          ].map(({ id, label, icon: Icon }) => (
            <motion.button
              key={id}
              onClick={() => setActiveTab(id)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition ${
                activeTab === id
                  ? 'bg-yellow-500 text-black shadow-lg shadow-yellow-500/50'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              <Icon size={20} />
              {label}
            </motion.button>
          ))}
        </div>

        {/* CONTENT GENERATION TAB */}
        <AnimatePresence mode="wait">
          {activeTab === 'content' && (
            <motion.div
              key="content"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Input Panel */}
                <div className="lg:col-span-1 bg-gray-800 rounded-xl p-6 border border-gray-700">
                  <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <Zap size={24} className="text-yellow-400" />
                    Content Types
                  </h2>

                  <div className="space-y-2">
                    {[
                      { value: 'movie-description', label: '🎬 Movie Description' },
                      { value: 'movie-review', label: '⭐ Movie Review' },
                      { value: 'plot-summary', label: '📖 Plot Summary' },
                      { value: 'character-analysis', label: '👤 Character Analysis' },
                      { value: 'screenplay', label: '🎞️ Screenplay' },
                      { value: 'movie-trivia', label: '🎯 Movie Trivia' }
                    ].map(({ value, label }) => (
                      <label key={value} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-700 cursor-pointer transition">
                        <input
                          type="radio"
                          name="contentType"
                          value={value}
                          checked={contentType === value}
                          onChange={(e) => setContentType(e.target.value)}
                          className="w-4 h-4"
                        />
                        <span>{label}</span>
                      </label>
                    ))}
                  </div>

                  <div className="mt-6">
                    <label className="block text-sm font-semibold mb-2">Your Prompt</label>
                    <textarea
                      value={contentPrompt}
                      onChange={(e) => setContentPrompt(e.target.value)}
                      placeholder="Describe what you want to generate..."
                      className="w-full h-40 bg-gray-700 rounded-lg p-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 resize-none"
                    />
                  </div>

                  <motion.button
                    onClick={handleGenerateContent}
                    disabled={loading}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-full mt-4 bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-black font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition"
                  >
                    {loading ? <Loader size={20} className="animate-spin" /> : <Sparkles size={20} />}
                    {loading ? 'Generating...' : 'Generate Content'}
                  </motion.button>
                </div>

                {/* Output Panel */}
                <div className="lg:col-span-2 bg-gray-800 rounded-xl p-6 border border-gray-700">
                  <h2 className="text-xl font-bold mb-4">Generated Content</h2>
                  {generatedContent ? (
                    <div className="space-y-4">
                      <div className="bg-gray-700 rounded-lg p-4 max-h-96 overflow-y-auto">
                        <p className="text-gray-100 whitespace-pre-wrap leading-relaxed">{generatedContent}</p>
                      </div>
                      <div className="flex gap-3">
                        <motion.button
                          onClick={() => copyToClipboard(generatedContent)}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 py-2 rounded-lg transition"
                        >
                          {copySuccess ? <CheckCircle size={20} /> : <Copy size={20} />}
                          {copySuccess ? 'Copied!' : 'Copy'}
                        </motion.button>
                        <motion.button
                          onClick={() => downloadAsFile(generatedContent, 'content.txt')}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 py-2 rounded-lg transition"
                        >
                          <Download size={20} />
                          Download
                        </motion.button>
                      </div>
                    </div>
                  ) : (
                    <div className="h-96 flex items-center justify-center text-gray-400">
                      <p>Generated content will appear here</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* IMAGE GENERATION TAB */}
          {activeTab === 'image' && (
            <motion.div
              key="image"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Input Panel */}
                <div className="lg:col-span-1 bg-gray-800 rounded-xl p-6 border border-gray-700">
                  <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <ImageIcon size={24} className="text-purple-400" />
                    Image Settings
                  </h2>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold mb-2">Model</label>
                      <select
                        value={imageModel}
                        onChange={(e) => setImageModel(e.target.value)}
                        className="w-full bg-gray-700 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                      >
                        <option value="text-to-image">Stable Diffusion (High Quality)</option>
                        <option value="flux-pro">FLUX Pro (Ultra Fast)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold mb-2">Image Description</label>
                      <textarea
                        value={imagePrompt}
                        onChange={(e) => setImagePrompt(e.target.value)}
                        placeholder="Describe the image you want to generate..."
                        className="w-full h-40 bg-gray-700 rounded-lg p-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                      />
                    </div>
                  </div>

                  <motion.button
                    onClick={handleGenerateImage}
                    disabled={loading}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-full mt-4 bg-purple-500 hover:bg-purple-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition"
                  >
                    {loading ? <Loader size={20} className="animate-spin" /> : <ImageIcon size={20} />}
                    {loading ? 'Generating...' : 'Generate Images'}
                  </motion.button>
                </div>

                {/* Output Panel */}
                <div className="lg:col-span-2 bg-gray-800 rounded-xl p-6 border border-gray-700">
                  <h2 className="text-xl font-bold mb-4">Generated Images</h2>
                  {generatedImages.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {generatedImages.map((image, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="relative group rounded-lg overflow-hidden bg-gray-700"
                        >
                          <img src={image} alt={`Generated ${index + 1}`} className="w-full h-64 object-cover" />
                          <motion.div
                            initial={{ opacity: 0 }}
                            whileHover={{ opacity: 1 }}
                            className="absolute inset-0 bg-black/50 flex items-center justify-center gap-2"
                          >
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => {
                                const a = document.createElement('a');
                                a.href = image;
                                a.download = `image-${index + 1}.png`;
                                a.click();
                              }}
                              className="bg-blue-500 hover:bg-blue-600 p-3 rounded-lg transition"
                            >
                              <Download size={20} />
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => window.open(image, '_blank')}
                              className="bg-green-500 hover:bg-green-600 p-3 rounded-lg transition"
                            >
                              <ImageIcon size={20} />
                            </motion.button>
                          </motion.div>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="h-96 flex items-center justify-center text-gray-400">
                      <p>Generated images will appear here</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* RESEARCH GENERATION TAB */}
          {activeTab === 'research' && (
            <motion.div
              key="research"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Input Panel */}
                <div className="lg:col-span-1 bg-gray-800 rounded-xl p-6 border border-gray-700">
                  <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <Search size={24} className="text-cyan-400" />
                    Research Types
                  </h2>

                  <div className="space-y-2 mb-6">
                    {[
                      { value: 'movie-research', label: '🎥 Movie Research' },
                      { value: 'actor-biography', label: '👨‍🎬 Actor Biography' },
                      { value: 'director-analysis', label: '🎬 Director Analysis' },
                      { value: 'genre-analysis', label: '📚 Genre Analysis' },
                      { value: 'market-analysis', label: '📊 Box Office Analysis' },
                      { value: 'industry-trends', label: '📈 Industry Trends' }
                    ].map(({ value, label }) => (
                      <label key={value} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-700 cursor-pointer transition">
                        <input
                          type="radio"
                          name="researchType"
                          value={value}
                          checked={researchType === value}
                          onChange={(e) => setResearchType(e.target.value)}
                          className="w-4 h-4"
                        />
                        <span>{label}</span>
                      </label>
                    ))}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2">Research Query</label>
                    <textarea
                      value={researchQuery}
                      onChange={(e) => setResearchQuery(e.target.value)}
                      placeholder="Enter your research query..."
                      className="w-full h-40 bg-gray-700 rounded-lg p-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 resize-none"
                    />
                  </div>

                  <motion.button
                    onClick={handleGenerateResearch}
                    disabled={loading}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-full mt-4 bg-cyan-500 hover:bg-cyan-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-black font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition"
                  >
                    {loading ? <Loader size={20} className="animate-spin" /> : <Search size={20} />}
                    {loading ? 'Researching...' : 'Generate Research'}
                  </motion.button>
                </div>

                {/* Output Panel */}
                <div className="lg:col-span-2 bg-gray-800 rounded-xl p-6 border border-gray-700">
                  <h2 className="text-xl font-bold mb-4">Research Results</h2>
                  {researchResults ? (
                    <div className="space-y-4">
                      <div className="bg-gray-700 rounded-lg p-4 max-h-96 overflow-y-auto">
                        <p className="text-gray-100 whitespace-pre-wrap leading-relaxed text-sm">{researchResults}</p>
                      </div>
                      <div className="flex gap-3">
                        <motion.button
                          onClick={() => copyToClipboard(researchResults)}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 py-2 rounded-lg transition"
                        >
                          {copySuccess ? <CheckCircle size={20} /> : <Copy size={20} />}
                          {copySuccess ? 'Copied!' : 'Copy'}
                        </motion.button>
                        <motion.button
                          onClick={() => downloadAsFile(researchResults, 'research.txt')}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 py-2 rounded-lg transition"
                        >
                          <Download size={20} />
                          Download
                        </motion.button>
                      </div>
                    </div>
                  ) : (
                    <div className="h-96 flex items-center justify-center text-gray-400">
                      <p>Research results will appear here</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AIStudio;
