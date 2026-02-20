
import React from 'react';

const MobileUIFixes: React.FC = () => {
  React.useEffect(() => {
    // Add global mobile-specific CSS fixes
    const style = document.createElement('style');
    style.textContent = `
      /* Mobile text overflow fixes */
      @media (max-width: 768px) {
        /* Prevent text overflow in input fields */
        input[type="text"], 
        input[type="email"], 
        input[type="password"],
        textarea {
          word-break: break-word !important;
          overflow-wrap: break-word !important;
          white-space: normal !important;
          min-width: 0 !important;
        }
        
        /* Fix card content overflow */
        .card-content, 
        [data-radix-collection-item] {
          word-break: break-word;
          overflow-wrap: break-word;
          min-width: 0;
        }
        
        /* Fix button text overflow */
        button {
          word-break: break-word;
          white-space: normal;
          min-height: 2.5rem;
        }
        
        /* Fix table cell overflow */
        td, th {
          word-break: break-word;
          overflow-wrap: break-word;
          max-width: 0;
          white-space: normal;
        }
        
        /* Fix pre and code blocks */
        pre, code {
          white-space: pre-wrap;
          word-break: break-word;
          overflow-wrap: break-word;
        }
        
        /* Fix modal and drawer content */
        [data-radix-dialog-content],
        [data-vaul-drawer] {
          max-width: calc(100vw - 2rem);
          word-break: break-word;
        }
        
        /* Fix admin dashboard cards */
        .admin-card {
          overflow: hidden;
        }
        
        .admin-card * {
          word-break: break-word;
          overflow-wrap: break-word;
        }
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return null;
};

export default MobileUIFixes;
