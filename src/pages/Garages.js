import { Alert, Modal, ScrollView, Text, TextInput, ToastAndroid, TouchableOpacity, View } from 'react-native';
import React, { useContext, useEffect, useMemo, useState } from 'react';
import { WishlistContext } from '../context/WishlistContext';
import { VehicleContext } from '../context/VehicleContext';
import { useFocusEffect } from '@react-navigation/native';
import { GarageContext } from '../context/GarageContext';
import AwesomeAlert from 'react-native-awesome-alerts';
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
  const [showGarageDetailsVisible, setShowGarageDetailsVisible] = useState(false);
  const [editGarageModalVisible, setEditGarageModalVisible] = useState(false);
  const [addGarageModalVisible, setAddGarageModalVisible] = useState(false);

  // Alert stuff
  const [showAlert, setShowAlert] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    confirmButtonText: '',
    message: '',
    showCancelButton: true,
    title: '',
  });

  const [garageObject, setGarageObject] = useState({
    capacity: '',
    disposableVehicles: [],
    location: '',
    theme: '',
    uuid: '',
    vehicles: [vehicleObject],
    wishlist: [wishlistObject]
  });

  const [vehicleObject, setVehicleObject] = useState({
    garageLocation: '',
    modified: true,
    uuid: '',
    vehicleName: ''
  });

  const [wishlistObject, setWishlistObject] = useState({
    garageTheme: '',
    price: '',
    tradePrice: '',
    uuid: '',
    vehicleName: ''
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

    let allWishlistObjects = [];
    let allVehicleObjects = [];

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

      // Firstly, remove edited garage from garageObjects list
      // There is only one garage with a specific location so it is safe to use index.
      const indexToRemove = garageObjects.findIndex(garageObj => garageObj.location === oldGarageLocation);
      const newGarageObjects = [...garageObjects];
      if (indexToRemove !== -1) {
        newGarageObjects.splice(indexToRemove, 1);
      }

      if (!verifyGarageFields(newGarageObjects)) {
        return;
      }

      // Update vehicle locations and wishlist themes inside the garageObject
      if (oldGarageLocation !== garageObject.location) {
        await updateVehicleLocations(garageObject);
      }
      if (oldGarageTheme !== garageObject.theme) {
        await updateWishlistThemes(garageObject);
      }

      // Add the edited garage back into garageObjects list
      const garageInsertionIndex = util.findGarageInsertionIndex(newGarageObjects, garageObject);
      newGarageObjects.splice(garageInsertionIndex, 0, garageObject);

      await util.saveObject('@GarageObjectList', newGarageObjects);
      setGarageObjects(newGarageObjects);

      // Update vehicle list and wishlist
      if (oldGarageLocation !== garageObject.location) {
        await refreshVehicleList();
      }
      if (oldGarageTheme !== garageObject.theme) {
        await refreshWishlist();
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

    setAlertConfig({

      confirmButtonText: 'Confirm',
      message: 'Are you sure you want to remove the garage at ' + oldGarageLocation + '?',
      showCancelButton: true,
      title: 'Remove Garage',

      onConfirmPressed: async () => {
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
          if (garageObject.vehicles.length !== 0) {
            await removeVehicleObjects(oldGarageLocation);
          }
          if (garageObject.wishlist.length !== 0) {
            await removeWishlistObjects(oldGarageTheme);
          }

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
          setShowAlert(false);
        }
      },
    });

    setShowAlert(true);
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

  const updateVehicleLocations = async (garageObject) => {
    for (const vehicle of garageObject.vehicles) {
      vehicle.garageLocation = garageObject.location;
    }
  };

  const updateWishlistThemes = async (garageObject) => {
    for (const wishlistItem of garageObject.wishlist) {
      wishlistItem.garageTheme = garageObject.theme;
    }
  };

  const refreshVehicleList = async () => {
    let allVehicleObjects = [];
    for (const garageObject of garageObjects) {
      if (garageObject.vehicles.length > 0) {
        allVehicleObjects = [...allVehicleObjects, ...garageObject.vehicles].sort(util.compareVehicles);
      }
    }
    setVehicleObjects(allVehicleObjects);
  };

  const refreshWishlist = async () => {
    let allWishlistObjects = [];
    for (const garageObject of garageObjects) {
      if (garageObject.wishlist.length > 0) {
        allWishlistObjects = [...allWishlistObjects, ...garageObject.wishlist].sort(util.compareWishlistItems);
      }
    }
    setWishlistObjects(allWishlistObjects);
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

  const memoizedGarageObjects = useMemo(() => garageObjects.map((currentGarageObject, index) => (
    <View key={index} style={styles.containerGarageList}>
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
  )), [garageObjects]);

  return (
    <View style={{ flex: 1 }}>

      <ScrollView>
        <View style={styles.separatorTop} />
        {memoizedGarageObjects}
      </ScrollView>

      <TouchableOpacity
        onPress={openAddNewGarageWindow}
        style={styles.buttonGreen}>
        <Text style={styles.textButton}>Add New Garage</Text>
      </TouchableOpacity>

      <AwesomeAlert
        cancelButtonColor='#c70000'
        cancelText='Cancel'
        closeOnHardwareBackPress={true}
        closeOnTouchOutside={true}
        confirmButtonColor='#2D640F'
        confirmText={alertConfig.confirmButtonText}
        message={alertConfig.message}
        show={showAlert}
        showCancelButton={alertConfig.showCancelButton}
        showConfirmButton={true}
        title={alertConfig.title}

        cancelButtonStyle={{
          marginRight: 5
        }}
        cancelButtonTextStyle={{
          fontFamily: util.getBoldFontName(),
          fontSize: 12
        }}
        confirmButtonStyle={{
          marginLeft: 5
        }}
        confirmButtonTextStyle={{
          fontFamily: util.getBoldFontName(),
          fontSize: 12
        }}
        contentContainerStyle={{
          backgroundColor: '#F2F2F2'
        }}
        messageStyle={{
          fontFamily: util.getFontName(),
          fontSize: 12,
          marginBottom: 10
        }}
        titleStyle={{
          fontFamily: util.getBoldFontName(),
          fontSize: 15,
          marginBottom: 10
        }}

        onConfirmPressed={alertConfig.onConfirmPressed}
        onCancelPressed={() => { setShowAlert(false); }}
      />

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

            <Text style={styles.textGarageDetailsTitle}>{'Details'}</Text>

            <View style={styles.containerGarageDetailsSoftTitle}>
              <Text style={styles.textGarageDetailsSoftTitle}>Theme: </Text>
              <Text style={styles.textGarageDetails}>{garageObject.theme}</Text>
            </View>

            <View style={styles.containerGarageDetailsSoftTitle}>
              <Text style={styles.textGarageDetailsSoftTitle}>Capacity: </Text>
              <Text style={styles.textGarageDetails}>{garageObject.capacity}</Text>
            </View>

            <View style={styles.containerGarageDetailsSoftTitle}>
              <Text style={styles.textGarageDetailsSoftTitle}>Available Space: </Text>
              <Text style={styles.textGarageDetails}>{garageObject.capacity - garageObject.vehicles.length}</Text>
            </View>

            <View style={styles.separatorTop} />

            <Text style={styles.textGarageDetailsTitle}>{'Vehicles' + ' (' + garageObject.vehicles.length + ')'}</Text>

            <View>
              {garageObject.vehicles && garageObject.vehicles.map((vehicleObj, index) => (
                <View key={index} style={styles.containerSimpleLists}>
                  <TouchableOpacity onPress={() => util.openVehicleFandomPage(vehicleObj.vehicleName)}>
                    <Text style={styles.textGarageDetails}>{vehicleObj?.vehicleName || 'Unknown Vehicle'}</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>

            <View style={styles.separatorTop} />

            <Text style={styles.textGarageDetailsTitle}>{'Disposible Vehicles' + ' (' + garageObject.disposableVehicles.length + ')'}</Text>

            <View>{garageObject.disposableVehicles && garageObject.disposableVehicles.map((disposableVehicle, index) => (
              <View key={index} style={styles.containerSimpleLists}>
                <TouchableOpacity onPress={() => util.openVehicleFandomPage(disposableVehicle)}>
                  <Text style={styles.textGarageDetails}>{disposableVehicle}</Text>
                </TouchableOpacity>
              </View>
            ))}
            </View>

            <View style={styles.separatorTop} />

            <Text style={styles.textGarageDetailsTitle}>{'Wishlist' + ' (' + garageObject.wishlist.length + ')'}</Text>

            <View>{garageObject.wishlist && garageObject.wishlist.map((wishlistObj, index) => (
              <View key={index} style={styles.containerSimpleLists}>
                <TouchableOpacity onPress={() => util.openVehicleFandomPage(wishlistObj.vehicleName)}>
                  <Text style={styles.textGarageDetails}>{wishlistObj?.vehicleName || 'Unknown Vehicle'}</Text>
                </TouchableOpacity>
              </View>
            ))}
            </View>

          </ScrollView>

          <View style={{
            borderTopColor: 'grey',
            borderTopWidth: 1,
            flexDirection: 'column'
          }}>
            <TouchableOpacity
              onPress={() => openEditGarageWindow()}
              style={[styles.buttonGreen, { marginBottom: 0 }]}>
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
              style={styles.buttonOrange}
              onPress={() => setGarageObject({ ...garageObject, disposableVehicles: [...garageObject.disposableVehicles, ''] })}>

              <Text style={styles.textButton}>Add Disposable Vehicle</Text>

            </TouchableOpacity>
          </View>

          <View style={styles.containerButton}>
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
              style={styles.buttonOrange}
              onPress={() => setGarageObject({ ...garageObject, disposableVehicles: [...garageObject.disposableVehicles, ''] })}>
              <Text style={styles.textButton}>Add Disposable Vehicle</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.containerButton}>
            <TouchableOpacity
              style={styles.buttonGreen}
              onPress={editGarageObject}>
              <Text style={styles.textButton}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View >
  );
};

export default Garages;
