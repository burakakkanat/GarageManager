import React, { useContext, useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import { Picker } from '@react-native-picker/picker';
import { GarageContext } from '../Context/GarageContext';
import { VehicleContext } from '../Context/VehicleContext';

const Vehicles = () => {

  const { garageObjects, setGarageObjects } = useContext(GarageContext);
  const { vehicleNames, setVehicleNames } = useContext(VehicleContext);

  const [newVehicleName, setNewVehicleName] = useState('');
  const [selectedGarage, setSelectedGarage] = useState({});

  useEffect(() => {
    // Get the list of garage names from local storage
    const getGarageObjects = async () => {
      const garages = await retrieveObject('@GarageObjectList');
      setGarageObjects(garages);
    };

    // Get the list of all vehicles in all garages from local storage
    const getVehicles = async () => {
      const vehicles = [];
      for (const garageObject of garageObjects) {
        for (const garageVehicle of garageObject.vehicles) {
          const newVehicle = garageObject.name + '_' + garageVehicle;
          vehicles.push(newVehicle);
        }
      }
      vehicles.sort();
      setVehicleNames(vehicles);
    };

    getGarageObjects();
    getVehicles();
  }, []);

  const addNewVehicle = async () => {
    if (!newVehicleName) {
      Alert.alert('Add New Vehicle', "Vehicle name can not be empty.");
      return;
    }

    if (newVehicleName.includes('_')) {
      Alert.alert('Add New Vehicle', 'Vehicle name can not contain "_" character.');
      return;
    }

    try {

      const newGarageObjects = garageObjects.filter(function (garageObj) {
        return garageObj.name !== selectedGarage.name;
      });

      selectedGarage.vehicles.push(newVehicleName);
      selectedGarage.vehicles.sort();

      newGarageObjects.push(selectedGarage);
      newGarageObjects.sort(compareGarages)

      const allVehicles = vehicleNames;
      allVehicles.push(selectedGarage.name + '_' + newVehicleName);
      allVehicles.sort();

      await saveObject('@GarageObjectList', newGarageObjects);
      setGarageObjects(newGarageObjects);
      setVehicleNames(allVehicles);

      setNewVehicleName('');

    } catch (error) {
      console.error(error);
    }
  };

  const removeVehicle = async (vehicleNameWithGarageName) => {

    const garageNameEndIndex = vehicleNameWithGarageName.indexOf('_');
    const nameofTheGarage = vehicleNameWithGarageName.substr(0, garageNameEndIndex);
    const vehicleToRemove = vehicleNameWithGarageName.substr(garageNameEndIndex + 1);

    Alert.alert(
      'Remove Vehicle',
      'Are you sure you want to remove ' + vehicleToRemove + ' in ' + nameofTheGarage + '?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'OK',
          onPress: async () => {
            try {

              // Find the garage, remove the vehicle from found garage, set it to the found garage
              const garageObj = garageObjects.filter(function (garageObj) {
                return garageObj.name === nameofTheGarage;
              }).at(0);

              const updatedGarageVehicles = garageObj.vehicles.filter(e => e !== vehicleToRemove);
              garageObj.vehicles = updatedGarageVehicles;

              // Remove previous garage from garegeObjects and push new one into it
              const newGarageObjects = garageObjects.filter(function (garageObj) {
                return garageObj.name !== nameofTheGarage;
              });
              newGarageObjects.push(garageObj);
              newGarageObjects.sort(compareGarages);

              // Remove vehicle from all vehicles list
              const allVehicleNames = vehicleNames.filter(e => e !== vehicleNameWithGarageName);

              setGarageObjects(newGarageObjects);
              setVehicleNames(allVehicleNames);

            } catch (error) {
              console.error(error);
            }
          },
        },
      ],
      { cancelable: false }
    );
  };

  return (
    <View style={{ flex: 1 }}>
      <ScrollView>
        {vehicleNames.map((vehicleName) => (
          <View style={styles.vehicleListContainer}>
            <TouchableOpacity>
              <Text style={{ color: 'black', fontWeight: 'bold' }}>
                {vehicleName.substr(vehicleName.indexOf('_') + 1)}
              </Text>
            </TouchableOpacity>

            <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'flex-end' }}>
              <TouchableOpacity
                style={{ marginRight: 20 }}>
                <Text style={{ color: 'black', fontStyle: 'italic' }}>{'in ' + vehicleName.substr(0, vehicleName.indexOf('_'))}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => removeVehicle(vehicleName)}>
                <Text style={{ color: 'red' }}>Remove</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>

      <View style={styles.addNewVehicleContainer}>
        <TextInput
          style={styles.newVehicleName}
          onChangeText={text => setNewVehicleName(text)}
          value={newVehicleName}
          placeholder="Vehicle Name"
          placeholderTextColor="grey"
        />

        <Picker
          selectedValue={selectedGarage}
          style={styles.picketContainer}
          onValueChange={itemValue => setSelectedGarage(itemValue)}
          dropdownIconColor='black'
          prompt='Your Garages'>

          {garageObjects.map(garageObject => (
            <Picker.Item
              label={garageObject.name}
              value={garageObject}
              color='black'
            />
          ))}

        </Picker>
      </View>

      <TouchableOpacity
        onPress={addNewVehicle}
        style={styles.button}
      >
        <Text style={{ color: 'white' }}>Add New Vehicle</Text>
      </TouchableOpacity>
    </View>
  );
};

const retrieveData = async key => {
  try {
    const value = await AsyncStorage.getItem(key);
    if (value !== null) {
      return JSON.parse(value) || [];
    }
    return [];
  } catch (error) {
    console.error(error);
    return [];
  }
};

const saveObject = async (key, object) => {
  try {
    const stringifiedObject = JSON.stringify(object);
    await AsyncStorage.setItem(key, stringifiedObject);
  } catch (error) {
    console.error(error);
  }
};

const retrieveObject = async (key) => {
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
};

function compareGarages(a, b) {
  if (a.name < b.name) {
    return -1;
  }
  if (a.name > b.name) {
    return 1;
  }
  return 0;
}

const styles = StyleSheet.create({
  addNewVehicleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 10,
    borderTopWidth: 1,
    borderTopColor: '#ccc'
  },
  button: {
    padding: 10,
    backgroundColor: '#2D640F',
    alignItems: 'center',
    justifyContent: 'center',
    margin: 10
  },
  vehicleListContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc'
  },
  newVehicleName: {
    height: 40,
    borderColor: 'gray',
    color: 'black',
    borderWidth: 1,
    flex: 1,
    marginRight: 10
  },
  picketContainer: {
    height: 40,
    width: 200,
    dropdownIconColor: 'black'
  },
  textInput: {
    color: 'black',
    borderWidth: 0.5,
    margin: 10
  }
});

export default Vehicles;
