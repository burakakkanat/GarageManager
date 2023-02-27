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
        marginBottom: 0,
        marginTop: 0,
        margin: 10,
        borderTopWidth: 1,
        borderTopColor: '#ccc'
    },
    containerPickerAddVehicle: {
        height: '80%',
        width: '55%',
    },
    containerPickerWishlist: {
        marginLeft: 10,
        width: '95%'
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
        marginTop: 10,
        fontSize: 30,
        color: 'white',
        fontFamily: 'SignPainter-HouseScript'
    },
    headerMain: {
        marginTop: 5,
        fontSize: 30,
        color: 'white',
        fontFamily: 'SignPainter-HouseScript'
    },
    headerContainer: {
        backgroundColor: '#2D640F',
        justifyContent: 'center',
        height: 50,
        alignItems: 'center'
    },
    headerContainerMain: {
        backgroundColor: '#2D640F',
        justifyContent: 'center',
        height: 50,
        alignItems: 'center'
    },
    screenOptons: {
        tabBarLabelStyle: { fontFamily: 'FOTNewRodin Pro B', fontSize: 12 },
        "tabBarActiveTintColor": '#FFFFFF',
        "tabBarInactiveTintColor": '#B3E5FC',
        "tabBarIndicatorStyle": { backgroundColor: '#FFFFFF' },
        "tabBarStyle": { backgroundColor: '#2D640F' },
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
    textButton: {
        fontFamily: 'FOTNewRodin Pro B',
        color: 'white',
        fontSize: 12
    },
    textGarageDetails: {
        fontFamily: 'FOTNewRodin Pro M',
        color: 'grey',
        fontSize: 12,
    },
    textGarageDetailsTitle: {
        fontFamily: 'FOTNewRodin Pro B',
        color: 'black',
        fontSize: 15,
        margin: 10
    },
    textGarageDetailsSoftTitle: {
        fontFamily: 'FOTNewRodin Pro B',
        color: 'grey',
        fontSize: 12,
    },
    textHeaderWishlist: {
        fontFamily: 'FOTNewRodin Pro M',
        fontSize: 12,
        color: '#F2F2F2',
    },
    textInput: {
        color: 'black',
        borderWidth: 0.5,
        margin: 10,
        height: 40,
        fontFamily: 'FOTNewRodin Pro M',
        fontSize: 12
    },
    textInputNewVehicleName: {
        height: '85%',
        borderColor: 'gray',
        color: 'black',
        borderWidth: 1,
        flex: 1,
        marginRight: 10,
        marginTop: 5,
        fontFamily: 'FOTNewRodin Pro M',
        fontSize: 12
    },
    textListItemGarageB: {
        fontFamily: 'FOTNewRodin Pro B',
        color: 'black',
        fontSize: 11
    },
    textListItemGarageM: {
        fontFamily: 'FOTNewRodin Pro M',
        color: 'black',
        fontSize: 11
    },
    textListItemVehicleB: {
        fontFamily: 'FOTNewRodin Pro B',
        color: 'black',
        fontSize: 10.5
    },
    textListItemVehicleM: {
        fontFamily: 'FOTNewRodin Pro M',
        color: 'black',
        fontSize: 10.5
    },
    textSoftTitle: {
        fontFamily: 'FOTNewRodin Pro B',
        color: 'black',
        fontSize: 10.5,
        margin: 10
    },
    textWishlistObjectM: {
        fontFamily: 'FOTNewRodin Pro M',
        fontSize: 10,
        color: 'black',
    },
    textWishlistObjectB: {
        fontFamily: 'FOTNewRodin Pro B',
        fontSize: 10,
        color: 'black',
    }
});

export default styles;