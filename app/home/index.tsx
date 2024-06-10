import {
    View,
    StyleSheet,
    Text,
    TouchableOpacity,
    Modal,
    ScrollView,
    Alert,
  } from "react-native";
  import React, { useContext, useEffect, useState } from "react";
  import Button from "@/components/Button";
  import { Ionicons } from "@expo/vector-icons";
  import { router } from "expo-router";
  import axios from "axios";
  import MapView, { Polyline, Marker, PROVIDER_GOOGLE } from "react-native-maps";
  import polyline from "@mapbox/polyline";
  import getDistance from "geolib/es/getPreciseDistance";
  import { GlobalContext } from "@/Context/GlobalStates";
  import { API_URLS } from "@/API/urls";
  
  export default function Index() {
    const { userStatus, userId } = useContext(GlobalContext);
    const [orderModalVisible, setOrderModalVisible] = useState(false);
  
    const [orders, setOrders] = useState<Order[]>([]);
    const [couriers, setCouriers] = useState<Courier[]>([]);
    const [courierModalVisible, setCourierModalVisible] = useState(false);
    const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
    const [assignedOrders, setAssignedOrders] = useState<Assigned[]>([]);
    const [assignedModalVisible, setAssignedModalVisible] = useState(false);
    const [courierLocation, setCourierLocation] = useState<Location | null>(null);
    const [users, setUsers] = useState<User[]>([]);
    const [routes, setRoutes] = useState<any[]>([]);
    const [closestRoute, setClosestRoute] = useState<{
      user: User;
      route: any;
    } | null>(null);
    const [isTracking, setIsTracking] = useState(false);
    type Order = {
      orderId: number;
      orderDetail: string;
      status: number;
    };
    type Courier = {
      courierId: string;
      courierName: string;
    };
    type Assigned = {
      orderId: number;
      orderDetail: string;
    };
    type Location = {
      latitude: number;
      longitude: number;
    };
    type Step = {
      polyline: {
        points: string;
      };
    };
  
    type User = {
      location: {
        coordinates: {
          latitude: string;
          longitude: string;
        };
      };
      name: {
        first: string;
      };
    };
      
  
    const getCourierLocation = async () => {
      if(userStatus ===2){
        const response = await axios.get("http://api.ipify.org?format=json");
        const ip = response.data.ip;
        const locationResponse = await axios.get(`http://ip-api.com/json/${ip}`);
        setCourierLocation({
          latitude: locationResponse.data.lat,
          longitude: locationResponse.data.lon,
        });
      }
     
    };
    const getUsers = async () => {
  
      if(userStatus ===2){
        setUsers([]);
        const response = await axios.get(
          "https://randomuser.me/api/?nat=tr&results=10"
        );
        
        setUsers(response.data.results);
  
      }
     
    };
    
    useEffect(() => {
      getCourierLocation();
      getUsers();
      console.log(userStatus);
    }, []);
    useEffect(() => {
      if (courierLocation && users.length > 0 && routes.length === 0) {
        let minDistance = Infinity;
        let closestUserAndRoute: { user: User; route: any } | null = null;
  
        const promises = users.map(async (user) => {
          const userLocation = {
            latitude: parseFloat(user.location.coordinates.latitude),
            longitude: parseFloat(user.location.coordinates.longitude),
          };
  
          const distance = getDistance(courierLocation, userLocation);
  
          const route = await getRoute(courierLocation, userLocation);
          const newRoute = { user, route };
  
          setRoutes((prevRoutes) => [...prevRoutes, newRoute]);
  
          if (distance < minDistance) {
            minDistance = distance;
            closestUserAndRoute = newRoute;
          }
        });
  
        Promise.all(promises).then(() => {
          setClosestRoute(closestUserAndRoute);
  
          if (closestUserAndRoute && closestUserAndRoute.route.length > 0) {
  
            setCourierLocation(closestUserAndRoute.route[0]);
          }
        });
      }
    }, [courierLocation, users,routes]);
    
    
  
    useEffect(() => {
      let interval: number | null = null;
      if (isTracking) {
        interval = window.setInterval(() => {
          if (closestRoute && closestRoute.route.length > 0) {
            const nextCoordinate = closestRoute.route[0];
            setCourierLocation(nextCoordinate);
            setClosestRoute({
              ...closestRoute,
              route: closestRoute.route.slice(1),
            });
          }
        }, 10000); 
      }
      return () => {
        if (interval !== null) window.clearInterval(interval);
      };
    }, [isTracking, closestRoute]);
  
    const startTracking = () => {
      setIsTracking(true);
    };
  
  
    const getRoute = async (startLoc: Location, destinationLoc: Location) => {
      if(userStatus ===2){
        console.log("start", startLoc);
        console.log("bitiş", destinationLoc);
        try {
          const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${startLoc.latitude},${startLoc.longitude}&destination=${destinationLoc.latitude},${destinationLoc.longitude}&key=${process.env.GOOGLE_API_KEY}`;
          const response = await axios.get(url);
          const data = response.data;
          console.log("veri", data);
    
          if (data.status !== "OK") {
            console.log("İki konum arası yol çizilemiyor!!.");
            return [];
          }
    
          let coords: { latitude: number; longitude: number }[] = [];
    
          data.routes[0].legs[0].steps.forEach((step: Step) => {
            const points = polyline.decode(step.polyline.points);
            const stepCoords = points.map((point) => {
              return {
                latitude: point[0],
                longitude: point[1],
              };
            });
            coords = coords.concat(stepCoords);
          });
          return coords;
        } catch (error) {
          console.log("Error", error);
        }
      }
     
    };
  
    const fetchPendingOrders = async () => {
      if(userStatus === 1){
        try {
          const response = await axios.get(API_URLS.GET_ORDERS);
          if (response.status === 200 && response.data.orders) {
            console.log(response.data.orders);
            setOrders(response.data.orders);
            setOrderModalVisible(!orderModalVisible);
          } else {
            console.log("Bir hata oluştu");
            Alert.alert("Uyarı", "Bekleyen sipariş yok!.", [
              {
                text: "Tamam",
                style: "cancel",
              },
            ]);
            setOrders([]);
          }
        } catch (error) {
          console.error("Bir hata oluştu: ", error);
          setOrders([]);
        }
      }
     
    };
  
    const fetchCourier = async () => {
      if(userStatus === 1){
        try {
          const response = await axios.get(API_URLS.GET_COURIERS_STATUS_2);
          if (response.status === 200) {
            console.log(response.data.couriers);
            setCouriers(response.data.couriers);
            setCourierModalVisible(!courierModalVisible);
          } else {
            console.log("Bir hata oluştu");
            setOrders([]);
          }
        } catch (error) {
          console.log("Error", error);
          setCouriers([]);
        }
      }
     
    };
    const assignOrderToCourier = async (courierId: string) => {
      if(userStatus === 1){
  
      } console.log(courierId);
      console.log("sipariş id", selectedOrderId);
      const response = await axios.post(API_URLS.ASSIGN_ORDER, {
        orderId: selectedOrderId,
        courierId: courierId,
      });
      if (response.status === 200) {
        Alert.alert("Bilgi", "Kurye başarıyla seçildi", [
          { text: "Tamam", style: "cancel" },
        ]);
        setOrderModalVisible(false);
        setCourierModalVisible(false);
        fetchPendingOrders();
      } else {
        console.log("Bir hata oluştu, sipariş atanamadı");
      }
     
    };
    const fetchAssignedOrders = async () => {
      if(userStatus === 2){
        console.log(userId);
        try {
          const response = await axios.get(
            `${API_URLS.GET_COURIER_ORDERS}/${userId}`
          );
          console.log(response.data);
          if (response.status === 200) {
            setAssignedOrders(response.data.orders);
            setAssignedModalVisible(!assignedModalVisible);
    
            if (response.data.orders.length === 0) {
              Alert.alert("Bilgi", "Atanan sipariş kalmadı!", [
                {
                  text: "Tamam",
                  onPress: () => setAssignedModalVisible(false),
                  style: "cancel",
                },
              ]);
            }
          }
        } catch (error) {
          console.log("Error", error);
          Alert.alert("Hata", "Siparişler yüklenirken bir sorun oluştu.", [
            { text: "Tamam", style: "cancel" },
          ]);
        }
      }
     
    };
  
    const updateOrderStatus = async (orderId: number, newStatus: number) => {
      if(userStatus ===2){
        try {
          const response = await axios.put(`${API_URLS.UPDATE_ORDER_STATUS}`, {
            orderId,
            status: newStatus,
          });
          if (response.status === 200) {
            fetchAssignedOrders();
          }
        } catch (error) {
          console.log("Error", error);
        }
      }
      
    };
  
    const renderContent = () => {
      switch (userStatus) {
        case 1:
          return (
            <View>
              <View style={styles.adminLoginContainer}>
                <Text style={styles.adminLoginTitle}>Admin</Text>
              </View>
              <View style={styles.chooseProcessContainer}>
                <TouchableOpacity
                  style={styles.process}
                  onPress={fetchPendingOrders}
                >
                  <Text>Bekleyen Siparişler</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.process}>
                  <Text>Bugün Teslim Edilenler</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.process}>
                  <Text>Bugün İptal Edilenler</Text>
                </TouchableOpacity>
              </View>
             
              <Modal
                animationType="slide"
                transparent={true}
                visible={orderModalVisible}
                onRequestClose={() => setOrderModalVisible(!orderModalVisible)}
              >
                <View style={styles.ordersModalContainer}>
                  <ScrollView style={styles.orders}>
                    {orders.map((order, index) => (
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          borderRadius: 15,
                          borderWidth: 1,
                          padding: 15,
                          justifyContent: "space-between",
                          marginHorizontal: 32,
                          marginTop:15
                        }}
                      >
                        <View key={index} style={styles.modalItems}>
                          <Text>Sipariş ID : {order.orderId}</Text>
                          <Text>Detay: {order.orderDetail}</Text>
                        </View>
                        <View>
                          <Button
                            text="Kurye Ata"
                            backgroundColor="#FFFFFF"
                            borderWidth={1}
                            borderRadius={15}
                            padding={10}
                            onPress={() => {
                              setSelectedOrderId(order.orderId);
                              fetchCourier();
                            }}
                          />
                        </View>
                      </View>
                    ))}
                  </ScrollView>
                  <TouchableOpacity
                    style={styles.closeButton}
                    onPress={() => setOrderModalVisible(!orderModalVisible)}
                  >
                    <Text style={styles.closeButtonText}>KAPAT</Text>
                  </TouchableOpacity>
                </View>
              </Modal>
              <Modal
                animationType="slide"
                transparent={true}
                visible={courierModalVisible}
                onRequestClose={() =>
                  setCourierModalVisible(!courierModalVisible)
                }
              >
                <View style={styles.ordersModalContainer}>
                  <ScrollView style={styles.orders}>
                    {couriers.map((courier, index) => (
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          justifyContent: "space-between",
                          marginHorizontal: 32,
                          borderWidth: 1,
                          borderRadius: 15,
                          padding: 15,
                        }}
                      >
                        <View key={index} style={styles.modalItems}>
                       
                          <Text>İsim: {courier.courierName}</Text>
                        </View>
                        <View>
                          <Button
                            text="Kurye Seç"
                            backgroundColor="#FFFFFF"
                            borderRadius={15}
                            borderWidth={1}
                            padding={10}
                            onPress={() =>
                              assignOrderToCourier(courier.courierId)
                            }
                          />
                        </View>
                      </View>
                    ))}
                  </ScrollView>
                  <TouchableOpacity
                    style={styles.closeButton}
                    onPress={() => setCourierModalVisible(!courierModalVisible)}
                  >
                    <Text style={styles.closeButtonText}>KAPAT</Text>
                  </TouchableOpacity>
                </View>
              </Modal>
            </View>
          );
        case 2:
          return (
            <View style={{ flex: 1 }}>
              {courierLocation && (
                <MapView
                  style={styles.map}
                  showsMyLocationButton
                  provider={PROVIDER_GOOGLE} // ios ve android için gerekli
                  initialRegion={{
                    latitude: courierLocation.latitude,
                    longitude: courierLocation.longitude,
                    latitudeDelta: 1,
                    longitudeDelta: 1,
                  }}
                >
                  <Marker
                    coordinate={courierLocation} // konumumuz deniz üstünde oldugu için en yakın karadan başlayacak şekilde konumlandırdım
                    title="Kuryeniz"
                    pinColor="blue"
                  />
  
                  {routes &&
                    routes.map((route, index) => {
                      const userLocation = {
                        latitude: parseFloat(
                          route.user.location.coordinates.latitude
                        ),
                        longitude: parseFloat(
                          route.user.location.coordinates.longitude
                        ),
                      };
                      return (
                        <>
                          <Marker
                            key={index}
                            coordinate={userLocation}
                            title={route.user.name.first}
                            pinColor="red"
                          />
                          <Polyline
                            coordinates={route.route}
                            strokeColor={route === closestRoute ? "red" : "black"}  // Konumlar random geldiği için bazıları erişilemez oluyor dolayısıyla o konum için herhangi bir çizim yapmıyor bazen hiçbiri erişilemez oluyor
                            strokeWidth={2}
                          />
                        </>
                      );
                    })}
                </MapView>
              )}
              <View style={styles.courierButtons}>
                <Button
                  text="Canlı konum"
                  onPress={startTracking}
                  backgroundColor="#FFFFFF"
                  borderWidth={1}
                  borderRadius={15}
                  color="black"
                  padding={15}
                  flex={1}
                />
                <Button
                  text="Gelen siparişler"
                  backgroundColor="#FFFFFF"
                  borderWidth={1}
                  borderRadius={15}
                  color="black"
                  padding={15}
                  flex={1}
                  onPress={() => fetchAssignedOrders()}
                />
              </View>
              <Modal
                animationType="slide"
                transparent={true}
                visible={assignedModalVisible}
                onRequestClose={() =>
                  setAssignedModalVisible(!assignedModalVisible)
                }
              >
                <View style={styles.ordersModalContainer}>
                  <ScrollView style={styles.orders}>
                    {assignedOrders.map((assigned, index) => (
                      <View>
                        <View key={index} style={styles.modalItems}>
                          <View
                            style={{
                              flexDirection: "row",
                              alignItems: "center",
                              borderRadius: 15,
                              borderWidth: 1,
                              padding: 15,
                              justifyContent: "space-between",
                              marginHorizontal: 32,
                            }}
                          >
                            <View>
                              <Text>Sipariş ID : {assigned.orderId}</Text>
                              <Text>Sipariş Detayı: {assigned.orderDetail}</Text>
                            </View>
                            <View style={{ flexDirection: "row", gap: 8 }}>
                              <TouchableOpacity
                                onPress={() =>
                                  updateOrderStatus(assigned.orderId, 0)
                                }
                              >
                                <Ionicons
                                  name="close-circle"
                                  size={32}
                                  color={"red"}
                                />
                              </TouchableOpacity>
                              <TouchableOpacity
                                onPress={() =>
                                  updateOrderStatus(assigned.orderId, 2)
                                }
                              >
                                <Ionicons
                                  name="checkmark-circle"
                                  size={32}
                                  color={"green"}
                                />
                              </TouchableOpacity>
                            </View>
                          </View>
                        </View>
                      </View>
                    ))}
                  </ScrollView>
                  <TouchableOpacity
                    style={styles.closeButton}
                    onPress={() => setAssignedModalVisible(!assignedModalVisible)}
                  >
                    <Text style={styles.closeButtonText}>KAPAT</Text>
                  </TouchableOpacity>
                </View>
              </Modal>
            </View>
          );
        default:
          return <Text>Hoşgeldiniz... {userStatus}</Text>;
      }
    };
  
  
   
  
  
  
    
  
   
  
    return <View style={styles.container}>{renderContent()}</View>;
  }
  
  const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    map: {
      flex: 1,
    },
    adminLoginContainer: {
      margin: 60,
    },
    adminLoginTitle: {
      fontSize: 32,
      fontWeight: "600",
    },
    chooseProcessContainer: {
      flexDirection: "column",
      gap: 10,
      marginHorizontal: 15,
    },
    process: {
      borderWidth: 1,
      borderRadius: 15,
      padding: 10,
    },
    ordersModalContainer: {
      backgroundColor: "#FFFFFF",
      flex: 1,
    },
    orders: {
      flexDirection: "column",
      marginTop: 10,
    },
    modalItems: {
      flexDirection: "column",
    },
    courierButtons: {
      flexDirection: "row",
    },
    closeButton: {
      alignItems: "center",
      marginBottom: 10,
    },
    closeButtonText: {
      fontSize: 24,
    },
  });
  