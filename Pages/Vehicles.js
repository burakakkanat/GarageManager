
import { Alert, ScrollView, Text, TextInput, TouchableOpacity, View, } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import React, { useContext, useEffect, useState } from 'react';
import { VehicleContext } from '../Context/VehicleContext';
import { GarageContext } from '../Context/GarageContext';
import { Picker } from '@react-native-picker/picker';
import styles from './Styles';

const Vehicles = () => {

  const { garageObjects, setGarageObjects } = useContext(GarageContext);
  const { vehicleObjects, setVehicleObjects } = useContext(VehicleContext);

  const [vehicleObject, setVehicleObject] = useState({
    vehicleName: '',
    garageLocation: ''
  });

  useEffect(() => {
    // Get the list of garage names from local storage
    const getGarageObjects = async () => {
      const garages = await retrieveObject('@GarageObjectList');
      setGarageObjects(garages);
    };
    getGarageObjects();
  }, []);

  useEffect(() => {
    // Get the list of all vehicles in all garages from local storage
    const getVehicles = async () => {
      const vehicles = await retrieveObject('@VehicleObjectList');
      setVehicleObjects(vehicles);
    };
    getVehicles();
  }, []);

  const addNewVehicle = async () => {
    if (!vehicleObject.vehicleName.trim()) {
      Alert.alert('Add New Vehicle', "Vehicle name can not be empty.");
      return;
    }

    if (vehicleObject.vehicleName.includes('_')) {
      Alert.alert('Add New Vehicle', 'Vehicle name can not contain "_" character.');
      return;
    }

    try {
    
      const selectedGarageIndex = garageObjects.findIndex(garageObj => garageObj.location === vehicleObject.garageLocation);
    
      const newGarageObjects = [...garageObjects];
      const selectedGarageObject = { ...newGarageObjects[selectedGarageIndex] };

      selectedGarageObject.vehicles = [...selectedGarageObject.vehicles, vehicleObject.vehicleName];
      newGarageObjects[selectedGarageIndex] = selectedGarageObject;
      newGarageObjects.sort(compareGarages);
    
      setGarageObjects(newGarageObjects);
      await saveObject('@GarageObjectList', newGarageObjects);
    
      const newVehicleObjects = [...vehicleObjects, vehicleObject];
      newVehicleObjects.sort(compareVehicles);
      setVehicleObjects(newVehicleObjects);
      await saveObject('@VehicleObjectList', newVehicleObjects);
    
      setVehicleObject({ ...vehicleObject, vehicleName: '' });

    } catch (error) {
      console.error(error);
    }
    
  };

  const removeVehicle = async (vehicleObjectToRemove) => {

    Alert.alert(
      'Remove Vehicle',
      'Are you sure you want to remove ' + vehicleObjectToRemove.vehicleName + ' in ' + vehicleObjectToRemove.garageLocation + '?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'OK',
          onPress: async () => {
            try {

              /*
              * Updating the garage of which the vehicle is removed from
              */

              // Find the garage, 
              const garageObject = Object.assign({}, garageObjects.filter(function (garageObj) {
                return garageObj.location === vehicleObjectToRemove.garageLocation;
              }).at(0));

              // Remove the vehicle from garage's vehicle list
              // We use index so that we remove only the first occurance
              const vehicleIndex = garageObject.vehicles.findIndex(vehicle => vehicle === vehicleObjectToRemove.vehicleName);
              const newVehicleList = garageObject.vehicles.filter((_, index) => index !== vehicleIndex);
              garageObject.vehicles = newVehicleList;

              // Remove the garage from garegeObjects and push new one into it
              const newGarageObjects = garageObjects.filter(function (garageObj) {
                return garageObj.location !== vehicleObjectToRemove.garageLocation;
              });

              newGarageObjects.push(garageObject);
              newGarageObjects.sort(compareGarages);

              await saveObject('@GarageObjectList', newGarageObjects);
              setGarageObjects(newGarageObjects);

              /*
              * Updating the vehicleObjects
              */

              // We use index so that we remove only the first occurance
              const vehicleObjectIndex = vehicleObjects.findIndex(vehicleObj =>
                vehicleObj.garageLocation === vehicleObjectToRemove.garageLocation &&
                vehicleObj.vehicleName === vehicleObjectToRemove.vehicleName
              );
              const newVehicleObjects = vehicleObjects.filter((_, index) => index !== vehicleObjectIndex);
              await saveObject('@VehicleObjectList', newVehicleObjects);
              setVehicleObjects(newVehicleObjects);

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

        <View style={styles.separatorTop} />

        {vehicleObjects.map((currentVehicleObject, index) => (
          <View key={index} style={styles.containerForLists}>
            <TouchableOpacity>
              <Text style={{ color: 'black', fontWeight: 'bold' }}>
                {currentVehicleObject.vehicleName}
              </Text>
            </TouchableOpacity>

            <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'flex-end' }}>
              <TouchableOpacity
                style={{ marginRight: 20 }}>
                <Text style={{ color: 'black', fontStyle: 'italic' }}>{'in ' + currentVehicleObject.garageLocation}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => removeVehicle(currentVehicleObject)}>
                <Text style={{ color: 'red' }}>Remove</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>

      <View style={styles.containerAddNewVehicle}>
        <TextInput
          value={vehicleObject.vehicleName}
          onChangeText={text => setVehicleObject({ ...vehicleObject, vehicleName: text })}
          style={styles.newVehicleName}
          placeholder="Vehicle Name"
          placeholderTextColor="grey"
        />

        <Picker
          selectedValue={vehicleObject.garageLocation}
          onValueChange={text => setVehicleObject({ ...vehicleObject, garageLocation: text })}
          style={styles.containerPicker}
          dropdownIconColor='black'
          prompt='Your Garages'>

          {garageObjects.map((garageObject, index) => (
            <Picker.Item
              key={index}
              label={garageObject.location}
              value={garageObject.location}
              color='black'
            />
          ))}

        </Picker>
      </View>

      <TouchableOpacity
        onPress={addNewVehicle}
        style={styles.buttonGreen}
      >
        <Text style={{ color: 'white' }}>Add New Vehicle</Text>
      </TouchableOpacity>
    </View>
  );
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

function compareGarages(garageA, garageB) {
  if (garageA.location < garageB.location) {
    return -1;
  }
  if (garageA.location > garageB.location) {
    return 1;
  }
  return 0;
}

function compareVehicles(vehicleA, vehicleB) {
  if (vehicleA.garageLocation < vehicleB.garageLocation) {
    return -1;
  }
  if (vehicleA.garageLocation > vehicleB.garageLocation) {
    return 1;
  }
  return 0;
}

export default Vehicles;
