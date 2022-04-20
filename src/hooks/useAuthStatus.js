import { useState, useEffect, useRef } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

export const useAuthStatus = () => {
  // Assume user to be logged out
  const [loggedIn, setLoggedIn] = useState(false);
  // Keep trck to display a spinner whileauth status is being checked
  const [checkingStatus, setCheckingStatus] = useState(true);

  const isMounted = useRef(true);

  useEffect(() => {
    if (isMounted) {
      // Auth listener to keep track of user signing in and out
      const auth = getAuth();
      onAuthStateChanged(auth, (user) => {
        if (user) {
          setLoggedIn(true);
        }
        setCheckingStatus(false);
      });
    }

    return () => {
      isMounted.current = false;
    };
  }, [isMounted]);

  return { loggedIn, checkingStatus };
};

// Protected routes in v6
// https://stackoverflow.com/questions/65505665/protected-route-with-firebase

// Fix memory leak warning
// https://stackoverflow.com/questions/59780268/cleanup-memory-leaks-on-an-unmounted-component-in-react-hooks
