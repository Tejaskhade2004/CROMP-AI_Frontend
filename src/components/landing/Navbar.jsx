import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, Zap, ChevronRight, Code2 } from 'lucide-react';
import { useSelector } from 'react-redux';

const navLinks = [
  { name: 'Home', href: '#hero' },
  { name: 'Features', href: '#features' },
  { name: 'Workflow', href: '#workflow' },
  { name: 'Pricing', href: '#pricing' },
  { name: 'Testimonials', href: '#testimonials' },
  { name: 'FAQ', href: '#faq' }
];

function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('hero');
  const prefersReducedMotion = useReducedMotion();
  const { userData } = useSelector((state) => state.user);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
      
      const sections = navLinks.map(link => link.href.replace('#', ''));
      for (const section of sections.reverse()) {
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

    window.addEventListener('scroll', handleScroll);
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
            ? 'border-b border-white/10 bg-[#0b1020]/90 backdrop-blur-xl' 
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
              whileHover={{ rotate: 15, scale: 1.1 }}
              transition={{ duration: 0.2 }}
              className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-600"
            >
              <Zap className="h-5 w-5 text-white" />
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
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/auth')}
              className="group flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 transition hover:shadow-blue-500/40"
            >
              <span>Start Building</span>
              <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate(userData ? '/dashboard' : '/auth')}
              className="flex items-center gap-2 rounded-full border border-purple-500/50 bg-purple-500/10 px-5 py-2.5 text-sm font-semibold text-purple-300 transition hover:border-purple-400 hover:bg-purple-500/20"
            >
              <Code2 className="h-4 w-4" />
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

export default Navbar;