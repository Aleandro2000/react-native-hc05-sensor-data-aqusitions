import React from "react";
import { SensorDataType } from "../types/sensor-data.type";
import { screenWidth } from "../utils/utils";
import { ScrollView } from "react-native";
import { LineChart } from "react-native-chart-kit";

export default function StatisticsComponent({ data }: { data: SensorDataType[] }) {
    const labels = data.map((item) =>
        new Date(item.timestamp * 1000).toLocaleTimeString().slice(0, 5)
    );

    const chartData = {
        labels,
        datasets: [
            {
                data: data.map((item) => item.temperature),
                color: () => `rgba(255, 99, 132, 1)`,
                strokeWidth: 2,
            },
            {
                data: data.map((item) => item.humidity),
                color: () => `rgba(54, 162, 235, 1)`,
                strokeWidth: 2,
            },
            {
                data: data.map((item) => item.heatIndex),
                color: () => `rgba(255, 206, 86, 1)`,
                strokeWidth: 2,
            },
        ],
        legend: ["Temperature", "Humidity", "Heat Index"],
    };

    return (
        <ScrollView horizontal>
            <LineChart
                data={chartData}
                width={screenWidth * 2}
                height={300}
                chartConfig={{
                    backgroundColor: "#fff",
                    backgroundGradientFrom: "#f5f5f5",
                    backgroundGradientTo: "#e0e0e0",
                    decimalPlaces: 1,
                    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                    style: {
                        borderRadius: 16,
                    },
                }}
                bezier
                style={{
                    marginVertical: 8,
                    borderRadius: 16,
                }}
            />
        </ScrollView>
    );
}