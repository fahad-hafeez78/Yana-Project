import React, { useState, useEffect } from "react";

const RidersPrivacyPolicy = () => {
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
                'Login Credentials: To securely access the App, riders are required to log in using a username and password provided by YANA Meals. These credentials are used to authenticate your identity and maintain account security.',
                'Location Data: We collect real-time location data from your device to track deliveries, optimize routes, and ensure timely meal delivery. Location tracking is active only during delivery operations and is essential for the core functionality of the App.',
                'Profile Information: You may upload or change your profile picture. No other personal profile information is editable by users.',
                'Order Management: Riders can view, change, or cancel the delivery status of assigned orders.'
            ]
        },
        {
            key: 'PermissionsRequired',
            title: 'Permissions Required',
            content: [
                'To function effectively, the App may request the following device permissions:',
                'Camera: To capture and upload images (e.g., proof of delivery).',
                'Gallery/Storage: To upload existing photos from your device for delivery confirmation or profile updates.',
                'Location: With your explicit permission, we collect real-time location data.',
            ]
        },
        // {
        //   key: 'permissions',
        //   title: 'Permissions',
        //   content: [
        //     'Camera Permission: To allow you to take and upload images directly within the app.',
        //     'Gallery Permission: To enable uploading images from your device\'s storage.',
        //     'Location Permission: To access your current location for autofilling your address. This feature is designed to simplify the process for users, especially those over 60, by reducing manual entry.'
        //   ]
        // },
        {
            key: 'thirdParty',
            title: 'Third-Party Services',
            content: [
                'We use trusted third-party services to enhance the App’s functionality:',
                'Firebase: For real-time data syncing, push notifications, and app performance monitoring.',
                'Google Maps: For navigation and route optimization.',
                'These services may collect data as governed by their own privacy policies.',

            ]
        },
        {
            key: 'dataSecurity',
            title: 'Data Use and Sharing',
            content: [
                'We use the information we collect to:',
                'Provide and maintain App functionality',
                'Monitor delivery performance',
                'Comply with legal obligations',
                'We do not sell or rent your personal data to third parties.',
            ]
        },
        {
            key: 'accountDeletion',
            title: 'Account Deletion',
            content: [
                'If you wish to delete your account, you may submit a deletion request through the App. Upon verification, we will permanently delete your account and associated data, except for data we are legally required to retain.'
            ]
        },
        {
            key: 'payment',
            title: 'Payments',
            content: [
                'The YANA Meals Rider App does not process or store any payment information. All payment processes are handled externally and independently of this App.'
            ]
        },
        {
            key: 'DataSecurity',
            title: 'Data Security',
            content: [
                'We implement administrative, technical, and physical safeguards to protect your information from unauthorized access, use, or disclosure. However, no mobile application can guarantee absolute security.',
                'We use OAuth Tokens for secure user authentication and session management.',
                'We have a secure database to protect our users` information.'
            ]
        },
        {
            key: 'ChangestoThisPrivacyPolicy',
            title: 'Changes to This Privacy Policy',
            content: [
                'We may update this Privacy Policy from time to time. When we do:',
                'The new version will be posted within the App.',
                'The "Effective Date" at the top will be updated.',
                'We encourage you to review this policy regularly to stay informed.',
            ]
        },
        
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
                className={`fixed top-0 left-0 right-0 z-20 transition-all duration-300 ${isScrolled ? "bg-white shadow-md py-4" : "bg-transparent py-6"
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
                            Last Updated: June 19, 2025
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
                                            className={`h-5 w-5 text-blue-600 transform transition-transform ${activeSection === section.key ? "rotate-180" : "rotate-0"
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
                                        className={`overflow-hidden transition-all duration-500 ease-in-out ${activeSection === section.key ? "max-h-screen" : "max-h-0"
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

export default RidersPrivacyPolicy;
