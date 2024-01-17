import 'react-native-gesture-handler';
import React, { useState, useEffect } from 'react';
import { AppRegistry, Easing, Animated, LogBox } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import { connect, Provider } from 'react-redux';
import { persistStore, persistReducer } from 'redux-persist';
import { PersistGate } from 'redux-persist/integration/react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { persistedReducer } from './src/redux/store/index.js';
import { DarkTheme } from './src/styles/DarkTheme.js';
import { useTheme } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { BleManager } from 'react-native-ble-plx';

import BasicUserOpScreen from './src/navigation/screens/BasicUserOpScreen.js';
import GroupConfigScreen from './src/navigation/screens/GroupConfigScreen.js';

// Turn off React Native warnings in the app.
LogBox.ignoreAllLogs();

// Begin BLE Manager and Thunk it.
const BleDeviceManager = new BleManager();

// Managing state with Redux, state is persistent using redux-persist.
let store = createStore(
  persistedReducer,
  applyMiddleware(thunk.withExtraArgument(BleDeviceManager))
);
let persistor = persistStore(store);

// Using react-navigation.
const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function App() {
  const { colors } = useTheme();

  const tabBarOptions = {
    activeBackgroundColor: '#26004d',
    inactiveBackgroundColor: '#121212',
    activeTintColor: '#E0E0E0',
    inactiveTintColor: '#E0E0E0',
    labelStyle: {
      fontSize: 20,
    },
    keyboardHidesTabBar: (Platform.OS === "ios" ? false : true),
    tabStyle: {
      alignItems: 'center',
      justifyContent: 'space-around',
    },
  };

  // Transition settings from moving between screens.
  const transitionConfig = {
    transitionSpec: {
      duration: 500,
      easing: Easing.out(Easing.poly(4)),
      timing: Animated.timing,
      useNativeDriver: true,
    },
    screenInterpolator: sceneProps => {
      const { layout, position, scene } = sceneProps;
 
      const thisSceneIndex = scene.index;
      const width = layout.initWidth;
 
      const translateX = position.interpolate({
        inputRange: [thisSceneIndex - 1, thisSceneIndex],
        outputRange: [-width, 0],
        extrapolate: 'clamp'
      });
 
      return {
        transform: [{ translateX }]
      }
    }
  };

  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <NavigationContainer theme={DarkTheme}>
          <Tab.Navigator
            initialRouteName={"Basic User Operation"}
            lazy={false}
            keyboardHandlingEnabled={false}
            tabBarOptions={tabBarOptions}
            options={{
              transitionSpec: {
                open: transitionConfig,
                close: transitionConfig,
              }
            }}
          >
            <Tab.Screen
              name="Basic User Operation"
              component={BasicUserOpScreen}
              options={{
                transitionSpec: {
                  open: transitionConfig,
                  close: transitionConfig,
                }
              }}
            />
            <Tab.Screen
              name="Config"
              component={GroupConfigScreen}
              options={{
                transitionSpec: {
                  open: transitionConfig,
                  close: transitionConfig,
                }
              }}
            />
          </Tab.Navigator>
        </NavigationContainer>
      </PersistGate>
    </Provider>
  );
}

// Necessary to work on iOS.
AppRegistry.registerComponent('CompanionForSimpleDMXMicroController', () => App);

export default App;
