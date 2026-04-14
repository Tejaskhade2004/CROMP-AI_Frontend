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
import { Sparkles } from 'lucide-react';
import { serverUrl } from '../config/api';

void motion;

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
      if (err?.message === 'Network Error') {
        setErrorMessage('Backend is unreachable. Start backend or switch API URL, then try again.');
      } else {
        setErrorMessage(err?.response?.data?.message || 'Google sign-in failed. Please try again.');
      }
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
    <div className="min-h-[100dvh] overflow-x-hidden bg-[#060815] text-white">
      <div className="relative grid min-h-[100dvh] grid-cols-1 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, x: -24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="relative min-h-[38dvh] lg:min-h-[100dvh]"
        >
          <video
            autoPlay
            muted
            loop
            playsInline
            preload='metadata'
            className="absolute inset-y-0 left-0 h-full w-full object-cover opacity-75 lg:-right-20 lg:w-[calc(100%+5rem)]"
            poster='/images/hero-poster.jpg'
          >
            <source src='/videos/image%204.mp4' type='video/mp4' />
          </video>

          <div className="absolute inset-0 bg-gradient-to-b from-[#060815]/55 via-[#060815]/35 to-[#060815]/65" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(37,99,235,0.35),transparent_40%),radial-gradient(circle_at_85%_75%,rgba(124,58,237,0.28),transparent_45%)]" />

          <div className="absolute left-6 top-6 z-10 flex items-center gap-2 rounded-full border border-white/20 bg-black/35 px-3 py-1.5 backdrop-blur-md">
            <Sparkles size={14} className="text-cyan-300" />
            <span className="text-xs uppercase tracking-[0.2em] text-zinc-200">Cromp AI</span>
          </div>
        </motion.div>

        <div className="flex min-h-[62dvh] items-center justify-center px-4 py-10 sm:px-6 lg:min-h-[100dvh] lg:px-10">
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.05 }}
            className="relative w-full max-w-xl rounded-3xl border border-white/15 bg-white/10 p-[1px] backdrop-blur-xl"
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
