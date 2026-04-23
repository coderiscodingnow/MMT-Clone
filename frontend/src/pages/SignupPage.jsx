import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import { useAuth } from '../context/AuthContext';
import './AuthPage.css';

export default function SignupPage() {
  const navigate = useNavigate();
  const auth = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSignup = async () => {
    if (!name.trim() || !email.trim() || !password) {
      setError('Please complete all fields');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const response = await axiosInstance.post('/auth/signup', {
        name: name.trim(),
        email: email.trim(),
        password
      });

      auth.login(response.data.token, response.data.user);
      navigate('/home');
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">FlyEasy ✈</div>
        <h2>Create your account</h2>
        <p className="auth-sub">Sign up to book flights in seconds</p>

        <div className="form-group">
          <label>Name</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} />
        </div>

        <div className="form-group">
          <label>Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>

        <div className="form-group">
          <label>Password</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>

        {error && <p className="auth-error-msg">{error}</p>}

        <button type="button" className="auth-btn" onClick={handleSignup} disabled={loading}>
          {loading ? 'Creating...' : 'Create Account'}
        </button>

        <p className="auth-switch">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
