import React, { useEffect } from "react";
import { Text, StyleSheet, TouchableOpacity, View } from "react-native";
import { Card, RadioButton, TextInput, Title, IconButton, Button, ActivityIndicator, MD2Colors } from "react-native-paper";
import Modal from "react-native-modal";
import { showMessage } from "react-native-flash-message";


import getColorScheme from "../Utils/color";
import api from "../Utils/api";
import { user } from "../Type/users";

interface Props {
    navigation: any;
    route: {
        name: string;
        key: string;
    }
}

function Adminscreen(props: Props) {
    const [users, setUsers] = React.useState<user[]>([]);
    const [isModalVisible, setIsModalVisible] = React.useState(false);
    const [isLoading, setIsLoading] = React.useState(true);

    const [userIdToEdit, setUserIdToEdit] = React.useState(-1);
    const [username, setUsername] = React.useState('');
    const [role, setRole] = React.useState('');

    const colors = getColorScheme();

    useEffect(() => {
        getUsers();
    }, []);

    const getUsers = async () => {
        const res = await api.getUsers();
        if (res.data.data) {
            setUsers(res.data.data);
            setIsLoading(false);
        } else {
            showMessage({
                message: 'Error during users loading. Please reload the app.',
                type: 'danger',
                duration: 3000,
                icon: 'danger',
            })
        }
    }

    const handleOpenModal = (userId: number) => {
        setIsLoading(true);
        setIsModalVisible(true);
        setUserIdToEdit(userId);
        setIsLoading(false);
    }

    return (
        <>
            {isLoading ? (
                <ActivityIndicator animating={true} color={MD2Colors.pinkA200} />
            ) : (
                <>
                    <Card mode='elevated' style={styles.container}>
                        <Card.Title title="Welcome Admin" subtitle="Edit account"/>
                        <Card.Content>
                            <Title>Users</Title>
                            {users.map((user, index) => {
                                return (
                                    <TouchableOpacity key={index} style={styles.radio} onPress={() => {
                                        handleOpenModal(user.id);
                                    }}>
                                        <RadioButton value={user.id.toString()} disabled onPress={() => {}}/>
                                        <Text>{user.id}</Text>
                                        <Text> - </Text>
                                        <Text>{user.username}</Text>
                                        <Text> - </Text>
                                        <Text>{user.role}</Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </Card.Content>
                    </Card>
                    <Modal
                        isVisible={isModalVisible} 
                        onBackdropPress={() => setIsModalVisible(false)} 
                        style={{margin: 0}}
                        swipeDirection={['down']}
                        onSwipeComplete={() => setIsModalVisible(false)}
                        avoidKeyboard={true}
                    >
                        <View style={{ width: '100%', height: '60%', backgroundColor: colors.background, borderTopStartRadius: 30, borderTopEndRadius: 30, position: 'absolute', bottom: 0 }}>
                            <Title style={{alignSelf: 'center', marginTop: 12}}>Edit user</Title>
                            <IconButton 
                                icon={'close'} 
                                style={{position: 'absolute', top: 0, right: 12}} 
                                onPress={() => setIsModalVisible(false)}
                            />
                            <TextInput label={'Username'} value={username} onChangeText={(text) => {setUsername(text)}} style={{marginTop: 12, width: '90%', alignSelf: 'center'}} />
                            <RadioButton.Group onValueChange={newValue => setRole(newValue)} value={role}>
                                <View style={styles.radio}>
                                    <RadioButton value={'user'} />
                                    <Text>User</Text>
                                </View>
                                <View style={styles.radio}>
                                    <RadioButton value={'manager'} />
                                    <Text>Manager</Text>
                                </View>
                                <View style={styles.radio}>
                                    <RadioButton value={'admin'} />
                                    <Text>Admin</Text>
                                </View>
                            </RadioButton.Group>

                            <Button 
                                icon={'check'}  
                                mode={'elevated'}
                                onPress={() => {
                                    setIsModalVisible(false);
                                    setIsLoading(true);
                                    showMessage({
                                        message: 'Profile updated',
                                        type: 'success',
                                        duration: 3000,                                    
                                        icon: 'success',
                                    })
                                    // profile();
                                    getUsers();
                                    api.updateUser(userIdToEdit, username, '', role);
                                }}
                                style={{marginTop: 12, width: '90%', alignSelf: 'center'}}
                            >
                                Update
                            </Button>
                        </View>
                    </Modal>
                </>
            )}
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        margin: 10
    },

    input: {
        margin: 10,
    },

    radio: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center'
    }
});

export default Adminscreen;