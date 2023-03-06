
import AsyncStorage from '@react-native-async-storage/async-storage';
import { InAppBrowser } from 'react-native-inappbrowser-reborn';
import { Alert, Linking } from 'react-native';

const util = {
    saveObject: async (key, object) => {
        try {
            const stringifiedObject = JSON.stringify(object);
            await AsyncStorage.setItem(key, stringifiedObject);
        } catch (error) {
            console.error(error);
        }
    },
    retrieveObject: async (key) => {
        try {
            const stringifiedObject = await AsyncStorage.getItem(key);
            if (stringifiedObject !== null) {
                return JSON.parse(stringifiedObject);
            }
            return [];
        } catch (error) {
            console.error(error);
            return [];
        }
    },
    compareGarages: function (garageA, garageB) {

        if (garageA.location < garageB.location) {
            return -1;
        }
        if (garageA.location > garageB.location) {
            return 1;
        }

        return 0;
    },
    compareVehicles: function (vehicleA, vehicleB) {

        // First sort by garage locations
        if (vehicleA.garageLocation < vehicleB.garageLocation) {
            return -1;
        }
        if (vehicleA.garageLocation > vehicleB.garageLocation) {
            return 1;
        }

        // Then sort by vehicle names
        if (vehicleA.vehicleName < vehicleB.vehicleName) {
            return -1;
        }
        if (vehicleA.vehicleName > vehicleB.vehicleName) {
            return 1;
        }

        return 0;
    },
    compareWishlistItems: function (wishlistItemA, wishlistItemB) {

        // First sort by garage themes
        if (wishlistItemA.garageTheme < wishlistItemB.garageTheme) {
            return -1;
        }
        if (wishlistItemA.garageTheme > wishlistItemB.garageTheme) {
            return 1;
        }

        // Then sort by vehicle names
        if (wishlistItemA.vehicleName < wishlistItemB.vehicleName) {
            return -1;
        }
        if (wishlistItemA.vehicleName > wishlistItemB.vehicleName) {
            return 1;
        }

        return 0;
    },
    findGarageInsertionIndex: function (garageObjects, newGarageObject) {
        let low = 0;
        let high = garageObjects.length;
        while (low < high) {
            const mid = Math.floor((low + high) / 2);
            if (util.compareGarages(garageObjects[mid], newGarageObject) < 0) {
                low = mid + 1;
            } else {
                high = mid;
            }
        }
        return low;
    },
    findVehicleInsertionIndex: function (vehicleObjects, newVehicleObject) {
        let low = 0;
        let high = vehicleObjects.length;
        while (low < high) {
            const mid = Math.floor((low + high) / 2);
            if (util.compareVehicles(vehicleObjects[mid], newVehicleObject) < 0) {
                low = mid + 1;
            } else {
                high = mid;
            }
        }
        return low;
    },
    findWishlistInsertionIndex: function (wishlistObjects, newWishlistObject) {
        let low = 0;
        let high = wishlistObjects.length;
        while (low < high) {
            const mid = Math.floor((low + high) / 2);
            if (util.compareWishlistItems(wishlistObjects[mid], newWishlistObject) < 0) {
                low = mid + 1;
            } else {
                high = mid;
            }
        }
        return low;
    },
    getFontName: function () {
        return 'FOTNewRodin Pro M';
    },
    getBoldFontName: function () {
        return 'FOTNewRodin Pro B';
    },
    openVehicleFandomPage: async (vehicleName) => {
        try {

            const editedVehicleName = getEditedVehicleName(vehicleName);
            const url = 'https://gta.fandom.com/wiki/' + editedVehicleName;

            if (await InAppBrowser.isAvailable()) {
                await InAppBrowser.open(url, {
                    enableDefaultShare: false,
                    enableUrlBarHiding: true,
                    forceCloseOnRedirection: false,
                    navigationBarColor: 'black',
                    navigationBarDividerColor: 'white',
                    secondaryToolbarColor: 'black',
                    showInRecents: false,
                    showTitle: true,
                    toolbarColor: '#2D640F'
                })
            } else {
                Linking.openURL(url)
            }
        } catch (error) {
            Alert.alert(error.message)
        }
    }
}

function getEditedVehicleName(vehicleName) {
    if (vehicleName === 'Stromberg') {
        return 'Stromberg_(car)';
    } else if (vehicleName === 'Dukes') {
        return 'Dukes_(car)';
    } else {
        return vehicleName.replaceAll(' ', '_');
    }
}

export default util;