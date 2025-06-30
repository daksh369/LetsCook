import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, SafeAreaView, TouchableOpacity, RefreshControl } from 'react-native';
import { ArrowLeft, Plus, Folder } from 'lucide-react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { 
  collection, 
  getDocs, 
  doc, 
  getDoc, 
  query, 
  where, 
  orderBy
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import RecipeCard from '@/components/RecipeCard';
import { useRecipes, Recipe } from '@/hooks/useRecipes';

interface Collection {
  id: string;
  user_id: string;
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

  useEffect(() => {
    if (id) {
      loadCollection();
    }
  }, [id]);

  const loadCollection = async () => {
    try {
      setLoading(true);
      
      // Load collection details
      const collectionDoc = await getDoc(doc(db, 'collections', id));
      if (!collectionDoc.exists()) {
        router.back();
        return;
      }
      
      const collectionData = { id: collectionDoc.id, ...collectionDoc.data() } as Collection;
      setCollection(collectionData);
      
      // Load recipes in this collection
      const collectionRecipesQuery = query(
        collection(db, 'collection_recipes'),
        where('collection_id', '==', id),
        orderBy('added_at', 'desc')
      );
      
      const collectionRecipesSnapshot = await getDocs(collectionRecipesQuery);
      const recipeIds = collectionRecipesSnapshot.docs.map(doc => doc.data().recipe_id);
      
      if (recipeIds.length === 0) {
        setCollectionRecipes([]);
        setLoading(false);
        return;
      }
      
      // Fetch actual recipe data
      const recipes: Recipe[] = [];
      for (const recipeId of recipeIds) {
        try {
          const recipeDoc = await getDoc(doc(db, 'recipes', recipeId));
          if (recipeDoc.exists()) {
            const recipeData = { id: recipeDoc.id, ...recipeDoc.data() } as Recipe;
            
            // Fetch author profile
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
            
            recipes.push(recipeData);
          }
        } catch (error) {
          console.error('Error fetching recipe:', recipeId, error);
        }
      }
      
      setCollectionRecipes(recipes);
    } catch (error) {
      console.error('Error loading collection:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    router.back();
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
            {collectionRecipes.length} recipe{collectionRecipes.length !== 1 ? 's' : ''}
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