import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TextInput, ToastAndroid, TouchableOpacity, View } from 'react-native';
import { VehicleContext } from '../context/VehicleContext';
import DropDownPicker from 'react-native-dropdown-picker';
import { GarageContext } from '../context/GarageContext';
import { BlurView } from '@react-native-community/blur';
import React, { useContext, useState } from 'react';
import styles from '../styles/Styles';
import uuid from 'react-native-uuid';
import util from '../util/Util';

const Vehicles = () => {

  const { garageObjects, setGarageObjects } = useContext(GarageContext);
  const { vehicleObjects, setVehicleObjects } = useContext(VehicleContext);

  const [addNewVehicleContainerHeight, setAddVehicleContainerHeight] = useState(55);
  const [selectedGarageLocation, setSelectedGarageLocation] = useState('');
  const [pickerOpen, setPickerOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [vehicleObject, setVehicleObject] = useState({
    uuid: '',
    vehicleName: '',
    garageLocation: ''
  });

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

  const removeVehicle = async (vehicleObjectToRemove) => {

    Alert.alert(
      'Remove Vehicle',
      'Are you sure you want to remove ' + vehicleObjectToRemove.vehicleName + ' in ' + vehicleObjectToRemove.garageLocation + '?',
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
              const garageIndex = garageObjects.findIndex((garageObj) => garageObj.location === vehicleObjectToRemove.garageLocation);
              const garageObject = garageObjects[garageIndex];
              const newVehicleList = garageObject.vehicles.filter((vehicleObj) => vehicleObj.uuid !== vehicleObjectToRemove.uuid);
              garageObjects[garageIndex] = { ...garageObject, vehicles: newVehicleList };

              await util.saveObject('@GarageObjectList', garageObjects);

              // Remove from vehicleObjects
              const indexToRemove = vehicleObjects.findIndex(vehicleObj => vehicleObj.uuid === vehicleObjectToRemove.uuid);
              const newVehicleObjects = [...vehicleObjects];
              if (indexToRemove !== -1) {
                newVehicleObjects.splice(indexToRemove, 1);
              }
              setVehicleObjects(newVehicleObjects);

              ToastAndroid.showWithGravity(
                'Vehicle removed.',
                ToastAndroid.SHORT,
                ToastAndroid.TOP, // Not working
              );

            } catch (error) {
              console.error(error);
            } finally {
              setVehicleObject({ ...vehicleObject, vehicleName: '' });
              setLoading(false);
            }
          },
        },
      ],
      { cancelable: false }
    );
  };

  return (
    <View >
      <ScrollView style={{ zIndex: 0 }}>

        <View style={styles.separatorTop} />

        {vehicleObjects.map((vehicleObj, index) => (
          <View key={index} style={styles.containerForLists}>
            <TouchableOpacity>
              <Text style={styles.textListItemVehicleB}>
                {vehicleObj.vehicleName}
              </Text>
            </TouchableOpacity>

            <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'flex-end' }}>
              <TouchableOpacity
                style={{ marginRight: 20 }}>
                <Text style={styles.textListItemVehicleM}>
                  {'at ' + vehicleObj.garageLocation}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => removeVehicle(vehicleObj)}>
                <Text style={{ color: 'red', fontFamily: util.getFontName(), fontSize: 12 }}>Remove</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}

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

      {loading && (
        <View style={styles.loadingContainer}>
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
