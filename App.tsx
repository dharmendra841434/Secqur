import {
  View,
  Text,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  Alert,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import GetLocation from 'react-native-get-location';
import DeviceInfo from 'react-native-device-info';
import opencage from 'opencage-api-client';
import NetInfo from '@react-native-community/netinfo';
import firestore from '@react-native-firebase/firestore';

const App = () => {
  const [IMEI, setIMEI] = useState('');
  const [location, setLocation] = useState('');
  const [bataryLevel, setBataryLevel] = useState(0);
  const [isBataryCharging, setIsBataryCharging] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [currentTime, setCurrentTime] = useState('');
  const [loading, setLoading] = useState(false);
  const [pic, setPic] = useState();

  const getCurrentLocation = () => {
    GetLocation.getCurrentPosition({
      enableHighAccuracy: true,
      timeout: 15000,
    })
      .then(location => {
        /* console.log(location);
        setLocation(location); */
        const key = '0196c3fcda014ecba543036dfde25012';
        opencage
          .geocode({key, q: `${location.latitude},${location.longitude}`})
          .then(response => {
            let result = response.results[0];

            setLocation(result?.formatted);

            // console.log(result?.formatted);
          });
      })
      .catch(ex => {
        const {code, message} = ex;

        if (code === 'CANCELLED') {
          //alert('Location cancelled by user or by another request');
        }
        if (code === 'UNAVAILABLE') {
          //alert('Location service is disabled or unavailable');
        }
        if (code === 'TIMEOUT') {
          //alert('Location request timed out');
        }
        if (code === 'UNAUTHORIZED') {
          //alert('Authorization denied');
        }
      });
  };

  const getDeviceInfo = () => {
    DeviceInfo.getUniqueId().then(uniqueId => {
      // console.log(uniqueId, 'uniqueId');
      setIMEI(uniqueId);
    });
    DeviceInfo.getBatteryLevel().then(level => {
      // console.log(uniqueId, 'uniqueId');
      setBataryLevel(Math.round(level * 100));
    });
    DeviceInfo.isBatteryCharging().then(charging => {
      // console.log(uniqueId, 'uniqueId');
      setIsBataryCharging(charging);
    });
    NetInfo.addEventListener((state: {isConnected: any}) => {
      //console.log('Is connected?', state.isConnected);
      if (state.isConnected) {
        setIsConnected(true);
      } else {
        setIsConnected(false);
      }
    });
  };

  useEffect(() => {
    const interval = setInterval(() => {
      getCurrentLocation();
      getDeviceInfo();
      setCurrentTime(new Date().toLocaleTimeString());
      NetInfo.addEventListener((state: {isConnected: any}) => {
        //console.log('Is connected?', state.isConnected);
        if (state.isConnected) {
          storeData();
        } else {
          Alert.alert('Internet Connection', 'You are Not Connected', [
            {text: 'OK', onPress: () => console.log('OK Pressed')},
          ]);
        }
      });
    }, 900000);
    return () => clearInterval(interval);
  }, []);

  const storeData = () => {
    setLoading(true);
    firestore()
      .collection('Device Info')
      .add({
        YourLocation: location,
        DeviceIMEI_Number: IMEI,
        Batary_Level: bataryLevel,
        isBataryCharging: isBataryCharging,
        internetConnection: isConnected,
        DeviceCurrentTime: currentTime,
      })
      .then(() => {
        setLoading(false);
        console.log('Information Stored');
      });
  };

  const captureDevice = () => {
    getCurrentLocation();
    getDeviceInfo();
    setCurrentTime(new Date().toLocaleTimeString());
  };

  return (
    <View style={{flex: 1, backgroundColor: '#243763'}}>
      <StatusBar backgroundColor="#243763" />
      <Modal
        visible={loading}
        onRequestClose={() => {
          setLoading(false);
        }}
        transparent={true}>
        <View
          style={{
            backgroundColor: 'rgba(1, 1, 1, 0.6)',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            height: '100%',
          }}>
          <View
            style={{
              backgroundColor: '#FFEBB7',
              alignItems: 'center',
              justifyContent: 'center',
              width: '65%',
              height: '27%',
              borderRadius: 20,
            }}>
            <Text
              style={{
                color: '#243763',
                fontWeight: 'bold',
                textAlign: 'center',
                marginVertical: '12%',
              }}>
              Device Data Storing...
            </Text>
            <ActivityIndicator size="large" color="#243763" />
          </View>
        </View>
      </Modal>
      <View style={Styles.card}>
        <View style={{}}>
          <Text
            style={{
              color: '#FFEBB7',
              fontWeight: 'bold',
              textAlign: 'center',
              marginVertical: '3%',
            }}>
            Your Location
          </Text>
          <Text style={{color: '#AD8E70', fontWeight: 'bold'}}>{location}</Text>
        </View>

        <View style={Styles.conatiner}>
          <Text style={{color: '#FFEBB7', fontWeight: 'bold'}}>
            Device IMEI Number :{' '}
          </Text>
          <Text style={{color: '#AD8E70', fontWeight: 'bold'}}>{IMEI}</Text>
        </View>
        <View style={Styles.conatiner}>
          <Text style={{color: '#FFEBB7', fontWeight: 'bold'}}>
            Batary Level :{' '}
          </Text>
          <Text style={{color: '#AD8E70', fontWeight: 'bold'}}>
            {`${bataryLevel}%`}
          </Text>
        </View>
        <View style={Styles.conatiner}>
          <Text style={{color: '#FFEBB7', fontWeight: 'bold'}}>
            Is Batary Charging :{' '}
          </Text>
          <Text style={{color: '#AD8E70', fontWeight: 'bold'}}>
            {isBataryCharging ? 'Yes' : 'No'}
          </Text>
        </View>
        <View style={Styles.conatiner}>
          <Text style={{color: '#FFEBB7', fontWeight: 'bold'}}>
            Internet Connection:
          </Text>
          <Text style={{color: '#AD8E70', fontWeight: 'bold'}}>
            {isConnected ? 'Your Are Connected' : 'Your Are Not Connected'}
          </Text>
        </View>
        <View style={Styles.conatiner}>
          <Text style={{color: '#FFEBB7', fontWeight: 'bold'}}>
            Current Time:
          </Text>
          <Text style={{color: '#AD8E70', fontWeight: 'bold'}}>
            {currentTime}
          </Text>
        </View>
      </View>
      <TouchableOpacity
        onPress={() => captureDevice()}
        activeOpacity={0.6}
        style={Styles.button}>
        <Text style={{color: '#FFEBB7', fontWeight: 'bold', fontSize: 19}}>
          Capture Device Data
        </Text>
      </TouchableOpacity>
      {/*    <TouchableOpacity
        onPress={() => storeData()}
        activeOpacity={0.6}
        style={Styles.button}>
        <Text style={{color: '#FFEBB7', fontWeight: 'bold', fontSize: 19}}>
          Store Data
        </Text>
      </TouchableOpacity> */}
    </View>
  );
};
const Styles = StyleSheet.create({
  card: {
    backgroundColor: '#243763',
    elevation: 10,
    marginTop: '40%',
    alignSelf: 'center',
    width: '90%',
    paddingVertical: '5%',
    borderRadius: 10,
    paddingHorizontal: '12%',
  },
  conatiner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: '2%',
  },
  button: {
    backgroundColor: '#FF6E31',
    alignSelf: 'center',
    width: '70%',
    paddingVertical: '4%',
    alignItems: 'center',
    marginTop: '15%',
    borderRadius: 10,
  },
});
export default App;
