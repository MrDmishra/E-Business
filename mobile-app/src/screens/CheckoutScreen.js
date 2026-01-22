import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { getConsumer, createOrder } from '../services/api';

export default function CheckoutScreen({ navigation }) {
  const { cart, getCartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);

  useEffect(() => {
    if (user) {
      fetchAddresses();
    }
  }, [user]);

  const fetchAddresses = async () => {
    try {
      const res = await getConsumer(user.consumerId);
      setAddresses(res.data.addresses || []);
      if (res.data.addresses?.length > 0) {
        setSelectedAddress(res.data.addresses[0].addressId);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch addresses');
    } finally {
      setLoading(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      Alert.alert('Error', 'Please select a delivery address');
      return;
    }

    setPlacing(true);
    try {
      const orderData = {
        consumerId: user.consumerId,
        addressId: selectedAddress,
        paymentMethod: paymentMethod,
        paymentStatus: paymentMethod === 'COD' ? 'PENDING' : 'SUCCESS',
        orderStatus: 'PENDING',
        orderItems: cart.map((item) => ({
          itemId: item.itemId,
          quantity: item.quantity,
          price: item.price,
        })),
        orderCoupons: [],
      };

      await createOrder(orderData);
      clearCart();
      Alert.alert('Success', 'Order placed successfully!', [
        { text: 'OK', onPress: () => navigation.navigate('Orders') },
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to place order');
    } finally {
      setPlacing(false);
    }
  };

  const subtotal = getCartTotal();
  const shipping = 50;
  const total = subtotal + shipping;

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Delivery Address</Text>
        {addresses.length === 0 ? (
          <Text style={styles.noAddress}>
            No addresses found. Please add an address in your profile.
          </Text>
        ) : (
          addresses.map((addr) => (
            <TouchableOpacity
              key={addr.addressId}
              style={[
                styles.addressCard,
                selectedAddress === addr.addressId && styles.addressCardActive,
              ]}
              onPress={() => setSelectedAddress(addr.addressId)}
            >
              <View style={styles.addressHeader}>
                <View
                  style={[
                    styles.radio,
                    selectedAddress === addr.addressId && styles.radioActive,
                  ]}
                />
                <Text style={styles.addressType}>{addr.addressType}</Text>
              </View>
              <Text style={styles.addressText}>
                {addr.street}, {addr.city}, {addr.state} {addr.postalCode},{' '}
                {addr.country}
              </Text>
            </TouchableOpacity>
          ))
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Payment Method</Text>
        <TouchableOpacity
          style={[
            styles.paymentCard,
            paymentMethod === 'COD' && styles.paymentCardActive,
          ]}
          onPress={() => setPaymentMethod('COD')}
        >
          <View style={styles.paymentHeader}>
            <View
              style={[
                styles.radio,
                paymentMethod === 'COD' && styles.radioActive,
              ]}
            />
            <View>
              <Text style={styles.paymentTitle}>Cash on Delivery</Text>
              <Text style={styles.paymentSubtitle}>Pay when you receive</Text>
            </View>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.paymentCard,
            paymentMethod === 'ONLINE' && styles.paymentCardActive,
          ]}
          onPress={() => setPaymentMethod('ONLINE')}
        >
          <View style={styles.paymentHeader}>
            <View
              style={[
                styles.radio,
                paymentMethod === 'ONLINE' && styles.radioActive,
              ]}
            />
            <View>
              <Text style={styles.paymentTitle}>Online Payment</Text>
              <Text style={styles.paymentSubtitle}>
                UPI / Card / Net Banking
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Order Summary</Text>
        {cart.map((item) => (
          <View key={item.itemId} style={styles.orderItem}>
            <Text style={styles.orderItemName}>
              {item.itemName} x {item.quantity}
            </Text>
            <Text style={styles.orderItemPrice}>
              ₹{(item.price * item.quantity).toFixed(2)}
            </Text>
          </View>
        ))}
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Subtotal</Text>
          <Text style={styles.summaryValue}>₹{subtotal.toFixed(2)}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Shipping</Text>
          <Text style={styles.summaryValue}>₹{shipping.toFixed(2)}</Text>
        </View>
        <View style={[styles.summaryRow, styles.totalRow]}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>₹{total.toFixed(2)}</Text>
        </View>
      </View>

      <TouchableOpacity
        style={[
          styles.placeOrderButton,
          (!selectedAddress || placing) && styles.placeOrderButtonDisabled,
        ]}
        onPress={handlePlaceOrder}
        disabled={!selectedAddress || placing}
      >
        <Text style={styles.placeOrderButtonText}>
          {placing ? 'Placing Order...' : 'Place Order'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  section: {
    backgroundColor: '#fff',
    padding: 20,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  noAddress: {
    color: '#6b7280',
    fontSize: 14,
  },
  addressCard: {
    padding: 16,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    marginBottom: 12,
  },
  addressCardActive: {
    borderColor: '#3b82f6',
    backgroundColor: '#eff6ff',
  },
  addressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#d1d5db',
    marginRight: 12,
  },
  radioActive: {
    borderColor: '#3b82f6',
    backgroundColor: '#3b82f6',
  },
  addressType: {
    fontSize: 16,
    fontWeight: '600',
  },
  addressText: {
    fontSize: 14,
    color: '#6b7280',
    marginLeft: 32,
  },
  paymentCard: {
    padding: 16,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    marginBottom: 12,
  },
  paymentCardActive: {
    borderColor: '#3b82f6',
    backgroundColor: '#eff6ff',
  },
  paymentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  paymentTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  paymentSubtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  orderItemName: {
    fontSize: 14,
    color: '#4b5563',
  },
  orderItemPrice: {
    fontSize: 14,
    fontWeight: '600',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
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
    marginTop: 12,
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
  placeOrderButton: {
    backgroundColor: '#10b981',
    paddingVertical: 16,
    margin: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  placeOrderButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  placeOrderButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
