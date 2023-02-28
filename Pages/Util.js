import AsyncStorage from '@react-native-async-storage/async-storage';

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
    }
}

export default util;