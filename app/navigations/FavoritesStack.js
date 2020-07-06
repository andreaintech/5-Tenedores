import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import Favorites from "../screens/Favorites";
// import AddRestaurant from "../screens/AddRestaurant";

const Stack = createStackNavigator();

export default function FavoritesStack() {
    return (
        <Stack.Navigator>
            <Stack.Screen 
                name="favorites"
                component={Favorites}
                options={{ 
                    title: "Restaurantes Favoritos",
                    headerTintColor: '#FFFFFF',
                    headerStyle: {
                        backgroundColor: '#00a680',
                    },
                }}
            />
        </Stack.Navigator>
    );
}