import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { register as apiRegister, createConsumer } from '../services/api';

export default function RegisterScreen({ navigation }) {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    street: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
  });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleRegister = async () => {
    if (!formData.fullName || !formData.email || !formData.password) {
      Alert.alert('Error', 'Please fill in required fields');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      // Register user
      await apiRegister({
        username: formData.email,
        password: formData.password,
        fullName: formData.fullName,
      });

      // Create consumer profile
      const consumerData = {
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        addresses: formData.street
          ? [
              {
                street: formData.street,
                city: formData.city,
                state: formData.state,
                postalCode: formData.postalCode,
                country: formData.country,
                addressType: 'HOME',
              },
            ]
          : [],
      };

      const res = await createConsumer(consumerData);
      await login(res.data);

      Alert.alert('Success', 'Registration successful!', [
        { text: 'OK', onPress: () => navigation.navigate('Main') },
      ]);
    } catch (error) {
      Alert.alert('Error', 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>Join us today</Text>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Full Name *</Text>
          <TextInput
            style={styles.input}
            value={formData.fullName}
            onChangeText={(text) => handleInputChange('fullName', text)}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Email *</Text>
          <TextInput
            style={styles.input}
            value={formData.email}
            onChangeText={(text) => handleInputChange('email', text)}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Phone</Text>
          <TextInput
            style={styles.input}
            value={formData.phone}
            onChangeText={(text) => handleInputChange('phone', text)}
            keyboardType="phone-pad"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Password *</Text>
          <TextInput
            style={styles.input}
            value={formData.password}
            onChangeText={(text) => handleInputChange('password', text)}
            secureTextEntry
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Confirm Password *</Text>
          <TextInput
            style={styles.input}
            value={formData.confirmPassword}
            onChangeText={(text) => handleInputChange('confirmPassword', text)}
            secureTextEntry
          />
        </View>

        <Text style={styles.sectionTitle}>Delivery Address (Optional)</Text>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Street</Text>
          <TextInput
            style={styles.input}
            value={formData.street}
            onChangeText={(text) => handleInputChange('street', text)}
          />
        </View>

        <View style={styles.row}>
          <View style={[styles.inputGroup, styles.halfWidth]}>
            <Text style={styles.label}>City</Text>
            <TextInput
              style={styles.input}
              value={formData.city}
              onChangeText={(text) => handleInputChange('city', text)}
            />
          </View>

          <View style={[styles.inputGroup, styles.halfWidth]}>
            <Text style={styles.label}>State</Text>
            <TextInput
              style={styles.input}
              value={formData.state}
              onChangeText={(text) => handleInputChange('state', text)}
            />
          </View>
        </View>

        <View style={styles.row}>
          <View style={[styles.inputGroup, styles.halfWidth]}>
            <Text style={styles.label}>Postal Code</Text>
            <TextInput
              style={styles.input}
              value={formData.postalCode}
              onChangeText={(text) => handleInputChange('postalCode', text)}
            />
          </View>

          <View style={[styles.inputGroup, styles.halfWidth]}>
            <Text style={styles.label}>Country</Text>
            <TextInput
              style={styles.input}
              value={formData.country}
              onChangeText={(text) => handleInputChange('country', text)}
            />
          </View>
        </View>

        <TouchableOpacity
          style={[
            styles.registerButton,
            loading && styles.registerButtonDisabled,
          ]}
          onPress={handleRegister}
          disabled={loading}
        >
          <Text style={styles.registerButtonText}>
            {loading ? 'Creating Account...' : 'Create Account'}
          </Text>
        </TouchableOpacity>

        <View style={styles.loginContainer}>
          <Text style={styles.loginText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => navigation.replace('Login')}>
            <Text style={styles.loginLink}>Login</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  scrollContent: {
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 20,
    marginBottom: 16,
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
    backgroundColor: '#fff',
  },
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  halfWidth: {
    flex: 1,
  },
  registerButton: {
    backgroundColor: '#10b981',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  registerButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  registerButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
  loginText: {
    color: '#6b7280',
    fontSize: 14,
  },
  loginLink: {
    color: '#3b82f6',
    fontSize: 14,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});
