import { Stack } from 'expo-router';
import { View, Text } from 'react-native';
import { useMigrations } from 'drizzle-orm/expo-sqlite/migrator';
import { db } from '../db/client';
import migrations from '../drizzle/migrations';
import { AuthProvider, useAuth } from '../context/AuthContext';

function RootNav() {
  const { session, loading } = useAuth();
  const { success, error } = useMigrations(db, migrations);

  if (loading || (!success && !error)) {
    return <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}><Text>Cargando...</Text></View>;
  }
  if (error) {
    return <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 }}><Text>Error de migración: {error.message}</Text></View>;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={!session}>
        <Stack.Screen name="login" />
        <Stack.Screen name="registro" />
      </Stack.Protected>
      <Stack.Protected guard={!!session}>
        <Stack.Screen name="index" />
        <Stack.Screen name="producto" options={{ headerShown: true, title: 'Producto', presentation: 'modal' }} />
      </Stack.Protected>
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootNav />
    </AuthProvider>
  );
}