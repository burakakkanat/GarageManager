import React, { useContext, useEffect, useState } from 'react';
import { Alert, Button, Modal, ScrollView, Text, TextInput, TouchableOpacity, StyleSheet, View } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import { VehicleContext } from '../Context/VehicleContext';
import { useFocusEffect } from '@react-navigation/native';
import { GarageContext } from '../Context/GarageContext';

const Garages = () => {

  const { garageObjects, setGarageObjects } = useContext(GarageContext);
  const { vehicleNames, setVehicleNames } = useContext(VehicleContext);

  const [garageVehicleNames, setGarageVehicleNames] = useState([]);             // Used for displaying cars in a garage.
  const [garageObjectIndex, setGarageObjectIndex] = useState("");               // Used when removing the previous car when editing garage.
  const [garageObjectVehicles, setGarageObjectVehicles] = useState("");         // Used for transfering vehicles when editing garage.
  const [lastSelectedGarageObject, setLastSelectedGarageObject] = useState(""); // Used when showing "Cars in (garage)" header.

  // Modals
  const [addGarageModalVisible, setAddGarageModalVisible] = useState(false);
  const [editGarageModalVisible, setEditGarageModalVisible] = useState(false);
  const [showGarageDetailsVisible, setShowGarageDetailsVisible] = useState(false);

  const [garageObject, setGarageObject] = useState({
    name: '',
    location: '',
    availableSpace: '0',
    disposableVehicles: [],
    vehicles: [],
  });

  useEffect(() => {
    // Get the list of garage names from local storage
    const getGarageObjects = async () => {
      const garages = await retrieveObject('@GarageObjectList');
      setGarageObjects(garages);
    };
    getGarageObjects();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      setGarageObject({ ...garageObject, name: '', location: '', availableSpace: '0', disposableVehicles: [], vehicles: [] });
    }, [])
  );

  const openAddNewGarageWindow = async () => {
    setGarageObject({ ...garageObject, name: '', location: '', availableSpace: '0', disposableVehicles: [] });
    setAddGarageModalVisible(true);
  };

  const addGarageObject = async () => {

    garageObjects.push(garageObject);
    garageObjects.sort(compareGarages);
    setGarageObjects([...garageObjects]);

    setGarageObject({ ...garageObject, name: '', location: '', availableSpace: '0', disposableVehicles: [] });
    await saveObject('@GarageObjectList', garageObjects);
    setAddGarageModalVisible(false);
  };

  const openEditGarageWindow = async (index, garageObj) => {
    setGarageObject(garageObj);
    setGarageObjectIndex(index);
    setGarageObjectVehicles(garageObj.vehicles);
    setEditGarageModalVisible(true);
  };

  const editGarageObject = async () => {

    try {

      setEditGarageModalVisible(false);

      garageObject.vehicles = garageObjectVehicles;

      // Remove old garageObject, add new garageObject, sort
      const newGarageObjects = garageObjects.filter((_, i) => i !== garageObjectIndex);
      newGarageObjects.push(garageObject);
      newGarageObjects.sort(compareGarages);

      // Set the new garageObjects to local
      await saveObject('@GarageObjectList', newGarageObjects);

      // Set new vehicles list for Vehicles page
      updateAllVehicles(newGarageObjects);

      // Set states
      setGarageObjects(newGarageObjects);

      setGarageObject({ ...garageObject, name: '', location: '', availableSpace: '0', disposableVehicles: [] });

    } catch (error) {
      console.error(error);
    }
  };

  const removeGarageObject = async (index, garageObj) => {

    Alert.alert(
      'Remove Garage',
      'Are you sure you want to remove ' + garageObj.name + '?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'OK',
          onPress: async () => {
            try {
              const newGarageObjects = garageObjects.filter((_, i) => i !== index);
              setGarageObjects(newGarageObjects);
              await saveObject('@GarageObjectList', newGarageObjects);

              // Set new vehicles list for Vehicles page
              updateAllVehicles(newGarageObjects);

            } catch (error) {
              console.error(error);
            }
          },
        },
      ],
      { cancelable: false }
    );
  };

  const showGarageDetails = async (garageObj) => {
    setLastSelectedGarageObject(garageObj);
    setShowGarageDetailsVisible(true);
  };

  const updateAllVehicles = (newGarageObjects) => {
    const vehicles = [];
    for (const garageObject of newGarageObjects) {
      for (const garageVehicle of garageObject.vehicles) {
        const newVehicle = garageObject.name + '_' + garageVehicle;
        vehicles.push(newVehicle);
      }
    }
    vehicles.sort();
    setVehicleNames(vehicles);
  }

  return (
    <View style={{ flex: 1 }}>
      <ScrollView>
        {garageObjects.map((currentGarageObject, index) => (
          <View
            style={styles.garageListContainer}
          >
            <TouchableOpacity onPress={() => showGarageDetails(currentGarageObject)}>
              <Text style={{ color: 'black', fontWeight: 'bold' }}>{currentGarageObject.name}</Text>
            </TouchableOpacity>

            <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'flex-end' }}>
              <TouchableOpacity onPress={() => openEditGarageWindow(index, currentGarageObject)} style={{ marginRight: 20 }}>
                <Text style={{ color: 'blue' }}>Edit</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => removeGarageObject(index, currentGarageObject)}>
                <Text style={{ color: 'red' }}>Remove</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>

      <TouchableOpacity
        onPress={openAddNewGarageWindow}
        style={styles.greenButton}>
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

        <View style={{ flex: 1, flexDirection: 'column' }}>
          <View>

            <View style={styles.separator} />
            <Text style={{ color: 'grey', margin: 10 }}>{'Garage Details:'}</Text>

            <TextInput
              value={garageObject.name}
              onChangeText={text => setGarageObject({ ...garageObject, name: text })}
              placeholder="Garage Name"
              placeholderTextColor="grey"
              style={styles.textInput}
            />

            <TextInput
              value={garageObject.location}
              onChangeText={text => setGarageObject({ ...garageObject, location: text })}
              placeholder="Garage Location"
              placeholderTextColor="grey"
              style={styles.textInput}
            />

            <TextInput
              value={garageObject.availableSpace}
              onChangeText={text => setGarageObject({ ...garageObject, availableSpace: text })}
              keyboardType='number-pad'
              placeholder="Available Space"
              placeholderTextColor="grey"
              style={styles.textInput}
            />

            <View style={styles.separator} />
            <Text style={{ color: 'grey', margin: 10 }}>{'Disposable Vehicles:'}</Text>

            {garageObject.disposableVehicles.map((disposableVehicle, index) => (
              <TextInput
                key={index}
                value={disposableVehicle}
                style={styles.textInput}
                placeholder="Disposable Vehicle"
                placeholderTextColor="grey"
                onChangeText={text => {
                  const newDisposableVehicles = [...garageObject.disposableVehicles];
                  newDisposableVehicles[index] = text;
                  setGarageObject({ ...garageObject, disposableVehicles: newDisposableVehicles });
                }}
              />
            ))}

            <TouchableOpacity
              style={styles.blueButton}
              onPress={() => setGarageObject({ ...garageObject, disposableVehicles: [...garageObject.disposableVehicles, ''] })}>

              <Text style={{ color: 'white' }}>Add Disposable Vehicle</Text>

            </TouchableOpacity>
          </View>

          <View style={{ flex: 1, flexDirection: 'column', justifyContent: 'flex-end' }}>
            <TouchableOpacity
              style={styles.greenButton}
              onPress={addGarageObject}>

              <Text style={{ color: 'white' }}>Add</Text>

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

        <View style={{ flex: 1, flexDirection: 'column' }}>
          <View>

            <View style={styles.separator} />
            <Text style={{ color: 'grey', margin: 10 }}>{'Garage Details:'}</Text>

            <TextInput
              value={garageObject.name}
              onChangeText={text => setGarageObject({ ...garageObject, name: text })}
              placeholder="New Garage Name"
              placeholderTextColor="grey"
              style={styles.textInput}
            />

            <TextInput
              value={garageObject.location}
              onChangeText={text => setGarageObject({ ...garageObject, location: text })}
              placeholder="New Garage Location"
              placeholderTextColor="grey"
              style={styles.textInput}
            />

            <TextInput
              value={garageObject.availableSpace}
              onChangeText={text => setGarageObject({ ...garageObject, availableSpace: text })}
              keyboardType='number-pad'
              placeholder="New Available Space"
              placeholderTextColor="grey"
              style={styles.textInput}
            />

            <View style={styles.separator} />
            <Text style={{ color: 'grey', margin: 10 }}>{'Disposable Vehicles:'}</Text>

            {garageObject.disposableVehicles.map((disposableVehicle, index) => (
              <TextInput
                key={index}
                value={disposableVehicle}
                style={styles.textInput}
                placeholder="New Disposable Vehicle"
                placeholderTextColor="grey"
                onChangeText={text => {
                  const newDisposableVehicles = [...garageObject.disposableVehicles];
                  newDisposableVehicles[index] = text;
                  setGarageObject({ ...garageObject, disposableVehicles: newDisposableVehicles });
                }}
              />
            ))}

            <TouchableOpacity
              style={styles.blueButton}
              onPress={() => setGarageObject({ ...garageObject, disposableVehicles: [...garageObject.disposableVehicles, ''] })}>
              <Text style={{ color: 'white' }}>Add Disposable Vehicle</Text>
            </TouchableOpacity>
          </View>

          <View style={{ flex: 1, flexDirection: 'column', justifyContent: 'flex-end' }}>
            <TouchableOpacity
              style={styles.greenButton}
              onPress={editGarageObject}>
              <Text style={{ color: 'white' }}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        animationType="fade"
        transparent={false}
        visible={showGarageDetailsVisible}
        onRequestClose={() => {
          setShowGarageDetailsVisible(false);
        }}
      >
        <View style={{ backgroundColor: '#2D640F', justifyContent: 'center', height: 50 }}>
          <Text style={styles.header}>Vehicles in {lastSelectedGarageObject.name}</Text>
        </View>

        <View style={{ marginTop: 10 }}>
          <View>
            <ScrollView>{lastSelectedGarageObject.vehicles.map((vehicleName) => (
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
              onPress={() => setShowGarageDetailsVisible(false)}
              style={styles.greenButton}
            >
              <Text style={{ color: 'white' }}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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

function compareGarages(a, b) {
  if (a.name < b.name) {
    return -1;
  }
  if (a.name > b.name) {
    return 1;
  }
  return 0;
};

const styles = StyleSheet.create({
  blueButton: {
    padding: 10,
    backgroundColor: 'orange',
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
  header: {
    fontWeight: 'bold',
    fontSize: 20,
    padding: 10,
    color: 'white'
  },
  garageListContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc'
  },
  greenButton: {
    padding: 10,
    backgroundColor: '#2D640F',
    alignItems: 'center',
    justifyContent: 'center',
    margin: 10
  },
  separator: {
    width: '100%',
    height: 1,
    backgroundColor: 'black',
    marginVertical: 5,
  },
  textInput: {
    color: 'black',
    borderWidth: 0.5,
    margin: 10
  },
  vehicleListContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc'
  }
});

export default Garages;
