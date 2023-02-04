import { Alert, Modal, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import React, { useContext, useEffect, useState } from 'react';
import { VehicleContext } from '../Context/VehicleContext';
import { useFocusEffect } from '@react-navigation/native';
import { GarageContext } from '../Context/GarageContext';
import styles from './Styles';

const Garages = () => {

  const { garageObjects, setGarageObjects } = useContext(GarageContext);
  const { vehicleNames, setVehicleNames } = useContext(VehicleContext);

  const [garageObjectIndex, setGarageObjectIndex] = useState("");               // Used when removing the previous car when editing garage.
  const [garageObjectVehicles, setGarageObjectVehicles] = useState("");         // Used for transfering vehicles when editing garage.
  const [lastSelectedGarageObject, setLastSelectedGarageObject] = useState({}); // Used when showing "Cars in (garage)" header.

  // Modals
  const [addGarageModalVisible, setAddGarageModalVisible] = useState(false);
  const [editGarageModalVisible, setEditGarageModalVisible] = useState(false);
  const [showGarageDetailsVisible, setShowGarageDetailsVisible] = useState(false);

  const [garageObject, setGarageObject] = useState({
    location: '',
    theme: '',
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
      setGarageObject({ ...garageObject, location: '', theme: '', availableSpace: '0', disposableVehicles: [], vehicles: [] });
    }, [])
  );

  const openAddNewGarageWindow = async () => {
    setGarageObject({ ...garageObject, location: '', theme: '', availableSpace: '0', disposableVehicles: [] });
    setAddGarageModalVisible(true);
  };

  const addGarageObject = async () => {

    const garageWithSameLocation = garageObjects.filter(function (garageObj) {
      return garageObj.location === garageObject.location;
    });

    if (garageWithSameLocation.length !== 0) {
      Alert.alert('Add New Garage', "Garage at this location already exists.");
      return;
    }

    garageObjects.push(garageObject);
    garageObjects.sort(compareGarages);
    setGarageObjects([...garageObjects]);

    setGarageObject({ ...garageObject, location: '', theme: '', availableSpace: '0', disposableVehicles: [] });
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

      setGarageObject({ ...garageObject, location: '', theme: '', availableSpace: '0', disposableVehicles: [] });

    } catch (error) {
      console.error(error);
    }
  };

  const removeDisposableVehicle = index => {
    const newDisposableVehicles = [...garageObject.disposableVehicles];
    newDisposableVehicles.splice(index, 1);
    setGarageObject({ ...garageObject, disposableVehicles: newDisposableVehicles });
  };

  const removeGarageObject = async (index, garageObj) => {

    Alert.alert(
      'Remove Garage',
      'Are you sure you want to remove garage at ' + garageObj.location + '?',
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
        const newVehicle = garageObject.location + '_' + garageVehicle;
        vehicles.push(newVehicle);
      }
    }
    vehicles.sort();
    setVehicleNames(vehicles);
  }

  return (
    <View style={{ flex: 1 }}>
      <ScrollView>
        <View style={styles.separatorTop} />
        {garageObjects.map((currentGarageObject, index) => (
          <View key={index} style={styles.containerForLists}>
            <TouchableOpacity onPress={() => showGarageDetails(currentGarageObject)}>
              <Text style={{ color: 'black', fontWeight: 'bold' }}>{currentGarageObject.location}</Text>
            </TouchableOpacity>

            <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'flex-end' }}>

              <TouchableOpacity
                style={{ marginRight: 20 }}>
                <Text style={{ color: 'black', fontStyle: 'italic' }}>{currentGarageObject.theme}</Text>
              </TouchableOpacity>

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
        style={styles.buttonGreen}>
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
              value={garageObject.location}
              onChangeText={text => setGarageObject({ ...garageObject, location: text })}
              placeholder="Garage Location"
              placeholderTextColor="grey"
              style={styles.textInput}
            />

            <TextInput
              value={garageObject.theme}
              onChangeText={text => setGarageObject({ ...garageObject, theme: text })}
              placeholder="Garage Theme"
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
              <View key={index} style={{ flexDirection: 'row' }}>
                <View style={{ flex: 1 }}>
                  <TextInput
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
                </View>
                <TouchableOpacity
                  style={styles.buttonSmallRed}
                  onPress={() => removeDisposableVehicle(index)}>
                  <Text style={{ color: 'white' }}>Remove</Text>
                </TouchableOpacity>
              </View>
            ))}

            <TouchableOpacity
              style={styles.buttonYellow}
              onPress={() => setGarageObject({ ...garageObject, disposableVehicles: [...garageObject.disposableVehicles, ''] })}>

              <Text style={{ color: 'white' }}>Add Disposable Vehicle</Text>

            </TouchableOpacity>
          </View>

          <View style={{ flex: 1, flexDirection: 'column', justifyContent: 'flex-end' }}>
            <TouchableOpacity
              style={styles.buttonGreen}
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
              value={garageObject.location}
              onChangeText={text => setGarageObject({ ...garageObject, location: text })}
              placeholder="New Garage Name"
              placeholderTextColor="grey"
              style={styles.textInput}
            />

            <TextInput
              value={garageObject.theme}
              onChangeText={text => setGarageObject({ ...garageObject, theme: text })}
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
              <View key={index} style={{ flexDirection: 'row' }}>
                <View style={{ flex: 1 }}>
                  <TextInput
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
                </View>
                <TouchableOpacity
                  style={styles.buttonSmallRed}
                  onPress={() => removeDisposableVehicle(index)}>
                  <Text style={{ color: 'white' }}>Remove</Text>
                </TouchableOpacity>
              </View>
            ))}

            <TouchableOpacity
              style={styles.buttonYellow}
              onPress={() => setGarageObject({ ...garageObject, disposableVehicles: [...garageObject.disposableVehicles, ''] })}>
              <Text style={{ color: 'white' }}>Add Disposable Vehicle</Text>
            </TouchableOpacity>
          </View>

          <View style={{ flex: 1, flexDirection: 'column', justifyContent: 'flex-end' }}>
            <TouchableOpacity
              style={styles.buttonGreen}
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
          <Text style={styles.header}>Vehicles at {lastSelectedGarageObject.location}</Text>
        </View>

        <View style={{ marginTop: 10 }}>
          <View>
            <ScrollView>{lastSelectedGarageObject.vehicles && lastSelectedGarageObject.vehicles.map((vehicleName, index) => (
              <View key={index} style={styles.containerVehicleList}>
                <TouchableOpacity>
                  <Text style={{ color: 'black' }}>{vehicleName}</Text>
                </TouchableOpacity>
              </View>
            ))}
            </ScrollView>

            <TouchableOpacity
              onPress={() => setShowGarageDetailsVisible(false)}
              style={styles.buttonGreen}
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

function compareGarages(garageA, garageB) {
  if (garageA.location < garageB.location) {
    return -1;
  }
  if (garageA.location > garageB.location) {
    return 1;
  }
  return 0;
}

export default Garages;
