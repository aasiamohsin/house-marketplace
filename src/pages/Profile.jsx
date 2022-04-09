import { useState, useEffect } from 'react';
import { getAuth } from 'firebase/auth';

export const Profile = () => {
  const [user, setUser] = useState(null);

  const auth = getAuth();

  useEffect(() => {
    setUser(auth.currentUser);
  }, []);

  return user ? <h2>{user.displayName}</h2> : 'Not Logged In';
};
