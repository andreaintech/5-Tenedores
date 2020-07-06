import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import Search from "../screens/Search";
// import AddRestaurant from "../screens/AddRestaurant";

const Stack = createStackNavigator();

export default function SearchStack() {
    return (
        <Stack.Navigator>
            <Stack.Screen 
                name="search"
                component={Search}
                options={{ 
                    title: "Buscador",
                    headerTintColor: '#FFFFFF',
                    headerStyle: {
                        backgroundColor: '#00a680',
                    },
                }}
            />
        </Stack.Navigator>
    );
}