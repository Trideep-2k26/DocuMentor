import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import Login from './components/Auth/Login';
import Signup from './components/Auth/Signup';
import Upload from './components/Dashboard/Upload';
import DocumentList from './components/Dashboard/DocumentList';
import AskQuestion from './components/Dashboard/AskQuestion';
import { isAuthenticated, getUser, clearAuthData, authAPI } from './services/api';


const Dashboard = () => {
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [user, setUser] = useState(null);
  const [isLogoutHovered, setIsLogoutHovered] = useState(false);

  useEffect(() => {
    const userData = getUser();
    if (userData) {
      setUser(userData);
    }
  }, []);

  const handleDocumentSelect = (document) => {
    setSelectedDocument(document);
  };

  const handleUploadSuccess = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const handleLogout = () => {
    clearAuthData();
    window.location.href = '/login';
  };

  return (
    <div style={styles.dashboardContainer}>
      {/* Header */}
      <header style={styles.header}>
        <div style={styles.headerContainer}>
          <div style={styles.headerContent}>
            <h1 style={styles.headerTitle}>
              DocuMentor
            </h1>
            <div style={styles.headerActions}>
              {user && (
                <span style={styles.welcomeText}>
                  Welcome, {user.username || user.email}
                </span>
              )}
              <button
                onClick={handleLogout}
                style={{
                  ...styles.logoutButton,
                  ...(isLogoutHovered ? styles.logoutButtonHover : {}),
                }}
                onMouseEnter={() => setIsLogoutHovered(true)}
                onMouseLeave={() => setIsLogoutHovered(false)}
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div style={styles.mainContainer}>
        <div style={styles.grid}>
          {/* Left Column - Upload and Documents */}
          <div style={styles.leftColumn}>
            {/* Upload Section */}
            <div style={styles.section}>
              <h2 style={styles.sectionTitle}>
                Upload Document
              </h2>
              <Upload onUploadSuccess={handleUploadSuccess} />
            </div>

            {/* Document List */}
            <div style={styles.section}>
              <h2 style={styles.sectionTitle}>
                Your Documents
              </h2>
              <DocumentList
                onDocumentSelect={handleDocumentSelect}
                selectedDocument={selectedDocument}
                refreshTrigger={refreshTrigger}
              />
            </div>
          </div>

          {/* Right Column - Question Interface */}
          <div style={styles.rightColumn}>
            <div style={styles.section}>
              <h2 style={styles.sectionTitle}>
                Ask Questions
              </h2>
              {selectedDocument ? (
                <div style={styles.selectedDoc}>
                  <p style={styles.selectedDocText}>
                    Selected document: <strong>{selectedDocument.filename}</strong>
                  </p>
                </div>
              ) : (
                <div style={styles.noDoc}>
                  <p style={styles.noDocText}>
                    Select a document from the list to start asking questions
                  </p>
                </div>
              )}
              <AskQuestion selectedDocument={selectedDocument} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};


const ProtectedRoute = ({ children }) => {
  return isAuthenticated() ? children : <Navigate to="/login" replace />;
};


const PublicRoute = ({ children }) => {
  return !isAuthenticated() ? children : <Navigate to="/dashboard" replace />;
};


const App = () => {
  const [loading, setLoading] = useState(true);
  const [isErrorLinkHovered, setIsErrorLinkHovered] = useState(false);

  useEffect(() => {

    const checkAuth = async () => {
      try {
        if (isAuthenticated()) {
          
          await authAPI.verifyToken();
        }
      } catch (error) {
        console.error('Auth verification failed:', error);
        clearAuthData();
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.loadingContent}>
          <div style={styles.loadingSpinner}></div>
          <p style={styles.loadingText}>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div style={styles.appContainer}>
        <Routes>
          {/* Public Routes */}
          <Route
            path="/login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />
          <Route
            path="/signup"
            element={
              <PublicRoute>
                <Signup />
              </PublicRoute>
            }
          />

          {/* Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          {/* Default Route */}
          <Route
            path="/"
            element={
              isAuthenticated() ?
                <Navigate to="/dashboard" replace /> :
                <Navigate to="/login" replace />
            }
          />

          {/* Catch-all Route */}
          <Route
            path="*"
            element={
              <div style={styles.errorContainer}>
                <div style={styles.errorContent}>
                  <h1 style={styles.errorTitle}>404</h1>
                  <p style={styles.errorText}>Page not found</p>
                  <Link
                    to={isAuthenticated() ? "/dashboard" : "/login"}
                    style={{
                      ...styles.errorLink,
                      ...(isErrorLinkHovered ? styles.errorLinkHover : {}),
                    }}
                    onMouseEnter={() => setIsErrorLinkHovered(true)}
                    onMouseLeave={() => setIsErrorLinkHovered(false)}
                  >
                    Go back to {isAuthenticated() ? "Dashboard" : "Login"}
                  </Link>
                </div>
              </div>
            }
          />
        </Routes>
      </div>
    </Router>
  );
};

const styles = {
  appContainer: {
    background: 'linear-gradient(135deg, #0f172a, #1e3a8a)', 
    minHeight: '100vh',
  },
  dashboardContainer: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #0f172a, #1e3a8a)',
    padding: '40px 20px',
  },
  header: {
    background: 'linear-gradient(90deg, #1e3a8a, #3b82f6)', 
    boxShadow: '0 4px 20px rgba(59, 130, 246, 0.4), 0 0 15px rgba(124, 58, 237, 0.3)', 
    position: 'sticky',
    top: 0,
    zIndex: 1000,
  },
  headerContainer: {
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '0 20px',
  },
  headerContent: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: '64px',
    '@media (max-width: 640px)': {
      flexDirection: 'column',
      gap: '12px',
      height: 'auto',
      padding: '16px 0',
    },
  },
  headerTitle: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#ffffff',
    textShadow: '0 0 10px rgba(255, 255, 255, 0.5)',
    transition: 'all 0.3s ease',
  },
  headerActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    '@media (max-width: 640px)': {
      flexDirection: 'column',
      gap: '8px',
    },
  },
  welcomeText: {
    fontSize: '16px',
    color: '#d1d5db',
    textShadow: '0 0 5px rgba(255, 255, 255, 0.3)',
    opacity: 0.9,
  },
  logoutButton: {
    background: 'linear-gradient(45deg, #dc2626, #f87171)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    padding: '8px 16px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 15px rgba(220, 38, 38, 0.4)',
  },
  logoutButtonHover: {
    transform: 'translateY(-2px)',
    boxShadow: '0 6px 20px rgba(220, 38, 38, 0.6), 0 0 15px rgba(248, 113, 113, 0.5)',
  },
  mainContainer: {
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '32px 20px',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: '1fr 2fr',
    gap: '32px',
    '@media (max-width: 991px)': {
      gridTemplateColumns: '1fr',
    },
  },
  leftColumn: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  rightColumn: {
    display: 'flex',
    flexDirection: 'column',
  },
  section: {
    background: 'linear-gradient(135deg, #1e3a8a, #3b82f6)', 
    borderRadius: '16px',
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3), 0 0 20px rgba(59, 130, 246, 0.4)', 
    padding: '24px',
    animation: 'fadeIn 0.3s ease-in',
  },
  sectionTitle: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#ffffff',
    textShadow: '0 0 10px rgba(255, 255, 255, 0.5)',
    marginBottom: '16px',
  },
  selectedDoc: {
    marginBottom: '16px',
    padding: '12px',
    background: 'linear-gradient(45deg, #1e40af, #3b82f6)', 
    borderRadius: '10px',
    boxShadow: '0 4px 15px rgba(59, 130, 246, 0.4)',
  },
  selectedDocText: {
    fontSize: '14px',
    color: '#ffffff',
    textShadow: '0 0 5px rgba(255, 255, 255, 0.3)',
  },
  noDoc: {
    marginBottom: '16px',
    padding: '12px',
    background: 'rgba(255, 255, 255, 0.1)',
    borderRadius: '10px',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    boxShadow: '0 4px 15px rgba(59, 130, 246, 0.3)',
  },
  noDocText: {
    fontSize: '14px',
    color: '#d1d5db',
    textShadow: '0 0 5px rgba(255, 255, 255, 0.3)',
  },
  loadingContainer: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #0f172a, #1e3a8a)', 
  },
  loadingContent: {
    textAlign: 'center',
  },
  loadingSpinner: {
    width: '48px',
    height: '48px',
    border: '4px solid rgba(255, 255, 255, 0.3)',
    borderTop: '4px solid #7c3aed', 
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    boxShadow: '0 0 20px rgba(124, 58, 237, 0.5)',
    margin: '0 auto 16px',
  },
  loadingText: {
    fontSize: '18px',
    color: '#ffffff',
    textShadow: '0 0 10px rgba(255, 255, 255, 0.4)',
  },
  errorContainer: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #0f172a, #1e3a8a)',
  },
  errorContent: {
    textAlign: 'center',
  },
  errorTitle: {
    fontSize: '48px',
    fontWeight: '700',
    color: '#ffffff',
    textShadow: '0 0 15px rgba(255, 255, 255, 0.5)',
    marginBottom: '16px',
  },
  errorText: {
    fontSize: '18px',
    color: '#d1d5db',
    marginBottom: '16px',
    textShadow: '0 0 5px rgba(255, 255, 255, 0.3)',
  },
  errorLink: {
    fontSize: '16px',
    color: '#ffffff',
    textDecoration: 'none',
    background: 'linear-gradient(45deg, #4f46e5, #7c3aed)', 
    padding: '8px 16px',
    borderRadius: '8px',
    boxShadow: '0 4px 15px rgba(79, 70, 229, 0.4)',
    transition: 'all 0.3s ease',
  },
  errorLinkHover: {
    transform: 'translateY(-2px)',
    boxShadow: '0 6px 20px rgba(79, 70, 229, 0.6), 0 0 15px rgba(124, 58, 237, 0.5)',
  },
};

export default App;
