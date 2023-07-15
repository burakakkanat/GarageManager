import { firebase } from '@react-native-firebase/database';
import { Alert, ToastAndroid } from 'react-native';
import RNRestart from 'react-native-restart';
import util from '../util/Util';

const databaseReference = firebase
  .app()
  .database('https://johnny-on-the-spot-130a2-default-rtdb.europe-west1.firebasedatabase.app/')
  .ref('/me');

const dataManagementUtil = {

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

              databaseReference.set(garages)
                .then(() => {
                  ToastAndroid.showWithGravity(
                    'Backup successful.',
                    ToastAndroid.SHORT,
                    ToastAndroid.TOP, // Not working
                  );
                })
                .catch((error) => {
                  ToastAndroid.showWithGravity(
                    'Backup failed.',
                    ToastAndroid.SHORT,
                    ToastAndroid.TOP, // Not working
                  );
                });

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

              const snapshot = await databaseReference.once('value');
              const restoredGarageObjects = snapshot.val();

              const filledGarageObjects = restoredGarageObjects.map(garageObject => {

                const disposableVehicles = garageObject.hasOwnProperty('disposableVehicles') ? garageObject.disposableVehicles : [];
                const vehicles = garageObject.hasOwnProperty('vehicles') ? garageObject.vehicles : [];
                const wishlist = garageObject.hasOwnProperty('wishlist') ? garageObject.wishlist : [];

                return {
                  ...garageObject,
                  disposableVehicles,
                  vehicles,
                  wishlist
                };

              });

              await util.saveObject('@GarageObjectList', filledGarageObjects);

              ToastAndroid.showWithGravity(
                'Data restored.',
                ToastAndroid.SHORT,
                ToastAndroid.TOP, // Not working
              );

              RNRestart.restart();

            } catch (error) {

              ToastAndroid.showWithGravity(
                'Data restoration failed.',
                ToastAndroid.SHORT,
                ToastAndroid.TOP, // Not working
              );

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

              databaseReference.set(null)
              .then(() => {
                ToastAndroid.showWithGravity(
                  'All data cleared.',
                  ToastAndroid.SHORT,
                  ToastAndroid.TOP, // Not working
                );

                RNRestart.restart();
              })
              .catch((error) => {
                ToastAndroid.showWithGravity(
                  'Operation failed.',
                  ToastAndroid.SHORT,
                  ToastAndroid.TOP, // Not working
                );
              });

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