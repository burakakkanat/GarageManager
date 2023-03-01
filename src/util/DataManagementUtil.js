import AsyncStorage from '@react-native-async-storage/async-storage';
import util from '../util/Util';

const dataManagementUtil = {

  // Last executed: 28.02.2023 15:55
  // garageObjects have objects in vehicles and wishlist arrays
    backupData: async () => {
    const garages = await util.retrieveObject('@GarageObjectList');

    await util.saveObject('@GarageObjectListBackup', garages);
  },
  retreiveFromBackup: async () => {
    const garagesBackup = await util.retrieveObject('@GarageObjectListBackup');

    await util.saveObject('@GarageObjectList', garagesBackup);
  },
  clearAllData: async () => {
    await util.saveObject('@GarageObjectList', []);
  },
  deleteAllData: async () => {
    await AsyncStorage.removeItem('@GarageObjectList');
  }

}

export default dataManagementUtil;