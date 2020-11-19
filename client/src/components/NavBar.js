import React from 'react';
import api from '../config/api';

const NavBar = () => {

  const handleLogin = () => {
    console.log('login');
    api.get('/auth/google')
      .then(console.log())
      .catch(error => console.log(error));
  }

  return (
    <div>
      <button onClick={handleLogin}>Log in</button>
    </div>
  )
}

export default NavBar
