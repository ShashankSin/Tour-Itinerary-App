import React from 'react'
import { createStackNavigator } from '@react-navigation/stack'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { Ionicons } from '@expo/vector-icons'

// Auth Screens
import LoginScreen from '../screens/auth/LoginScreen'
import SignupScreen from '../screens/auth/SignupScreen'
import UserTypeScreen from '../screens/auth/UserTypeScreen'
import AdminLoginScreen from '../screens/auth/AdminLoginScreen'
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen'
import VerifyOtpScreen from '../screens/auth/VerifyOtpScreen'

// User Screens
import HomeScreen from '../screens/user/HomeScreen'
import ExploreScreen from '../screens/user/ExploreScreen'
import WishlistScreen from '../screens/user/WishlistScreen'
import ProfileScreen from '../screens/user/ProfileScreen'
import ItineraryDetailScreen from '../screens/user/ItineraryDetailScreen'
import BookingScreen from '../screens/user/BookingScreen'
import PaymentScreen from '../screens/user/PaymentScreen'
import BudgetPlannerScreen from '../screens/user/BudgetPlannerScreen'

// Company Screens
import CompanyDashboardScreen from '../screens/company/CompanyDashboardScreen'
import CompanyItinerariesScreen from '../screens/company/CompanyItinerariesScreen'
import CompanyBookingsScreen from '../screens/company/CompanyBookingsScreen'
import CompanyProfileScreen from '../screens/company/CompanyProfileScreen'
import CreateItineraryScreen from '../screens/company/CreateItineraryScreen'
import EditItineraryScreen from '../screens/company/EditItineraryScreen'

// Admin Screens
import AdminDashboardScreen from '../screens/admin/AdminDashboardScreen'
import AdminCompaniesScreen from '../screens/admin/AdminCompaniesScreen'
import AdminUsersScreen from '../screens/admin/AdminUsersScreen'
import AdminItinerariesScreen from '../screens/admin/AdminItinerariesScreen'

const Stack = createStackNavigator()
const Tab = createBottomTabNavigator()

// USER BOTTOM TABS
const UserBottomTabs = ({ authState }) => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      headerShown: false,
      tabBarIcon: ({ focused, color, size }) => {
        const icons = {
          Home: focused ? 'home' : 'home-outline',
          Explore: focused ? 'search' : 'search-outline',
          Wishlist: focused ? 'heart' : 'heart-outline',
          Profile: focused ? 'person' : 'person-outline',
        }
        return <Ionicons name={icons[route.name]} size={size} color={color} />
      },
      tabBarActiveTintColor: '#10b981',
      tabBarInactiveTintColor: 'gray',
    })}
  >
    <Tab.Screen name="Home">
      {(props) => <HomeScreen {...props} authState={authState} />}
    </Tab.Screen>
    <Tab.Screen name="Explore">
      {(props) => <ExploreScreen {...props} authState={authState} />}
    </Tab.Screen>
    <Tab.Screen name="Wishlist">
      {(props) => <WishlistScreen {...props} authState={authState} />}
    </Tab.Screen>
    <Tab.Screen name="Profile">
      {(props) => <ProfileScreen {...props} authState={authState} />}
    </Tab.Screen>
  </Tab.Navigator>
)

// COMPANY BOTTOM TABS
const CompanyBottomTabs = ({ authState, setUser }) => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      headerShown: false,
      tabBarIcon: ({ focused, color, size }) => {
        const icons = {
          Dashboard: focused ? 'speedometer' : 'speedometer-outline',
          Itineraries: focused ? 'reader' : 'reader-outline',
          Bookings: focused ? 'clipboard' : 'clipboard-outline',
          Profile: focused ? 'person' : 'person-outline',
        }
        return <Ionicons name={icons[route.name]} size={size} color={color} />
      },
      tabBarActiveTintColor: '#10b981',
      tabBarInactiveTintColor: 'gray',
    })}
  >
    <Tab.Screen name="Dashboard">
      {(props) => <CompanyDashboardScreen {...props} authState={authState} />}
    </Tab.Screen>
    <Tab.Screen name="Itineraries">
      {(props) => <CompanyItinerariesScreen {...props} authState={authState} />}
    </Tab.Screen>
    <Tab.Screen name="Bookings">
      {(props) => <CompanyBookingsScreen {...props} authState={authState} />}
    </Tab.Screen>
    <Tab.Screen name="Profile">
      {(props) => (
        <CompanyProfileScreen
          {...props}
          authState={authState}
          setUser={setUser} // 🔥 This fixes your logout
        />
      )}
    </Tab.Screen>
  </Tab.Navigator>
)

// ADMIN BOTTOM TABS
const AdminBottomTabs = ({ authState }) => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      headerShown: false,
      tabBarIcon: ({ focused, color, size }) => {
        const icons = {
          Dashboard: focused ? 'grid' : 'grid-outline',
          Companies: focused ? 'business' : 'business-outline',
          Users: focused ? 'people' : 'people-outline',
          Itineraries: focused ? 'map' : 'map-outline',
        }
        return <Ionicons name={icons[route.name]} size={size} color={color} />
      },
      tabBarActiveTintColor: '#10b981',
      tabBarInactiveTintColor: 'gray',
    })}
  >
    <Tab.Screen name="Dashboard">
      {(props) => <AdminDashboardScreen {...props} authState={authState} />}
    </Tab.Screen>
    <Tab.Screen name="Companies">
      {(props) => <AdminCompaniesScreen {...props} authState={authState} />}
    </Tab.Screen>
    <Tab.Screen name="Users">
      {(props) => <AdminUsersScreen {...props} authState={authState} />}
    </Tab.Screen>
    <Tab.Screen name="Itineraries">
      {(props) => <AdminItinerariesScreen {...props} authState={authState} />}
    </Tab.Screen>
  </Tab.Navigator>
)

// MAIN APP NAVIGATOR
const AppNavigator = ({ authState, setUser }) => {
  const { user } = authState || {}

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: '#f9fafb' },
      }}
    >
      {!user ? (
        <>
          <Stack.Screen name="UserType">
            {(props) => <UserTypeScreen {...props} setUser={setUser} />}
          </Stack.Screen>
          <Stack.Screen name="Login">
            {(props) => <LoginScreen {...props} setUser={setUser} />}
          </Stack.Screen>
          <Stack.Screen name="Signup">
            {(props) => <SignupScreen {...props} setUser={setUser} />}
          </Stack.Screen>
          <Stack.Screen name="VerifyOtp" component={VerifyOtpScreen} />
          <Stack.Screen name="AdminLogin">
            {(props) => <AdminLoginScreen {...props} setUser={setUser} />}
          </Stack.Screen>
          <Stack.Screen
            name="ForgotPassword"
            component={ForgotPasswordScreen}
          />
        </>
      ) : user?.role === 'admin' ? (
        <Stack.Screen name="AdminTabs">
          {(props) => <AdminBottomTabs {...props} authState={authState} />}
        </Stack.Screen>
      ) : user?.role === 'company' ? (
        <>
          <Stack.Screen name="CompanyTabs">
            {(props) => (
              <CompanyBottomTabs
                {...props}
                authState={authState}
                setUser={setUser}
              />
            )}
          </Stack.Screen>

          <Stack.Screen
            name="CreateItinerary"
            component={CreateItineraryScreen}
          />
          <Stack.Screen name="EditItinerary" component={EditItineraryScreen} />
        </>
      ) : (
        <>
          <Stack.Screen name="UserTabs">
            {(props) => <UserBottomTabs {...props} authState={authState} />}
          </Stack.Screen>
          <Stack.Screen
            name="ItineraryDetail"
            component={ItineraryDetailScreen}
          />
          <Stack.Screen name="Booking" component={BookingScreen} />
          <Stack.Screen name="Payment" component={PaymentScreen} />
          <Stack.Screen name="BudgetPlanner" component={BudgetPlannerScreen} />
        </>
      )}
    </Stack.Navigator>
  )
}

export default AppNavigator
