'use client';

import { useState } from 'react';
import { Mail, ArrowRight, CheckCircle, Loader2 } from 'lucide-react';
import { useWaitlist } from '@/hooks/use-waitlist';
import { motion, AnimatePresence } from 'motion/react';

interface InlineWaitlistProps {
  placeholder?: string;
  buttonText?: string;
  successMessage?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function InlineWaitlist({
  placeholder = "Enter your email",
  buttonText = "Join Waitlist",
  successMessage = "Thanks! We'll be in touch soon.",
  className = "",
  size = 'md'
}: InlineWaitlistProps) {
  const [email, setEmail] = useState('');
  const { joinWaitlist, isLoading, error, isSuccess } = useWaitlist({
    onSuccess: () => {
      // Reset email after successful submission
      setTimeout(() => {
        setEmail('');
      }, 3000);
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await joinWaitlist(email);
  };

  const sizeClasses = {
    sm: {
      input: 'px-3 py-2 text-sm',
      button: 'px-4 py-2 text-sm',
      icon: 'w-4 h-4'
    },
    md: {
      input: 'px-4 py-3',
      button: 'px-6 py-3',
      icon: 'w-5 h-5'
    },
    lg: {
      input: 'px-6 py-4 text-lg',
      button: 'px-8 py-4 text-lg',
      icon: 'w-6 h-6'
    }
  };

  const classes = sizeClasses[size];

  return (
    <div className={`w-full max-w-md ${className}`}>
      <AnimatePresence mode="wait">
        {isSuccess ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="flex items-center justify-center gap-2 p-4 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg text-green-700 dark:text-green-300"
          >
            <CheckCircle className={classes.icon} />
            <span className="font-medium">{successMessage}</span>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onSubmit={handleSubmit}
            className="space-y-3"
          >
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Mail className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${classes.icon} text-neutral-400`} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={placeholder}
                  className={`w-full pl-10 pr-4 ${classes.input} bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all`}
                  disabled={isLoading}
                  required
                />
              </div>
              <button
                type="submit"
                disabled={isLoading || !email}
                className={`${classes.button} bg-black hover:bg-neutral-800 dark:bg-blue-600 dark:hover:bg-blue-700 text-white rounded-lg font-medium transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group`}
              >
                {isLoading ? (
                  <Loader2 className={`${classes.icon} animate-spin`} />
                ) : (
                  <>
                    <span className="hidden sm:inline">{buttonText}</span>
                    <span className="sm:hidden">Join</span>
                    <ArrowRight className={`${classes.icon} group-hover:translate-x-1 transition-transform`} />
                  </>
                )}
              </button>
            </div>
            
            {error && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-red-600 dark:text-red-400 text-sm"
              >
                {error}
              </motion.p>
            )}
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}