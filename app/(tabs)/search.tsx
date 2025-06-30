import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, SafeAreaView, TouchableOpacity, RefreshControl } from 'react-native';
import { Filter, Clock, Users, Star, UserPlus } from 'lucide-react-native';
import { router } from 'expo-router';
import SearchBar from '@/components/SearchBar';
import RecipeCard from '@/components/RecipeCard';
import UserCard from '@/components/UserCard';
import { useRecipes } from '@/hooks/useRecipes';

const dietaryFilters = ['All', 'Vegetarian', 'Vegan', 'Gluten-free', 'Keto', 'Low-carb'];
const difficultyFilters = ['All', 'Easy', 'Medium', 'Hard'];
const timeFilters = ['All', 'Under 15min', '15-30min', '30-60min', 'Over 60min'];

// Mock users data for discovery
const mockUsers = [
  {
    id: '1',
    name: 'Sarah Johnson',
    username: 'sarahcooks',
    avatar: 'https://images.pexels.com/photos/3763188/pexels-photo-3763188.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    bio: 'Home chef passionate about healthy, delicious meals 🥗',
    followers: 1234,
    following: 456,
    recipes: 89,
    isFollowing: false,
  },
  {
    id: '2',
    name: 'Marco Rodriguez',
    username: 'marcoeats',
    avatar: 'https://images.pexels.com/photos/3778603/pexels-photo-3778603.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    bio: 'Italian cuisine enthusiast | Food photographer 📸',
    followers: 2567,
    following: 234,
    recipes: 156,
    isFollowing: true,
  },
  {
    id: '3',
    name: 'Emily Chen',
    username: 'emilyskitchen',
    avatar: 'https://images.pexels.com/photos/3866555/pexels-photo-3866555.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    bio: 'Quick & easy recipes for busy professionals ⏰',
    followers: 3456,
    following: 678,
    recipes: 234,
    isFollowing: false,
  },
];

export default function SearchScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDietary, setSelectedDietary] = useState('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');
  const [selectedTime, setSelectedTime] = useState('All');
  const [showFilters, setShowFilters] = useState(false);
  const [activeTab, setActiveTab] = useState<'recipes' | 'chefs'>('recipes');
  const [refreshing, setRefreshing] = useState(false);
  const [users, setUsers] = useState(mockUsers);

  const { recipes, loading, fetchRecipes, toggleBookmark, toggleLike } = useRecipes();

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchRecipes();
    setRefreshing(false);
  };

  const filteredRecipes = recipes.filter(recipe => {
    const matchesSearch = recipe.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         recipe.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDietary = selectedDietary === 'All' || 
                          recipe.dietary_info.includes(selectedDietary);
    const matchesDifficulty = selectedDifficulty === 'All' || 
                             recipe.difficulty === selectedDifficulty;
    
    let matchesTime = true;
    if (selectedTime !== 'All') {
      if (selectedTime === 'Under 15min') matchesTime = recipe.cook_time < 15;
      else if (selectedTime === '15-30min') matchesTime = recipe.cook_time >= 15 && recipe.cook_time <= 30;
      else if (selectedTime === '30-60min') matchesTime = recipe.cook_time > 30 && recipe.cook_time <= 60;
      else if (selectedTime === 'Over 60min') matchesTime = recipe.cook_time > 60;
    }
    
    return matchesSearch && matchesDietary && matchesDifficulty && matchesTime;
  });

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.bio.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleRecipePress = (recipeId: string) => {
    router.push(`/recipe/${recipeId}`);
  };

  const handleUserPress = (userId: string) => {
    // Navigate to user profile
    console.log('Navigate to user profile:', userId);
  };

  const handleFollow = (userId: string) => {
    setUsers(prev => 
      prev.map(user => 
        user.id === userId 
          ? { 
              ...user, 
              isFollowing: !user.isFollowing,
              followers: user.isFollowing ? user.followers - 1 : user.followers + 1
            }
          : user
      )
    );
  };

  const clearFilters = () => {
    setSelectedDietary('All');
    setSelectedDifficulty('All');
    setSelectedTime('All');
  };

  const hasActiveFilters = selectedDietary !== 'All' || selectedDifficulty !== 'All' || selectedTime !== 'All';

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Discover</Text>
        <TouchableOpacity 
          style={[styles.filterToggle, hasActiveFilters && styles.filterToggleActive]}
          onPress={() => setShowFilters(!showFilters)}
        >
          <Filter size={20} color={hasActiveFilters ? "#FFFFFF" : "#64748B"} />
        </TouchableOpacity>
      </View>

      <SearchBar
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder="Search recipes, chefs, ingredients..."
      />

      {/* Tab Selector */}
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'recipes' && styles.activeTab]}
          onPress={() => setActiveTab('recipes')}
        >
          <Text style={[styles.tabText, activeTab === 'recipes' && styles.activeTabText]}>
            Recipes
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'chefs' && styles.activeTab]}
          onPress={() => setActiveTab('chefs')}
        >
          <Text style={[styles.tabText, activeTab === 'chefs' && styles.activeTabText]}>
            Chefs
          </Text>
        </TouchableOpacity>
      </View>

      {/* Filters - Only show for recipes */}
      {showFilters && activeTab === 'recipes' && (
        <View style={styles.filtersContainer}>
          <View style={styles.filtersHeader}>
            <Text style={styles.filtersTitle}>Filters</Text>
            {hasActiveFilters && (
              <TouchableOpacity style={styles.clearFiltersButton} onPress={clearFilters}>
                <Text style={styles.clearFiltersText}>Clear All</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.filterSection}>
            <Text style={styles.filterTitle}>Dietary</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.filterRow}>
                {dietaryFilters.map((filter) => (
                  <TouchableOpacity
                    key={filter}
                    style={[
                      styles.filterChip,
                      selectedDietary === filter && styles.selectedChip
                    ]}
                    onPress={() => setSelectedDietary(filter)}
                  >
                    <Text style={[
                      styles.filterChipText,
                      selectedDietary === filter && styles.selectedChipText
                    ]}>
                      {filter}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>

          <View style={styles.filterSection}>
            <Text style={styles.filterTitle}>Difficulty</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.filterRow}>
                {difficultyFilters.map((filter) => (
                  <TouchableOpacity
                    key={filter}
                    style={[
                      styles.filterChip,
                      selectedDifficulty === filter && styles.selectedChip
                    ]}
                    onPress={() => setSelectedDifficulty(filter)}
                  >
                    <Text style={[
                      styles.filterChipText,
                      selectedDifficulty === filter && styles.selectedChipText
                    ]}>
                      {filter}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>

          <View style={styles.filterSection}>
            <Text style={styles.filterTitle}>Cook Time</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.filterRow}>
                {timeFilters.map((filter) => (
                  <TouchableOpacity
                    key={filter}
                    style={[
                      styles.filterChip,
                      selectedTime === filter && styles.selectedChip
                    ]}
                    onPress={() => setSelectedTime(filter)}
                  >
                    <Text style={[
                      styles.filterChipText,
                      selectedTime === filter && styles.selectedChipText
                    ]}>
                      {filter}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>
        </View>
      )}

      {/* Results Header */}
      <View style={styles.resultsHeader}>
        <Text style={styles.resultsText}>
          {activeTab === 'recipes' 
            ? `${filteredRecipes.length} recipes found`
            : `${filteredUsers.length} chefs found`
          }
        </Text>
        <View style={styles.sortingOptions}>
          <TouchableOpacity style={styles.sortButton}>
            <Star size={16} color="#64748B" />
            <Text style={styles.sortText}>Rating</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.sortButton}>
            <Clock size={16} color="#64748B" />
            <Text style={styles.sortText}>Recent</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Results */}
      <ScrollView 
        style={styles.results} 
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {activeTab === 'recipes' ? (
          // Recipes Results
          <>
            {loading ? (
              <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>Loading recipes...</Text>
              </View>
            ) : filteredRecipes.length > 0 ? (
              filteredRecipes.map((recipe) => (
                <RecipeCard
                  key={recipe.id}
                  recipe={recipe}
                  onPress={() => handleRecipePress(recipe.id)}
                  onBookmark={() => toggleBookmark(recipe.id)}
                  onLike={() => toggleLike(recipe.id)}
                />
              ))
            ) : (
              <View style={styles.noResults}>
                <Text style={styles.noResultsText}>
                  No recipes found matching your criteria
                </Text>
                <Text style={styles.noResultsSubtext}>
                  Try adjusting your filters or search terms
                </Text>
                {hasActiveFilters && (
                  <TouchableOpacity style={styles.clearFiltersButton} onPress={clearFilters}>
                    <Text style={styles.clearFiltersButtonText}>Clear Filters</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </>
        ) : (
          // Chefs Results
          <>
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <UserCard
                  key={user.id}
                  user={user}
                  onPress={() => handleUserPress(user.id)}
                  onFollow={() => handleFollow(user.id)}
                />
              ))
            ) : (
              <View style={styles.noResults}>
                <UserPlus size={48} color="#94A3B8" />
                <Text style={styles.noResultsText}>
                  No chefs found
                </Text>
                <Text style={styles.noResultsSubtext}>
                  Try different search terms to find amazing chefs
                </Text>
              </View>
            )}
          </>
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
  filterToggle: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#F8FAFC',
  },
  filterToggleActive: {
    backgroundColor: '#FF6B35',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
    marginHorizontal: 4,
  },
  activeTab: {
    backgroundColor: '#FF6B35',
  },
  tabText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#64748B',
  },
  activeTabText: {
    color: '#FFFFFF',
  },
  filtersContainer: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  filtersHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  filtersTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#1E293B',
  },
  clearFiltersButton: {
    backgroundColor: '#FF6B35',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  clearFiltersText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  clearFiltersButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FF6B35',
  },
  filterSection: {
    marginBottom: 16,
  },
  filterTitle: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#1E293B',
    marginBottom: 8,
  },
  filterRow: {
    flexDirection: 'row',
    paddingRight: 16,
  },
  filterChip: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
  },
  selectedChip: {
    backgroundColor: '#FF6B35',
  },
  filterChipText: {
    fontSize: 13,
    fontFamily: 'Inter-Medium',
    color: '#64748B',
  },
  selectedChipText: {
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
  sortingOptions: {
    flexDirection: 'row',
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginLeft: 8,
  },
  sortText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#64748B',
    marginLeft: 4,
  },
  results: {
    flex: 1,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  loadingText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#64748B',
  },
  noResults: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    paddingHorizontal: 32,
  },
  noResultsText: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 8,
    marginTop: 16,
  },
  noResultsSubtext: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#94A3B8',
    textAlign: 'center',
    marginBottom: 24,
  },
  bottomPadding: {
    height: 80,
  },
});