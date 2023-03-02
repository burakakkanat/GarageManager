import { Alert, FlatList, Modal, Text, TextInput, ToastAndroid, TouchableOpacity, View } from 'react-native';
import { WishlistContext } from '../context/WishlistContext';
import DropDownPicker from 'react-native-dropdown-picker';
import { useFocusEffect } from '@react-navigation/native';
import { GarageContext } from '../context/GarageContext';
import React, { useContext, useState } from 'react';
import styles from '../styles/Styles';
import uuid from 'react-native-uuid';
import util from '../util/Util';

const Wishlist = () => {

  const { wishlistObjects, setWishlistObjects } = useContext(WishlistContext);
  const { garageObjects, setGarageObjects } = useContext(GarageContext);

  const [addWishlistModalVisible, setAddWishlistModalVisible] = useState(false);
  const [selectedGarageTheme, setSelectedGarageTheme] = useState('');
  const [pickerOpen, setPickerOpen] = useState(false);

  const [wishlistObject, setWishlistObject] = useState({
    uuid: '',
    garageTheme: '',
    vehicleName: '',
    price: '',
    tradePrice: ''
  });

  useFocusEffect(
    React.useCallback(() => {
      setPickerOpen(false);
    }, [])
  );

  const setEmptyWishlistObject = async () => {
    setWishlistObject({ garageTheme: '', vehicleName: '', price: '', tradePrice: '' });
    setSelectedGarageTheme(''); // Also reset the value displayed on theme picker
  }

  const addWishlistItem = async () => {

    if (wishlistObject.garageTheme === '') {
      Alert.alert('Error', 'Please choose a theme.');
      return;
    }

    if (wishlistObject.tradePrice === '') {
      wishlistObject.tradePrice = 'N/A';
    }

    wishlistObject.uuid = uuid.v4();

    setGarageObjects(prevGarageObjects => {
      const selectedGarageIndex = prevGarageObjects.findIndex(garageObj => garageObj.theme === wishlistObject.garageTheme);
      const selectedGarageObject = prevGarageObjects[selectedGarageIndex];

      selectedGarageObject.wishlist.push(wishlistObject);
      selectedGarageObject.wishlist.sort(util.compareWishlistItems);

      util.saveObject('@GarageObjectList', prevGarageObjects);

      return [...prevGarageObjects];
    });

    setWishlistObjects(prevWishlistObjects => {
      const newWishlistObjects = [...prevWishlistObjects];
      const wishlistInsertionIndex = util.findWishlistInsertionIndex(newWishlistObjects, wishlistObject);
      newWishlistObjects.splice(wishlistInsertionIndex, 0, wishlistObject);

      return newWishlistObjects;
    });

    setEmptyWishlistObject();
    setAddWishlistModalVisible(false);

    ToastAndroid.showWithGravity(
      'Wishlist item added.',
      ToastAndroid.SHORT,
      ToastAndroid.TOP, // Not working
    );
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

              // Remove from garage
              const garageIndex = garageObjects.findIndex((garageObj) => garageObj.theme === whislistItemToRemove.garageTheme);
              const garageObject = garageObjects[garageIndex];
              const newWishlist = garageObject.wishlist.filter((wishlistObj) => wishlistObj.uuid !== whislistItemToRemove.uuid);
              garageObjects[garageIndex] = { ...garageObject, wishlist: newWishlist };

              await util.saveObject('@GarageObjectList', garageObjects);

              // Remove from wishlistObjects
              const indexToRemove = wishlistObjects.findIndex(wishlistObj => wishlistObj.uuid === whislistItemToRemove.uuid);
              const newWishlistObjects = [...wishlistObjects];
              if (indexToRemove !== -1) {
                newWishlistObjects.splice(indexToRemove, 1);
              }
              setWishlistObjects(newWishlistObjects);

              ToastAndroid.showWithGravity(
                'Wishlist item removed.',
                ToastAndroid.SHORT,
                ToastAndroid.TOP, // Not working
              );

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
        <View style={{ flex: 1, marginHorizontal: 3 }}>
          <Text style={styles.textWishlistObjectB}>{item.vehicleName}</Text>
        </View>
        <View style={{ flex: 1, marginHorizontal: 3 }}>
          <Text style={styles.textWishlistObjectM}>{item.garageTheme}</Text>
        </View>
        <View style={{ flex: 1, marginHorizontal: 3 }}>
          <Text style={styles.textWishlistObjectB}>{item.price}</Text>
        </View>
        <View style={{ flex: 1, marginHorizontal: 3 }}>
          <Text style={styles.textWishlistObjectM}>{item.tradePrice}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={{ flex: 1 }}>

      <View style={styles.containerWishlistHeader}>
        <View style={{ flex: 1, marginHorizontal: 3 }}>
          <Text style={styles.textHeaderWishlist}>Vehicle</Text>
        </View>
        <View style={{ flex: 1, marginHorizontal: 3 }}>
          <Text style={styles.textHeaderWishlist}>Theme</Text>
        </View>
        <View style={{ flex: 1, marginHorizontal: 3 }}>
          <Text style={styles.textHeaderWishlist}>Price</Text>
        </View>
        <View style={{ flex: 1, marginHorizontal: 3 }}>
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
          setPickerOpen(false);
        }}>

        <View style={styles.containerHeader}>
          <Text style={styles.header}>Add New Wishlist Item</Text>
        </View>

        <View style={{ flex: 1, flexDirection: 'column' }}>
          <View style={{ height: '90%' }}>

            <View style={styles.separator} />
            <Text style={styles.textSoftTitle}>{'Wishlist Details:'}</Text>

            <TextInput
              value={wishlistObject.vehicleName}
              onChangeText={text => setWishlistObject({ ...wishlistObject, vehicleName: text })}
              placeholder='  Vehicle Name'
              placeholderTextColor='grey'
              style={styles.textInput}
            />

            <TextInput
              value={wishlistObject.price}
              onChangeText={text => setWishlistObject({ ...wishlistObject, price: text })}
              keyboardType='number-pad'
              placeholder='  Price'
              placeholderTextColor='grey'
              style={styles.textInput}
            />

            <TextInput
              value={wishlistObject.tradePrice}
              onChangeText={text => setWishlistObject({ ...wishlistObject, tradePrice: text })}
              keyboardType='number-pad'
              placeholder='  Trade Price'
              placeholderTextColor='grey'
              style={styles.textInput}
            />

            <DropDownPicker
              dropDownDirection='BOTTOM'
              closeOnBackPressed={true}
              setOpen={setPickerOpen}
              open={pickerOpen}
              searchable={true}

              searchPlaceholder='Search garage theme...'
              placeholder='Choose a theme'
              listMode='SCROLLVIEW'

              dropDownContainerStyle={styles.dropDownWishlistDropDownContainerStyle}
              placeholderStyle={styles.dropDownWishlistPlaceholderStyle}
              containerStyle={styles.dropDownWishlistContainerStyle}
              textStyle={styles.dropDownWishlistTextStyle}
              style={styles.dropDownWishlistStyle}

              items={garageObjects.map((garageObject, index) => ({
                label: garageObject.theme,
                value: garageObject.theme,
              }))}

              setValue={setSelectedGarageTheme}
              value={selectedGarageTheme}

              onSelectItem={(item) =>
                setWishlistObject({ ...wishlistObject, garageTheme: item.value })
              }
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
