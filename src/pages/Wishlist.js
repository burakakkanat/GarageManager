import { FlatList, Modal, Text, TextInput, ToastAndroid, TouchableOpacity, View } from 'react-native';
import React, { useContext, useMemo, useState } from 'react';
import DropDownPicker from 'react-native-dropdown-picker';
import { useFocusEffect } from '@react-navigation/native';
import { GarageContext } from '../context/GarageContext';
import loggerUtil from '../util/LoggerUtil';
import styles from '../styles/Styles';
import uuid from 'react-native-uuid';
import util from '../util/Util';

const Wishlist = () => {

  const { garageObjects, setGarageObjects } = useContext(GarageContext);

  const [addWishlistModalVisible, setAddWishlistModalVisible] = useState(false);
  const [selectedGarageTheme, setSelectedGarageTheme] = useState('');
  const [pickerOpen, setPickerOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [inProgress, setInProgress] = useState(false);

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

      setAddWishlistModalVisible(false);

      ToastAndroid.showWithGravity(
        'Wishlist item added',
        ToastAndroid.SHORT,
        ToastAndroid.TOP, // Not working
      );

    } catch (error) {
      loggerUtil.logError('Wishlist_addWishlistItem', error);
    } finally {
      setEmptyWishlistObject();
    }
  };

  const removeWishlistItem = async (whislistItemToRemove) => {

    setAlertConfig({

      confirmButtonText: 'Confirm',
      message: 'Are you sure you want to remove this wishlist item?',
      showCancelButton: true,
      title: 'Remove Wishlist Item',

      onConfirmPressed: async () => {
        try {
          setInProgress(true); // Working but loading icon is overlapped by alert

          // Remove from garage
          const newGarageObjects = [...garageObjects];
          const garageIndex = newGarageObjects.findIndex((garageObj) => garageObj.theme === whislistItemToRemove.garageTheme);
          const newGarageObject = newGarageObjects[garageIndex];
          const newWishlist = newGarageObject.wishlist.filter((wishlistObj) => wishlistObj.uuid !== whislistItemToRemove.uuid);
          newGarageObjects[garageIndex] = { ...newGarageObject, wishlist: newWishlist };

          setGarageObjects(newGarageObjects);
          await util.saveObject('@GarageObjectList', newGarageObjects);

          ToastAndroid.showWithGravity(
            'Wishlist item removed',
            ToastAndroid.SHORT,
            ToastAndroid.TOP, // Not working
          );

        } catch (error) {
          loggerUtil.logError('Wishlist_removeWishlistItem', error);
        } finally {
          setInProgress(false);
          setShowAlert(false);
        }
      },
      onCancelPressed: async () => {
        setShowAlert(false);
      }
    });

    setShowAlert(true);
  };

  const filteredWishlistObjects = useMemo(() => {

    const allWishlistObjects = garageObjects.flatMap(garage => garage.wishlist);

    if (!searchValue || searchValue === '') {
      return allWishlistObjects;
    } else {
      return allWishlistObjects.filter((wishlistObj) =>
        wishlistObj.vehicleName.toLowerCase().includes(searchValue.toLowerCase())
      );
    }

  }, [searchValue, garageObjects]);

  const memoizedRenderWishlistObject = useMemo(() => ({ item: wishlistItem }) => {
    return (
      <TouchableOpacity
        style={styles.containerList}
        onPress={() => util.openVehicleFandomPage(wishlistItem.vehicleName)}
        onLongPress={() => removeWishlistItem(wishlistItem)}
      >
        <View style={styles.containerListHeaderText}>
          <Text style={styles.textWishlistItemB}>{wishlistItem.vehicleName}</Text>
        </View>
        <View style={styles.containerListHeaderText}>
          <Text style={styles.textWishlistItem}>{wishlistItem.garageTheme}</Text>
        </View>
        <View style={styles.containerListHeaderText}>
          <Text style={styles.textWishlistItemB}>{wishlistItem.price}</Text>
        </View>
        <View style={styles.containerListHeaderText}>
          <Text style={styles.textWishlistItem}>{wishlistItem.tradePrice}</Text>
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

      {util.renderAwesomeAlert(alertConfig, showAlert)}

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

      {util.renderInProgress(inProgress)}
    </View>
  );
};

export default Wishlist;
