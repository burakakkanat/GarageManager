import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput } from 'react-native';
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

  const addCar = async () => {
    if (!carName) {
      return;
    }

    try {
      const garageCars = await retrieveData(`${selectedGarage}_cars`);
      const cars = [...garageCars, carName];
      await AsyncStorage.setItem(`${selectedGarage}_cars`, JSON.stringify(cars));
      setAllCars(cars);
      console.log(allCars)
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
            onPress={() => handleDelete(carName)}
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
              <Picker.Item key={name} label={name} value={name} color='black' />
            ))}
        </Picker>
      </View>

      <TouchableOpacity
        onPress={addCar}
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
