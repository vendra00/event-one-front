import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { AuthProvider, useAuth } from "./src/auth/AuthContext";
import LoginScreen from "./src/screens/LoginScreen";
import RegisterScreen from "./src/screens/RegisterScreen";
import OfferingsSearchScreen from "./src/screens/Consumer/OfferingsSearchScreen";
import RequestsScreen from "./src/screens/Provider/RequestsScreen";
import ConsumerDashboardScreen from "./src/screens/Consumer/ConsumerDashboardScreen";
import CreateEventRequestScreen from "./src/screens/Consumer/CreateEventRequestScreen";
import MyRequestsScreen from "./src/screens/Consumer/MyRequestsScreen";

import { View, Text } from "react-native";

const Stack = createNativeStackNavigator();

function Router() {
    const { token, me, loading } = useAuth();
    if (loading) {
        return <View style={{ flex:1, alignItems:"center", justifyContent:"center" }}><Text>Loading…</Text></View>;
    }
    if (!token || !me) {
        return (
            <Stack.Navigator>
                <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown:false }} />
                <Stack.Screen name="Register" component={RegisterScreen} options={{ title:"Create account" }} />
            </Stack.Navigator>
        );
    }

    const isProvider = me.roles.includes("PROVIDER");

    return (
        <Stack.Navigator>
            {isProvider ? (
                <>
                    <Stack.Screen name="ProviderHome" component={RequestsScreen} options={{ title: "Requests" }} />
                    {/* add provider routes over time */}
                </>
            ) : (
                <>
                    <Stack.Screen name="ConsumerDashboard" component={ConsumerDashboardScreen} options={{ headerShown: false }} />
                    <Stack.Screen name="ConsumerSearch" component={OfferingsSearchScreen} options={{ title: "Find offerings" }} />
                    <Stack.Screen name="ConsumerCreateRequest" component={CreateEventRequestScreen} options={{ title: "Create request" }} />
                    <Stack.Screen name="ConsumerMyRequests" component={MyRequestsScreen} options={{ title: "My requests" }} />
                    {/* add consumer routes one by one later */}
                </>
            )}
        </Stack.Navigator>
    );
}

export default function App() {
    return (
        <AuthProvider>
            <NavigationContainer>
                <Router />
            </NavigationContainer>
        </AuthProvider>
    );
}
