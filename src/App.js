import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { NavBar } from './components/NavBar';
import { PrivateRoute } from './components/PrivateRoute';
import { Explore } from './pages/Explore';
import { ForgotPassword } from './pages/ForgotPassword';
import { Offers } from './pages/Offers';
import { Profile } from './pages/Profile';
import { SignIn } from './pages/SignIn';
import { SignUp } from './pages/SignUp';
import Category from './pages/Category';

function App() {
  return (
    <>
      <Router>
        <Routes>
          <Route path='/' element={<Explore />} />
          <Route path='/offers' element={<Offers />} />
          <Route path='/category/:categoryName' element={<Category />} />
          <Route path='/signIn' element={<SignIn />} />
          <Route path='/signUp' element={<SignUp />} />
          <Route path='/profile' element={<PrivateRoute />}>
            <Route path='/profile' element={<Profile />} />
          </Route>
          {/* <Route path='/profile' element={<Profile />} /> */}
          <Route path='/forgotpassword' element={<ForgotPassword />} />
        </Routes>
        <NavBar />
      </Router>
      <ToastContainer position='top-center' />
    </>
  );
}

export default App;
