'use client';

import { useState, useEffect } from 'react';
import { X, Mail, ArrowRight, CheckCircle, Loader2, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface WaitlistPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

export function WaitlistPopup({ isOpen, onClose }: WaitlistPopupProps) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [waitlistCount, setWaitlistCount] = useState<number | null>(null);

  // Fetch waitlist count when popup opens
  useEffect(() => {
    if (isOpen) {
      fetchWaitlistCount();
    }
  }, [isOpen]);

  const fetchWaitlistCount = async () => {
    try {
      const response = await fetch('/api/waitlist');
      if (response.ok) {
        const data = await response.json();
        setWaitlistCount(data.total);
      }
    } catch (error) {
      console.error('Failed to fetch waitlist count:', error);
    }
  };

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
      fetchWaitlistCount(); // Update count
      
      // Auto close after 3 seconds
      setTimeout(() => {
        onClose();
        setEmail('');
        setStatus('idle');
      }, 3000);
    } catch (error) {
      setStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Failed to join waitlist');
    }
  };

  const handleClose = () => {
    onClose();
    setEmail('');
    setStatus('idle');
    setErrorMessage('');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={handleClose}
          />
          
          {/* Popup */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-700 shadow-2xl max-w-md w-full p-6 relative">
              {/* Close button */}
              <button
                onClick={handleClose}
                className="absolute top-4 right-4 p-2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <AnimatePresence mode="wait">
                {status === 'success' ? (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="text-center py-4"
                  >
                    <div className="w-16 h-16 bg-green-100 dark:bg-green-950/30 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
                    </div>
                    <h3 className="text-xl font-bold text-green-900 dark:text-green-100 mb-2">
                      You're on the list! 🎉
                    </h3>
                    <p className="text-green-700 dark:text-green-300 mb-4">
                      We'll notify you as soon as Loopletter is ready for you.
                    </p>
                    {waitlistCount && (
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">
                        You're one of {waitlistCount} artists waiting for early access
                      </p>
                    )}
                  </motion.div>
                ) : (
                  <motion.div
                    key="form"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    {/* Header */}
                    <div className="text-center mb-6">
                      <div className="inline-flex items-center gap-2 bg-blue-50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-300 px-3 py-1.5 rounded-full text-sm font-medium mb-4">
                        <Sparkles className="w-4 h-4" />
                        Early Access
                      </div>
                      <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
                        Join the Waitlist
                      </h2>
                      <p className="text-neutral-600 dark:text-neutral-400">
                        Be the first to experience the email marketing platform built for artists.
                      </p>
                      {waitlistCount && (
                        <p className="text-sm text-blue-600 dark:text-blue-400 mt-2">
                          {waitlistCount} artists already waiting
                        </p>
                      )}
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400" />
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="Enter your email address"
                          className="w-full pl-12 pr-4 py-3 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                          disabled={status === 'loading'}
                          autoFocus
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
                        className="w-full bg-black hover:bg-neutral-800 dark:bg-blue-600 dark:hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed group"
                      >
                        {status === 'loading' ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Joining...
                          </>
                        ) : (
                          <>
                            Join Waitlist
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                          </>
                        )}
                      </button>
                    </form>

                    <p className="text-xs text-neutral-500 dark:text-neutral-400 text-center mt-4">
                      No spam, ever. Unsubscribe at any time.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}