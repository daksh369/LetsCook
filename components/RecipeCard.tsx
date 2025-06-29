import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Clock, Users, Star, Bookmark, Heart } from 'lucide-react-native';
import { Recipe } from '@/hooks/useRecipes';

interface RecipeCardProps {
  recipe: Recipe;
  onPress?: () => void;
  onBookmark?: () => void;
  onLike?: () => void;
}

export default function RecipeCard({ recipe, onPress, onBookmark, onLike }: RecipeCardProps) {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.9}>
      <View style={styles.imageContainer}>
        <Image 
          source={{ 
            uri: recipe.image_url || 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=600' 
          }} 
          style={styles.image} 
        />
        <TouchableOpacity style={styles.bookmarkButton} onPress={onBookmark}>
          <Bookmark
            size={20}
            color={recipe.isBookmarked ? '#FF6B35' : '#FFFFFF'}
            fill={recipe.isBookmarked ? '#FF6B35' : 'transparent'}
          />
        </TouchableOpacity>
        <View style={styles.difficultyBadge}>
          <Text style={styles.difficultyText}>{recipe.difficulty}</Text>
        </View>
      </View>
      
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={2}>{recipe.title}</Text>
        <Text style={styles.description} numberOfLines={2}>{recipe.description}</Text>
        
        {recipe.author && (
          <View style={styles.authorInfo}>
            <Image 
              source={{ 
                uri: recipe.author.avatar_url || 'https://images.pexels.com/photos/3778876/pexels-photo-3778876.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop' 
              }} 
              style={styles.authorAvatar} 
            />
            <Text style={styles.authorName}>by {recipe.author.name}</Text>
          </View>
        )}
        
        <View style={styles.metadata}>
          <View style={styles.metadataItem}>
            <Clock size={16} color="#64748B" />
            <Text style={styles.metadataText}>{recipe.cook_time}m</Text>
          </View>
          <View style={styles.metadataItem}>
            <Users size={16} color="#64748B" />
            <Text style={styles.metadataText}>{recipe.servings}</Text>
          </View>
          <View style={styles.metadataItem}>
            <Star size={16} color="#FFB800" fill="#FFB800" />
            <Text style={styles.metadataText}>{recipe.rating}</Text>
            <Text style={styles.reviewCount}>({recipe.reviews_count})</Text>
          </View>
        </View>
        
        <View style={styles.tags}>
          {recipe.dietary_info.slice(0, 2).map((tag, index) => (
            <View key={index} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>
        
        <View style={styles.actions}>
          <TouchableOpacity style={styles.likeButton} onPress={onLike}>
            <Heart 
              size={20} 
              color={recipe.isLiked ? '#FF6B35' : '#64748B'} 
              fill={recipe.isLiked ? '#FF6B35' : 'transparent'}
            />
            <Text style={[styles.actionText, recipe.isLiked && styles.actionTextActive]}>
              {recipe.isLiked ? 'Liked' : 'Like'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.shareButton}>
            <Text style={styles.shareText}>View Recipe</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  imageContainer: {
    position: 'relative',
    height: 200,
  },
  image: {
    width: '100%',
    height: '100%',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  bookmarkButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 20,
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  difficultyBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  difficultyText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontFamily: 'Inter-Medium',
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#1E293B',
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
    lineHeight: 20,
    marginBottom: 12,
  },
  authorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  authorAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 8,
  },
  authorName: {
    fontSize: 13,
    fontFamily: 'Inter-Medium',
    color: '#64748B',
  },
  metadata: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  metadataItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  metadataText: {
    fontSize: 13,
    fontFamily: 'Inter-Medium',
    color: '#64748B',
    marginLeft: 4,
  },
  reviewCount: {
    fontSize: 13,
    fontFamily: 'Inter-Regular',
    color: '#94A3B8',
    marginLeft: 2,
  },
  tags: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  tag: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 6,
  },
  tagText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#475569',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  likeButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#64748B',
    marginLeft: 6,
  },
  actionTextActive: {
    color: '#FF6B35',
  },
  shareButton: {
    backgroundColor: '#FF6B35',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  shareText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
});