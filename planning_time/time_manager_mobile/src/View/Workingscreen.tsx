import React, { useEffect, useState } from "react";
import { View, Text, Button, StyleSheet } from "react-native";
import { connect } from "react-redux";
import Timeline from 'react-native-timeline-flatlist';
import { ActivityIndicator, Title } from "react-native-paper";
import moment from 'moment';

import api from "../Utils/api";
import { workingTimes } from "../Type/workingTimes";
import getColorScheme from "../Utils/color";

function Workingscreen(props: any) {
    const [isLoading, setIsLoading] = useState(true);
    const [workingTimes, setWorkingTimes] = useState<workingTimes[]>([]);
    const [selectedDate, setSelectedDate] = useState(moment().format('YYYY-MM-DD')); // default to today

    const color = getColorScheme();

    useEffect(() => {
        fetchWorkingTime().finally(() => {
            setIsLoading(false);
        });
    }, []);

    useEffect(() => {
        const unsubscribe = props.navigation.addListener('focus', () => {
            fetchWorkingTime().finally(() => {
                setIsLoading(false);
            })  
        })

        return unsubscribe;
    }, [props.navigation]);

    const fetchWorkingTime = async () => {
        setIsLoading(true);
        const res = await api.getWorkingTimes(props.userId);
        setWorkingTimes(res.data.data);
    }

    const getTimelineData = () => {
        return workingTimes
            .filter(item => moment(item.start).format('YYYY-MM-DD') === selectedDate)
            .map(item => ({
                time: moment(item.start).format('HH:mm'),
                title: `Start: ${moment(item.start).format('HH:mm')}`,
                description: `End: ${moment(item.end).format('HH:mm')}`
            }));
    };

    const getTotalTimeWorkedForTheDay = () => {
        const workingTimesForTheDay = workingTimes.filter(item => moment(item.start).format('YYYY-MM-DD') === selectedDate);
        let totalTime = 0;
        workingTimesForTheDay.forEach(item => {
            const startTime = moment(item.start);
            const endTime = moment(item.end);
            const duration = moment.duration(endTime.diff(startTime));
            totalTime += duration.asMinutes();
        });
        const hours = Math.floor(totalTime / 60);
        const minutes = totalTime % 60;
        return `${hours} hour(s) and ${minutes.toFixed(0)} minute(s)`;
    }

    const handlePrevDay = () => {
        setSelectedDate(moment(selectedDate).subtract(1, 'days').format('YYYY-MM-DD'));
    };

    const handleNextDay = () => {
        setSelectedDate(moment(selectedDate).add(1, 'days').format('YYYY-MM-DD'));
    };

    return (
        <View style={[styles.container, {backgroundColor: color.background2}]}>
            <View style={styles.buttonContainer}>
                <Button color={color.accent} title="Prev Day" onPress={handlePrevDay} />
                <Title style={{color: color.text}}>{selectedDate}</Title>
                <Button color={color.accent} title="Next Day" onPress={handleNextDay} />
            </View>
            {isLoading ? (
                <ActivityIndicator color={color.accent}/>
            ) : (
                <View style={{height: '85%', width: '90%',  margin: 12, position: 'absolute', top: 70}}>
                    <Title style={{marginBottom: 12, color: color.text}}>This day, you worked a total of {getTotalTimeWorkedForTheDay()}</Title>
                    <Timeline
                        data={getTimelineData()}
                        separator
                        showTime={false}
                        circleColor={color.accent2}
                        lineColor={color.accent}
                        timeContainerStyle={{minWidth: 52, marginTop: -5}}
                        descriptionStyle={{color: color.text}}
                        titleStyle={{color: color.accent}}
                        innerCircle={'dot'}
                        dotColor={color.accent}
                        circleSize={20}
                    />
                </View>
            )}
        </View>
    );
}

const mapStateToProps = (state: any, props: any) => {
    return {
        ...state,
    };
}

export default connect(mapStateToProps)(Workingscreen);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'flex-start',
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        padding: 10,
    },
});