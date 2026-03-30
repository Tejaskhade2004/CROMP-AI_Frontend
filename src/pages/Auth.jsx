import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { auth, provider } from '../firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  updateProfile
} from 'firebase/auth';
import axios from 'axios';
import { setUserData } from '../redux/userSlice';
import { Sparkles, ShieldCheck, WandSparkles } from 'lucide-react';
import { serverUrl } from '../App';

const gradients = [
  'radial-gradient(circle at 20% 20%, rgba(34,211,238,0.25), transparent 30%)',
  'radial-gradient(circle at 80% 10%, rgba(217,70,239,0.22), transparent 32%)',
  'radial-gradient(circle at 50% 80%, rgba(59,130,246,0.18), transparent 30%)'
];

function Auth() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const syncBackendUser = async () => {
    try {
      const me = await axios.get(`${serverUrl}/api/user/me`, { withCredentials: true });
      if (me?.data) dispatch(setUserData(me.data));
    } catch (err) {
      // ignore if backend session not set yet
      console.log('sync /api/user/me failed', err?.response?.status || err?.message);
    }
  };

  const handleGoogle = async () => {
    setErrorMessage('');
    try {
      const result = await signInWithPopup(auth, provider);
      const response = await axios.post(
        `${serverUrl}/api/auth/google`,
        {
          name: result.user.displayName,
          email: result.user.email,
          avatar: result.user.photoURL
        },
        { withCredentials: true }
      );
      dispatch(setUserData({ ...response.data, credits: response.data?.credits ?? 0 }));
      await syncBackendUser();
      navigate('/dashboard');
    } catch (err) {
      console.log(err);
      setErrorMessage('Google sign-in failed. Please try again.');
    }
  };

  const handleEmailAuth = async () => {
    setErrorMessage('');
    setLoading(true);
    try {
      if (!email.trim() || !password.trim()) {
        throw new Error('Please enter email and password.');
      }

      if (mode === 'register') {
        if (!name.trim()) throw new Error('Please enter your name.');
        const cred = await createUserWithEmailAndPassword(auth, email.trim(), password.trim());
        await updateProfile(cred.user, { displayName: name.trim() });
        await axios.post(
          `${serverUrl}/api/auth/manual`,
          { email: cred.user.email, name: name.trim(), avatar: cred.user.photoURL },
          { withCredentials: true }
        );
        await syncBackendUser();
      } else {
        const cred = await signInWithEmailAndPassword(auth, email.trim(), password.trim());
        await axios.post(
          `${serverUrl}/api/auth/manual`,
          {
            email: cred.user.email,
            name: cred.user.displayName || name || 'User',
            avatar: cred.user.photoURL
          },
          { withCredentials: true }
        );
        await syncBackendUser();
      }
      navigate('/dashboard');
    } catch (err) {
      console.log(err);
      const code = err?.code || '';
      if (code === 'auth/operation-not-allowed') {
        setErrorMessage('Enable Email/Password in Firebase console → Authentication → Sign-in method.');
      } else if (code === 'auth/user-not-found' || code === 'auth/wrong-password') {
        setErrorMessage('Invalid credentials. Check email/password or register first.');
      } else if (code === 'auth/email-already-in-use') {
        setErrorMessage('Email already registered. Switch to Login.');
      } else {
        setErrorMessage(err?.message || 'Authentication failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-[100dvh] overflow-hidden bg-[#060815] text-white px-4 sm:px-6">
      <div className="pointer-events-none absolute inset-0">
        {gradients.map((g, i) => (
          <motion.div
            key={i}
            className="absolute inset-0"
            style={{ background: g, filter: 'blur(80px)' }}
            animate={{ opacity: [0.6, 0.9, 0.6], scale: [1, 1.04, 1] }}
            transition={{ duration: 10 + i * 2, repeat: Infinity, ease: 'easeInOut' }}
          />
        ))}
        <div className="absolute inset-0 bg-[#060815]/75" />
      </div>

      <div className="mx-auto flex min-h-[100dvh] max-w-6xl items-center justify-center py-14 sm:py-16">
        <div className="grid w-full grid-cols-1 gap-8 lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="relative overflow-hidden rounded-3xl border border-white/15 bg-white/10 p-8 backdrop-blur-xl"
          >
            <div className="absolute -left-16 -top-12 h-40 w-40 rounded-full bg-cyan-400/20 blur-[100px]" />
            <div className="absolute -right-20 -bottom-14 h-48 w-48 rounded-full bg-fuchsia-500/20 blur-[120px]" />

            <div className="relative z-10 flex items-center gap-3 text-xs uppercase tracking-[0.2em] text-zinc-300">
              <Sparkles size={14} />
              Premium Glass Auth
            </div>

            <h1 className="relative z-10 mt-6 text-4xl font-bold leading-tight md:text-5xl">
              Secure access with
              <span className="block bg-gradient-to-r from-cyan-300 via-blue-300 to-fuchsia-300 bg-clip-text text-transparent">
                fluid animation
              </span>
            </h1>

            <p className="relative z-10 mt-4 max-w-xl text-sm text-zinc-300 md:text-base">
              Choose your flow: Google or email. Designed to stay crisp on mobile and Android, with
              layered glass and motion for a welcoming start.
            </p>

            <div className="relative z-10 mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur-md">
                <ShieldCheck size={16} className="text-emerald-300" />
                <p className="mt-2 text-sm font-semibold">Protected</p>
                <p className="text-xs text-zinc-400">Firebase auth with secure providers.</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur-md">
                <WandSparkles size={16} className="text-cyan-300" />
                <p className="mt-2 text-sm font-semibold">Animated Start</p>
                <p className="text-xs text-zinc-400">Smooth load-in and responsive layout.</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.05 }}
            className="relative rounded-3xl border border-white/15 bg-white/10 p-[1px] backdrop-blur-xl"
          >
            <div className="relative rounded-3xl bg-[#0b0f1b]/90 p-6 sm:p-8">
              <div className="mb-6 flex items-center justify-between">
                <div className="flex gap-2 rounded-full bg-white/5 p-1 text-xs">
                  <button
                    onClick={() => setMode('login')}
                    className={`rounded-full px-3 py-1 transition ${
                      mode === 'login' ? 'bg-white text-black' : 'text-zinc-300'
                    }`}
                  >
                    Login
                  </button>
                  <button
                    onClick={() => setMode('register')}
                    className={`rounded-full px-3 py-1 transition ${
                      mode === 'register' ? 'bg-white text-black' : 'text-zinc-300'
                    }`}
                  >
                    Register
                  </button>
                </div>
                <span className="text-[11px] uppercase tracking-[0.2em] text-zinc-400">
                  Firebase
                </span>
              </div>

              <div className="space-y-4">
                {mode === 'register' && (
                  <div>
                    <label className="text-xs text-zinc-400">Full name</label>
                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-sm outline-none focus:border-cyan-400"
                      placeholder="Jane Doe"
                    />
                  </div>
                )}
                <div>
                  <label className="text-xs text-zinc-400">Email</label>
                  <input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-sm outline-none focus:border-cyan-400"
                    placeholder="you@example.com"
                    type="email"
                  />
                </div>
                <div>
                  <label className="text-xs text-zinc-400">Password</label>
                  <input
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-sm outline-none focus:border-cyan-400"
                    placeholder="••••••••"
                    type="password"
                  />
                </div>
              </div>

              {errorMessage && <p className="mt-3 text-xs text-red-400">{errorMessage}</p>}

              <div className="mt-6 space-y-3">
                <button
                  onClick={handleEmailAuth}
                  disabled={loading}
                  className="w-full rounded-xl bg-white px-4 py-3 text-sm font-semibold text-black transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {loading ? 'Processing...' : mode === 'login' ? 'Login' : 'Create account'}
                </button>

                <button
                  onClick={handleGoogle}
                  className="flex w-full items-center justify-center gap-3 rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/15"
                >
                  <img
                    src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                    alt="Google"
                    className="h-5 w-5"
                  />
                  Continue with Google
                </button>
              </div>

              <AnimatePresence>
                {mode === 'login' && (
                  <motion.p
                    key="support"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 0.9, y: 0 }}
                    exit={{ opacity: 0, y: 6 }}
                    className="mt-4 text-[11px] text-zinc-500"
                  >
                    New here? Switch to Register to create your account.
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default Auth;
