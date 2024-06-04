import React from "react";
import { View, StyleSheet, Text, Dimensions } from "react-native";
import { LineChart } from "react-native-chart-kit";
import { Title } from "react-native-paper";

export default function Chart(props: { text: string, data?: any, colorsFrom?: string, colorsTo?: string }) {
  return (
    <View style={{margin: 5}}>
      <Title>{props.text}</Title>
      <LineChart
        data={props.data} 
        width={Dimensions.get('window').width - 16} 
        height={220}
        chartConfig={{
          backgroundColor: '#1cc910',
          backgroundGradientFrom: props.colorsFrom || '#fb8c00',
          backgroundGradientTo: props.colorsTo || '#ffa726',
          decimalPlaces: 2,
          color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
          style: {
            borderRadius: 16,
            alignSelf: 'center',
          },
        }}
        style={{
          marginVertical: 8,
          borderRadius: 16,
          alignSelf: 'center',
        }}
      />
    </View>
  );
}