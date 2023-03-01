import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, } from 'react-native';
import React, { useContext, useEffect, useState } from 'react';
import { VehicleContext } from '../../Context/VehicleContext';
import DropDownPicker from 'react-native-dropdown-picker';
import { GarageContext } from '../../Context/GarageContext';
import { BlurView } from '@react-native-community/blur';
import uuid from 'react-native-uuid';
import styles from '../styles/Styles';
import util from '../util/Util';

const Vehicles = () => {

  const { garageObjects, setGarageObjects } = useContext(GarageContext);
  const { vehicleObjects, setVehicleObjects } = useContext(VehicleContext);

  const [selectedGarageLocation, setSelectedGarageLocation] = useState('');
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerItemsLoading, setPickerItemsLoading] = useState(false);
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
              const newVehicleObjects = vehicleObjects.filter(vehicleObj => vehicleObj.uuid !== vehicleObjectToRemove.uuid);
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
                <Text style={{ color: 'red', fontFamily: util.getFontName(), fontSize: 12 }}>Remove</Text>
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
            fontFamily: util.getFontName(),
            fontSize: 10
          }}

          placeholder='Choose a garage'
          placeholderStyle={{
            fontFamily: util.getFontName(),
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
