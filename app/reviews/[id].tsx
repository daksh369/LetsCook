import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, SafeAreaView, TouchableOpacity, TextInput, Alert, Image } from 'react-native';
import { ArrowLeft, Star, Send, ThumbsUp, MessageCircle } from 'lucide-react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc, 
  query, 
  where, 
  orderBy,
  getDoc
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useRecipes, Recipe } from '@/hooks/useRecipes';
import { useAuth } from '@/contexts/AuthContext';

interface Review {
  id: string;
  user_id: string;
  recipe_id: string;
  user: {
    id: string;
    name: string;
    avatar_url?: string;
  };
  rating: number;
  comment: string;
  created_at: string;
  helpful_count: number;
  is_helpful?: boolean;
}

export default function ReviewsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [newRating, setNewRating] = useState(0);
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);

  const { getRecipeById } = useRecipes();
  const { user, profile } = useAuth();

  useEffect(() => {
    if (id) {
      loadRecipe();
      loadReviews();
    }
  }, [id]);

  const loadRecipe = async () => {
    try {
      const recipeData = await getRecipeById(id);
      setRecipe(recipeData);
    } catch (error) {
      console.error('Error loading recipe:', error);
      Alert.alert('Error', 'Failed to load recipe');
    }
  };

  const loadReviews = async () => {
    try {
      setLoading(true);
      
      const reviewsQuery = query(
        collection(db, 'recipe_reviews'),
        where('recipe_id', '==', id),
        orderBy('created_at', 'desc')
      );
      
      const reviewsSnapshot = await getDocs(reviewsQuery);
      const reviewsData = await Promise.all(
        reviewsSnapshot.docs.map(async (reviewDoc) => {
          const reviewData = { id: reviewDoc.id, ...reviewDoc.data() };
          
          // Fetch user profile for each review
          try {
            const userDoc = await getDoc(doc(db, 'profiles', reviewData.user_id));
            if (userDoc.exists()) {
              const userData = userDoc.data();
              reviewData.user = {
                id: userData.id,
                name: userData.name,
                avatar_url: userData.avatar_url,
              };
            }
          } catch (error) {
            console.error('Error fetching review user:', error);
          }
          
          // Check if current user found this review helpful
          if (user) {
            try {
              const helpfulQuery = query(
                collection(db, 'review_helpful'),
                where('user_id', '==', user.uid),
                where('review_id', '==', reviewData.id)
              );
              const helpfulSnapshot = await getDocs(helpfulQuery);
              reviewData.is_helpful = !helpfulSnapshot.empty;
            } catch (error) {
              console.error('Error checking helpful status:', error);
            }
          }
          
          return reviewData as Review;
        })
      );
      
      setReviews(reviewsData);
    } catch (error) {
      console.error('Error loading reviews:', error);
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    router.back();
  };

  const submitReview = async () => {
    if (!user || !profile) {
      Alert.alert('Error', 'Please log in to submit a review');
      return;
    }

    if (newRating === 0) {
      Alert.alert('Error', 'Please select a rating');
      return;
    }

    if (!newComment.trim()) {
      Alert.alert('Error', 'Please write a comment');
      return;
    }

    setSubmitting(true);

    try {
      // Add review to database
      const reviewData = {
        user_id: user.uid,
        recipe_id: id,
        rating: newRating,
        comment: newComment.trim(),
        helpful_count: 0,
        created_at: new Date().toISOString(),
      };

      const docRef = await addDoc(collection(db, 'recipe_reviews'), reviewData);
      
      // Update recipe's average rating and review count
      const recipeRef = doc(db, 'recipes', id);
      const recipeDoc = await getDoc(recipeRef);
      
      if (recipeDoc.exists()) {
        const currentData = recipeDoc.data();
        const currentRating = currentData.rating || 0;
        const currentCount = currentData.reviews_count || 0;
        
        const newCount = currentCount + 1;
        const newAvgRating = ((currentRating * currentCount) + newRating) / newCount;
        
        await updateDoc(recipeRef, {
          rating: Math.round(newAvgRating * 10) / 10, // Round to 1 decimal
          reviews_count: newCount,
          updated_at: new Date().toISOString(),
        });
      }

      // Add new review to local state
      const newReview: Review = {
        id: docRef.id,
        user_id: user.uid,
        recipe_id: id,
        user: {
          id: user.uid,
          name: profile.name,
          avatar_url: profile.avatar_url
        },
        rating: newRating,
        comment: newComment.trim(),
        created_at: new Date().toISOString(),
        helpful_count: 0,
        is_helpful: false
      };

      setReviews(prev => [newReview, ...prev]);
      setNewRating(0);
      setNewComment('');
      setShowReviewForm(false);
      
      Alert.alert('Success', 'Your review has been submitted!');
    } catch (error) {
      console.error('Error submitting review:', error);
      Alert.alert('Error', 'Failed to submit review. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleHelpful = async (reviewId: string) => {
    if (!user) return;

    try {
      const helpfulQuery = query(
        collection(db, 'review_helpful'),
        where('user_id', '==', user.uid),
        where('review_id', '==', reviewId)
      );
      
      const helpfulSnapshot = await getDocs(helpfulQuery);
      const isCurrentlyHelpful = !helpfulSnapshot.empty;
      
      if (isCurrentlyHelpful) {
        // Remove helpful
        const helpfulDoc = helpfulSnapshot.docs[0];
        await updateDoc(doc(db, 'review_helpful', helpfulDoc.id), {
          deleted: true
        });
      } else {
        // Add helpful
        await addDoc(collection(db, 'review_helpful'), {
          user_id: user.uid,
          review_id: reviewId,
          created_at: new Date().toISOString(),
        });
      }

      // Update local state
      setReviews(prev => 
        prev.map(review => 
          review.id === reviewId 
            ? { 
                ...review, 
                is_helpful: !review.is_helpful,
                helpful_count: review.is_helpful 
                  ? review.helpful_count - 1 
                  : review.helpful_count + 1
              }
            : review
        )
      );
    } catch (error) {
      console.error('Error toggling helpful:', error);
    }
  };

  const renderStars = (rating: number, size: number = 16, interactive: boolean = false) => {
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity
            key={star}
            disabled={!interactive}
            onPress={() => interactive && setNewRating(star)}
          >
            <Star
              size={size}
              color={star <= rating ? '#FFB800' : '#E2E8F0'}
              fill={star <= rating ? '#FFB800' : 'transparent'}
            />
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading reviews...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!recipe) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Recipe not found</Text>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const averageRating = reviews.length > 0 
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
    : 0;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerButton} onPress={handleBack}>
          <ArrowLeft size={24} color="#1E293B" />
        </TouchableOpacity>
        <Text style={styles.title}>Reviews</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Recipe Summary */}
        <View style={styles.recipeSummary}>
          <Text style={styles.recipeTitle}>{recipe.title}</Text>
          <View style={styles.ratingOverview}>
            {renderStars(Math.round(averageRating), 20)}
            <Text style={styles.averageRating}>
              {averageRating.toFixed(1)} ({reviews.length} reviews)
            </Text>
          </View>
        </View>

        {/* Add Review Button */}
        {user && (
          <View style={styles.addReviewSection}>
            <TouchableOpacity 
              style={styles.addReviewButton}
              onPress={() => setShowReviewForm(!showReviewForm)}
            >
              <MessageCircle size={20} color="#FFFFFF" />
              <Text style={styles.addReviewText}>Write a Review</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Review Form */}
        {showReviewForm && (
          <View style={styles.reviewForm}>
            <Text style={styles.formTitle}>Share Your Experience</Text>
            
            <View style={styles.ratingSection}>
              <Text style={styles.formLabel}>Rating</Text>
              {renderStars(newRating, 24, true)}
            </View>

            <View style={styles.commentSection}>
              <Text style={styles.formLabel}>Comment</Text>
              <TextInput
                style={styles.commentInput}
                value={newComment}
                onChangeText={setNewComment}
                placeholder="Tell others about your experience with this recipe..."
                placeholderTextColor="#94A3B8"
                multiline
                numberOfLines={4}
              />
            </View>

            <View style={styles.formActions}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => {
                  setShowReviewForm(false);
                  setNewRating(0);
                  setNewComment('');
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
                onPress={submitReview}
                disabled={submitting}
              >
                <Send size={16} color="#FFFFFF" />
                <Text style={styles.submitButtonText}>
                  {submitting ? 'Submitting...' : 'Submit Review'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Reviews List */}
        <View style={styles.reviewsList}>
          <Text style={styles.reviewsTitle}>All Reviews ({reviews.length})</Text>
          
          {reviews.map((review) => (
            <View key={review.id} style={styles.reviewItem}>
              <View style={styles.reviewHeader}>
                <Image 
                  source={{ 
                    uri: review.user?.avatar_url || 'https://images.pexels.com/photos/3778876/pexels-photo-3778876.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop' 
                  }} 
                  style={styles.reviewerAvatar} 
                />
                <View style={styles.reviewerInfo}>
                  <Text style={styles.reviewerName}>{review.user?.name || 'Anonymous'}</Text>
                  <View style={styles.reviewMeta}>
                    {renderStars(review.rating, 14)}
                    <Text style={styles.reviewDate}>{formatDate(review.created_at)}</Text>
                  </View>
                </View>
              </View>
              
              <Text style={styles.reviewComment}>{review.comment}</Text>
              
              <View style={styles.reviewActions}>
                <TouchableOpacity 
                  style={[
                    styles.helpfulButton,
                    review.is_helpful && styles.helpfulButtonActive
                  ]}
                  onPress={() => toggleHelpful(review.id)}
                >
                  <ThumbsUp 
                    size={16} 
                    color={review.is_helpful ? '#FFFFFF' : '#64748B'} 
                    fill={review.is_helpful ? '#4ECDC4' : 'transparent'}
                  />
                  <Text style={[
                    styles.helpfulText,
                    review.is_helpful && styles.helpfulTextActive
                  ]}>
                    Helpful ({review.helpful_count})
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
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
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  recipeSummary: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  recipeTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#1E293B',
    marginBottom: 12,
  },
  ratingOverview: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  averageRating: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#64748B',
  },
  starsContainer: {
    flexDirection: 'row',
    gap: 2,
  },
  addReviewSection: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  addReviewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF6B35',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  addReviewText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  reviewForm: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  formTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#1E293B',
    marginBottom: 20,
  },
  ratingSection: {
    marginBottom: 20,
  },
  formLabel: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#1E293B',
    marginBottom: 8,
  },
  commentSection: {
    marginBottom: 20,
  },
  commentInput: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#1E293B',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    textAlignVertical: 'top',
    minHeight: 100,
  },
  formActions: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#64748B',
  },
  submitButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF6B35',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  reviewsList: {
    backgroundColor: '#FFFFFF',
    padding: 20,
  },
  reviewsTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#1E293B',
    marginBottom: 20,
  },
  reviewItem: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  reviewerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  reviewerInfo: {
    flex: 1,
  },
  reviewerName: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1E293B',
    marginBottom: 4,
  },
  reviewMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  reviewDate: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#94A3B8',
  },
  reviewComment: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
    lineHeight: 20,
    marginBottom: 12,
  },
  reviewActions: {
    flexDirection: 'row',
  },
  helpfulButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
    gap: 6,
  },
  helpfulButtonActive: {
    backgroundColor: '#4ECDC4',
    borderColor: '#4ECDC4',
  },
  helpfulText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#64748B',
  },
  helpfulTextActive: {
    color: '#FFFFFF',
  },
  bottomPadding: {
    height: 80,
  },
});