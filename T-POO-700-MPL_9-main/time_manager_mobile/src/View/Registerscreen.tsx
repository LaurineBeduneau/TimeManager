import React from "react";
import { StyleSheet, KeyboardAvoidingView, Platform } from "react-native";
import { TextInput, Button } from 'react-native-paper';
import { showMessage, hideMessage } from "react-native-flash-message";
import { useDispatch } from 'react-redux'

import api from "../Utils/api";
import getColorScheme from "../Utils/color";

export default function Registerscreen() {
    const [email, setEmail] = React.useState('');
    const [username, setUsername] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [passwordConfirm, setPasswordConfirm] = React.useState('');

    const dispatch = useDispatch();
    const color = getColorScheme();

    const register = async () => {
        const res = await api.register(email, username, password, passwordConfirm);
        if (res.data.error) {
            showMessage({
                message: 'Error during registration.',
                type: 'danger',
                duration: 3000,
                icon: 'danger',
            })
            console.error(res.data);
        } else {
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
            />

            <TextInput
                style={styles.inputBox}
                label={'Your username...'}
                mode={'outlined'}
                value={username}
                onChangeText={text => setUsername(text)}
                shouldRasterizeIOS={true}
            />

            <TextInput
                style={styles.inputBox}
                label={'Your password...'}
                mode={'outlined'}
                value={password}
                onChangeText={text => setPassword(text)}
                shouldRasterizeIOS={true}
                secureTextEntry={true}
            />

            <TextInput
                style={styles.inputBox}
                label={'Confirm your password...'}
                mode={'outlined'}
                value={passwordConfirm}
                onChangeText={text => setPasswordConfirm(text)}
                shouldRasterizeIOS={true}
                secureTextEntry={true}
            />

            <Button 
                mode={'elevated'}
                onPress={() => register()} 
                icon={'account-plus'} 
                buttonColor={color.accent}
                textColor={color.text}
                disabled={email.length === 0 || password.length === 0 || passwordConfirm.length === 0 || username.length === 0}
            >
                Register
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