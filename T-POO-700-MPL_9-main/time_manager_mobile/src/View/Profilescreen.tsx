import React, { useEffect } from "react";
import { View, Text, StyleSheet, Vibration, useColorScheme, KeyboardAvoidingView, FlatList, ScrollView } from "react-native";
import { ActivityIndicator, MD2Colors, Avatar, Card, IconButton, Button, Title, TextInput } from 'react-native-paper';
import { useDispatch, connect } from 'react-redux'
import Modal from "react-native-modal";
import moment from "moment";


import api from "../Utils/api";
import { showMessage } from "react-native-flash-message";
import getColorScheme from "../Utils/color";
import { team } from "../Type/teams";
import Chart from "../Component/Chat";
import { workingTimes } from "../Type/workingTimes";

interface Props {
    navigation: any;
    route: {
        name: string;
        key: string;
    }
    isLogged: boolean;
    token: string;
    username: string;
    email: string;
    userId: number;
    teams: team[];
}

function Profilescreen(props: Props) {
    const [isLoading, setIsLoading] = React.useState(true);
    const [isModalVisible, setIsModalVisible] = React.useState(false);

    const [username, setUsername] = React.useState(props.username);
    const [email, setEmail] = React.useState(props.email);
    const [password, setPassword] = React.useState('');
    const [passwordConfirm, setPasswordConfirm] = React.useState('');

    const [workHours, setWorkHours] = React.useState<{ [key: string]: number }>({});

    const dispatch = useDispatch();
    const colors = getColorScheme();

    useEffect(() => {
        if (props.username !== '' && props.userId !== -1) {
            setIsLoading(false);
        } else {
            profile().finally(() => {
                getTeams().finally(() => {
                    getWorkingTime().finally(() => {
                        setIsLoading(false);
                    });
                });
            });
                
        }
    }, []);

    const profile = async () => {
        const res = await api.getProfile();
        if (res.data.data) {
            dispatch({ type: 'PROFILE', payload: res.data.data });
        } else {
            showMessage({
                message: 'Error during profile loading. Please reload the app.',
                type: 'danger',
                duration: 3000,
                icon: 'danger',
            })
        }
    }

    const updateProfile = async () => {
        setIsModalVisible(false);
        setIsLoading(true);
        const res = await api.updateProfile(username, email, password, passwordConfirm);
        if (res.status === 200) {
            showMessage({
                message: 'Profile updated',
                type: 'success',
                duration: 3000,
                icon: 'success',
            })
            await profile();
            setIsLoading(false);
        } else {
            showMessage({
                message: 'Error during profile updating. Please reload the app.',
                type: 'danger',
                duration: 3000,
                icon: 'danger',
            })
        }
    }

    const getTeams = async () => {
        const res = await api.getTeamsForUser();
        if (res.data.data) {
            dispatch({ type: 'TEAMS', payload: res.data.data });
        } else {
            showMessage({
                message: 'Error during teams loading. Please reload the app.',
                type: 'danger',
                duration: 3000,
                icon: 'danger',
            })
        }
    }

    const getWorkingTime = async () => {
        const res = await api.getWorkingTimes(props.userId);
        if (res.data.data) {
            const workingTimes: workingTimes[] = res.data.data;
            const hoursByDay: { [key: string]: number } = {
                "Mon": 0,
                "Tue": 0,
                "Wed": 0,
                "Thu": 0,
                "Fri": 0,
                "Sat": 0,
                "Sun": 0
            };

            for (const wt of workingTimes) {
                const startOfWeek = moment().startOf('isoWeek');
                const endOfWeek = moment().endOf('isoWeek');
                const start = moment(wt.start);
                const end = moment(wt.end);

                if (start.isBetween(startOfWeek, endOfWeek)) {
                    const day = start.format('ddd');
                    const duration = moment.duration(end.diff(start));
                    hoursByDay[day] += duration.asHours();
                }
            }

            Object.keys(hoursByDay).forEach(day => {
                hoursByDay[day] = Math.round(hoursByDay[day] * 100) / 100;
            });

            setWorkHours(hoursByDay);
        } else {
            showMessage({
                message: 'Error during working time loading. Please reload the app.',
                type: 'danger',
                duration: 3000,
                icon: 'danger',
            })
        }
    }

    const logout = () => {
        dispatch({ type: 'LOGOUT' });
    }

    const workHoursData = {
        labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        datasets: [
            {
                labels: "Working hours",
                data: Object.values(workHours)
            }
        ]
    };

    return (
        <>
            {isLoading ? (
                <View style={styles.container}>
                    <ActivityIndicator animating={true} color={colors.accent} />
                </View>
            ) : (
                <View style={{flex: 1, backgroundColor: colors.background2}}>
                    <View style={{flexDirection: 'row', flex: 0.5, justifyContent: 'space-around', marginTop: 12}}>

                        {/* Profil card */}
                        <Card mode='elevated' style={[styles.card, {backgroundColor: colors.background}]}>
                            <Avatar.Text size={60} label={props.username[0].toLocaleUpperCase()} style={{alignSelf: 'center', backgroundColor: colors.accent}} color={colors.text}/>
                            <Button 
                                icon={'pen'}  
                                mode={'elevated'}
                                onPress={() => setIsModalVisible(true)}
                                style={{marginTop: 12}}
                                buttonColor={colors.accent}
                                textColor={colors.text}
                            >
                                Edit profile
                            </Button>
                            <Text style={{marginTop: 12, color: colors.text}}>Username: {props.username}</Text>
                            <Text style={{marginTop: 12, color: colors.text}}>Email: {props.email}</Text>
                            <Text style={{marginTop: 12, color: colors.text}}>ID: {props.userId}</Text>
                            <Button style={{marginTop: 12}} icon={'logout'} mode={'contained'} onPress={() => logout()} buttonColor={colors.accent} textColor={colors.text}>Logout</Button>
                        </Card>

                        {/* Teams card */}
                        {props.teams.length > 0 && 
                            <Card mode='elevated' style={[styles.card, {backgroundColor: colors.background}]}>
                                <Card.Title title="Your teams" style={{alignSelf: 'center'}} />
                                    <FlatList data={props.teams} renderItem={({item}) => {
                                        return (
                                            <Card.Content style={{flexDirection: 'row', alignItems: 'center', margin: 5}}>
                                                <Avatar.Text size={32} label={item.name[0].toLocaleUpperCase()} color={colors.text} style={{backgroundColor: colors.accent}} />
                                                <Text style={{marginLeft: 12, color: colors.text}}>{item.name}</Text>
                                                <Text style={{marginLeft: 12, color: colors.text}}>{item.id}</Text>
                                            </Card.Content>
                                    )
                                }}/>
                            </Card>
                        }
                    </View>

                    {/* Char for personnal working time */}
                    <Chart
                        text="Your working time this week"
                        data={workHoursData}
                        colorsFrom={colors.accent}
                        colorsTo={colors.accent2}
                    />

                    <Modal 
                        isVisible={isModalVisible} 
                        onBackdropPress={() => setIsModalVisible(false)} 
                        style={{margin: 0}}
                        swipeDirection={['down']}
                        onSwipeComplete={() => setIsModalVisible(false)}
                        avoidKeyboard={true}
                    >
                        <View style={{ width: '100%', height: '60%', backgroundColor: colors.background, borderTopStartRadius: 30, borderTopEndRadius: 30, position: 'absolute', bottom: 0 }}>
                            <Title style={{alignSelf: 'center', marginTop: 12}}>Edit profile</Title>
                            <IconButton 
                                icon={'close'} 
                                style={{position: 'absolute', top: 0, right: 12}} 
                                onPress={() => setIsModalVisible(false)}
                            />
                            <TextInput label={'Username'} value={username} onChangeText={(text) => {setUsername(text)}} style={{marginTop: 12, width: '90%', alignSelf: 'center'}} />
                            <TextInput label={'Email'} value={email} onChangeText={(text) => {setEmail(text)}} style={{marginTop: 12, width: '90%', alignSelf: 'center'}} />
                            <TextInput label={'Password'} value={password} onChangeText={(text) => {setPassword(text)}} style={{marginTop: 12, width: '90%', alignSelf: 'center'}} autoCapitalize="none" secureTextEntry />
                            <TextInput label={'New password'} value={passwordConfirm} onChangeText={(text) => {setPasswordConfirm(text)}} style={{marginTop: 12, width: '90%', alignSelf: 'center'}} autoCapitalize="none" secureTextEntry />

                            <Button 
                                icon={'check'}  
                                mode={'elevated'}
                                onPress={() => {
                                    updateProfile();
                                }}
                                style={{marginTop: 12, width: '90%', alignSelf: 'center'}}
                                buttonColor={colors.accent}
                                textColor={colors.text}
                            >
                                Update
                            </Button>
                        </View>
                    </Modal>
                </View>
            )}
        </>
    );
}

const mapStateToProps = (state: any, props: any) => {
    return {
        ...state,
    }
}

export default connect(mapStateToProps)(Profilescreen);

const styles = StyleSheet.create({
    container: {
        padding: 12,
        flex: 1,
        alignItems: 'center',
        // justifyContent: 'center',
    },

    card: {
        // margin: 12,
        padding: 12,
        borderRadius: 4,
        // backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
        // width: '50%',
        alignSelf: 'center',
    },
});

