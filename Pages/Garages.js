import React, { useContext, useEffect, useState } from 'react';
import { Alert, Button, Modal, ScrollView, Text, TextInput, TouchableOpacity, StyleSheet, View } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import { VehicleContext } from '../Context/VehicleContext';
import { useFocusEffect } from '@react-navigation/native';
import { GarageContext } from '../Context/GarageContext';

const Garages = () => {

  const { garageNames, setGarageNames } = useContext(GarageContext);
  const { vehicleNames, setVehicleNames } = useContext(VehicleContext);

  const [garageVehicleNames, setGarageVehicleNames] = useState([]);

  const [garageObjects, setGarageObjects] = useState([]);
  const [garageObjectIndex, setGarageObjectIndex] = useState("");
  const [garageObjectVehicles, setGarageObjectVehicles] = useState("");

  const [lastEditedGarageName, setLastEditedGarageName] = useState("");
  const [lastSelectedGarageObject, setLastSelectedGarageObject] = useState("");

  // Modals
  const [addGarageModalVisible, setAddGarageModalVisible] = useState(false);
  const [editGarageModalVisible, setEditGarageModalVisible] = useState(false);
  const [showVehiclesModalVisible, setShowVehiclesModalVisible] = useState(false);

  const [garageObject, setGarageObject] = useState({
    name: '',
    location: '',
    availableSpace: '0',
    disposableVehicles: [],
    vehicles: [],
  });

  useEffect(() => {
    console.log('effect');
    // Get the list of garage names from local storage
    const getGarageObjects = async () => {
      const garages = await retrieveObject('@GarageObjectList');
      setGarageObjects(garages);
    };
    getGarageObjects();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      console.log('focus');
      setGarageObject({ ...garageObject, name: '', location: '', availableSpace: '0', disposableVehicles: [], vehicles: [] });
    }, [])
  );

  const addGarageObject = async () => {

    garageObjects.push(garageObject);
    garageObjects.sort(compareGarages);
    setGarageObjects([...garageObjects]);

    setGarageObject({ ...garageObject, name: '', location: '', availableSpace: '0', disposableVehicles: [] });
    await saveObject('@GarageObjectList', garageObjects);
    setAddGarageModalVisible(false);
  };

  const openEditGarageWindow = async (index, garageObj) => {
    setGarageObjectIndex(index);
    setGarageObjectVehicles(garageObj.vehicles);
    setEditGarageModalVisible(true);
  };

  const editGarageObject = async () => {

    try {

      setEditGarageModalVisible(false);

      // #TODO: Check if this works 
      garageObject.vehicles = garageObjectVehicles;

      // Remove old garageObject, add new garageObject, save to local storage
      const newGarageObjects = garageObjects.filter((_, i) => i !== garageObjectIndex);
      newGarageObjects.push(garageObject);
      newGarageObjects.sort(compareGarages);
      await saveObject('@GarageObjectList', garageObjects);
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
              await saveObject('@GarageObjectList', newGarageObjects);;
            } catch (error) {
              console.error(error);
            }
          },
        },
      ],
      { cancelable: false }
    );
  };

  const showVehicleList = async (garageObj) => {
    setLastSelectedGarageObject(garageObj);
    setGarageVehicleNames(garageObj.vehicles);
    setShowVehiclesModalVisible(true);
  };

  return (
    <View style={{ flex: 1 }}>
      <ScrollView>
        {garageObjects.map((currentGarageObject, index) => (
          <View
            style={styles.garageListContainer}
          >
            <TouchableOpacity onPress={() => showVehicleList(currentGarageObject)}>
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
        onPress={() => setAddGarageModalVisible(true)}
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

        <View style={{ marginTop: 10 }}>
          <View>
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

        <View style={{ marginTop: 10 }}>
          <View>
            <TextInput
              onChangeText={text => setGarageObject({ ...garageObject, name: text })}
              placeholder="New Garage Name"
              placeholderTextColor="grey"
              style={styles.textInput}
            />

            <TextInput
              onChangeText={text => setGarageObject({ ...garageObject, location: text })}
              placeholder="New Garage Location"
              placeholderTextColor="grey"
              style={styles.textInput}
            />

            <TextInput
              onChangeText={text => setGarageObject({ ...garageObject, availableSpace: text })}
              keyboardType='number-pad'
              placeholder="New Available Space"
              placeholderTextColor="grey"
              style={styles.textInput}
            />

            {garageObject.disposableVehicles.map((disposableVehicle, index) => (
              <TextInput
                key={index}
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
        visible={showVehiclesModalVisible}
        onRequestClose={() => {
          setShowVehiclesModalVisible(false);
        }}
      >
        <View style={{ backgroundColor: '#2D640F', justifyContent: 'center', height: 50 }}>
          <Text style={styles.header}>Vehicles in {lastSelectedGarageObject.name}</Text>
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
  greenButton: {
    padding: 10,
    backgroundColor: '#2D640F',
    alignItems: 'center',
    justifyContent: 'center',
    margin: 10
  },
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
