import React from "react";
import { StyleSheet, KeyboardAvoidingView, Platform, Pressable } from "react-native";
import { TextInput, Button } from 'react-native-paper';
import { showMessage, hideMessage } from "react-native-flash-message";
import { useDispatch } from 'react-redux'
import AsyncStorage from '@react-native-async-storage/async-storage';


import api from "../Utils/api";
import getColorScheme from "../Utils/color";

export default function Loginscreen() {
    const [email, setEmail] = React.useState('');
    const [password, setPassword] = React.useState('');
    
    const ref = React.useRef(null);

    const dispatch = useDispatch();
    const color = getColorScheme();

    const login = async () => {
        const res = await api.login(email, password);
        if (res.code === "ERR_NETWORK") {
            showMessage({
                message: 'Network error',
                type: 'danger',
                duration: 3000,
                icon: 'danger',
            })
        } else if (res.status !== 200) {
            showMessage({
                message: 'Your email or password is incorrect.',
                type: 'danger',
                duration: 3000,
                icon: 'danger',
            })
        } else {
            AsyncStorage.setItem('token', res.data.jwt);
            dispatch({ type: 'LOGIN', payload: res.data.jwt });
        }
    }

    return (
        <KeyboardAvoidingView 
            style={[styles.container, {backgroundColor: color.background2}]} 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <TextInput
                style={styles.inputBox}
                label={'Your email...'}
                mode={'outlined'}
                value={email}
                onChangeText={text => setEmail(text)}
                shouldRasterizeIOS={true}
                autoCapitalize='none'
                autoCorrect={false}
            />

            <TextInput
                style={styles.inputBox}
                label={'Your password...'}
                mode={'outlined'}
                value={password}
                onChangeText={text => setPassword(text)}
                shouldRasterizeIOS={true}
                autoCapitalize='none'
                autoCorrect={false}
                secureTextEntry={true}
            />

            <Button
                mode={'elevated'}
                onPress={() => login()} 
                icon={'login'} 
                buttonColor={color.accent}
                textColor={color.text}
                //disabled={email.length === 0 || password.length === 0}
            >
                Login
            </Button>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },

    inputBox: {
        width: '85%',
        margin: 10,
        fontSize: 16,
        textAlign: 'center',
    },
});