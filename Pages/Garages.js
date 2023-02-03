import React, { useContext, useEffect, useState } from 'react';
import { Alert, Modal, ScrollView, Text, TextInput, TouchableOpacity, StyleSheet, View } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import { GarageContext } from '../Context/GarageContext';
import { VehicleContext } from '../Context/VehicleContext';

const Garages = () => {

  const { garageNames, setGarageNames } = useContext(GarageContext);
  const { vehicleNames, setVehicleNames } = useContext(VehicleContext);
  const [garageVehicleNames, setGarageVehicleNames] = useState([]);
  const [newGarageName, setNewGarageName] = useState("");
  const [lastEditedGarageName, setLastEditedGarageName] = useState("");
  const [lastSelectedGarageName, setLastSelectedGarageName] = useState("");
  const [lastSelectedGarageIndex, setLastSelectedGarageIndex] = useState("");

  // Modals
  const [addGarageModalVisible, setAddGarageModalVisible] = useState(false);
  const [editGarageModalVisible, setEditGarageModalVisible] = useState(false);
  const [showVehiclesModalVisible, setShowVehiclesModalVisible] = useState(false);

  useEffect(() => {
    // Get the list of garage names from local storage
    const getGarageNames = async () => {
      const names = await retrieveData('garageNames');
      setGarageNames(names);
    };
    getGarageNames();
  }, []);

  const addGarage = async () => {
    setAddGarageModalVisible(false);
    setNewGarageName('');
    garageNames.push(newGarageName);
    garageNames.sort();
    setGarageNames([...garageNames]);
    await AsyncStorage.setItem('garageNames', JSON.stringify(garageNames));
  };

  const openEditGarageWindow = async (index, garageName) => {
    setLastSelectedGarageIndex(index);
    setLastSelectedGarageName(garageName);
    setEditGarageModalVisible(true);
  };

  const editGarage = async () => {

    try {

      setEditGarageModalVisible(false);

      // Remove old garageName, add new garageName, save to local storage
      const newGarageNames = garageNames.filter((_, i) => i !== lastSelectedGarageIndex);
      newGarageNames.push(lastEditedGarageName);
      newGarageNames.sort();
      await AsyncStorage.setItem('garageNames', JSON.stringify(newGarageNames));

      // Get the vehicles in the garage to be edited and remove from the old garage name
      const vehicleNamesInEditedGarage = await retrieveData(`${lastSelectedGarageName}_vehicles`);
      await AsyncStorage.removeItem(`${lastSelectedGarageName}_vehicles`);

      // Set vehicles to the new garage
      const newVehicleNames = vehicleNames.filter(function (vehicleName) {
        return !vehicleNamesInEditedGarage.includes(vehicleName)
      });

      const newlyAddedVehicles = [];

      for (const vehicle of vehicleNamesInEditedGarage) {
        const newVehicleName = '[' + lastEditedGarageName + '] ' + vehicle.substr(vehicle.indexOf(']') + 2);
        newVehicleNames.push(newVehicleName);
        newlyAddedVehicles.push(newVehicleName);
      }

      newVehicleNames.sort();
      newlyAddedVehicles.sort();

      await AsyncStorage.setItem(`${lastEditedGarageName}_vehicles`, JSON.stringify(newlyAddedVehicles));
      setLastEditedGarageName('');

      // Update the contexts
      setGarageNames([...newGarageNames]);
      setVehicleNames([...newVehicleNames]);

    } catch (error) {
      console.error(error);
    }
  };

  const removeGarage = async (index, garageName) => {
    Alert.alert(
      'Remove Garage',
      'Are you sure you want to remove ' + garageName + '?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'OK',
          onPress: async () => {
            try {
              const newGarageNames = garageNames.filter((_, i) => i !== index);
              setGarageNames(newGarageNames);
              await AsyncStorage.setItem('garageNames', JSON.stringify(newGarageNames));

              const emptyGarageVehicles = [];
              await AsyncStorage.setItem(`${garageName}_vehicles`, JSON.stringify(emptyGarageVehicles));
            } catch (error) {
              console.error(error);
            }
          },
        },
      ],
      { cancelable: false }
    );
  };

  const showVehicleList = async (garageName) => {
    setLastSelectedGarageName(garageName);
    // Get the list of vehicles for the selected garage from local storage
    const vehicleNames = await retrieveData(`${garageName}_vehicles`);
    setGarageVehicleNames(vehicleNames);
    setShowVehiclesModalVisible(true);
  };

  return (
    <View style={{ flex: 1 }}>
      <ScrollView>
        {garageNames.map((garageName, index) => (
          <View
            style={styles.garageListContainer}
          >
            <TouchableOpacity onPress={() => showVehicleList(garageName)}>
              <Text style={{ color: 'black', fontWeight: 'bold' }}>{garageName}</Text>
            </TouchableOpacity>

            <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'flex-end' }}>
              <TouchableOpacity onPress={() => openEditGarageWindow(index, garageName)} style={{ marginRight: 20 }}>
                <Text style={{ color: 'blue' }}>Edit</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => removeGarage(index, garageName)}>
                <Text style={{ color: 'red' }}>Remove</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>

      <TouchableOpacity
        onPress={() => setAddGarageModalVisible(true)}
        style={styles.button}
      >
        <Text style={{ color: "white" }}>Add New Garage</Text>
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={false}
        visible={addGarageModalVisible}
        onRequestClose={() => {
          setAddGarageModalVisible(false);
        }}
      >
        <View style={{ backgroundColor: '#2D640F', justifyContent: 'center', height: 50 }}>
          <Text style={styles.header}>Add New Garage</Text>
        </View>

        <View style={{ marginTop: 10 }}>
          <View>
            <TextInput
              value={newGarageName}
              onChangeText={setNewGarageName}
              placeholder="Garage Name"
              placeholderTextColor="grey"
              style={styles.textInput}
            />

            <TouchableOpacity
              onPress={addGarage}
              style={styles.button}
            >
              <Text style={{ color: 'white' }}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        animationType="slide"
        transparent={false}
        visible={editGarageModalVisible}
        onRequestClose={() => {
          setEditGarageModalVisible(false);
        }}
      >
        <View style={{ backgroundColor: '#2D640F', justifyContent: 'center', height: 50 }}>
          <Text style={styles.header}>Edit Garage</Text>
        </View>

        <View style={{ marginTop: 10 }}>
          <View>
            <TextInput
              value={lastEditedGarageName}
              onChangeText={setLastEditedGarageName}
              placeholder="New Garage Name"
              placeholderTextColor="grey"
              style={styles.textInput}
            />

            <TouchableOpacity
              onPress={editGarage}
              style={styles.button}>

              <Text style={{ color: 'white' }}>Save</Text>

            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        animationType="fade"
        transparent={false}
        visible={showVehiclesModalVisible}
        onRequestClose={() => {
          setShowVehiclesModalVisible(false);
        }}
      >
        <View style={{ backgroundColor: '#2D640F', justifyContent: 'center', height: 50 }}>
          <Text style={styles.header}>Vehicles in {lastSelectedGarageName}</Text>
        </View>

        <View style={{ marginTop: 10 }}>
          <View>
            <ScrollView>{garageVehicleNames.map((vehicleName, index) => (
              <View
                style={styles.vehicleListContainer}
              >
                <TouchableOpacity>
                  <Text style={{ color: 'black' }}>{vehicleName}</Text>
                </TouchableOpacity>
              </View>
            ))}
            </ScrollView>

            <TouchableOpacity
              onPress={() => setShowVehiclesModalVisible(false)}
              style={styles.button}
            >
              <Text style={{ color: 'white' }}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const retrieveData = async (key) => {
  try {
    const value = await AsyncStorage.getItem(key);
    if (value !== null) {
      return JSON.parse(value);
    }
    return [];
  } catch (error) {
    console.error(error);
    return [];
  }
};

const styles = StyleSheet.create({
  button: {
    padding: 10,
    backgroundColor: '#2D640F',
    alignItems: 'center',
    justifyContent: 'center',
    margin: 10
  },
  garageContainer: {
    backgroundColor: "#ddd",
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
  },
  garageListContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc'
  },
  vehicleListContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc'
  },
  header: {
    fontWeight: 'bold',
    fontSize: 20,
    padding: 10,
    color: 'white'
  },
  textInput: {
    color: 'black',
    borderWidth: 0.5,
    margin: 10
  }
});

export default Garages;
