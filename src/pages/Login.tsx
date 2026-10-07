import { EnhancedLogin } from '@/components/auth/EnhancedLogin';
import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useSEO } from '@/hooks/useSEO';

/**
 * Login Page - Displays the login form
 * Redirects authenticated users to the dashboard
 */
export default function Login() {
  const { isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();

  useSEO({
    title: 'Login',
    description: 'Sign in to your account to access the business management system. Secure login for invoices, products, and company data.',
    keywords: 'login, sign in, business management, secure login, company account',
    type: 'website',
  });

  useEffect(() => {
    // If user is already authenticated, redirect to dashboard
    if (isAuthenticated && !loading) {
      navigate('/app', { replace: true });
    }
  }, [isAuthenticated, loading, navigate]);

  return <EnhancedLogin />;
}
