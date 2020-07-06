import React from "react";
import { StyleSheet, Text, View, FlatList, ActivityIndicator, TouchableOpacity } from "react-native";
import { Image } from "react-native-elements";
import { size } from "lodash";
import { useNavigation } from "@react-navigation/native";

export default ListRestaurants = (props) => {
    const { restaurants, handleLoadMore, isLoading } = props;
    const navigation = useNavigation();     // Solo se ejecuta una unica vez

    return (
        <View>
            { size(restaurants) > 0 ? (
                <FlatList
                    data={restaurants}
                    renderItem={(restaurant) => <Restaurant restaurant={restaurant} navigation={navigation}/>}
                    keyExtractor={(item, index) => index.toString()}
                    onEndReachedThreshold={0.5}
                    onEndReached={handleLoadMore}
                    ListFooterComponent={<FooterList isLoading={isLoading}/>}
                />
            ) : (
                <View style={styles.loaderRestaurants}>
                    <ActivityIndicator 
                        size="large"
                    />
                    <Text>Cargando Restaurantes</Text>
                </View>
            ) }
        </View>
    )
}

function Restaurant(props) {
    const { restaurant, navigation } = props;
    const { images, name, description, address, id } = restaurant.item;
    const imagesRestaurant = images[0];

    const goRestaurant = () => {
        navigation.navigate("restaurant", {
            id, // es lo mismo a id: id
            name,
        })
    }

    return(
        <TouchableOpacity onPress={goRestaurant}>
            <View style={styles.viewRestaurant}>
                <View style={styles.viewRestaurantImage}>
                    <Image 
                        resizeMode="cover"
                        PlaceholderContent={<ActivityIndicator color="fff" />}
                        source={
                            imagesRestaurant ? { uri: imagesRestaurant } : require("../../../assets/img/no-image.png")
                        }
                        style={styles.imageRestaurant}
                    />
                </View>
                <View>
                    <Text style={styles.restaurantName}>{name}</Text>
                    <Text style={styles.restaurantAddress}>{address}</Text>
                    <Text style={styles.restaurantDescription}>{description.substr(0, 60)}...</Text>
                </View>
            </View>
        </TouchableOpacity>
    )
}

function FooterList(props) {
    const { isLoading } = props;

    if(isLoading) {
        return (
            <View style={styles.loaderRestaurants}>
                <ActivityIndicator size="large"/>
            </View>
        )
    } else {
        return (
            <View style={styles.notFoundRestaurants}>
                {/* <Text>No quedan restaurantes por cargar</Text> */}
                <Text>___</Text>
            </View>
        )
    }
}

const styles = StyleSheet.create({
    loaderRestaurants: {
        marginTop: 10,
        marginBottom: 10,
        alignItems: "center"
    },
    viewRestaurant: {
        flexDirection: "row",
        margin: 10
    },
    viewRestaurantImage: {
        marginRight: 15,
    },
    imageRestaurant: {
        width: 80,
        height: 80
    },
    restaurantName: {
        fontWeight: "bold"
    },
    restaurantAddress: {
        paddingTop: 2,
        color: "grey"
    },
    restaurantDescription: {
        paddingTop: 2,
        color: "grey",
        width: 300
    }, 
    notFoundRestaurants: {
        marginTop: 10,
        marginBottom: 20,
        alignItems: "center"
    }
});