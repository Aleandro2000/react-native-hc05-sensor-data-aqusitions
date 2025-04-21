import { create } from "zustand";
import { SensorDataType } from "../types/sensor-data.type";

type State = {
    sensorData: SensorDataType[],
};

type Action = {
    setSensorData: (gpsData: SensorDataType[]) => void;
};

const useSensorDataStore = create<State & Action>((set) => ({
    sensorData: [],
    setSensorData: (sensorData: SensorDataType[]) => set({ sensorData }),
}));

export default useSensorDataStore;