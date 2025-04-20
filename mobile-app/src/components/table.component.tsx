import React from "react";
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { SensorDataType } from "../types/sensor-data.type";

export default function TableComponent({ data }: { data: SensorDataType[] }) {
    return (
        <ScrollView horizontal style={styles.container}>
            <View>
                <View style={[styles.row, styles.header]}>
                    <Text style={styles.cell}>Time</Text>
                    <Text style={styles.cell}>Temp (°C)</Text>
                    <Text style={styles.cell}>Humidity (%)</Text>
                    <Text style={styles.cell}>Heat Index</Text>
                    <Text style={styles.cell}>Dew Point</Text>
                    <Text style={styles.cell}>Abs Humidity</Text>
                </View>
                {data.map((item, index) => (
                    <View
                        key={index}
                        style={[
                            styles.row,
                            { backgroundColor: index % 2 === 0 ? '#fff' : '#f2f2f2' },
                        ]}
                    >
                        <Text style={styles.cell}>
                            {new Date(item.timestamp * 1000).toLocaleTimeString().slice(0, 5)}
                        </Text>
                        <Text style={styles.cell}>{item.temperature}</Text>
                        <Text style={styles.cell}>{item.humidity}</Text>
                        <Text style={styles.cell}>{item.heatIndex}</Text>
                        <Text style={styles.cell}>{item.dewPoint}</Text>
                        <Text style={styles.cell}>{item.absHumidity}</Text>
                    </View>
                ))}
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        margin: 10,
    },
    row: {
        flexDirection: 'row',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderColor: '#ccc',
    },
    header: {
        backgroundColor: '#ddd',
    },
    cell: {
        flex: 1,
        paddingHorizontal: 6,
        fontSize: 14,
        textAlign: 'center',
    },
});