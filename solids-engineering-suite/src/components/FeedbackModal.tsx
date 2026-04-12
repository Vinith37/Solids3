import React, { useState, useEffect } from 'react';
import { X, Loader2, CheckCircle2 } from 'lucide-react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function FeedbackModal({ isOpen, onClose }: FeedbackModalProps) {
  const { currentUser } = useAuth();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [category, setCategory] = useState('Feature Request');
  const [feedback, setFeedback] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  // Pre-fill user data if logged in
  useEffect(() => {
    if (currentUser) {
      if (currentUser.displayName) setName(currentUser.displayName);
      if (currentUser.email) setEmail(currentUser.email);
    }
  }, [currentUser]);

  // Reset state when modal is closed
  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setIsSuccess(false);
        setError('');
        setFeedback('');
        setCategory('Feature Request');
      }, 300); // Wait for transition out
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedback.trim()) {
      setError('Feedback text is required.');
      return;
    }
    
    setIsSubmitting(true);
    setError('');

    try {
      await addDoc(collection(db, 'feedback'), {
        name: name.trim() || 'Anonymous',
        email: email.trim() || 'No email provided',
        category,
        feedback: feedback.trim(),
        userId: currentUser?.uid || null,
        timestamp: serverTimestamp(),
      });
      
      setIsSuccess(true);
    } catch (err: any) {
      console.error('Error submitting feedback:', err);
      setError('Failed to submit feedback. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-background/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div 
        className="relative w-full max-w-lg bg-surface-container-low border border-outline/10 rounded-2xl shadow-2xl overflow-hidden shadow-black/20 flex flex-col max-h-full"
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-outline/5 shrink-0">
          <h2 className="text-xl font-bold text-on-surface">Submit Feedback</h2>
          <button 
            onClick={onClose}
            className="p-2 -mr-2 text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          {isSuccess ? (
            <div className="flex flex-col items-center justify-center py-8 text-center space-y-4">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-2">
                <CheckCircle2 className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-on-surface">Thank you!</h3>
              <p className="text-on-surface-variant max-w-[300px]">
                Your feedback has been submitted successfully. We appreciate your input to help improve SOLIDS.
              </p>
              <button
                onClick={onClose}
                className="mt-6 px-6 py-2.5 bg-surface-container-high hover:bg-surface-container-highest text-on-surface rounded-xl font-medium transition-colors"
              >
                Close Window
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="p-3 text-sm text-error bg-error/10 border border-error/20 rounded-lg">
                  {error}
                </div>
              )}
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label htmlFor="feedback-name" className="text-sm font-medium text-on-surface-variant pl-1">
                    Name <span className="opacity-60">(Optional)</span>
                  </label>
                  <input
                    id="feedback-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-2.5 bg-surface-container rounded-xl border border-outline/10 text-on-surface focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all placeholder:text-on-surface-variant/40"
                    placeholder="Your name"
                  />
                </div>
                
                <div className="space-y-1.5">
                  <label htmlFor="feedback-email" className="text-sm font-medium text-on-surface-variant pl-1">
                    Email <span className="opacity-60">(Optional)</span>
                  </label>
                  <input
                    id="feedback-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-2.5 bg-surface-container rounded-xl border border-outline/10 text-on-surface focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all placeholder:text-on-surface-variant/40"
                    placeholder="Your email address"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="feedback-category" className="text-sm font-medium text-on-surface-variant pl-1">
                  Category
                </label>
                <select
                  id="feedback-category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-2.5 bg-surface-container rounded-xl border border-outline/10 text-on-surface focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all appearance-none cursor-pointer"
                >
                  <option value="Bug">Bug</option>
                  <option value="Feature Request">Feature Request</option>
                  <option value="UI/UX Suggestion">UI/UX Suggestion</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="feedback-text" className="text-sm font-medium text-on-surface-variant pl-1">
                  Feedback <span className="text-error">*</span>
                </label>
                <textarea
                  id="feedback-text"
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  required
                  rows={5}
                  className="w-full px-4 py-3 bg-surface-container rounded-xl border border-outline/10 text-on-surface focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all resize-none placeholder:text-on-surface-variant/40"
                  placeholder="Tell us what you think, what's broken, or what could be better..."
                />
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isSubmitting}
                  className="px-5 py-2.5 text-sm font-medium text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high rounded-xl transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !feedback.trim()}
                  className="px-6 py-2.5 bg-primary text-on-primary text-sm font-medium rounded-xl hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[120px]"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    'Submit Feedback'
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
