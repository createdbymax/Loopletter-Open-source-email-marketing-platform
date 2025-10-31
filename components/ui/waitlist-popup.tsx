'use client';
import { useState, useEffect } from 'react';
import { X, ArrowRight, CheckCircle, Loader2, Sparkles, User, Music, Target, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
interface WaitlistPopupProps {
    isOpen: boolean;
    onClose: () => void;
}
interface FormData {
    name: string;
    email: string;
    role: 'artist' | 'manager' | 'label' | 'other';
    otherRole?: string;
    musicLinks: string[];
    fanBaseSize: '0-100' | '100-1K' | '1K-10K' | '10K-50K' | '50K+';
    genre: string;
    currentReachMethods: string[];
    currentEmailPlatform?: string;
    mainGoals: string[];
    emailFrequency: 'weekly' | 'bi-weekly' | 'monthly' | 'announcements';
    openToBetaFeedback: boolean;
    preferredCommunication: 'email' | 'in-app';
    whyLoopletter?: string;
    biggestChallenge?: string;
    additionalContext?: string;
}
export function WaitlistPopup({ isOpen, onClose }: WaitlistPopupProps) {
    const [currentStep, setCurrentStep] = useState(1);
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState('');
    const [waitlistCount, setWaitlistCount] = useState<number | null>(null);
    const [formData, setFormData] = useState<FormData>({
        name: '',
        email: '',
        role: 'artist',
        musicLinks: [''],
        fanBaseSize: '0-100',
        genre: '',
        currentReachMethods: [],
        mainGoals: [],
        emailFrequency: 'monthly',
        openToBetaFeedback: true,
        preferredCommunication: 'email'
    });
    const totalSteps = 4;
    useEffect(() => {
        if (isOpen) {
            fetchWaitlistCount();
        }
    }, [isOpen]);
    const fetchWaitlistCount = async () => {
        try {
            const response = await fetch('/api/early-access');
            if (response.ok) {
                const data = await response.json();
                setWaitlistCount(data.total);
            }
        }
        catch (error) {
            console.error('Failed to fetch early access count:', error);
        }
    };
    const updateFormData = (updates: Partial<FormData>) => {
        setFormData(prev => ({ ...prev, ...updates }));
    };
    const addMusicLink = () => {
        setFormData(prev => ({
            ...prev,
            musicLinks: [...prev.musicLinks, '']
        }));
    };
    const updateMusicLink = (index: number, value: string) => {
        setFormData(prev => ({
            ...prev,
            musicLinks: prev.musicLinks.map((link, i) => i === index ? value : link)
        }));
    };
    const removeMusicLink = (index: number) => {
        setFormData(prev => ({
            ...prev,
            musicLinks: prev.musicLinks.filter((_, i) => i !== index)
        }));
    };
    const toggleArrayValue = (array: string[], value: string) => {
        return array.includes(value)
            ? array.filter(item => item !== value)
            : [...array, value];
    };
    const validateStep = (step: number): boolean => {
        switch (step) {
            case 1:
                return !!(formData.name && formData.email && formData.email.includes('@'));
            case 2:
                return !!(formData.musicLinks.some(link => link.trim()) && formData.genre);
            case 3:
                return formData.currentReachMethods.length > 0;
            case 4:
                return formData.mainGoals.length > 0;
            default:
                return true;
        }
    };
    const handleNext = () => {
        if (validateStep(currentStep)) {
            setCurrentStep(prev => Math.min(prev + 1, totalSteps));
            setErrorMessage('');
        }
        else {
            setErrorMessage('Please fill in all required fields');
        }
    };
    const handlePrevious = () => {
        setCurrentStep(prev => Math.max(prev - 1, 1));
        setErrorMessage('');
    };
    const handleSubmit = async () => {
        if (!validateStep(4)) {
            setErrorMessage('Please fill in all required fields');
            return;
        }
        setStatus('loading');
        setErrorMessage('');
        try {
            const response = await fetch('/api/early-access', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || 'Something went wrong');
            }
            setStatus('success');
            fetchWaitlistCount();
            setTimeout(() => {
                onClose();
                resetForm();
            }, 3000);
        }
        catch (error) {
            setStatus('error');
            setErrorMessage(error instanceof Error ? error.message : 'Failed to submit request');
        }
    };
    const resetForm = () => {
        setCurrentStep(1);
        setStatus('idle');
        setErrorMessage('');
        setFormData({
            name: '',
            email: '',
            role: 'artist',
            musicLinks: [''],
            fanBaseSize: '0-100',
            genre: '',
            currentReachMethods: [],
            mainGoals: [],
            emailFrequency: 'monthly',
            openToBetaFeedback: true,
            preferredCommunication: 'email'
        });
    };
    const handleClose = () => {
        onClose();
        resetForm();
    };
    return (<AnimatePresence>
      {isOpen && (<>
          
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" onClick={handleClose}/>
          
          
          <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-700 shadow-2xl max-w-lg w-full p-4 sm:p-6 relative my-4 max-h-[90vh] overflow-y-auto">
              
              <button onClick={handleClose} className="absolute top-4 right-4 p-2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors">
                <X className="w-5 h-5"/>
              </button>

              <AnimatePresence mode="wait">
                {status === 'success' ? (<motion.div key="success" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} className="text-center py-4">
                    <div className="w-16 h-16 bg-green-100 dark:bg-green-950/30 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400"/>
                    </div>
                    <h3 className="text-xl font-bold text-green-900 dark:text-green-100 mb-2">
                      Request submitted! 🎉
                    </h3>
                    <p className="text-green-700 dark:text-green-300 mb-4">
                      We'll review your request and get back to you soon with early access.
                    </p>
                    {waitlistCount && (<p className="text-sm text-neutral-600 dark:text-neutral-400">
                        You're one of {waitlistCount} artists who have requested early access
                      </p>)}
                  </motion.div>) : (<motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    
                    <div className="text-center mb-4 sm:mb-6">
                      <div className="inline-flex items-center gap-2 bg-blue-50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-300 px-3 py-1.5 rounded-full text-sm font-medium mb-3 sm:mb-4">
                        <Sparkles className="w-4 h-4"/>
                        Early Access
                      </div>
                      <h2 className="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
                        Request Early Access
                      </h2>
                      <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400">
                        Get priority access to the email marketing platform built for artists.
                      </p>
                      
                    </div>

                    
                    <div className="mb-4 sm:mb-6">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400">
                          Step {currentStep} of {totalSteps}
                        </span>
                        <span className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400">
                          {Math.round((currentStep / totalSteps) * 100)}%
                        </span>
                      </div>
                      <div className="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full transition-all duration-300" style={{ width: `${(currentStep / totalSteps) * 100}%` }}/>
                      </div>
                    </div>

                    
                    <div className="min-h-[250px] sm:min-h-[300px]">
                      {currentStep === 1 && (<motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                          <div className="flex items-center gap-2 mb-3 sm:mb-4">
                            <User className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600"/>
                            <h3 className="text-base sm:text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                              Tell us about yourself
                            </h3>
                          </div>

                          <div>
                            <label className="block text-xs sm:text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                              Name / Artist Name *
                            </label>
                            <input type="text" value={formData.name} onChange={(e) => updateFormData({ name: e.target.value })} placeholder="Your name or artist name" className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"/>
                          </div>

                          <div>
                            <label className="block text-xs sm:text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                              Email Address *
                            </label>
                            <input type="email" value={formData.email} onChange={(e) => updateFormData({ email: e.target.value })} placeholder="your@email.com" className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"/>
                          </div>

                          <div>
                            <label className="block text-xs sm:text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                              You are... *
                            </label>
                            <div className="grid grid-cols-2 gap-2">
                              {[
                        { value: 'artist', label: 'An Artist' },
                        { value: 'manager', label: 'A Manager' },
                        { value: 'label', label: 'A Label' },
                        { value: 'other', label: 'Other' }
                    ].map((option) => (<button key={option.value} type="button" onClick={() => updateFormData({ role: option.value as any })} className={`p-2 sm:p-3 text-xs sm:text-sm rounded-lg border transition-all ${formData.role === option.value
                            ? 'bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300'
                            : 'bg-neutral-50 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700'}`}>
                                  {option.label}
                                </button>))}
                            </div>
                            {formData.role === 'other' && (<input type="text" value={formData.otherRole || ''} onChange={(e) => updateFormData({ otherRole: e.target.value })} placeholder="Please specify..." className="w-full px-3 sm:px-4 py-2 sm:py-3 mt-2 text-sm sm:text-base bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"/>)}
                          </div>
                        </motion.div>)}

                      {currentStep === 2 && (<motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                          <div className="flex items-center gap-2 mb-3 sm:mb-4">
                            <Music className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600"/>
                            <h3 className="text-base sm:text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                              Your music & audience
                            </h3>
                          </div>

                          <div>
                            <label className="block text-xs sm:text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                              Music Links *
                            </label>
                            <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-3">
                              Add links to your music (Spotify, Apple Music, YouTube, SoundCloud, etc.)
                            </p>
                            {formData.musicLinks.map((link, index) => (<div key={index} className="flex gap-2 mb-2">
                                <input type="url" value={link} onChange={(e) => updateMusicLink(index, e.target.value)} placeholder="https://open.spotify.com/artist/..." className="flex-1 px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"/>
                                {formData.musicLinks.length > 1 && (<button type="button" onClick={() => removeMusicLink(index)} className="px-3 py-3 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-all">
                                    <X className="w-4 h-4"/>
                                  </button>)}
                              </div>))}
                            <button type="button" onClick={addMusicLink} className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
                              + Add another link
                            </button>
                          </div>

                          <div>
                            <label className="block text-xs sm:text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                              Current Fan Base Size
                            </label>
                            <select value={formData.fanBaseSize} onChange={(e) => updateFormData({ fanBaseSize: e.target.value as any })} className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all">
                              <option value="0-100">0-100 fans</option>
                              <option value="100-1K">100-1K fans</option>
                              <option value="1K-10K">1K-10K fans</option>
                              <option value="10K-50K">10K-50K fans</option>
                              <option value="50K+">50K+ fans</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-xs sm:text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                              Primary Genre/Style *
                            </label>
                            <input type="text" value={formData.genre} onChange={(e) => updateFormData({ genre: e.target.value })} placeholder="e.g. Pop, Hip-Hop, Electronic, Indie Rock..." className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"/>
                          </div>
                        </motion.div>)}

                      {currentStep === 3 && (<motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                          <div className="flex items-center gap-2 mb-3 sm:mb-4">
                            <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600"/>
                            <h3 className="text-base sm:text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                              Current marketing approach
                            </h3>
                          </div>

                          <div>
                            <label className="block text-xs sm:text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-3">
                              How do you currently reach your fans? *
                            </label>
                            <div className="grid grid-cols-1 gap-2">
                              {[
                        'Social media (Instagram, TikTok, Twitter)',
                        'Email marketing',
                        'Direct messaging',
                        'Live shows/events',
                        'Nothing yet',
                        'Other'
                    ].map((method) => (<button key={method} type="button" onClick={() => updateFormData({
                            currentReachMethods: toggleArrayValue(formData.currentReachMethods, method)
                        })} className={`p-2 sm:p-3 text-xs sm:text-sm text-left rounded-lg border transition-all ${formData.currentReachMethods.includes(method)
                            ? 'bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300'
                            : 'bg-neutral-50 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700'}`}>
                                  {method}
                                </button>))}
                            </div>
                          </div>

                          {formData.currentReachMethods.includes('Email marketing') && (<div>
                              <label className="block text-xs sm:text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                                Which email platform do you currently use?
                              </label>
                              <input type="text" value={formData.currentEmailPlatform || ''} onChange={(e) => updateFormData({ currentEmailPlatform: e.target.value })} placeholder="e.g. Mailchimp, ConvertKit, etc." className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"/>
                            </div>)}
                        </motion.div>)}

                      {currentStep === 4 && (<motion.div key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                          <div className="flex items-center gap-2 mb-3 sm:mb-4">
                            <Target className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600"/>
                            <h3 className="text-base sm:text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                              Goals & preferences
                            </h3>
                          </div>

                          <div>
                            <label className="block text-xs sm:text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-3">
                              What's your main goal with email marketing? *
                            </label>
                            <div className="grid grid-cols-1 gap-2">
                              {[
                        'Announce new releases',
                        'Promote live shows',
                        'Build deeper fan relationships',
                        'Sell merchandise',
                        'Share behind-the-scenes content',
                        'Other'
                    ].map((goal) => (<button key={goal} type="button" onClick={() => updateFormData({
                            mainGoals: toggleArrayValue(formData.mainGoals, goal)
                        })} className={`p-2 sm:p-3 text-xs sm:text-sm text-left rounded-lg border transition-all ${formData.mainGoals.includes(goal)
                            ? 'bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300'
                            : 'bg-neutral-50 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700'}`}>
                                  {goal}
                                </button>))}
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                              How often do you plan to send emails?
                            </label>
                            <select value={formData.emailFrequency} onChange={(e) => updateFormData({ emailFrequency: e.target.value as any })} className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all">
                              <option value="weekly">Weekly</option>
                              <option value="bi-weekly">Bi-weekly</option>
                              <option value="monthly">Monthly</option>
                              <option value="announcements">Only for major announcements</option>
                            </select>
                          </div>

                          <div className="flex items-center gap-3">
                            <input type="checkbox" id="betaFeedback" checked={formData.openToBetaFeedback} onChange={(e) => updateFormData({ openToBetaFeedback: e.target.checked })} className="w-4 h-4 text-blue-600 bg-neutral-50 dark:bg-neutral-800 border-neutral-300 dark:border-neutral-600 rounded focus:ring-blue-500"/>
                            <label htmlFor="betaFeedback" className="text-sm text-neutral-700 dark:text-neutral-300">
                              I'm open to giving feedback during the beta
                            </label>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                              Why are you interested in Loopletter? (Optional)
                            </label>
                            <textarea value={formData.whyLoopletter || ''} onChange={(e) => updateFormData({ whyLoopletter: e.target.value })} placeholder="Tell us what drew you to Loopletter..." rows={3} className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none"/>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                              Anything else you want to share? (Optional)
                            </label>
                            <textarea value={formData.additionalContext || ''} onChange={(e) => updateFormData({ additionalContext: e.target.value })} placeholder="Any additional context, questions, or comments..." rows={3} className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none"/>
                          </div>
                        </motion.div>)}
                    </div>

                    
                    {status === 'error' && (<motion.p initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-red-600 dark:text-red-400 text-sm mb-4">
                        {errorMessage}
                      </motion.p>)}

                    
                    <div className="flex gap-2 sm:gap-3 mt-4 sm:mt-6">
                      {currentStep > 1 && (<button type="button" onClick={handlePrevious} disabled={status === 'loading'} className="flex-1 bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 px-4 sm:px-6 py-2 sm:py-3 rounded-lg text-sm sm:text-base font-semibold transition-all hover:bg-neutral-200 dark:hover:bg-neutral-700 disabled:opacity-50 disabled:cursor-not-allowed">
                          Previous
                        </button>)}
                      
                      {currentStep < totalSteps ? (<button type="button" onClick={handleNext} disabled={status === 'loading' || !validateStep(currentStep)} className="flex-1 bg-black hover:bg-neutral-800 dark:bg-blue-600 dark:hover:bg-blue-700 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg text-sm sm:text-base font-semibold transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed group">
                          Next
                          <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform"/>
                        </button>) : (<button type="button" onClick={handleSubmit} disabled={status === 'loading' || !validateStep(currentStep)} className="flex-1 bg-black hover:bg-neutral-800 dark:bg-blue-600 dark:hover:bg-blue-700 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg text-sm sm:text-base font-semibold transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed group">
                          {status === 'loading' ? (<>
                              <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin"/>
                              <span className="hidden sm:inline">Submitting...</span>
                              <span className="sm:hidden">Submit...</span>
                            </>) : (<>
                              <span className="hidden sm:inline">Submit Request</span>
                              <span className="sm:hidden">Submit</span>
                              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform"/>
                            </>)}
                        </button>)}
                    </div>

                    <p className="text-xs text-neutral-500 dark:text-neutral-400 text-center mt-3 sm:mt-4">
                      No spam, ever. We'll only contact you about early access.
                    </p>
                  </motion.div>)}
              </AnimatePresence>
            </div>
          </motion.div>
        </>)}
    </AnimatePresence>);
}
