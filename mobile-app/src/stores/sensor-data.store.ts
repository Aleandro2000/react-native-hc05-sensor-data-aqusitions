import { create } from "zustand";
import { SensorDataType } from "../types/sensor-data.type";

type State = {
    sensorData: SensorDataType | SensorDataType[],
};

type Action = {
    setSensorData: (gpsData: SensorDataType | SensorDataType[]) => void;
};

const useSensorDataStore = create<State & Action>((set) => ({
    sensorData: [],
    setSensorData: (sensorData: SensorDataType | SensorDataType[]) => set({ sensorData }),
}));

export default useSensorDataStore;