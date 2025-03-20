import React from "react";
import { ErrorBoundary } from "react-error-boundary";
import { Navigate, useRoutes } from "react-router-dom";

// SVG Imports
import ForbiddenSVG from "../../assets/statuscode403.svg";
import NotFoundSVG from "../../assets/statuscode404.svg";
import ServerErrorSVG from "../../assets/statuscode500.svg";

const customMessages = {
  403: {
    title: "403",
    error: "Forbidden",
    message: <>
        Access Denied! <br />
        You don't have permission to view this page.
    </>,
    icon: <img src={ForbiddenSVG} alt="403 Forbidden" className="h-60" />,
  },
  404: {
    title: "404",
    error: "Not Found",
    message: <> We are sorry. <br />
    The page you requested cannot be found.
    </>,
    icon: <img src={NotFoundSVG} alt="404 Not Found" className="w-70 h-80" />,
  },
  500: {
    title: "500",
    error: "Server Error",
    message: <> Oops! Something's wrong on our side. <br />
    Try again later.</>,
    icon: <img src={ServerErrorSVG} alt="500 Server Error" className="w-56 h-56" />,
  },
  default: {
    title: "Error",
    message: "An unexpected error occurred. Please try again.",
    icon: null,
  },
};

// Error Fallback Component
const ErrorFallback = ({ error, resetErrorBoundary }) => {
  let statusCode = 'default';

  // Determine error type based on error object or message
  if (error.response) {
    // Axios error with response
    statusCode = error.response.status || 'default';
  } else if (error.message) {
    // Custom error message detection
    if (error.message.includes("page not found")) {
      statusCode = 404;
    } else if (error.message.includes("server error")) {
      statusCode = 500;
    } else if (error.message.includes("forbidden")) {
      statusCode = 403;
    }
  }

  // Ensure statusCode exists in customMessages
  const errorDetails = customMessages[statusCode] || customMessages.default;
  
  return (
    <div role="alert" className="flex items-center justify-center bg-gray-100 min-h-screen">
      {errorDetails.icon && (
        <div>{errorDetails.icon}</div>
      )}
      <div className="flex flex-col items-center space-y-4">   
        <h1 className="text-8xl font-bold text-main">{errorDetails.title || "Error"}</h1>
        <h2 className="text-5xl font-semibold text-gray-800">{errorDetails.error || "Error"}</h2>
        <p className="text-xl text-gray-600 text-center px-6">{errorDetails.message}</p>
        <button
          type="button"
          onClick={() => window.location.href = '/'}
          className="bg-custom-blue border text-white px-10 py-1 rounded-full text-lg flex items-center justify-center"
        >
          Go Home
        </button>
      </div>
    </div>
  );
};

// Error Boundary Wrapper Component
export const MyErrorBoundary = ({ children }) => {
  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onReset={() => {
        window.location.reload();
      }}
    >
      {children}
    </ErrorBoundary>
  );
};

// Catch-All Route Component
export const NotFoundPage = () => {
  return (
    <div role="alert" className="flex items-center justify-center bg-gray-100 min-h-screen">
      {customMessages[404].icon}
      <div className="flex flex-col items-center space-y-4">   
        <h1 className="text-8xl font-bold text-main">{customMessages[404].title}</h1>
        <h2 className="text-5xl font-semibold text-gray-800">{customMessages[404].error}</h2>
        <p className="text-xl text-gray-600 text-center px-6">{customMessages[404].message}</p>
        <button
          type="button"
          onClick={() => window.location.href = '/'}
          className="bg-custom-blue border text-white px-10 py-1 rounded-full text-lg flex items-center justify-center"
        >
          Go Home
        </button>
      </div>
    </div>
  );
};



export default MyErrorBoundary;