import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import Restaurants from "../screens/restaurants/Restaurants";
import AddRestaurant from "../screens/restaurants/AddRestaurant";
import Restaurant from "../screens/restaurants/Restaurant";
import AddReviewRestaurant from "../screens/restaurants/AddReviewRestaurant";

const Stack = createStackNavigator();

export default function RestaurantsStack() {
    return (
        <Stack.Navigator>
            <Stack.Screen 
                name="restaurants"
                component={Restaurants}
                options={{ 
                    title: "Restaurantes",
                    headerTintColor: '#FFFFFF',
                    headerStyle: {
                        backgroundColor: '#00a680',
                    }, 
                }}
            />
            <Stack.Screen 
                name="add-restaurant"
                component={AddRestaurant}
                options={{ 
                    title: "Añadir Restaurante",
                    headerTintColor: '#FFFFFF',
                    headerStyle: {
                        backgroundColor: '#00a680',
                    }, 
                }}
            />
            <Stack.Screen 
                name="restaurant"
                component={Restaurant}
            />
            <Stack.Screen 
                name="add-review-restaurant"
                component={AddReviewRestaurant}
                options={{
                    title: "Nuevo comentario",
                    headerTintColor: '#FFFFFF',
                    headerStyle: {
                        backgroundColor: '#00a680',
                    },
                }}
            />
        </Stack.Navigator>
    );
}