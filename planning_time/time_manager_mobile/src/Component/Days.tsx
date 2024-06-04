import React, { useEffect } from "react";
import { View, Text, StyleSheet, FlatList } from "react-native";
import { Button, Card, IconButton } from "react-native-paper";
import moment from "moment";

import { workingTimes } from "../Type/workingTimes";

export default function Days(props: {data: workingTimes[]}) {
    const [currentDay, setCurrentDay] = React.useState(new Date());
    const [workingHours, setWorkingHours] = React.useState<number>();

    const hours = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23];

    useEffect(() => {
        const workingHours = numberWorkingHours();
        setWorkingHours(workingHours);
    }, [currentDay]);
        

    const numberWorkingHours = () => {
        for (const workingTime of props.data) {
            const day = moment(currentDay).format();
            const start = moment(workingTime.start).format();
            if (moment(day).isSame(start)) {
                const startHour = moment(workingTime.start).get('hour');
                const endHour = moment(workingTime.end).get('hour');
                return endHour - startHour;
            }
        }
    }

    const isWorkingHour = (hour: number) => {
        for (const workingTime of props.data) {
            const day = moment(currentDay).format('YYYY-MM-DD');
            const start = moment(workingTime.start).format('YYYY-MM-DD');
            if (moment(day).isSame(start)) {
                const startHour = moment(workingTime.start).get('hour');
                const endHour = moment(workingTime.end).get('hour');
                if (hour >= startHour && hour <= endHour) {
                    return true;
                }
            }
            
        };
        return false;
    };

    const renderDay = ({ item }: any) => {
        return (
            <Card style={styles.card}>
                <FlatList
                    showsVerticalScrollIndicator={false}
                    data={hours}
                    renderItem={({ item }) => {
                        const isWorking = isWorkingHour(item);
                        return (
                            <View style={[styles.hoursItem, isWorking ? styles.workingHour : null]}>
                                <Text>{item}</Text>
                            </View>
                        );
                    }}
                    keyExtractor={item => item.toString()}
                    ListHeaderComponent={() => {
                        return (
                            <View style={styles.hoursListHeader}>
                                <IconButton icon={'chevron-left'} onPress={() => setCurrentDay(new Date(currentDay.getTime() - 86400000))} />
                                <Text>Hours for {currentDay.getDate()} / {currentDay.getMonth() + 1} / {currentDay.getFullYear()}</Text>
                                <IconButton icon={'chevron-right'} onPress={() => setCurrentDay(new Date(currentDay.getTime() + 86400000))} />
                            </View>
                        );
                    }}
                />
            </Card>
        );
    }


    return (
        <>
            <Text>Today you work {workingHours || 0} hour</Text>
            <Button onPress={() => setCurrentDay(new Date())}>Reset date on today</Button>
            {renderDay(currentDay)}
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 12,
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },

    card: {
        height: '55%',
        width: '90%',
        alignSelf: 'center',
        padding: 12,
    },

    hoursListHeader: {
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        borderBottomWidth: 0.5,
        borderBottomColor: 'lightgrey',
        flexDirection: 'row',
    },

    hoursItem: {
        height: 50,
        paddingHorizontal: 12,
        width: '100%',
        justifyContent: 'center',
        borderBottomWidth: 0.5,
        borderBottomColor: 'lightgrey',
    },

    workingHour: {
        backgroundColor: 'lightgreen',
    },
});