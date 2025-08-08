import React, { useState } from "react";
import PasswordInput from "../../../elements/passwordInput/PasswordInput";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import umsMiddleware from "../../../redux/middleware/umsMiddleware";

function ResetPassword() {

    const location = useLocation();
    const { resetToken } = location.state;

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [password, setPassword] = useState('');
    const [confirmPassword, setconfirmPassword] = useState('');
    const [errorPassword, seterrorPassword] = useState(false);

    const handleSubmitNewPassword = async (e) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            seterrorPassword(true)
        }
        else {
            try {
                const body = {
                    "resetToken": resetToken,
                    "password": password
                }
                const response = await dispatch(umsMiddleware.ResetPassword(body));
                if (response?.success) {
                    navigate("/login")
                }
            } catch (error) {
                console.log(error)
            }
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') {
            e.preventDefault();
        }
    };

    return (

        <div className="flex justify-center items-center h-screen bg-white">
            <div className="flex flex-col bg-white p-8 rounded-lg text-center w-full max-w-md gap-4">
                <img src='/YanaLogo.png' alt="YANA Logo" className="w-72 mx-auto" />
                <form onSubmit={handleSubmitNewPassword} className="flex flex-col items-center gap-4" onKeyDown={handleKeyDown}>
                    <div>
                        <label className="text-2xl font-semibold">
                            Set Your Password
                        </label>
                        <p>Create a strong password to secure your account.</p>
                    </div>
                    <div className="flex flex-col w-3/4 gap-4">
                        <PasswordInput
                            id="password"
                            name="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="px-2 py-1 border border-secondary-dark rounded "
                            required
                        />
                        <div className="flex flex-col gap-1">
                            <PasswordInput
                                id="confirmPassword"
                                name="confirmPassword"
                                placeholder="Confirm Password"
                                value={confirmPassword}
                                className="px-2 py-1 border border-secondary-dark rounded "
                                onChange={(e) => {
                                    setconfirmPassword(e.target.value)
                                    seterrorPassword(false)
                                }}

                                required
                            />
                            {errorPassword && <p className="flex text-sm text-red justify-start">Passwords must be same</p>}
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="bg-secondary-dark text-white py-2 rounded w-3/4 hover:bg-primary-dark"
                    >
                        Set password
                    </button>
                </form>
            </div>
        </div>
    );
}

export default ResetPassword;
