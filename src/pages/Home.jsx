import React, { useEffect, useState, useRef } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Coins, FileCode, Gauge, Rocket, ShieldCheck, Sparkles, Zap } from 'lucide-react';
import axios from 'axios';
import { serverUrl } from '../App';
import { setUserData } from '../redux/userSlice';

const backgroundImages = [
  "https://images.unsplash.com/photo-1555099962-4199c345e5dd?auto=format&fm=webp&fit=crop&w=2400&q=85",
  "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fm=webp&fit=crop&w=2400&q=85",
  "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fm=webp&fit=crop&w=2400&q=85"
];

const marqueeTags = [
  "Animation",
  "Microinteractions",
  "Storytelling",
  "Parallax",
  "WebGL",
  "Typography",
  "GSAP",
  "React",
  "Motion"
];

const showcaseSites = [
  { title: "SUTERA", label: "Site Of The Day", by: "Okey Studio PRO" },
  { title: "Pixel Vault", label: "Website", by: "Karan Chouhan" },
  { title: "Hyperia", label: "Website", by: "Just Happiness PRO" },
  { title: "Retune", label: "Website", by: "Sujan Khadgi" }
];

const featureCards = [
  {
    title: "AI Generated Code",
    description: "From prompt to deployable structure with reusable component patterns.",
    icon: FileCode,
    glow: "from-cyan-400/40 to-blue-500/10"
  },
  {
    title: "Motion System",
    description: "A modern interaction layer with transitions designed for conversion.",
    icon: Sparkles,
    glow: "from-fuchsia-400/35 to-indigo-500/10"
  },
  {
    title: "Production Ready",
    description: "Responsive layouts, clean sections, and scalable structure out of the box.",
    icon: ShieldCheck,
    glow: "from-emerald-400/35 to-teal-500/10"
  }
];

const statItems = [
  { value: "60FPS", label: "Smooth Interactions", icon: Zap },
  { value: "1 Prompt", label: "To Generated Site", icon: Rocket },
  { value: "Responsive", label: "Desktop + Mobile", icon: Gauge }
];

const floatingParticles = [
  { top: "10%", left: "8%", size: 4, duration: 7 },
  { top: "18%", left: "82%", size: 5, duration: 9 },
  { top: "28%", left: "60%", size: 3, duration: 6 },
  { top: "45%", left: "14%", size: 4, duration: 8 },
  { top: "58%", left: "70%", size: 6, duration: 10 },
  { top: "74%", left: "38%", size: 5, duration: 8 },
  { top: "82%", left: "90%", size: 3, duration: 7 },
  { top: "88%", left: "20%", size: 4, duration: 9 }
];

const typedWords = [
  "Intelligent",
  "Automated",
  "Your AI Agent"
];

function Home() {
  const navigate = useNavigate();
  const prefersReducedMotion = useReducedMotion();
  const { userData } = useSelector((state) => state.user);
  const avatarUrl = userData?.avatar || userData?.photoURL || userData?.picture || '';
  const [avatarLoadFailed, setAvatarLoadFailed] = useState(false);
  const [openProfile, setOpenProfile] = useState(false);
  const [currentBackground, setCurrentBackground] = useState(0);
  const [showIntro, setShowIntro] = useState(true);
  const [typedWordIndex, setTypedWordIndex] = useState(0);
  const [typedText, setTypedText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [wordEffect, setWordEffect] = useState(false);
  const dispatch = useDispatch();
  const prevTypedWordIndex = useRef(0);

  const avatarInitials = (userData?.name || userData?.email || 'U')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || '')
    .join('')
    .slice(0, 2);

  useEffect(() => {
    setAvatarLoadFailed(false);
  }, [avatarUrl]);

  useEffect(() => {
    backgroundImages.forEach((src) => {
      const image = new Image();
      image.src = src;
    });
  }, []);

  useEffect(() => {
    if (prefersReducedMotion) return undefined;

    const interval = setInterval(() => {
      setCurrentBackground((prev) => (prev + 1) % backgroundImages.length);
    }, 8200);
    return () => clearInterval(interval);
  }, [prefersReducedMotion]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setShowIntro(false);
    }, prefersReducedMotion ? 450 : 1850);

    return () => clearTimeout(timeout);
  }, [prefersReducedMotion]);

  // Typed animation effect (same as original)
  useEffect(() => {
    const currentWord = typedWords[typedWordIndex];
    let timeoutMs = isDeleting ? 50 : 95;

    if (!isDeleting && typedText === currentWord) timeoutMs = 900;
    if (isDeleting && typedText === "") timeoutMs = 240;

    const timer = setTimeout(() => {
      if (!isDeleting) {
        if (typedText === currentWord) {
          setIsDeleting(true);
        } else {
          setTypedText(currentWord.slice(0, typedText.length + 1));
        }
      } else {
        if (typedText === "") {
          setIsDeleting(false);
          setTypedWordIndex((prev) => (prev + 1) % typedWords.length);
        } else {
          setTypedText(currentWord.slice(0, typedText.length - 1));
        }
      }
    }, timeoutMs);

    return () => clearTimeout(timer);
  }, [typedText, isDeleting, typedWordIndex]);

  // Trigger word effect when word index changes
  useEffect(() => {
    if (prefersReducedMotion) return;
    if (typedWordIndex !== prevTypedWordIndex.current) {
      setWordEffect(true);
      const timer = setTimeout(() => setWordEffect(false), 400);
      return () => clearTimeout(timer);
    }
    prevTypedWordIndex.current = typedWordIndex;
  }, [typedWordIndex, prefersReducedMotion]);

  const handleLogout = async () => {
    try {
      await axios.get(`${serverUrl}/api/auth/logout`, { withCredentials: true });
      dispatch(setUserData(null));
      setOpenProfile(false);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="relative min-h-[100dvh] overflow-hidden bg-[#040407] text-white">
      <div className="pointer-events-none absolute inset-0">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={backgroundImages[currentBackground]}
            initial={{ opacity: 0 }}
            animate={
              prefersReducedMotion
                ? { opacity: 0.38 }
                : { opacity: 0.42, scale: [1, 1.06, 1], y: [0, -16, 0] }
            }
            exit={{ opacity: 0 }}
            transition={{
              duration: prefersReducedMotion ? 0.2 : 7.5,
              ease: "easeInOut",
              times: prefersReducedMotion ? undefined : [0, 0.7, 1]
            }}
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `url(${backgroundImages[currentBackground]})`,
              willChange: "opacity, transform"
            }}
          />
        </AnimatePresence>

        <motion.div
          className="absolute inset-0"
          animate={
            prefersReducedMotion
              ? undefined 
              : { backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }
          }
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          style={{
            background:
              "linear-gradient(115deg, rgba(34,211,238,0.18), rgba(59,130,246,0.08), rgba(217,70,239,0.16), rgba(34,211,238,0.18))",
            backgroundSize: "240% 240%",
            mixBlendMode: "screen"
          }}
        />

        <motion.div
          className="absolute inset-0 opacity-[0.22]"
          animate={
            prefersReducedMotion
              ? undefined
              : { backgroundPosition: ["0px 0px", "0px 56px"] }
          }
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.08) 1px, transparent 1px)",
            backgroundSize: "48px 48px"
          }}
        />

        <div className="absolute inset-0 bg-[#040407]/78" />
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(circle at 18% 12%, rgba(34,211,238,0.16), transparent 34%), radial-gradient(circle at 86% 36%, rgba(217,70,239,0.14), transparent 32%)"
          }}
        />

        {!prefersReducedMotion &&
          floatingParticles.map((particle, index) => (
            <motion.span
              key={index}
              className="absolute rounded-full bg-white/70"
              style={{
                top: particle.top,
                left: particle.left,
                width: particle.size,
                height: particle.size
              }}
              animate={{
                y: [0, -18, 0],
                opacity: [0.28, 0.88, 0.28],
                scale: [1, 1.18, 1]
              }}
              transition={{
                duration: particle.duration,
                repeat: Infinity,
                ease: "easeInOut",
                delay: index * 0.25
              }}
            />
          ))}
      </div>

      <AnimatePresence>
        {showIntro && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: prefersReducedMotion ? 0.2 : 0.55 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-[#040407]"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: prefersReducedMotion ? 0.2 : 0.5 }}
              className="w-[88%] max-w-md rounded-2xl border border-white/15 bg-white/[0.06] p-6 backdrop-blur-xl"
            >
              <motion.p
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: prefersReducedMotion ? 0 : 0.1 }}
                className="text-center text-2xl font-semibold tracking-wide"
              >
                CROMP.AI
              </motion.p>

              <motion.p
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 0.85 }}
                transition={{ delay: prefersReducedMotion ? 0 : 0.2 }}
                className="mt-1 text-center text-xs uppercase tracking-[0.24em] text-zinc-300"
              >
                Starting Experience
              </motion.p>

              <div className="mt-5 h-2 w-full overflow-hidden rounded-full bg-white/10">
                <motion.div
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: prefersReducedMotion ? 0.3 : 1.5, ease: "easeInOut" }}
                  className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-blue-500 to-fuchsia-500"
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ y: -36, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.55, ease: "easeOut" }}
        className="fixed left-0 right-0 top-0 z-50 border-b border-white/10 bg-black/40 backdrop-blur-md"
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <div className="text-lg font-semibold tracking-wide">Cromp.AI</div>

          <div className="flex items-center gap-3 md:gap-5">
            <button
              className="hidden cursor-pointer text-sm text-zinc-300 transition hover:text-white md:inline"
              onClick={() => navigate('/pricing')}
            >
              Pricing
            </button>

            {userData && (
              <button
                className="hidden cursor-pointer items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-sm transition hover:bg-white/10 md:flex"
                onClick={() => navigate('/pricing')}
              >
                <Coins size={14} className="text-yellow-400" />
                <span className="text-zinc-300">Credits</span>
                <span>{userData.credits}</span>
                <span className="font-semibold">+</span>
              </button>
            )}

            {!userData ? (
              <button
                className="rounded-lg border border-white/20 px-4 py-2 text-sm font-medium transition hover:bg-white/10"
                onClick={() => navigate('/auth')}
              >
                Get Started
              </button>
            ) : (
              <div className="relative">
                <button className="flex items-center" onClick={() => setOpenProfile(!openProfile)}>
                  {avatarUrl && !avatarLoadFailed ? (
                    <img
                      src={avatarUrl}
                      alt={userData?.name || 'User'}
                      className="h-9 w-9 rounded-full border border-white/20 object-cover"
                      onError={() => setAvatarLoadFailed(true)}
                    />
                  ) : (
                    <div className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-white/10 text-sm font-semibold text-white">
                      {avatarInitials}
                    </div>
                  )}
                </button>

                <AnimatePresence>
                  {openProfile && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.96 }}
                      className="absolute right-0 z-50 mt-3 w-60 overflow-hidden rounded-xl border border-white/10 bg-[#0b0b0f] shadow-2xl"
                    >
                      <div className="border-b border-white/10 px-4 py-3">
                        <p className="truncate text-sm font-medium">{userData.name}</p>
                        <p className="truncate text-xs text-zinc-500">{userData.email}</p>
                      </div>
                      <button className="flex w-full items-center gap-2 border-b border-white/10 px-4 py-3 text-sm hover:bg-white/5 md:hidden" onClick={() => navigate('/pricing')}>
                        <Coins size={14} className="text-yellow-400" />
                        <span className="text-zinc-300">Credits</span>
                        <span>{userData.credits}</span>
                        <span className="font-semibold">+</span>
                      </button>
                      <button className="w-full px-4 py-3 text-left text-sm hover:bg-white/5" onClick={() => navigate('/dashboard')}>Dashboard</button>
                      <button className="w-full px-4 py-3 text-left text-sm hover:bg-white/5" onClick={() => navigate('/pricing')}>Pricing</button>
                      <button className="w-full px-4 py-3 text-left text-sm text-red-400 hover:bg-white/5" onClick={handleLogout}>Logout</button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      <main className="relative z-10">
        <section className="px-4 pb-14 pt-28 sm:px-6 md:pb-20 md:pt-36">
          <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 lg:grid-cols-2 lg:items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.65, delay: 0.1 }}
            >
              <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs text-zinc-300">
                <Sparkles size={12} />
                Awwwards-inspired motion experience
              </p>

              <h1 className="text-4xl font-bold leading-[1.04] tracking-tight sm:text-5xl md:text-7xl">
                Build websites
                <span className="mt-1 block bg-gradient-to-r from-cyan-300 via-blue-300 to-fuchsia-300 bg-clip-text text-transparent">
                  <motion.span
                    animate={
                      prefersReducedMotion
                        ? {}
                        : {
                            scale: wordEffect ? 1.08 : 1,
                            textShadow: wordEffect
                              ? [
                                  "0 0 0px rgba(0,255,255,0)",
                                  "0 0 12px rgba(0,255,255,0.8)",
                                  "0 0 20px rgba(0,255,255,0.4)",
                                  "0 0 0px rgba(0,255,255,0)"
                                ]
                              : "0 0 0px rgba(0,255,255,0)"
                          }
                    }
                    transition={{
                      duration: 0.3,
                      ease: "easeOut",
                      textShadow: { duration: 0.4, times: [0, 0.3, 0.7, 1] }
                    }}
                    style={{ display: "inline-block" }}
                  >
                    {typedText}
                  </motion.span>
                  <span className="ml-1 inline-block animate-pulse text-cyan-200">|</span>
                </span>
              </h1>

              <p className="mt-5 max-w-xl text-sm text-zinc-300 sm:text-base md:text-lg">
                Go from idea to animated, responsive, production-style pages in minutes. Crafted for creators who want premium interaction without the heavy manual lift.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                {!userData ? (
                  <button
                    className="rounded-xl bg-white px-6 py-3 text-sm font-semibold text-black transition hover:scale-[1.03]"
                    onClick={() => navigate('/auth')}
                  >
                    Get Started
                  </button>
                ) : (
                  <button
                    className="rounded-xl bg-white px-6 py-3 text-sm font-semibold text-black transition hover:scale-[1.03]"
                    onClick={() => navigate('/dashboard')}
                  >
                    Go to Dashboard
                  </button>
                )}

                <button
                  className="rounded-xl border border-white/20 px-6 py-3 text-sm font-medium text-zinc-100 transition hover:bg-white/10"
                  onClick={() => navigate('/pricing')}
                >
                  Explore Pricing
                </button>
              </div>

              <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
                {statItems.map((item, index) => (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + index * 0.08 }}
                    className="rounded-xl border border-white/10 bg-white/[0.04] p-3"
                  >
                    <item.icon size={14} className="mb-2 text-cyan-300" />
                    <p className="text-sm font-semibold">{item.value}</p>
                    <p className="text-xs text-zinc-400">{item.label}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.65, delay: 0.2 }}
              className="relative mx-auto h-[340px] w-full max-w-[520px] sm:h-[390px]"
            >
              <motion.div
                animate={prefersReducedMotion ? undefined : { y: [0, -8, 0], rotateX: [0, 1.2, 0] }}
                transition={{ duration: 5.8, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute inset-0 rounded-3xl border border-white/15 bg-gradient-to-br from-white/10 via-white/5 to-transparent p-5 backdrop-blur-md"
                style={{ willChange: prefersReducedMotion ? "auto" : "transform" }}
              >
                <div className="mb-4 flex items-center justify-between border-b border-white/10 pb-3">
                  <p className="text-xs text-zinc-300">Animation Showcase</p>
                  <p className="text-[11px] text-zinc-500">Live</p>
                </div>

                <div className="space-y-3">
                  {showcaseSites.map((site, index) => (
                    <motion.div
                      key={site.title}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.25 + index * 0.08 }}
                      whileHover={{ scale: 1.02, x: 3 }}
                      className="rounded-xl border border-white/10 bg-black/30 p-3"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold">{site.title}</p>
                          <p className="text-xs text-zinc-400">{site.label}</p>
                        </div>
                        <span className="rounded-full border border-white/15 px-2 py-1 text-[10px] text-zinc-300">
                          {site.by}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              <motion.div
                animate={prefersReducedMotion ? undefined : { y: [0, -4, 0], rotate: [0, 1.5, 0, -1.5, 0] }}
                transition={{ duration: 8.5, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute -bottom-6 right-2 rounded-2xl border border-cyan-300/25 bg-cyan-400/10 px-4 py-3 text-xs text-cyan-200 backdrop-blur-sm sm:-bottom-8 sm:-right-7"
                style={{ willChange: prefersReducedMotion ? "auto" : "transform" }}
              >
                Motion-first UI
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* MARQUEE SECTION WITH 3D SPIN (rotateY) ON EACH TAG */}
        <section className="relative border-y border-white/10 bg-black/20 py-4">
          <div className="overflow-hidden">
            <motion.div
              animate={{ x: ['0%', '-50%'] }}
              transition={{ duration: 22, repeat: Infinity, ease: 'linear' }}
              className="flex w-max"
              style={{ 
                transformStyle: "preserve-3d", 
                willChange: "transform", 
                perspective: "1000px" 
              }}
            >
              {[...marqueeTags, ...marqueeTags].map((tag, index) => (
                <motion.div
                  key={`${tag}-${index}`}
                  animate={{ rotateY: [0, 360] }}
                  transition={{
                    duration: 8,
                    repeat: Infinity,
                    ease: 'linear'
                  }}
                  className="mx-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.18em] text-zinc-300"
                  style={{ transformStyle: 'preserve-3d' }}
                >
                  {tag}
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>
        {/* END MARQUEE SECTION */}

        <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 md:py-20">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {featureCards.map((card, index) => (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                whileHover={{ y: -7, scale: 1.015 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ duration: 0.45, delay: index * 0.1 }}
                className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] p-7"
              >
                <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${card.glow} opacity-0 transition-opacity duration-500 group-hover:opacity-100`} />
                <div className="relative z-10">
                  <div className="mb-4 inline-flex rounded-xl border border-white/10 bg-black/35 p-2">
                    <card.icon size={18} className="text-white" />
                  </div>
                  <h3 className="mb-2 text-xl font-semibold">{card.title}</h3>
                  <p className="text-sm text-zinc-400">{card.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      </main>

      <footer className="relative z-10 border-t border-white/10 py-10 text-center text-sm text-zinc-500">
        &copy; {new Date().getFullYear()} Cromp.AI. All rights reserved.
      </footer>
    </div>
  );
}

export default Home;