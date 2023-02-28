import { Alert, FlatList, Modal, Text, TextInput, TouchableOpacity, View } from 'react-native';
import React, { useContext, useEffect, useState } from 'react';
import { WishlistContext } from '../Context/WishlistContext';
import DropDownPicker from 'react-native-dropdown-picker';
import { useFocusEffect } from '@react-navigation/native';
import { GarageContext } from '../Context/GarageContext';
import styles from './Styles';
import util from './Util';

const Wishlist = () => {

  const { wishlistObjects, setWishlistObjects } = useContext(WishlistContext);
  const { garageObjects, setGarageObjects } = useContext(GarageContext);

  const [addWishlistModalVisible, setAddWishlistModalVisible] = useState(false);
  const [selectedGarageTheme, setSelectedGarageTheme] = useState('');
  const [pickerOpen, setPickerOpen] = useState(false);

  const [wishlistObject, setWishlistObject] = useState({
    garageTheme: '',
    vehicleName: '',
    price: '',
    tradePrice: ''
  });

  useEffect(() => {
    // Get the list of wishlist items from local storage
    const getWishlistItems = async () => {
      const wishlistItems = await util.retrieveObject('@WishlistObjectList');
      setWishlistObjects(wishlistItems);
    };

    getWishlistItems();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      setPickerOpen(false);
    }, [])
  );

  const setEmptyWishlistObject = async () => {
    setWishlistObject({ garageTheme: '', vehicleName: '', price: '', tradePrice: '' });
  }

  const addWishlistItem = async () => {

    if (wishlistObject.tradePrice === '') {
      wishlistObject.tradePrice = '       -       ';
    }

    // First, update the garage's wishlist items

    const selectedGarageIndex = garageObjects.findIndex(garageObj => garageObj.theme === wishlistObject.garageTheme);

    const newGarageObjects = [...garageObjects];
    const selectedGarageObject = { ...newGarageObjects[selectedGarageIndex] };

    selectedGarageObject.wishlist = [...selectedGarageObject.wishlist, wishlistObject].sort(util.compareWishlistItems);
    newGarageObjects[selectedGarageIndex] = selectedGarageObject;

    setGarageObjects(newGarageObjects);
    await util.saveObject('@GarageObjectList', newGarageObjects);

    // Then update the wishlistObjects

    const newWishlistObjects = wishlistObjects;
    newWishlistObjects.push(wishlistObject);
    newWishlistObjects.sort(util.compareWishlistItems);
    await util.saveObject('@WishlistObjectList', newWishlistObjects);

    setEmptyWishlistObject();
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

              /*
              * Updating the garage which the wishlist item is removed from
              */

              // Find the garage, 
              const garageObject = garageObjects.filter(function (garageObj) {
                return garageObj.theme === whislistItemToRemove.garageTheme;
              }).at(0);

              // Remove the wishlist item from garage's wishlist
              // We use index so that we remove only the first occurance
              const wishlistIndex = garageObject.wishlist.findIndex(wishlistItem => wishlistItem.vehicleName === whislistItemToRemove.vehicleName);
              const newWishlistItems = garageObject.wishlist.filter((_, index) => index !== wishlistIndex);
              garageObject.wishlist = newWishlistItems;
              await util.saveObject('@GarageObjectList', garageObjects);

              const newWishlistObjects = wishlistObjects.filter(wishlistItem => wishlistItem !== whislistItemToRemove);

              setWishlistObjects(newWishlistObjects);
              await util.saveObject('@WishlistObjectList', newWishlistObjects);

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
        <View style={{ flex: 1 }}>
          <Text style={styles.textWishlistObjectB}>{item.vehicleName}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.textWishlistObjectM}>{item.garageTheme}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.textWishlistObjectB}>{item.price}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.textWishlistObjectM}>{item.tradePrice}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={{ flex: 1 }}>

      <View style={styles.containerWishlistHeader}>
        <View style={{ flex: 1 }}>
          <Text style={styles.textHeaderWishlist}>Vehicle</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.textHeaderWishlist}>Theme</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.textHeaderWishlist}>Price</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.textHeaderWishlist}>Trade Price</Text>
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
        <Text style={styles.textButton}>Add Wishlist Item</Text>
      </TouchableOpacity>

      <Modal
        animationType='slide'
        transparent={false}
        visible={addWishlistModalVisible}
        onRequestClose={() => {
          setAddWishlistModalVisible(false);
          setEmptyWishlistObject();
          setSelectedGarageTheme('');
          setPickerOpen(false);
        }}>

        <View style={styles.headerContainer}>
          <Text style={styles.header}>Add New Wishlist Item</Text>
        </View>

        <View style={{ flex: 1, flexDirection: 'column' }}>
          <View>

            <View style={styles.separator} />
            <Text style={styles.textSoftTitle}>{'Wishlist Details:'}</Text>

            <TextInput
              value={wishlistObject.vehicleName}
              onChangeText={text => setWishlistObject({ ...wishlistObject, vehicleName: text })}
              placeholder='Vehicle Name'
              placeholderTextColor='grey'
              style={styles.textInput}
            />

            <TextInput
              value={wishlistObject.price}
              onChangeText={text => setWishlistObject({ ...wishlistObject, price: text })}
              keyboardType='number-pad'
              placeholder='Price'
              placeholderTextColor='grey'
              style={styles.textInput}
            />

            <TextInput
              value={wishlistObject.tradePrice}
              onChangeText={text => setWishlistObject({ ...wishlistObject, tradePrice: text })}
              keyboardType='number-pad'
              placeholder='Trade Price'
              placeholderTextColor='grey'
              style={styles.textInput}
            />

            <DropDownPicker
              closeOnBackPressed={true}
              setOpen={setPickerOpen}
              open={pickerOpen}

              items={garageObjects.map((garageObject, index) => ({
                label: garageObject.theme,
                value: garageObject.theme,
              }))}

              value={selectedGarageTheme}
              setValue={setSelectedGarageTheme}

              onSelectItem={(item) =>
                setWishlistObject({ ...wishlistObject, garageTheme: item.value })
              }

              listMode='MODAL'
              modalTitle='Your Garage Themes'
              modalTitleStyle={{
                fontFamily: 'FOTNewRodin Pro B', // Not working
                fontSize: 15 // Not working
              }}
              modalContentContainerStyle={{
                backgroundColor: '#fffcc' // Not working
              }}
              modalProps={{
                presentationStyle: 'pageSheet',
                animationType: 'fade',
                hardwareAccelerated: true,
              }}
              
              containerStyle={styles.containerPickerWishlist}
              itemStyle={{
                justifyContent: 'flex-start'
              }}

              textStyle={{
                fontFamily: 'FOTNewRodin Pro M',
                fontSize: 12
              }}
              placeholder='Choose a theme'
              placeholderStyle={{
                fontFamily: 'FOTNewRodin Pro M',
                fontSize: 12,
                color: 'grey'
              }}
            />

          </View>

          <View style={{ flex: 1, flexDirection: 'column', justifyContent: 'flex-end' }}>
            <TouchableOpacity
              style={styles.buttonGreen}
              onPress={addWishlistItem}>

              <Text style={styles.textButton}>Add</Text>

            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default Wishlist;
