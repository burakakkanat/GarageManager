import { ActivityIndicator, FlatList, Modal, StyleSheet, Text, TextInput, ToastAndroid, TouchableOpacity, View } from 'react-native';
import React, { useContext, useMemo, useState } from 'react';
import { WishlistContext } from '../context/WishlistContext';
import DropDownPicker from 'react-native-dropdown-picker';
import { useFocusEffect } from '@react-navigation/native';
import { GarageContext } from '../context/GarageContext';
import { BlurView } from '@react-native-community/blur';
import AwesomeAlert from 'react-native-awesome-alerts';
import styles from '../styles/Styles';
import uuid from 'react-native-uuid';
import util from '../util/Util';

const Wishlist = () => {

  const { wishlistObjects, setWishlistObjects } = useContext(WishlistContext);
  const { garageObjects, setGarageObjects } = useContext(GarageContext);

  const [addWishlistModalVisible, setAddWishlistModalVisible] = useState(false);
  const [selectedGarageTheme, setSelectedGarageTheme] = useState('');
  const [pickerOpen, setPickerOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [loading, setLoading] = useState(false);

  // Alert stuff
  const [showAlert, setShowAlert] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    confirmButtonText: '',
    message: '',
    showCancelButton: true,
    title: '',
  });

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

  const handleSearchChange = (text) => {
    setSearchValue(text);
  };

  const addWishlistItem = async () => {

    if (wishlistObject.garageTheme === '') {

      setAlertConfig({
        confirmButtonText: 'OK',
        message: 'Please choose a theme.',
        showCancelButton: false,
        title: 'Error',
        onConfirmPressed: async () => { setShowAlert(false) }
      });

      setShowAlert(true);
      return;
    }

    if (wishlistObject.tradePrice === '') {
      wishlistObject.tradePrice = 'N/A';
    }

    try {

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

      setAddWishlistModalVisible(false);

      ToastAndroid.showWithGravity(
        'Wishlist item added.',
        ToastAndroid.SHORT,
        ToastAndroid.TOP, // Not working
      );

    } catch (error) {
      console.error(error);
    } finally {
      setEmptyWishlistObject();
    }
  };

  const removeWishlistObject = async (whislistItemToRemove) => {

    setAlertConfig({

      confirmButtonText: 'Confirm',
      message: 'Are you sure you want to remove this wishlist item?',
      showCancelButton: true,
      title: 'Remove Wishlist Item',

      onConfirmPressed: async () => {
        try {
          setLoading(true);

          // Remove from garage
          const newGarageObjects = [...garageObjects];
          const garageIndex = newGarageObjects.findIndex((garageObj) => garageObj.theme === whislistItemToRemove.garageTheme);
          const newGarageObject = newGarageObjects[garageIndex];
          const newWishlist = newGarageObject.wishlist.filter((wishlistObj) => wishlistObj.uuid !== whislistItemToRemove.uuid);
          newGarageObjects[garageIndex] = { ...newGarageObject, wishlist: newWishlist };

          setGarageObjects(newGarageObjects);
          await util.saveObject('@GarageObjectList', newGarageObjects);

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
        } finally {
          setLoading(false);
          setShowAlert(false);
        }
      }
    });

    setShowAlert(true);
  };

  const filteredWishlistObjects = useMemo(() => {
    return wishlistObjects.filter((wishlistObj) =>
      wishlistObj.vehicleName.toLowerCase().includes(searchValue.toLowerCase())
    );
  }, [searchValue, wishlistObjects]);

  const memoizedRenderWishlistObject = useMemo(() => ({ item: wishlistItem }) => {
    return (
      <TouchableOpacity
        style={styles.containerList}
        onPress={() => util.openVehicleFandomPage(wishlistItem.vehicleName)}
        onLongPress={() => removeWishlistObject(wishlistItem)}
      >
        <View style={styles.containerListHeaderText}>
          <Text style={styles.textWishlistObjectB}>{wishlistItem.vehicleName}</Text>
        </View>
        <View style={styles.containerListHeaderText}>
          <Text style={styles.textWishlistObjectM}>{wishlistItem.garageTheme}</Text>
        </View>
        <View style={styles.containerListHeaderText}>
          <Text style={styles.textWishlistObjectB}>{wishlistItem.price}</Text>
        </View>
        <View style={styles.containerListHeaderText}>
          <Text style={styles.textWishlistObjectM}>{wishlistItem.tradePrice}</Text>
        </View>
      </TouchableOpacity>
    );
  }, [filteredWishlistObjects]);

  return (
    <View style={{ flex: 1 }}>

      <View style={styles.containerListHeader}>
        <View style={styles.containerListHeaderText}>
          <Text style={styles.textListHeader}>Vehicle</Text>
        </View>
        <View style={styles.containerListHeaderText}>
          <Text style={styles.textListHeader}>Theme</Text>
        </View>
        <View style={styles.containerListHeaderText}>
          <Text style={styles.textListHeader}>Price</Text>
        </View>
        <View style={styles.containerListHeaderText}>
          <Text style={styles.textListHeader}>Trade Price</Text>
        </View>
      </View>

      <View style={styles.separatorTop} />

      <FlatList
        data={filteredWishlistObjects}
        keyExtractor={(item, index) => index.toString()}
        renderItem={memoizedRenderWishlistObject}
      />

      <TextInput
        inlineImageLeft='search_icon'
        inlineImagePadding={20}
        onChangeText={handleSearchChange}
        placeholder='Vehicle name...'
        placeholderTextColor='gray'
        style={styles.textInputSearch}
        value={searchValue}
      />

      <TouchableOpacity
        style={styles.buttonGreen}
        onPress={() => setAddWishlistModalVisible(true)}>
        <Text style={styles.textButton}>Add Wishlist Item</Text>
      </TouchableOpacity>

      <AwesomeAlert
        cancelButtonColor='#c70000'
        cancelText='Cancel'
        closeOnHardwareBackPress={true}
        closeOnTouchOutside={true}
        confirmButtonColor='#2D640F'
        confirmText={alertConfig.confirmButtonText}
        message={alertConfig.message}
        show={showAlert}
        showCancelButton={alertConfig.showCancelButton}
        showConfirmButton={true}
        title={alertConfig.title}

        cancelButtonStyle={{
          marginRight: 5,
          width: 100,
          alignItems: 'center'
        }}
        cancelButtonTextStyle={{
          fontFamily: util.getBoldFontName(),
          fontSize: 12
        }}
        confirmButtonStyle={{
          marginLeft: 5,
          width: 100,
          alignItems: 'center'
        }}
        confirmButtonTextStyle={{
          fontFamily: util.getBoldFontName(),
          fontSize: 12
        }}
        contentContainerStyle={{
          backgroundColor: '#F2F2F2'
        }}
        messageStyle={{
          fontFamily: util.getFontName(),
          fontSize: 12,
          marginBottom: 10
        }}
        titleStyle={{
          fontFamily: util.getBoldFontName(),
          fontSize: 15,
          marginBottom: 10
        }}

        onConfirmPressed={alertConfig.onConfirmPressed}
        onCancelPressed={() => { setShowAlert(false); }}
      />

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

          <View style={styles.containerButton}>
            <TouchableOpacity
              style={styles.buttonGreen}
              onPress={addWishlistItem}>

              <Text style={styles.textButton}>Add</Text>

            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {loading && (
        <View style={styles.containerLoading}>
          <BlurView blurType='light' blurAmount={3} style={StyleSheet.absoluteFill}>
            <View style={styles.loadingIndicator}>
              <ActivityIndicator size='large' color='#2D640F' />
            </View>
          </BlurView>
        </View>
      )}
    </View>
  );
};

export default Wishlist;
