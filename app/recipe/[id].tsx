import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, SafeAreaView, TouchableOpacity, Image, Alert } from 'react-native';
import { ArrowLeft, Clock, Users, Star, Bookmark, Heart, Share, ChefHat, Check, ChevronUp, ChevronDown, MessageSquare } from 'lucide-react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { Recipe, useRecipes } from '@/hooks/useRecipes';
import * as Sharing from 'expo-sharing';

export default function RecipeDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [cookMode, setCookMode] = useState(false);
  const [ingredientsMode, setIngredientsMode] = useState(false);
  const [checkedIngredients, setCheckedIngredients] = useState<boolean[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const { user } = useAuth();
  const { toggleLike, toggleBookmark } = useRecipes();

  useEffect(() => {
    if (id) {
      fetchRecipe();
    }
  }, [id]);

  const fetchRecipe = async () => {
    try {
      setLoading(true);
      
      const recipeDoc = await getDoc(doc(db, 'recipes', id));
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
        
        setRecipe(recipeData);
        // Initialize ingredients checklist
        setCheckedIngredients(new Array(recipeData.ingredients.length).fill(false));
      }
    } catch (error) {
      console.error('Error fetching recipe:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    if (!recipe || !user) return;
    
    // Optimistically update UI
    setRecipe(prev => prev ? { ...prev, isLiked: !prev.isLiked } : null);
    
    // Update in database
    await toggleLike(recipe.id);
  };

  const handleBookmark = async () => {
    if (!recipe || !user) return;
    
    // Optimistically update UI
    setRecipe(prev => prev ? { ...prev, isBookmarked: !prev.isBookmarked } : null);
    
    // Update in database
    await toggleBookmark(recipe.id);
  };

  const handleShare = async () => {
    if (!recipe) return;
    
    try {
      const shareUrl = `https://letscook.app/recipe/${recipe.id}`;
      const message = `Check out this amazing recipe: ${recipe.title} by ${recipe.author?.name}\n\n${shareUrl}`;

      if (await Sharing.isAvailableAsync()) {
        // For mobile platforms, use native sharing
        router.push(`/share/${recipe.id}`);
      } else {
        // For web, copy to clipboard
        Alert.alert('Share Recipe', message);
      }
    } catch (error) {
      console.error('Error sharing recipe:', error);
      Alert.alert('Error', 'Failed to share recipe');
    }
  };

  const handleViewReviews = () => {
    if (!recipe) return;
    router.push(`/reviews/${recipe.id}`);
  };

  const toggleIngredient = (index: number) => {
    const newChecked = [...checkedIngredients];
    newChecked[index] = !newChecked[index];
    setCheckedIngredients(newChecked);
  };

  const allIngredientsChecked = checkedIngredients.every(checked => checked);

  const startCooking = () => {
    setIngredientsMode(true);
    setCookMode(true);
  };

  const proceedToSteps = () => {
    setIngredientsMode(false);
    setCurrentStep(0);
  };

  const nextStep = () => {
    if (currentStep < recipe!.instructions.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const exitCookMode = () => {
    setCookMode(false);
    setIngredientsMode(false);
    setCurrentStep(0);
    setCheckedIngredients(new Array(recipe?.ingredients.length || 0).fill(false));
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading recipe...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!recipe) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Recipe not found</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Ingredients Collection Mode
  if (cookMode && ingredientsMode) {
    return (
      <SafeAreaView style={styles.fullScreenContainer}>
        <View style={styles.cookModeHeader}>
          <TouchableOpacity onPress={exitCookMode}>
            <ArrowLeft size={24} color="#1E293B" />
          </TouchableOpacity>
          <Text style={styles.cookModeTitle}>Collect Ingredients</Text>
          <Text style={styles.ingredientProgress}>
            {checkedIngredients.filter(Boolean).length} / {recipe.ingredients.length}
          </Text>
        </View>

        <ScrollView style={styles.ingredientsContent}>
          <View style={styles.ingredientsHeader}>
            <Text style={styles.ingredientsTitle}>Gather these ingredients:</Text>
            <Text style={styles.ingredientsSubtitle}>Check them off as you collect them</Text>
          </View>

          <View style={styles.ingredientsList}>
            {recipe.ingredients.map((ingredient, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.ingredientCheckItem,
                  checkedIngredients[index] && styles.ingredientChecked
                ]}
                onPress={() => toggleIngredient(index)}
              >
                <View style={[
                  styles.checkbox,
                  checkedIngredients[index] && styles.checkboxChecked
                ]}>
                  {checkedIngredients[index] && (
                    <Check size={16} color="#FFFFFF" />
                  )}
                </View>
                <Text style={[
                  styles.ingredientCheckText,
                  checkedIngredients[index] && styles.ingredientCheckTextDone
                ]}>
                  {ingredient}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity 
            style={[
              styles.proceedButton,
              !allIngredientsChecked && styles.proceedButtonDisabled
            ]}
            onPress={proceedToSteps}
            disabled={!allIngredientsChecked}
          >
            <Text style={styles.proceedButtonText}>
              {allIngredientsChecked ? 'Start Cooking!' : 'Check all ingredients to continue'}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Cooking Steps Mode - Timeline Design
  if (cookMode && !ingredientsMode) {
    return (
      <SafeAreaView style={styles.fullScreenContainer}>
        <View style={styles.cookModeHeader}>
          <TouchableOpacity onPress={exitCookMode}>
            <ArrowLeft size={24} color="#1E293B" />
          </TouchableOpacity>
          <Text style={styles.cookModeTitle}>Cooking Steps</Text>
          <Text style={styles.stepCounter}>
            {currentStep + 1} / {recipe.instructions.length}
          </Text>
        </View>

        <ScrollView style={styles.timelineContent} showsVerticalScrollIndicator={false}>
          <View style={styles.timelineSteps}>
            {recipe.instructions.map((instruction, index) => {
              const isCurrent = index === currentStep;
              const isPast = index < currentStep;
              const isFuture = index > currentStep;
              
              return (
                <View key={index} style={styles.timelineStep}>
                  {/* Timeline Line */}
                  <View style={styles.timelineLine}>
                    {index > 0 && (
                      <View style={[
                        styles.lineSegment,
                        styles.lineTop,
                        isPast && styles.lineCompleted
                      ]} />
                    )}
                    
                    {/* Step Circle */}
                    <View style={[
                      styles.stepCircle,
                      isPast && styles.stepCircleCompleted,
                      isCurrent && styles.stepCircleCurrent,
                      isFuture && styles.stepCircleFuture
                    ]}>
                      {isPast ? (
                        <Check size={16} color="#FFFFFF" />
                      ) : (
                        <Text style={[
                          styles.stepCircleText,
                          isCurrent && styles.stepCircleTextCurrent,
                          isFuture && styles.stepCircleTextFuture
                        ]}>
                          {index + 1}
                        </Text>
                      )}
                    </View>
                    
                    {index < recipe.instructions.length - 1 && (
                      <View style={[
                        styles.lineSegment,
                        styles.lineBottom,
                        isPast && styles.lineCompleted
                      ]} />
                    )}
                  </View>

                  {/* Step Content */}
                  <View style={[
                    styles.stepContent,
                    isCurrent && styles.stepContentCurrent,
                    isFuture && styles.stepContentFuture
                  ]}>
                    <Text style={[
                      styles.stepTitle,
                      isCurrent && styles.stepTitleCurrent,
                      isFuture && styles.stepTitleFuture
                    ]}>
                      Step {index + 1}
                    </Text>
                    <Text style={[
                      styles.stepText,
                      isCurrent && styles.stepTextCurrent,
                      isFuture && styles.stepTextFuture
                    ]}>
                      {instruction}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        </ScrollView>

        {/* Navigation Controls */}
        <View style={styles.navigationControls}>
          <TouchableOpacity 
            style={[
              styles.navButton,
              styles.prevButton,
              currentStep === 0 && styles.navButtonDisabled
            ]}
            onPress={prevStep}
            disabled={currentStep === 0}
          >
            <ChevronUp size={24} color={currentStep === 0 ? "#94A3B8" : "#64748B"} />
            <Text style={[
              styles.navButtonText,
              styles.navButtonTextGrey,
              currentStep === 0 && styles.navButtonTextDisabled
            ]}>
              Previous
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.navButton,
              styles.nextButton,
              currentStep === recipe.instructions.length - 1 && styles.completeButton
            ]}
            onPress={currentStep === recipe.instructions.length - 1 ? exitCookMode : nextStep}
          >
            <ChevronDown size={24} color="#FFFFFF" />
            <Text style={styles.navButtonTextWhite}>
              {currentStep === recipe.instructions.length - 1 ? 'Complete!' : 'Next'}
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Regular Recipe View
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header Image */}
        <View style={styles.imageContainer}>
          {recipe.image_url && (
            <Image source={{ uri: recipe.image_url }} style={styles.heroImage} />
          )}
          <TouchableOpacity style={styles.backButtonOverlay} onPress={() => router.back()}>
            <ArrowLeft size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <View style={styles.imageActions}>
            <TouchableOpacity style={styles.actionButton} onPress={handleBookmark}>
              <Bookmark 
                size={20} 
                color={recipe.isBookmarked ? "#FF6B35" : "#FFFFFF"}
                fill={recipe.isBookmarked ? "#FF6B35" : "transparent"}
              />
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
              <Share size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
          <View style={styles.difficultyBadge}>
            <Text style={styles.difficultyText}>{recipe.difficulty}</Text>
          </View>
        </View>

        {/* Recipe Info */}
        <View style={styles.recipeInfo}>
          <Text style={styles.recipeTitle}>{recipe.title}</Text>
          <Text style={styles.recipeDescription}>{recipe.description}</Text>
          
          {recipe.author && (
            <View style={styles.authorInfo}>
              <Image 
                source={{ 
                  uri: recipe.author.avatar_url || 'https://images.pexels.com/photos/3778876/pexels-photo-3778876.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop' 
                }} 
                style={styles.authorAvatar} 
              />
              <View style={styles.authorDetails}>
                <Text style={styles.authorName}>by {recipe.author.name}</Text>
                <Text style={styles.authorUsername}>@{recipe.author.username}</Text>
              </View>
            </View>
          )}
          
          <View style={styles.metadata}>
            <View style={styles.metadataItem}>
              <Clock size={20} color="#64748B" />
              <Text style={styles.metadataText}>{recipe.cook_time} min</Text>
            </View>
            <View style={styles.metadataItem}>
              <Users size={20} color="#64748B" />
              <Text style={styles.metadataText}>{recipe.servings} servings</Text>
            </View>
            <TouchableOpacity style={styles.metadataItem} onPress={handleViewReviews}>
              <Star size={20} color="#FFB800" fill="#FFB800" />
              <Text style={styles.metadataText}>{recipe.rating}</Text>
              <Text style={styles.reviewCount}>({recipe.reviews_count})</Text>
            </TouchableOpacity>
            <View style={styles.metadataItem}>
              <ChefHat size={20} color="#FF6B35" />
              <Text style={styles.metadataText}>{recipe.difficulty}</Text>
            </View>
          </View>
          
          <View style={styles.tags}>
            {recipe.dietary_info.map((tag, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={[
              styles.likeButton,
              recipe.isLiked && styles.likeButtonActive
            ]} 
            onPress={handleLike}
          >
            <Heart 
              size={20} 
              color={recipe.isLiked ? "#FFFFFF" : "#FF6B35"} 
              fill={recipe.isLiked ? "#FF6B35" : "transparent"}
            />
            <Text style={[
              styles.likeButtonText,
              recipe.isLiked && styles.likeButtonTextActive
            ]}>
              {recipe.isLiked ? 'Liked' : 'Like'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.reviewsButton} onPress={handleViewReviews}>
            <MessageSquare size={20} color="#4ECDC4" />
            <Text style={styles.reviewsButtonText}>Reviews</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.cookButton} onPress={startCooking}>
            <ChefHat size={20} color="#FFFFFF" />
            <Text style={styles.cookButtonText}>Start Cooking</Text>
          </TouchableOpacity>
        </View>

        {/* Ingredients */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ingredients</Text>
          {recipe.ingredients.map((ingredient, index) => (
            <View key={index} style={styles.ingredientItem}>
              <View style={styles.ingredientBullet} />
              <Text style={styles.ingredientText}>{ingredient}</Text>
            </View>
          ))}
        </View>

        {/* Instructions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Instructions</Text>
          {recipe.instructions.map((instruction, index) => (
            <View key={index} style={styles.instructionItem}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>{index + 1}</Text>
              </View>
              <Text style={styles.instructionText}>{instruction}</Text>
            </View>
          ))}
        </View>

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
  fullScreenContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
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
  content: {
    flex: 1,
  },
  bottomPadding: {
    height: 80, // Account for tab bar
  },
  imageContainer: {
    position: 'relative',
    height: 300,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  backButtonOverlay: {
    position: 'absolute',
    top: 16,
    left: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
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
  imageActions: {
    position: 'absolute',
    top: 16,
    right: 16,
    flexDirection: 'row',
  },
  actionButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  difficultyBadge: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  difficultyText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'Inter-Medium',
  },
  recipeInfo: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    marginBottom: 8,
  },
  recipeTitle: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#1E293B',
    marginBottom: 8,
  },
  recipeDescription: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
    lineHeight: 24,
    marginBottom: 16,
  },
  authorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  authorAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  authorDetails: {
    flex: 1,
  },
  authorName: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1E293B',
  },
  authorUsername: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
  },
  metadata: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  metadataItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
    marginBottom: 8,
  },
  metadataText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#64748B',
    marginLeft: 6,
  },
  reviewCount: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#94A3B8',
    marginLeft: 2,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    fontSize: 13,
    fontFamily: 'Inter-Medium',
    color: '#475569',
  },
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    marginBottom: 8,
    gap: 8,
  },
  likeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#FF6B35',
    backgroundColor: '#FFFFFF',
  },
  likeButtonActive: {
    backgroundColor: '#FF6B35',
  },
  likeButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#FF6B35',
    marginLeft: 8,
  },
  likeButtonTextActive: {
    color: '#FFFFFF',
  },
  reviewsButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#4ECDC4',
    backgroundColor: '#FFFFFF',
  },
  reviewsButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#4ECDC4',
    marginLeft: 8,
  },
  cookButton: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#FF6B35',
  },
  cookButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  section: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#1E293B',
    marginBottom: 16,
  },
  ingredientItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  ingredientBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FF6B35',
    marginRight: 12,
  },
  ingredientText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#1E293B',
    flex: 1,
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FF6B35',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    marginTop: 2,
  },
  stepNumberText: {
    fontSize: 14,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF',
  },
  instructionText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#1E293B',
    flex: 1,
    lineHeight: 24,
  },

  // Cook Mode Styles
  cookModeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  cookModeTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#1E293B',
  },
  stepCounter: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FF6B35',
  },
  ingredientProgress: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#4ECDC4',
  },

  // Ingredients Collection Mode
  ingredientsContent: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  ingredientsHeader: {
    padding: 24,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  ingredientsTitle: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#1E293B',
    marginBottom: 8,
  },
  ingredientsSubtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
    textAlign: 'center',
  },
  ingredientsList: {
    padding: 20,
  },
  ingredientCheckItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  ingredientChecked: {
    backgroundColor: '#F0FDF4',
    borderColor: '#4ECDC4',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    marginRight: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#4ECDC4',
    borderColor: '#4ECDC4',
  },
  ingredientCheckText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#1E293B',
    flex: 1,
  },
  ingredientCheckTextDone: {
    textDecorationLine: 'line-through',
    color: '#64748B',
  },
  proceedButton: {
    backgroundColor: '#FF6B35',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 20,
    marginVertical: 24,
  },
  proceedButtonDisabled: {
    backgroundColor: '#94A3B8',
  },
  proceedButtonText: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },

  // Timeline Design Styles
  timelineContent: {
    flex: 1,
    paddingHorizontal: 24,
  },
  timelineSteps: {
    paddingVertical: 32,
  },
  timelineStep: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  timelineLine: {
    alignItems: 'center',
    width: 40,
    marginRight: 20,
  },
  lineSegment: {
    width: 2,
    height: 40,
    backgroundColor: '#E2E8F0',
  },
  lineTop: {
    marginBottom: -2,
  },
  lineBottom: {
    marginTop: -2,
  },
  lineCompleted: {
    backgroundColor: '#4ECDC4',
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    borderWidth: 2,
    borderColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  stepCircleCompleted: {
    backgroundColor: '#4ECDC4',
    borderColor: '#4ECDC4',
  },
  stepCircleCurrent: {
    backgroundColor: '#6366F1',
    borderColor: '#6366F1',
    transform: [{ scale: 1.2 }],
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  stepCircleFuture: {
    backgroundColor: '#F8FAFC',
    borderColor: '#E2E8F0',
  },
  stepCircleText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#64748B',
  },
  stepCircleTextCurrent: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  stepCircleTextFuture: {
    color: '#94A3B8',
  },
  stepContent: {
    flex: 1,
    paddingVertical: 4,
    paddingHorizontal: 16,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    opacity: 0.6,
  },
  stepContentCurrent: {
    backgroundColor: '#FFFFFF',
    borderColor: '#6366F1',
    borderWidth: 2,
    opacity: 1,
    transform: [{ scale: 1.02 }],
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  stepContentFuture: {
    opacity: 0.4,
  },
  stepTitle: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#64748B',
    marginBottom: 4,
  },
  stepTitleCurrent: {
    fontSize: 16,
    color: '#6366F1',
  },
  stepTitleFuture: {
    color: '#94A3B8',
  },
  stepText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
    lineHeight: 20,
  },
  stepTextCurrent: {
    fontSize: 16,
    color: '#1E293B',
    lineHeight: 24,
  },
  stepTextFuture: {
    color: '#94A3B8',
  },
  navigationControls: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingVertical: 20,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    gap: 16,
  },
  navButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    borderWidth: 2,
    borderColor: '#E2E8F0',
  },
  prevButton: {
    borderColor: '#E2E8F0',
  },
  nextButton: {
    backgroundColor: '#FF6B35',
    borderColor: '#FF6B35',
  },
  completeButton: {
    backgroundColor: '#4ECDC4',
    borderColor: '#4ECDC4',
  },
  navButtonDisabled: {
    opacity: 0.5,
    borderColor: '#E2E8F0',
  },
  navButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    marginLeft: 8,
  },
  navButtonTextGrey: {
    color: '#64748B',
  },
  navButtonTextWhite: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    marginLeft: 8,
  },
  navButtonTextDisabled: {
    color: '#94A3B8',
  },
});