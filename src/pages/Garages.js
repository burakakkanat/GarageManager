import { Alert, Modal, ScrollView, Text, TextInput, ToastAndroid, TouchableOpacity, View } from 'react-native';
import React, { useContext, useEffect, useState } from 'react';
import { WishlistContext } from '../context/WishlistContext';
import dataManagementUtil from '../util/DataManagementUtil';
import { VehicleContext } from '../context/VehicleContext';
import { useFocusEffect } from '@react-navigation/native';
import { GarageContext } from '../context/GarageContext';
import styles from '../styles/Styles';
import uuid from 'react-native-uuid';
import util from '../util/Util';

const Garages = () => {

  const { wishlistObjects, setWishlistObjects } = useContext(WishlistContext);
  const { vehicleObjects, setVehicleObjects } = useContext(VehicleContext);
  const { garageObjects, setGarageObjects } = useContext(GarageContext);

  const [oldGarageLocation, setOldGarageLocation] = useState('');
  const [oldGarageTheme, setOldGarageTheme] = useState('');
  const [inProgress, setInProgress] = useState(false);

  // Modal visibility
  const [addGarageModalVisible, setAddGarageModalVisible] = useState(false);
  const [editGarageModalVisible, setEditGarageModalVisible] = useState(false);
  const [showGarageDetailsVisible, setShowGarageDetailsVisible] = useState(false);

  const [garageObject, setGarageObject] = useState({
    uuid: '',
    location: '',
    theme: '',
    capacity: '',
    vehicles: [vehicleObject],
    disposableVehicles: [],
    wishlist: [wishlistObject]
  });

  const [vehicleObject, setVehicleObject] = useState({
    uuid: '',
    vehicleName: '',
    garageLocation: ''
  });

  const [wishlistObject, setWishlistObject] = useState({
    uuid: '',
    garageTheme: '',
    vehicleName: '',
    price: '',
    tradePrice: ''
  });

  useEffect(() => {
    // Get the list of garage names from local storage
    const fetchData = async () => {
      const garages = await util.retrieveObject('@GarageObjectList');
      setVehicleObjectsAndWishlistObjects(garages);
      setGarageObjects(garages);
    };
    fetchData();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      setEmptyGarageObject();
    }, [])
  );

  function setVehicleObjectsAndWishlistObjects(garageObjectList) {

    let allVehicleObjects = [];
    let allWishlistObjects = [];

    for (const garageObject of garageObjectList) {

      if (garageObject.vehicles.length > 0) {
        allVehicleObjects = [...allVehicleObjects, ...garageObject.vehicles].sort(util.compareVehicles);
      }

      if (garageObject.wishlist.length > 0) {
        allWishlistObjects = [...allWishlistObjects, ...garageObject.wishlist].sort(util.compareWishlistItems);
      }
    }

    setWishlistObjects(allWishlistObjects);
    setVehicleObjects(allVehicleObjects);
  }

  const setEmptyGarageObject = async () => {
    setGarageObject({ ...garageObject, location: '', theme: '', capacity: '', disposableVehicles: [], vehicles: [], wishlist: [] });
  };

  const openAddNewGarageWindow = async () => {
    await setEmptyGarageObject();
    setAddGarageModalVisible(true);
  };

  const addGarageObject = async () => {
    try {
      setInProgress(true);

      if (!verifyGarageFields(garageObjects)) {
        return;
      }

      garageObject.uuid = uuid.v4();

      setGarageObjects(prevGarageObjects => {
        const newGarageObjects = [...prevGarageObjects];
        const garageInsertionIndex = util.findGarageInsertionIndex(newGarageObjects, garageObject);
        newGarageObjects.splice(garageInsertionIndex, 0, garageObject);
        
        util.saveObject('@GarageObjectList', newGarageObjects);

        return newGarageObjects;
      });

      await setEmptyGarageObject();
      setAddGarageModalVisible(false);

      ToastAndroid.showWithGravity(
        'Garage added.',
        ToastAndroid.SHORT,
        ToastAndroid.TOP, // Not working
      );

    } catch (error) {
      console.error(error);
    } finally {
      setInProgress(false);
    }
  };

  const editGarageObject = async () => {

    try {
      setInProgress(true);

      // There is only one garage with a specific location so it is safe to use index.
      const indexToRemove = garageObjects.findIndex(garageObj => garageObj.location === oldGarageLocation);
      const newGarageObjects = [...garageObjects];
      if (indexToRemove !== -1) {
        newGarageObjects.splice(indexToRemove, 1);
      }

      if (!verifyGarageFields(newGarageObjects)) {
        return;
      }

      const garageInsertionIndex = util.findGarageInsertionIndex(newGarageObjects, garageObject);
      newGarageObjects.splice(garageInsertionIndex, 0, garageObject);

      await util.saveObject('@GarageObjectList', newGarageObjects);
      setGarageObjects(newGarageObjects);

      // Update vehicleObjects and wishlistObjects with new garage info
      if (oldGarageLocation !== garageObject.location) {
        await updateVehicleObjects();
      }
      if (oldGarageTheme !== garageObject.theme) {
        await updateWishlistObjects();
      }

      await setEmptyGarageObject();
      setEditGarageModalVisible(false);

      ToastAndroid.showWithGravity(
        'Garage edited.',
        ToastAndroid.SHORT,
        ToastAndroid.TOP, // Not working
      );

    } catch (error) {
      console.error(error);
    } finally {
      setInProgress(false);
    }
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

              // There is only one garage with a specific location so it is safe to use index.
              const indexToRemove = garageObjects.findIndex(garageObj => garageObj.location === oldGarageLocation);
              const newGarageObjects = [...garageObjects];
              if (indexToRemove !== -1) {
                newGarageObjects.splice(indexToRemove, 1);
              }
              setGarageObjects(newGarageObjects);
              await util.saveObject('@GarageObjectList', newGarageObjects);

              // Set new vehicles list for Vehicles page
              await removeVehicleObjects(oldGarageLocation);
              await removeWishlistObjects(oldGarageTheme);

              await setEmptyGarageObject();
              setShowGarageDetailsVisible(false);

              ToastAndroid.showWithGravity(
                'Garage removed.',
                ToastAndroid.SHORT,
                ToastAndroid.TOP, // Not working
              );

            } catch (error) {
              console.error(error);
            } finally {
              setInProgress(false);
            }
          },
        },
      ],
      { cancelable: false }
    );
  };

  const showGarageDetails = async (garageObj) => {
    setOldGarageLocation(garageObj.location);
    setOldGarageTheme(garageObj.theme);
    setGarageObject(garageObj);
    setShowGarageDetailsVisible(true);
  };

  const openEditGarageWindow = async () => {
    setShowGarageDetailsVisible(false);
    setEditGarageModalVisible(true);
  };

  const verifyGarageFields = (garageObjects) => {

    if (!garageObject.location.trim()) {
      Alert.alert('Error', 'Garage location can not be empty.');
      return;
    }

    if (!garageObject.theme.trim()) {
      Alert.alert('Error', 'Garage theme can not be empty.');
      return;
    }

    const garageWithSameLocationIndex = garageObjects.findIndex((garageObj) => garageObj.location === garageObject.location);
    if (garageWithSameLocationIndex !== -1) {
      Alert.alert('Error', 'Garage at this location already exists.');
      return false;
    }

    const garageWithSameThemeIndex = garageObjects.findIndex((garageObj) => garageObj.theme === garageObject.theme);
    if (garageWithSameThemeIndex !== -1) {
      Alert.alert('Error', 'Garage with this theme already exists.');
      return false;
    }

    return true;
  };

  const updateVehicleObjects = async () => {

    const vehiclesToUpdateIndexes = vehicleObjects.reduce((acc, vehicleObject, index) => {
      if (vehicleObject.garageLocation === oldGarageLocation) {
        acc.push(index);
        vehicleObject.garageLocation = garageObject.location;
      }
      return acc;
    }, []);

    const newVehicleObjects = [...vehicleObjects];
    vehiclesToUpdateIndexes.forEach((index) => {
      newVehicleObjects.splice(index, 1, vehicleObjects[index]);
    });

    newVehicleObjects.sort(util.compareVehicles);
    setVehicleObjects(newVehicleObjects);
  };

  const updateWishlistObjects = async () => {

    const wishlistItemsToUpdateIndexes = wishlistObjects.reduce((acc, wishlistItem, index) => {
      if (wishlistItem.garageTheme === oldGarageTheme) {
        acc.push(index);
        wishlistItem.garageTheme = garageObject.theme;
      }
      return acc;
    }, []);

    const newWishlistObjects = [...wishlistObjects];
    wishlistItemsToUpdateIndexes.forEach((index) => {
      newWishlistObjects.splice(index, 1, wishlistObjects[index]);
    });

    newWishlistObjects.sort(util.compareWishlistItems);
    setWishlistObjects(newWishlistObjects);
  };

  const removeVehicleObjects = async (garageLocationToRemove) => {
    try {
      const newVehicleObjects = vehicleObjects.filter(vehicleObject => vehicleObject.garageLocation !== garageLocationToRemove);
      setVehicleObjects(newVehicleObjects);
    } catch (error) {
      console.error(error);
    }
  };

  const removeWishlistObjects = async (garageThemeToRemove) => {
    try {
      const newWishlistObjects = wishlistObjects.filter(wishlistObject => wishlistObject.garageTheme !== garageThemeToRemove);
      setWishlistObjects(newWishlistObjects);
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
                <Text style={styles.textListItemGarageB}>{currentGarageObject.location}</Text>
              </TouchableOpacity>
            </View>

            <View style={{ flex: 1 }}>
              <TouchableOpacity onPress={() => showGarageDetails(currentGarageObject)}>
                <Text style={styles.textListItemGarageM}>{currentGarageObject.theme}</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>

      <TouchableOpacity
        onPress={openAddNewGarageWindow}
        style={styles.buttonGreen}>
        <Text style={styles.textButton}>Add New Garage</Text>
      </TouchableOpacity>

      <Modal
        animationType='slide'
        transparent={false}
        visible={showGarageDetailsVisible}
        onRequestClose={() => {
          setEmptyGarageObject();
          setShowGarageDetailsVisible(false);
        }}
      >
        <View style={styles.containerHeader}>
          <Text style={styles.header}>{garageObject.location + ' '}</Text>
        </View>

        <View style={{ flex: 1 }}>

          <ScrollView>

            <View style={styles.separatorTop} />

            <Text style={styles.textGarageDetailsTitle}>{'Garage Details'}</Text>

            <View style={{ flexDirection: 'row', margin: 10, marginTop: 0 }}>
              <Text style={styles.textGarageDetailsSoftTitle}>Theme: </Text>
              <Text style={styles.textGarageDetails}>{garageObject.theme}</Text>
            </View>

            <View style={{ flexDirection: 'row', margin: 10, marginTop: 0 }}>
              <Text style={styles.textGarageDetailsSoftTitle}>Capacity: </Text>
              <Text style={styles.textGarageDetails}>{garageObject.capacity}</Text>
            </View>

            <View style={{ flexDirection: 'row', margin: 10, marginTop: 0 }}>
              <Text style={styles.textGarageDetailsSoftTitle}>Available Space: </Text>
              <Text style={styles.textGarageDetails}>{garageObject.capacity - garageObject.vehicles.length}</Text>
            </View>

            <View style={styles.separatorTop} />

            <Text style={styles.textGarageDetailsTitle}>{'Vehicles in Garage' + ' (' + garageObject.vehicles.length + ')'}</Text>

            <View>
              {garageObject.vehicles && garageObject.vehicles.map((vehicleObj, index) => (
                <View key={index} style={styles.containerForSimpleLists}>
                  <TouchableOpacity>
                    <Text style={styles.textGarageDetails}>{vehicleObj?.vehicleName || 'Unknown Vehicle'}</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>

            <View style={styles.separatorTop} />

            <Text style={styles.textGarageDetailsTitle}>{'Disposible Vehicles' + ' (' + garageObject.disposableVehicles.length + ')'}</Text>

            <View>{garageObject.disposableVehicles && garageObject.disposableVehicles.map((disposableVehicle, index) => (
              <View key={index} style={styles.containerForSimpleLists}>
                <TouchableOpacity>
                  <Text style={styles.textGarageDetails}>{disposableVehicle}</Text>
                </TouchableOpacity>
              </View>
            ))}
            </View>

            <View style={styles.separatorTop} />

            <Text style={styles.textGarageDetailsTitle}>{'Wishlist for This Garage' + ' (' + garageObject.wishlist.length + ')'}</Text>

            <View>{garageObject.wishlist && garageObject.wishlist.map((wishlistObj, index) => (
              <View key={index} style={styles.containerForSimpleLists}>
                <TouchableOpacity>
                  <Text style={styles.textGarageDetails}>{wishlistObj?.vehicleName || 'Unknown Vehicle'}</Text>
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
              <Text style={styles.textButton}>Edit Garage</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => removeGarageObject()}
              style={styles.buttonRed}>
              <Text style={styles.textButton}>Remove Garage</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        animationType='slide'
        transparent={false}
        visible={addGarageModalVisible}
        onRequestClose={() => {
          setEmptyGarageObject();
          setAddGarageModalVisible(false);
        }}
      >
        <View style={styles.containerHeader}>
          <Text style={styles.header}>Add New Garage</Text>
        </View>

        <View style={{ flex: 1, flexDirection: 'column' }}>
          <View>

            <View style={styles.separator} />
            <Text style={styles.textSoftTitle}>{'Garage Details:'}</Text>

            <TextInput
              value={garageObject.location}
              onChangeText={text => setGarageObject({ ...garageObject, location: text })}
              placeholder='Garage Location'
              placeholderTextColor='grey'
              style={styles.textInput}
            />

            <TextInput
              value={garageObject.theme}
              onChangeText={text => setGarageObject({ ...garageObject, theme: text })}
              placeholder='Garage Theme'
              placeholderTextColor='grey'
              style={styles.textInput}
            />

            <TextInput
              value={garageObject.capacity}
              onChangeText={text => setGarageObject({ ...garageObject, capacity: text })}
              keyboardType='number-pad'
              placeholder='Capacity'
              placeholderTextColor='grey'
              style={styles.textInput}
            />

            <View style={styles.separator} />
            <Text style={styles.textSoftTitle}>{'Disposable Vehicles:'}</Text>

            {garageObject.disposableVehicles.map((disposableVehicle, index) => (
              <View key={index} style={{ flexDirection: 'row' }}>
                <View style={{ flex: 1 }}>
                  <TextInput
                    value={disposableVehicle}
                    style={styles.textInput}
                    placeholder='New Disposable Vehicle'
                    placeholderTextColor='grey'
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
                  <Text style={styles.textButton}>Remove</Text>
                </TouchableOpacity>
              </View>
            ))}

            <TouchableOpacity
              style={styles.buttonYellow}
              onPress={() => setGarageObject({ ...garageObject, disposableVehicles: [...garageObject.disposableVehicles, ''] })}>

              <Text style={styles.textButton}>Add Disposable Vehicle</Text>

            </TouchableOpacity>
          </View>

          <View style={{ flex: 1, flexDirection: 'column', justifyContent: 'flex-end' }}>
            <TouchableOpacity
              style={styles.buttonGreen}
              onPress={addGarageObject}>

              <Text style={styles.textButton}>Add</Text>

            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        animationType='slide'
        transparent={false}
        visible={editGarageModalVisible}
        onRequestClose={() => {
          setEmptyGarageObject();
          setEditGarageModalVisible(false);
        }}
      >
        <View style={styles.containerHeader}>
          <Text style={styles.header}>Edit Garage</Text>
        </View>

        <View style={{ flex: 1, flexDirection: 'column' }}>
          <View>

            <View style={styles.separator} />
            <Text style={styles.textSoftTitle}>{'Garage Details:'}</Text>

            <TextInput
              value={garageObject.location}
              onChangeText={text => setGarageObject({ ...garageObject, location: text })}
              placeholder='New Garage Location'
              placeholderTextColor='grey'
              style={styles.textInput}
            />

            <TextInput
              value={garageObject.theme}
              onChangeText={text => setGarageObject({ ...garageObject, theme: text })}
              placeholder='New Garage Theme'
              placeholderTextColor='grey'
              style={styles.textInput}
            />

            <TextInput
              value={garageObject.capacity}
              onChangeText={text => setGarageObject({ ...garageObject, capacity: text })}
              keyboardType='number-pad'
              placeholder='New Capacity'
              placeholderTextColor='grey'
              style={styles.textInput}
            />

            <View style={styles.separator} />
            <Text style={styles.textSoftTitle}>{'Disposable Vehicles:'}</Text>

            {garageObject.disposableVehicles.map((disposableVehicle, index) => (
              <View key={index} style={{ flexDirection: 'row' }}>
                <View style={{ flex: 1 }}>
                  <TextInput
                    value={disposableVehicle}
                    style={styles.textInput}
                    placeholder='New Disposable Vehicle'
                    placeholderTextColor='grey'
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
                  <Text style={styles.textButton}>Remove</Text>
                </TouchableOpacity>
              </View>
            ))}

            <TouchableOpacity
              style={styles.buttonYellow}
              onPress={() => setGarageObject({ ...garageObject, disposableVehicles: [...garageObject.disposableVehicles, ''] })}>
              <Text style={styles.textButton}>Add Disposable Vehicle</Text>
            </TouchableOpacity>
          </View>

          <View style={{ flex: 1, flexDirection: 'column', justifyContent: 'flex-end' }}>
            <TouchableOpacity
              style={styles.buttonGreen}
              onPress={editGarageObject}>
              <Text style={styles.textButton}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default Garages;
