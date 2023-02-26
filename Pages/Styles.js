import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
    buttonGreen: {
        padding: 10,
        backgroundColor: '#2D640F',
        alignItems: 'center',
        justifyContent: 'center',
        margin: 10
    },
    buttonRed: {
        padding: 10,
        backgroundColor: '#c70000',
        alignItems: 'center',
        justifyContent: 'center',
        margin: 10
    },
    buttonYellow: {
        padding: 10,
        backgroundColor: 'orange',
        alignItems: 'center',
        justifyContent: 'center',
        margin: 10
    },
    containerAddNewVehicle: {
        flexDirection: 'row',
        alignItems: 'center',
        margin: 10,
        marginTop: 0,
        marginBottom: 0,
        borderTopWidth: 1,
        borderTopColor: '#ccc'
    },
    containerPicker: {
        height: 40,
        width: 200,
        dropdownIconColor: 'black'
    },
    containerWishlistHeader: {
        backgroundColor: '#2D640F',
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 10,
        alignItems: 'center',
    },
    containerForLists: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        borderBottomWidth: 1,
        borderColor: 'lightgrey',
        padding: 10,
    },
    containerForSimpleLists: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 10,
        paddingTop: 0
    },
    containerForGarageList: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderColor: 'lightgrey',
        padding: 8,
    },
    loadingContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        bottom: 0,
        right: 0,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)', // semi-transparent black background
        zIndex: 999 // ensure the loading indicator is on top of everything else
    },
    loadingIndicator: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center'
    },
    header: {
        marginLeft: 10,
        marginTop: 5,
        fontSize: 30,
        color: 'white',
        fontFamily: 'SignPainter-HouseScript'
    },
    newVehicleName: {
        height: 40,
        borderColor: 'gray',
        color: 'black',
        borderWidth: 1,
        flex: 1,
        marginRight: 10
    },
    separator: {
        width: '100%',
        height: 1,
        backgroundColor: 'lightgrey',
        marginVertical: 5,
    },
    separatorTop: {
        width: '100%',
        height: 1,
        backgroundColor: 'lightgrey',
        marginTop: 3
    },
    textInput: {
        color: 'black',
        borderWidth: 0.5,
        margin: 10,
        height: 40
    },
    textWishlistObject: {
        fontSize: 13,
        color: 'black',
    },
    textWishlistObjectBold: {
        fontSize: 13,
        color: 'black',
        fontWeight: 'bold'
    },
});

export default styles;