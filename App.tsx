/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, {useEffect} from 'react';
import type {PropsWithChildren} from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from 'react-native';

import {
  Colors,
  DebugInstructions,
  Header,
  LearnMoreLinks,
  ReloadInstructions,
} from 'react-native/Libraries/NewAppScreen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ReactNativeBiometrics, { BiometryTypes } from 'react-native-biometrics';
import { RSA } from 'react-native-rsa-native';


type SectionProps = PropsWithChildren<{
  title: string;
}>;

function Section({children, title}: SectionProps): JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <View style={styles.sectionContainer}>
      <Text
        style={[
          styles.sectionTitle,
          {
            color: isDarkMode ? Colors.white : Colors.black,
          },
        ]}>
        {title}
      </Text>
      <Text
        style={[
          styles.sectionDescription,
          {
            color: isDarkMode ? Colors.light : Colors.dark,
          },
        ]}>
        {children}
      </Text>
    </View>
  );
}

function App(): JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';
  let epochTimeSeconds = Math.round((new Date()).getTime() / 1000).toString()
  let payload = epochTimeSeconds + 'some message'

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  const rnBiometrics = new ReactNativeBiometrics({
    allowDeviceCredentials: true,
  });

  const _storeData = async (publicKey: string) => {
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
      }
    } catch(e) {
      // error reading value
    }
  }

  const verifySignature = async (signature: string, payload: string) => { 
      const valid = await RSA.verify(signature, payload, "dnehijrnkfnk")
      console.log('verified', valid);
  }

  useEffect(() => {
    rnBiometrics.isSensorAvailable().then(resultObject => {
      const {available} = resultObject;

      if (available) {
        rnBiometrics.biometricKeysExist().then(resultKey => {
          const {keysExist} = resultKey;

          if (keysExist) {
            console.log('Keys exist');
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
          promptMessage: 'Sign in',
          payload: payload
        })
        .then((resultObject) => {
          const { success, signature} = resultObject
      
          if (success) {
            console.log(signature)
            verifySignature(signature, payload)
          }
        })
      }
    });
  }, []);

  return (
    <SafeAreaView style={backgroundStyle}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={backgroundStyle.backgroundColor}
      />
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        style={backgroundStyle}>
        <Header />
        <View
          style={{
            backgroundColor: isDarkMode ? Colors.black : Colors.white,
          }}>
          <Section title="Step One">
            Edit <Text style={styles.highlight}>App.tsx</Text> to change this
            screen and then come back to see your edits.
          </Section>
          <Section title="See Your Changes">
            <ReloadInstructions />
          </Section>
          <Section title="Debug">
            <DebugInstructions />
          </Section>
          <Section title="Learn More">
            Read the docs to discover what to do next:
          </Section>
          <LearnMoreLinks />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
  },
  highlight: {
    fontWeight: '700',
  },
});

export default App;
