import { getMessaging, getToken, onMessage } from "firebase/messaging";

import { initializeApp } from 'firebase/app';
var firebaseConfig = {
  apiKey: import.meta.env.VITE_APIKEY,
  authDomain: import.meta.env.VITE_AUTHDOMAIN,
  projectId: import.meta.env.VITE_PROJECTID,
  storageBucket: import.meta.env.VITE_STORAGEBUCKET,
  messagingSenderId: import.meta.env.VITE_MESSAGINGSENDERID,
  appId: import.meta.env.VITE_APPID,
  measurementId: import.meta.env.VITE_MEASUREMENTID
};

const firebaseApp = initializeApp(firebaseConfig);
const messaging = getMessaging(firebaseApp);
export const requestForToken = async () => {
  try {
    const currentToken = await getToken(messaging, {
      vapidKey: import.meta.env.VITE_VAPIDKEY
    });

    if (currentToken) {
      console.log('current token for client: ', currentToken);
      return currentToken; // Return the token for the component to handle
    } else {
      console.log('No registration token available');
      return null;
    }
  } catch (err) {
    console.log('Error retrieving token: ', err);
    throw err; // Re-throw to handle in component
  }
};

export const onMessageListener = (callback) => {
  const unsubscribe = onMessage(messaging, (payload) => {
    console.log('New FCM message received');
    callback(payload);
  });
  return () => unsubscribe(); // Return cleanup function
};
