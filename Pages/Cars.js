import React, { useState, useEffect } from 'react';
import { Alert, ScrollView, Text, TextInput, TouchableOpacity, View, } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import AsyncStorage from '@react-native-community/async-storage';

const Cars = ({ addGarage }) => {

  const [garageNames, setGarageNames] = useState([]);
  const [allCars, setAllCars] = useState([]);
  const [carName, setCarName] = useState('');
  const [selectedGarage, setSelectedGarage] = useState('');

  useEffect(() => {
    const getGarageNames = async () => {
      const garageNames = await retrieveData('garageNames');
      setGarageNames(garageNames);
    };
    getGarageNames();
  }, []);

  useEffect(() => {
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

  const addNewGarage = async () => {
    await addGarage();
    const updatedGarageNames = await retrieveData('garageNames');
    setGarageNames(updatedGarageNames);
  };

  const addNewCar = async () => {

    if (!carName) {
      Alert.alert('Error', "Car name can not be empty.");
      return;
    }

    if (carName.includes(']')) {
      Alert.alert('Error', 'Car name can not contain " ] " character.');
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

    } catch (error) {
      console.error(error);
    }
  };

  const deleteCar = async (carNameWithGarageName) => {

    try {

      const garageNameEndIndex = carNameWithGarageName.indexOf(']');
      const nameofTheGarage = carNameWithGarageName.substr(1, garageNameEndIndex - 1);
      const carToRemove = carNameWithGarageName.substr(garageNameEndIndex + 2);

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
  };

  return (
    <View style={{ flex: 1 }}>
      <ScrollView>
        {allCars.map((carName, index) => (
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              padding: 16,
              borderBottomWidth: 1,
              borderBottomColor: '#ccc'
            }}
          >

          <TouchableOpacity>
            <Text style={{color: 'black'}}>{carName}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={{ marginLeft: 'auto' }}
            onPress={() => deleteCar(carName)}
          >
            <Text style={{color: 'red'}}>Delete</Text>
          </TouchableOpacity>
        </View>
      ))}
      </ScrollView>

      <View style={{ flexDirection: 'row', alignItems: 'center', margin: 10 }}>
        <TextInput
          style={{
            height: 40,
            borderColor: 'gray',
            color: 'black',
            borderWidth: 1,
            flex: 1,
            marginRight: 10}}
          onChangeText={text => setCarName(text)}
          value={carName}
          placeholder="Car Name"
          placeholderTextColor="grey"
        />

        <Picker
          selectedValue={selectedGarage}
          style={{
            height: 40,
            width: 200,
            dropdownIconColor: 'black'}}
          onValueChange={itemValue => setSelectedGarage(itemValue)}
          dropdownIconColor= 'black'
          prompt='Your Garages'
          >
            {garageNames.map(name => (
              <Picker.Item label={name} value={name} color='black' />
            ))}
        </Picker>
      </View>

      <TouchableOpacity
        onPress={addNewCar}
        style={{
          height: 40,
          backgroundColor: '#009A44',
          alignItems: 'center',
          justifyContent: 'center',
          margin: 10 }}
        >
        <Text style={{ color: 'white' }}>Add Car</Text>
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

export default Cars;
