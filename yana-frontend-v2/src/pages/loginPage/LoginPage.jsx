import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { login } from "../../redux/actions/userAction";
import PasswordInput from "../../elements/passwordInput/PasswordInput";
import { useNavigate } from "react-router-dom";
import { requestForToken } from "../../config/firebase";
import { showErrorAlert } from "../../redux/actions/alertActions";
import Spinner from "../../elements/customSpinner/Spinner";

function LoginPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);


  const handleLogins = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true)
      // Get FCM token
      const fcmtoken = await requestForToken();
      if (fcmtoken) {
        const data = { username, password, "platform": "admin", fcmtoken };
        await dispatch(login(data));
      }
      else {
        dispatch(showErrorAlert("FCM token not generated"))
      }
    } catch (error) {

    } finally {
      setIsLoading(false)
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    navigate('/login/forgot-password')
  };

  return (
    <>

      <div className="flex justify-center items-center h-screen bg-white">
        <div className="relative flex flex-col bg-white p-8 rounded-lg text-center w-full max-w-md gap-4">
          {isLoading && (
            <div className="absolute inset-0 bg-white bg-opacity-40 flex items-center justify-center z-10 rounded-lg">
              <Spinner />
            </div>
          )}
          <img src='/YanaLogo.png' alt="YANA Logo" className="mx-auto" />
          <form onSubmit={handleLogins} className="flex flex-col items-center gap-4">
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="px-2 py-1 border border-secondary-dark rounded w-3/4"
              required
            />

            <div className="flex flex-col w-3/4 gap-1">
              <PasswordInput
                id="confirmPassword"
                name="confirmPassword"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="px-2 py-1 border border-secondary-dark rounded"
                required
                validate={false}
              />
              <div className="flex justify-start">
                <a id="forgot-password" role="button" onClick={handleForgotPassword} className="text-sm text-red-dark">Forgot your password?</a>
              </div>
            </div>
            <button
              type="submit"
              className="bg-secondary-dark text-white py-2 rounded w-3/4 hover:bg-primary-dark"
            >
              Log In
            </button>
          </form>
        </div>
      </div>

    </>
  );
}

export default LoginPage;
