import React, { useState, useEffect } from 'react';
import { Alert, Modal, ScrollView, Text, TextInput, TouchableOpacity, StyleSheet, View } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import AsyncStorage from '@react-native-community/async-storage';

const Garages = () => {

  const [garageNames, setGarageNames] = useState([]);
  const [carNames, setCarNames] = useState([]);
  const [newGarageName, setNewGarageName] = useState("");
  const [lastSelectedGarageName, setLastSelectedGarageName] = useState("");

  // Modals
  const [addGarageModalVisible, setAddGarageModalVisible] = useState(false);
  const [showCarsModalVisible, setShowCarsModalVisible] = useState(false);

  useEffect(() => {
    // Get the list of garage names from local storage
    const getGarageNames = async () => {
      const names = await retrieveData('garageNames');
      setGarageNames(names);
    };
    getGarageNames();
  }, []);

  const showCarList = async (garageName) => {
    setLastSelectedGarageName(garageName);
    // Get the list of cars for the selected garage from local storage
    const carNames = await retrieveData(`${garageName}_cars`);
    setCarNames(carNames);
    setShowCarsModalVisible(true);
  };

  const addGarage = async () => {
    setAddGarageModalVisible(false);
    setNewGarageName('');
    garageNames.push(newGarageName);
    setGarageNames([...garageNames]);
    await AsyncStorage.setItem('garageNames', JSON.stringify(garageNames));
  };

  const deleteGarage = async (index, garageName) => {
    Alert.alert(
      'Delete Garage',
      'Are you sure you want to remove ' + garageName + '?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'OK',
          onPress: async () => {
            try {
              const newGarageNames = garageNames.filter((_, i) => i !== index);
              setGarageNames(newGarageNames);
              await AsyncStorage.setItem('garageNames', JSON.stringify(newGarageNames));

              const emptyGarageCars = [];
              await AsyncStorage.setItem(`${garageName}_cars`, JSON.stringify(emptyGarageCars));
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
        {garageNames.map((garageName, index) => (
          <View
            style={styles.garageListContainer}
          >
            <TouchableOpacity onPress={() => showCarList(garageName)}>
              <Text style={{ color: 'black', fontWeight: 'bold' }}>{garageName}</Text>
            </TouchableOpacity>

            <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'flex-end' }}>
              <TouchableOpacity style={{ marginRight: 20 }}>
                <Text style={{ color: 'blue' }}>Edit</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => deleteGarage(index, garageName)}>
                <Text style={{ color: 'red' }}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>

      <TouchableOpacity
        onPress={() => setAddGarageModalVisible(true)}
        style={styles.button}
      >
        <Text style={{ color: "white" }}>Add New Garage</Text>
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={false}
        visible={addGarageModalVisible}
        onRequestClose={() => {
          setAddGarageModalVisible(false);
        }}
      >
        <View style={{ backgroundColor: '#2D640F', justifyContent: 'center', height: 50 }}>
          <Text style={styles.header}>Add New Garage</Text>
        </View>

        <View style={{ marginTop: 10 }}>
          <View>
            <TextInput
              value={newGarageName}
              onChangeText={setNewGarageName}
              placeholder="Garage Name"
              placeholderTextColor="grey"
              style={styles.textInput}
            />

            <TouchableOpacity
              onPress={addGarage}
              style={styles.button}
            >
              <Text style={{ color: 'white' }}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        animationType="fade"
        transparent={false}
        visible={showCarsModalVisible}
        onRequestClose={() => {
          setShowCarsModalVisible(false);
        }}
      >
        <View style={{ backgroundColor: '#2D640F', justifyContent: 'center', height: 50 }}>
          <Text style={styles.header}>Cars in {lastSelectedGarageName}</Text>
        </View>

        <View style={{ marginTop: 10 }}>
          <View>
            <ScrollView>{carNames.map((carName, index) => (
              <View
                style={styles.carListContainer}
              >
                <TouchableOpacity>
                  <Text style={{ color: 'black' }}>{carName}</Text>
                </TouchableOpacity>
              </View>
            ))}
            </ScrollView>

            <TouchableOpacity
              onPress={() => setShowCarsModalVisible(false)}
              style={styles.button}
            >
              <Text style={{ color: 'white' }}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const retrieveData = async (key) => {
  try {
    const value = await AsyncStorage.getItem(key);
    if (value !== null) {
      return JSON.parse(value);
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
  garageContainer: {
    backgroundColor: "#ddd",
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
  },
  garageListContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc'
  },
  carListContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc'
  },
  header: {
    fontWeight: 'bold',
    fontSize: 20,
    padding: 10,
    color: 'white'
  },
  textInput: {
    color: 'black',
    borderWidth: 0.5,
    margin: 10
  }
});

export default Garages;
