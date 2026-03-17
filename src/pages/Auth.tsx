import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Helmet } from 'react-helmet-async';
import { z } from 'zod';

const emailSchema = z.string().trim().email({ message: "Invalid email address" });
const passwordSchema = z.string().min(6, { message: "Password must be at least 6 characters" });

const Auth = () => {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { user, signInWithGoogle, signInWithEmail, signUpWithEmail } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (user) navigate('/');
  }, [user, navigate]);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();

    const emailResult = emailSchema.safeParse(email);
    if (!emailResult.success) {
      toast({ title: emailResult.error.errors[0].message, variant: "destructive" });
      return;
    }
    const passwordResult = passwordSchema.safeParse(password);
    if (!passwordResult.success) {
      toast({ title: passwordResult.error.errors[0].message, variant: "destructive" });
      return;
    }

    setIsLoading(true);
    try {
      if (mode === 'signin') {
        const { error } = await signInWithEmail(email, password);
        if (error) {
          toast({ title: error.message, variant: "destructive" });
        } else {
          navigate('/');
        }
      } else {
        const { error } = await signUpWithEmail(email, password);
        if (error) {
          toast({ title: error.message, variant: "destructive" });
        } else {
          toast({ title: "Check your email to confirm your account." });
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setIsLoading(true);
    try {
      await signInWithGoogle();
    } catch {
      toast({ title: "Something went wrong. Please try again.", variant: "destructive" });
      setIsLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Sign in — StayPut</title>
      </Helmet>

      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-sm">
          {/* Card */}
          <div className="card-depth rounded-2xl p-8 space-y-7">
            {/* Header */}
            <div className="text-center space-y-2">
              <h1 className="text-2xl font-serif font-medium text-foreground tracking-tight">
                StayPut
              </h1>
              <p className="text-sm text-muted-foreground">
                {mode === 'signin' ? 'Welcome back.' : 'Create your space.'}
              </p>
            </div>

            <div className="space-y-3">
              {/* Google button — primary CTA */}
              <Button
                type="button"
                onClick={handleGoogleAuth}
                disabled={isLoading}
                className="w-full h-11 text-sm font-medium bg-card border border-border text-foreground hover:bg-muted shadow-sm transition-all hover:shadow-md"
                variant="outline"
              >
                <svg className="w-4 h-4 mr-2.5 shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </Button>

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-card px-3 text-muted-foreground">or use email</span>
                </div>
              </div>

              {/* Email form */}
              <form onSubmit={handleEmailAuth} className="space-y-2.5">
                <Input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-11 rounded-xl bg-background border-border focus-visible:ring-1 focus-visible:ring-primary/40"
                  disabled={isLoading}
                />
                <Input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-11 rounded-xl bg-background border-border focus-visible:ring-1 focus-visible:ring-primary/40"
                  disabled={isLoading}
                />
                <Button
                  type="submit"
                  className="w-full h-11 rounded-xl btn-sage font-medium"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  ) : (
                    mode === 'signin' ? 'Sign in' : 'Create account'
                  )}
                </Button>
              </form>

              {/* Toggle mode */}
              <p className="text-center text-sm text-muted-foreground">
                {mode === 'signin' ? (
                  <>
                    No account?{' '}
                    <button
                      onClick={() => setMode('signup')}
                      className="text-primary hover:underline font-medium"
                      disabled={isLoading}
                    >
                      Create one
                    </button>
                  </>
                ) : (
                  <>
                    Have an account?{' '}
                    <button
                      onClick={() => setMode('signin')}
                      className="text-primary hover:underline font-medium"
                      disabled={isLoading}
                    >
                      Sign in
                    </button>
                  </>
                )}
              </p>
            </div>
          </div>

          {/* Mantra */}
          <p className="text-center text-xs text-muted-foreground/75 font-serif italic mt-5">
            Stay present. Stay put.
          </p>
        </div>
      </div>
    </>
  );
};

export default Auth;
