import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Registration is handled via Google Sign-In on the login page.
// This route simply redirects there.
export const RegisterPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    navigate('/login', { replace: true });
  }, [navigate]);

  return null;
};
