import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, SafeAreaView, TouchableOpacity, Alert } from 'react-native';
import { ArrowLeft, Plus, Search } from 'lucide-react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  orderBy,
  getDoc,
  doc
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { useRecipes, Recipe } from '@/hooks/useRecipes';
import SearchBar from '@/components/SearchBar';
import RecipeCard from '@/components/RecipeCard';

export default function AddToCollectionScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [searchQuery, setSearchQuery] = useState('');
  const [availableRecipes, setAvailableRecipes] = useState<Recipe[]>([]);
  const [collectionRecipes, setCollectionRecipes] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState<string[]>([]);

  const { user } = useAuth();
  const { recipes } = useRecipes();

  useEffect(() => {
    if (id && user) {
      loadCollectionRecipes();
      loadAvailableRecipes();
    }
  }, [id, user]);

  const loadCollectionRecipes = async () => {
    try {
      console.log('📂 Loading existing collection recipes for collection:', id);
      
      const collectionRecipesQuery = query(
        collection(db, 'collection_recipes'),
        where('collection_id', '==', id)
      );
      
      const snapshot = await getDocs(collectionRecipesQuery);
      const recipeIds = snapshot.docs.map(doc => doc.data().recipe_id);
      setCollectionRecipes(recipeIds);
      
      console.log('📋 Found', recipeIds.length, 'recipes already in collection');
    } catch (error) {
      console.error('❌ Error loading collection recipes:', error);
    }
  };

  const loadAvailableRecipes = async () => {
    try {
      setLoading(true);
      console.log('🔍 Loading available recipes for user:', user?.uid);
      
      // Get user's recipes and public recipes
      const userRecipesQuery = query(
        collection(db, 'recipes'),
        where('author_id', '==', user?.uid),
        orderBy('created_at', 'desc')
      );
      
      const publicRecipesQuery = query(
        collection(db, 'recipes'),
        where('is_public', '==', true),
        orderBy('created_at', 'desc')
      );
      
      const [userSnapshot, publicSnapshot] = await Promise.all([
        getDocs(userRecipesQuery),
        getDocs(publicRecipesQuery)
      ]);
      
      const userRecipes = await Promise.all(
        userSnapshot.docs.map(async (recipeDoc) => {
          const recipeData = { id: recipeDoc.id, ...recipeDoc.data() } as Recipe;
          
          // Add author info for user's own recipes
          if (user) {
            const authorDoc = await getDoc(doc(db, 'profiles', user.uid));
            if (authorDoc.exists()) {
              const authorData = authorDoc.data();
              recipeData.author = {
                id: authorData.id,
                name: authorData.name,
                username: authorData.username,
                avatar_url: authorData.avatar_url,
              };
            }
          }
          
          return recipeData;
        })
      );
      
      const publicRecipes = await Promise.all(
        publicSnapshot.docs.map(async (recipeDoc) => {
          const recipeData = { id: recipeDoc.id, ...recipeDoc.data() } as Recipe;
          
          // Add author info for public recipes
          try {
            const authorDoc = await getDoc(doc(db, 'profiles', recipeData.author_id));
            if (authorDoc.exists()) {
              const authorData = authorDoc.data();
              recipeData.author = {
                id: authorData.id,
                name: authorData.name,
                username: authorData.username,
                avatar_url: authorData.avatar_url,
              };
            }
          } catch (error) {
            console.error('Error fetching author for recipe:', recipeData.id, error);
          }
          
          return recipeData;
        })
      );
      
      // Combine and deduplicate
      const allRecipes = [...userRecipes];
      publicRecipes.forEach(recipe => {
        if (!allRecipes.find(r => r.id === recipe.id)) {
          allRecipes.push(recipe);
        }
      });
      
      setAvailableRecipes(allRecipes);
      console.log('✅ Loaded', allRecipes.length, 'available recipes');
    } catch (error) {
      console.error('❌ Error loading available recipes:', error);
      setAvailableRecipes([]);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    router.back();
  };

  const addToCollection = async (recipeId: string) => {
    if (!user || adding.includes(recipeId)) return;

    setAdding(prev => [...prev, recipeId]);

    try {
      console.log('➕ Adding recipe', recipeId, 'to collection', id);
      
      await addDoc(collection(db, 'collection_recipes'), {
        collection_id: id,
        recipe_id: recipeId,
        user_id: user.uid, // Important for Firestore security rules
        added_at: new Date().toISOString(),
      });

      setCollectionRecipes(prev => [...prev, recipeId]);
      Alert.alert('Success', 'Recipe added to collection!');
      console.log('✅ Recipe added to collection successfully');
    } catch (error) {
      console.error('❌ Error adding recipe to collection:', error);
      Alert.alert('Error', 'Failed to add recipe to collection');
    } finally {
      setAdding(prev => prev.filter(id => id !== recipeId));
    }
  };

  const filteredRecipes = availableRecipes.filter(recipe => {
    const matchesSearch = recipe.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         recipe.description.toLowerCase().includes(searchQuery.toLowerCase());
    const notInCollection = !collectionRecipes.includes(recipe.id);
    return matchesSearch && notInCollection;
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerButton} onPress={handleBack}>
          <ArrowLeft size={24} color="#1E293B" />
        </TouchableOpacity>
        <Text style={styles.title}>Add Recipes</Text>
        <View style={styles.placeholder} />
      </View>

      <SearchBar
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder="Search recipes to add..."
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading recipes...</Text>
          </View>
        ) : filteredRecipes.length > 0 ? (
          filteredRecipes.map((recipe) => (
            <View key={recipe.id} style={styles.recipeContainer}>
              <RecipeCard
                recipe={recipe}
                onPress={() => router.push(`/recipe/${recipe.id}`)}
                onBookmark={() => {}}
                onLike={() => {}}
              />
              <TouchableOpacity 
                style={[
                  styles.addButton,
                  adding.includes(recipe.id) && styles.addButtonDisabled
                ]}
                onPress={() => addToCollection(recipe.id)}
                disabled={adding.includes(recipe.id)}
              >
                <Plus size={20} color="#FFFFFF" />
                <Text style={styles.addButtonText}>
                  {adding.includes(recipe.id) ? 'Adding...' : 'Add'}
                </Text>
              </TouchableOpacity>
            </View>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Search size={48} color="#94A3B8" />
            <Text style={styles.emptyTitle}>No recipes found</Text>
            <Text style={styles.emptyText}>
              {searchQuery 
                ? 'Try different search terms or browse all recipes'
                : 'All your recipes are already in this collection'
              }
            </Text>
          </View>
        )}

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
  },
  placeholder: {
    width: 40,
  },
  content: {
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
  recipeContainer: {
    position: 'relative',
  },
  addButton: {
    position: 'absolute',
    top: 20,
    right: 28,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4ECDC4',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 4,
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  addButtonDisabled: {
    opacity: 0.6,
  },
  addButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
    paddingHorizontal: 32,
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
    lineHeight: 20,
  },
  bottomPadding: {
    height: 80,
  },
});