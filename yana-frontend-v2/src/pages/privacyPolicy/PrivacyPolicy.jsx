import React, { useState, useEffect } from "react";

const PrivacyPolicyPage = () => {
  const [activeSection, setActiveSection] = useState(null);
  const [isAccepted, setIsAccepted] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const sections = [
    {
      key: 'infoCollected',
      title: 'Information We Collect',
      content: [
        'Login Credentials: Users are required to enter a username and password to securely log in to the App. These credentials are provided by Yana.',
        'Order Data: Information about your meal orders, including order history and modifications.',
        'User Images: Images uploaded using your device’s camera or gallery.',
        'Location Data: Your current location, with your permission, to autofill your address for convenience.'
      ]
    },
    {
      key: 'howWeUse',
      title: 'How We Use Your Information',
      content: [
        'Facilitate interaction with Yana participants.',
        'Process and manage meal orders, including edits before the cutoff time.',
        'Provide access to order history for your convenience.',
        'Autofill your current address using location data to simplify the process, especially for users over 60 years old.',
        'Send notifications via third-party services like Firebase Cloud Messaging (FCM).'
      ]
    },
    {
      key: 'permissions',
      title: 'Permissions',
      content: [
        'Camera Permission: To allow you to take and upload images directly within the app.',
        'Gallery Permission: To enable uploading images from your device\'s storage.',
        'Location Permission: To access your current location for autofilling your address. This feature is designed to simplify the process for users, especially those over 60, by reducing manual entry.'
      ]
    },
    {
      key: 'thirdParty',
      title: 'Third-Party Services',
      content: [
        'We use third-party services, such as Firebase, for push notifications. These services may collect non-personally identifiable data to deliver their functionality.'
      ]
    },
    {
      key: 'dataSecurity',
      title: 'Data Security',
      content: [
        'Secure and efficient databases managed by Yana.',
        'OAuth tokens for user authentication and authorization.'
      ]
    },
    {
      key: 'accountDeletion',
      title: 'Account Deletion',
      content: [
        'If you wish to delete your account, you can request account deletion through the App. Upon verification, your data will be permanently removed from our systems, except for any data required by law to retain.'
      ]
    },
    {
      key: 'noPaymentProcessing',
      title: 'No Payment Processing',
      content: [
        'The Yana App does not process payments or store payment information.'
      ]
    },
    {
      key: 'userRights',
      title: 'User Rights',
      content: [
        'Access and modify your meal orders before the cutoff time.',
        'View your previous orders.',
        'Request the deletion of your account and associated data.'
      ]
    },
    {
      key: 'userFriendlyExperience',
      title: 'User-Friendly Experience',
      content: [
        'The Yana App is designed to provide a seamless and user-friendly experience for all participants.'
      ]
    },
    {
      key: 'policyChanges',
      title: 'Changes to the Privacy Policy',
      content: [
        'We may update this Privacy Policy from time to time. Any changes will be reflected with a new "Effective Date." We encourage you to review this policy periodically to stay informed.'
      ]
    }
  ];

  const toggleSection = (key) => {
    setActiveSection(activeSection === key ? null : key);
  };

  const handleAccept = () => {
    setIsAccepted(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex flex-col">
      <header
        className={`fixed top-0 left-0 right-0 z-20 transition-all duration-300 ${
          isScrolled ? "bg-white shadow-md py-4" : "bg-transparent py-6"
        }`}
      >
        <div className="max-w-4xl mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8 text-blue-600"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            <h1 className="text-xl font-bold text-gray-800">Yana Privacy</h1>
          </div>
        </div>
      </header>

      <div className="flex-grow flex items-center justify-center pt-20 pb-10">
        <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden transform transition-all duration-500 ease-in-out hover:scale-[1.01]">
          <div className="p-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
              Privacy Policy
            </h2>

            <p className="text-gray-600 text-center mb-8 px-4">
              Last Updated: November 30, 2024
            </p>

            <div className="space-y-4">
              {sections.map((section) => (
                <div key={section.key} className="transition-all duration-300 ease-in-out">
                  <button
                    onClick={() => toggleSection(section.key)}
                    className="w-full flex justify-between items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    <span className="font-semibold text-gray-800">{section.title}</span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className={`h-5 w-5 text-blue-600 transform transition-transform ${
                        activeSection === section.key ? "rotate-180" : "rotate-0"
                      }`}
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  <div
                    className={`overflow-hidden transition-all duration-500 ease-in-out ${
                      activeSection === section.key ? "max-h-screen" : "max-h-0"
                    }`}
                  >
                    <ul className="p-4 space-y-2 text-gray-dark">
                      {section.content.map((item, index) => (
                        <li
                          key={index}
                          className="flex items-start space-x-2"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-6 w-5 flex-none text-blue-600"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                          <span className="leading-6">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-lg">
              <p className="text-yellow-800 text-sm">
                You can manage or deny permissions at any time in your app settings.
              </p>
            </div>

            {!isAccepted ? (
              <div className="mt-6 flex space-x-4">
                <button
                  onClick={handleAccept}
                  className="flex-1 bg-blue text-white py-3 rounded-lg hover:bg-blue-800 transition-colors"
                >
                  Accept Privacy Policy
                </button>
                <button className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-lg hover:bg-gray-light transition-colors">
                  Decline
                </button>
              </div>
            ) : (
              <div className="mt-6 bg-green-50 border-l-4 border-green p-4 rounded-lg text-green-dark text-center">
                Privacy Policy Accepted
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;
