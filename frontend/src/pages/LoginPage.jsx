import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../config/firebase';
import { authApi } from '../api/client';
import { useAuth } from '../hooks/useAuth';
import { Button, Input, Card } from '../components/UI';

/* ── Google "G" SVG logo ── */
const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.35-8.16 2.35-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
    <path fill="none" d="M0 0h48v48H0z"/>
  </svg>
);

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  /* ── Email / Password login ── */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await authApi.login({ email, password });
      login(response.data.data);
      toast.success('Welcome back!');
      navigate('/');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  /* ── Google Sign-In ── */
  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const idToken = await result.user.getIdToken();
      const response = await authApi.googleLogin({ idToken });
      login(response.data.data);
      toast.success(`Welcome, ${response.data.data.admin.name}!`);
      navigate('/');
    } catch (error) {
      if (error.code === 'auth/popup-closed-by-user') {
        // User dismissed the popup — no toast needed
        return;
      }
      toast.error(error.response?.data?.message || 'Google sign-in failed');
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[var(--bg)] text-[var(--text)]">
      <div className="absolute inset-x-0 top-0 h-[28rem] bg-[radial-gradient(circle_at_top,_rgba(14,165,233,0.16),_transparent_65%)] sm:h-[34rem]" />
      <div className="absolute inset-y-0 left-0 hidden w-1/2 bg-[radial-gradient(circle_at_center,_rgba(255,251,232,0.32),_transparent_70%)] lg:block" />

      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-6 sm:px-6 sm:py-10 lg:px-8">
        <Card className="w-full max-w-md p-5 sm:p-7">

          {/* Header */}
          <div className="mb-6 text-center sm:mb-8">
            <div className="mx-auto mb-4 brand-mark h-12 w-12 rounded-2xl text-lg sm:h-14 sm:w-14 sm:text-xl">D</div>
            <p className="section-label mb-2">Sign in</p>
            <h2 className="text-2xl font-bold text-[var(--text)] sm:text-3xl">Welcome back</h2>
            <p className="mt-2 text-sm leading-6 text-[var(--text-muted)]">Sign in to your dairy workspace.</p>
          </div>

          {/* Google Sign-In Button */}
          <button
            id="google-signin-btn"
            type="button"
            onClick={handleGoogleSignIn}
            disabled={googleLoading || loading}
            className="w-full flex items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition-all duration-150 hover:bg-slate-50 hover:border-slate-300 hover:shadow-md active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {googleLoading ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-400 border-t-transparent" />
            ) : (
              <GoogleIcon />
            )}
            {googleLoading ? 'Signing in…' : 'Continue with Google'}
          </button>

          {/* Divider */}
          <div className="my-5 flex items-center gap-3">
            <div className="h-px flex-1 bg-slate-200" />
            <span className="text-xs font-medium text-slate-400 uppercase tracking-widest">or</span>
            <div className="h-px flex-1 bg-slate-200" />
          </div>

          {/* Email / Password Form */}
          <form className="space-y-4 sm:space-y-5" onSubmit={handleSubmit}>
            <Input
              label="Email"
              type="email"
              placeholder="admin@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <Button
              id="email-signin-btn"
              type="submit"
              variant="primary"
              className="w-full"
              loading={loading}
              disabled={googleLoading}
            >
              Sign in with Email
            </Button>

            <p className="pt-1 text-center text-sm text-[var(--text-muted)]">
              Need an account?{' '}
              <Link
                to="/register"
                className="font-semibold text-[var(--primary)] transition hover:text-[var(--primary-strong)]"
              >
                Register
              </Link>
            </p>
          </form>
        </Card>
      </div>
    </div>
  );
};