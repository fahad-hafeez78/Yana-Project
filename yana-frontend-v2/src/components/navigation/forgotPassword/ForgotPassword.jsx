import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import ArrowBackIcon from "../../../assets/customIcons/generalIcons/back.svg"
import umsMiddleware from "../../../redux/middleware/umsMiddleware";

function ForgotPassword() {

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [userEmail, setUserEmail] = useState('');

    const handleSubmitEmail = async (e) => {
        e.preventDefault();
        try {
            const body = { "email": userEmail }
            const response = await dispatch(umsMiddleware.ForgetPasswordGetOTP(body));

            if (response?.success) {
                navigate("/login/verify-OTP", { state: { userEmail: userEmail } })
            }
        } catch (error) {
            console.log(error)
        }
    };

    const handleBacktoLogin = async (e) => {
        e.preventDefault();
        navigate("/login")
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
                <form onSubmit={handleSubmitEmail} className="flex flex-col items-center gap-4" onKeyDown={handleKeyDown}>
                    <label class="text-2xl font-semibold">
                        Forgot Your Password?
                    </label>
                    <p>Don't worry! Enter your email below, and we'll send you a code to reset your password.</p>
                    <input
                        type="email"
                        placeholder="Enter your email"
                        value={userEmail}
                        onChange={(e) => setUserEmail(e.target.value)}
                        className="px-2 py-1 border border-secondary-dark rounded w-3/4"
                        required
                    />
                    <button
                        type="submit"
                        className="bg-secondary-dark text-white py-2 rounded w-3/4 hover:bg-primary-dark"
                    >
                        Send code
                    </button>
                    <div className="flex items-center justify-start w-3/4 gap-2 ">
                        <img src={ArrowBackIcon} alt="Back" className="w-4 h-4" />
                        <a id="forgot-password" role="button" className="text-sm text-blue" onClick={handleBacktoLogin}>
                            Back to Login
                        </a>
                    </div>
                </form>
            </div>
        </div>
    );
}
export default ForgotPassword;