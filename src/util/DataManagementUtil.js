import AwesomeAlert from 'react-native-awesome-alerts';
import { Alert, ToastAndroid } from 'react-native';
import RNRestart from 'react-native-restart';
import util from '../util/Util';

const dataManagementUtil = {

  // Last executed: 28.02.2023 15:55
  // garageObjects have objects in vehicles and wishlist arrays
  backupData: async () => {

    Alert.alert(
      'Backup Data',
      'Are you sure you want to backup your current data?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'OK',
          onPress: async () => {
            try {

              const garages = await util.retrieveObject('@GarageObjectList');
              await util.saveObject('@GarageObjectListBackup', garages);

              ToastAndroid.showWithGravity(
                'Backup successful.',
                ToastAndroid.SHORT,
                ToastAndroid.TOP, // Not working
              );

            } catch (error) {
              console.error(error);
            }
          },
        },
      ],
      { cancelable: false }
    );
  },
  restoreFromBackup: async () => {

    Alert.alert(
      'Restore Data',
      'Are you sure you want to restore data from your latest backup?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'OK',
          onPress: async () => {
            try {

              const garagesBackup = await util.retrieveObject('@GarageObjectListBackup');
              await util.saveObject('@GarageObjectList', garagesBackup);

              ToastAndroid.showWithGravity(
                'Data restored.',
                ToastAndroid.SHORT,
                ToastAndroid.TOP, // Not working
              );

              RNRestart.restart();

            } catch (error) {
              console.error(error);
            }
          },
        },
      ],
      { cancelable: false }
    );
  },
  clearAllData: async () => {

    Alert.alert(
      'Delete All Data',
      'Are you sure you want to delete all your data?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'OK',
          onPress: async () => {
            try {

              await util.saveObject('@GarageObjectList', []);

              ToastAndroid.showWithGravity(
                'All data cleared.',
                ToastAndroid.SHORT,
                ToastAndroid.TOP, // Not working
              );

              RNRestart.restart();

            } catch (error) {
              console.error(error);
            }
          },
        },
      ],
      { cancelable: false }
    );

  },
}

export default dataManagementUtil;