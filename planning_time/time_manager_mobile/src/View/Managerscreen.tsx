import React, { useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, useColorScheme, FlatList } from "react-native";
import { ActivityIndicator, Avatar, Button, Card, IconButton, MD2Colors, RadioButton, TextInput, Title } from "react-native-paper";
import Modal from "react-native-modal";
import { connect, useDispatch } from "react-redux";

import getColorScheme from "../Utils/color";
import api from "../Utils/api";
import { user } from "../Type/users";
import { team } from "../Type/teams";
import { showMessage } from "react-native-flash-message";

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

interface teamWithUsersType extends team {
    users: user[];
}

function Managerscreen(props: Props) {
    const [isLoading, setIsLoading] = React.useState(true);

    const colors = getColorScheme();
    const dispatch = useDispatch();

    // For create team 
    const [modalCreateTeam, setModalCreateTeam] = React.useState(false);
    const [teamName, setTeamName] = React.useState('');

    // For manage team
    const [modalManageTeam, setModalManageTeam] = React.useState(false);
    const [teamToManage, setTeamToManage] = React.useState<team>();
    const [radioValue, setRadioValue] = React.useState('');
    const [userInTeam, setUserInTeam] = React.useState<user[]>([]);
    const [userNotInTeam, setUserNotInTeam] = React.useState<user[]>([]);

    // For graph
    const [teamWithUsers, setTeamWithUsers] = React.useState<teamWithUsersType[]>([]);

    useEffect(() => {
        if (teamWithUsers.length === 0) {
            fetchUsersInTeam()
            .finally(() => {
                setIsLoading(false);
            })
            .catch((error) => {
                console.error(error);
                showMessage({
                    message: 'Error',
                    type: 'danger',
                });
            });
        }
    }, [])

    const handleCreateTeam = async () => {
        const result = await api.createTeam(teamName);      
        try {
            if (result.data.data) {
                setModalCreateTeam(false);
                setTeamName('');
                showMessage({
                    message: 'Team created',
                    type: 'success',
                });
                dispatch({type: 'ADD_TEAM', payload: result.data.data});
                await fetchUsersInTeam();
            } 
        } catch (error) {
            console.error(error);
            showMessage({
                message: 'Error',
                type: 'danger',
            });
        }
    }

    const handleSelectTeam = async (team: team) => {
        const res1 = await api.getTeamMembers(team.id);
        const teamMembers: user[] = res1.data.data;
        const res2 = await api.getUsersForManager();
        const allUsers: user[] = res2.data.data;
        const tmpUserInTeam: user[] = [];
        const tmpUserNotInTeam: user[] = [];
        for (const user of allUsers) {
            if (teamMembers.find((teamMember) => teamMember.id === user.id)) {
                tmpUserInTeam.push(user);
            } else {
                tmpUserNotInTeam.push(user);
            }
        }
        setUserInTeam(tmpUserInTeam);
        setUserNotInTeam(tmpUserNotInTeam);
        setTeamToManage(team);
    }

    const handleAddMemberToTeam = async (user: user) => {
        if (user.role === 'admin' || user.role === 'manager') {
            showMessage({
                message: 'You cannot add an admin to a team',
                type: 'danger',
            });
            return;
        }
        const res = await api.addMemberToTeam(teamToManage!.id, user.id);
        if (res.status === 201) {
            showMessage({
                message: 'Member added',
                type: 'success',
            });
            setUserInTeam([...userInTeam, user]);
            setUserNotInTeam(userNotInTeam.filter((item) => item.id !== user.id));
        } else {
            showMessage({
                message: 'Error',
                type: 'danger',
            });
        }
    }

    const handleRemoveMemberFromTeam = async (user: user) => {
        if (user.id === props.userId) {
            showMessage({
                message: 'You cannot remove yourself from the team',
                type: 'danger',
            });
            return;
        }
        const res = await api.removeMemberFromTeam(teamToManage!.id, user.id);
        if (res.status === 200) {
            showMessage({
                message: 'Member removed',
                type: 'success',
            });
            setUserNotInTeam([...userNotInTeam, user]);
            setUserInTeam(userInTeam.filter((item) => item.id !== user.id));
        } else {
            showMessage({
                message: 'Error',
                type: 'danger',
            });
        }
    }

    const fetchUsersInTeam = async () => {
        const tmpTeamWithUsers: teamWithUsersType[] = [];
        for (const team of props.teams) {
            const res = await api.getTeamMembers(team.id);
            const users: user[] = res.data.data;
            tmpTeamWithUsers.push({
                ...team,
                users: users,
            });
        }
        setTeamWithUsers(tmpTeamWithUsers);
    }

    const handleDeleteTeam = async () => {
        const res = await api.deleteTeam(teamToManage!.id);
        if (res.status === 204) {
            showMessage({
                message: 'Team deleted',
                type: 'success',
            });
            dispatch({type: 'DELETE_TEAM', payload: teamToManage!.id});
            setTeamToManage(undefined);
        }
    }

    return(
        <>
            {isLoading ? (
                <View style={{flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background2}}>
                    <ActivityIndicator animating={true} color={colors.accent} />
                </View>
            ) : (
                <View style={{flex: 1, backgroundColor: colors.background2}}>
                    {/* View content */}
                    <Card mode='elevated' style={{margin: 12, backgroundColor: colors.background}}>
                        <Card.Title title="Hello Manager"/>
                        <Card.Content>
                            <Button 
                                mode='elevated' 
                                onPress={() => setModalCreateTeam(true)}
                                style={{marginBottom: 12}}
                                buttonColor={colors.accent}
                                textColor={colors.text}
                            >
                                Create a team
                            </Button>
                            <Button 
                                mode='elevated' 
                                onPress={() => {setModalManageTeam(true)}}
                                buttonColor={colors.accent}
                                textColor={colors.text}
                            >
                                Manage a team
                            </Button>
                        </Card.Content>
                    </Card>

                    {/* TODO: implement Graph below */}
                    <FlatList
                        ListHeaderComponent={() => {
                            return (
                                <Title style={{alignSelf: 'center', marginTop: 12}}>Your teams</Title>
                            )
                        }}
                        data={teamWithUsers}
                        keyExtractor={(item) => item.id.toString()}
                        ListFooterComponent={() => {
                            return (
                                <View style={{height: 50}}/>
                            )
                        }}
                        renderItem={({item}) => {
                            return (
                                <>
                                    <View style={{flexDirection: 'row', alignItems: 'center', margin: 10, borderRadius: 12, padding: 5}}>
                                        <Title>{item.id} - {item.name}</Title>
                                    </View>
                                    <FlatList
                                        data={item.users}
                                        keyExtractor={(item) => item.id.toString()}
                                        style={{marginLeft: 20}}
                                        renderItem={({item}) => {
                                            return (
                                                <View style={{flexDirection: 'row', alignItems: 'center', margin: 10, borderRadius: 12, padding: 5}}>
                                                    <Text style={{color: colors.text}}>{item.id} - {item.username} - {item.role}</Text>
                                                </View>
                                            )
                                        }}
                                    />
                                </>
                            )
                        }}
                    />

                    {/* Modal for create team */}
                    <Modal 
                        isVisible={modalCreateTeam}
                        onBackdropPress={() => setModalCreateTeam(false)} 
                        style={{margin: 0}}
                        swipeDirection={['down']}
                        onSwipeComplete={() => setModalCreateTeam(false)}
                        avoidKeyboard={true}
                        onModalWillHide={() => fetchUsersInTeam()}
                    >
                        <View style={{ width: '100%', height: '30%', backgroundColor: colors.background, borderTopStartRadius: 30, borderTopEndRadius: 30, position: 'absolute', bottom: 0 }}>
                            <Title style={{alignSelf: 'center', marginTop: 12}}>Create new team</Title>
                            <IconButton 
                                icon={'close'} 
                                style={{position: 'absolute', top: 0, right: 12}} 
                                onPress={() => setModalCreateTeam(false)}
                            />
                            <TextInput 
                                label={'Team name'} 
                                style={{marginTop: 12, width: '90%', alignSelf: 'center'}}
                                value={teamName}
                                onChangeText={(text) => setTeamName(text)}
                            />

                            <Button 
                                icon={'plus'} 
                                mode={'contained'} 
                                onPress={() => {handleCreateTeam()}}
                                style={{marginTop: 12, width: '80%', alignSelf: 'center'}}
                                buttonColor={colors.accent}
                                textColor={colors.text}
                            >
                                Create
                            </Button>
                        </View>
                    </Modal>

                    {/* Modal for manage team */}
                    <Modal
                        isVisible={modalManageTeam}
                        onBackdropPress={() => setModalManageTeam(false)} 
                        style={{margin: 0}}
                        swipeDirection={['down']}
                        onSwipeComplete={() => setModalManageTeam(false)}
                        avoidKeyboard={true}
                        propagateSwipe={true}
                        onModalWillHide={() => fetchUsersInTeam()}
                    >
                        <View style={{ width: '100%', height: '80%', backgroundColor: colors.background, borderTopStartRadius: 30, borderTopEndRadius: 30, position: 'absolute', bottom: 0, borderWidth: 1 }}>
                            <Title style={{alignSelf: 'center', marginTop: 12}}>Manage team</Title>
                            <IconButton 
                                icon={'close'} 
                                style={{position: 'absolute', top: 0, right: 12}} 
                                onPress={() => setModalManageTeam(false)}
                            />
                            <View>
                                <Title style={{alignSelf: 'center'}}>Select team to manage</Title>
                                <FlatList
                                    data={props.teams}
                                    keyExtractor={(item) => item.id.toString()}
                                    horizontal={true}
                                    style={{alignSelf: 'center'}}
                                    showsHorizontalScrollIndicator={false}
                                    renderItem={({item}) => {
                                        return (
                                            <TouchableOpacity onPress={() => handleSelectTeam(item)} style={{margin: 9}}>
                                                <Avatar.Text size={32} label={item.name[0].toLocaleUpperCase()} style={{margin: 12, backgroundColor: colors.accent}} color={colors.text} />
                                                <Text style={{alignSelf: 'center', marginHorizontal: 12, color: colors.text}}>{item.name}</Text>
                                            </TouchableOpacity>
                                        )
                                    }}
                                />
                            </View>
                            <View>
                                {teamToManage === undefined ? (
                                    <View style={{flex: 1, justifyContent: 'center', alignItems: 'center', alignSelf: 'center', marginTop: 12}}>
                                        <ActivityIndicator animating={true} color={colors.accent} />
                                    </View>                                
                                ) : (
                                    <>
                                        <Title style={{alignSelf: 'center', marginTop: 12}}>Manage team: 
                                            <Title style={{color: colors.accent}}>
                                                {' ' + teamToManage.name}
                                            </Title>
                                        </Title>
                                        <RadioButton.Group onValueChange={(value: string) => setRadioValue(value)} value={radioValue}>
                                            <View style={{flexDirection: 'row', alignSelf: 'center'}}>
                                                <RadioButton.Item label="Add member" value="add" color={colors.accent} />
                                                <RadioButton.Item label="Remove member" value="remove" color={colors.accent} />
                                            </View>
                                        </RadioButton.Group>
                                        <View>
                                            {radioValue === 'add' ? (
                                                <>
                                                    <Title style={{alignSelf: 'center', marginTop: 12}}>Add member</Title>
                                                    <FlatList
                                                        data={userNotInTeam}
                                                        keyExtractor={(item) => item.id.toString()}
                                                        horizontal={true}
                                                        style={{alignSelf: 'center'}}
                                                        showsHorizontalScrollIndicator={false}
                                                        renderItem={({item}) => {
                                                            return (
                                                                <TouchableOpacity onPress={() => handleAddMemberToTeam(item)} style={{margin: 9}}>
                                                                    <Avatar.Text size={32} label={item.username[0].toLocaleUpperCase()} style={{margin: 12, alignSelf: 'center', backgroundColor: colors.accent}} color={colors.text} />
                                                                    <Text style={{alignSelf: 'center', marginHorizontal: 12, color: colors.text}}>{item.id} - {item.username.slice(0,5)}...</Text>
                                                                </TouchableOpacity>
                                                            )
                                                        }}
                                                    />
                                                </>
                                            ) : (
                                                <>
                                                    <Title style={{alignSelf: 'center', marginTop: 12}}>Remove member</Title>
                                                    <FlatList
                                                        data={userInTeam}
                                                        keyExtractor={(item) => item.id.toString()}
                                                        horizontal={true}
                                                        style={{alignSelf: 'center'}}
                                                        renderItem={({item}) => {
                                                            return (
                                                                <TouchableOpacity onPress={() => {handleRemoveMemberFromTeam(item)}} style={{margin: 9}}>
                                                                    <Avatar.Text size={32} label={item.username[0].toLocaleUpperCase()} style={{margin: 12, alignSelf: 'center', backgroundColor: colors.accent}} color={colors.text} />
                                                                    <Text style={{alignSelf: 'center', marginHorizontal: 12, color: colors.text}}>{item.id} - {item.username.slice(0,5)}...</Text>
                                                                </TouchableOpacity>
                                                            )
                                                        }}
                                                    />
                                                </>
                                            )}

                                            <View style={{flexDirection: 'row', justifyContent: 'center', margin: 12}}>
                                                    <Button icon={'delete'} style={{margin: 12}} buttonColor={'red'} textColor={'white'} onPress={() => {handleDeleteTeam()}}>
                                                        Delete this team
                                                    </Button>
                                            </View>
                                        </View>
                                    </>
                                )}
                            </View>
                        </View>
                    </Modal>
                </View>
            )}
        </>

    )
}

const mapStateToProps = (state: any, props: any) => {
    return {
        ...state,
    }
}
    

export default connect(mapStateToProps)(Managerscreen);