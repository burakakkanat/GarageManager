import { Alert, FlatList, Modal, Text, TextInput, TouchableOpacity, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import styles from './Styles';

const Wishlist = () => {

  const [wishlistObjects, setWishlistObjects] = useState([]);
  const [addWishlistModalVisible, setAddWishlistModalVisible] = useState(false);

  const [wishlistObject, setWishlistObject] = useState({
    garage: '',
    vehicleName: '',
    price: '0',
    tradePrice: '-'
  });

  useEffect(() => {
    // Get the list of wishlist items from local storage
    const getWishlistItems = async () => {
      const wishlistItems = await retrieveObject('@WishlistObjectList');
      setWishlistObjects(wishlistItems);
    };

    getWishlistItems();
  }, []);

  const addWishlistItem = async () => {

    if (wishlistObject.tradePrice === '-') {
      wishlistObject.tradePrice = '       -       ';
    }

    const newWishlistObjects = wishlistObjects;
    newWishlistObjects.push(wishlistObject);
    newWishlistObjects.sort(compareWishlistItems);
    await saveObject('@WishlistObjectList', newWishlistObjects);

    setWishlistObject({ garage: '', vehicleName: '', price: '0', tradePrice: '-' });
    setAddWishlistModalVisible(false);
  };

  const removeWishlistObject = async (whislistItemToRemove) => {

    Alert.alert(
      'Remove Wishlist Item',
      'Are you sure you want to remove this wishlist item?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'OK',
          onPress: async () => {
            try {

              const newWishlistObjects = wishlistObjects.filter(wishlistItem => wishlistItem !== whislistItemToRemove);

              setWishlistObjects(newWishlistObjects);
              await saveObject('@WishlistObjectList', newWishlistObjects);

            } catch (error) {
              console.error(error);
            }
          },
        },
      ],
      { cancelable: false }
    );
  };

  const renderWishlistObject = ({ item }) => {
    return (
      <TouchableOpacity style={styles.containerForLists} onPress={() => removeWishlistObject(item)}>
        <View style={{ flex: 1, marginLeft: 10 }}>
          <Text style={styles.textWishlistObjectBold}>{item.vehicleName}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.textWishlistObject}>{item.garage}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.textWishlistObject}>{item.price}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.textWishlistObject}>{item.tradePrice}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.containerWishlistHeader}>
        <View style={{ flex: 1, marginLeft: 10 }}>
          <Text>Garage</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text>Vehicle</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text>Price</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text>Trade Price</Text>
        </View>
      </View>

      <FlatList
        data={wishlistObjects}
        keyExtractor={(item, index) => index.toString()}
        renderItem={renderWishlistObject}
      />

      <TouchableOpacity
        style={styles.buttonGreen}
        onPress={() => setAddWishlistModalVisible(true)}>
        <Text style={{ color: 'white' }}>Add Wishlist Item</Text>
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={false}
        visible={addWishlistModalVisible}
        onRequestClose={() => setAddWishlistModalVisible(false)}>

        <View style={{ backgroundColor: '#2D640F', justifyContent: 'center', height: 50 }}>
          <Text style={styles.header}>Add New Wishlist Item</Text>
        </View>

        <View style={{ flex: 1, flexDirection: 'column' }}>
          <View>

            <View style={styles.separator} />
            <Text style={{ color: 'grey', margin: 10 }}>{'Wishlist Details:'}</Text>

            <TextInput
              value={wishlistObject.garage}
              onChangeText={text => setWishlistObject({ ...wishlistObject, garage: text })}
              placeholder="Garage"
              placeholderTextColor="grey"
              style={styles.textInput}
            />

            <TextInput
              value={wishlistObject.vehicleName}
              onChangeText={text => setWishlistObject({ ...wishlistObject, vehicleName: text })}
              placeholder="Vehicle Name"
              placeholderTextColor="grey"
              style={styles.textInput}
            />

            <TextInput
              value={wishlistObject.price}
              onChangeText={text => setWishlistObject({ ...wishlistObject, price: text })}
              keyboardType='number-pad'
              placeholder="Price"
              placeholderTextColor="grey"
              style={styles.textInput}
            />

            <TextInput
              value={wishlistObject.tradePrice}
              onChangeText={text => setWishlistObject({ ...wishlistObject, tradePrice: text })}
              keyboardType='number-pad'
              placeholder="Trade Price"
              placeholderTextColor="grey"
              style={styles.textInput}
            />

          </View>

          <View style={{ flex: 1, flexDirection: 'column', justifyContent: 'flex-end' }}>
            <TouchableOpacity
              style={styles.buttonGreen}
              onPress={addWishlistItem}>

              <Text style={{ color: 'white' }}>Add</Text>

            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const saveObject = async (key, object) => {
  try {
    const stringifiedObject = JSON.stringify(object);
    await AsyncStorage.setItem(key, stringifiedObject);
  } catch (error) {
    console.error(error);
  }
};

const retrieveObject = async (key) => {
  try {
    const stringifiedObject = await AsyncStorage.getItem(key);
    if (stringifiedObject !== null) {
      return JSON.parse(stringifiedObject);
    }
    return [];
  } catch (error) {
    console.error(error);
    return [];
  }
};

function compareWishlistItems(wishlistItemA, wishlistItemB) {
  if (wishlistItemA.garage < wishlistItemB.garage) {
    return -1;
  }
  if (wishlistItemA.garage > wishlistItemB.garge) {
    return 1;
  }
  return 0;
}

export default Wishlist;
