import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { authApi } from '../api/client';
import { useAuth } from '../hooks/useAuth';
import { Button, Input, Card } from '../components/UI';

export const RegisterPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const response = await authApi.signup({ name, email, password });
      login(response.data.data);
      toast.success('Account created successfully');
      navigate('/');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[var(--bg)] text-[var(--text)]">
      <div className="absolute inset-x-0 top-0 h-[28rem] bg-[radial-gradient(circle_at_top,_rgba(14,165,233,0.16),_transparent_65%)] sm:h-[34rem]" />
      <div className="absolute inset-y-0 right-0 hidden w-1/2 bg-[radial-gradient(circle_at_center,_rgba(255,251,232,0.32),_transparent_70%)] lg:block" />
      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-6 sm:px-6 sm:py-10 lg:px-8">
        <Card className="w-full max-w-md p-5 sm:p-7">
          <div className="mb-6 text-center sm:mb-8">
            <div className="mx-auto mb-4 brand-mark h-12 w-12 rounded-2xl text-lg sm:h-14 sm:w-14 sm:text-xl">D</div>
            <p className="section-label mb-2">Create account</p>
            <h1 className="text-2xl font-bold text-[var(--text)] sm:text-3xl">Register admin</h1>
            <p className="mt-3 text-sm leading-6 text-[var(--text-muted)]">Use the email provided by the business owner to create access.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
            <Input
              label="Name"
              type="text"
              placeholder="Admin name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <Input
              label="Email"
              type="email"
              placeholder="admin@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <Input
              label="Confirm Password"
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />

            <Button type="submit" disabled={loading} className="w-full" size="lg">
              {loading ? 'Creating account...' : 'Register'}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-[var(--text-muted)]">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-[var(--primary)] hover:text-[var(--primary-strong)]">
              Login here
            </Link>
          </p>
        </Card>
      </div>
    </div>
  );
};
