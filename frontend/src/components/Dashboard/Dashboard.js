import React, { useState, useEffect } from 'react';
import Upload from './Upload';
import DocumentList from './DocumentList';
import AskQuestion from './AskQuestion';
import { documentAPI } from '../../services/api';

const Dashboard = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedDocument, setSelectedDocument] = useState(null);

  const fetchDocuments = async () => {
    try {
      const response = await documentAPI.getDocuments();
      setDocuments(response.data);
    } catch (error) {
      setError('Failed to fetch documents');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleDocumentUploaded = (newDocument) => {
    setDocuments([newDocument, ...documents]);
  };

  const handleDocumentDeleted = (documentId) => {
    setDocuments(documents.filter(doc => doc.id !== documentId));
    if (selectedDocument && selectedDocument.id === documentId) {
      setSelectedDocument(null);
    }
  };

  if (loading) {
    return (
      <div style={styles.loading}>
        <div style={styles.spinner}></div>
        <span style={styles.loadingText}>Loading...</span>
      </div>
    );
  }

  return (
    <div style={styles.dashboardContainer}>
      <div style={styles.container}>
        <h1 style={styles.title}>Document Management Portal</h1>

        {error && (
          <div style={styles.errorAlert}>
            {error}
          </div>
        )}

        <div style={styles.row}>
          <div style={styles.leftColumn}>
            <Upload onDocumentUploaded={handleDocumentUploaded} />
            <DocumentList
              documents={documents}
              onDocumentDeleted={handleDocumentDeleted}
              onDocumentSelected={setSelectedDocument}
              selectedDocument={selectedDocument}
            />
          </div>

          <div style={styles.rightColumn}>
            <AskQuestion
              documents={documents}
              selectedDocument={selectedDocument}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  dashboardContainer: {
    background: 'linear-gradient(135deg, #0f172a, #1e3a8a)', // Dark to vibrant blue gradient
    minHeight: '100vh',
    padding: '40px 20px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  container: {
    maxWidth: '1400px',
    width: '100%',
  },
  title: {
    fontSize: '32px',
    fontWeight: '700',
    color: '#ffffff',
    textShadow: '0 0 15px rgba(255, 255, 255, 0.5)',
    marginBottom: '24px',
    textAlign: 'center',
  },
  errorAlert: {
    background: 'linear-gradient(45deg, #dc2626, #f87171)', // Red gradient
    color: 'white',
    padding: '16px',
    borderRadius: '10px',
    fontSize: '16px',
    marginBottom: '24px',
    boxShadow: '0 4px 15px rgba(220, 38, 38, 0.4)',
    textAlign: 'center',
  },
  row: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '24px',
    margin: '0 -12px',
  },
  leftColumn: {
    flex: '0 0 66.666667%',
    maxWidth: '66.666667%',
    padding: '0 12px',
    '@media (max-width: 991px)': {
      flex: '0 0 100%',
      maxWidth: '100%',
    },
  },
  rightColumn: {
    flex: '0 0 33.333333%',
    maxWidth: '33.333333%',
    padding: '0 12px',
    '@media (max-width: 991px)': {
      flex: '0 0 100%',
      maxWidth: '100%',
    },
  },
  loading: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #0f172a, #1e3a8a)',
  },
  spinner: {
    width: '48px',
    height: '48px',
    border: '4px solid rgba(255, 255, 255, 0.3)',
    borderTop: '4px solid #7c3aed',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    boxShadow: '0 0 20px rgba(124, 58, 237, 0.5)',
  },
  loadingText: {
    color: '#ffffff',
    fontSize: '18px',
    marginTop: '16px',
    textShadow: '0 0 10px rgba(255, 255, 255, 0.4)',
  },
};

export default Dashboard;