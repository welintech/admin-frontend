import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import styled from 'styled-components';
import { toast } from 'react-toastify';
import { theme } from '../styles/theme';
import PasswordInput from '../components/PasswordInput';

const LoginContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: ${theme.colors.secondary.main};
`;

const LoginForm = styled.form`
  background: ${theme.colors.secondary.light};
  padding: ${theme.spacing.xl};
  border-radius: ${theme.borderRadius.md};
  box-shadow: ${theme.shadows.md};
  width: 100%;
  max-width: 400px;
`;

const FormTitle = styled.h2`
  font-size: ${theme.typography.h2.fontSize};
  font-weight: ${theme.typography.h2.fontWeight};
  color: ${theme.colors.text.primary};
  text-align: center;
  margin-bottom: ${theme.spacing.xl};
`;

const Input = styled.input`
  width: 100%;
  padding: ${theme.spacing.sm};
  margin-bottom: ${theme.spacing.md};
  border: 1px solid ${theme.colors.secondary.dark};
  border-radius: ${theme.borderRadius.sm};
  font-size: ${theme.typography.body.fontSize};

  &:focus {
    outline: none;
    border-color: ${theme.colors.primary.main};
  }
`;

const Button = styled.button`
  width: 100%;
  padding: ${theme.spacing.sm};
  background-color: ${theme.colors.primary.main};
  color: ${theme.colors.text.light};
  border: none;
  border-radius: ${theme.borderRadius.sm};
  cursor: pointer;
  font-size: ${theme.typography.body.fontSize};
  font-weight: 500;

  &:hover {
    background-color: ${theme.colors.primary.dark};
  }

  &:disabled {
    background-color: ${theme.colors.secondary.main};
    cursor: not-allowed;
  }
`;

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }

    if (!validateEmail(email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    try {
      await login({ email, password });
    } catch (error) {
      toast.error(error.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <LoginContainer>
      <LoginForm onSubmit={handleSubmit}>
        <FormTitle>Login</FormTitle>
        <div>
          <Input
            type='email'
            placeholder='Email'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <PasswordInput
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder='Password'
          />
        </div>
        <Button type='submit' disabled={isLoading}>
          {isLoading ? 'Logging in...' : 'Login'}
        </Button>
      </LoginForm>
    </LoginContainer>
  );
};

export default Login;
