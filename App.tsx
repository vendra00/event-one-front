import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { AuthProvider, useAuth } from "./src/auth/AuthContext";
import LoginScreen from "./src/screens/LoginScreen";
import RegisterScreen from "./src/screens/RegisterScreen";
import OfferingsSearchScreen from "./src/screens/Consumer/OfferingsSearchScreen";
import RequestsScreen from "./src/screens/Provider/RequestsScreen";
import { View, Text, Button } from "react-native";

const Stack = createNativeStackNavigator();

function ConsumerHome() {
    const { me, signOut } = useAuth();
    return (
        <View style={{ flex:1 }}>
            <View style={{ padding: 12, flexDirection: "row", justifyContent: "space-between" }}>
                <Text>Hi {me?.email}</Text><Button title="Sign out" onPress={signOut} />
            </View>
            <OfferingsSearchScreen />
        </View>
    );
}

function ProviderHome() {
    const { me, signOut } = useAuth();
    return (
        <View style={{ flex:1 }}>
            <View style={{ padding: 12, flexDirection: "row", justifyContent: "space-between" }}>
                <Text>Hi {me?.email}</Text><Button title="Sign out" onPress={signOut} />
            </View>
            <RequestsScreen />
        </View>
    );
}

function Router() {
    const { token, me, loading } = useAuth();
    if (loading) return <View style={{ flex:1, alignItems:"center", justifyContent:"center" }}><Text>Loading…</Text></View>;
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
            <Stack.Screen name="Home" component={isProvider ? ProviderHome : ConsumerHome} options={{ headerShown:false }} />
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
