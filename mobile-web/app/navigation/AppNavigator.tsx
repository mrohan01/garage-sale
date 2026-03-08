import React from 'react';
import { Text } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAuthStore } from '../stores/useAuthStore';

// Auth screens
import { LoginScreen } from '../screens/auth/LoginScreen';
import { RegisterScreen } from '../screens/auth/RegisterScreen';

// Home screens
import { HomeScreen } from '../screens/home/HomeScreen';
import { SaleDetailScreen } from '../screens/home/SaleDetailScreen';
import { ListingDetailScreen } from '../screens/home/ListingDetailScreen';
import { ClaimScreen } from '../screens/home/ClaimScreen';

// Map screens
import { MapScreen } from '../screens/map/MapScreen';
import { SaleDetailScreen as MapSaleDetailScreen } from '../screens/home/SaleDetailScreen';
import { ListingDetailScreen as MapListingDetailScreen } from '../screens/home/ListingDetailScreen';

// Create Sale screens
import { CreateSaleScreen } from '../screens/create/CreateSaleScreen';
import { AddListingsScreen } from '../screens/create/AddListingsScreen';

// Saved screens
import { SavedScreen } from '../screens/saved/SavedScreen';
import { ListingDetailScreen as SavedListingDetailScreen } from '../screens/home/ListingDetailScreen';

// Profile screens
import { ProfileScreen } from '../screens/profile/ProfileScreen';
import { MySalesScreen } from '../screens/profile/MySalesScreen';
import { MyTransactionsScreen } from '../screens/transactions/MyTransactionsScreen';
import { InboxScreen } from '../screens/messaging/InboxScreen';
import { ChatScreen } from '../screens/messaging/ChatScreen';
import { SettingsScreen } from '../screens/profile/SettingsScreen';

const defaultStackScreenOptions = {
  headerStyle: { backgroundColor: '#2196F3' },
  headerTintColor: '#FFFFFF',
  headerTitleStyle: { fontWeight: 'bold' as const },
};

// --- Auth Stack ---
const AuthStackNav = createNativeStackNavigator();

function AuthStack() {
  return (
    <AuthStackNav.Navigator screenOptions={defaultStackScreenOptions}>
      <AuthStackNav.Screen name="Login" component={LoginScreen} />
      <AuthStackNav.Screen name="Register" component={RegisterScreen} />
    </AuthStackNav.Navigator>
  );
}

// --- Home Stack ---
const HomeStackNav = createNativeStackNavigator();

function HomeStack() {
  return (
    <HomeStackNav.Navigator screenOptions={defaultStackScreenOptions}>
      <HomeStackNav.Screen name="Home" component={HomeScreen} />
      <HomeStackNav.Screen name="SaleDetail" component={SaleDetailScreen} options={{ title: 'Sale Details' }} />
      <HomeStackNav.Screen name="ListingDetail" component={ListingDetailScreen} options={{ title: 'Listing Details' }} />
      <HomeStackNav.Screen name="Claim" component={ClaimScreen} options={{ title: 'Claim Item' }} />
    </HomeStackNav.Navigator>
  );
}

// --- Map Stack ---
const MapStackNav = createNativeStackNavigator();

function MapStack() {
  return (
    <MapStackNav.Navigator screenOptions={defaultStackScreenOptions}>
      <MapStackNav.Screen name="Map" component={MapScreen} />
      <MapStackNav.Screen name="SaleDetail" component={MapSaleDetailScreen} options={{ title: 'Sale Details' }} />
      <MapStackNav.Screen name="ListingDetail" component={MapListingDetailScreen} options={{ title: 'Listing Details' }} />
    </MapStackNav.Navigator>
  );
}

// --- Create Sale Stack ---
const CreateStackNav = createNativeStackNavigator();

function CreateStack() {
  return (
    <CreateStackNav.Navigator screenOptions={defaultStackScreenOptions}>
      <CreateStackNav.Screen name="CreateSale" component={CreateSaleScreen} options={{ title: 'Create Sale' }} />
      <CreateStackNav.Screen name="AddListings" component={AddListingsScreen} options={{ title: 'Add Listings' }} />
    </CreateStackNav.Navigator>
  );
}

// --- Saved Stack ---
const SavedStackNav = createNativeStackNavigator();

function SavedStack() {
  return (
    <SavedStackNav.Navigator screenOptions={defaultStackScreenOptions}>
      <SavedStackNav.Screen name="Saved" component={SavedScreen} />
      <SavedStackNav.Screen name="ListingDetail" component={SavedListingDetailScreen} options={{ title: 'Listing Details' }} />
    </SavedStackNav.Navigator>
  );
}

// --- Profile Stack ---
const ProfileStackNav = createNativeStackNavigator();

function ProfileStack() {
  return (
    <ProfileStackNav.Navigator screenOptions={defaultStackScreenOptions}>
      <ProfileStackNav.Screen name="Profile" component={ProfileScreen} />
      <ProfileStackNav.Screen name="MySales" component={MySalesScreen} options={{ title: 'My Sales' }} />
      <ProfileStackNav.Screen name="MyTransactions" component={MyTransactionsScreen} options={{ title: 'My Transactions' }} />
      <ProfileStackNav.Screen name="Inbox" component={InboxScreen} />
      <ProfileStackNav.Screen name="Chat" component={ChatScreen} />
      <ProfileStackNav.Screen name="Settings" component={SettingsScreen} />
    </ProfileStackNav.Navigator>
  );
}

// --- Main Tabs ---
const Tab = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopColor: '#E0E0E0',
        },
        tabBarActiveTintColor: '#2196F3',
        tabBarInactiveTintColor: '#757575',
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeStack}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: () => <Text>🏠</Text>,
        }}
      />
      <Tab.Screen
        name="MapTab"
        component={MapStack}
        options={{
          tabBarLabel: 'Map',
          tabBarIcon: () => <Text>🗺️</Text>,
        }}
      />
      <Tab.Screen
        name="CreateTab"
        component={CreateStack}
        options={{
          tabBarLabel: 'Create',
          tabBarIcon: () => <Text>➕</Text>,
        }}
      />
      <Tab.Screen
        name="SavedTab"
        component={SavedStack}
        options={{
          tabBarLabel: 'Saved',
          tabBarIcon: () => <Text>♥</Text>,
        }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileStack}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: () => <Text>👤</Text>,
        }}
      />
    </Tab.Navigator>
  );
}

// --- Root Navigator ---
const RootStack = createNativeStackNavigator();

export function AppNavigator() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return (
    <RootStack.Navigator screenOptions={{ headerShown: false }}>
      {isAuthenticated ? (
        <RootStack.Screen name="Main" component={MainTabs} />
      ) : (
        <RootStack.Screen name="Auth" component={AuthStack} />
      )}
    </RootStack.Navigator>
  );
}
