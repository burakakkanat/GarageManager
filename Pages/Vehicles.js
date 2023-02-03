import React, { useContext, useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import { Picker } from '@react-native-picker/picker';
import { GarageContext } from '../Context/GarageContext';
import { VehicleContext } from '../Context/VehicleContext';

const Vehicles = () => {

  const { garageNames, setGarageNames } = useContext(GarageContext);
  const { vehicleNames, setVehicleNames } = useContext(VehicleContext);
  const [newVehicleName, setNewVehicleName] = useState('');
  const [selectedGarage, setSelectedGarage] = useState('');

  useEffect(() => {
    // Get the list of garage names from local storage
    const getGarageNames = async () => {
      const garageNames = await retrieveData('garageNames');
      setGarageNames(garageNames);
    };
    getGarageNames();
  }, []);

  useEffect(() => {
    // Get the list of all vehicles in all garages from local storage
    const getVehicles = async () => {
      const vehicles = [];
      for (const garageName of garageNames) {
        const garageVehicles = await retrieveData(`${garageName}_vehicles`);
        vehicles.push(...garageVehicles);
      }
      vehicles.sort();
      setVehicleNames(vehicles);
    };
    getVehicles();
  }, [garageNames]);

  const addNewVehicle = async () => {

    if (!newVehicleName) {
      Alert.alert('Add New Vehicle', "Vehicle name can not be empty.");
      return;
    }

    if (newVehicleName.includes(']')) {
      Alert.alert('Add New Vehicle', 'Vehicle name can not contain " ] " character.');
      return;
    }

    vehicleNameWithGarageName = '[' + selectedGarage + '] ' + newVehicleName;

    try {

      const garageVehicles = await retrieveData(`${selectedGarage}_vehicles`);
      const updatedGarageVehicles = [...garageVehicles, vehicleNameWithGarageName];
      await AsyncStorage.setItem(`${selectedGarage}_vehicles`, JSON.stringify(updatedGarageVehicles));

      const allVehicleNames = [];

      for (const garageName of garageNames) {
        const garageVehicles = await retrieveData(`${garageName}_vehicles`);
        allVehicleNames.push(...garageVehicles);
      }

      allVehicleNames.sort();
      setVehicleNames(allVehicleNames);

      setNewVehicleName('');

    } catch (error) {
      console.error(error);
    }
  };

  const removeVehicle = async (vehicleNameWithGarageName) => {

    const garageNameEndIndex = vehicleNameWithGarageName.indexOf(']');
    const nameofTheGarage = vehicleNameWithGarageName.substr(1, garageNameEndIndex - 1);
    const vehicleToRemove = vehicleNameWithGarageName.substr(garageNameEndIndex + 2);

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

              // Find and remove the vehicle from specific garage
              const garageVehicles = await retrieveData(`${nameofTheGarage}_vehicles`);
              const updatedGarageVehicles = garageVehicles.filter(e => e !== vehicleNameWithGarageName);

              await AsyncStorage.setItem(`${nameofTheGarage}_vehicles`, JSON.stringify(updatedGarageVehicles));

              // Update the vehicle list
              const allVehicleNames = [];

              for (const garageName of garageNames) {
                const garageVehicles = await retrieveData(`${garageName}_vehicles`);
                allVehicleNames.push(...garageVehicles);
              }

              allVehicleNames.sort();
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
        {vehicleNames.map((vehicleName, index) => (
          <View
            style={styles.vehicleListContainer}
          >

            <TouchableOpacity>
              <Text style={{ color: 'black', fontWeight: 'bold' }}>
                {vehicleName.substr(vehicleName.indexOf(']') + 2)}
              </Text>
            </TouchableOpacity>

            <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'flex-end' }}>
              <TouchableOpacity
                style={{ marginRight: 20 }}>
                <Text style={{ color: 'black', fontStyle: 'italic' }}>{'in ' + vehicleName.substr(1, vehicleName.indexOf(']') - 1)}</Text>
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

          {garageNames.map(name => (
            <Picker.Item label={name} value={name} color='black' />
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
