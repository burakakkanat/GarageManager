import React, { useState, useEffect } from 'react';
import { Modal, ScrollView, Text, TextInput, TouchableOpacity, StyleSheet, View } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import AsyncStorage from '@react-native-community/async-storage';

const Garages = () => {

  const [garageNames, setGarageNames] = useState([]);
  const [carNames, setCarNames] = useState([]);
  const [newGarageName, setNewGarageName] = useState("");

  // Modals
  const [addGarageModalVisible, setAddGarageModalVisible] = useState(false);
  const [showCarsModalVisible, setShowCarsModalVisible] = useState(false);

  useEffect(() => {
    // get the list of garage names from local storage
    const getGarageNames = async () => {
      const names = await retrieveData('garageNames');
      setGarageNames(names);
    };
    getGarageNames();
  }, []);

  const showCarList = async (garageName) => {
    // get the list of cars for the selected garage from local storage
    const carNames = await retrieveData(`${garageName}_cars`);
    setCarNames(carNames);
    console.log(carNames)
    setShowCarsModalVisible(true);
  };

  const addGarage = async (updateGarageNames) => {
    setAddGarageModalVisible(false);
    setNewGarageName("");
    garageNames.push(newGarageName);
    setGarageNames([...garageNames]);
    await AsyncStorage.setItem("garageNames", JSON.stringify(garageNames));
    updateGarageNames();
  };

  const deleteGarage = async (index, updateGarageNames) => {
    const newGarageNames = garageNames.filter((_, i) => i !== index);
    setGarageNames(newGarageNames);
    await AsyncStorage.setItem("garageNames", JSON.stringify(newGarageNames));
    updateGarageNames();
  };

  return (
    <View style={{ flex: 1 }}>
      <ScrollView>
        {garageNames.map((garageName, index) => (
          <View
            style={styles.garageListContainer}
          >
            <TouchableOpacity onPress={() => showCarList(garageName)}>
              <Text style={{color: 'black'}}>{garageName}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={{ marginLeft: 'auto' }}
              onPress={() => deleteGarage(index)}
            >
              <Text style={{color: 'red'}}>Delete</Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>

      <TouchableOpacity
        onPress={() => setAddGarageModalVisible(true)}
        style={styles.button}
      >
        <Text style={{ color: "white" }}>Add Garage</Text>
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={false}
        visible={addGarageModalVisible}
        onRequestClose={() => {
          setAddGarageModalVisible(false);
        }}
      >
        <View style={{ marginTop: 22 }}>
          <View>
            <TextInput
              value={newGarageName}
              onChangeText={setNewGarageName}
              placeholder="Garage Name"
              placeholderTextColor="grey"
              style= {styles.textInput}
            />

            <TouchableOpacity
              onPress={addGarage}
              style={styles.button}
              >
              <Text style={{color: 'white'}}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        animationType="slide"
        transparent={false}
        visible={showCarsModalVisible}
        onRequestClose={() => {
          setShowCarsModalVisible(false);
        }}
      >
        <View style={{ marginTop: 20 }}>
          <View>
            <Text style={styles.header}>Cars In This Garage:</Text>

            <ScrollView>{carNames.map((carName, index) => (
              <View
                style={styles.carListContainer}
              >
                <TouchableOpacity>
                  <Text style={{color: 'black'}}>{carName}</Text>
                </TouchableOpacity>
              </View>
            ))}
            </ScrollView>

            <TouchableOpacity
              onPress={() => setShowCarsModalVisible(false)}
              style={styles.button}
            >
              <Text style={{color: 'white'}}>Close</Text>
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
    backgroundColor: '#009A44',
    alignItems: 'center',
    justifyContent: 'center',
    margin: 10
  },
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
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
    fontSize: 15,
    margin: 10,
    marginLeft: 15,
    color: 'black'
  },
  textInput: {
    color: 'black',
    borderWidth:0.5,
    margin: 10
  },
  title: {
    color:'black',
    marginLeft: 15
  },
  pickerContainer: {
    width: "100%",
    marginTop: 20,
  }
});

export default Garages;
