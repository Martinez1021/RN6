// App Navigator
// Handles navigation flow based on authentication state

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useAuth } from '../context/AuthContext';
import LoginScreen from '../screens/LoginScreen';
import HomeScreen from '../screens/HomeScreen';
import HistoryScreen from '../screens/HistoryScreen';
import { colors } from '../styles/theme';

const Stack = createNativeStackNavigator();

// Auth Stack (unauthenticated)
function AuthStack() {
    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false,
            }}
        >
            <Stack.Screen name="Login" component={LoginScreen} />
        </Stack.Navigator>
    );
}

// Main Stack (authenticated)
function MainStack() {
    return (
        <Stack.Navigator
            screenOptions={{
                headerStyle: {
                    backgroundColor: colors.surface,
                },
                headerTintColor: colors.text,
                headerTitleStyle: {
                    fontWeight: '600',
                },
                headerShadowVisible: false,
            }}
        >
            <Stack.Screen
                name="Home"
                component={HomeScreen}
                options={{
                    title: 'Control de Asistencia',
                    headerShown: false,
                }}
            />
            <Stack.Screen
                name="History"
                component={HistoryScreen}
                options={{
                    title: 'Historial de Fichajes',
                    headerBackTitle: 'Atrás',
                }}
            />
        </Stack.Navigator>
    );
}

// Loading Screen
function LoadingScreen() {
    return (
        <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
        </View>
    );
}

// Main Navigator
export default function AppNavigator() {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
        return <LoadingScreen />;
    }

    return (
        <NavigationContainer>
            {isAuthenticated ? <MainStack /> : <AuthStack />}
        </NavigationContainer>
    );
}

const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.background,
    },
});
