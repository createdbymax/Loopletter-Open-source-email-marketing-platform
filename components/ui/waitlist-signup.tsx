'use client';

import { useState } from 'react';
import { Mail, ArrowRight, CheckCircle, Loader2, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface WaitlistSignupProps {
  onSuccess?: (email: string) => void;
  className?: string;
  variant?: 'default' | 'hero' | 'minimal';
}

export function WaitlistSignup({ 
  onSuccess, 
  className = '', 
  variant = 'default' 
}: WaitlistSignupProps) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !email.includes('@')) {
      setStatus('error');
      setErrorMessage('Please enter a valid email address');
      return;
    }

    setStatus('loading');
    setErrorMessage('');

    try {
      const response = await fetch('/api/waitlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Something went wrong');
      }

      setStatus('success');
      onSuccess?.(email);
      
      // Reset form after 3 seconds
      setTimeout(() => {
        setEmail('');
        setStatus('idle');
      }, 3000);
    } catch (error) {
      setStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Failed to join waitlist');
    }
  };

  if (variant === 'hero') {
    return (
      <div className={`max-w-md mx-auto ${className}`}>
        <AnimatePresence mode="wait">
          {status === 'success' ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="text-center p-8 bg-green-50 dark:bg-green-950/20 rounded-2xl border border-green-200 dark:border-green-800"
            >
              <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-green-900 dark:text-green-100 mb-2">
                Request submitted! 🎉
              </h3>
              <p className="text-green-700 dark:text-green-300">
                We'll review your request and get back to you soon with early access.
              </p>
            </motion.div>
          ) : (
            <motion.form
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              onSubmit={handleSubmit}
              className="space-y-4"
            >
              <div className="text-center mb-6">
                <div className="inline-flex items-center gap-2 bg-blue-50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-300 px-4 py-2 rounded-full text-sm font-medium mb-4">
                  <Sparkles className="w-4 h-4" />
                  Early Access
                </div>
                <h3 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
                  Request Early Access
                </h3>
                <p className="text-neutral-600 dark:text-neutral-400">
                  Get priority access to the email marketing platform built for artists.
                </p>
              </div>

              <div className="relative">
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className="w-full pl-12 pr-4 py-4 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-lg"
                  disabled={status === 'loading'}
                />
              </div>

              {status === 'error' && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-600 dark:text-red-400 text-sm"
                >
                  {errorMessage}
                </motion.p>
              )}

              <button
                type="submit"
                disabled={status === 'loading' || !email}
                className="w-full bg-black hover:bg-neutral-800 dark:bg-blue-600 dark:hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed group"
              >
                {status === 'loading' ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Joining...
                  </>
                ) : (
                  <>
                    Request Access
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>

              <p className="text-xs text-neutral-500 dark:text-neutral-400 text-center">
                No spam, ever. We'll only contact you about early access.
              </p>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    );
  }

  if (variant === 'minimal') {
    return (
      <div className={className}>
        <AnimatePresence mode="wait">
          {status === 'success' ? (
            <motion.div
              key="success"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2 text-green-600 dark:text-green-400"
            >
              <CheckCircle className="w-5 h-5" />
              <span className="font-medium">Added to waitlist!</span>
            </motion.div>
          ) : (
            <motion.form
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onSubmit={handleSubmit}
              className="flex gap-2"
            >
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter email"
                className="flex-1 px-3 py-2 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                disabled={status === 'loading'}
              />
              <button
                type="submit"
                disabled={status === 'loading' || !email}
                className="bg-black hover:bg-neutral-800 dark:bg-blue-600 dark:hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {status === 'loading' ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  'Join'
                )}
              </button>
            </motion.form>
          )}
        </AnimatePresence>
        {status === 'error' && (
          <p className="text-red-600 dark:text-red-400 text-sm mt-2">
            {errorMessage}
          </p>
        )}
      </div>
    );
  }

  // Default variant
  return (
    <div className={`bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-700 p-6 ${className}`}>
      <AnimatePresence mode="wait">
        {status === 'success' ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="text-center"
          >
            <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-green-900 dark:text-green-100 mb-1">
              Welcome to the waitlist!
            </h3>
            <p className="text-green-700 dark:text-green-300 text-sm">
              We'll email you when it's your turn.
            </p>
          </motion.div>
        ) : (
          <motion.div
            key="form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="flex items-center gap-2 mb-4">
              <Mail className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                Request Early Access
              </h3>
            </div>
            <p className="text-neutral-600 dark:text-neutral-400 text-sm mb-4">
              Get priority access to the email marketing platform built for artists.
            </p>
            
            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                className="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                disabled={status === 'loading'}
              />
              
              {status === 'error' && (
                <p className="text-red-600 dark:text-red-400 text-sm">
                  {errorMessage}
                </p>
              )}
              
              <button
                type="submit"
                disabled={status === 'loading' || !email}
                className="w-full bg-black hover:bg-neutral-800 dark:bg-blue-600 dark:hover:bg-blue-700 text-white px-4 py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {status === 'loading' ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Joining...
                  </>
                ) : (
                  <>
                    Request Access
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}