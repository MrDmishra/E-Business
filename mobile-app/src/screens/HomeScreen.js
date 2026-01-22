import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { getItems, getCategories } from '../services/api';
import { useCart } from '../context/CartContext';

export default function HomeScreen({ navigation }) {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { addToCart } = useCart();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const itemsRes = await getItems();
      console.log('Products fetched:', itemsRes.data);
      setItems(itemsRes.data);
      // Categories not available yet
      setCategories([]);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      alert('Failed to load products. Check if backend is running.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const filteredItems = selectedCategory
    ? items.filter(item =>
        item.categories?.some(cat => cat.categoryId === selectedCategory)
      )
    : items;

  const handleAddToCart = (item) => {
    addToCart(item, 1);
    alert('Added to cart!');
  };

  const renderCategoryButton = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.categoryButton,
        selectedCategory === item.categoryId && styles.categoryButtonActive,
      ]}
      onPress={() =>
        setSelectedCategory(
          selectedCategory === item.categoryId ? null : item.categoryId
        )
      }
    >
      <Text
        style={[
          styles.categoryText,
          selectedCategory === item.categoryId && styles.categoryTextActive,
        ]}
      >
        {item.categoryName}
      </Text>
    </TouchableOpacity>
  );

  const renderProduct = ({ item }) => (
    <TouchableOpacity
      style={styles.productCard}
      onPress={() => navigation.navigate('Product', { item })}
    >
      {item.imageUrl && (
        <Image
          source={{ uri: item.imageUrl }}
          style={styles.productImage}
        />
      )}
      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={2}>
          {item.name}
        </Text>
        <Text style={styles.productPrice}>₹{item.price}</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => handleAddToCart(item)}
        >
          <Text style={styles.addButtonText}>Add to Cart</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

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
        <Text style={styles.headerTitle}>E-Business</Text>
      </View>

      {categories.length > 0 && (
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={categories}
          renderItem={renderCategoryButton}
          keyExtractor={(item) => item.categoryId?.toString() || Math.random().toString()}
          contentContainerStyle={styles.categoriesContainer}
          ListHeaderComponent={
            <TouchableOpacity
              style={[
                styles.categoryButton,
                !selectedCategory && styles.categoryButtonActive,
              ]}
              onPress={() => setSelectedCategory(null)}
            >
              <Text
                style={[
                  styles.categoryText,
                  !selectedCategory && styles.categoryTextActive,
                ]}
              >
                All Products
              </Text>
            </TouchableOpacity>
          }
        />
      )}

      <FlatList
        data={filteredItems}
        renderItem={renderProduct}
        keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
        numColumns={2}
        contentContainerStyle={styles.productsContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />
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
  categoriesContainer: {
    padding: 10,
    backgroundColor: '#fff',
  },
  categoryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#e5e7eb',
    marginRight: 10,
  },
  categoryButtonActive: {
    backgroundColor: '#3b82f6',
  },
  categoryText: {
    color: '#6b7280',
    fontWeight: '600',
  },
  categoryTextActive: {
    color: '#fff',
  },
  productsContainer: {
    padding: 10,
  },
  productCard: {
    flex: 1,
    margin: 5,
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    maxWidth: '48%',
  },
  productImage: {
    width: '100%',
    height: 150,
    resizeMode: 'cover',
  },
  productInfo: {
    padding: 12,
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  productBrand: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 8,
  },
  productPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3b82f6',
    marginBottom: 8,
  },
  addButton: {
    backgroundColor: '#10b981',
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 12,
  },
});
