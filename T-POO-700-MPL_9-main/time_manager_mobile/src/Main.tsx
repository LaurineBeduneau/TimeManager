import React, { useEffect } from 'react';
import { Platform, StyleSheet, Text, View, Animated, Easing } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import {
  createBottomTabNavigator,
  BottomTabNavigationOptions
} from '@react-navigation/bottom-tabs';
import Ionicons from '@expo/vector-icons/Ionicons';
import { connect } from 'react-redux';

import { screenOptionProps, tabBarIconProps } from './Type/navigation';

import getColorScheme from './Utils/color';

import Homescreen from './View/Homescreen';
import Profilescreen from './View/Profilescreen';
import Loginscreen from './View/Loginscreen';
import Registerscreen from './View/Registerscreen';
import Clockscreen from './View/Clockscreen';
import Workingscreen from './View/Workingscreen';
import Managerscreen from './View/Managerscreen';
import Adminscreen from './View/Adminscreen';

const Tab = createBottomTabNavigator();

function Main(props: any) {
  const colors = getColorScheme();
  const isLogged = props.isLogged;
  const [userRole, setUserRole] = React.useState('user');

  useEffect(() => {
    setUserRole(props.role);
  }, [props]);

  const screenOptions = ({
    route
  }: screenOptionProps): BottomTabNavigationOptions => ({
    tabBarIcon: ({ focused, color, size }: tabBarIconProps) => {
      let iconName: any = '';
      let colorIcon: any = '';

      if (route.name === 'Login') {
        iconName = focused ? 'ios-log-in' : 'ios-log-in-outline';
        colorIcon = focused ? colors.accent : colors.inactive;
      } else if (route.name === 'Register') {
        iconName = focused ? 'ios-person-add' : 'ios-person-add-outline';
        colorIcon = focused ? colors.accent : colors.inactive;
      } else if (route.name === 'Home') {
        iconName = focused ? 'ios-home' : 'ios-home-outline';
        colorIcon = focused ? colors.accent : colors.inactive;
      } else if (route.name === 'Profile') {
        iconName = focused ? 'ios-person' : 'ios-person-outline';
        colorIcon = focused ? colors.accent : colors.inactive;
      } else if (route.name === 'Clock') {
        iconName = focused ? 'ios-time' : 'ios-time-outline';
        colorIcon = focused ? colors.accent : colors.inactive;
      } else if (route.name === 'Work') {
        iconName = focused ? 'ios-briefcase' : 'ios-briefcase-outline';
        colorIcon = focused ? colors.accent : colors.inactive;
      } else if (route.name === 'Manager') {
        iconName = focused ? 'ios-people' : 'ios-people-outline';
        colorIcon = focused ? colors.accent : colors.inactive;
      } else if (route.name === 'Admin') {
        iconName = focused ? 'ios-settings' : 'ios-settings-outline';
        colorIcon = focused ? colors.accent : colors.inactive;
      }

      return <Ionicons name={iconName} size={size} color={color} />;
    },
    tabBarShowLabel: true,
    tabBarHideOnKeyboard: true,
    tabBarStyle: {
      borderTopColor: colors.background,
      borderTopWidth: 1,
      borderBottomWidth: 0,
      borderRadius: 50,
      margin: 10,
      position: 'absolute',
      shadowColor: colors.shadow, //.is === 'light' ? '#1c1c1c' : 'grey',
      shadowOffset: {
        width: 1,
        height: 3
      },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 1,
      alignItems: 'center',
      alignContent: 'center',
      alignSelf: 'center'
    },
    tabBarBackground: () => (
      <View
        style={{
          backgroundColor: colors.background,
          height: Platform.OS === 'ios' ? '75%' : '100%',
          width: '100%',
          borderRadius: 50
        }}
      />
    ),
    tabBarActiveTintColor: colors.accent,
    tabBarInactiveTintColor: colors.inactive,
    headerBackground: () => (
      <View
        style={{
          backgroundColor: colors.background,
          height: '100%',
          alignItems: 'center'
        }}
      />
    ),
    headerTintColor: colors.text
  });

  return (
    <NavigationContainer>
      <Tab.Navigator screenOptions={screenOptions} initialRouteName="Login">
        {isLogged ? (
          <>
            {/* TODO: We need homescreen ? */}
            {/* <Tab.Screen name="Home" component={Homescreen} /> */}
            <Tab.Screen name="Profile" component={Profilescreen} />
            <Tab.Screen name="Clock" component={Clockscreen} />
            <Tab.Screen name="Work" component={Workingscreen} />
            {userRole === 'manager' ? (
              <Tab.Screen name="Manager" component={Managerscreen} />
            ) : (
              userRole === 'admin' && <Tab.Screen name="Admin" component={Adminscreen} />
            )}
          </>
        ) : (
          <>
            <Tab.Screen name="Login" component={Loginscreen} />
            <Tab.Screen name="Register" component={Registerscreen} />
          </>
        )}
      </Tab.Navigator>
    </NavigationContainer>
  );
}

const mapStateToProps = (state: any, props: any) => {
  return {
    ...state,
    ...props
  };
};

export const ConnectedApp = connect(mapStateToProps)(Main);
