import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { createProduct, updateProduct, getProductById } from '../db/repositories/products';

export default function ProductoScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const esEdicion = !!id;
  const [nombre, setNombre] = useState('');
  const [cantidad, setCantidad] = useState('');
  const [precio, setPrecio] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    getProductById(Number(id)).then((p) => {
      if (p) { setNombre(p.name); setCantidad(String(p.quantity)); setPrecio(String(p.price)); }
    });
  }, [id]);

  async function handleGuardar() {
    setError('');
    if (!nombre.trim()) { setError('El nombre es obligatorio.'); return; }
    const cantidadNum = parseInt(cantidad, 10);
    const precioNum = parseInt(precio, 10);
    if (isNaN(cantidadNum) || cantidadNum < 0) { setError('Cantidad inválida.'); return; }
    if (isNaN(precioNum) || precioNum < 0) { setError('Precio inválido.'); return; }

    if (esEdicion) await updateProduct(Number(id), { name: nombre, quantity: cantidadNum, price: precioNum });
    else await createProduct({ name: nombre, quantity: cantidadNum, price: precioNum });
    router.back();
  }

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>{esEdicion ? 'Editar producto' : 'Nuevo producto'}</Text>
      <TextInput style={styles.input} placeholder="Nombre" value={nombre} onChangeText={setNombre} />
      <TextInput style={styles.input} placeholder="Cantidad" value={cantidad} onChangeText={setCantidad} keyboardType="number-pad" />
      <TextInput style={styles.input} placeholder="Precio" value={precio} onChangeText={setPrecio} keyboardType="number-pad" />
      {!!error && <Text style={styles.error}>{error}</Text>}
      <TouchableOpacity style={styles.boton} onPress={handleGuardar}>
        <Text style={styles.botonTexto}>Guardar</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  titulo: { fontSize: 20, fontWeight: '700', marginBottom: 16 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12, marginBottom: 12 },
  boton: { backgroundColor: '#2563EB', padding: 14, borderRadius: 8, alignItems: 'center', marginTop: 8 },
  botonTexto: { color: '#fff', fontWeight: '700' },
  error: { color: 'red', marginBottom: 12 },
});