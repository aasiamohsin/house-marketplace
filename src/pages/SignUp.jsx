import { useState } from 'react';
import { toast } from 'react-toastify';
import { Link, useNavigate } from 'react-router-dom';
import {
  getAuth,
  createUserWithEmailAndPassword,
  updateProfile,
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase.config';
import { ReactComponent as ArrowRightIcon } from '../assets/svg/keyboardArrowRightIcon.svg';
import visibilityIcon from '../assets/svg/visibilityIcon.svg';

export const SignUp = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });

  const { name, email, password } = formData;

  const navigate = useNavigate();

  const onSubmit = async (e) => {
    e.preventDefault();

    try {
      // Auth value from getAuth
      const auth = getAuth();

      // Registering/Create a new user with createUserWithEmailAndPassword
      const userCredentials = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      // Get new user signed in
      const user = userCredentials.user;

      // Updates display name
      updateProfile(auth.currentUser, {
        displayName: name,
      });

      // Get/Copy formData state
      const formDataCopy = { ...formData };
      // Delete password from database
      delete formDataCopy.password;
      // Server Time Stamp
      formDataCopy.timstamp = serverTimestamp();
      // Update database and add user to dababase collection
      await setDoc(doc(db, 'users', user.uid), formDataCopy);

      // Navigate to home
      navigate('/');
    } catch (error) {
      toast.error('Something went wrong. Registration failed!');
    }
  };

  const onChange = (e) => {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.id]: e.target.value,
    }));
  };

  return (
    <>
      <div className='pageContainer'>
        <header>
          <p className='pageHeader'>Welcome!</p>
        </header>
        <form onSubmit={onSubmit}>
          <input
            type='text'
            className='nameInput'
            placeholder='Username'
            id='name'
            onChange={onChange}
          />
          <input
            type='email'
            className='emailInput'
            placeholder='Email'
            id='email'
            onChange={onChange}
          />

          <div className='passwordInputDiv'>
            <input
              type={showPassword ? 'text' : 'password'}
              className='passwordInput'
              placeholder='Password'
              id='password'
              onChange={onChange}
            />

            <img
              src={visibilityIcon}
              alt='show password'
              className='showPassword'
              onClick={() => setShowPassword(!showPassword)}
            />
          </div>
          <Link to='/forgot-password' className='forgotPasswordLink'>
            Forgot Password
          </Link>

          <div className='signUpBar'>
            <p className='signUpText'>Sign Up</p>
            <button className='signUpButton'>
              <ArrowRightIcon fill='#ffff' width='34px' height='34px' />
            </button>
          </div>
        </form>

        <Link to='/signIn' className='registerLink'>
          Sign In Instead.
        </Link>
      </div>
    </>
  );
};
