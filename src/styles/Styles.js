import { StyleSheet } from 'react-native';
import util from '../util/Util';

const styles = StyleSheet.create({
    backupIdContainer: {
        alignItems: 'center',
        flexDirection: 'row',
        marginBottom: 10,
        marginTop: 20,
        paddingHorizontal: 20,
    },
    backupIdText: {
        color: 'black',
        flex: 1,
        fontSize: 14,
    },
    buttonBlack: {
        alignItems: 'center',
        backgroundColor: 'black',
        borderRadius: 10,
        elevation: 5,
        justifyContent: 'center',
        margin: 10,
        padding: 10
    },
    buttonGreen: {
        alignItems: 'center',
        backgroundColor: '#2D640F',
        borderRadius: 10,
        elevation: 5,
        justifyContent: 'center',
        margin: 10,
        padding: 10
    },
    buttonRed: {
        alignItems: 'center',
        backgroundColor: '#c70000',
        borderRadius: 10,
        elevation: 5,
        justifyContent: 'center',
        margin: 10,
        padding: 10
    },
    buttonOrange: {
        alignItems: 'center',
        backgroundColor: 'orange',
        borderRadius: 10,
        elevation: 5,
        justifyContent: 'center',
        margin: 10,
        padding: 10
    },
    containerAddNewVehicle: {
        alignItems: 'flex-end',
        bottom: 60,
        backgroundColor: 'rgba(125,125,125,0)',
        flexDirection: 'row',
        justifyContent: 'flex-end',
        position: 'absolute',
        width: '100%',
        zIndex: 1
    },
    containerButton: {
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'flex-end'
    },
    containerGarageDetailsSoftTitle: {
        flexDirection: 'row',
        margin: 10,
        marginTop: 0
    },
    containerGarageList: {
        borderBottomWidth: 1,
        borderColor: 'lightgrey',
        flexDirection: 'row',
        marginHorizontal: 5,
        padding: 8
    },
    containerHeader: {
        alignItems: 'center',
        backgroundColor: '#2D640F',
        height: 50,
        justifyContent: 'center'
    },
    containerHeaderMain: {
        alignItems: 'center',
        backgroundColor: '#2D640F',
        flexDirection: 'row',
        height: 45,
        justifyContent: 'flex-start'
    },
    containerList: {
        borderBottomWidth: 1,
        borderColor: 'lightgrey',
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 10
    },
    containerListHeader: {
        alignItems: 'center',
        backgroundColor: '#2D640F',
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 10
    },
    containerListHeaderText: {
        flex: 1,
        marginHorizontal: 3
    },
    containerLoading: {
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        bottom: 0,
        justifyContent: 'center',
        left: 0,
        position: 'absolute',
        right: 0,
        top: 0,
        zIndex: 999
    },
    containerSimpleLists: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 10,
        paddingTop: 0
    },
    containerVehicleMenu: {
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0)',
        bottom: 0,
        justifyContent: 'center',
        left: 0,
        position: 'absolute',
        right: 0,
        top: 0,
        zIndex: 999
    },
    containerVehicleMenuItems: {
        flex: 1,
        justifyContent: 'center',
    },
    dropDownAddVehicleContainerStyle: {
        height: '100%',
        marginRight: 10,
        width: '52%'
    },
    dropDownAddVehicleDropDownContainerStyle: {
        backgroundColor: '#F2F2F2',
        elevation: 5,
        maxHeight: 260
    },
    dropDownAddVehiclePlaceholderStyle: {
        fontFamily: util.getFontName(),
        fontSize: 12,
        color: 'grey'
    },
    dropDownAddVehicleStyle: {
        backgroundColor: '#F2F2F2',
        bottom: 0,
        elevation: 5,
        position: 'absolute'
    },
    dropDownAddVehicleTextStyle: {
        fontFamily: util.getFontName(),
        fontSize: 10
    },
    dropDownWishlistContainerStyle: {
        height: '100%',
        margin: 10,
        width: '95%'
    },
    dropDownWishlistDropDownContainerStyle: {
        borderWidth: 0.5,
        elevation: 5,
        maxHeight: 260
    },
    dropDownWishlistPlaceholderStyle: {
        fontFamily: util.getFontName(),
        fontSize: 12,
        color: 'grey'
    },
    dropDownWishlistStyle: {
        borderWidth: 0.5,
        elevation: 5
    },
    dropDownWishlistTextStyle: {
        fontFamily: util.getFontName(),
        fontSize: 12
    },
    header: {
        color: 'white',
        fontFamily: 'SignPainter-HouseScript',
        fontSize: 30,
        marginTop: 10
    },
    headerMain: {
        color: 'white',
        fontFamily: 'SignPainter-HouseScript',
        fontSize: 25,
        marginLeft: 10,
        marginTop: 10
    },
    loadingIndicator: {
        alignItems: 'center',
        flex: 1,
        justifyContent: 'center',
    },
    separator: {
        backgroundColor: 'lightgrey',
        height: 1,
        marginVertical: 5,
        width: '100%'
    },
    separatorTop: {
        backgroundColor: 'lightgrey',
        height: 1,
        marginTop: 3,
        width: '100%'
    },
    textBackupIdDetails: {
        color: '#F2F2F2',
        fontFamily: util.getFontName(),
        fontSize: 13
    },
    textBackupIdDialogTitle: {
        color: '#F2F2F2',
        fontFamily: util.getBoldFontName(),
        fontSize: 15
    },
    textButton: {
        color: 'white',
        fontFamily: util.getBoldFontName(),
        fontSize: 12
    },
    textGarageDetails: {
        color: 'grey',
        fontFamily: util.getFontName(),
        fontSize: 12
    },
    textGarageDetailsSoftTitle: {
        color: 'grey',
        fontFamily: util.getBoldFontName(),
        fontSize: 12
    },
    textGarageDetailsTitle: {
        color: 'black',
        fontFamily: util.getBoldFontName(),
        fontSize: 15,
        margin: 10
    },
    textInput: {
        borderRadius: 10,
        borderWidth: 0.5,
        color: 'black',
        fontFamily: util.getFontName(),
        fontSize: 12,
        height: 50,
        margin: 10
    },
    textInputNewVehicleName: {
        backgroundColor: '#F2F2F2',
        borderColor: 'black',
        borderRadius: 10,
        borderWidth: 1,
        color: 'black',
        elevation: 5,
        fontFamily: util.getFontName(),
        fontSize: 12,
        height: 50,
        marginRight: 10,
        width: '41%'
    },
    textInputSearch: {
        borderRadius: 10,
        borderWidth: 0.5,
        color: 'grey',
        fontSize: 12,
        fontStyle: 'italic',
        height: 40,
        margin: 5,
        marginBottom: 0
    },
    textListHeader: {
        color: '#F2F2F2',
        fontFamily: util.getFontName(),
        fontSize: 12
    },
    textListItemGarage: {
        color: 'black',
        fontFamily: util.getFontName(),
        fontSize: 11
    },
    textListItemGarageB: {
        color: 'black',
        fontFamily: util.getBoldFontName(),
        fontSize: 11
    },
    textListItemVehicle: {
        color: 'black',
        fontFamily: util.getFontName(),
        fontSize: 10.5
    },
    textListItemVehicleB: {
        color: 'black',
        fontFamily: util.getBoldFontName(),
        fontSize: 10.5
    },
    textSoftTitle: {
        color: 'black',
        fontFamily: util.getBoldFontName(),
        fontSize: 10.5,
        margin: 10
    },
    textWishlistItem: {
        color: 'black',
        fontFamily: util.getFontName(),
        fontSize: 10
    },
    textWishlistItemB: {
        color: 'black',
        fontFamily: util.getBoldFontName(),
        fontSize: 10
    }
});

export default styles;