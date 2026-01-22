import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useCart } from '../context/CartContext';

export default function ProductScreen({ route, navigation }) {
  const { item } = route.params;
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(item.images?.[0]?.imageUrl);
  const { addToCart } = useCart();

  const handleAddToCart = () => {
    addToCart(item, quantity);
    alert(`Added ${quantity} item(s) to cart!`);
    navigation.goBack();
  };

  return (
    <ScrollView style={styles.container}>
      <Image
        source={{ uri: selectedImage || 'https://via.placeholder.com/400' }}
        style={styles.mainImage}
      />

      {item.images && item.images.length > 1 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.thumbnailContainer}
        >
          {item.images.map((img, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => setSelectedImage(img.imageUrl)}
            >
              <Image
                source={{ uri: img.imageUrl }}
                style={[
                  styles.thumbnail,
                  selectedImage === img.imageUrl && styles.thumbnailActive,
                ]}
              />
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      <View style={styles.detailsContainer}>
        <Text style={styles.brand}>{item.brand}</Text>
        <Text style={styles.name}>{item.itemName}</Text>
        <Text style={styles.price}>₹{item.price}</Text>

        {item.description && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description}>{item.description}</Text>
          </View>
        )}

        {item.categories && item.categories.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Categories</Text>
            <View style={styles.categoriesContainer}>
              {item.categories.map((cat) => (
                <View key={cat.categoryId} style={styles.categoryBadge}>
                  <Text style={styles.categoryText}>{cat.categoryName}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Product Details</Text>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>SKU:</Text>
            <Text style={styles.detailValue}>{item.sku}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Weight:</Text>
            <Text style={styles.detailValue}>{item.weight} kg</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Status:</Text>
            <Text style={styles.detailValue}>{item.itemStatus}</Text>
          </View>
        </View>

        <View style={styles.quantityContainer}>
          <Text style={styles.sectionTitle}>Quantity</Text>
          <View style={styles.quantityControls}>
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={() => setQuantity(Math.max(1, quantity - 1))}
            >
              <Text style={styles.quantityButtonText}>-</Text>
            </TouchableOpacity>
            <Text style={styles.quantityText}>{quantity}</Text>
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={() => setQuantity(quantity + 1)}
            >
              <Text style={styles.quantityButtonText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity style={styles.addButton} onPress={handleAddToCart}>
          <Text style={styles.addButtonText}>Add to Cart</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  mainImage: {
    width: '100%',
    height: 400,
    resizeMode: 'cover',
  },
  thumbnailContainer: {
    padding: 10,
    backgroundColor: '#f9fafb',
  },
  thumbnail: {
    width: 80,
    height: 80,
    marginRight: 10,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  thumbnailActive: {
    borderColor: '#3b82f6',
  },
  detailsContainer: {
    padding: 20,
  },
  brand: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  price: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#3b82f6',
    marginBottom: 20,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: '#4b5563',
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  categoryBadge: {
    backgroundColor: '#dbeafe',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  categoryText: {
    color: '#1e40af',
    fontSize: 12,
    fontWeight: '600',
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: '#6b7280',
    width: 80,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  quantityContainer: {
    marginBottom: 20,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityButton: {
    width: 40,
    height: 40,
    backgroundColor: '#e5e7eb',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#374151',
  },
  quantityText: {
    fontSize: 20,
    fontWeight: '600',
    marginHorizontal: 20,
  },
  addButton: {
    backgroundColor: '#10b981',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
