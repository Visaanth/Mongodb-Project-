import React, { useEffect, useRef } from 'react';

const GoogleLoginButton = ({ onSuccess, onError, text = 'signin_with' }) => {
  const buttonRef = useRef(null);

  useEffect(() => {
    const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID || 'your-google-client-id.apps.googleusercontent.com';

    const initializeGoogleSignIn = () => {
      if (!window.google) {
        console.warn('Google Identity Services script not loaded yet.');
        return;
      }

      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: (response) => {
          if (response.credential) {
            onSuccess(response.credential);
          } else {
            if (onError) onError('No credential received');
          }
        },
      });

      window.google.accounts.id.renderButton(
        buttonRef.current,
        {
          theme: 'outline',
          size: 'large',
          text: text, // 'signin_with', 'signup_with', etc.
          shape: 'pill',
          width: buttonRef.current?.parentElement?.offsetWidth || 350,
        }
      );
    };

    // Initialize immediately if script already loaded, otherwise check periodically
    if (window.google) {
      initializeGoogleSignIn();
    } else {
      const interval = setInterval(() => {
        if (window.google) {
          initializeGoogleSignIn();
          clearInterval(interval);
        }
      }, 300);
      return () => clearInterval(interval);
    }
  }, [onSuccess, onError, text]);

  return (
    <div 
      ref={buttonRef} 
      style={{ 
        width: '100%', 
        display: 'flex', 
        justifyContent: 'center', 
        marginTop: '0.5rem',
        marginBottom: '0.5rem',
        minHeight: '40px'
      }} 
    />
  );
};

export default GoogleLoginButton;
