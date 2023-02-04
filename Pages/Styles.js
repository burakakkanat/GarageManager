import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
    buttonGreen: {
        padding: 10,
        backgroundColor: '#2D640F',
        alignItems: 'center',
        justifyContent: 'center',
        margin: 10
    },
    buttonSmallRed: {
        padding: 10,
        backgroundColor: 'red',
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
        borderTopWidth: 1,
        borderTopColor: '#ccc'
    },
    containerGarage: {
        backgroundColor: "#ddd",
        padding: 10,
        marginBottom: 10,
        borderRadius: 5,
    },
    containerGarageList: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc'
    },
    containerPicker: {
        height: 40,
        width: 200,
        dropdownIconColor: 'black'
    },
    containerVehicleList: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc'
    },
    containerWhishlistHeader: {
        backgroundColor: '#2D640F',
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 10,
        alignItems: 'center',
    },
    containerWishlistRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        borderBottomWidth: 1,
        borderColor: 'lightgrey',
        padding: 8,
    },
    header: {
        fontWeight: 'bold',
        fontSize: 20,
        padding: 10,
        color: 'white'
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
        marginTop: 5
    },
    textInput: {
        color: 'black',
        borderWidth: 0.5,
        margin: 10
    },
    textAddWishlistButton: {
        color: 'white',
        fontWeight: 'bold',
    },
    textWishlistObject: {
        fontSize: 13,
        color: 'black',
    },
});

export default styles;