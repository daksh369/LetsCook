import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, SafeAreaView, TouchableOpacity, TextInput, Image, Alert } from 'react-native';
import { Camera, Plus, X, Clock, Users, ChefHat, ArrowLeft } from 'lucide-react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useRecipes } from '@/hooks/useRecipes';
import * as ImagePicker from 'expo-image-picker';

export default function AddRecipeScreen() {
  const { edit } = useLocalSearchParams<{ edit?: string }>();
  const isEditing = !!edit;
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [cookTime, setCookTime] = useState('');
  const [servings, setServings] = useState('');
  const [difficulty, setDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Easy');
  const [ingredients, setIngredients] = useState(['']);
  const [instructions, setInstructions] = useState(['']);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [image, setImage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { createRecipe, updateRecipe, uploadImage, getRecipeById } = useRecipes();

  const difficultyOptions: ('Easy' | 'Medium' | 'Hard')[] = ['Easy', 'Medium', 'Hard'];
  const availableTags = ['Vegetarian', 'Vegan', 'Gluten-free', 'Keto', 'Low-carb', 'Healthy', 'Quick', 'Comfort Food'];

  // Load recipe data if editing
  useEffect(() => {
    if (isEditing && edit) {
      loadRecipeForEditing(edit);
    }
  }, [isEditing, edit]);

  const loadRecipeForEditing = async (recipeId: string) => {
    setLoading(true);
    try {
      const recipe = await getRecipeById(recipeId);
      if (recipe) {
        setTitle(recipe.title);
        setDescription(recipe.description);
        setCookTime(recipe.cook_time.toString());
        setServings(recipe.servings.toString());
        setDifficulty(recipe.difficulty);
        setIngredients(recipe.ingredients.length > 0 ? recipe.ingredients : ['']);
        setInstructions(recipe.instructions.length > 0 ? recipe.instructions : ['']);
        setSelectedTags(recipe.tags);
        setImage(recipe.image_url || null);
      } else {
        Alert.alert('Error', 'Recipe not found');
        router.back();
      }
    } catch (error) {
      console.error('Error loading recipe for editing:', error);
      Alert.alert('Error', 'Failed to load recipe');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const addIngredient = () => {
    setIngredients([...ingredients, '']);
  };

  const removeIngredient = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  const updateIngredient = (index: number, value: string) => {
    const newIngredients = [...ingredients];
    newIngredients[index] = value;
    setIngredients(newIngredients);
  };

  const addInstruction = () => {
    setInstructions([...instructions, '']);
  };

  const removeInstruction = (index: number) => {
    setInstructions(instructions.filter((_, i) => i !== index));
  };

  const updateInstruction = (index: number, value: string) => {
    const newInstructions = [...instructions];
    newInstructions[index] = value;
    setInstructions(newInstructions);
  };

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleSelectImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const handleSaveRecipe = async () => {
    setError('');
    
    if (!title.trim() || !description.trim() || !cookTime || !servings) {
      setError('Please fill in all required fields');
      return;
    }

    const filteredIngredients = ingredients.filter(i => i.trim());
    const filteredInstructions = instructions.filter(i => i.trim());

    if (filteredIngredients.length === 0 || filteredInstructions.length === 0) {
      setError('Please add at least one ingredient and one instruction');
      return;
    }

    setSaving(true);

    try {
      let imageUrl = image;
      
      // Only upload new image if it's a local URI (not already uploaded)
      if (image && image.startsWith('file://')) {
        imageUrl = await uploadImage(image);
      }

      const recipeData = {
        title: title.trim(),
        description: description.trim(),
        image_url: imageUrl,
        cook_time: parseInt(cookTime),
        servings: parseInt(servings),
        difficulty,
        ingredients: filteredIngredients,
        instructions: filteredInstructions,
        tags: selectedTags,
        dietary_info: selectedTags.filter(tag => 
          ['Vegetarian', 'Vegan', 'Gluten-free', 'Keto', 'Low-carb'].includes(tag)
        ),
      };

      let result;
      if (isEditing && edit) {
        result = await updateRecipe(edit, recipeData);
      } else {
        result = await createRecipe(recipeData);
      }

      if (result.error) {
        setError(`Failed to ${isEditing ? 'update' : 'save'} recipe. Please try again.`);
      } else {
        // Reset form only if creating new recipe
        if (!isEditing) {
          setTitle('');
          setDescription('');
          setCookTime('');
          setServings('');
          setDifficulty('Easy');
          setIngredients(['']);
          setInstructions(['']);
          setSelectedTags([]);
          setImage(null);
        }
        
        Alert.alert(
          'Success',
          `Recipe ${isEditing ? 'updated' : 'created'} successfully!`,
          [
            {
              text: 'OK',
              onPress: () => {
                if (isEditing) {
                  router.back();
                } else {
                  router.push('/(tabs)/recipes');
                }
              }
            }
          ]
        );
      }
    } catch (error) {
      setError(`Failed to ${isEditing ? 'update' : 'save'} recipe. Please try again.`);
    }

    setSaving(false);
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

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        {isEditing && (
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ArrowLeft size={20} color="#64748B" />
          </TouchableOpacity>
        )}
        <Text style={styles.title}>
          {isEditing ? 'Edit Recipe' : 'Create Recipe'}
        </Text>
        <TouchableOpacity 
          style={[styles.saveButton, saving && styles.saveButtonDisabled]} 
          onPress={handleSaveRecipe}
          disabled={saving}
        >
          <Text style={styles.saveButtonText}>
            {saving ? 'Saving...' : isEditing ? 'Update' : 'Save'}
          </Text>
        </TouchableOpacity>
      </View>

      {error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Image Upload */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Photo</Text>
          <TouchableOpacity style={styles.imageUpload} onPress={handleSelectImage}>
            {image ? (
              <Image source={{ uri: image }} style={styles.uploadedImage} />
            ) : (
              <View style={styles.imagePlaceholder}>
                <Camera size={32} color="#94A3B8" />
                <Text style={styles.imageUploadText}>Add Photo</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Basic Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Basic Information</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Recipe Title *</Text>
            <TextInput
              style={styles.input}
              value={title}
              onChangeText={setTitle}
              placeholder="Enter recipe title"
              placeholderTextColor="#94A3B8"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Description *</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={description}
              onChangeText={setDescription}
              placeholder="Describe your recipe"
              placeholderTextColor="#94A3B8"
              multiline
              numberOfLines={3}
            />
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
              <Text style={styles.label}>Cook Time (min) *</Text>
              <View style={styles.inputWithIcon}>
                <Clock size={20} color="#94A3B8" />
                <TextInput
                  style={styles.inputWithIconText}
                  value={cookTime}
                  onChangeText={setCookTime}
                  placeholder="30"
                  placeholderTextColor="#94A3B8"
                  keyboardType="numeric"
                />
              </View>
            </View>
            
            <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
              <Text style={styles.label}>Servings *</Text>
              <View style={styles.inputWithIcon}>
                <Users size={20} color="#94A3B8" />
                <TextInput
                  style={styles.inputWithIconText}
                  value={servings}
                  onChangeText={setServings}
                  placeholder="4"
                  placeholderTextColor="#94A3B8"
                  keyboardType="numeric"
                />
              </View>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Difficulty</Text>
            <View style={styles.difficultyContainer}>
              {difficultyOptions.map((option) => (
                <TouchableOpacity
                  key={option}
                  style={[
                    styles.difficultyOption,
                    difficulty === option && styles.selectedDifficulty
                  ]}
                  onPress={() => setDifficulty(option)}
                >
                  <ChefHat size={16} color={difficulty === option ? '#FFFFFF' : '#64748B'} />
                  <Text style={[
                    styles.difficultyText,
                    difficulty === option && styles.selectedDifficultyText
                  ]}>
                    {option}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Ingredients */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Ingredients</Text>
            <TouchableOpacity style={styles.addButton} onPress={addIngredient}>
              <Plus size={20} color="#FF6B35" />
            </TouchableOpacity>
          </View>
          
          {ingredients.map((ingredient, index) => (
            <View key={index} style={styles.listItem}>
              <TextInput
                style={styles.listInput}
                value={ingredient}
                onChangeText={(value) => updateIngredient(index, value)}
                placeholder={`Ingredient ${index + 1}`}
                placeholderTextColor="#94A3B8"
              />
              {ingredients.length > 1 && (
                <TouchableOpacity 
                  style={styles.removeButton}
                  onPress={() => removeIngredient(index)}
                >
                  <X size={16} color="#EF4444" />
                </TouchableOpacity>
              )}
            </View>
          ))}
        </View>

        {/* Instructions */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Instructions</Text>
            <TouchableOpacity style={styles.addButton} onPress={addInstruction}>
              <Plus size={20} color="#FF6B35" />
            </TouchableOpacity>
          </View>
          
          {instructions.map((instruction, index) => (
            <View key={index} style={styles.listItem}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>{index + 1}</Text>
              </View>
              <TextInput
                style={[styles.listInput, styles.instructionInput]}
                value={instruction}
                onChangeText={(value) => updateInstruction(index, value)}
                placeholder={`Step ${index + 1}`}
                placeholderTextColor="#94A3B8"
                multiline
              />
              {instructions.length > 1 && (
                <TouchableOpacity 
                  style={styles.removeButton}
                  onPress={() => removeInstruction(index)}
                >
                  <X size={16} color="#EF4444" />
                </TouchableOpacity>
              )}
            </View>
          ))}
        </View>

        {/* Tags */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tags</Text>
          <View style={styles.tagsContainer}>
            {availableTags.map((tag) => (
              <TouchableOpacity
                key={tag}
                style={[
                  styles.tag,
                  selectedTags.includes(tag) && styles.selectedTag
                ]}
                onPress={() => toggleTag(tag)}
              >
                <Text style={[
                  styles.tagText,
                  selectedTags.includes(tag) && styles.selectedTagText
                ]}>
                  {tag}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
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
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  title: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#1E293B',
    flex: 1,
  },
  saveButton: {
    backgroundColor: '#FF6B35',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  errorContainer: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    padding: 12,
  },
  errorText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#DC2626',
    textAlign: 'center',
  },
  content: {
    flex: 1,
  },
  bottomPadding: {
    height: 80, // Account for tab bar
  },
  section: {
    backgroundColor: '#FFFFFF',
    marginVertical: 8,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#1E293B',
  },
  addButton: {
    padding: 4,
  },
  imageUpload: {
    height: 200,
    borderRadius: 12,
    overflow: 'hidden',
  },
  imagePlaceholder: {
    height: '100%',
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed',
  },
  uploadedImage: {
    width: '100%',
    height: '100%',
  },
  imageUploadText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#94A3B8',
    marginTop: 8,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#1E293B',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#1E293B',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
  },
  inputWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  inputWithIconText: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#1E293B',
    marginLeft: 8,
  },
  difficultyContainer: {
    flexDirection: 'row',
  },
  difficultyOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  selectedDifficulty: {
    backgroundColor: '#FF6B35',
    borderColor: '#FF6B35',
  },
  difficultyText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#64748B',
    marginLeft: 6,
  },
  selectedDifficultyText: {
    color: '#FFFFFF',
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  listInput: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#1E293B',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  instructionInput: {
    minHeight: 60,
    textAlignVertical: 'top',
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FF6B35',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginTop: 6,
  },
  stepNumberText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  removeButton: {
    padding: 8,
    marginLeft: 8,
  },
  tagsContainer: {
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
  selectedTag: {
    backgroundColor: '#FF6B35',
  },
  tagText: {
    fontSize: 13,
    fontFamily: 'Inter-Medium',
    color: '#64748B',
  },
  selectedTagText: {
    color: '#FFFFFF',
  },
});