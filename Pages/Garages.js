import { Alert, Modal, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useContext, useEffect, useState } from 'react';
import { VehicleContext } from '../Context/VehicleContext';
import { useFocusEffect } from '@react-navigation/native';
import { GarageContext } from '../Context/GarageContext';
import styles from './Styles';

const Garages = () => {

  const { vehicleObjects, setVehicleObjects } = useContext(VehicleContext);
  const { garageObjects, setGarageObjects } = useContext(GarageContext);

  const [oldGarageLocation, setOldGarageLocation] = useState('');
  const [inProgress, setInProgress] = useState(false);

  // Modal visibility
  const [addGarageModalVisible, setAddGarageModalVisible] = useState(false);
  const [editGarageModalVisible, setEditGarageModalVisible] = useState(false);
  const [showGarageDetailsVisible, setShowGarageDetailsVisible] = useState(false);

  const [vehicleObject, setVehicleObject] = useState({
    vehicleName: '',
    garageLocation: ''
  });

  const [wishlistObject, setWishlistObject] = useState({
    garageTheme: '',
    vehicleName: '',
    price: '',
    tradePrice: ''
  });

  const [garageObject, setGarageObject] = useState({
    location: '',
    theme: '',
    capacity: '',
    vehicles: [],
    disposableVehicles: [],
    wishlist: []
  });

  useEffect(() => {
    // Get the list of garage names from local storage
    const getGarageObjects = async () => {

      // #TEST: Activate these two lines to wipe data on restart.
      // await AsyncStorage.removeItem('@GarageObjectList');
      // setVehicleObjects([]);
      // await AsyncStorage.removeItem('@VehicleObjectList');
      // setGarageObjects([]);

      const garages = await retrieveObject('@GarageObjectList');
      setGarageObjects(garages);
    };
    getGarageObjects();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      setEmptyGarageObject();
    }, [])
  );

  const setEmptyGarageObject = async () => {
    setGarageObject({ ...garageObject, location: '', theme: '', capacity: '', disposableVehicles: [], vehicles: [], wishlist: [] });
  }

  const openAddNewGarageWindow = async () => {
    await setEmptyGarageObject();
    setAddGarageModalVisible(true);
  };

  const addGarageObject = async () => {
    try {
      setInProgress(true);

      if (!garageObject.location.trim()) {
        Alert.alert('Add New Garage', "Garage location can not be empty.");
        return;
      }

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

      await saveObject('@GarageObjectList', garageObjects);

    } catch (error) {
      console.error(error);
    } finally {
      await setEmptyGarageObject();
      setInProgress(false);
      setAddGarageModalVisible(false);
    }
  };

  const showGarageDetails = async (garageObj) => {
    setOldGarageLocation(garageObj.location);
    setGarageObject(garageObj);
    setShowGarageDetailsVisible(true);
  };

  const openEditGarageWindow = async () => {
    setShowGarageDetailsVisible(false);
    setEditGarageModalVisible(true);
  };

  const editGarageObject = async () => {

    try {

      setInProgress(true);

      if (!garageObject.location.trim()) {
        Alert.alert('Add New Garage', "Garage location can not be empty.");
        return;
      }

      const newGarageObjects = garageObjects.filter(garageObj => garageObj.location !== oldGarageLocation);

      const garageWithSameLocation = newGarageObjects.filter(function (garageObj) {
        return garageObj.location === garageObject.location;
      });

      if (garageWithSameLocation.length !== 0) {
        Alert.alert('Add New Garage', "Garage at this location already exists.");
        return;
      }

      newGarageObjects.push(garageObject);
      newGarageObjects.sort(compareGarages);

      // Set the new garageObjects to local an state
      await saveObject('@GarageObjectList', newGarageObjects);
      setGarageObjects(newGarageObjects);

      // Update vehicleObjects with new garage info
      await updateVehicleObjects();

    } catch (error) {
      console.error(error);
    } finally {
      await setEmptyGarageObject();
      setInProgress(false);
      setEditGarageModalVisible(false);
    }
  };

  const updateVehicleObjects = async () => {
    const vehicleObjectsToUpdate = Object.assign([], vehicleObjects.filter(vehicleObject => vehicleObject.garageLocation === oldGarageLocation));
    const newVehicleObjects = vehicleObjects.filter(vehicleObject => vehicleObject.garageLocation !== oldGarageLocation);

    for (const vehicleObject of vehicleObjectsToUpdate) {
      vehicleObject.garageLocation = garageObject.location;
      newVehicleObjects.push(vehicleObject);
    }

    newVehicleObjects.sort(compareVehicles);

    await saveObject('@VehicleObjectList', newVehicleObjects);
    setVehicleObjects(newVehicleObjects);
  };

  const removeGarageObject = async () => {

    Alert.alert(
      'Remove Garage',
      'Are you sure you want to remove garage at ' + oldGarageLocation + '?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'OK',
          onPress: async () => {
            try {
              setInProgress(true);

              const newGarageObjects = garageObjects.filter(garageObj => garageObj.location !== oldGarageLocation);

              setGarageObjects(newGarageObjects);
              await saveObject('@GarageObjectList', newGarageObjects);

              // Set new vehicles list for Vehicles page
              await removeVehicleObjects(oldGarageLocation);

            } catch (error) {
              console.error(error);
            } finally {
              await setEmptyGarageObject();
              setInProgress(false);
              setShowGarageDetailsVisible(false);
            }
          },
        },
      ],
      { cancelable: false }
    );
  };

  const removeVehicleObjects = async (garageLocationToRemove) => {
    try {
      const newVehicleObjects = vehicleObjects.filter(vehicleObject => vehicleObject.garageLocation !== garageLocationToRemove);
      setVehicleObjects(newVehicleObjects);
      await saveObject('@VehicleObjectList', newVehicleObjects);
    } catch (error) {
      console.error(error);
    }
  };

  const removeDisposableVehicle = index => {
    const newDisposableVehicles = [...garageObject.disposableVehicles];
    newDisposableVehicles.splice(index, 1);
    setGarageObject({ ...garageObject, disposableVehicles: newDisposableVehicles });
  };

  return (
    <View style={{ flex: 1 }}>

      <ScrollView>

        <View style={styles.separatorTop} />

        {garageObjects.map((currentGarageObject, index) => (
          <View key={index} style={styles.containerForGarageList}>
            <View style={{ flex: 1 }}>
              <TouchableOpacity onPress={() => showGarageDetails(currentGarageObject)}>
                <Text style={{ color: 'black', fontWeight: 'bold' }}>{currentGarageObject.location}</Text>
              </TouchableOpacity>
            </View>

            <View style={{ flex: 1 }}>
              <TouchableOpacity onPress={() => showGarageDetails(currentGarageObject)}>
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
          setEmptyGarageObject();
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
              value={garageObject.capacity}
              onChangeText={text => setGarageObject({ ...garageObject, capacity: text })}
              keyboardType='number-pad'
              placeholder="Capacity"
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
          setEmptyGarageObject();
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
              placeholder="New Garage Location"
              placeholderTextColor="grey"
              style={styles.textInput}
            />

            <TextInput
              value={garageObject.theme}
              onChangeText={text => setGarageObject({ ...garageObject, theme: text })}
              placeholder="New Garage Theme"
              placeholderTextColor="grey"
              style={styles.textInput}
            />

            <TextInput
              value={garageObject.capacity}
              onChangeText={text => setGarageObject({ ...garageObject, capacity: text })}
              keyboardType='number-pad'
              placeholder="New Capacity"
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
          setEmptyGarageObject();
          setShowGarageDetailsVisible(false);
        }}
      >
        <View style={{ backgroundColor: '#2D640F', justifyContent: 'center', height: 50 }}>
          <Text style={styles.header}>{garageObject.location}</Text>
        </View>

        <View style={{ flex: 1 }}>

          <ScrollView>

            <View style={styles.separatorTop} />

            <Text style={{ color: 'black', margin: 10, fontWeight: 'bold', fontStyle: 'italic', fontSize: 17.5 }}>{'Garage Details'}</Text>

            <View style={{ flexDirection: 'row', margin: 10, marginTop: 0 }}>
              <Text style={{ color: 'grey', fontWeight: 'bold', fontStyle: 'italic' }}>Theme: </Text>
              <Text style={{ color: 'grey' }}>{garageObject.theme}</Text>
            </View>

            <View style={{ flexDirection: 'row', margin: 10, marginTop: 0 }}>
              <Text style={{ color: 'grey', fontWeight: 'bold', fontStyle: 'italic' }}>Capacity: </Text>
              <Text style={{ color: 'grey' }}>{garageObject.capacity}</Text>
            </View>

            <View style={{ flexDirection: 'row', margin: 10, marginTop: 0 }}>
              <Text style={{ color: 'grey', fontWeight: 'bold', fontStyle: 'italic' }}>Available Space: </Text>
              <Text style={{ color: 'grey' }}>{garageObject.capacity - garageObject.vehicles.length}</Text>
            </View>

            <View style={styles.separatorTop} />

            <Text style={{ color: 'black', margin: 10, fontWeight: 'bold', fontStyle: 'italic', fontSize: 17.5 }}>{'Vehicles in Garage' + ' (' + garageObject.vehicles.length + ')'}</Text>

            <View>
              {garageObject.vehicles && garageObject.vehicles.map((vehicleName, index) => (
                <View key={index} style={styles.containerForSimpleLists}>
                  <TouchableOpacity>
                    <Text style={{ color: 'grey' }}>{vehicleName}</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>

            <View style={styles.separatorTop} />

            <Text style={{ color: 'black', margin: 10, fontWeight: 'bold', fontStyle: 'italic', fontSize: 17.5 }}>{'Disposible Vehicles' + ' (' + garageObject.disposableVehicles.length + ')'}</Text>

            <View>{garageObject.disposableVehicles && garageObject.disposableVehicles.map((disposableVehicle, index) => (
              <View key={index} style={styles.containerForSimpleLists}>
                <TouchableOpacity>
                  <Text style={{ color: 'grey' }}>{disposableVehicle}</Text>
                </TouchableOpacity>
              </View>
            ))}
            </View>

            <View style={styles.separatorTop} />

            <Text style={{ color: 'black', margin: 10, fontWeight: 'bold', fontStyle: 'italic', fontSize: 17.5 }}>{'Wishlist for This Garage' + ' (' + garageObject.wishlist.length + ')'}</Text>

            <View>{garageObject.wishlist && garageObject.wishlist.map((wishlist, index) => (
              <View key={index} style={styles.containerForSimpleLists}>
                <TouchableOpacity>
                  <Text style={{ color: 'grey' }}>{wishlist}</Text>
                </TouchableOpacity>
              </View>
            ))}
            </View>

          </ScrollView>

          <View style={{
            flexDirection: 'column',
            margin: 5,
            marginTop: 0,
            marginBottom: 0,
            borderTopWidth: 1,
            borderTopColor: '#black'
          }}>
            <TouchableOpacity
              onPress={() => openEditGarageWindow()}
              style={styles.buttonGreen}>
              <Text style={{ color: 'white' }}>Edit Garage</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => removeGarageObject()}
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

function compareVehicles(vehicleA, vehicleB) {

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
}

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
