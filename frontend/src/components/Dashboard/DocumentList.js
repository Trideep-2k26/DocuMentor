import React, { useState, useEffect } from 'react';
import { documentAPI } from '../../services/api';

const DocumentList = ({ refreshTrigger, onDocumentSelect }) => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedDocument, setSelectedDocument] = useState(null);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const response = await documentAPI.getDocuments();
      setDocuments(response.data);
      setError('');
    } catch (error) {
      setError('Failed to fetch documents');
      console.error('Error fetching documents:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [refreshTrigger]);

  const deleteDocument = async (documentId) => {
    if (!window.confirm('Are you sure you want to delete this document?')) {
      return;
    }

    try {
      await documentAPI.deleteDocument(documentId);
      setDocuments(documents.filter(doc => doc.id !== documentId));
      if (selectedDocument?.id === documentId) {
        setSelectedDocument(null);
        if (onDocumentSelect) {
          onDocumentSelect(null);
        }
      }
    } catch (error) {
      setError('Failed to delete document');
      console.error('Error deleting document:', error);
    }
  };

  const handleDocumentSelect = (document) => {
    setSelectedDocument(document);
    if (onDocumentSelect) {
      onDocumentSelect(document);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getFileIcon = (filename) => {
    const extension = filename.split('.').pop().toLowerCase();
    switch (extension) {
      case 'pdf':
        return '📄';
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'tiff':
        return '🖼️';
      default:
        return '📎';
    }
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <h2 style={styles.title}>Your Documents</h2>
        </div>
        <div style={styles.loading}>
          <div style={styles.spinner}></div>
          <p style={styles.loadingText}>Loading documents...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>Your Documents</h2>
        <p style={styles.subtitle}>
          {documents.length} document{documents.length !== 1 ? 's' : ''} uploaded
        </p>
      </div>

      {error && (
        <div style={styles.errorMessage}>
          {error}
        </div>
      )}

      {documents.length === 0 ? (
        <div style={styles.emptyState}>
          <div style={styles.emptyIcon}>📁</div>
          <h3 style={styles.emptyTitle}>No documents yet</h3>
          <p style={styles.emptyText}>
            Upload your first document to get started with AI-powered document analysis.
          </p>
        </div>
      ) : (
        <div style={styles.documentGrid}>
          {documents.map((document) => (
            <div
              key={document.id}
              style={{
                ...styles.documentCard,
                ...(selectedDocument?.id === document.id ? styles.documentCardSelected : {}),
              }}
              onClick={() => handleDocumentSelect(document)}
            >
              <div style={styles.documentHeader}>
                <div style={styles.documentIcon}>
                  {getFileIcon(document.original_filename)}
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteDocument(document.id);
                  }}
                  style={styles.deleteButton}
                  title="Delete document"
                >
                  🗑️
                </button>
              </div>

              <div style={styles.documentInfo}>
                <h3 style={styles.documentName}>
                  {document.original_filename}
                </h3>
                <p style={styles.documentSize}>
                  {formatFileSize(document.file_size)}
                </p>
                <p style={styles.documentDate}>
                  Uploaded {formatDate(document.created_at)}
                </p>
              </div>

              <div style={styles.documentActions}>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDocumentSelect(document);
                  }}
                  style={styles.selectButton}
                >
                  {selectedDocument?.id === document.id ? 'Selected' : 'Select'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    background: 'linear-gradient(135deg, #1e3a8a, #3b82f6)', // Vibrant blue gradient
    padding: '24px',
    borderRadius: '16px',
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3), 0 0 20px rgba(59, 130, 246, 0.4)', // Neon glow
    marginBottom: '24px',
    transition: 'all 0.3s ease',
  },
  header: {
    marginBottom: '20px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
    paddingBottom: '12px',
  },
  title: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#ffffff',
    textShadow: '0 0 10px rgba(255, 255, 255, 0.5)',
    marginBottom: '8px',
  },
  subtitle: {
    fontSize: '16px',
    color: '#d1d5db',
    margin: 0,
    opacity: 0.9,
    textShadow: '0 0 5px rgba(255, 255, 255, 0.3)',
  },
  loading: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '40px',
    gap: '16px',
    color: '#d1d5db',
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '4px solid rgba(255, 255, 255, 0.3)',
    borderTop: '4px solid #7c3aed', // Purple accent
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    boxShadow: '0 0 20px rgba(124, 58, 237, 0.5)',
  },
  loadingText: {
    fontSize: '18px',
    color: '#ffffff',
    textShadow: '0 0 10px rgba(255, 255, 255, 0.4)',
  },
  errorMessage: {
    background: 'linear-gradient(45deg, #dc2626, #f87171)', // Red gradient
    color: 'white',
    padding: '12px',
    borderRadius: '10px',
    border: 'none',
    fontSize: '14px',
    marginBottom: '20px',
    boxShadow: '0 4px 15px rgba(220, 38, 38, 0.4)',
  },
  emptyState: {
    textAlign: 'center',
    padding: '60px 20px',
    background: 'rgba(0, 0, 0, 0.2)',
    borderRadius: '12px',
    margin: '20px 0',
  },
  emptyIcon: {
    fontSize: '72px',
    marginBottom: '16px',
    opacity: 0.6,
    textShadow: '0 0 15px rgba(255, 255, 255, 0.3)',
  },
  emptyTitle: {
    fontSize: '20px',
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: '8px',
    textShadow: '0 0 10px rgba(255, 255, 255, 0.4)',
  },
  emptyText: {
    fontSize: '16px',
    color: '#d1d5db',
    maxWidth: '400px',
    margin: '0 auto',
    lineHeight: '1.5',
    opacity: 0.9,
  },
  documentGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '16px',
    '@media (max-width: 640px)': {
      gridTemplateColumns: '1fr', // Single column on small screens
    },
  },
  documentCard: {
    border: '1px solid rgba(255, 255, 255, 0.2)',
    borderRadius: '12px',
    padding: '20px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    background: 'rgba(255, 255, 255, 0.1)',
    animation: 'fadeIn 0.3s ease-in',
    ':hover': {
      transform: 'translateY(-4px)',
      boxShadow: '0 6px 20px rgba(59, 130, 246, 0.5), 0 0 15px rgba(124, 58, 237, 0.4)',
    },
  },
  documentCardSelected: {
    borderColor: '#7c3aed',
    background: 'linear-gradient(45deg, #1e40af, #3b82f6)', // Blue gradient
    boxShadow: '0 0 20px rgba(124, 58, 237, 0.5), 0 4px 15px rgba(59, 130, 246, 0.4)',
  },
  documentHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '16px',
  },
  documentIcon: {
    fontSize: '36px',
    opacity: 0.8,
    textShadow: '0 0 10px rgba(255, 255, 255, 0.3)',
  },
  deleteButton: {
    background: 'none',
    border: 'none',
    fontSize: '18px',
    cursor: 'pointer',
    padding: '6px',
    borderRadius: '6px',
    color: '#f87171',
    transition: 'all 0.3s ease',
    ':hover': {
      transform: 'scale(1.2)',
      color: '#dc2626',
      boxShadow: '0 0 10px rgba(220, 38, 38, 0.5)',
    },
  },
  documentInfo: {
    marginBottom: '16px',
  },
  documentName: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: '8px',
    wordBreak: 'break-word',
    lineHeight: '1.4',
    textShadow: '0 0 5px rgba(255, 255, 255, 0.3)',
  },
  documentSize: {
    fontSize: '14px',
    color: '#d1d5db',
    marginBottom: '4px',
    opacity: 0.9,
  },
  documentDate: {
    fontSize: '14px',
    color: '#d1d5db',
    margin: 0,
    opacity: 0.9,
  },
  documentActions: {
    display: 'flex',
    justifyContent: 'flex-end',
  },
  selectButton: {
    background: 'linear-gradient(45deg, #4f46e5, #7c3aed)', // Purple gradient
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    padding: '8px 16px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 15px rgba(79, 70, 229, 0.4)',
    ':hover': {
      transform: 'translateY(-2px)',
      boxShadow: '0 6px 20px rgba(79, 70, 229, 0.6), 0 0 15px rgba(124, 58, 237, 0.5)',
    },
    ':active': {
      transform: 'translateY(0)',
      boxShadow: '0 2px 10px rgba(79, 70, 229, 0.3)',
    },
  },
};

export default DocumentList;