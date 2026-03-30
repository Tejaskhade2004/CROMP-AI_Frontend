import React, { useEffect, useRef, useState } from 'react';
import { ArrowLeft, Clock3, Layers3, Sparkles, WandSparkles } from 'lucide-react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import axios from 'axios';
import { serverUrl } from '../App';

const generationModels = [
  {
    id: "gemini-2.5-flash",
    name: "Gemini 2.5 Flash",
    note: "Google API key"
  },
  {
    id: "nvidia/nemotron-3-super-120b-a12b:free",
    name: "Nemotron 3 Super (Free)",
    note: "OpenRouter free"
  },
  {
    id: "minimax/minimax-m2.5:free",
    name: "MiniMax M2.5 (Free)",
    note: "OpenRouter free"
  },
  {
    id: "z-ai/glm-4.5-air:free",
    name: "GLM 4.5 Air (Free)",
    note: "OpenRouter free"
  },
  {
    id: "stepfun/step-3.5-flash:free",
    name: "StepFun 3.5 Flash (Free)",
    note: "OpenRouter free"
  },
  {
    id: "hf/qwen2.5-coder-32b",
    name: "HuggingFace - Qwen2.5 Coder 32B",
    note: "HUGGINGFACE_API_KEY"
  },
  {
    id: "cf/llama-3.1-8b",
    name: "Cloudflare Workers AI - Llama 3.1 8B",
    note: "CLOUDFLARE_API_TOKEN + CLOUDFLARE_ACCOUNT_ID"
  },
  {
    id: "mistral/codestral-latest",
    name: "Mistral Codestral Latest",
    note: "MISTRAL_API_KEY"
  },
  {
    id: "groq/llama-3.1-8b-instant",
    name: "Groq - Llama 3.1 8B Instant",
    note: "GROQ_API_KEY"
  },
  {
    id: "cerebras/llama3.3-70b",
    name: "Cerebras - Llama 3.3 70B",
    note: "CEREBRAS_API_KEY"
  },
  {
    id: "sambanova/deepseek-r1",
    name: "Sambanova - DeepSeek R1",
    note: "SAMBANOVA_API_KEY"
  },
  {
    id: "github/gpt-4o-mini",
    name: "GitHub Models - GPT-4o-mini",
    note: "GITHUB_MODELS_API_KEY"
  }
];

const promptSuggestions = [
  "Landing page for a SaaS startup with pricing, testimonials, and waitlist form",
  "Portfolio site for a UI designer with case studies and contact section",
  "Restaurant website with menu, reservation form, and map section"
];

function Generate() {
  const navigate = useNavigate();
  const { userData } = useSelector((state) => state.user);

  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [progress, setProgress] = useState(0);
  const [showProgress, setShowProgress] = useState(false);
  const [estimatedSeconds, setEstimatedSeconds] = useState(0);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [selectedModel, setSelectedModel] = useState("gemini-2.5-flash");

  const progressIntervalRef = useRef(null);
  const progressTimeoutRef = useRef(null);

  const clearProgressTimers = () => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
    if (progressTimeoutRef.current) {
      clearTimeout(progressTimeoutRef.current);
      progressTimeoutRef.current = null;
    }
  };

  const getEstimatedDuration = (text) => {
    const trimmed = text.trim();
    const base = 16;
    const complexityByLength = Math.min(24, Math.ceil(trimmed.length / 22));
    const structureBonus = Math.min(8, Math.ceil((trimmed.match(/[,\n]/g) || []).length / 3));
    return base + complexityByLength + structureBonus;
  };

  const startProgressAnimation = (estimate) => {
    clearProgressTimers();
    setShowProgress(true);
    setProgress(0);
    setEstimatedSeconds(estimate);
    setRemainingSeconds(estimate);

    const startedAt = Date.now();
    const estimateMs = estimate * 1000;

    progressIntervalRef.current = setInterval(() => {
      const elapsedMs = Date.now() - startedAt;

      let targetProgress = 0;
      let remaining = 0;

      if (elapsedMs <= estimateMs) {
        targetProgress = (elapsedMs / estimateMs) * 95;
        remaining = Math.max(0, Math.ceil((estimateMs - elapsedMs) / 1000));
      } else {
        const overtimeMs = elapsedMs - estimateMs;
        targetProgress = Math.min(99.6, 95 + (overtimeMs / 1000) * 0.35);
        const leftPercent = Math.max(0, 99.6 - targetProgress);
        remaining = Math.ceil(leftPercent / 0.35);
      }

      setRemainingSeconds(remaining);
      setProgress(targetProgress);
    }, 120);
  };

  const finishProgressAnimation = () => {
    clearProgressTimers();
    setProgress(100);
    setRemainingSeconds(0);

    progressTimeoutRef.current = setTimeout(() => {
      setShowProgress(false);
      setProgress(0);
    }, 850);
  };

  const formatETA = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins <= 0) return `${secs}s`;
    return `${mins}m ${secs}s`;
  };

  useEffect(() => {
    return () => clearProgressTimers();
  }, []);

  const handleGenerateWebsite = async () => {
    let generatedWebsiteId = "";

    if (!prompt.trim()) {
      setErrorMessage("Please enter a prompt before generating.");
      setSuccessMessage("");
      return;
    }

    const eta = getEstimatedDuration(prompt);
    setIsGenerating(true);
    startProgressAnimation(eta);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const result = await axios.post(
        `${serverUrl}/api/website/generate`,
        { prompt, model: selectedModel },
        { withCredentials: true }
      );
      generatedWebsiteId = result?.data?.websiteId || "";
      setSuccessMessage(result?.data?.message || "Website generated successfully.");
    } catch (error) {
      console.error(error);
      setErrorMessage(error?.response?.data?.message || "Failed to generate website. Please try again.");
      setSuccessMessage("");
    } finally {
      setIsGenerating(false);
      finishProgressAnimation();

      if (generatedWebsiteId) {
        setTimeout(() => {
          navigate(`/editor/${generatedWebsiteId}`);
        }, 850);
      }
    }
  };

  return (
    <div className='relative min-h-screen overflow-hidden bg-[#05050b] text-white'>
      <AnimatedBackground />

      <header className='sticky top-0 z-40 border-b border-white/10 bg-[#060611]/75 backdrop-blur-xl'>
        <div className='mx-auto flex h-16 max-w-7xl items-center justify-between px-6'>
          <div className='flex items-center gap-3'>
            <button
              className='rounded-lg border border-white/10 p-2 text-zinc-300 transition hover:bg-white/10 hover:text-white'
              onClick={() => navigate('/dashboard')}
            >
              <ArrowLeft size={16} />
            </button>
            <h1 className='text-lg font-semibold tracking-wide'>CROMP.AI Studio</h1>
          </div>

          <div className='hidden items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-xs text-zinc-200 sm:flex'>
            <Layers3 size={13} className='text-cyan-300' />
            Credits: {userData?.credits ?? 0}
          </div>
        </div>
      </header>

      <main className='relative mx-auto max-w-7xl px-6 py-10'>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className='mb-8'
        >
          <p className='mb-3 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-3 py-1 text-xs text-zinc-300'>
            <Sparkles size={12} />
            AI website generation workspace
          </p>
          <h2 className='text-4xl font-semibold tracking-tight md:text-5xl'>Design your next website from one prompt</h2>
          <p className='mt-3 max-w-3xl text-zinc-400'>
            Describe your idea, choose model quality, and generate a ready-to-edit website. The progress tracker shows estimated completion in real-time.
          </p>
        </motion.div>

        <div className='grid grid-cols-1 gap-6 lg:grid-cols-3'>
          <motion.section
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.05 }}
            className='lg:col-span-2 rounded-3xl border border-white/10 bg-white/[0.04] p-6 md:p-7'
          >
            <div className='mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
              <div>
                <h3 className='text-lg font-medium'>Describe your website</h3>
                <p className='text-sm text-zinc-400'>Add structure, sections, tone, and features for better results.</p>
              </div>
              <div className='rounded-lg border border-white/10 bg-[#0b0b12] px-3 py-2 text-xs text-zinc-300'>
                Model: {generationModels.find((model) => model.id === selectedModel)?.name}
              </div>
            </div>

            <div className='rounded-2xl border border-white/10 bg-[#0b0b12] p-4'>
              <div className='mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
                <label className='text-xs text-zinc-400'>Choose generation model</label>
                <select
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  disabled={isGenerating}
                  className='h-10 w-full rounded-lg border border-white/10 bg-[#090910] px-3 text-sm text-zinc-100 outline-none focus:ring-2 focus:ring-cyan-500 sm:w-[320px] disabled:opacity-60'
                >
                  {generationModels.map((model) => (
                    <option key={model.id} value={model.id}>
                      {model.name}
                    </option>
                  ))}
                </select>
              </div>

              <p className='mb-3 text-[11px] text-zinc-500'>
                Provider requirement: {generationModels.find((model) => model.id === selectedModel)?.note}
              </p>

              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder='Example: Create a modern SaaS marketing site with hero section, feature cards, pricing table, FAQ, and contact form.'
                className='h-40 w-full resize-none rounded-xl border border-white/10 bg-[#07070d] p-4 text-sm text-zinc-100 outline-none transition focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-500/30'
              />

              <div className='mt-2 flex items-center justify-between text-[11px] text-zinc-500'>
                <span>Tip: Mention color mood, layout style, and required sections.</span>
                <span>{prompt.length} chars</span>
              </div>

              <AnimatePresence>
                {showProgress && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    className='mt-5 rounded-xl border border-white/10 bg-black/25 p-4'
                  >
                    <div className='mb-2 flex items-center justify-between text-xs text-zinc-300'>
                      <span className='flex items-center gap-2'>
                        <motion.span
                          animate={{ rotate: [0, 12, -12, 0] }}
                          transition={{ duration: 1.2, repeat: Infinity }}
                        >
                          <WandSparkles size={13} />
                        </motion.span>
                        Generating your website
                      </span>
                      <span>{Math.min(100, progress).toFixed(1)}%</span>
                    </div>

                    <div className='relative h-2.5 w-full overflow-hidden rounded-full bg-white/10'>
                      <motion.div
                        className='h-full rounded-full bg-gradient-to-r from-cyan-400 via-blue-500 to-fuchsia-500'
                        animate={{ width: `${progress}%` }}
                        transition={{ type: 'spring', stiffness: 90, damping: 18, mass: 0.6 }}
                      />
                      <motion.div
                        className='absolute inset-0 opacity-30'
                        animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
                        transition={{ duration: 2.2, repeat: Infinity, ease: 'linear' }}
                        style={{
                          background: 'linear-gradient(115deg, transparent, rgba(255,255,255,0.45), transparent)',
                          backgroundSize: '200% 200%'
                        }}
                      />
                    </div>

                    <p className='mt-2 text-[11px] text-zinc-400'>
                      ETA: {formatETA(remainingSeconds)} (initial estimate {formatETA(estimatedSeconds)})
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {errorMessage && <p className='mt-3 text-sm text-red-400'>{errorMessage}</p>}
            {successMessage && <p className='mt-3 text-sm text-emerald-300'>{successMessage}</p>}

            <div className='mt-5 flex justify-end'>
              <motion.button
                whileHover={!isGenerating ? { scale: 1.02 } : {}}
                whileTap={!isGenerating ? { scale: 0.98 } : {}}
                onClick={handleGenerateWebsite}
                disabled={isGenerating}
                className={`rounded-xl px-6 py-3 text-sm font-semibold transition ${
                  isGenerating
                    ? 'cursor-not-allowed bg-cyan-900/60 text-cyan-100'
                    : 'bg-cyan-400 text-black hover:bg-cyan-300'
                }`}
              >
                {isGenerating ? 'Generating...' : 'Generate Website'}
              </motion.button>
            </div>
          </motion.section>

          <motion.aside
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.12 }}
            className='rounded-3xl border border-white/10 bg-white/[0.04] p-5'
          >
            <h3 className='text-sm font-semibold text-zinc-100'>Prompt ideas</h3>
            <p className='mt-1 text-xs text-zinc-400'>Tap one to prefill and customize quickly.</p>

            <div className='mt-4 space-y-3'>
              {promptSuggestions.map((item, index) => (
                <motion.button
                  key={item}
                  initial={{ opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.18 + index * 0.08 }}
                  onClick={() => setPrompt(item)}
                  className='w-full rounded-xl border border-white/10 bg-[#0a0a11] p-3 text-left text-xs text-zinc-300 transition hover:border-cyan-400/40 hover:text-zinc-100'
                >
                  {item}
                </motion.button>
              ))}
            </div>

            <div className='mt-6 rounded-xl border border-white/10 bg-[#0a0a11] p-4'>
              <p className='flex items-center gap-2 text-xs font-medium text-zinc-200'>
                <Clock3 size={13} className='text-cyan-300' />
                Generation quality tips
              </p>
              <ul className='mt-3 space-y-2 text-xs text-zinc-400'>
                <li>Include page sections and target audience.</li>
                <li>Add style words like minimal, bold, or editorial.</li>
                <li>Mention required functionality like forms or pricing.</li>
              </ul>
            </div>
          </motion.aside>
        </div>
      </main>
    </div>
  );
}

export default Generate;

function AnimatedBackground() {
  return (
    <div className='pointer-events-none absolute inset-0 overflow-hidden'>
      <motion.div
        className='absolute -left-36 top-8 h-96 w-96 rounded-full bg-cyan-500/20 blur-[110px]'
        animate={{ x: [0, 34, 0], y: [0, 18, 0], scale: [1, 1.05, 1] }}
        transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className='absolute right-[-140px] top-20 h-[28rem] w-[28rem] rounded-full bg-indigo-500/20 blur-[125px]'
        animate={{ x: [0, -26, 0], y: [0, -14, 0], scale: [1.07, 1, 1.07] }}
        transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
      />
      <div
        className='absolute inset-0 opacity-25'
        style={{
          backgroundImage:
            'radial-gradient(circle at 25% 15%, rgba(255,255,255,0.08), transparent 30%), radial-gradient(circle at 80% 80%, rgba(255,255,255,0.05), transparent 28%)'
        }}
      />
    </div>
  );
}
