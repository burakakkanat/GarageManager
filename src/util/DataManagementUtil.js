import AsyncStorage from '@react-native-async-storage/async-storage';
import util from '../util/Util';

const dataManagementUtil = {

  // Last executed: 28.02.2023 15:55
  // garageObjects have objects in vehicles and wishlist arrays
    backupData: async () => {
    const garages = await util.retrieveObject('@GarageObjectList');
    const vehicles = await util.retrieveObject('@VehicleObjectList');
    const wishlists = await util.retrieveObject('@WishlistObjectList');

    await util.saveObject('@GarageObjectListBackup', garages);
    await util.saveObject('@VehicleObjectListBackup', vehicles);
    await util.saveObject('@WishlistObjectListBackup', wishlists);
  },
  retreiveFromBackup: async () => {
    const garagesBackup = await util.retrieveObject('@GarageObjectListBackup');
    const vehiclesBackup = await util.retrieveObject('@VehicleObjectListBackup');
    const wishlistsBackup = await util.retrieveObject('@WishlistObjectListBackup');

    await util.saveObject('@GarageObjectList', garagesBackup);
    await util.saveObject('@VehicleObjectList', vehiclesBackup);
    await util.saveObject('@WishlistObjectList', wishlistsBackup);
  },
  refillGarageVehicles: async (garages) => {

    for (const go of garages) {
      go.vehicles = [];
    }

    const vehicles = await util.retrieveObject('@VehicleObjectList');

    const newGarageObjects = [...garages];

    for (const vehicle of vehicles) {
      const selectedGarageIndex = garages.findIndex(garageObj => garageObj.location === vehicle.garageLocation);
      const selectedGarageObject = { ...newGarageObjects[selectedGarageIndex] };
      selectedGarageObject.vehicles = [...selectedGarageObject.vehicles, vehicle.vehicleName].sort();
      newGarageObjects[selectedGarageIndex] = selectedGarageObject;
    }

    await util.saveObject('@GarageObjectList', newGarageObjects);
    setGarageObjects(newGarageObjects);
  },
  refillGarageWishlist: async (garages) => {

    for (const go of garages) {
      go.wishlist = [];
    }

    const wishlists = await util.retrieveObject('@WishlistObjectList');

    const newGarageObjects = [...garages];

    for (const wishlist of wishlists) {
      const selectedGarageIndex = garages.findIndex(garageObj => garageObj.theme === wishlist.garageTheme);
      const selectedGarageObject = { ...newGarageObjects[selectedGarageIndex] };
      selectedGarageObject.wishlist = [...selectedGarageObject.wishlist, wishlist].sort(util.compareWishlistItems);
      newGarageObjects[selectedGarageIndex] = selectedGarageObject;
    }

    await util.saveObject('@GarageObjectList', newGarageObjects);
    setGarageObjects(newGarageObjects);
  },
  wipeAllData: async () => {
    setGarageObjects([]);
    await util.saveObject('@GarageObjectList', []);
    setVehicleObjects([]);
    await util.saveObject('@VehicleObjectList', []);
    setWishlistObjects([]);
    await util.saveObject('@WishlistObjectList', []);
  }

}

export default dataManagementUtil;