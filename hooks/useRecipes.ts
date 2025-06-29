import { useState, useEffect } from 'react';
import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy,
  getDoc
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';

export interface Recipe {
  id: string;
  title: string;
  description: string;
  image_url?: string;
  cook_time: number;
  servings: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  rating: number;
  reviews_count: number;
  author_id: string;
  author?: {
    id: string;
    name: string;
    username: string;
    avatar_url?: string;
  };
  ingredients: string[];
  instructions: string[];
  tags: string[];
  dietary_info: string[];
  is_public: boolean;
  created_at: string;
  updated_at: string;
  isBookmarked?: boolean;
  isLiked?: boolean;
}

export function useRecipes() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [userRecipes, setUserRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchRecipes = async () => {
    try {
      setLoading(true);
      
      // Fetch public recipes
      const recipesQuery = query(
        collection(db, 'recipes'),
        where('is_public', '==', true),
        orderBy('created_at', 'desc')
      );
      
      const recipesSnapshot = await getDocs(recipesQuery);
      const recipesData = recipesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Recipe[];

      // Fetch author profiles for each recipe
      const recipesWithAuthors = await Promise.all(
        recipesData.map(async (recipe) => {
          try {
            const authorDoc = await getDoc(doc(db, 'profiles', recipe.author_id));
            if (authorDoc.exists()) {
              const authorData = authorDoc.data();
              return {
                ...recipe,
                author: {
                  id: authorData.id,
                  name: authorData.name,
                  username: authorData.username,
                  avatar_url: authorData.avatar_url,
                }
              };
            }
            return recipe;
          } catch (error) {
            console.error('Error fetching author:', error);
            return recipe;
          }
        })
      );

      // If user is logged in, check bookmarks and likes
      if (user) {
        const recipesWithInteractions = await Promise.all(
          recipesWithAuthors.map(async (recipe) => {
            try {
              // Check if bookmarked
              const bookmarkQuery = query(
                collection(db, 'recipe_bookmarks'),
                where('user_id', '==', user.uid),
                where('recipe_id', '==', recipe.id)
              );
              const bookmarkSnapshot = await getDocs(bookmarkQuery);
              const isBookmarked = !bookmarkSnapshot.empty;

              // Check if liked
              const likeQuery = query(
                collection(db, 'recipe_likes'),
                where('user_id', '==', user.uid),
                where('recipe_id', '==', recipe.id)
              );
              const likeSnapshot = await getDocs(likeQuery);
              const isLiked = !likeSnapshot.empty;

              return {
                ...recipe,
                isBookmarked,
                isLiked,
              };
            } catch (error) {
              console.error('Error checking interactions:', error);
              return recipe;
            }
          })
        );
        setRecipes(recipesWithInteractions);
      } else {
        setRecipes(recipesWithAuthors);
      }
    } catch (error) {
      console.error('Error fetching recipes:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserRecipes = async () => {
    if (!user) return;

    try {
      // Fetch user's recipes (both public and private)
      const userRecipesQuery = query(
        collection(db, 'recipes'),
        where('author_id', '==', user.uid),
        orderBy('created_at', 'desc')
      );
      
      const userRecipesSnapshot = await getDocs(userRecipesQuery);
      const userRecipesData = userRecipesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Recipe[];

      // Add author info (current user)
      const recipesWithAuthor = userRecipesData.map(recipe => ({
        ...recipe,
        author: {
          id: user.uid,
          name: user.displayName || 'You',
          username: user.email?.split('@')[0] || 'you',
          avatar_url: user.photoURL,
        }
      }));

      setUserRecipes(recipesWithAuthor);
    } catch (error) {
      console.error('Error fetching user recipes:', error);
    }
  };

  const createRecipe = async (recipeData: {
    title: string;
    description: string;
    image_url?: string;
    cook_time: number;
    servings: number;
    difficulty: 'Easy' | 'Medium' | 'Hard';
    ingredients: string[];
    instructions: string[];
    tags: string[];
    dietary_info: string[];
  }) => {
    if (!user) return { error: new Error('User not authenticated') };

    try {
      const recipe = {
        ...recipeData,
        author_id: user.uid,
        is_public: true,
        rating: 0,
        reviews_count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const docRef = await addDoc(collection(db, 'recipes'), recipe);
      
      // Update user's recipe count
      const userProfileRef = doc(db, 'profiles', user.uid);
      const userProfileDoc = await getDoc(userProfileRef);
      if (userProfileDoc.exists()) {
        const currentCount = userProfileDoc.data().recipes_count || 0;
        await updateDoc(userProfileRef, {
          recipes_count: currentCount + 1,
          updated_at: new Date().toISOString(),
        });
      }

      // Refresh both recipe lists
      await Promise.all([fetchRecipes(), fetchUserRecipes()]);
      return { data: { id: docRef.id, ...recipe }, error: null };
    } catch (error) {
      console.error('Error creating recipe:', error);
      return { error };
    }
  };

  const toggleBookmark = async (recipeId: string) => {
    if (!user) return;

    try {
      const bookmarkQuery = query(
        collection(db, 'recipe_bookmarks'),
        where('user_id', '==', user.uid),
        where('recipe_id', '==', recipeId)
      );
      
      const bookmarkSnapshot = await getDocs(bookmarkQuery);
      
      if (bookmarkSnapshot.empty) {
        // Add bookmark
        await addDoc(collection(db, 'recipe_bookmarks'), {
          user_id: user.uid,
          recipe_id: recipeId,
          created_at: new Date().toISOString(),
        });
      } else {
        // Remove bookmark
        const bookmarkDoc = bookmarkSnapshot.docs[0];
        await deleteDoc(doc(db, 'recipe_bookmarks', bookmarkDoc.id));
      }

      // Update local state
      setRecipes(prev => prev.map(recipe => 
        recipe.id === recipeId 
          ? { ...recipe, isBookmarked: !recipe.isBookmarked }
          : recipe
      ));
      
      setUserRecipes(prev => prev.map(recipe => 
        recipe.id === recipeId 
          ? { ...recipe, isBookmarked: !recipe.isBookmarked }
          : recipe
      ));
    } catch (error) {
      console.error('Error toggling bookmark:', error);
    }
  };

  const toggleLike = async (recipeId: string) => {
    if (!user) return;

    try {
      const likeQuery = query(
        collection(db, 'recipe_likes'),
        where('user_id', '==', user.uid),
        where('recipe_id', '==', recipeId)
      );
      
      const likeSnapshot = await getDocs(likeQuery);
      
      if (likeSnapshot.empty) {
        // Add like
        await addDoc(collection(db, 'recipe_likes'), {
          user_id: user.uid,
          recipe_id: recipeId,
          created_at: new Date().toISOString(),
        });
      } else {
        // Remove like
        const likeDoc = likeSnapshot.docs[0];
        await deleteDoc(doc(db, 'recipe_likes', likeDoc.id));
      }

      // Update local state
      setRecipes(prev => prev.map(recipe => 
        recipe.id === recipeId 
          ? { ...recipe, isLiked: !recipe.isLiked }
          : recipe
      ));
      
      setUserRecipes(prev => prev.map(recipe => 
        recipe.id === recipeId 
          ? { ...recipe, isLiked: !recipe.isLiked }
          : recipe
      ));
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const uploadImage = async (uri: string): Promise<string> => {
    try {
      const response = await fetch(uri);
      const blob = await response.blob();
      
      const filename = `recipes/${Date.now()}_${Math.random().toString(36).substring(7)}`;
      const imageRef = ref(storage, filename);
      
      await uploadBytes(imageRef, blob);
      const downloadURL = await getDownloadURL(imageRef);
      
      return downloadURL;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  };

  useEffect(() => {
    if (user) {
      Promise.all([fetchRecipes(), fetchUserRecipes()]);
    } else {
      fetchRecipes();
    }
  }, [user]);

  return {
    recipes,
    userRecipes,
    loading,
    fetchRecipes,
    fetchUserRecipes,
    createRecipe,
    toggleBookmark,
    toggleLike,
    uploadImage,
  };
}