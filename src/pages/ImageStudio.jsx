import React, { useEffect, useState } from 'react';
import { serverUrl } from '../config/api';
import {
  Sparkles,
  Copy,
  Download,
  Loader,
  Image as ImageIcon,
  Palette,
  Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import PageBackgroundVideo from '../components/PageBackgroundVideo';

void motion;

const IMAGE_MODELS = [
  { id: 'black-forest-labs/FLUX.1-schnell', name: 'Flux 1 Schnell', description: 'Fast' },
  { id: 'stabilityai/stable-diffusion-xl-base-1.0', name: 'SDXL Base', description: 'Detailed' }
];

const ImageStudio = () => {
  const navigate = useNavigate();
  const { userData } = useSelector((state) => state.user);

  const [prompt, setPrompt] = useState('');
  const [selectedModel, setSelectedModel] = useState('black-forest-labs/FLUX.1-schnell');
  const [generatedImages, setGeneratedImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!userData) navigate('/auth');
  }, [userData, navigate]);

  const handleGenerate = async () => {
    const userPrompt = prompt.trim();
    if (!userPrompt || loading) return;

    setError('');
    setLoading(true);

    try {
      const response = await fetch(`${serverUrl}/api/ai/generate-image`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: userPrompt,
          model: selectedModel,
          numberOfImages: 1
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to generate image');
      }

      setGeneratedImages(prev => [...data.images, ...prev]);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (imageData, index) => {
    const link = document.createElement('a');
    link.href = imageData;
    link.download = `generated-image-${Date.now()}-${index}.png`;
    link.click();
  };

  const handleCopy = (imageData) => {
    navigator.clipboard.writeText(imageData);
  };

  const promptSuggestions = [
    "A futuristic city with neon lights and flying cars at night",
    "A serene landscape with mountains and a lake at sunset",
    "A portrait of a person with dramatic lighting",
    "An abstract art piece with vibrant colors",
    "A cute cartoon cat sitting on a couch"
  ];

  return (
    <div className='relative isolate min-h-screen bg-[#050505] text-white overflow-hidden'>
      <PageBackgroundVideo src='/videos/image%205.mp4' overlayClass='bg-[#050505]/58' videoClass='opacity-42' />
      <div className='relative z-10'>
      {/* Header */}
      <div className='sticky top-0 z-40 backdrop-blur-xl bg-black/50 border-b border-white/10'>
        <div className='max-w-7xl mx-auto px-6 h-16 flex items-center justify-between'>
          <div className='flex items-center gap-4'>
            <motion.button
              className='p-2 rounded-lg hover:bg-white/10 transition'
              onClick={() => navigate('/dashboard')}
              whileHover={{ x: -2, scale: 1.05 }}
              whileTap={{ scale: 0.94 }}
            >
              <Sparkles size={16} />
            </motion.button>
            <h1 className='text-lg font-semibold'>Image Studio</h1>
          </div>

          <div className='flex gap-3'>
            <motion.button
              className='px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-sm font-semibold flex items-center gap-2'
              onClick={() => navigate('/ai-studio')}
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.96 }}
            >
              <Sparkles size={14} />
              Chat Studio
            </motion.button>
          </div>
        </div>
      </div>

      <div className='max-w-7xl mx-auto px-6 py-8'>
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
          {/* Left Panel - Controls */}
          <div className='lg:col-span-1 space-y-6'>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className='rounded-2xl border border-white/10 bg-white/5 p-6'
            >
              <h2 className='text-lg font-semibold mb-4 flex items-center gap-2'>
                <Palette size={18} className='text-cyan-400' />
                Generate Image
              </h2>

              <div className='space-y-4'>
                <div>
                  <label className='text-xs text-zinc-400 mb-2 block'>Model</label>
                  <select
                    value={selectedModel}
                    onChange={(e) => setSelectedModel(e.target.value)}
                    className='w-full h-11 rounded-xl border border-white/10 bg-black/30 text-sm outline-none focus:ring-2 focus:ring-cyan-400/40 px-3'
                  >
                    {IMAGE_MODELS.map(model => (
                      <option key={model.id} value={model.id}>
                        {model.name} - {model.description}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className='text-xs text-zinc-400 mb-2 block'>Prompt</label>
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder='Describe the image you want to generate...'
                    className='w-full h-32 rounded-xl border border-white/10 bg-black/30 text-sm outline-none focus:ring-2 focus:ring-cyan-400/40 p-3 resize-none'
                  />
                </div>

                {error && (
                  <div className='rounded-lg bg-red-500/10 border border-red-400/20 p-3 text-sm text-red-300'>
                    {error}
                  </div>
                )}

                <motion.button
                  onClick={handleGenerate}
                  disabled={loading || !prompt.trim()}
                  className='w-full h-12 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed'
                  whileHover={{ scale: loading ? 1 : 1.02 }}
                  whileTap={{ scale: loading ? 1 : 0.98 }}
                >
                  {loading ? (
                    <>
                      <Loader size={18} className='animate-spin' />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Zap size={18} />
                      Generate Image
                    </>
                  )}
                </motion.button>
              </div>
            </motion.div>

            {/* Suggestions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className='rounded-2xl border border-white/10 bg-white/5 p-6'
            >
              <h3 className='text-sm font-semibold mb-3 text-zinc-300'>Try these prompts</h3>
              <div className='space-y-2'>
                {promptSuggestions.map((suggestion, index) => (
                  <motion.button
                    key={index}
                    onClick={() => setPrompt(suggestion)}
                    className='w-full text-left p-3 rounded-lg bg-black/20 hover:bg-white/10 text-xs text-zinc-400 hover:text-white transition'
                    whileHover={{ x: 2 }}
                  >
                    {suggestion}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Right Panel - Gallery */}
          <div className='lg:col-span-2'>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className='rounded-2xl border border-white/10 bg-white/5 p-6 min-h-[500px]'
            >
              <div className='flex items-center justify-between mb-6'>
                <h2 className='text-lg font-semibold flex items-center gap-2'>
                  <ImageIcon size={18} className='text-purple-400' />
                  Generated Images
                </h2>
                {generatedImages.length > 0 && (
                  <span className='text-xs text-zinc-400'>{generatedImages.length} images</span>
                )}
              </div>

              {generatedImages.length === 0 ? (
                <div className='flex flex-col items-center justify-center h-80 text-zinc-500'>
                  <ImageIcon size={48} className='mb-4 opacity-50' />
                  <p>No images generated yet</p>
                  <p className='text-sm mt-2'>Enter a prompt and click generate</p>
                </div>
              ) : (
                <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                  <AnimatePresence mode='popLayout'>
                    {generatedImages.map((image, index) => (
                      <motion.div
                        key={image.url || index}
                        layout
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className='relative group rounded-xl overflow-hidden border border-white/10'
                      >
                        <img
                          src={image.data || image.url}
                          alt='Generated'
                          className='w-full aspect-square object-cover'
                        />
                        <div className='absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2'>
                          <motion.button
                            onClick={() => handleCopy(image.data || image.url)}
                            className='p-2 rounded-lg bg-white/20 hover:bg-white/30'
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <Copy size={16} />
                          </motion.button>
                          <motion.button
                            onClick={() => handleDownload(image.data || image.url, index)}
                            className='p-2 rounded-lg bg-white/20 hover:bg-white/30'
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <Download size={16} />
                          </motion.button>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
};

export default ImageStudio;
