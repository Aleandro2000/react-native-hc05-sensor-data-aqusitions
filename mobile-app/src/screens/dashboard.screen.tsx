import React, { useEffect, useMemo, useState } from "react";
import {
    Platform,
    PermissionsAndroid,
    View,
    ScrollView,
    Button,
    Text,
    TouchableOpacity,
    Alert,
} from "react-native";
import { BleManager, Device, Subscription } from "react-native-ble-plx";
import { Buffer } from "buffer";
import StatisticsComponent from "../components/statistics.component";
import TableComponent from "../components/table.component";
import useSensorDataStore from "../stores/sensor-data.store";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../types/navigation.type";

export default function DashboardScreen() {
    const { sensorData, setSensorData } = useSensorDataStore();
    const [connected, setConnected] = useState(false);
    const [devices, setDevices] = useState<Device[]>([]);
    const navigation = useNavigation<StackNavigationProp<RootStackParamList, "Dashboard">>();
    const [loading, setLoading] = useState(false);
    const [notificationSub, setNotificationSub] = useState<Subscription | null>(null);
    const bleManager = useMemo(() => new BleManager(), []);

    const requestPermissions = async () => {
        if (Platform.OS === "android" && Platform.Version >= 23) {
            try {
                const result = await PermissionsAndroid.requestMultiple([
                    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
                    PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
                    PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
                    PermissionsAndroid.PERMISSIONS.BLUETOOTH_ADVERTISE,
                ]);

                const allGranted = Object.values(result).every(
                    (val) => val === PermissionsAndroid.RESULTS.GRANTED
                );

                if (!allGranted) {
                    Alert.alert("Permission Error", "Bluetooth permissions not granted.");
                }
            } catch (e) {
                console.error("Permission request failed:", e);
            }
        }
    };

    useEffect(() => {
        let isMounted = true;

        const init = async () => {
            await requestPermissions();
            scanDevices();
        };

        init();

        return () => {
            isMounted = false;
            bleManager?.destroy();
            notificationSub?.remove();
        };
    }, []);

    const scanDevices = async () => {
        try {
            setLoading(true);
            setDevices([]);

            bleManager.startDeviceScan(null, { allowDuplicates: false }, (error, device) => {
                if (error) {
                    console.error("Scan error:", error);
                    Alert.alert("Scan Error", error.message || "Unknown scan error.");
                    setLoading(false);
                    return;
                }

                if (device && (device.name || device.localName)) {
                    setDevices((prev) => {
                        const exists = prev.some((d) => d.id === device.id);
                        return exists ? prev : [...prev, device];
                    });
                }
            });

            setTimeout(() => {
                bleManager.stopDeviceScan();
                setLoading(false);
            }, 5000);
        } catch (err) {
            console.error("Scan failed:", err);
            Alert.alert("Error", "Failed to scan for devices.");
            setLoading(false);
        }
    };

    const connectToDevice = async (id: string) => {
        try {
            const device = await bleManager.connectToDevice(id);
            await device.discoverAllServicesAndCharacteristics();

            const services = await device.services();

            for (const service of services) {
                const characteristics = await service.characteristics();

                for (const char of characteristics) {
                    if (char.isNotifiable) {
                        let lastUpdateTime = Date.now();

                        const sub = char.monitor((error, characteristic) => {
                            if (error) {
                                console.error("Notification error:", error);
                                return;
                            }

                            try {
                                const base64Value = characteristic?.value;

                                if (base64Value) {
                                    const buffer = Buffer.from(base64Value, "base64");
                                    const decodedStr = buffer.toString("utf8");
                                    const parsed = JSON.parse(decodedStr);

                                    if (Date.now() - lastUpdateTime > 500) {
                                        lastUpdateTime = Date.now();

                                        const updated = [parsed, ...sensorData].sort((a, b) =>
                                            a.timestamp < b.timestamp ? 1 : -1
                                        );

                                        if (updated.length > 20) updated.pop();
                                        setSensorData(updated);
                                    }
                                }
                            } catch (e) {
                                console.error("Data parse error:", e);
                            }
                        });

                        setNotificationSub(sub);
                        setConnected(true);
                        return;
                    }
                }
            }

            Alert.alert("No Notifiable Characteristic", "Could not find any characteristic to monitor.");
        } catch (err) {
            console.error("Connection error:", err);
            Alert.alert("Connection Error", err.message || "Failed to connect.");
        }
    };

    return (
        <View style={{ flex: 1, padding: 16, backgroundColor: "white" }}>
            {!connected ? (
                <>
                    <Text style={{ fontSize: 20, marginBottom: 12 }}>Available Devices:</Text>
                    <ScrollView style={{ flex: 1 }}>
                        {devices.map((device) => (
                            <TouchableOpacity
                                key={device.id}
                                style={{
                                    padding: 12,
                                    borderWidth: 1,
                                    borderColor: "#ddd",
                                    marginBottom: 10,
                                    borderRadius: 8,
                                    backgroundColor: "#f0f0f0",
                                }}
                                onPress={() => connectToDevice(device.id)}
                            >
                                <Text style={{ fontWeight: "bold" }}>
                                    {device.name || device.localName || "Unnamed Device"}
                                </Text>
                                <Text style={{ color: "#555" }}>{device.id || "Unknown ID"}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                    <Button color="black" title={loading ? "Loading..." : "Rescan Devices"} disabled={loading} onPress={scanDevices} />
                </>
            ) : (
                <>
                    <ScrollView>
                        <View style={{ paddingBottom: "50px" }}>
                            <StatisticsComponent data={sensorData} />
                            <TableComponent data={sensorData} />
                        </View>
                    </ScrollView>
                    <Button
                        color="black"
                        title="Notification"
                        onPress={() => navigation.navigate("Notification")}
                    />
                </>
            )}
        </View>
    );
}
