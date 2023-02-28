import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, } from 'react-native';
import React, { useContext, useEffect, useState } from 'react';
import { VehicleContext } from '../Context/VehicleContext';
import DropDownPicker from 'react-native-dropdown-picker';
import { GarageContext } from '../Context/GarageContext';
import { BlurView } from '@react-native-community/blur';
import styles from './Styles';
import util from './Util';

const Vehicles = () => {

  const { garageObjects, setGarageObjects } = useContext(GarageContext);
  const { vehicleObjects, setVehicleObjects } = useContext(VehicleContext);

  const [selectedGarageLocation, setSelectedGarageLocation] = useState('');
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerItemsLoading, setPickerItemsLoading] = useState(false);
  const [loading, setLoading] = useState(false);

  const [vehicleObject, setVehicleObject] = useState({
    vehicleName: '',
    garageLocation: ''
  });

  useEffect(() => {
    // Get the list of garage names from local storage
    const getGarageObjects = async () => {
      const garages = await util.retrieveObject('@GarageObjectList');
      setGarageObjects(garages);
    };
    getGarageObjects();
  }, []);

  useEffect(() => {
    // Get the list of all vehicles in all garages from local storage
    const getVehicles = async () => {
      const vehicles = await util.retrieveObject('@VehicleObjectList');
      setVehicleObjects(vehicles);
    };
    getVehicles();
  }, []);

  const addNewVehicle = async () => {
    if (!vehicleObject.vehicleName.trim()) {
      Alert.alert('Add New Vehicle', 'Vehicle name can not be empty.');
      return;
    }

    if (vehicleObject.vehicleName.includes('_')) {
      Alert.alert('Add New Vehicle', 'Vehicle name can not contain "_" character.');
      return;
    }

    try {
      setLoading(true);
      const selectedGarageIndex = garageObjects.findIndex(garageObj => garageObj.location === vehicleObject.garageLocation);

      const newGarageObjects = [...garageObjects];
      const selectedGarageObject = { ...newGarageObjects[selectedGarageIndex] };

      selectedGarageObject.vehicles = [...selectedGarageObject.vehicles, vehicleObject.vehicleName].sort();
      newGarageObjects[selectedGarageIndex] = selectedGarageObject;

      setGarageObjects(newGarageObjects);
      await util.saveObject('@GarageObjectList', newGarageObjects);

      const newVehicleObjects = [...vehicleObjects, vehicleObject];
      newVehicleObjects.sort(util.compareVehicles);
      setVehicleObjects(newVehicleObjects);
      await util.saveObject('@VehicleObjectList', newVehicleObjects);

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

              /*
              * Updating the garage which the vehicle is removed from
              */

              // Find the garage, 
              const garageObject = garageObjects.filter(function (garageObj) {
                return garageObj.location === vehicleObjectToRemove.garageLocation;
              }).at(0);

              // Remove the vehicle from garage's vehicle list
              // We use index so that we remove only the first occurance
              const vehicleIndex = garageObject.vehicles.findIndex(vehicle => vehicle === vehicleObjectToRemove.vehicleName);
              const newVehicleList = garageObject.vehicles.filter((_, index) => index !== vehicleIndex);
              garageObject.vehicles = newVehicleList;

              await util.saveObject('@GarageObjectList', garageObjects);

              /*
              * Updating the vehicleObjects
              */

              // We use index so that we remove only the first occurance
              const vehicleObjectIndex = vehicleObjects.findIndex(vehicleObj =>
                vehicleObj.garageLocation === vehicleObjectToRemove.garageLocation &&
                vehicleObj.vehicleName === vehicleObjectToRemove.vehicleName
              );
              const newVehicleObjects = vehicleObjects.filter((_, index) => index !== vehicleObjectIndex);
              await util.saveObject('@VehicleObjectList', newVehicleObjects);
              setVehicleObjects(newVehicleObjects);

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
    <View style={{ flex: 1 }}>

      <ScrollView>
        <View style={styles.separatorTop} />
        {vehicleObjects.map((currentVehicleObject, index) => (
          <View key={index} style={styles.containerForLists}>
            <TouchableOpacity>
              <Text style={styles.textListItemVehicleB}>
                {currentVehicleObject.vehicleName}
              </Text>
            </TouchableOpacity>

            <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'flex-end' }}>
              <TouchableOpacity
                style={{ marginRight: 20 }}>
                <Text style={styles.textListItemVehicleM}>
                  {'at ' + currentVehicleObject.garageLocation}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => removeVehicle(currentVehicleObject)}>
                <Text style={{ color: 'red', fontFamily: 'FOTNewRodin Pro M', fontSize: 12 }}>Remove</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>

      <View style={styles.containerAddNewVehicle}>

        <TextInput
          value={vehicleObject.vehicleName}
          onChangeText={text => setVehicleObject({ ...vehicleObject, vehicleName: text })}
          style={styles.textInputNewVehicleName}
          placeholder=' Vehicle Name'
          placeholderTextColor='grey'
        />

        <DropDownPicker
          loading={pickerItemsLoading}
          closeOnBackPressed={true}
          dropDownDirection='TOP'
          setOpen={setPickerOpen}
          open={pickerOpen}

          items={garageObjects.map((garageObject, index) => ({
            label: garageObject.location,
            value: garageObject.location,
          }))}

          value={selectedGarageLocation}
          setValue={setSelectedGarageLocation}

          onSelectItem={(item) => {
            setVehicleObject({ ...vehicleObject, garageLocation: item.value })
          }}

          listMode='MODAL'  // #TODO: Change when dropdown bug is fixed
          modalTitle='Your Garage Locations' //#TODO: Change when dropdown bug is fixed

          scrollViewProps={{
            nestedScrollEnabled: true
          }}

          containerStyle={styles.containerPickerAddVehicle}
          dropDownContainerStyle={{
            backgroundColor: '#F2F2F2',
            height: 500
          }}
          style={{ backgroundColor: '#F2F2F2' }}
          itemStyle={{ justifyContent: 'flex-start' }}

          textStyle={{
            fontFamily: 'FOTNewRodin Pro M',
            fontSize: 10
          }}

          placeholder='Choose a garage'
          placeholderStyle={{
            fontFamily: 'FOTNewRodin Pro M',
            fontSize: 12,
            color: 'grey'
          }}
        />
      </View>

      <TouchableOpacity
        onPress={addNewVehicle}
        disabled={loading}
        style={styles.buttonGreen}
      >
        <Text style={styles.textButton}>Add New Vehicle</Text>
      </TouchableOpacity>

      {loading && (
        <View style={styles.loadingContainer}>
          <BlurView blurType='light' blurAmount={5} style={StyleSheet.absoluteFill}>
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
