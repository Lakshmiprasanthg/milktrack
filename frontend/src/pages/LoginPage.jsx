import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { authApi } from '../api/client';
import { useAuth } from '../hooks/useAuth';
import { Button, Input, Card } from '../components/UI';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await authApi.login({ email, password });
      login(response.data.data);
      toast.success('Login successful');
      navigate('/');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
        <div className="relative min-h-screen overflow-hidden bg-[var(--bg)] text-[var(--text)]">
          <div className="absolute inset-x-0 top-0 h-[28rem] bg-[radial-gradient(circle_at_top,_rgba(14,165,233,0.16),_transparent_65%)] sm:h-[34rem]" />
          <div className="absolute inset-y-0 left-0 hidden w-1/2 bg-[radial-gradient(circle_at_center,_rgba(255,251,232,0.32),_transparent_70%)] lg:block" />
          <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-6 sm:px-6 sm:py-10 lg:px-8">
            <Card className="w-full max-w-md p-5 sm:p-7">
              <div className="mb-6 text-center sm:mb-8">
                <div className="mx-auto mb-4 brand-mark h-12 w-12 rounded-2xl text-lg sm:h-14 sm:w-14 sm:text-xl">D</div>
                <p className="section-label mb-2">Sign in</p>
                <h2 className="text-2xl font-bold text-[var(--text)] sm:text-3xl">Welcome back</h2>
                <p className="mt-2 text-sm leading-6 text-[var(--text-muted)]">Use your email and password to continue.</p>
              </div>

              <form className="space-y-4 sm:space-y-5" onSubmit={handleSubmit}>
                <Input
                  label="Email"
                  type="email"
                  placeholder="admin@example.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                />
                <Input
                  label="Password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                />

                <Button type="submit" variant="primary" className="w-full" loading={loading}>
                  Sign in
                </Button>

                <p className="pt-1 text-center text-sm text-[var(--text-muted)]">
                  Need an account?{' '}
                  <Link to="/register" className="font-semibold text-[var(--primary)] transition hover:text-[var(--primary-strong)]">
                    Register
                  </Link>
                </p>
              </form>
            </Card>
          </div>
        </div>
  );
};