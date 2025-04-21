import React, { useEffect, useState } from "react";
import { Platform, PermissionsAndroid, View, ScrollView, ActivityIndicator, Button, Text } from "react-native";
import { BleManager, type Device } from "react-native-ble-plx";
import { SensorDataType } from "../types/sensor-data.type";
import StatisticsComponent from "../components/statistics.component";
import TableComponent from "../components/table.component";
import useSensorDataStore from "../stores/sensor-data.store";
import { useNavigation } from "@react-navigation/native";
import Config from "react-native-config";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../types/navigation.type";

const manager = new BleManager();

export default function DashboardScreen() {
    const { sensorData, setSensorData } = useSensorDataStore();
    const [connected, setConnected] = useState(false);
    const navigation = useNavigation<StackNavigationProp<RootStackParamList, "Dashboard">>();

    const requestPermissions = async () => {
        if (Platform.OS === "android") {
            await PermissionsAndroid.requestMultiple([
                PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
                PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
                PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
            ]);
        }
    };

    useEffect((): () => void => {
        requestPermissions();
        const subscription = manager.onStateChange((state) => {
            if (state === "PoweredOn") {
                scanAndConnect();
                subscription.remove();
            }
        }, true);

        return () => manager.destroy();
    }, []);

    const scanAndConnect = () => {
        manager.startDeviceScan(null, null, async (_, device) => {
            if (device?.name === Config.DEVICE_NAME) {
                manager.stopDeviceScan();
                try {
                    const connectedDevice = await device?.connect();
                    await connectedDevice?.discoverAllServicesAndCharacteristics();
                    setConnected(true);
                    listenToDeviceData(connectedDevice as Device);
                } catch (error) {
                    console.error("Connection failed:", error);
                }
            }
        });
    };

    const listenToDeviceData = (device: Device) => {
        device.monitorCharacteristicForService(
            "",
            "",
            (_, characteristic) => {
                if (characteristic?.value) {
                    try {
                        const decoded = JSON.parse(atob(characteristic.value));
                        if (sensorData.length > 20) {
                            sensorData.pop();
                            setSensorData([decoded, ...sensorData].sort((a: SensorDataType, b: SensorDataType) => a.timestamp < b.timestamp ? 1 : 0));
                            return;
                        }

                        setSensorData([decoded, ...sensorData].sort((a: SensorDataType, b: SensorDataType) => a.timestamp < b.timestamp ? 1 : 0));
                    } catch (e) {
                        console.error("Data decode error:", e);
                    }
                }
            }
        );
    };

    return (
        <View style={{ flex: 1, padding: 16, backgroundColor: "white", justifyContent: "center", alignItems: "center" }}>
            {!connected ? <ActivityIndicator size="large" color="black" /> : (
                <ScrollView>
                    <Button color="black" title="Notification" onPress={() => { navigation.navigate("Notification"); }} />
                    <StatisticsComponent data={sensorData} />
                    <TableComponent data={sensorData} />
                </ScrollView>
            )}
        </View>
    );
}
