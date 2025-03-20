import React, { useState } from "react";
import logo from '../../assets/logo.png';
import { useDispatch } from "react-redux";
import { login } from "../../redux/actions/userAction";
import PasswordInput from "../../elements/passwordInput/PasswordInput";

function LoginPage() {
  const dispatch = useDispatch();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogins = async (e) => {
    e.preventDefault();
    const data = { username, password };
    dispatch(login(data));
  };

  return (
    
      <div className="flex justify-center items-center h-screen bg-white">
        <div className="flex flex-col bg-white p-8 rounded-lg text-center w-full max-w-md gap-4">
          <img src='/Yana Logo.png' alt="YANA Logo" className="w-72 mx-auto" />
          <form onSubmit={handleLogins} className="flex flex-col items-center gap-4">
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="px-2 py-1 border border-red-600 rounded w-3/4"
              required
            />

            <div className="flex flex-wrap w-3/4">
              <PasswordInput
                id="confirmPassword"
                name="confirmPassword"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="px-2 py-1 border border-red-600 rounded "
                required
              />
            </div>

            <button
              type="submit"
              className="bg-red-600 text-white py-2 rounded w-3/4 hover:bg-red-400"
            >
              Log In
            </button>
          </form>
        </div>
      </div>
  );
}

export default LoginPage;
