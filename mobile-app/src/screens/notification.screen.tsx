import React from "react";
import { View, Text, Button, StyleSheet } from "react-native";
import { useNavigation } from '@react-navigation/native';
import useSensorDataStore from "../stores/sensor-data.store";

export default function NotificationScreen() {
    const latestSensorData = useSensorDataStore((state) => state.sensorData.at(-1));

    const navigation = useNavigation();

    const handleDismiss = () => {
        navigation.goBack();
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Diagnose</Text>
            <View style={styles.card}>
                <Text style={styles.cardTitle}>Status: {latestSensorData?.status ?? "-"}</Text>
                <Text style={styles.cardText}>Temperature: {latestSensorData?.temperature ?? "-"}°C</Text>
                <Text style={styles.cardText}>Humidity: {latestSensorData?.humidity ?? "-"}%</Text>
            </View>
            <Button color="black" title="Dismiss" onPress={handleDismiss} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 16,
        backgroundColor: "white",
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        color: "black",
        marginBottom: 16,
    },
    card: {
        width: "80%",
        padding: 16,
        borderRadius: 10,
        backgroundColor: "#f8f8f8",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
        marginBottom: 24,
        alignItems: "center",
    },
    cardTitle: {
        fontSize: 20,
        fontWeight: "bold",
        color: "black",
        marginBottom: 8,
    },
    cardText: {
        fontSize: 16,
        color: "black",
    },
});
