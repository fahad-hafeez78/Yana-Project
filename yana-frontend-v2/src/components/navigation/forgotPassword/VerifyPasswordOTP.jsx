import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import ArrowBackIcon from "../../../assets/customIcons/generalIcons/back.svg"
import umsMiddleware from "../../../redux/middleware/umsMiddleware";
import { showSuccessAlert } from "../../../redux/actions/alertActions";

function VerifyPasswordOTP() {

    const location = useLocation();
    const { userEmail } = location.state;

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [OTPcode, setOTPcode] = useState('');

    const resendOTPCode = async (e) => {
        e.preventDefault();
        try {
            const body = { "email": userEmail }
            const response = await dispatch(umsMiddleware.ForgetPasswordGetOTP(body));

            if (response?.success) {
                dispatch(showSuccessAlert("OTP sent"))
            }
        } catch (error) {
            console.log(error)
        }
    };
    const handleVerifyOTP = async (e) => {
        e.preventDefault();
        try {
            const body = {
                "otp": OTPcode,
                "email": userEmail
            }
            const response = await dispatch(umsMiddleware.ForgetPasswordVerifyOTP(body))
            if (response?.success) {
                navigate("/login/reset-password", { state: { resetToken: response?.resetToken } })
            }
        } catch (error) {

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
                <form onSubmit={handleVerifyOTP} className="flex flex-col items-center gap-4" onKeyDown={handleKeyDown}>

                    <div className="flex flex-col">
                        <label class="text-2xl font-semibold">
                            Please check your email
                        </label>
                        <label>We've sent a code to {userEmail}</label>
                    </div>

                    <div className="flex flex-col w-3/4 gap-1">
                        <input
                            type="text"
                            placeholder="Enter code"
                            value={OTPcode}
                            onChange={(e) => setOTPcode(e.target.value)}
                            className="px-2 py-1 border border-secondary-dark rounded "
                            required
                        />
                        <div className="flex justify-start">
                            <a id="forgot-password"  >Didn't received a code? <span role="button" onClick={resendOTPCode} className="text-sm text-red">Resend</span></a>
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="bg-secondary-dark text-white py-2 rounded w-3/4 hover:bg-primary-dark"
                    >
                        Verify
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
export default VerifyPasswordOTP;