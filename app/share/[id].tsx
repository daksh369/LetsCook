import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Share, Alert, Image } from 'react-native';
import { ArrowLeft, Share2, Copy, Download, MessageCircle, Instagram, Facebook, Twitter } from 'lucide-react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useRecipes, Recipe } from '@/hooks/useRecipes';
import * as Clipboard from 'expo-clipboard';

export default function ShareRecipeScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const { getRecipeById } = useRecipes();

  useEffect(() => {
    if (id) {
      loadRecipe();
    }
  }, [id]);

  const loadRecipe = async () => {
    try {
      const recipeData = await getRecipeById(id);
      setRecipe(recipeData);
    } catch (error) {
      console.error('Error loading recipe:', error);
      Alert.alert('Error', 'Failed to load recipe');
    } finally {
      setLoading(false);
    }
  };

  const shareRecipe = async () => {
    if (!recipe) return;

    try {
      const shareUrl = `https://letscook.app/recipe/${recipe.id}`;
      const message = `Check out this amazing recipe: ${recipe.title} by ${recipe.author?.name}\n\n${shareUrl}`;

      await Share.share({
        message,
        url: shareUrl,
        title: recipe.title,
      });
    } catch (error) {
      console.error('Error sharing recipe:', error);
    }
  };

  const copyLink = async () => {
    if (!recipe) return;

    const shareUrl = `https://letscook.app/recipe/${recipe.id}`;
    await Clipboard.setStringAsync(shareUrl);
    Alert.alert('Copied!', 'Recipe link copied to clipboard');
  };

  const shareToSocial = (platform: string) => {
    if (!recipe) return;

    const shareUrl = `https://letscook.app/recipe/${recipe.id}`;
    const text = `Check out this amazing recipe: ${recipe.title}`;
    
    let url = '';
    switch (platform) {
      case 'twitter':
        url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`;
        break;
      case 'facebook':
        url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
        break;
      case 'instagram':
        Alert.alert('Instagram', 'Please share manually on Instagram');
        return;
    }

    if (url) {
      // In a real app, you would open the URL in a browser
      Alert.alert('Share', `Would open: ${url}`);
    }
  };

  const downloadRecipe = () => {
    if (!recipe) return;
    Alert.alert('Coming Soon', 'Recipe download will be available soon!');
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
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

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color="#1E293B" />
        </TouchableOpacity>
        <Text style={styles.title}>Share Recipe</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.content}>
        {/* Recipe Preview */}
        <View style={styles.recipePreview}>
          {recipe.image_url && (
            <Image source={{ uri: recipe.image_url }} style={styles.recipeImage} />
          )}
          <View style={styles.recipeInfo}>
            <Text style={styles.recipeTitle}>{recipe.title}</Text>
            <Text style={styles.recipeAuthor}>by {recipe.author?.name}</Text>
            <Text style={styles.recipeDescription} numberOfLines={2}>
              {recipe.description}
            </Text>
          </View>
        </View>

        {/* Share Options */}
        <View style={styles.shareOptions}>
          <Text style={styles.sectionTitle}>Share Options</Text>
          
          <TouchableOpacity style={styles.shareOption} onPress={shareRecipe}>
            <View style={styles.shareIcon}>
              <Share2 size={24} color="#3B82F6" />
            </View>
            <View style={styles.shareContent}>
              <Text style={styles.shareTitle}>Share via...</Text>
              <Text style={styles.shareSubtitle}>Use your device's share menu</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.shareOption} onPress={copyLink}>
            <View style={styles.shareIcon}>
              <Copy size={24} color="#10B981" />
            </View>
            <View style={styles.shareContent}>
              <Text style={styles.shareTitle}>Copy Link</Text>
              <Text style={styles.shareSubtitle}>Copy recipe link to clipboard</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.shareOption} onPress={downloadRecipe}>
            <View style={styles.shareIcon}>
              <Download size={24} color="#F59E0B" />
            </View>
            <View style={styles.shareContent}>
              <Text style={styles.shareTitle}>Download Recipe</Text>
              <Text style={styles.shareSubtitle}>Save as PDF or image</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Social Media */}
        <View style={styles.socialMedia}>
          <Text style={styles.sectionTitle}>Social Media</Text>
          
          <View style={styles.socialButtons}>
            <TouchableOpacity 
              style={[styles.socialButton, styles.twitterButton]}
              onPress={() => shareToSocial('twitter')}
            >
              <Twitter size={24} color="#FFFFFF" />
              <Text style={styles.socialButtonText}>Twitter</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.socialButton, styles.facebookButton]}
              onPress={() => shareToSocial('facebook')}
            >
              <Facebook size={24} color="#FFFFFF" />
              <Text style={styles.socialButtonText}>Facebook</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.socialButton, styles.instagramButton]}
              onPress={() => shareToSocial('instagram')}
            >
              <Instagram size={24} color="#FFFFFF" />
              <Text style={styles.socialButtonText}>Instagram</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Message Sharing */}
        <View style={styles.messageSharing}>
          <Text style={styles.sectionTitle}>Send Directly</Text>
          
          <TouchableOpacity style={styles.shareOption}>
            <View style={styles.shareIcon}>
              <MessageCircle size={24} color="#8B5CF6" />
            </View>
            <View style={styles.shareContent}>
              <Text style={styles.shareTitle}>Send Message</Text>
              <Text style={styles.shareSubtitle}>Share via text or messaging apps</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
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
    padding: 16,
  },
  recipePreview: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  recipeImage: {
    width: '100%',
    height: 120,
    borderRadius: 12,
    marginBottom: 12,
  },
  recipeInfo: {
    gap: 4,
  },
  recipeTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#1E293B',
  },
  recipeAuthor: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#64748B',
  },
  recipeDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
    lineHeight: 20,
  },
  shareOptions: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#1E293B',
    marginBottom: 16,
  },
  shareOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  shareIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  shareContent: {
    flex: 1,
  },
  shareTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1E293B',
  },
  shareSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
    marginTop: 2,
  },
  socialMedia: {
    marginBottom: 24,
  },
  socialButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  socialButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  twitterButton: {
    backgroundColor: '#1DA1F2',
  },
  facebookButton: {
    backgroundColor: '#1877F2',
  },
  instagramButton: {
    backgroundColor: '#E4405F',
  },
  socialButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  messageSharing: {
    marginBottom: 24,
  },
});