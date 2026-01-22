import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Modal,
  ScrollView,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { getConsumerOrders } from '../services/api';

export default function OrdersScreen({ navigation }) {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    if (user) {
      fetchOrders();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchOrders = async () => {
    try {
      const res = await getConsumerOrders(user.consumerId);
      setOrders(res.data);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchOrders();
  };

  const getStatusColor = (status) => {
    const colors = {
      PENDING: '#f59e0b',
      CONFIRMED: '#3b82f6',
      SHIPPED: '#8b5cf6',
      DELIVERED: '#10b981',
      CANCELLED: '#ef4444',
      RETURNED: '#6b7280',
    };
    return colors[status] || '#6b7280';
  };

  const renderOrder = ({ item: order }) => (
    <TouchableOpacity
      style={styles.orderCard}
      onPress={() => setSelectedOrder(order)}
    >
      <View style={styles.orderHeader}>
        <Text style={styles.orderId}>Order #{order.orderId}</Text>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor(order.orderStatus) + '20' },
          ]}
        >
          <Text
            style={[
              styles.statusText,
              { color: getStatusColor(order.orderStatus) },
            ]}
          >
            {order.orderStatus}
          </Text>
        </View>
      </View>

      <Text style={styles.orderDate}>
        {new Date(order.createdAt).toLocaleDateString('en-IN', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        })}
      </Text>

      <Text style={styles.orderItems}>
        {order.orderItems?.length || 0} item(s)
      </Text>

      <View style={styles.orderFooter}>
        <Text style={styles.paymentInfo}>
          {order.paymentMethod} - {order.paymentStatus}
        </Text>
        <Text style={styles.orderTotal}>
          ₹
          {order.orderItems
            ?.reduce((sum, item) => sum + item.price * item.quantity, 0)
            .toFixed(2)}
        </Text>
      </View>
    </TouchableOpacity>
  );

  if (!user) {
    return (
      <View style={styles.center}>
        <Text style={styles.title}>Please Login</Text>
        <Text style={styles.subtitle}>You need to login to view your orders</Text>
        <TouchableOpacity
          style={styles.loginButton}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={styles.loginButtonText}>Go to Login</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Orders</Text>
      </View>

      {orders.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyText}>No orders yet</Text>
        </View>
      ) : (
        <FlatList
          data={orders}
          renderItem={renderOrder}
          keyExtractor={(item) => item.orderId.toString()}
          contentContainerStyle={styles.ordersList}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}

      <Modal
        visible={selectedOrder !== null}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setSelectedOrder(null)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <ScrollView>
              <Text style={styles.modalTitle}>
                Order Details #{selectedOrder?.orderId}
              </Text>

              <View style={styles.modalSection}>
                <Text style={styles.modalSectionTitle}>Order Information</Text>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Date:</Text>
                  <Text style={styles.infoValue}>
                    {selectedOrder &&
                      new Date(selectedOrder.createdAt).toLocaleString()}
                  </Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Status:</Text>
                  <Text style={styles.infoValue}>
                    {selectedOrder?.orderStatus}
                  </Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Payment:</Text>
                  <Text style={styles.infoValue}>
                    {selectedOrder?.paymentMethod} (
                    {selectedOrder?.paymentStatus})
                  </Text>
                </View>
              </View>

              <View style={styles.modalSection}>
                <Text style={styles.modalSectionTitle}>Items</Text>
                {selectedOrder?.orderItems?.map((item, idx) => (
                  <View key={idx} style={styles.modalItem}>
                    <Text style={styles.modalItemName}>{item.itemName}</Text>
                    <Text style={styles.modalItemDetails}>
                      Qty: {item.quantity} | ₹{item.price}
                    </Text>
                  </View>
                ))}
              </View>
            </ScrollView>

            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setSelectedOrder(null)}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
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
    padding: 20,
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 20,
  },
  loginButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyText: {
    fontSize: 18,
    color: '#6b7280',
  },
  ordersList: {
    padding: 10,
  },
  orderCard: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 10,
    borderRadius: 8,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  orderId: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  orderDate: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  orderItems: {
    fontSize: 14,
    color: '#4b5563',
    marginBottom: 12,
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 12,
  },
  paymentInfo: {
    fontSize: 12,
    color: '#6b7280',
  },
  orderTotal: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#3b82f6',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    width: '90%',
    maxHeight: '80%',
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  modalSection: {
    marginBottom: 20,
  },
  modalSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: '#6b7280',
    width: 80,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  modalItem: {
    padding: 12,
    backgroundColor: '#f9fafb',
    borderRadius: 6,
    marginBottom: 8,
  },
  modalItemName: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  modalItemDetails: {
    fontSize: 12,
    color: '#6b7280',
  },
  closeButton: {
    backgroundColor: '#6b7280',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
