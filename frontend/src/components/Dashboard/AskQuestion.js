import React, { useState } from 'react';
import { questionAPI } from '../../services/api';

const AskQuestion = ({ selectedDocument }) => {
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversation, setConversation] = useState([]);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!question.trim()) return;
    if (!selectedDocument) {
      setError('Please select a document first');
      return;
    }

    const currentQuestion = question.trim();
    setQuestion('');
    setLoading(true);
    setError('');

    const questionEntry = {
      type: 'question',
      content: currentQuestion,
      timestamp: new Date(),
    };
    setConversation(prev => [...prev, questionEntry]);

    try {
      const response = await questionAPI.askQuestion({
        document_id: selectedDocument.id,
        question: currentQuestion,
      });

      const answerEntry = {
        type: 'answer',
        content: response.data.answer,
        timestamp: new Date(),
      };
      setConversation(prev => [...prev, answerEntry]);
    } catch (error) {
      const errorMessage = error.response?.data?.error ||
                          'Failed to get answer. Please try again.';
      setError(errorMessage);

      const errorEntry = {
        type: 'error',
        content: errorMessage,
        timestamp: new Date(),
      };
      setConversation(prev => [...prev, errorEntry]);
    } finally {
      setLoading(false);
    }
  };

  const clearConversation = () => {
    setConversation([]);
    setError('');
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const suggestedQuestions = [
    "What is the main topic of this document?",
    "Can you summarize the key points?",
    "What are the most important findings?",
  ];

  const handleSuggestedQuestion = (suggestedQ) => {
    setQuestion(suggestedQ);
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>Ask Questions</h2>
        {selectedDocument ? (
          <p style={styles.selectedDoc}>
            📄 {selectedDocument.original_filename}
          </p>
        ) : (
          <p style={styles.noDoc}>Select a document to start asking questions</p>
        )}
      </div>

      {!selectedDocument ? (
        <div style={styles.emptyState}>
          <div style={styles.emptyIcon}>❓</div>
          <h3 style={styles.emptyTitle}>No Document Selected</h3>
          <p style={styles.emptyText}>
            Choose a document from your library to start asking questions and get AI-powered insights.
          </p>
        </div>
      ) : (
        <>
          <div style={styles.conversationContainer}>
            {conversation.length === 0 ? (
              <div style={styles.welcomeMessage}>
                <h3 style={styles.welcomeTitle}>💡 Ready to explore your document?</h3>
                <p style={styles.welcomeText}>
                  Ask any questions about the content, and I'll provide answers based on the document.
                </p>
                <div style={styles.suggestedSection}>
                  <h4 style={styles.suggestedTitle}>Try asking:</h4>
                  <div style={styles.suggestedQuestions}>
                    {suggestedQuestions.map((sq, index) => (
                      <button
                        key={index}
                        onClick={() => handleSuggestedQuestion(sq)}
                        style={styles.suggestedButton}
                      >
                        {sq}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div style={styles.conversation}>
                {conversation.map((entry, index) => (
                  <div
                    key={index}
                    style={{
                      ...styles.conversationEntry,
                      ...(entry.type === 'question' ? styles.questionEntry :
                          entry.type === 'answer' ? styles.answerEntry : styles.errorEntry),
                    }}
                  >
                    <div style={styles.entryHeader}>
                      <span style={styles.entryType}>
                        {entry.type === 'question' ? '❓ You' :
                         entry.type === 'answer' ? '🤖 AI Assistant' : '❌ Error'}
                      </span>
                      <span style={styles.timestamp}>
                        {formatTime(entry.timestamp)}
                      </span>
                    </div>
                    <div style={styles.entryContent}>
                      {entry.content}
                    </div>
                  </div>
                ))}
                {loading && (
                  <div style={{...styles.conversationEntry, ...styles.answerEntry}}>
                    <div style={styles.entryHeader}>
                      <span style={styles.entryType}>🤖 AI Assistant</span>
                      <span style={styles.timestamp}>...</span>
                    </div>
                    <div style={styles.entryContent}>
                      <div style={styles.loadingAnswer}>
                        <div style={styles.spinner}></div>
                        <span>Analyzing document and generating answer...</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
          <div style={styles.questionForm}>
            {conversation.length > 0 && (
              <button
                onClick={clearConversation}
                style={styles.clearButton}
                type="button"
              >
                Clear Conversation
              </button>
            )}
            <form onSubmit={handleSubmit} style={styles.form}>
              <div style={styles.inputContainer}>
                <textarea
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="Ask a question about this document..."
                  style={styles.textarea}
                  rows={3}
                  disabled={loading}
                />
                <button
                  type="submit"
                  disabled={loading || !question.trim()}
                  style={{
                    ...styles.submitButton,
                    ...(loading || !question.trim() ? styles.submitButtonDisabled : {}),
                  }}
                >
                  {loading ? (
                    <>
                      <div style={styles.buttonSpinner}></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      Ask
                      <span style={styles.sendIcon}>➤</span>
                    </>
                  )}
                </button>
              </div>
            </form>
            {error && (
              <div style={styles.errorMessage}>
                {error}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

const styles = {
  container: {
    background: 'linear-gradient(135deg, #1e3a8a, #3b82f6)', // Vibrant blue gradient
    borderRadius: '16px',
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3), 0 0 20px rgba(59, 130, 246, 0.4)', // Neon glow
    height: 'calc(100vh - 140px)',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    transition: 'all 0.3s ease',
  },
  header: {
    padding: '24px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
    background: 'rgba(0, 0, 0, 0.1)',
  },
  title: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#ffffff',
    textShadow: '0 0 10px rgba(255, 255, 255, 0.5)',
    marginBottom: '8px',
  },
  selectedDoc: {
    fontSize: '16px',
    color: '#a5b4fc',
    margin: 0,
    fontWeight: '500',
    textShadow: '0 0 5px rgba(165, 180, 252, 0.5)',
  },
  noDoc: {
    fontSize: '16px',
    color: '#d1d5db',
    margin: 0,
    opacity: 0.8,
  },
  emptyState: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px',
    textAlign: 'center',
    background: 'rgba(0, 0, 0, 0.2)',
    borderRadius: '12px',
    margin: '24px',
  },
  emptyIcon: {
    fontSize: '80px',
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
    lineHeight: '1.5',
    opacity: 0.9,
  },
  conversationContainer: {
    flex: 1,
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    minHeight: 0,
  },
  welcomeMessage: {
    padding: '40px',
    textAlign: 'center',
    background: 'rgba(0, 0, 0, 0.15)',
    borderRadius: '12px',
    margin: '24px',
  },
  welcomeTitle: {
    fontSize: '20px',
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: '8px',
    textShadow: '0 0 10px rgba(255, 255, 255, 0.4)',
  },
  welcomeText: {
    fontSize: '16px',
    color: '#d1d5db',
    marginBottom: '32px',
    lineHeight: '1.5',
  },
  suggestedSection: {
    textAlign: 'left',
    maxWidth: '600px',
    margin: '0 auto',
  },
  suggestedTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: '16px',
    textShadow: '0 0 8px rgba(255, 255, 255, 0.3)',
  },
  suggestedQuestions: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  suggestedButton: {
    background: 'linear-gradient(45deg, #4f46e5, #7c3aed)', // Vibrant purple gradient
    border: 'none',
    borderRadius: '10px',
    padding: '12px 16px',
    textAlign: 'left',
    cursor: 'pointer',
    fontSize: '16px',
    color: '#ffffff',
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
  conversation: {
    flex: 1,
    overflowY: 'auto',
    padding: '16px 24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    overscrollBehavior: 'contain',
    '-webkit-overflow-scrolling': 'touch',
  },
  conversationEntry: {
    borderRadius: '12px',
    padding: '16px',
    maxWidth: '85%',
    animation: 'fadeIn 0.3s ease-in',
  },
  questionEntry: {
    background: 'linear-gradient(45deg, #3b82f6, #60a5fa)', // Blue gradient for questions
    color: 'white',
    alignSelf: 'flex-end',
    boxShadow: '0 4px 15px rgba(59, 130, 246, 0.4)',
  },
  answerEntry: {
    background: 'linear-gradient(45deg, #1e40af, #3b82f6)', // Darker blue for answers
    color: 'white',
    alignSelf: 'flex-start',
    boxShadow: '0 4px 15px rgba(30, 64, 175, 0.4)',
  },
  errorEntry: {
    background: 'linear-gradient(45deg, #dc2626, #f87171)', // Red gradient for errors
    color: 'white',
    alignSelf: 'flex-start',
    boxShadow: '0 4px 15px rgba(220, 38, 38, 0.4)',
  },
  entryHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8px',
    fontSize: '14px',
    fontWeight: '600',
    opacity: 0.9,
  },
  entryType: {
    fontSize: '14px',
    textShadow: '0 0 5px rgba(255, 255, 255, 0.3)',
  },
  timestamp: {
    fontSize: '12px',
    opacity: 0.8,
  },
  entryContent: {
    fontSize: '16px',
    lineHeight: '1.6',
    whiteSpace: 'pre-wrap',
  },
  loadingAnswer: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    color: '#d1d5db',
  },
  spinner: {
    width: '20px',
    height: '20px',
    border: '3px solid rgba(255, 255, 255, 0.3)',
    borderTop: '3px solid #ffffff',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  questionForm: {
    padding: '16px 24px 24px',
    borderTop: '1px solid rgba(255, 255, 255, 0.2)',
    background: 'rgba(0, 0, 0, 0.1)',
  },
  clearButton: {
    background: 'linear-gradient(45deg, #6b7280, #9ca3af)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    padding: '8px 16px',
    fontSize: '14px',
    cursor: 'pointer',
    marginBottom: '16px',
    boxShadow: '0 4px 15px rgba(107, 114, 128, 0.4)',
    transition: 'all 0.3s ease',
    ':hover': {
      transform: 'translateY(-2px)',
      boxShadow: '0 6px 20px rgba(107, 114, 128, 0.6)',
    },
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
  },
  inputContainer: {
    display: 'flex',
    gap: '12px',
    alignItems: 'flex-end',
  },
  textarea: {
    flex: 1,
    padding: '12px 16px',
    border: '2px solid #3b82f6',
    borderRadius: '10px',
    fontSize: '16px',
    resize: 'none',
    outline: 'none',
    fontFamily: 'inherit',
    background: 'rgba(255, 255, 255, 0.1)',
    color: 'white',
    boxShadow: '0 0 10px rgba(59, 130, 246, 0.3)',
    transition: 'all 0.3s ease',
    ':focus': {
      borderColor: '#7c3aed',
      boxShadow: '0 0 15px rgba(124, 58, 237, 0.5)',
    },
  },
  submitButton: {
    background: 'linear-gradient(45deg, #4f46e5, #7c3aed)', // Purple gradient
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    padding: '12px 24px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    whiteSpace: 'nowrap',
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
  submitButtonDisabled: {
    background: 'linear-gradient(45deg, #6b7280, #9ca3af)',
    cursor: 'not-allowed',
    boxShadow: 'none',
    ':hover': {
      transform: 'none',
      boxShadow: 'none',
    },
  },
  buttonSpinner: {
    width: '16px',
    height: '16px',
    border: '3px solid rgba(255, 255, 255, 0.3)',
    borderTop: '3px solid #ffffff',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  sendIcon: {
    fontSize: '14px',
    transform: 'rotate(-45deg)',
  },
  errorMessage: {
    background: 'linear-gradient(45deg, #dc2626, #f87171)',
    color: 'white',
    padding: '12px',
    borderRadius: '10px',
    border: 'none',
    fontSize: '14px',
    marginTop: '12px',
    boxShadow: '0 4px 15px rgba(220, 38, 38, 0.4)',
  },
};

export default AskQuestion;