import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { AnimatePresence, motion, useReducedMotion, useInView, useScroll, useTransform } from 'motion/react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight, Bot, Brain, Check, ChevronDown, ChevronRight, Cloud, Code2,
  Coins, Cpu, Gauge, GitBranch, Globe, Layers, Menu, MessageSquare, Play,
  Rocket, ShieldCheck, Sparkles, Terminal, Users, X, Zap, Star, Quote,
  Download, ExternalLink, CpuIcon
} from 'lucide-react';
import axios from 'axios';
import { serverUrl } from '../config/api';
import { setUserData } from '../redux/userSlice';

const typedPhrases = [
  "Generate production-ready code",
  "Debug and ship faster",
  "Automate repetitive dev tasks",
  "Build complete websites",
  "Deploy with one click"
];

const featuresData = [
  {
    icon: Brain,
    title: "Multi-Model Routing",
    description: "Intelligently routes your prompts to the best AI models for each task. GPT-4, Claude, Gemini, and more.",
    gradient: "from-blue-500/30 to-cyan-500/10",
    iconColor: "text-blue-400"
  },
  {
    icon: Code2,
    title: "Code Generation",
    description: "Generate clean, production-ready code in any language. From components to full applications.",
    gradient: "from-purple-500/30 to-pink-500/10",
    iconColor: "text-purple-400"
  },
  {
    icon: Globe,
    title: "Website Editing",
    description: "Edit live websites with natural language. Describe changes, see instant results.",
    gradient: "from-emerald-500/30 to-teal-500/10",
    iconColor: "text-emerald-400"
  },
  {
    icon: Cloud,
    title: "Deployment Flow",
    description: "Ship to production with a single command. Automatic builds, SSL, and CDN included.",
    gradient: "from-orange-500/30 to-amber-500/10",
    iconColor: "text-orange-400"
  },
  {
    icon: Layers,
    title: "Memory & Context",
    description: "AI remembers your project structure, preferences, and coding patterns across sessions.",
    gradient: "from-rose-500/30 to-red-500/10",
    iconColor: "text-rose-400"
  },
  {
    icon: Users,
    title: "Team Collaboration",
    description: "Share prompts, code snippets, and entire workflows with your team in real-time.",
    gradient: "from-indigo-500/30 to-violet-500/10",
    iconColor: "text-indigo-400"
  }
];

const workflowSteps = [
  { step: 1, title: "Prompt", description: "Describe what you want in natural language", icon: MessageSquare, color: "from-blue-500 to-cyan-500" },
  { step: 2, title: "Plan", description: "AI analyzes and creates an execution plan", icon: Brain, color: "from-purple-500 to-pink-500" },
  { step: 3, title: "Generate", description: "Production-ready code is generated instantly", icon: Code2, color: "from-emerald-500 to-teal-500" },
  { step: 4, title: "Deploy", description: "Ship to cloud with one click", icon: Rocket, color: "from-orange-500 to-amber-500" }
];

const useCases = [
  {
    title: "SaaS Teams",
    description: "Accelerate feature development and reduce technical debt across your entire product.",
    icon: Layers,
    image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=400&q=80"
  },
  {
    title: "Freelancers",
    description: "Deliver client projects faster while maintaining premium quality and unique designs.",
    icon: Zap,
    image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=400&q=80"
  },
  {
    title: "Agencies",
    description: "Scale your output without scaling your team. Handle more clients with the same resources.",
    icon: Users,
    image: "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=400&q=80"
  },
  {
    title: "Startup Founders",
    description: "Build MVPs in days, not months. Test ideas rapidly and iterate based on user feedback.",
    icon: Rocket,
    image: "https://images.unsplash.com/photo-1559136555-9303baea8ebd?auto=format&fit=crop&w=400&q=80"
  }
];

const pricingPlans = [
  { name: "Starter", price: "0", credits: "50", features: ["50 AI credits/month", "Basic models", "Community support", "1 project"], popular: false },
  { name: "Pro", price: "29", credits: "500", features: ["500 AI credits/month", "All premium models", "Priority support", "Unlimited projects", "Team collaboration"], popular: true },
  { name: "Enterprise", price: "99", credits: "2000+", features: ["2000+ AI credits/month", "Custom model training", "Dedicated support", "SSO & Analytics", "SLA guarantee"], popular: false }
];

const testimonials = [
  {
    name: "Sarah Chen",
    role: "CTO at TechFlow",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80",
    quote: "CROMP.AI cut our development time by 60%. The multi-model routing is incredibly smart - it always picks the right AI for the job."
  },
  {
    name: "Marcus Rodriguez",
    role: "Freelance Developer",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80",
    quote: "I can now take on 3x more clients without compromising quality. The deployment flow alone saves me hours every week."
  },
  {
    name: "Emily Watson",
    role: "Founder at LaunchPad",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=100&q=80",
    quote: "Built our entire MVP in 4 days. The AI understood our vision perfectly and generated production-ready code from day one."
  }
];

const faqItems = [
  { question: "How does multi-model routing work?", answer: "Our AI analyzes your prompt complexity and requirements, then automatically routes it to the most suitable model. Simple queries go to faster, cost-effective models while complex tasks leverage premium models like GPT-4 and Claude Opus." },
  { question: "Can I use my own API keys?", answer: "Absolutely! Pro and Enterprise plans allow you to connect your own API keys from OpenAI, Anthropic, Google, and other providers. You maintain full control over costs and usage." },
  { question: "What programming languages are supported?", answer: "CROMP.AI supports all major programming languages including JavaScript, TypeScript, Python, Go, Rust, Java, C++, and more. The AI adapts to your project's tech stack automatically." },
  { question: "How accurate is the generated code?", answer: "Our generated code achieves a 94% first-try acceptance rate in internal benchmarks. The AI follows best practices, includes proper error handling, and generates clean, maintainable code." },
  { question: "Is there a free trial?", answer: "Yes! Every new user gets 50 free credits to explore the platform. No credit card required. Start building immediately and upgrade when you're ready." },
  { question: "How does team collaboration work?", answer: "Share prompts, code snippets, and entire project contexts with your team. Real-time sync ensures everyone works with the latest codebase context and shared AI memory." }
];

const clientLogos = [
  "Vercel", "Stripe", "Linear", "Supabase", "Railway", "Resend"
];

function useModernCarousel(phrases, pauseDuration = 3000) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [nextIndex, setNextIndex] = useState(1);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const prefersReducedMotion = useReducedMotion();
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  useEffect(() => {
    if (prefersReducedMotion) return;

    const interval = setInterval(() => {
      if (mountedRef.current) {
        setIsTransitioning(true);
        setTimeout(() => {
          if (mountedRef.current) {
            setCurrentIndex((prev) => (prev + 1) % phrases.length);
            setNextIndex((prev) => (prev + 1) % phrases.length);
            setIsTransitioning(false);
          }
        }, 400);
      }
    }, pauseDuration);

    return () => clearInterval(interval);
  }, [phrases, pauseDuration, prefersReducedMotion]);

  return { 
    currentPhrase: phrases[currentIndex],
    isTransitioning
  };
}

function useCountUp(end, duration = 2000, startOnView = false) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const hasStarted = useRef(false);
  const prefersReducedMotion = useReducedMotion();
  const animationRef = useRef(null);

  useEffect(() => {
    if (prefersReducedMotion) {
      setCount(end);
      return;
    }
    if (startOnView && !inView) return;
    if (hasStarted.current) return;
    hasStarted.current = true;

    const startTime = performance.now();
    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      setCount(Math.floor(progress * end));
      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };
    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [end, duration, inView, startOnView, prefersReducedMotion]);

  return { count, ref };
}

function useMouseParallax(strength = 20) {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const ref = useRef(null);
  const prefersReducedMotion = useReducedMotion();
  const rafRef = useRef(null);
  const targetPosition = useRef({ x: 0, y: 0 });

  const handleMouseMove = useCallback((e) => {
    if (prefersReducedMotion) return;
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    targetPosition.current = {
      x: ((e.clientX - centerX) / rect.width) * strength,
      y: ((e.clientY - centerY) / rect.height) * strength
    };
  }, [strength, prefersReducedMotion]);

  useEffect(() => {
    if (prefersReducedMotion) return;
    
    const animate = () => {
      setPosition(prev => ({
        x: prev.x + (targetPosition.current.x - prev.x) * 0.1,
        y: prev.y + (targetPosition.current.y - prev.y) * 0.1
      }));
      rafRef.current = requestAnimationFrame(animate);
    };
    
    rafRef.current = requestAnimationFrame(animate);
    
    const element = ref.current;
    if (element) {
      element.addEventListener('mousemove', handleMouseMove);
    }
    
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (element) element.removeEventListener('mousemove', handleMouseMove);
    };
  }, [handleMouseMove, prefersReducedMotion]);

  return { ref, position };
}

function FloatingOrb({ className, delay = 0, duration = 20 }) {
  const prefersReducedMotion = useReducedMotion();
  if (prefersReducedMotion) return null;
  
  return (
    <motion.div
      className={`pointer-events-none absolute rounded-full blur-3xl ${className}`}
      initial={{ x: 0, y: 0, scale: 1, opacity: 0.3 }}
      animate={{
        x: [0, 30, -20, 0],
        y: [0, -40, 20, 0],
        scale: [1, 1.1, 0.9, 1],
        opacity: [0.3, 0.5, 0.3]
      }}
      transition={{
        duration,
        repeat: Infinity,
        ease: "easeInOut",
        delay
      }}
    />
  );
}

function GrainOverlay() {
  return (
    <div
      className="pointer-events-none fixed inset-0 z-[999] opacity-[0.025]"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        backgroundRepeat: 'repeat'
      }}
    />
  );
}

function HyperRealisticDome({ prefersReducedMotion }) {
  const containerRef = useRef(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const rafRef = useRef(null);
  const targetPos = useRef({ x: 0, y: 0 });
  const currentPos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (prefersReducedMotion) return;

    const handleMouseMove = (e) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      targetPos.current = {
        x: ((e.clientX - centerX) / rect.width) * 15,
        y: ((e.clientY - centerY) / rect.height) * 15
      };
    };

    const animate = () => {
      currentPos.current.x += (targetPos.current.x - currentPos.current.x) * 0.08;
      currentPos.current.y += (targetPos.current.y - currentPos.current.y) * 0.08;
      setMousePos({ x: currentPos.current.x, y: currentPos.current.y });
      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);
    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [prefersReducedMotion]);

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = '/images/hero-3d-render.png';
    link.download = 'cromp-ai-hero.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const glowLayers = useMemo(() => [
    { color: 'rgba(37, 99, 235, 0.15)', delay: 0, size: 1.1 },
    { color: 'rgba(124, 58, 237, 0.12)', delay: 0.5, size: 1.05 },
    { color: 'rgba(6, 182, 212, 0.1)', delay: 1, size: 1.15 }
  ], []);

  return (
    <div 
      ref={containerRef}
      className="relative mx-auto w-full max-w-4xl"
      style={{ perspective: '2000px', transformStyle: 'preserve-3d' }}
    >
      <motion.div
        initial={{ opacity: 0, y: 60, rotateX: -10 }}
        animate={{ opacity: 1, y: 0, rotateX: 0 }}
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        className="relative mx-auto"
        style={{
          transform: prefersReducedMotion ? undefined : `
            perspective(2000px)
            rotateX(${-mousePos.y * 0.3}deg)
            rotateY(${mousePos.x * 0.3}deg)
            translateZ(50px)
          `,
          transformStyle: 'preserve-3d',
          willChange: 'transform'
        }}
      >
        <div className="absolute -inset-20 opacity-50">
          {glowLayers.map((glow, i) => (
            <motion.div
              key={i}
              className="absolute inset-0 rounded-full"
              style={{
                background: `radial-gradient(circle at center, ${glow.color}, transparent 70%)`,
                scale: glow.size
              }}
              animate={prefersReducedMotion ? undefined : {
                scale: [glow.size, glow.size * 1.05, glow.size],
                opacity: [0.3, 0.5, 0.3]
              }}
              transition={{
                duration: 4 + i,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: glow.delay
              }}
            />
          ))}
        </div>

        <div className="relative h-[300px] w-[500px] mx-auto sm:h-[350px] sm:w-[600px] md:h-[400px] md:w-[700px] lg:h-[450px] lg:w-[800px]">
          <div className="absolute inset-0 rounded-[40%_60%_70%_30%/40%_50%_60%_50%] bg-gradient-to-br from-blue-600/20 via-purple-600/15 to-cyan-600/20 backdrop-blur-sm"
            style={{
              transform: 'translateZ(30px)',
              boxShadow: `
                0 0 60px rgba(37, 99, 235, 0.3),
                0 0 120px rgba(124, 58, 237, 0.2),
                inset 0 0 60px rgba(6, 182, 212, 0.1)
              `
            }}
          >
            <div className="absolute inset-4 rounded-[40%_60%_70%_30%/40%_50%_60%_50%] bg-gradient-to-tr from-slate-900/90 via-slate-800/80 to-slate-900/90"
              style={{ transform: 'translateZ(10px)' }}
            >
              <div className="absolute inset-0 rounded-[40%_60%_70%_30%/40%_50%_60%_50%] overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-purple-500/10" />
                <motion.div
                  className="absolute inset-0 opacity-30"
                  style={{
                    background: 'linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.1) 50%, transparent 70%)',
                    backgroundSize: '200% 200%'
                  }}
                  animate={prefersReducedMotion ? undefined : {
                    backgroundPosition: ['0% 0%', '100% 100%']
                  }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                />
              </div>
              
              <div className="absolute inset-8 flex items-center justify-center" style={{ transform: 'translateZ(20px)' }}>
                <motion.div
                  animate={prefersReducedMotion ? undefined : { 
                    scale: [1, 1.02, 1],
                    rotate: [0, 1, -1, 0]
                  }}
                  transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                  className="relative"
                >
                  <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-2xl shadow-blue-500/30 sm:h-28 sm:w-28 md:h-32 md:w-32"
                    style={{ transform: 'translateZ(40px)' }}
                  >
                    <Zap className="h-12 w-12 text-white sm:h-14 sm:w-14 md:h-16 md:w-16" />
                  </div>
                  <motion.div
                    className="absolute -inset-2 rounded-2xl bg-gradient-to-br from-blue-400/50 to-purple-400/50 blur-xl"
                    animate={prefersReducedMotion ? undefined : { opacity: [0.5, 0.8, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                </motion.div>
              </div>

              <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ transform: 'translateZ(15px)' }}>
                {[...Array(6)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute h-1 w-20 rounded-full bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent"
                    style={{
                      top: `${20 + i * 12}%`,
                      left: '50%',
                      transform: `translateX(-50%) translateZ(${5 + i * 3}px)`
                    }}
                    animate={prefersReducedMotion ? undefined : {
                      opacity: [0.2, 0.6, 0.2],
                      scaleX: [0.8, 1, 0.8]
                    }}
                    transition={{
                      duration: 2 + i * 0.3,
                      repeat: Infinity,
                      delay: i * 0.2
                    }}
                  />
                ))}
              </div>
            </div>
          </div>

          <motion.div
            className="absolute -bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 rounded-full border border-white/20 bg-black/50 px-4 py-2 backdrop-blur-md cursor-pointer hover:bg-black/70 transition-colors"
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleDownload}
            style={{ transform: 'translateX(-50%) translateZ(60px)' }}
          >
            <Download className="h-4 w-4 text-blue-400" />
            <span className="text-xs font-medium text-white">Download 3D Asset</span>
          </motion.div>

          <motion.div
            className="absolute -right-4 top-1/4 flex items-center gap-2 rounded-lg border border-white/10 bg-black/30 px-3 py-1.5 backdrop-blur-sm"
            animate={prefersReducedMotion ? undefined : { y: [-5, 5, -5], opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 4, repeat: Infinity }}
            style={{ transform: 'translateZ(50px)' }}
          >
            <Sparkles className="h-3 w-3 text-yellow-400" />
            <span className="text-[10px] font-medium text-zinc-300">AI Powered</span>
          </motion.div>

          <motion.div
            className="absolute -left-4 bottom-1/4 flex items-center gap-2 rounded-lg border border-white/10 bg-black/30 px-3 py-1.5 backdrop-blur-sm"
            animate={prefersReducedMotion ? undefined : { y: [5, -5, 5], opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 5, repeat: Infinity }}
            style={{ transform: 'translateZ(45px)' }}
          >
            <Cpu className="h-3 w-3 text-cyan-400" />
            <span className="text-[10px] font-medium text-zinc-300">Neural Engine</span>
          </motion.div>
        </div>

        <div className="absolute -inset-10 pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute h-0.5 w-0.5 rounded-full bg-white/40"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                transform: `translateZ(${Math.random() * 30}px)`
              }}
              animate={prefersReducedMotion ? undefined : {
                opacity: [0.2, 0.8, 0.2],
                scale: [0.5, 1.5, 0.5]
              }}
              transition={{
                duration: 2 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2
              }}
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
}

function HeroSection({ userData, navigate, currentPhrase, isTransitioning, prefersReducedMotion }) {
  const videoRef = useRef(null);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [showFallback, setShowFallback] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!videoLoaded) setShowFallback(true);
    }, 3000);
    return () => clearTimeout(timer);
  }, [videoLoaded]);

  return (
    <section id="hero" className="relative min-h-screen overflow-hidden">
      <div className="absolute inset-0">
        <video
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          onLoadedData={() => setVideoLoaded(true)}
          onError={() => setShowFallback(true)}
          className="absolute inset-0 h-full w-full object-cover"
          poster="/images/hero-poster.jpg"
        >
          <source src="/videos/image%201.mp4" type="video/mp4" />
        </video>

        <AnimatePresence>
          {showFallback && (
            <motion.img
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1920&q=80"
              alt=""
              className="absolute inset-0 h-full w-full object-cover"
            />
          )}
        </AnimatePresence>

        <div className="absolute inset-0 bg-gradient-to-b from-[#0b1020]/70 via-[#0b1020]/48 to-[#0b1020]/76" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0b1020]/58 via-transparent to-[#0b1020]/58" />
        
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(37,99,235,0.12)_0%,transparent_60%)]" />
      </div>

      <FloatingOrb className="top-1/4 -left-32 h-96 w-96 bg-blue-500/20" delay={0} duration={25} />
      <FloatingOrb className="top-1/3 right-0 h-80 w-80 bg-purple-500/15" delay={5} duration={30} />
      <FloatingOrb className="bottom-1/4 left-1/4 h-64 w-64 bg-cyan-500/10" delay={10} duration={22} />

      <div className="relative z-10 mx-auto flex min-h-screen max-w-7xl flex-col items-center justify-center px-4 pt-20 pb-16 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="text-center"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-2 backdrop-blur-sm"
          >
            <Sparkles className="h-4 w-4 text-blue-400" />
            <span className="text-sm font-medium text-blue-200">AI-Powered Development Platform</span>
          </motion.div>

          <h1 className="mb-6 text-4xl font-bold leading-tight tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
            <span className="block">Build Faster with</span>
            <motion.span 
              className="mt-2 block bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent"
              animate={prefersReducedMotion ? undefined : {
                backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
              }}
              transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
              style={{ backgroundSize: '200% auto' }}
            >
              AI Coding Agents
            </motion.span>
          </h1>

          <div className="mx-auto mb-8 max-w-2xl">
            <p className="mb-4 text-lg text-zinc-300 sm:text-xl">
              End-to-end autonomous agents that plan, code, test, and deploy.
            </p>
            <div className="h-12 overflow-hidden flex justify-center">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentPhrase}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4, ease: "easeInOut" }}
                  className="flex items-center justify-center gap-3"
                >
                  <motion.div 
                    className="flex-shrink-0 h-3 w-3 rounded-full bg-gradient-to-r from-blue-400 to-cyan-400 flex-none"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                  <span className="text-lg font-semibold text-transparent bg-clip-text bg-gradient-to-r from-blue-300 via-cyan-300 to-blue-300 sm:text-xl whitespace-nowrap">
                    {currentPhrase}
                  </span>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="flex flex-col items-center justify-center gap-4 sm:flex-row"
          >
            <motion.button
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate(userData ? '/dashboard' : '/auth')}
              className="group flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-4 text-lg font-semibold text-white shadow-2xl shadow-blue-500/30 transition-all hover:shadow-blue-500/50"
            >
              <span>Start Building Free</span>
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate(userData ? '/ai-studio' : '/auth')}
              className="flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-8 py-4 text-lg font-medium text-white backdrop-blur-sm transition hover:bg-white/10"
            >
              <Terminal className="h-5 w-5 text-purple-400" />
              <span>Open AI Studio</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-2 px-6 py-4 text-lg font-medium text-zinc-300 transition hover:text-white"
            >
              <Play className="h-5 w-5 text-blue-400" />
              <span>Watch Demo</span>
            </motion.button>
          </motion.div>
        </motion.div>

      </div>

      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0b1020] to-transparent" />
    </section>
  );
}

function SocialProofSection() {
  const { count: devsCount, ref: devsRef } = useCountUp(50000, 2500, true);
  const { count: projectsCount, ref: projectsRef } = useCountUp(120000, 2500, true);
  const { count: linesCount, ref: linesRef } = useCountUp(10, 2500, true);

  return (
    <section className="relative border-y border-white/5 bg-black/20 py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 flex flex-wrap items-center justify-center gap-8 opacity-60">
          {clientLogos.map((logo, i) => (
            <motion.div
              key={logo}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="text-lg font-semibold tracking-wide text-zinc-400"
            >
              {logo}
            </motion.div>
          ))}
        </div>

        <div ref={devsRef} className="grid grid-cols-1 gap-8 border-t border-white/10 pt-12 sm:grid-cols-3">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <div className="mb-2 text-4xl font-bold text-blue-400">
              {devsCount.toLocaleString()}+
            </div>
            <p className="text-zinc-400">Active Developers</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-center"
          >
            <div className="mb-2 text-4xl font-bold text-purple-400">
              {projectsCount.toLocaleString()}+
            </div>
            <p className="text-zinc-400">Projects Generated</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-center"
          >
            <div className="mb-2 text-4xl font-bold text-emerald-400">
              {linesCount}M+
            </div>
            <p className="text-zinc-400">Lines of Code Written</p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function FeaturesSection({ prefersReducedMotion }) {
  return (
    <section id="features" className="relative py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          className="mb-16 text-center"
        >
          <span className="mb-4 inline-block rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-1 text-sm font-medium text-blue-300">
            Features
          </span>
          <h2 className="mb-4 text-3xl font-bold sm:text-4xl md:text-5xl">
            Everything you need to{" "}
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              ship faster
            </span>
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-zinc-400">
            A complete AI development toolkit designed for modern teams and solo developers alike.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {featuresData.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              whileHover={{ y: -8, scale: 1.02 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className="group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.05] to-transparent p-6 backdrop-blur-sm transition-all hover:border-white/20"
            >
              <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 transition-opacity duration-500 group-hover:opacity-100`} />
              
              <div className="relative z-10">
                <div className="mb-4 inline-flex rounded-xl border border-white/10 bg-black/30 p-3">
                  <feature.icon className={`h-6 w-6 ${feature.iconColor}`} />
                </div>
                <h3 className="mb-2 text-xl font-semibold">{feature.title}</h3>
                <p className="text-sm leading-relaxed text-zinc-400">{feature.description}</p>
              </div>

              <motion.div
                className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-blue-500/50 to-transparent opacity-0 transition-opacity group-hover:opacity-100"
                animate={prefersReducedMotion ? undefined : { x: ["-100%", "100%"] }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function WorkflowSection({ prefersReducedMotion }) {
  const [activeStep, setActiveStep] = useState(0);
  const containerRef = useRef(null);
  const inView = useInView(containerRef, { once: true, amount: 0.5 });

  useEffect(() => {
    if (prefersReducedMotion || !inView) return;
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % workflowSteps.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [prefersReducedMotion, inView]);

  return (
    <section id="workflow" className="relative py-24">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-500/5 to-transparent" />
      
      <div ref={containerRef} className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          className="mb-16 text-center"
        >
          <span className="mb-4 inline-block rounded-full border border-purple-500/30 bg-purple-500/10 px-4 py-1 text-sm font-medium text-purple-300">
            Workflow
          </span>
          <h2 className="mb-4 text-3xl font-bold sm:text-4xl md:text-5xl">
            From idea to production{" "}
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              in minutes
            </span>
          </h2>
        </motion.div>

        <div className="relative">
          <div className="absolute left-1/2 top-0 hidden h-full w-px -translate-x-1/2 bg-gradient-to-b from-blue-500/50 via-purple-500/50 to-pink-500/50 lg:block" />
          
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
            {workflowSteps.map((step, index) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ delay: index * 0.15 }}
                className="relative"
              >
                <motion.div
                  whileHover={{ scale: 1.05, y: -5 }}
                  className={`relative overflow-hidden rounded-2xl border p-6 transition-all ${
                    activeStep === index
                      ? 'border-white/20 bg-gradient-to-b from-white/10 to-white/5 shadow-2xl shadow-blue-500/20'
                      : 'border-white/10 bg-white/[0.02]'
                  }`}
                >
                  <div className={`mb-4 inline-flex rounded-full bg-gradient-to-r ${step.color} p-2`}>
                    <step.icon className="h-5 w-5 text-white" />
                  </div>
                  
                  <div className="mb-2 text-sm font-medium text-zinc-500">Step {step.step}</div>
                  <h3 className="mb-2 text-xl font-bold">{step.title}</h3>
                  <p className="text-sm text-zinc-400">{step.description}</p>

                  {activeStep === index && (
                    <motion.div
                      layoutId="activeWorkflow"
                      className="absolute inset-0 -z-10 rounded-2xl border border-blue-500/30 bg-blue-500/5"
                      transition={{ duration: 0.3 }}
                    />
                  )}
                </motion.div>

                {index < workflowSteps.length - 1 && (
                  <motion.div
                    animate={prefersReducedMotion ? undefined : { x: [0, 10, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="absolute -right-4 top-1/2 hidden lg:block"
                  >
                    <ArrowRight className="h-6 w-6 text-blue-400/50" />
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function UseCasesSection({ prefersReducedMotion }) {
  return (
    <section className="relative py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          className="mb-16 text-center"
        >
          <span className="mb-4 inline-block rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1 text-sm font-medium text-emerald-300">
            Use Cases
          </span>
          <h2 className="mb-4 text-3xl font-bold sm:text-4xl md:text-5xl">
            Built for{" "}
            <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
              every developer
            </span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {useCases.map((useCase, index) => (
            <motion.div
              key={useCase.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              whileHover={{ y: -8 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ delay: index * 0.1 }}
              className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02]"
              style={{ perspective: '1000px' }}
            >
              <div className="relative h-40 overflow-hidden">
                <motion.img
                  src={useCase.image}
                  alt={useCase.title}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0b1020] via-transparent to-transparent" />
              </div>
              <div className="p-6">
                <div className="mb-3 inline-flex rounded-lg bg-white/10 p-2">
                  <useCase.icon className="h-5 w-5 text-blue-400" />
                </div>
                <h3 className="mb-2 text-lg font-semibold">{useCase.title}</h3>
                <p className="text-sm text-zinc-400">{useCase.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function DemoSection({ prefersReducedMotion }) {
  return (
    <section className="relative overflow-hidden py-24">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-500/5 to-transparent" />
      
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          className="mb-12 text-center"
        >
          <span className="mb-4 inline-block rounded-full border border-purple-500/30 bg-purple-500/10 px-4 py-1 text-sm font-medium text-purple-300">
            Live Demo
          </span>
          <h2 className="mb-4 text-3xl font-bold sm:text-4xl md:text-5xl">
            See it in{" "}
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              action
            </span>
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          className="relative mx-auto max-w-5xl"
        >
          <div className="absolute -inset-4 rounded-3xl bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 blur-3xl" />
          
          <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#0d1117] shadow-2xl">
            <div className="flex border-b border-white/10 bg-black/30">
              <div className="flex-shrink-0 border-r border-white/10 p-4">
                <div className="flex items-center gap-2 rounded-lg bg-blue-500/10 px-3 py-1.5">
                  <Code2 className="h-4 w-4 text-blue-400" />
                  <span className="text-xs font-medium text-blue-300">editor.tsx</span>
                </div>
              </div>
              <div className="flex items-center gap-2 px-4">
                <Globe className="h-4 w-4 text-emerald-400" />
                <span className="text-xs text-zinc-400">Preview</span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2">
              <div className="border-r border-white/10 p-4 font-mono text-sm">
                <motion.div
                  animate={prefersReducedMotion ? undefined : { opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="mb-2 text-zinc-500"
                >
                  <span className="text-emerald-400">{"// Your prompt:"}</span>
                </motion.div>
                <p className="mb-4 text-blue-300">
                  "Create a responsive product card with hover animations"
                </p>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <p className="text-purple-400">function <span className="text-yellow-300">ProductCard</span>({"{"} title, price {"}"}) {"{"}</p>
                  <p className="ml-4 text-zinc-400">return (</p>
                  <p className="ml-8 text-zinc-300">{"<motion.div"}</p>
                  <p className="ml-12 text-blue-300">whileHover={"{{"}scale: 1.05{"}}"}</p>
                  <p className="ml-12 text-zinc-300">className="..."</p>
                  <p className="ml-8 text-zinc-300">{">"}</p>
                  <p className="ml-12 text-emerald-300">{"<ProductImage />"}</p>
                  <p className="ml-12 text-blue-300">{"<h3>{title}</h3>"}</p>
                  <p className="ml-8 text-zinc-300">{"</motion.div>"}</p>
                  <p className="ml-4 text-zinc-400">)</p>
                  <p className="text-zinc-300">{"}"}</p>
                </motion.div>
              </div>

              <div className="relative bg-gradient-to-br from-slate-900 to-slate-800 p-8">
                <motion.div
                  animate={prefersReducedMotion ? undefined : { y: [0, -5, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  whileHover={{ scale: 1.05 }}
                  className="mx-auto max-w-xs rounded-2xl bg-white/10 p-4 backdrop-blur-sm"
                  style={{ perspective: '1000px' }}
                >
                  <div className="mb-4 aspect-square overflow-hidden rounded-xl bg-gradient-to-br from-blue-500 to-purple-600">
                    <div className="flex h-full items-center justify-center">
                      <span className="text-4xl">📦</span>
                    </div>
                  </div>
                  <h4 className="font-semibold">Premium Product</h4>
                  <p className="text-sm text-zinc-400">$99.00</p>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="mt-3 rounded-lg bg-blue-500 px-4 py-2 text-center text-sm font-medium text-white"
                  >
                    Add to Cart
                  </motion.div>
                </motion.div>

                <motion.div
                  animate={prefersReducedMotion ? undefined : { x: [0, -5, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="absolute bottom-4 right-4 rounded-full bg-emerald-500/20 px-3 py-1 text-xs text-emerald-300"
                >
                  Live Preview
                </motion.div>
              </div>
            </div>

            <motion.div
              animate={prefersReducedMotion ? undefined : { opacity: [0.3, 0.5, 0.3] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute inset-0 pointer-events-none bg-gradient-to-r from-transparent via-blue-500/5 to-transparent"
            />
          </div>

          <motion.div
            animate={prefersReducedMotion ? undefined : { y: [-5, 5, -5], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="absolute -left-8 top-1/2 rounded-full border border-white/10 bg-black/50 px-4 py-2 text-xs backdrop-blur-sm"
          >
            <Sparkles className="mr-2 inline h-3 w-3 text-yellow-400" />
            AI Generated
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

function PricingSection({ userData, navigate }) {
  return (
    <section id="pricing" className="relative py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          className="mb-16 text-center"
        >
          <span className="mb-4 inline-block rounded-full border border-orange-500/30 bg-orange-500/10 px-4 py-1 text-sm font-medium text-orange-300">
            Pricing
          </span>
          <h2 className="mb-4 text-3xl font-bold sm:text-4xl md:text-5xl">
            Simple, transparent{" "}
            <span className="bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent">
              pricing
            </span>
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-zinc-400">
            Start free, scale when you're ready. No hidden fees.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {pricingPlans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              whileHover={{ y: -8, scale: 1.02 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ delay: index * 0.1 }}
              className={`relative overflow-hidden rounded-2xl border p-8 ${
                plan.popular
                  ? 'border-blue-500/50 bg-gradient-to-b from-blue-500/10 to-transparent'
                  : 'border-white/10 bg-white/[0.02]'
              }`}
            >
              {plan.popular && (
                <div className="absolute right-4 top-4 rounded-full bg-blue-500 px-3 py-1 text-xs font-semibold">
                  Most Popular
                </div>
              )}
              
              <h3 className="mb-2 text-xl font-semibold">{plan.name}</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold">${plan.price}</span>
                <span className="text-zinc-500">/month</span>
              </div>
              
              <ul className="mb-8 space-y-3">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-zinc-300">
                    <Check className="h-4 w-4 text-emerald-400" />
                    {feature}
                  </li>
                ))}
              </ul>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/pricing')}
                className={`w-full rounded-lg py-3 text-sm font-semibold transition ${
                  plan.popular
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/25'
                    : 'border border-white/20 bg-white/5 text-white hover:bg-white/10'
                }`}
              >
                {plan.price === '0' ? 'Get Started Free' : 'Choose Plan'}
              </motion.button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function TestimonialsSection() {
  return (
    <section id="testimonials" className="relative py-24">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-500/5 to-transparent" />
      
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          className="mb-16 text-center"
        >
          <span className="mb-4 inline-block rounded-full border border-pink-500/30 bg-pink-500/10 px-4 py-1 text-sm font-medium text-pink-300">
            Testimonials
          </span>
          <h2 className="mb-4 text-3xl font-bold sm:text-4xl md:text-5xl">
            Loved by{" "}
            <span className="bg-gradient-to-r from-pink-400 to-rose-400 bg-clip-text text-transparent">
              developers
            </span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              whileHover={{ y: -5 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ delay: index * 0.1 }}
              className="relative rounded-2xl border border-white/10 bg-white/[0.02] p-6"
            >
              <Quote className="mb-4 h-8 w-8 text-blue-500/30" />
              <p className="mb-6 text-zinc-300">"{testimonial.quote}"</p>
              <div className="flex items-center gap-4">
                <img
                  src={testimonial.avatar}
                  alt={testimonial.name}
                  className="h-12 w-12 rounded-full border border-white/20 object-cover"
                />
                <div>
                  <p className="font-semibold">{testimonial.name}</p>
                  <p className="text-sm text-zinc-500">{testimonial.role}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-1 pt-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FAQSection() {
  const [openIndex, setOpenIndex] = useState(null);
  const prefersReducedMotion = useReducedMotion();

  return (
    <section id="faq" className="relative py-24">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          className="mb-16 text-center"
        >
          <span className="mb-4 inline-block rounded-full border border-cyan-500/30 bg-cyan-500/10 px-4 py-1 text-sm font-medium text-cyan-300">
            FAQ
          </span>
          <h2 className="mb-4 text-3xl font-bold sm:text-4xl md:text-5xl">
            Frequently asked{" "}
            <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              questions
            </span>
          </h2>
        </motion.div>

        <div className="space-y-4">
          {faqItems.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ delay: index * 0.05 }}
              className="rounded-2xl border border-white/10 bg-white/[0.02]"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="flex w-full items-center justify-between p-5 text-left"
              >
                <span className="font-medium">{item.question}</span>
                <motion.div
                  animate={{ rotate: openIndex === index ? 180 : 0 }}
                  transition={{ duration: prefersReducedMotion ? 0 : 0.2 }}
                >
                  <ChevronDown className="h-5 w-5 text-zinc-400" />
                </motion.div>
              </button>
              <AnimatePresence initial={false}>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: prefersReducedMotion ? 0 : 0.2 }}
                    className="overflow-hidden"
                  >
                    <p className="border-t border-white/10 px-5 pb-5 pt-4 text-sm text-zinc-400">
                      {item.answer}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FinalCTASection({ prefersReducedMotion }) {
  const navigate = useNavigate();
  const { userData } = useSelector((state) => state.user);
  
  return (
    <section className="relative overflow-hidden py-24">
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-pink-600/20" />
      <FloatingOrb className="-top-20 -left-20 h-80 w-80 bg-blue-500/30" delay={0} duration={20} />
      <FloatingOrb className="-bottom-20 -right-20 h-80 w-80 bg-purple-500/30" delay={5} duration={25} />
      
      <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
        >
          <h2 className="mb-6 text-4xl font-bold sm:text-5xl md:text-6xl">
            Ready to build{" "}
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              faster?
            </span>
          </h2>
          <p className="mb-10 text-xl text-zinc-300">
            Join thousands of developers shipping production code with AI.
          </p>
          
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate(userData ? '/dashboard' : '/auth')}
              className="group flex items-center gap-3 rounded-full bg-white px-8 py-4 text-lg font-semibold text-black shadow-2xl shadow-white/20 transition-all"
            >
              <Zap className="h-5 w-5" />
              <span>Start Building Free</span>
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/pricing')}
              className="flex items-center gap-2 rounded-full border border-white/30 px-8 py-4 text-lg font-medium text-white backdrop-blur-sm transition hover:bg-white/10"
            >
              <span>View Pricing</span>
            </motion.button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function Footer() {
  const navigate = useNavigate();
  
  return (
    <footer className="border-t border-white/10 bg-black/40 py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          <div>
            <h4 className="mb-4 font-semibold">Product</h4>
            <ul className="space-y-2 text-sm text-zinc-400">
              <li><button onClick={() => navigate('/')} className="hover:text-white transition">Home</button></li>
              <li><button onClick={() => navigate('/pricing')} className="hover:text-white transition">Pricing</button></li>
              <li><button onClick={() => navigate('/auth')} className="hover:text-white transition">Get Started</button></li>
            </ul>
          </div>
          <div>
            <h4 className="mb-4 font-semibold">Resources</h4>
            <ul className="space-y-2 text-sm text-zinc-400">
              <li><a href="#" className="hover:text-white transition">Documentation</a></li>
              <li><a href="#" className="hover:text-white transition">API Reference</a></li>
              <li><a href="#" className="hover:text-white transition">Blog</a></li>
            </ul>
          </div>
          <div>
            <h4 className="mb-4 font-semibold">Company</h4>
            <ul className="space-y-2 text-sm text-zinc-400">
              <li><a href="#" className="hover:text-white transition">About</a></li>
              <li><a href="#" className="hover:text-white transition">Careers</a></li>
              <li><a href="#" className="hover:text-white transition">Contact</a></li>
            </ul>
          </div>
          <div>
            <h4 className="mb-4 font-semibold">Legal</h4>
            <ul className="space-y-2 text-sm text-zinc-400">
              <li><a href="#" className="hover:text-white transition">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-white transition">Terms of Service</a></li>
              <li><a href="#" className="hover:text-white transition">Cookie Policy</a></li>
            </ul>
          </div>
        </div>
        
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 sm:flex-row">
          <div className="flex items-center gap-2">
            <img 
              src="/images/cromp-logo.svg" 
              alt="CROMP.AI Logo" 
              className="h-8 w-8 object-contain drop-shadow-lg"
            />
            <span className="font-semibold">CROMP.AI</span>
          </div>
          <p className="text-sm text-zinc-500">
            © {new Date().getFullYear()} CROMP.AI. All rights reserved.
          </p>
          <div className="flex gap-4">
            <a href="#" className="text-zinc-400 hover:text-white transition" aria-label="Twitter">
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg>
            </a>
            <a href="#" className="text-zinc-400 hover:text-white transition" aria-label="GitHub">
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.626-5.373-12-12-12z"/></svg>
            </a>
            <a href="#" className="text-zinc-400 hover:text-white transition" aria-label="LinkedIn">
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

function Navbar({ userData, navigate, prefersReducedMotion }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('hero');

  const navLinks = [
    { name: 'Home', href: '#hero' },
    { name: 'Features', href: '#features' },
    { name: 'Workflow', href: '#workflow' },
    { name: 'Pricing', href: '#pricing' },
    { name: 'Testimonials', href: '#testimonials' },
    { name: 'FAQ', href: '#faq' }
  ];

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
      
      for (let i = navLinks.length - 1; i >= 0; i--) {
        const section = navLinks[i].href.replace('#', '');
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top <= 150) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (href) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth' });
    }
    setMobileMenuOpen(false);
  };

  return (
    <>
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className={`fixed left-0 right-0 top-0 z-50 transition-all duration-300 ${
          isScrolled 
            ? 'border-b border-white/10 bg-[#0b1020]/95 backdrop-blur-xl' 
            : 'bg-transparent'
        }`}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <button 
            onClick={() => scrollToSection('#hero')}
            className="flex items-center gap-2.5"
            aria-label="Go to home"
          >
            <motion.div
              whileHover={{ scale: 1.1 }}
              transition={{ duration: 0.2 }}
              className="flex h-10 w-10 items-center justify-center"
            >
              <img 
                src="/images/cromp-logo.svg" 
                alt="CROMP.AI Logo" 
                className="h-10 w-10 object-contain drop-shadow-lg"
              />
            </motion.div>
            <span className="text-lg font-bold tracking-tight">CROMP.AI</span>
          </button>

          <div className="hidden items-center gap-1 lg:flex">
            {navLinks.map((link) => (
              <button
                key={link.name}
                onClick={() => scrollToSection(link.href)}
                className={`relative rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                  activeSection === link.href.replace('#', '')
                    ? 'text-white'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                {activeSection === link.href.replace('#', '') && (
                  <motion.div
                    layoutId="activeSection"
                    className="absolute inset-0 rounded-lg bg-white/10"
                    transition={{ duration: 0.2 }}
                  />
                )}
                <span className="relative z-10">{link.name}</span>
              </button>
            ))}
          </div>

          <div className="hidden items-center gap-3 lg:flex">
            <button
              onClick={() => navigate('/auth')}
              className="rounded-lg px-4 py-2 text-sm font-medium text-zinc-300 transition hover:text-white"
            >
              Sign In
            </button>
            <motion.button
              whileHover={{ scale: 1.02, y: -1 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/auth')}
              className="group flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 transition hover:shadow-blue-500/40"
            >
              <span>Start Building</span>
              <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02, y: -1 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate(userData ? '/ai-studio' : '/auth')}
              className="flex items-center gap-2 rounded-full border border-purple-500/50 bg-purple-500/10 px-5 py-2.5 text-sm font-semibold text-purple-300 transition hover:border-purple-400 hover:bg-purple-500/20"
            >
              <Terminal className="h-4 w-4" />
              <span>Open AI Studio</span>
            </motion.button>
          </div>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-white/5 lg:hidden"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </motion.nav>

      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 z-50 h-full w-[280px] border-l border-white/10 bg-[#0b1020] p-6 lg:hidden"
            >
              <div className="mt-16 flex flex-col gap-2">
                {navLinks.map((link, index) => (
                  <motion.button
                    key={link.name}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => scrollToSection(link.href)}
                    className={`rounded-lg px-4 py-3 text-left text-base font-medium transition ${
                      activeSection === link.href.replace('#', '')
                        ? 'bg-white/10 text-white'
                        : 'text-zinc-400 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    {link.name}
                  </motion.button>
                ))}
              </div>

              <div className="mt-8 flex flex-col gap-3">
                <button
                  onClick={() => {
                    navigate('/auth');
                    setMobileMenuOpen(false);
                  }}
                  className="rounded-lg border border-white/10 px-4 py-3 text-center text-sm font-medium text-zinc-300 transition hover:bg-white/5"
                >
                  Sign In
                </button>
                <button
                  onClick={() => {
                    navigate('/auth');
                    setMobileMenuOpen(false);
                  }}
                  className="rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-3 text-center text-sm font-semibold text-white"
                >
                  Start Building
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

function Home() {
  const navigate = useNavigate();
  const prefersReducedMotion = useReducedMotion();
  const { userData } = useSelector((state) => state.user);
  const { currentPhrase, isTransitioning } = useModernCarousel(typedPhrases);
  const dispatch = useDispatch();
  
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0b1020] text-white">
      <GrainOverlay />
      
      <Navbar userData={userData} navigate={navigate} prefersReducedMotion={prefersReducedMotion} />
      
      <main>
        <HeroSection 
          userData={userData} 
          navigate={navigate} 
          currentPhrase={currentPhrase}
          isTransitioning={isTransitioning}
          prefersReducedMotion={prefersReducedMotion}
        />
        <SocialProofSection />
        <FeaturesSection prefersReducedMotion={prefersReducedMotion} />
        <WorkflowSection prefersReducedMotion={prefersReducedMotion} />
        <UseCasesSection prefersReducedMotion={prefersReducedMotion} />
        <DemoSection prefersReducedMotion={prefersReducedMotion} />
        <PricingSection userData={userData} navigate={navigate} />
        <TestimonialsSection />
        <FAQSection />
        <FinalCTASection prefersReducedMotion={prefersReducedMotion} />
      </main>
      
      <Footer />
    </div>
  );
}

export default Home;