import React, { useState, useEffect } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import AsyncStorage from '@react-native-community/async-storage';

const Cars = () => {

  const [garageNames, setGarageNames] = useState([]);
  const [allCars, setAllCars] = useState([]);
  const [carName, setCarName] = useState('');
  const [selectedGarage, setSelectedGarage] = useState('');

  useEffect(() => {
    // Get the list of garage names from local storage
    const getGarageNames = async () => {
      const garageNames = await retrieveData('garageNames');
      setGarageNames(garageNames);
    };
    getGarageNames();
  }, []);

  useEffect(() => {
    // Get the list of all cars in all garages from local storage
    const getCars = async () => {
      const cars = [];
      for (const garageName of garageNames) {
        const garageCars = await retrieveData(`${garageName}_cars`);
        cars.push(...garageCars);
      }
      cars.sort();
      setAllCars(cars);
    };
    getCars();
  }, [garageNames]);

  const updateGarageNames = async () => {
    const garageNames = await retrieveData('garageNames');
    setGarageNames(garageNames);
  };

  const addNewCar = async () => {

    if (!carName) {
      Alert.alert('Add New Car', "Car name can not be empty.");
      return;
    }

    if (carName.includes(']')) {
      Alert.alert('Add New Car', 'Car name can not contain " ] " character.');
      return;
    }

    carNameWithGarageName = '[' + selectedGarage + '] ' + carName;

    try {

      const garageCars = await retrieveData(`${selectedGarage}_cars`);
      const updatedGarageCars = [...garageCars, carNameWithGarageName];
      await AsyncStorage.setItem(`${selectedGarage}_cars`, JSON.stringify(updatedGarageCars));

      const allCarNames = [];

      for (const garageName of garageNames) {
        const garageCars = await retrieveData(`${garageName}_cars`);
        allCarNames.push(...garageCars);
      }

      allCarNames.sort();
      setAllCars(allCarNames);

      setCarName('');

    } catch (error) {
      console.error(error);
    }
  };

  const removeCar = async (carNameWithGarageName) => {

    const garageNameEndIndex = carNameWithGarageName.indexOf(']');
    const nameofTheGarage = carNameWithGarageName.substr(1, garageNameEndIndex - 1);
    const carToRemove = carNameWithGarageName.substr(garageNameEndIndex + 2);

    Alert.alert(
      'Remove Car',
      'Are you sure you want to remove ' + carToRemove + ' in ' + nameofTheGarage + '?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'OK',
          onPress: async () => {
            try {

              // Find and remove the car from specific garage
              const garageCars = await retrieveData(`${nameofTheGarage}_cars`);
              const updatedGarageCars = garageCars.filter(e => e !== carNameWithGarageName);

              await AsyncStorage.setItem(`${nameofTheGarage}_cars`, JSON.stringify(updatedGarageCars));

              // Update the car list
              const allCarNames = [];

              for (const garageName of garageNames) {
                const garageCars = await retrieveData(`${garageName}_cars`);
                allCarNames.push(...garageCars);
              }

              allCarNames.sort();
              setAllCars(allCarNames);

            } catch (error) {
              console.error(error);
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
        {allCars.map((carName, index) => (
          <View
            style={styles.carListContainer}
          >

            <View style={{ flex: 1, flexDirection: 'row' }}>
              <TouchableOpacity>
                <Text style={{ color: 'black', fontWeight: 'bold' }}>
                  {carName.substr(carName.indexOf(']') + 2)}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={{ marginLeft: 'auto' }}>
                <Text style={{ color: 'black' }}>{'[' + carName.substr(1, carName.indexOf(']') - 1) + ']'}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={{ marginLeft: 'auto' }}
                onPress={() => removeCar(carName)}>
                <Text style={{ color: 'red' }}>Remove</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>

      <View style={{ flexDirection: 'row', alignItems: 'center', margin: 10 }}>
        <TextInput
          style={styles.addNewCarContainer}
          onChangeText={text => setCarName(text)}
          value={carName}
          placeholder="Car Name"
          placeholderTextColor="grey"
        />

        <Picker
          selectedValue={selectedGarage}
          style={styles.picketContainer}
          onValueChange={itemValue => setSelectedGarage(itemValue)}
          dropdownIconColor='black'
          prompt='Your Garages'>

          {garageNames.map(name => (
            <Picker.Item label={name} value={name} color='black' />
          ))}

        </Picker>
      </View>

      <TouchableOpacity
        onPress={addNewCar}
        style={styles.button}
      >
        <Text style={{ color: 'white' }}>Add New Car</Text>
      </TouchableOpacity>
    </View>
  );
};

const retrieveData = async key => {
  try {
    const value = await AsyncStorage.getItem(key);
    if (value !== null) {
      return JSON.parse(value) || [];
    }
    return [];
  } catch (error) {
    console.error(error);
    return [];
  }
};

const styles = StyleSheet.create({
  button: {
    padding: 10,
    backgroundColor: '#2D640F',
    alignItems: 'center',
    justifyContent: 'center',
    margin: 10
  },
  addNewCarContainer: {
    height: 40,
    borderColor: 'gray',
    color: 'black',
    borderWidth: 1,
    flex: 1,
    marginRight: 10
  },
  carListContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc'
  },
  picketContainer: {
    height: 40,
    width: 200,
    dropdownIconColor: 'black'
  },
  textInput: {
    color: 'black',
    borderWidth: 0.5,
    margin: 10
  }
});

export default Cars;
