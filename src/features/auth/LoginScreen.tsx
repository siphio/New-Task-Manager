import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/app/providers';
import { Button } from '@/shared/components/ui/button';
import { fadeIn } from '@/styles/animations';

export function LoginScreen() {
  const { isAuthenticated, isLoading, signIn, signUp, continueAsGuest } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-accent-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error } = isSignUp
      ? await signUp(email, password)
      : await signIn(email, password);

    if (error) {
      setError(error.message);
    }
    setLoading(false);
  };

  return (
    <motion.div
      variants={fadeIn}
      initial="initial"
      animate="animate"
      className="min-h-screen bg-background flex flex-col items-center justify-center px-6"
      data-testid="login-screen"
    >
      <div className="w-full max-w-sm">
        {/* Logo/Title */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-text-primary mb-2">TaskFlow</h1>
          <p className="text-text-secondary">
            {isSignUp ? 'Create your account' : 'Welcome back'}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm text-text-secondary mb-2">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-background-secondary border border-background-tertiary rounded-lg text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent-primary"
              placeholder="you@example.com"
              required
              data-testid="email-input"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm text-text-secondary mb-2">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-background-secondary border border-background-tertiary rounded-lg text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent-primary"
              placeholder="••••••••"
              required
              minLength={6}
              data-testid="password-input"
            />
          </div>

          {error && (
            <p className="text-accent-error text-sm">{error}</p>
          )}

          <Button
            type="submit"
            className="w-full bg-accent-primary hover:bg-accent-primary/90 text-white py-3"
            disabled={loading}
            data-testid="login-button"
          >
            {loading ? 'Loading...' : isSignUp ? 'Sign Up' : 'Sign In'}
          </Button>
        </form>

        {/* Toggle */}
        <p className="text-center mt-6 text-text-secondary">
          {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button
            type="button"
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-accent-primary hover:underline"
          >
            {isSignUp ? 'Sign In' : 'Sign Up'}
          </button>
        </p>

        {/* Divider */}
        <div className="flex items-center my-6">
          <div className="flex-1 border-t border-background-tertiary" />
          <span className="px-4 text-text-muted text-sm">or</span>
          <div className="flex-1 border-t border-background-tertiary" />
        </div>

        {/* Continue as Guest */}
        <Button
          type="button"
          variant="outline"
          className="w-full border-background-tertiary text-text-secondary hover:bg-background-secondary py-3"
          onClick={continueAsGuest}
          data-testid="guest-button"
        >
          Continue as Guest
        </Button>

        <p className="text-center mt-4 text-xs text-text-muted">
          Skip login to explore the app UI
        </p>
      </div>
    </motion.div>
  );
}
