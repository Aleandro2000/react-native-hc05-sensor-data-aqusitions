import React, { useEffect, useState } from 'react';
import StackNavigator from '../navigation/stack.navigation';
import SplashScreen from './splash.screen';

export default function MainScreen() {
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setLoaded(true);
        }, 3000);
        return () => clearTimeout(timer);
    }, []);

    if (!loaded) {
        return <SplashScreen />;
    }

    return <StackNavigator />;
}