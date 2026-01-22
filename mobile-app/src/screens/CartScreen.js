import React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet,
} from 'react-native';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export default function CartScreen({ navigation }) {
  const { cart, updateQuantity, removeFromCart, getCartTotal } = useCart();
  const { user } = useAuth();

  const handleCheckout = () => {
    if (!user) {
      navigation.navigate('Login');
      return;
    }
    navigation.navigate('Checkout');
  };

  const renderCartItem = ({ item }) => (
    <View style={styles.cartItem}>
      {item.images?.[0] && (
        <Image
          source={{ uri: item.images[0].imageUrl }}
          style={styles.itemImage}
        />
      )}
      <View style={styles.itemDetails}>
        <Text style={styles.itemName} numberOfLines={2}>
          {item.itemName}
        </Text>
        <Text style={styles.itemBrand}>{item.brand}</Text>
        <Text style={styles.itemPrice}>₹{item.price}</Text>
      </View>
      <View style={styles.itemActions}>
        <View style={styles.quantityControls}>
          <TouchableOpacity
            style={styles.quantityButton}
            onPress={() => updateQuantity(item.itemId, item.quantity - 1)}
          >
            <Text style={styles.quantityButtonText}>-</Text>
          </TouchableOpacity>
          <Text style={styles.quantityText}>{item.quantity}</Text>
          <TouchableOpacity
            style={styles.quantityButton}
            onPress={() => updateQuantity(item.itemId, item.quantity + 1)}
          >
            <Text style={styles.quantityButtonText}>+</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          style={styles.removeButton}
          onPress={() => removeFromCart(item.itemId)}
        >
          <Text style={styles.removeButtonText}>Remove</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (cart.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Your cart is empty</Text>
        <TouchableOpacity
          style={styles.shopButton}
          onPress={() => navigation.navigate('Shop')}
        >
          <Text style={styles.shopButtonText}>Start Shopping</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Shopping Cart</Text>
      </View>

      <FlatList
        data={cart}
        renderItem={renderCartItem}
        keyExtractor={(item) => item.itemId.toString()}
        contentContainerStyle={styles.cartList}
      />

      <View style={styles.summaryContainer}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Subtotal</Text>
          <Text style={styles.summaryValue}>₹{getCartTotal().toFixed(2)}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Shipping</Text>
          <Text style={styles.summaryValue}>₹50.00</Text>
        </View>
        <View style={[styles.summaryRow, styles.totalRow]}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>
            ₹{(getCartTotal() + 50).toFixed(2)}
          </Text>
        </View>
        <TouchableOpacity style={styles.checkoutButton} onPress={handleCheckout}>
          <Text style={styles.checkoutButtonText}>Proceed to Checkout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  header: {
    backgroundColor: '#3b82f6',
    padding: 20,
    paddingTop: 50,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    color: '#6b7280',
    marginBottom: 20,
  },
  shopButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  shopButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  cartList: {
    padding: 10,
  },
  cartItem: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 12,
    marginBottom: 10,
    borderRadius: 8,
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  itemDetails: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  itemBrand: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3b82f6',
  },
  itemActions: {
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  quantityButton: {
    width: 30,
    height: 30,
    backgroundColor: '#e5e7eb',
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#374151',
  },
  quantityText: {
    fontSize: 16,
    fontWeight: '600',
    marginHorizontal: 12,
  },
  removeButton: {
    paddingVertical: 4,
  },
  removeButtonText: {
    color: '#ef4444',
    fontSize: 14,
    fontWeight: '500',
  },
  summaryContainer: {
    backgroundColor: '#fff',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 16,
    color: '#6b7280',
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  totalRow: {
    borderTopWidth: 2,
    borderTopColor: '#e5e7eb',
    paddingTop: 12,
    marginTop: 8,
  },
  totalLabel: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  totalValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#3b82f6',
  },
  checkoutButton: {
    backgroundColor: '#10b981',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  checkoutButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
