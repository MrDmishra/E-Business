import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { getConsumer, updateConsumer } from '../services/api';

export default function ProfileScreen({ navigation }) {
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
  });

  useEffect(() => {
    if (user) {
      fetchProfile();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const res = await getConsumer(user.consumerId);
      setProfile(res.data);
      setFormData({
        fullName: res.data.fullName || '',
        email: res.data.email || '',
        phone: res.data.phone || '',
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch profile');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    try {
      await updateConsumer(user.consumerId, {
        ...formData,
        addresses: profile.addresses,
      });
      await fetchProfile();
      setEditing(false);
      Alert.alert('Success', 'Profile updated successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile');
    }
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: () => {
          logout();
          navigation.navigate('Shop');
        },
      },
    ]);
  };

  if (!user) {
    return (
      <View style={styles.center}>
        <Text style={styles.title}>Please Login</Text>
        <Text style={styles.subtitle}>
          You need to login to view your profile
        </Text>
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
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Profile</Text>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Personal Information</Text>
          {!editing && (
            <TouchableOpacity onPress={() => setEditing(true)}>
              <Text style={styles.editButton}>Edit</Text>
            </TouchableOpacity>
          )}
        </View>

        {editing ? (
          <View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Full Name</Text>
              <TextInput
                style={styles.input}
                value={formData.fullName}
                onChangeText={(text) =>
                  setFormData({ ...formData, fullName: text })
                }
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                value={formData.email}
                onChangeText={(text) =>
                  setFormData({ ...formData, email: text })
                }
                keyboardType="email-address"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Phone</Text>
              <TextInput
                style={styles.input}
                value={formData.phone}
                onChangeText={(text) =>
                  setFormData({ ...formData, phone: text })
                }
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[styles.button, styles.saveButton]}
                onPress={handleUpdate}
              >
                <Text style={styles.buttonText}>Save</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={() => {
                  setEditing(false);
                  setFormData({
                    fullName: profile.fullName || '',
                    email: profile.email || '',
                    phone: profile.phone || '',
                  });
                }}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Full Name</Text>
              <Text style={styles.infoValue}>{profile?.fullName}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Email</Text>
              <Text style={styles.infoValue}>{profile?.email}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Phone</Text>
              <Text style={styles.infoValue}>
                {profile?.phone || 'Not provided'}
              </Text>
            </View>
          </View>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Saved Addresses</Text>
        {profile?.addresses?.length === 0 ? (
          <Text style={styles.noAddress}>No addresses saved yet</Text>
        ) : (
          profile?.addresses?.map((addr) => (
            <View key={addr.addressId} style={styles.addressCard}>
              <View style={styles.addressTypeBadge}>
                <Text style={styles.addressTypeText}>{addr.addressType}</Text>
              </View>
              <Text style={styles.addressText}>
                {addr.street}, {addr.city}, {addr.state} {addr.postalCode},{' '}
                {addr.country}
              </Text>
            </View>
          ))
        )}
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>Logout</Text>
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
    textAlign: 'center',
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
  section: {
    backgroundColor: '#fff',
    padding: 20,
    marginBottom: 10,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  editButton: {
    color: '#3b82f6',
    fontSize: 16,
    fontWeight: '600',
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButton: {
    backgroundColor: '#10b981',
  },
  cancelButton: {
    backgroundColor: '#6b7280',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  infoRow: {
    marginBottom: 16,
  },
  infoLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '500',
  },
  noAddress: {
    color: '#6b7280',
    fontSize: 14,
  },
  addressCard: {
    padding: 16,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    marginBottom: 12,
  },
  addressTypeBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#dbeafe',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginBottom: 8,
  },
  addressTypeText: {
    color: '#1e40af',
    fontSize: 12,
    fontWeight: '600',
  },
  addressText: {
    fontSize: 14,
    lineHeight: 20,
  },
  logoutButton: {
    backgroundColor: '#ef4444',
    margin: 20,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
