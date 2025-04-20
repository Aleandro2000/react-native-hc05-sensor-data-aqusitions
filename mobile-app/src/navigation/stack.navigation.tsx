import React from "react";
import { createStackNavigator, TransitionPresets } from "@react-navigation/stack";
import { NavigationContainer } from "@react-navigation/native";
import DashboardScreen from "../screens/dashboard.screen";
import NotificationScreen from "../screens/notification.screen";

const Stack = createStackNavigator();

export default function StackNavigation() {
    return (
        <NavigationContainer>
            <Stack.Navigator
                initialRouteName="Dashboard"
                screenOptions={{
                    headerStyle: {
                        backgroundColor: "black",
                    },
                    headerTintColor: "white",
                    headerTitle: "Environment Measure App",
                    gestureEnabled: true,
                    ...TransitionPresets.ModalPresentationIOS,
                }}>
                <Stack.Screen name="Dashboard"
                    component={DashboardScreen} />
                <Stack.Screen name="Notification"
                    component={NotificationScreen} />
            </Stack.Navigator>
        </NavigationContainer>
    );
}