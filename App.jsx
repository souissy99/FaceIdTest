/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, {useEffect, useState} from 'react';
import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  Pressable,
  Alert,
} from 'react-native';

import {
  Colors,
} from 'react-native/Libraries/NewAppScreen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ReactNativeBiometrics, { BiometryTypes } from 'react-native-biometrics';
import { RSA } from 'react-native-rsa-native';

function App() {
  const [isLogged, setIsLogged] = useState(false);
  let epochTimeSeconds = Math.round((new Date()).getTime() / 1000).toString()
  let payload = epochTimeSeconds + 'some message'

  const backgroundStyle = {
    backgroundColor: Colors.darker,
    flex: 1,
  };

  const rnBiometrics = new ReactNativeBiometrics({
    allowDeviceCredentials: true,
  });

  const _storeData = async (publicKey) => {
    try {
      await AsyncStorage.setItem(
        '@MySuperStore:key',
        publicKey,
      );
    } catch (error) {
      // Error saving data
    }
  };


  const _getData = async () => {
    try {
      const value = await AsyncStorage.getItem('@MySuperStore:key')
      if(value !== null) {
        console.log(value) 
        return value
      }
    } catch(e) {
      // error reading value
      console.log(e)
    }
  }

  const activateBiometric = () => {
    rnBiometrics.isSensorAvailable().then(resultObject => {
      const {available, biometryType} = resultObject;

      console.log(available, biometryType);

      if (available) {
        rnBiometrics.biometricKeysExist().then(resultKey => {
          const {keysExist} = resultKey;

          if (keysExist) {
            console.log('Keys exist');
            _getData();
          } else {
            rnBiometrics.createKeys()
            .then((resultObject) => {
              const { publicKey } = resultObject
              console.log(publicKey)
              _storeData(publicKey);
            })
          }
        });

        rnBiometrics.createSignature({
          promptMessage: 'Test authentification',
          payload: payload
        })
        .then((resultObject) => {
          const { success, signature} = resultObject
      
          if (success) {
            if (typeof signature === 'string') {
              // console.log(signature, payload)
              verifySignature(signature, payload)
            }
          } else {
            console.log('Signature failed');
          }
        })
      }
    });
  }

  const verifySignature = async (signature, payload) => { 
    const token = await _getData()

    if (!token || signature == '' || payload == '') {
      Alert.alert('Error', 'Missing information')
      return
    }

    console.log('Try verify')

    const valide  = await RSA.verify64(signature, payload, token)

    console.log('valide', valide)

    if (valide) {
      setIsLogged(true)
    } else {
      Alert.alert('Error', 'Invalid Signature')
    }
  }

  useEffect(() => {

  }, []);

  return (
    <SafeAreaView style={backgroundStyle}>
      <StatusBar
        barStyle='dark-content'
        backgroundColor={backgroundStyle.backgroundColor}
      />
        <View
          style={{
            backgroundColor: Colors.darker,
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
          }}>
            {isLogged ?
            <>
            <Text style={styles.title}>Logged</Text>
            <Pressable
              style={styles.button}
              onPress={() => setIsLogged(false)}>
              <Text style={styles.text}>Logout</Text>
            </Pressable>
            </>
            : <Pressable
              style={styles.button}
              onPress={() => activateBiometric()}>
              <Text style={styles.text}>Login</Text>
            </Pressable>
            }
        </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 4,
    elevation: 3,
    backgroundColor: 'black',
    width: 200,
  },
  text: {
    fontSize: 16,
    lineHeight: 21,
    fontWeight: 'bold',
    letterSpacing: 0.25,
    color: 'white',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 20,
  },
});

export default App;
