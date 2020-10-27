import Pusher from 'pusher-js/react-native';
import Constants from 'expo-constants';

// Pusher.logToConsole = true;

const pusher = new Pusher(Constants.manifest.extra.PUSHER_KEY, {
  cluster: Constants.manifest.extra.PUSHER_CLUSTER,
});

export default pusher;
