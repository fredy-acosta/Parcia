import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import { useProducts } from '../hooks/useProducts';
import { deleteProduct } from '../db/repositories/products';
import { syncProducts } from '../services/sync';

export default function PrincipalScreen() {
  const { session, signOut } = useAuth();
  const productos = useProducts();
  const [sincronizando, setSincronizando] = useState(false);
  const [mensaje, setMensaje] = useState('');

  const totalUnidades = productos.reduce((acc, p) => acc + p.quantity, 0);
  const valorTotal = productos.reduce((acc, p) => acc + p.quantity * p.price, 0);
  const esPendiente = (p: any) => !p.syncedAt || p.syncedAt.getTime() < p.updatedAt.getTime();
  const pendientes = productos.filter(esPendiente).length;

  async function handleSincronizar() {
    if (!session) return;
    setSincronizando(true);
    setMensaje('');
    try {
      const { subidos, bajados } = await syncProducts(session.user.id);
      setMensaje(`${subidos} subidos, ${bajados} bajados`);
    } catch (e: any) {
      setMensaje(`Error: ${e.message}`);
    } finally {
      setSincronizando(false);
    }
  }

  function handleEliminar(id: number) {
    Alert.alert('Eliminar producto', '¿Seguro que deseas eliminarlo?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive', onPress: () => deleteProduct(id) },
    ]);
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.titulo}>Mi Tienda</Text>
        <TouchableOpacity onPress={signOut}><Text style={styles.link}>Cerrar sesión</Text></TouchableOpacity>
      </View>

      <View style={styles.resumen}>
        <Text>Unidades: {totalUnidades}</Text>
        <Text>Valor total: ${valorTotal.toLocaleString('es-CO')}</Text>
        <Text>Pendientes de subir: {pendientes}</Text>
      </View>

      <TouchableOpacity style={styles.botonSync} onPress={handleSincronizar} disabled={sincronizando}>
        <Text style={styles.botonTexto}>{sincronizando ? 'Sincronizando...' : 'Sincronizar'}</Text>
      </TouchableOpacity>
      {!!mensaje && <Text style={styles.mensaje}>{mensaje}</Text>}

      <FlatList
        data={productos}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.item} onPress={() => router.push(`/producto?id=${item.id}`)} onLongPress={() => handleEliminar(item.id)}>
            <View>
              <Text style={styles.itemNombre}>{item.name}</Text>
              <Text>{item.quantity} u. · ${item.price.toLocaleString('es-CO')}</Text>
            </View>
            <Text style={esPendiente(item) ? styles.badgePendiente : styles.badgeSync}>
              {esPendiente(item) ? '○ Pendiente' : '✓ Nube'}
            </Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 20 }}>No hay productos aún.</Text>}
      />

      <TouchableOpacity style={styles.fab} onPress={() => router.push('/producto')}>
        <Text style={styles.fabTexto}>+ Agregar</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 16, paddingTop: 50 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  titulo: { fontSize: 24, fontWeight: '700' },
  link: { color: '#2563EB' },
  resumen: { backgroundColor: '#F1F5F9', borderRadius: 8, padding: 12, marginBottom: 12, gap: 4 },
  botonSync: { backgroundColor: '#16A34A', padding: 12, borderRadius: 8, alignItems: 'center', marginBottom: 8 },
  botonTexto: { color: '#fff', fontWeight: '700' },
  mensaje: { textAlign: 'center', marginBottom: 8, color: '#555' },
  item: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 12, borderBottomWidth: 1, borderColor: '#eee' },
  itemNombre: { fontWeight: '600' },
  badgePendiente: { color: '#D97706', fontSize: 12 },
  badgeSync: { color: '#16A34A', fontSize: 12 },
  fab: { position: 'absolute', bottom: 24, right: 16, backgroundColor: '#2563EB', paddingHorizontal: 20, paddingVertical: 14, borderRadius: 30 },
  fabTexto: { color: '#fff', fontWeight: '700' },
});