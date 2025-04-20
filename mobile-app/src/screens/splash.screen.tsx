import React, { useEffect, useRef } from "react";
import { Animated, Text, View } from "react-native";
import LogoSvg from "../../svgs/logo-svg";

export default function SplashScreen() {
    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
        }).start();
    }, [fadeAnim]);

    return (
        <View style={{ flex: 1, backgroundColor: "white", justifyContent: "center", alignItems: "center" }}>
            <Animated.View style={{ opacity: fadeAnim }}>
                <LogoSvg width={300} height={300} />
            </Animated.View>
        </View>
    );
}
