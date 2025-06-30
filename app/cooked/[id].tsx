import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, SafeAreaView, TouchableOpacity, TextInput, Image, Alert } from 'react-native';
import { ArrowLeft, Camera, Send, X } from 'lucide-react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { useRecipes, Recipe } from '@/hooks/useRecipes';
import * as ImagePicker from 'expo-image-picker';

export default function CookedThisScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [note, setNote] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const { user, profile } = useAuth();
  const { getRecipeById } = useRecipes();

  React.useEffect(() => {
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

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.push('/(tabs)');
    }
  };

  const handleSelectImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  const handleTakePhoto = async () => {
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  const handleSubmit = async () => {
    if (!selectedImage) {
      Alert.alert('Photo Required', 'Please add a photo of your creation');
      return;
    }

    setSubmitting(true);

    try {
      // In a real app, this would upload the image and save the post
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API call
      
      Alert.alert(
        'Success!', 
        'Your creation has been shared! The recipe creator will be notified.',
        [
          {
            text: 'OK',
            onPress: () => handleBack()
          }
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to share your creation. Please try again.');
    } finally {
      setSubmitting(false);
    }
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
        <Text style={styles.title}>Share Your Creation</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Recipe Info */}
        <View style={styles.recipeInfo}>
          <Text style={styles.recipeTitle}>{recipe.title}</Text>
          <Text style={styles.recipeAuthor}>by {recipe.author?.name}</Text>
        </View>

        {/* Photo Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Add Your Photo *</Text>
          <Text style={styles.sectionSubtitle}>Show off your delicious creation!</Text>
          
          {selectedImage ? (
            <View style={styles.selectedImageContainer}>
              <Image source={{ uri: selectedImage }} style={styles.selectedImage} />
              <TouchableOpacity 
                style={styles.removeImageButton}
                onPress={() => setSelectedImage(null)}
              >
                <X size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.photoOptions}>
              <TouchableOpacity style={styles.photoOption} onPress={handleTakePhoto}>
                <Camera size={32} color="#FF6B35" />
                <Text style={styles.photoOptionText}>Take Photo</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.photoOption} onPress={handleSelectImage}>
                <Camera size={32} color="#4ECDC4" />
                <Text style={styles.photoOptionText}>Choose from Gallery</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Note Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Add a Note (Optional)</Text>
          <Text style={styles.sectionSubtitle}>Share your experience, modifications, or tips</Text>
          
          <TextInput
            style={styles.noteInput}
            value={note}
            onChangeText={setNote}
            placeholder="How did it turn out? Any changes you made? Tips for others?"
            placeholderTextColor="#94A3B8"
            multiline
            numberOfLines={4}
          />
        </View>

        {/* Submit Button */}
        <View style={styles.submitSection}>
          <TouchableOpacity 
            style={[
              styles.submitButton,
              (!selectedImage || submitting) && styles.submitButtonDisabled
            ]}
            onPress={handleSubmit}
            disabled={!selectedImage || submitting}
          >
            <Send size={20} color="#FFFFFF" />
            <Text style={styles.submitButtonText}>
              {submitting ? 'Sharing...' : 'Share My Creation'}
            </Text>
          </TouchableOpacity>
          
          <Text style={styles.submitNote}>
            The recipe creator will be notified when you share your creation
          </Text>
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
  recipeInfo: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    alignItems: 'center',
  },
  recipeTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#1E293B',
    textAlign: 'center',
    marginBottom: 4,
  },
  recipeAuthor: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
  },
  section: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    marginVertical: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#1E293B',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
    marginBottom: 20,
  },
  selectedImageContainer: {
    position: 'relative',
    alignItems: 'center',
  },
  selectedImage: {
    width: 200,
    height: 200,
    borderRadius: 12,
  },
  removeImageButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 16,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoOptions: {
    flexDirection: 'row',
    gap: 16,
  },
  photoOption: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingVertical: 32,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed',
  },
  photoOptionText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#64748B',
    marginTop: 12,
  },
  noteInput: {
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
  submitSection: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    marginVertical: 8,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF6B35',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
    marginBottom: 12,
  },
  submitButtonDisabled: {
    backgroundColor: '#94A3B8',
  },
  submitButtonText: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  submitNote: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
  },
  bottomPadding: {
    height: 80,
  },
});