import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { Filter, Clock, Users, Star } from 'lucide-react-native';
import SearchBar from '@/components/SearchBar';
import RecipeCard from '@/components/RecipeCard';
import { mockRecipes } from '@/data/mockData';

const dietaryFilters = ['All', 'Vegetarian', 'Vegan', 'Gluten-free', 'Keto', 'Low-carb'];
const difficultyFilters = ['All', 'Easy', 'Medium', 'Hard'];
const timeFilters = ['All', 'Under 15min', '15-30min', '30-60min', 'Over 60min'];

export default function SearchScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDietary, setSelectedDietary] = useState('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');
  const [selectedTime, setSelectedTime] = useState('All');
  const [showFilters, setShowFilters] = useState(false);

  const filteredRecipes = mockRecipes.filter(recipe => {
    const matchesSearch = recipe.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         recipe.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDietary = selectedDietary === 'All' || 
                          recipe.dietaryInfo.includes(selectedDietary);
    const matchesDifficulty = selectedDifficulty === 'All' || 
                             recipe.difficulty === selectedDifficulty;
    
    let matchesTime = true;
    if (selectedTime !== 'All') {
      if (selectedTime === 'Under 15min') matchesTime = recipe.cookTime < 15;
      else if (selectedTime === '15-30min') matchesTime = recipe.cookTime >= 15 && recipe.cookTime <= 30;
      else if (selectedTime === '30-60min') matchesTime = recipe.cookTime > 30 && recipe.cookTime <= 60;
      else if (selectedTime === 'Over 60min') matchesTime = recipe.cookTime > 60;
    }
    
    return matchesSearch && matchesDietary && matchesDifficulty && matchesTime;
  });

  const handleBookmark = (recipeId: string) => {
    console.log('Bookmark recipe:', recipeId);
  };

  const handleLike = (recipeId: string) => {
    console.log('Like recipe:', recipeId);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Discover Recipes</Text>
        <TouchableOpacity 
          style={styles.filterToggle}
          onPress={() => setShowFilters(!showFilters)}
        >
          <Filter size={20} color="#64748B" />
        </TouchableOpacity>
      </View>

      <SearchBar
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder="Search recipes, ingredients..."
      />

      {showFilters && (
        <View style={styles.filtersContainer}>
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

      <View style={styles.resultsHeader}>
        <Text style={styles.resultsText}>
          {filteredRecipes.length} recipes found
        </Text>
        <View style={styles.sortingOptions}>
          <TouchableOpacity style={styles.sortButton}>
            <Star size={16} color="#64748B" />
            <Text style={styles.sortText}>Rating</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.sortButton}>
            <Clock size={16} color="#64748B" />
            <Text style={styles.sortText}>Time</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.results} showsVerticalScrollIndicator={false}>
        {filteredRecipes.map((recipe) => (
          <RecipeCard
            key={recipe.id}
            recipe={recipe}
            onPress={() => console.log('View recipe:', recipe.id)}
            onBookmark={() => handleBookmark(recipe.id)}
            onLike={() => handleLike(recipe.id)}
          />
        ))}
        {filteredRecipes.length === 0 && (
          <View style={styles.noResults}>
            <Text style={styles.noResultsText}>
              No recipes found matching your criteria
            </Text>
            <Text style={styles.noResultsSubtext}>
              Try adjusting your filters or search terms
            </Text>
          </View>
        )}
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
  },
  filtersContainer: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
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
  },
  noResultsSubtext: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#94A3B8',
    textAlign: 'center',
  },
});