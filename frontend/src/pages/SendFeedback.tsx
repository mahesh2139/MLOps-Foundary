import React, { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { themeClasses } from '../utils/themeClasses';

type FeedbackType = 'bug' | 'feature' | 'improvement' | 'other';

const SendFeedback: React.FC = () => {
  const { theme } = useTheme();
  const [feedbackType, setFeedbackType] = useState<FeedbackType>('improvement');
  const [feedbackText, setFeedbackText] = useState('');
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would send to a backend API
    const mailtoLink = `mailto:feedback@mlops.studio?subject=MLOps%20Studio%20${feedbackType}%20Report&body=${encodeURIComponent(
      `Type: ${feedbackType}\nFrom: ${email || 'Anonymous'}\n\n${feedbackText}`
    )}`;
    window.location.href = mailtoLink;
    
    // Show success message
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFeedbackText('');
      setEmail('');
    }, 3000);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className={`text-4xl font-bold ${themeClasses.textPrimary(theme)} mb-2`}>Send Feedback</h1>
        <p className={themeClasses.textSecondary(theme)}>Help us improve MLOps Studio with your valuable feedback</p>
      </div>

      <div className="grid gap-6 max-w-2xl">
        {/* Feedback Form */}
        <div className={`${themeClasses.card(theme)} p-6 rounded-lg`}>
          <h2 className={`text-2xl font-bold ${themeClasses.textPrimary(theme)} mb-6`}>📝 Feedback Form</h2>
          
          {submitted && (
            <div className={`p-4 rounded-lg mb-6 ${theme === 'dark' ? 'bg-green-900/30 text-green-200' : 'bg-green-100 text-green-800'}`}>
              ✓ Thank you for your feedback! Your input has been received.
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Feedback Type */}
            <div>
              <label className={`block font-semibold ${themeClasses.textPrimary(theme)} mb-3`}>
                Feedback Type
              </label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: 'bug' as FeedbackType, label: '🐛 Bug Report' },
                  { value: 'feature' as FeedbackType, label: '✨ Feature Request' },
                  { value: 'improvement' as FeedbackType, label: '🚀 Improvement' },
                  { value: 'other' as FeedbackType, label: '💬 Other' },
                ].map(({ value, label }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setFeedbackType(value)}
                    className={`p-3 rounded-lg font-medium transition ${
                      feedbackType === value
                        ? theme === 'dark'
                          ? 'bg-blue-600 text-white'
                          : 'bg-blue-500 text-white'
                        : themeClasses.card(theme)
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Email */}
            <div>
              <label className={`block font-semibold ${themeClasses.textPrimary(theme)} mb-2`}>
                Email (Optional)
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.email@example.com"
                className={`w-full px-4 py-2 rounded-lg border ${
                  theme === 'dark'
                    ? 'bg-gray-800 border-gray-700 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                } focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
              <p className={`text-sm mt-1 ${themeClasses.textSecondary(theme)}`}>
                Provide your email if you'd like a response from our team
              </p>
            </div>

            {/* Feedback Text */}
            <div>
              <label className={`block font-semibold ${themeClasses.textPrimary(theme)} mb-2`}>
                Your Feedback *
              </label>
              <textarea
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                placeholder="Please describe your feedback in detail..."
                rows={6}
                required
                className={`w-full px-4 py-2 rounded-lg border ${
                  theme === 'dark'
                    ? 'bg-gray-800 border-gray-700 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                } focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!feedbackText}
              className={`w-full py-2 px-4 rounded-lg font-semibold transition ${
                feedbackText
                  ? theme === 'dark'
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'bg-blue-500 hover:bg-blue-600 text-white'
                  : `${themeClasses.card(theme)} opacity-50 cursor-not-allowed`
              }`}
            >
              Send Feedback
            </button>
          </form>
        </div>

        {/* Guidelines */}
        <div className={`${themeClasses.card(theme)} p-6 rounded-lg`}>
          <h2 className={`text-2xl font-bold ${themeClasses.textPrimary(theme)} mb-4`}>💡 Feedback Guidelines</h2>
          <div className={`space-y-3 ${themeClasses.textSecondary(theme)}`}>
            <div>
              <p className={`font-semibold ${themeClasses.textPrimary(theme)}`}>Be Specific</p>
              <p className="text-sm ml-2">Include details about what you were doing when the issue occurred or what functionality you'd like to see.</p>
            </div>
            <div>
              <p className={`font-semibold ${themeClasses.textPrimary(theme)}`}>Include Steps to Reproduce</p>
              <p className="text-sm ml-2">For bug reports, provide clear steps to reproduce the issue so we can fix it faster.</p>
            </div>
            <div>
              <p className={`font-semibold ${themeClasses.textPrimary(theme)}`}>Share Your Use Case</p>
              <p className="text-sm ml-2">Help us understand your workflow and needs to better prioritize improvements.</p>
            </div>
            <div>
              <p className={`font-semibold ${themeClasses.textPrimary(theme)}`}>Check Documentation First</p>
              <p className="text-sm ml-2">Visit the Documentation tab to ensure your question isn't already answered.</p>
            </div>
          </div>
        </div>

        {/* What Happens Next */}
        <div className={`${themeClasses.card(theme)} p-6 rounded-lg`}>
          <h2 className={`text-2xl font-bold ${themeClasses.textPrimary(theme)} mb-4`}>📊 What Happens With Your Feedback</h2>
          <div className={`space-y-3 ${themeClasses.textSecondary(theme)}`}>
            <ol className="list-decimal list-inside space-y-2 ml-2">
              <li><strong>Received:</strong> Your feedback is logged and categorized</li>
              <li><strong>Reviewed:</strong> Our team evaluates all feedback weekly</li>
              <li><strong>Prioritized:</strong> We prioritize based on impact and frequency</li>
              <li><strong>Implemented:</strong> Fixes and features are added to our roadmap</li>
              <li><strong>Released:</strong> Updates are deployed to all users</li>
            </ol>
            <p className={`text-sm ${themeClasses.textSecondary(theme)} mt-4`}>
              If you provided your email, we'll reach out with updates on your specific feedback.
            </p>
          </div>
        </div>

        {/* Contact Options */}
        <div className={`${themeClasses.card(theme)} p-6 rounded-lg`}>
          <h2 className={`text-2xl font-bold ${themeClasses.textPrimary(theme)} mb-4`}>📧 Alternative Contact Methods</h2>
          <div className={`space-y-3 ${themeClasses.textSecondary(theme)}`}>
            <p>
              <strong className={themeClasses.textPrimary(theme)}>Email:</strong>{' '}
              <a href="mailto:feedback@mlops.studio" className="underline hover:opacity-80">
                feedback@mlops.studio
              </a>
            </p>
            <p>
              <strong className={themeClasses.textPrimary(theme)}>Support:</strong>{' '}
              <a href="mailto:support@mlops.studio" className="underline hover:opacity-80">
                support@mlops.studio
              </a>
            </p>
            <p>
              <strong className={themeClasses.textPrimary(theme)}>Feature Requests:</strong> Include priority level and your use case for better tracking
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SendFeedback;
