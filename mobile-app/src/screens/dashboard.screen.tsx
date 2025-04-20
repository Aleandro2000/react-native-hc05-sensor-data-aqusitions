import React, { useEffect, useState } from "react";
import { Platform, PermissionsAndroid, View, Text, ScrollView, ActivityIndicator } from "react-native";
import { BleManager, Device, Characteristic } from "react-native-ble-plx";
import { SensorDataType } from "../types/sensor-data.type";
import StatisticsComponent from "../components/statistics.component";
import TableComponent from "../components/table.component";

const SERVICE_UUID = "your-service-uuid";
const CHARACTERISTIC_UUID = "your-characteristic-uuid";
const DEVICE_NAME = "YourArduinoName";

const manager = new BleManager();

export default function DashboardScreen() {
    const [data, setData] = useState<SensorDataType[]>([]);
    const [connected, setConnected] = useState(false);

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
            if (device?.name === DEVICE_NAME) {
                manager.stopDeviceScan();
                const connectedDevice = await device.connect();
                await connectedDevice.discoverAllServicesAndCharacteristics();
                setConnected(true);
                listenToCharacteristic(connectedDevice);
            }
        });
    };

    const listenToCharacteristic = (device: Device) => {
        device.monitorCharacteristicForService(
            SERVICE_UUID,
            CHARACTERISTIC_UUID,
            (_, characteristic: Characteristic | null) => {
                if (characteristic?.value) {
                    const decoded = JSON.parse(atob(characteristic.value));
                    setData((prev) => {
                        if (prev.length > 20) {
                            prev.pop();
                            return [decoded, ...prev].sort((a: SensorDataType, b: SensorDataType) => a.timestamp < b.timestamp ? 1 : 0);
                        }
                        return [decoded, ...prev].sort((a: SensorDataType, b: SensorDataType) => a.timestamp < b.timestamp ? 1 : 0);
                    });
                }
            }
        );
    };

    return (
        <View style={{ flex: 1, padding: 16, backgroundColor: "white", justifyContent: "center", alignItems: "center" }}>
            {!connected ? <ActivityIndicator size="large" color="black" /> : (
                <ScrollView>
                    <StatisticsComponent data={data} />
                    <TableComponent data={data} />
                </ScrollView>
            )}
        </View>
    );
}
