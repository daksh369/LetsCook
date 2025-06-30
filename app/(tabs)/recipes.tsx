import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, SafeAreaView, TouchableOpacity, RefreshControl } from 'react-native';
import { Plus, Grid2x2 as Grid, List, ListFilter as Filter, LocationEdit as Edit } from 'lucide-react-native';
import { router } from 'expo-router';
import RecipeCard from '@/components/RecipeCard';
import SearchBar from '@/components/SearchBar';
import { useRecipes } from '@/hooks/useRecipes';
import { useAuth } from '@/contexts/AuthContext';

export default function MyRecipesScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [refreshing, setRefreshing] = useState(false);
  
  const { userRecipes, userRecipesLoading, fetchUserRecipes, toggleBookmark, toggleLike } = useRecipes();
  const { user } = useAuth();

  const categories = ['All', 'Favorites', 'Recently Added', 'Vegetarian', 'Quick Meals'];

  // Debug logging
  useEffect(() => {
    console.log('🏠 MyRecipesScreen - Component mounted/updated');
    console.log('👤 Current user:', user?.uid);
    console.log('📊 User recipes loading:', userRecipesLoading);
    console.log('🍳 User recipes count:', userRecipes.length);
    console.log('📋 User recipes:', userRecipes.map(r => ({ id: r.id, title: r.title })));
  }, [user, userRecipes, userRecipesLoading]);

  const filteredRecipes = userRecipes.filter(recipe => {
    const matchesSearch = recipe.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || 
                           (selectedCategory === 'Favorites' && recipe.isBookmarked) ||
                           recipe.tags.includes(selectedCategory) ||
                           recipe.dietary_info.includes(selectedCategory);
    return matchesSearch && matchesCategory;
  });

  console.log('🔍 Filtered recipes count:', filteredRecipes.length);
  console.log('🔍 Search query:', searchQuery);
  console.log('🏷️ Selected category:', selectedCategory);

  const onRefresh = async () => {
    console.log('🔄 Manual refresh triggered');
    setRefreshing(true);
    await fetchUserRecipes();
    setRefreshing(false);
  };

  const handleBookmark = (recipeId: string) => {
    console.log('🔖 Bookmark toggled for recipe:', recipeId);
    toggleBookmark(recipeId);
  };

  const handleLike = (recipeId: string) => {
    console.log('❤️ Like toggled for recipe:', recipeId);
    toggleLike(recipeId);
  };

  const handleAddRecipe = () => {
    console.log('➕ Add recipe button pressed');
    router.push('/(tabs)/add');
  };

  const handleRecipePress = (recipeId: string) => {
    console.log('👆 Recipe pressed:', recipeId);
    router.push(`/recipe/${recipeId}`);
  };

  const handleEditRecipe = (recipeId: string) => {
    console.log('✏️ Edit recipe pressed:', recipeId);
    // TODO: Navigate to edit recipe screen
    router.push(`/(tabs)/add?edit=${recipeId}`);
  };

  if (userRecipesLoading) {
    console.log('⏳ Showing loading state');
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading your recipes...</Text>
        </View>
      </SafeAreaView>
    );
  }

  console.log('🎨 Rendering main UI with', userRecipes.length, 'user recipes');

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Recipes</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity 
            style={styles.viewToggle}
            onPress={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
          >
            {viewMode === 'grid' ? 
              <List size={20} color="#64748B" /> : 
              <Grid size={20} color="#64748B" />
            }
          </TouchableOpacity>
          <TouchableOpacity style={styles.addButton} onPress={handleAddRecipe}>
            <Plus size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      <SearchBar
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder="Search your recipes..."
      />

      <View style={styles.stats}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{userRecipes.length}</Text>
          <Text style={styles.statLabel}>Total Recipes</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{userRecipes.filter(r => r.isBookmarked).length}</Text>
          <Text style={styles.statLabel}>Favorites</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>0</Text>
          <Text style={styles.statLabel}>Times Cooked</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{userRecipes.filter(r => r.is_public).length}</Text>
          <Text style={styles.statLabel}>Shared</Text>
        </View>
      </View>

      <View style={styles.categoriesContainer}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categories}
        >
          {categories.map((category) => (
            <TouchableOpacity
              key={category}
              style={[
                styles.categoryChip,
                selectedCategory === category && styles.selectedCategory
              ]}
              onPress={() => setSelectedCategory(category)}
            >
              <Text style={[
                styles.categoryText,
                selectedCategory === category && styles.selectedCategoryText
              ]}>
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={styles.resultsHeader}>
        <Text style={styles.resultsText}>
          {filteredRecipes.length} recipes
        </Text>
        <TouchableOpacity style={styles.sortButton}>
          <Filter size={16} color="#64748B" />
          <Text style={styles.sortText}>Sort by date</Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {filteredRecipes.length > 0 ? (
          filteredRecipes.map((recipe) => {
            console.log('🎯 Rendering recipe card for:', recipe.title);
            return (
              <View key={recipe.id} style={styles.recipeCardContainer}>
                <RecipeCard
                  recipe={recipe}
                  onPress={() => handleRecipePress(recipe.id)}
                  onBookmark={() => handleBookmark(recipe.id)}
                  onLike={() => handleLike(recipe.id)}
                />
                {/* Edit button overlay for user's own recipes */}
                {recipe.author_id === user?.uid && (
                  <TouchableOpacity 
                    style={styles.editButton}
                    onPress={() => handleEditRecipe(recipe.id)}
                  >
                    <Edit size={16} color="#FFFFFF" />
                  </TouchableOpacity>
                )}
              </View>
            );
          })
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateTitle}>
              {userRecipes.length === 0 ? 'No recipes yet' : 'No recipes found'}
            </Text>
            <Text style={styles.emptyStateText}>
              {userRecipes.length === 0 
                ? 'Start adding recipes to build your collection' 
                : 'Try adjusting your search terms or filters'
              }
            </Text>
            {userRecipes.length === 0 && (
              <TouchableOpacity style={styles.emptyStateButton} onPress={handleAddRecipe}>
                <Plus size={20} color="#FFFFFF" />
                <Text style={styles.emptyStateButtonText}>Add Your First Recipe</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
        
        {/* Bottom padding to account for tab bar */}
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  title: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#1E293B',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewToggle: {
    padding: 8,
    marginRight: 8,
  },
  addButton: {
    backgroundColor: '#FF6B35',
    borderRadius: 20,
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stats: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#1E293B',
  },
  statLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
    marginTop: 2,
  },
  categoriesContainer: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingVertical: 12,
  },
  categories: {
    paddingHorizontal: 16,
    flexDirection: 'row',
  },
  categoryChip: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    minWidth: 80,
    alignItems: 'center',
  },
  selectedCategory: {
    backgroundColor: '#FF6B35',
  },
  categoryText: {
    fontSize: 13,
    fontFamily: 'Inter-Medium',
    color: '#64748B',
    textAlign: 'center',
  },
  selectedCategoryText: {
    color: '#FFFFFF',
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  resultsText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1E293B',
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sortText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#64748B',
    marginLeft: 4,
  },
  content: {
    flex: 1,
  },
  recipeCardContainer: {
    position: 'relative',
  },
  editButton: {
    position: 'absolute',
    top: 20,
    right: 28,
    backgroundColor: '#FF6B35',
    borderRadius: 16,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    paddingHorizontal: 32,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#94A3B8',
    textAlign: 'center',
    marginBottom: 24,
  },
  emptyStateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF6B35',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
  },
  emptyStateButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  bottomPadding: {
    height: 80, // Account for tab bar
  },
});