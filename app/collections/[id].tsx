import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, SafeAreaView, TouchableOpacity, RefreshControl } from 'react-native';
import { ArrowLeft, Plus, Folder } from 'lucide-react-native';
import { router, useLocalSearchParams } from 'expo-router';
import RecipeCard from '@/components/RecipeCard';
import { useRecipes, Recipe } from '@/hooks/useRecipes';

interface Collection {
  id: string;
  name: string;
  description: string;
  recipe_count: number;
  created_at: string;
  is_default: boolean;
}

export default function CollectionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [collection, setCollection] = useState<Collection | null>(null);
  const [collectionRecipes, setCollectionRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const { toggleBookmark, toggleLike } = useRecipes();

  // Mock collections data
  const mockCollections: Collection[] = [
    {
      id: '1',
      name: 'Favorites',
      description: 'My all-time favorite recipes',
      recipe_count: 12,
      created_at: '2024-01-01',
      is_default: true,
    },
    {
      id: '2',
      name: 'To Try Next Week',
      description: 'Recipes I want to cook soon',
      recipe_count: 8,
      created_at: '2024-01-15',
      is_default: false,
    },
    {
      id: '3',
      name: 'Festive Dishes',
      description: 'Special occasion recipes',
      recipe_count: 15,
      created_at: '2024-01-10',
      is_default: false,
    },
  ];

  // Mock recipes for collections
  const mockCollectionRecipes: Recipe[] = [
    {
      id: '1',
      title: 'Mediterranean Quinoa Bowl',
      description: 'A colorful, nutrient-packed bowl with quinoa, roasted vegetables, and tahini dressing.',
      image_url: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=600',
      cook_time: 25,
      servings: 2,
      difficulty: 'Easy',
      rating: 4.8,
      reviews_count: 127,
      author_id: 'user1',
      author: {
        id: 'user1',
        name: 'Sarah Johnson',
        username: 'sarahcooks',
        avatar_url: 'https://images.pexels.com/photos/3763188/pexels-photo-3763188.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop'
      },
      ingredients: ['1 cup quinoa', '2 cups vegetable broth'],
      instructions: ['Cook quinoa', 'Add vegetables'],
      tags: ['Healthy', 'Quick'],
      dietary_info: ['Vegetarian', 'Vegan'],
      is_public: true,
      created_at: '2024-01-15',
      updated_at: '2024-01-15',
      isBookmarked: true,
      isLiked: false,
    },
    {
      id: '2',
      title: 'Classic Margherita Pizza',
      description: 'Authentic Italian pizza with fresh mozzarella, basil, and San Marzano tomatoes.',
      image_url: 'https://images.pexels.com/photos/315755/pexels-photo-315755.jpeg?auto=compress&cs=tinysrgb&w=600',
      cook_time: 45,
      servings: 4,
      difficulty: 'Medium',
      rating: 4.9,
      reviews_count: 203,
      author_id: 'user2',
      author: {
        id: 'user2',
        name: 'Marco Rodriguez',
        username: 'marcoeats',
        avatar_url: 'https://images.pexels.com/photos/3778603/pexels-photo-3778603.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop'
      },
      ingredients: ['400g pizza dough', '200g tomatoes'],
      instructions: ['Roll dough', 'Add toppings'],
      tags: ['Italian', 'Classic'],
      dietary_info: ['Vegetarian'],
      is_public: true,
      created_at: '2024-01-14',
      updated_at: '2024-01-14',
      isBookmarked: true,
      isLiked: true,
    },
  ];

  useEffect(() => {
    if (id) {
      loadCollection();
    }
  }, [id]);

  const loadCollection = async () => {
    try {
      setLoading(true);
      
      // Find the collection
      const foundCollection = mockCollections.find(c => c.id === id);
      if (foundCollection) {
        setCollection(foundCollection);
        setCollectionRecipes(mockCollectionRecipes);
      }
    } catch (error) {
      console.error('Error loading collection:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.push('/collections');
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadCollection();
    setRefreshing(false);
  };

  const handleRecipePress = (recipeId: string) => {
    router.push(`/recipe/${recipeId}`);
  };

  const handleAddRecipes = () => {
    // Navigate to a screen where users can add recipes to this collection
    router.push(`/collections/${id}/add`);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading collection...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!collection) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Collection not found</Text>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerButton} onPress={handleBack}>
          <ArrowLeft size={24} color="#1E293B" />
        </TouchableOpacity>
        <Text style={styles.title} numberOfLines={1}>{collection.name}</Text>
        <TouchableOpacity style={styles.addButton} onPress={handleAddRecipes}>
          <Plus size={24} color="#FF6B35" />
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Collection Info */}
        <View style={styles.collectionInfo}>
          <View style={styles.collectionIcon}>
            <Folder size={32} color="#FF6B35" />
          </View>
          <Text style={styles.collectionName}>{collection.name}</Text>
          {collection.description ? (
            <Text style={styles.collectionDescription}>{collection.description}</Text>
          ) : null}
          <Text style={styles.collectionCount}>
            {collection.recipe_count} recipe{collection.recipe_count !== 1 ? 's' : ''}
          </Text>
        </View>

        {/* Recipes */}
        <View style={styles.recipesSection}>
          {collectionRecipes.length > 0 ? (
            collectionRecipes.map((recipe) => (
              <RecipeCard
                key={recipe.id}
                recipe={recipe}
                onPress={() => handleRecipePress(recipe.id)}
                onBookmark={() => toggleBookmark(recipe.id)}
                onLike={() => toggleLike(recipe.id)}
              />
            ))
          ) : (
            <View style={styles.emptyState}>
              <Folder size={48} color="#94A3B8" />
              <Text style={styles.emptyTitle}>No Recipes Yet</Text>
              <Text style={styles.emptyText}>
                Start adding recipes to this collection
              </Text>
              <TouchableOpacity style={styles.emptyButton} onPress={handleAddRecipes}>
                <Plus size={20} color="#FFFFFF" />
                <Text style={styles.emptyButtonText}>Add Recipes</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Bottom padding */}
        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#64748B',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  errorText: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#64748B',
    marginBottom: 24,
  },
  backButton: {
    backgroundColor: '#FF6B35',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  backButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerButton: {
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#1E293B',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 16,
  },
  addButton: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
  collectionInfo: {
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  collectionIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FEF7F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  collectionName: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#1E293B',
    textAlign: 'center',
    marginBottom: 8,
  },
  collectionDescription: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 24,
  },
  collectionCount: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#94A3B8',
  },
  recipesSection: {
    flex: 1,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
    paddingHorizontal: 32,
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    borderRadius: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    color: '#64748B',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#94A3B8',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF6B35',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    gap: 8,
  },
  emptyButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  bottomPadding: {
    height: 80,
  },
});