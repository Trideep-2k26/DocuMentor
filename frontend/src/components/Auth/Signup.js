import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI, setAuthData } from '../../services/api';

const Signup = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    password: '',
    password_confirm: '',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    // Clear specific field error when user starts typing
    if (errors[e.target.name]) {
      setErrors({
        ...errors,
        [e.target.name]: undefined,
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      const response = await authAPI.register(formData);
      setAuthData(response.data);
      navigate('/dashboard');
    } catch (error) {
      if (error.response?.data) {
        setErrors(error.response.data);
      } else {
        setErrors({ general: 'Registration failed. Please try again.' });
      }
    } finally {
      setLoading(false);
    }
  };

  const renderError = (fieldName) => {
    const error = errors[fieldName];
    if (error) {
      return (
        <div style={styles.fieldError}>
          {Array.isArray(error) ? error[0] : error}
        </div>
      );
    }
    return null;
  };

  return (
    <div style={styles.container}>
      <div style={styles.formContainer}>
        <div style={styles.header}>
          <h1 style={styles.title}>Create Account</h1>
          <p style={styles.subtitle}>Join Document Portal today</p>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          {errors.general && (
            <div style={styles.errorMessage}>
              {errors.general}
            </div>
          )}

          <div style={styles.row}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>First Name</label>
              <input
                type="text"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                style={styles.input}
                placeholder="First name"
              />
              {renderError('first_name')}
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Last Name</label>
              <input
                type="text"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                style={styles.input}
                placeholder="Last name"
              />
              {renderError('last_name')}
            </div>
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Username *</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              style={styles.input}
              placeholder="Choose a username"
            />
            {renderError('username')}
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Email *</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              style={styles.input}
              placeholder="Enter your email"
            />
            {renderError('email')}
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Password *</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              style={styles.input}
              placeholder="Create a password"
            />
            {renderError('password')}
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Confirm Password *</label>
            <input
              type="password"
              name="password_confirm"
              value={formData.password_confirm}
              onChange={handleChange}
              required
              style={styles.input}
              placeholder="Confirm your password"
            />
            {renderError('password_confirm')}
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              ...styles.submitButton,
              ...(loading ? styles.submitButtonDisabled : {}),
            }}
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <div style={styles.footer}>
          <p style={styles.footerText}>
            Already have an account?{' '}
            <Link to="/login" style={styles.link}>
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
  },
  formContainer: {
    backgroundColor: 'white',
    padding: '40px',
    borderRadius: '12px',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    width: '100%',
    maxWidth: '500px',
  },
  header: {
    textAlign: 'center',
    marginBottom: '30px',
  },
  title: {
    fontSize: '28px',
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: '8px',
  },
  subtitle: {
    color: '#6b7280',
    fontSize: '16px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  row: {
    display: 'flex',
    gap: '15px',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    flex: 1,
  },
  label: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#374151',
  },
  input: {
    padding: '12px 16px',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    fontSize: '16px',
    transition: 'border-color 0.2s, box-shadow 0.2s',
    outline: 'none',
  },
  submitButton: {
    backgroundColor: '#667eea',
    color: 'white',
    padding: '12px 24px',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
    marginTop: '10px',
  },
  submitButtonDisabled: {
    backgroundColor: '#9ca3af',
    cursor: 'not-allowed',
  },
  errorMessage: {
    backgroundColor: '#fef2f2',
    color: '#dc2626',
    padding: '12px',
    borderRadius: '8px',
    border: '1px solid #fecaca',
    fontSize: '14px',
  },
  fieldError: {
    color: '#dc2626',
    fontSize: '12px',
    marginTop: '4px',
  },
  footer: {
    textAlign: 'center',
    marginTop: '24px',
  },
  footerText: {
    color: '#6b7280',
    fontSize: '14px',
  },
  link: {
    color: '#667eea',
    textDecoration: 'none',
    fontWeight: '500',
  },
};

export default Signup;