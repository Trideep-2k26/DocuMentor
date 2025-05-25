import React, { useState, useRef } from 'react';
import { documentAPI } from '../../services/api';

const Upload = ({ onUploadSuccess }) => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/tiff'];
  const maxSize = 10 * 1024 * 1024; // 10MB

  const validateFile = (file) => {
    if (!allowedTypes.includes(file.type)) {
      return 'Only PDF, JPEG, PNG, and TIFF files are allowed.';
    }
    if (file.size > maxSize) {
      return 'File size cannot exceed 10MB.';
    }
    return null;
  };

  const handleFileSelect = (selectedFile) => {
    setError('');
    const validationError = validateFile(selectedFile);
    if (validationError) {
      setError(validationError);
      return;
    }
    setFile(selectedFile);
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      handleFileSelect(selectedFile);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('http://localhost:8000/api/documents/', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage;
        try {
          const errorJson = JSON.parse(errorText);
          errorMessage = errorJson.error || errorJson.detail || errorJson.message || 'Upload failed';
        } catch {
          errorMessage = errorText || `HTTP ${response.status}: ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      const result = await response.json();
      setFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      if (onUploadSuccess) {
        onUploadSuccess(result);
      }
    } catch (error) {
      let errorMessage = 'Upload failed. Please try again.';
      if (error.message) {
        errorMessage = error.message;
      }
      setError(errorMessage);
    } finally {
      setUploading(false);
    }
  };

  const removeFile = () => {
    setFile(null);
    setError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const openFileDialog = () => {
    fileInputRef.current.click();
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Upload Document</h2>

      <div
        style={{
          ...styles.dropZone,
          ...(dragActive ? styles.dropZoneActive : {}),
        }}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={openFileDialog}
      >
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileChange}
          accept=".pdf,.jpg,.jpeg,.png,.tiff"
          style={styles.hiddenInput}
        />

        <div style={styles.dropZoneContent}>
          <div style={styles.uploadIcon}>📄</div>
          <p style={styles.dropZoneText}>
            {dragActive
              ? 'Drop your file here'
              : 'Drag and drop your file here, or click to browse'}
          </p>
          <p style={styles.supportedFormats}>
            Supported formats: PDF Only(Max 10MB)
          </p>
        </div>
      </div>

      {error && (
        <div style={styles.errorMessage}>
          <strong>Upload Error:</strong> {error}
          <div style={styles.errorHint}>
            Tip: Make sure your server accepts multipart/form-data requests
          </div>
        </div>
      )}

      {file && (
        <div style={styles.filePreview}>
          <div style={styles.fileInfo}>
            <div style={styles.fileName}>📄 {file.name}</div>
            <div style={styles.fileSize}>{formatFileSize(file.size)}</div>
            <div style={styles.fileType}>Type: {file.type}</div>
          </div>
          <button onClick={removeFile} style={styles.removeButton}>
            ✕
          </button>
        </div>
      )}

      {file && (
        <div style={styles.uploadSection}>
          <button
            onClick={handleUpload}
            disabled={uploading}
            style={{
              ...styles.uploadButton,
              ...(uploading ? styles.uploadButtonDisabled : {}),
            }}
          >
            {uploading ? (
              <>
                <span style={styles.spinner}></span>
                Uploading & Processing...
              </>
            ) : (
              'Upload Document'
            )}
          </button>
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
  title: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#ffffff',
    textShadow: '0 0 10px rgba(255, 255, 255, 0.5)',
    marginBottom: '20px',
  },
  dropZone: {
    border: '2px dashed rgba(255, 255, 255, 0.3)',
    borderRadius: '12px',
    padding: '40px 20px',
    textAlign: 'center',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    background: 'rgba(0, 0, 0, 0.2)',
    ':hover': {
      boxShadow: '0 0 15px rgba(59, 130, 246, 0.5)',
    },
  },
  dropZoneActive: {
    borderColor: '#7c3aed',
    background: 'rgba(124, 58, 237, 0.1)',
    boxShadow: '0 0 20px rgba(124, 58, 237, 0.5)',
  },
  hiddenInput: {
    position: 'absolute',
    width: '1px',
    height: '1px',
    padding: 0,
    margin: '-1px',
    overflow: 'hidden',
    clip: 'rect(0,0,0,0)',
    whiteSpace: 'nowrap',
    border: 0,
  },
  dropZoneContent: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px',
  },
  uploadIcon: {
    fontSize: '56px',
    opacity: 0.7,
    textShadow: '0 0 15px rgba(255, 255, 255, 0.4)',
  },
  dropZoneText: {
    fontSize: '18px',
    color: '#ffffff',
    margin: 0,
    fontWeight: '500',
    textShadow: '0 0 5px rgba(255, 255, 255, 0.3)',
  },
  supportedFormats: {
    fontSize: '14px',
    color: '#d1d5db',
    margin: 0,
    opacity: 0.8,
  },
  errorMessage: {
    background: 'linear-gradient(45deg, #dc2626, #f87171)', // Red gradient
    color: 'white',
    padding: '12px',
    borderRadius: '10px',
    border: 'none',
    fontSize: '14px',
    marginTop: '16px',
    boxShadow: '0 4px 15px rgba(220, 38, 38, 0.4)',
  },
  errorHint: {
    fontSize: '12px',
    marginTop: '8px',
    fontStyle: 'italic',
    opacity: 0.8,
  },
  filePreview: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    background: 'rgba(255, 255, 255, 0.1)',
    padding: '16px',
    borderRadius: '10px',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    marginTop: '16px',
    boxShadow: '0 4px 15px rgba(59, 130, 246, 0.3)',
    animation: 'fadeIn 0.3s ease-in',
  },
  fileInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  fileName: {
    fontSize: '16px',
    fontWeight: '500',
    color: '#ffffff',
    textShadow: '0 0 5px rgba(255, 255, 255, 0.3)',
  },
  fileSize: {
    fontSize: '14px',
    color: '#d1d5db',
    opacity: 0.9,
  },
  fileType: {
    fontSize: '14px',
    color: '#d1d5db',
    fontFamily: 'monospace',
    opacity: 0.9,
  },
  removeButton: {
    background: 'linear-gradient(45deg, #dc2626, #f87171)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    width: '28px',
    height: '28px',
    cursor: 'pointer',
    fontSize: '14px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 10px rgba(220, 38, 38, 0.4)',
    transition: 'all 0.3s ease',
    ':hover': {
      transform: 'scale(1.1)',
      boxShadow: '0 6px 15px rgba(220, 38, 38, 0.6)',
    },
  },
  uploadSection: {
    marginTop: '20px',
    textAlign: 'center',
  },
  uploadButton: {
    background: 'linear-gradient(45deg, #4f46e5, #7c3aed)', // Purple gradient
    color: 'white',
    padding: '12px 24px',
    border: 'none',
    borderRadius: '10px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    boxShadow: '0 4px 15px rgba(79, 70, 229, 0.4), 0 0 20px rgba(124, 58, 237, 0.3)',
    transition: 'all 0.3s ease',
    ':hover': {
      transform: 'translateY(-2px)',
      boxShadow: '0 6px 20px rgba(79, 70, 229, 0.6), 0 0 25px rgba(124, 58, 237, 0.5)',
    },
    ':active': {
      transform: 'translateY(0)',
      boxShadow: '0 2px 10px rgba(79, 70, 229, 0.3)',
    },
  },
  uploadButtonDisabled: {
    background: 'linear-gradient(45deg, #6b7280, #9ca3af)',
    cursor: 'not-allowed',
    boxShadow: 'none',
    ':hover': {
      transform: 'none',
      boxShadow: 'none',
    },
  },
  spinner: {
    width: '18px',
    height: '18px',
    border: '3px solid rgba(255, 255, 255, 0.3)',
    borderTop: '3px solid #ffffff',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
};

export default Upload;