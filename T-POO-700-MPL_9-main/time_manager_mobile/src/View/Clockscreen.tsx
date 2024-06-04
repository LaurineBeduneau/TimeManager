import React, { useEffect, useReducer } from "react";
import { View, Text, StyleSheet } from "react-native";
import { Card, Paragraph, Title, Button, Avatar, ActivityIndicator, MD2Colors } from "react-native-paper";
import moment from "moment";
import { connect } from "react-redux";

import api from "../Utils/api";
import { clocksType } from "../Type/clocks";
import getColorScheme from "../Utils/color";

function Clockscreen(props: any) {
    const [isLoading, setIsLoading] = React.useState(true);
    const [currentClock, setCurrentClock] = React.useState<clocksType>();

    const color = getColorScheme();

    useEffect(() => {
        getClocked();
    }, []);


    const getClocked = async () => {
        const res = await api.getClocks();
        const clock: clocksType = res.data.data;
        if (clock && clock.status === true) {
            setCurrentClock(clock);
        }
        setIsLoading(false);
    }

    const createClock = async () => {
        const res = await api.createClock();
        getClocked();

    }

    const stopClock = async () => {
        const res = await api.createClock();
        setCurrentClock(undefined);
    }

    return (
        <View style={[styles.container, {backgroundColor: color.background2}]}>
            {isLoading ? (
                <ActivityIndicator animating={true} color={color.accent} />
            ) : (
                <Card mode='elevated' style={{backgroundColor: color.background}}>
                    {currentClock ? (
                        <>
                            <Card.Title title='Your working time' />
                            <Card.Content>
                                <Paragraph>Started since {moment().diff(currentClock.time, 'minute')} minutes</Paragraph>
                            </Card.Content>
                            <Card.Actions>
                                <Button textColor={color.text} onPress={() => {getClocked()}}>Reload</Button>
                                <Button buttonColor={color.accent}  onPress={() => {stopClock()}}>Stop</Button>
                            </Card.Actions>
                        </>
                    ) : (
                        <>
                            <Card.Title title='You are not working' />
                            <Card.Content>
                                <Paragraph>Start working now</Paragraph>
                            </Card.Content>
                            <Card.Actions>
                                <Button textColor={color.text} onPress={() => {getClocked()}}>Reload</Button>
                                <Button buttonColor={color.accent} onPress={() => createClock()}>Start</Button>
                            </Card.Actions>
                        </>
                    )}
                </Card>
            )}
        </View>
    );
}

const mapStateToProps = (state: any, props: any) => {
    return {
        ...state,
    }
}

export default connect(mapStateToProps)(Clockscreen);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
});