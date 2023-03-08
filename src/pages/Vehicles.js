import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TextInput, ToastAndroid, TouchableOpacity, View } from 'react-native';
import React, { useContext, useMemo, useState } from 'react';
import { VehicleContext } from '../context/VehicleContext';
import DropDownPicker from 'react-native-dropdown-picker';
import { GarageContext } from '../context/GarageContext';
import { BlurView } from '@react-native-community/blur';
import styles from '../styles/Styles';
import uuid from 'react-native-uuid';
import util from '../util/Util';

const Vehicles = () => {

  const { vehicleObjects, setVehicleObjects } = useContext(VehicleContext);
  const { garageObjects, setGarageObjects } = useContext(GarageContext);

  const [addNewVehicleContainerHeight, setAddVehicleContainerHeight] = useState(55);
  const [selectedGarageLocation, setSelectedGarageLocation] = useState('');
  const [vehicleMenuActive, setVehicleMenuActive] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [vehicleObject, setVehicleObject] = useState({
    garageLocation: '',
    modified: true,
    uuid: '',
    vehicleName: '',
  });

  const setEmptyVehicleObject = async () => {
    setVehicleObject({ ...vehicleObject, garageLocation: '', modified: true, uuid: '', vehicleName: '' });
  }

  const openVehicleMenu = (vehicleObj) => {
    setVehicleObject(vehicleObj);
    setVehicleMenuActive(true);
  };

  const addNewVehicle = async () => {

    if (!vehicleObject.vehicleName.trim()) {
      Alert.alert('Error', 'Vehicle name can not be empty.');
      return;
    }

    if (vehicleObject.garageLocation === '') {
      Alert.alert('Error', 'Please choose a garage.');
      return;
    }

    try {
      setLoading(true);

      vehicleObject.uuid = uuid.v4();

      setGarageObjects(prevGarageObjects => {
        const selectedGarageIndex = prevGarageObjects.findIndex(garageObj => garageObj.location === vehicleObject.garageLocation);
        const selectedGarageObject = prevGarageObjects[selectedGarageIndex];

        selectedGarageObject.vehicles.push(vehicleObject);
        selectedGarageObject.vehicles.sort(util.compareVehicles);

        util.saveObject('@GarageObjectList', prevGarageObjects);

        return [...prevGarageObjects];
      });

      setVehicleObjects(prevVehicleObjects => {
        const newVehicleObjects = [...prevVehicleObjects];
        const vehicleInsertionIndex = util.findVehicleInsertionIndex(newVehicleObjects, vehicleObject);
        newVehicleObjects.splice(vehicleInsertionIndex, 0, vehicleObject);

        return newVehicleObjects;
      });

      ToastAndroid.showWithGravity(
        'Vehicle added.',
        ToastAndroid.SHORT,
        ToastAndroid.TOP, // Not working
      );

    } catch (error) {
      console.error(error);
    } finally {
      setVehicleObject({ ...vehicleObject, vehicleName: '' });
      setLoading(false);
    }

  };

  const removeVehicle = async () => {

    Alert.alert(
      'Remove Vehicle',
      'Are you sure you want to remove ' + vehicleObject.vehicleName + ' in ' + vehicleObject.garageLocation + '?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'OK',
          onPress: async () => {
            try {
              setLoading(true);

              // Remove from the garage
              const newGarageObjects = [...garageObjects];
              const garageIndex = newGarageObjects.findIndex((garageObj) => garageObj.location === vehicleObject.garageLocation);
              const newGarageObject = newGarageObjects[garageIndex];
              const newVehicleList = newGarageObject.vehicles.filter((vehicleObj) => vehicleObj.uuid !== vehicleObject.uuid);
              newGarageObjects[garageIndex] = { ...newGarageObject, vehicles: newVehicleList };

              setGarageObjects(newGarageObjects);
              await util.saveObject('@GarageObjectList', newGarageObjects);

              // Remove from vehicleObjects
              const indexToRemove = vehicleObjects.findIndex(vehicleObj => vehicleObj.uuid === vehicleObject.uuid);
              const newVehicleObjects = [...vehicleObjects];
              if (indexToRemove !== -1) {
                newVehicleObjects.splice(indexToRemove, 1);
              }
              setVehicleObjects(newVehicleObjects);

              setVehicleMenuActive(false);

              ToastAndroid.showWithGravity(
                'Vehicle removed.',
                ToastAndroid.SHORT,
                ToastAndroid.TOP, // Not working
              );

            } catch (error) {
              console.error(error);
            } finally {
              setEmptyVehicleObject();
              setLoading(false);
            }
          },
        },
      ],
      { cancelable: false }
    );
  };

  const changeVehicleModifiedStatus = async (modifiedStatus) => {

    try {
      const newGarageObjects = [...garageObjects];
      const garageIndex = newGarageObjects.findIndex((garageObj) => garageObj.location === vehicleObject.garageLocation);
      const newGarageObject = newGarageObjects[garageIndex];

      for (const vehicle of newGarageObject.vehicles) {
        if (vehicle.uuid === vehicleObject.uuid) {
          vehicle.modified = modifiedStatus;
          setEmptyVehicleObject();
          break;
        }
      }

      setGarageObjects(newGarageObjects);
      await util.saveObject('@GarageObjectList', newGarageObjects);

      if (modifiedStatus) {
        ToastAndroid.showWithGravity(
          'Vehicle set as modified.',
          ToastAndroid.SHORT,
          ToastAndroid.TOP, // Not working
        );
      } else {
        ToastAndroid.showWithGravity(
          'Vehicle set as stock.',
          ToastAndroid.SHORT,
          ToastAndroid.TOP, // Not working
        );
      }

      refreshVehicleList();
    } catch (error) {
      console.error(error);
    } finally {
      setEmptyVehicleObject();
      setVehicleMenuActive(false);
    }
  }

  const refreshVehicleList = async () => {
    let allVehicleObjects = [];
    for (const garageObject of garageObjects) {
      if (garageObject.vehicles.length > 0) {
        allVehicleObjects = [...allVehicleObjects, ...garageObject.vehicles].sort(util.compareVehicles);
      }
    }
    setVehicleObjects(allVehicleObjects);
  };

  const memorizedVehicleObjects = useMemo(() =>
    vehicleObjects.map((vehicleObj, index) => {
      const vehicleNameStyle = vehicleObj.modified ? styles.textListItemVehicleB : [styles.textListItemVehicleB, { color: 'orange' }];
      return (
        <View key={index} style={styles.containerList}>
          <View style={{ flex: 1 }}>
            <TouchableOpacity
              onPress={() => openVehicleMenu(vehicleObj)}
            >
              <Text style={vehicleNameStyle}>
                {vehicleObj.vehicleName}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={{ flex: 1 }}>
            <TouchableOpacity>
              <Text style={styles.textListItemVehicleM}>
                {'at ' + vehicleObj.garageLocation}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }), [vehicleObjects]);

  return (
    <View style={{ height: '100%' }}>
      <ScrollView style={{ zIndex: 0 }}>
        <View style={styles.separatorTop} />
        {memorizedVehicleObjects}
        <View style={{ height: 110 }}></View>
      </ScrollView>

      <View style={[styles.containerAddNewVehicle, { height: addNewVehicleContainerHeight }]}>

        <TextInput
          value={vehicleObject.vehicleName}
          onChangeText={text => setVehicleObject({ ...vehicleObject, vehicleName: text })}
          style={styles.textInputNewVehicleName}
          placeholder=' Vehicle Name'
          placeholderTextColor='grey'
        />

        <DropDownPicker
          closeOnBackPressed={true}
          dropDownDirection='TOP'
          setOpen={setPickerOpen}
          open={pickerOpen}
          searchable={true}

          searchPlaceholder='Search garage location...'
          placeholder='Choose a garage'
          listMode='SCROLLVIEW'

          dropDownContainerStyle={styles.dropDownAddVehicleDropDownContainerStyle}
          placeholderStyle={styles.dropDownAddVehiclePlaceholderStyle}
          containerStyle={styles.dropDownAddVehicleContainerStyle}
          textStyle={styles.dropDownAddVehicleTextStyle}
          style={styles.dropDownAddVehicleStyle}

          items={garageObjects.map((garageObject, index) => ({
            label: garageObject.location,
            value: garageObject.location,
          }))}

          value={selectedGarageLocation}
          setValue={setSelectedGarageLocation}

          onSelectItem={(item) => {
            setVehicleObject({ ...vehicleObject, garageLocation: item.value })
          }}
          onOpen={() => {
            setAddVehicleContainerHeight(250);
          }}
          onClose={() => {
            setAddVehicleContainerHeight(55);
          }}
        />
      </View>

      <TouchableOpacity
        onPress={addNewVehicle}
        disabled={loading}
        style={[styles.buttonGreen, { bottom: 0, position: 'absolute', width: '95%', zIndex: 1 }]}
      >
        <Text style={styles.textButton}>Add New Vehicle</Text>
      </TouchableOpacity>

      {vehicleMenuActive && (
        <View style={styles.containerVehicleMenu}>
          <BlurView blurType='light' blurAmount={1} style={StyleSheet.absoluteFill}>
            <View style={styles.containerVehicleMenuItems}>

              <TouchableOpacity
                onPress={() => {
                  setVehicleMenuActive(false);
                  setVehicleObject({ ...vehicleObject, vehicleName: '', garageLocation: '' });
                }}
                style={[styles.buttonRed, { position: 'absolute', top: 0, left: 0 }]}>
                <Text style={styles.textButton}>Close</Text>
              </TouchableOpacity>

              <View style={{ left: '20%', width: '60%' }}>
                <TouchableOpacity
                  onPress={() => changeVehicleModifiedStatus(!vehicleObject.modified)}
                  style={vehicleObject.modified ? styles.buttonOrange : styles.buttonBlack}>
                  <Text style={styles.textButton}>
                    {vehicleObject.modified ? 'Mark As Stock' : 'Mark As Modified'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => util.openVehicleFandomPage(vehicleObject.vehicleName)}
                  style={styles.buttonGreen}>
                  <Text style={styles.textButton}>🔗 View Fandom Page</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => removeVehicle(vehicleObject)}
                  style={styles.buttonRed}>
                  <Text style={styles.textButton}>Remove Vehicle</Text>
                </TouchableOpacity>
              </View>
            </View>
          </BlurView>
        </View>
      )}

      {loading && (
        <View style={styles.containerLoading}>
          <BlurView blurType='light' blurAmount={3} style={StyleSheet.absoluteFill}>
            <View style={styles.loadingIndicator}>
              <ActivityIndicator size='large' color='#2D640F' />
            </View>
          </BlurView>
        </View>
      )}
    </View>
  );
};

export default Vehicles;
