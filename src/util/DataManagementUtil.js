import { firebase } from '@react-native-firebase/database';
import { Alert, ToastAndroid } from 'react-native';
import RNRestart from 'react-native-restart';
import uuid from 'react-native-uuid';
import util from '../util/Util';

async function getDatabaseRef(restore) {

  var storedBackupId = await util.retrieveObject('@BackupId');

  if (!storedBackupId || storedBackupId.length === 0) {
    if (restore) {
      ToastAndroid.showWithGravity(
        'Data restoration failed. Try restarting your app.',
        ToastAndroid.SHORT,
        ToastAndroid.TOP, // Not working
      );
    } else {
      storedBackupId = uuid.v1();
      await util.saveObject('@BackupId', storedBackupId);
    }
  }

  const databaseRefPath = '/userData/' + storedBackupId;
  const databaseRef = firebase
    .app()
    .database('https://johnny-on-the-spot-130a2-default-rtdb.europe-west1.firebasedatabase.app/')
    .ref(databaseRefPath);

  return databaseRef;
}

const dataManagementUtil = {

  backupData: async () => {

    try {
      const garages = await util.retrieveObject('@GarageObjectList');
      const databaseRef = await getDatabaseRef(false);

      databaseRef.set(garages)
        .then(() => {
          ToastAndroid.showWithGravity(
            'Backup successful',
            ToastAndroid.SHORT,
            ToastAndroid.TOP, // Not working
          );
        })
        .catch((error) => {
          ToastAndroid.showWithGravity(
            'Backup failed',
            ToastAndroid.SHORT,
            ToastAndroid.TOP, // Not working
          );
        });

    } catch (error) {
      console.error(error);
    }
  },
  restoreFromBackup: async () => {

    try {
      const databaseRef = await getDatabaseRef(true);
      const snapshot = await databaseRef.once('value');
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
        'Data restored',
        ToastAndroid.SHORT,
        ToastAndroid.TOP, // Not working
      );

      RNRestart.restart();

    } catch (error) {

      ToastAndroid.showWithGravity(
        'Data restoration failed',
        ToastAndroid.SHORT,
        ToastAndroid.TOP, // Not working
      );

      console.error(error);
    }
  },
  clearAllData: async () => {

    try {

      await util.saveObject('@GarageObjectList', []);
      const databaseRef = await getDatabaseRef(false);

      databaseRef.set(null)
        .then(() => {
          ToastAndroid.showWithGravity(
            'All data cleared',
            ToastAndroid.SHORT,
            ToastAndroid.TOP, // Not working
          );

          RNRestart.restart();
        })
        .catch((error) => {
          ToastAndroid.showWithGravity(
            'Operation failed',
            ToastAndroid.SHORT,
            ToastAndroid.TOP, // Not working
          );
        });

    } catch (error) {
      console.error(error);
    }
  },
}

export default dataManagementUtil;