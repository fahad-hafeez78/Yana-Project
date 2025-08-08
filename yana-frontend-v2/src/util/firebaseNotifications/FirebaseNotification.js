import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { showPushNotification } from '../../redux/actions/alertActions';
import { onMessageListener } from '../../config/firebase';

const FirebaseNotification = () => {

  const dispatch = useDispatch();

  useEffect(() => {

    let unsubscribe;
    const setupNotifications = async () => {

      try {
        unsubscribe = onMessageListener((payload) => {
          console.log('Foreground message received:', payload);

          if (payload.notification) {
            dispatch(showPushNotification({
              title: payload.notification.title,
              message: payload.notification.body
            }));
          }
        });

      } catch (error) {
        console.error('Notification setup error:', error);
      }

    };

    setupNotifications();

    return () => {

      if (unsubscribe) unsubscribe();

    };

  }, [dispatch]);

  return null;

};

export default FirebaseNotification;