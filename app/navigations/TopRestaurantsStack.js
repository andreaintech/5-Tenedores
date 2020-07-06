import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import TopRestaurants from "../screens/TopRestaurants";
// import AddRestaurant from "../screens/AddRestaurant";

const Stack = createStackNavigator();

export default function TopRestaurantsStack() {
    return (
        <Stack.Navigator>
            <Stack.Screen 
                name="top-restaurants"
                component={TopRestaurants}
                options={{ 
                    title: "TOP 5 Restaurantes",
                    headerTintColor: '#FFFFFF',
                    headerStyle: {
                        backgroundColor: '#00a680',
                    },
                }}
            />
        </Stack.Navigator>
    );
}