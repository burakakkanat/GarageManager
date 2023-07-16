import { BackHandler, ScrollView, StyleSheet, Text, TextInput, ToastAndroid, TouchableOpacity, View } from 'react-native';
import React, { useContext, useEffect, useMemo, useState } from 'react';
import DropDownPicker from 'react-native-dropdown-picker';
import { GarageContext } from '../context/GarageContext';
import { BlurView } from '@react-native-community/blur';
import styles from '../styles/Styles';
import uuid from 'react-native-uuid';
import util from '../util/Util';

const Vehicles = () => {

  const { garageObjects, setGarageObjects } = useContext(GarageContext);

  const [addNewVehicleContainerHeight, setAddVehicleContainerHeight] = useState(55);
  const [selectedGarageLocation, setSelectedGarageLocation] = useState('');
  const [vehicleMenuActive, setVehicleMenuActive] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [inProgress, setInProgress] = useState(false);

  // Alert stuff
  const [showAlert, setShowAlert] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    confirmButtonText: '',
    message: '',
    showCancelButton: true,
    title: '',
  });

  const [vehicleObject, setVehicleObject] = useState({
    garageLocation: '',
    modified: true,
    uuid: '',
    vehicleName: '',
  });

  useEffect(() => {
    const backAction = () => {
      if (vehicleMenuActive) {
        closeVehicleMenu();
        return true;
      }
      return false;
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);

    return () => backHandler.remove();
  }, [vehicleMenuActive]);

  const setEmptyVehicleObject = async () => {
    setVehicleObject({ ...vehicleObject, garageLocation: '', modified: true, uuid: '', vehicleName: '' });
  }

  const handleSearchChange = (text) => {
    setSearchValue(text);
  };

  const openVehicleMenu = (vehicleObj) => {
    setVehicleObject(vehicleObj);
    setVehicleMenuActive(true);
  };

  const closeVehicleMenu = async () => {
    setEmptyVehicleObject();
    setSelectedGarageLocation('');
    setVehicleMenuActive(false);
  }

  const addNewVehicle = async () => {

    setInProgress(true); // Not working

    try {

      if (!vehicleObject.vehicleName.trim()) {

        setAlertConfig({
          confirmButtonText: 'OK',
          message: 'Vehicle name can not be empty.',
          showCancelButton: false,
          title: 'Error',
          onConfirmPressed: async () => { setShowAlert(false) }
        });

        setShowAlert(true);
        return;
      }

      if (vehicleObject.garageLocation === '') {

        setAlertConfig({
          confirmButtonText: 'OK',
          message: 'Please choose a garage.',
          showCancelButton: false,
          title: 'Error',
          onConfirmPressed: async () => { setShowAlert(false) }
        });

        setShowAlert(true);
        return;
      }

      vehicleObject.uuid = uuid.v4();

      await setGarageObjects(prevGarageObjects => {
        const selectedGarageIndex = prevGarageObjects.findIndex(garageObj => garageObj.location === vehicleObject.garageLocation);
        const selectedGarageObject = prevGarageObjects[selectedGarageIndex];

        selectedGarageObject.vehicles.push(vehicleObject);
        selectedGarageObject.vehicles.sort(util.compareVehicles);

        util.saveObject('@GarageObjectList', prevGarageObjects);

        return [...prevGarageObjects];
      });

      ToastAndroid.showWithGravity(
        'Vehicle added',
        ToastAndroid.SHORT,
        ToastAndroid.TOP, // Not working
      );

    } catch (error) {
      console.error(error);
    } finally {
      setVehicleObject({ ...vehicleObject, vehicleName: '' }); // setEmptyVehicleObject isn't used on purpose. This makes easier to add cars back to back.
      setInProgress(false);
    }
  };

  const removeVehicle = async () => {

    setAlertConfig({

      confirmButtonText: 'Confirm',
      message: 'Are you sure you want to remove ' + vehicleObject.vehicleName + ' in ' + vehicleObject.garageLocation + '?',
      showCancelButton: true,
      title: 'Remove Vehicle',

      onConfirmPressed: async () => {
        try {
          setInProgress(true); // Working but loading icon is overlapped by alert

          // Remove from the garage
          const newGarageObjects = [...garageObjects];
          const garageIndex = newGarageObjects.findIndex((garageObj) => garageObj.location === vehicleObject.garageLocation);
          const newGarageObject = newGarageObjects[garageIndex];
          const newVehicleList = newGarageObject.vehicles.filter((vehicleObj) => vehicleObj.uuid !== vehicleObject.uuid);
          newGarageObjects[garageIndex] = { ...newGarageObject, vehicles: newVehicleList };

          setGarageObjects(newGarageObjects);
          await util.saveObject('@GarageObjectList', newGarageObjects);

          ToastAndroid.showWithGravity(
            'Vehicle removed',
            ToastAndroid.SHORT,
            ToastAndroid.TOP, // Not working
          );

        } catch (error) {
          console.error(error);
        } finally {
          closeVehicleMenu();
          setInProgress(false);
          setShowAlert(false);
        }
      },
      onCancelPressed: async () => {
        setShowAlert(false);
      }
    });

    setShowAlert(true);
  };

  const changeVehicleModifiedStatus = async (modifiedStatus) => {

    setInProgress(true);

    try {
      const newGarageObjects = [...garageObjects];
      const garageIndex = newGarageObjects.findIndex(garageObj => garageObj.location === vehicleObject.garageLocation);
      const newGarageObject = newGarageObjects[garageIndex];

      for (const vehicle of newGarageObject.vehicles) {
        if (vehicle.uuid === vehicleObject.uuid) {
          vehicle.modified = modifiedStatus;
          break;
        }
      }

      setGarageObjects(newGarageObjects);
      await util.saveObject('@GarageObjectList', newGarageObjects);

      if (modifiedStatus) {
        ToastAndroid.showWithGravity(
          'Vehicle marked as modified',
          ToastAndroid.SHORT,
          ToastAndroid.TOP, // Not working
        );
      } else {
        ToastAndroid.showWithGravity(
          'Vehicle marked as stock',
          ToastAndroid.SHORT,
          ToastAndroid.TOP, // Not working
        );
      }


    } catch (error) {
      console.error(error);
    } finally {
      closeVehicleMenu();
      setInProgress(false);
    }
  }

  const filteredVehicleObjects = useMemo(() => {

    const allVehicles = garageObjects.flatMap(garage => garage.vehicles);

    if (!searchValue || searchValue == '') {
      return allVehicles;
    } else if (searchValue === 'Stock') {
      return allVehicles.filter((vehicleObj) => !vehicleObj.modified);
    } else if (searchValue === 'Modified') {
      return allVehicles.filter((vehicleObj) => vehicleObj.modified);
    } else {
      return allVehicles.filter((vehicleObj) => vehicleObj.vehicleName.toLowerCase().includes(searchValue.toLowerCase()));
    }

  }, [searchValue, garageObjects]);

  const memorizedVehicleObjects = useMemo(() =>
    filteredVehicleObjects.map((vehicleObj, index) => {
      const vehicleNameStyle = vehicleObj.modified ? styles.textListItemVehicleB : [styles.textListItemVehicleB, { color: 'orange' }];
      return (
        <View key={index} style={styles.containerList}>
          <View style={{ flex: 1 }}>
            <TouchableOpacity onPress={() => openVehicleMenu(vehicleObj)}>
              <Text style={vehicleNameStyle}>{vehicleObj.vehicleName}</Text>
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
    }),
    [filteredVehicleObjects]
  );

  return (
    <View style={{ height: '100%' }}>

      <TextInput
        inlineImageLeft='search_icon'
        inlineImagePadding={20}
        onChangeText={handleSearchChange}
        placeholder='"Stock", "Modified" or vehicle name...'
        placeholderTextColor='gray'
        style={styles.textInputSearch}
        value={searchValue}
      />

      <View style={styles.separatorTop} />

      <ScrollView style={{ zIndex: 0 }}>
        {memorizedVehicleObjects}
        <View style={{ height: 115 }}></View>
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
        disabled={inProgress}
        style={[styles.buttonGreen, { bottom: 0, position: 'absolute', width: '95%', zIndex: 1 }]}
      >
        <Text style={styles.textButton}>Add New Vehicle</Text>
      </TouchableOpacity>

      {util.renderAwesomeAlert(alertConfig, showAlert)}

      {vehicleMenuActive && (
        <View style={styles.containerVehicleMenu}>
          <BlurView blurType='light' blurAmount={1} style={StyleSheet.absoluteFill}>
            <View style={styles.containerVehicleMenuItems}>

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

      {util.renderInProgress(inProgress)}

    </View>
  );
};

export default Vehicles;
