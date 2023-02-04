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

  const openEditGarageWindow = async (garageObj) => {
    setShowGarageDetailsVisible(false);
    setGarageObject(garageObj);
    setGarageObjectVehicles(garageObj.vehicles);
    setEditGarageModalVisible(true);
  };

  const editGarageObject = async () => {

    try {

      setEditGarageModalVisible(false);

      garageObject.vehicles = garageObjectVehicles;

      // Remove old garageObject, add new garageObject, sort
      const newGarageObjects = garageObjects.filter((_, index) => index !== garageObjectIndex);
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

  const removeGarageObject = async (garageToRemove) => {

    Alert.alert(
      'Remove Garage',
      'Are you sure you want to remove garage at ' + garageToRemove.location + '?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'OK',
          onPress: async () => {
            try {
              const newGarageObjects = garageObjects.filter(function (garageObj) {
                return garageObj.location !== garageToRemove.location;
              });

              setGarageObjects(newGarageObjects);
              await saveObject('@GarageObjectList', newGarageObjects);

              // Set new vehicles list for Vehicles page
              updateAllVehicles(newGarageObjects);

              setShowGarageDetailsVisible(false);

            } catch (error) {
              console.error(error);
            }
          },
        },
      ],
      { cancelable: false }
    );
  };

  const showGarageDetails = async (index, garageObj) => {
    setGarageObjectIndex(index);
    setGarageObject(garageObj);
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
  };

  return (
    <View style={{ flex: 1 }}>

      <ScrollView>

        <View style={styles.separatorTop} />

        {garageObjects.map((currentGarageObject, index) => (
          <View key={index} style={styles.containerForGarageList}>
            <View style={{ flex: 1 }}>
              <TouchableOpacity onPress={() => showGarageDetails(index, currentGarageObject)}>
                <Text style={{ color: 'black', fontWeight: 'bold' }}>{currentGarageObject.location}</Text>
              </TouchableOpacity>
            </View>

            <View style={{ flex: 1 }}>
              <TouchableOpacity>
                <Text style={{ color: 'black', fontStyle: 'italic' }}>{currentGarageObject.theme}</Text>
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
                  style={styles.buttonRed}
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
                  style={styles.buttonRed}
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
        animationType="slide"
        transparent={false}
        visible={showGarageDetailsVisible}
        onRequestClose={() => {
          setShowGarageDetailsVisible(false);
        }}
      >
        <View style={{ backgroundColor: '#2D640F', justifyContent: 'center', height: 50 }}>
          <Text style={styles.header}>{garageObject.location}</Text>
        </View>

        <View style={{ flex: 1, flexDirection: 'column' }}>

          <Text style={{ color: 'black', margin: 10, marginBottom: 0, fontWeight: 'bold', fontSize: 17.5 }}>{'Garage Details'}</Text>

          <View style={{ flexDirection: 'column', margin: 10 }}>
            <View style={{ flexDirection: 'row' , marginBottom: 10}}>
              <Text style={{ color: 'grey', fontWeight: 'bold', fontStyle: 'italic' }}>Theme: </Text>
              <Text style={{ color: 'grey', fontStyle: 'italic' }}>{garageObject.theme}</Text>
            </View>

            <View style={{ flexDirection: 'row' }}>
              <Text style={{ color: 'grey', fontWeight: 'bold', fontStyle: 'italic' }}>Available Space: </Text>
              <Text style={{ color: 'grey', fontStyle: 'italic' }}>{garageObject.availableSpace}</Text>
            </View>
          </View>

          <View style={styles.separatorTop} />

          <Text style={{ color: 'black', margin: 10, fontWeight: 'bold', fontSize: 17.5 }}>{'Disposible Vehicles' + ' (' + garageObject.disposableVehicles.length + ')'}</Text>

          <View>
            <ScrollView>{garageObject.disposableVehicles && garageObject.disposableVehicles.map((disposableVehicle, index) => (
              <View key={index} style={styles.containerForSimpleLists}>
                <TouchableOpacity>
                  <Text style={{ color: 'grey', fontStyle: 'italic' }}>{disposableVehicle}</Text>
                </TouchableOpacity>
              </View>
            ))}
            </ScrollView>
          </View>

          <View style={styles.separatorTop} />

          <Text style={{ color: 'black', margin: 10, fontWeight: 'bold', fontSize: 17.5 }}>{'Vehicles in Garage' + ' (' + garageObject.vehicles.length + ')'}</Text>

          <View>
            <ScrollView>{garageObject.vehicles && garageObject.vehicles.map((vehicleName, index) => (
              <View key={index} style={styles.containerForSimpleLists}>
                <TouchableOpacity>
                  <Text style={{ color: 'grey', fontStyle: 'italic' }}>{vehicleName}</Text>
                </TouchableOpacity>
              </View>
            ))}
            </ScrollView>
          </View>

          <View style={{ flex: 1, flexDirection: 'column', justifyContent: 'flex-end' }}>
            <TouchableOpacity
              onPress={() => openEditGarageWindow(garageObject)}
              style={styles.buttonGreen}>
              <Text style={{ color: 'white' }}>Edit Garage</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => removeGarageObject(garageObject)}
              style={styles.buttonRed}>
              <Text style={{ color: 'white' }}>Remove Garage</Text>
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
