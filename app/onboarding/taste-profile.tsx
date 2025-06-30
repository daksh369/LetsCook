import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, SafeAreaView, TouchableOpacity, Alert } from 'react-native';
import { ChefHat, ArrowRight, Check } from 'lucide-react-native';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';

const dietaryOptions = [
  'None',
  'Vegetarian',
  'Vegan',
  'Pescatarian',
  'Gluten-free',
  'Dairy-free',
  'Keto',
  'Paleo',
  'Low-carb',
  'Mediterranean',
];

const cuisineOptions = [
  'Italian',
  'Mexican',
  'Asian',
  'Indian',
  'Mediterranean',
  'American',
  'French',
  'Thai',
  'Japanese',
  'Middle Eastern',
  'Chinese',
  'Korean',
];

const skillLevels = [
  { id: 'Beginner', title: 'Beginner', description: 'Just starting out, prefer simple recipes' },
  { id: 'Intermediate', title: 'Intermediate', description: 'Comfortable with basic techniques' },
  { id: 'Advanced', title: 'Advanced', description: 'Experienced cook, enjoy complex recipes' },
];

const allergyOptions = [
  'None',
  'Nuts',
  'Shellfish',
  'Eggs',
  'Soy',
  'Fish',
  'Sesame',
  'Sulfites',
];

export default function TasteProfileScreen() {
  const [selectedDietary, setSelectedDietary] = useState<string[]>(['None']);
  const [selectedCuisines, setSelectedCuisines] = useState<string[]>([]);
  const [selectedSkill, setSelectedSkill] = useState<'Beginner' | 'Intermediate' | 'Advanced'>('Beginner');
  const [selectedAllergies, setSelectedAllergies] = useState<string[]>(['None']);
  const [saving, setSaving] = useState(false);

  const { updateProfile } = useAuth();

  const toggleDietary = (option: string) => {
    if (option === 'None') {
      setSelectedDietary(['None']);
    } else {
      const filtered = selectedDietary.filter(item => item !== 'None');
      if (filtered.includes(option)) {
        const newSelection = filtered.filter(item => item !== option);
        setSelectedDietary(newSelection.length === 0 ? ['None'] : newSelection);
      } else {
        setSelectedDietary([...filtered, option]);
      }
    }
  };

  const toggleCuisine = (cuisine: string) => {
    if (selectedCuisines.includes(cuisine)) {
      setSelectedCuisines(selectedCuisines.filter(item => item !== cuisine));
    } else {
      setSelectedCuisines([...selectedCuisines, cuisine]);
    }
  };

  const toggleAllergy = (option: string) => {
    if (option === 'None') {
      setSelectedAllergies(['None']);
    } else {
      const filtered = selectedAllergies.filter(item => item !== 'None');
      if (filtered.includes(option)) {
        const newSelection = filtered.filter(item => item !== option);
        setSelectedAllergies(newSelection.length === 0 ? ['None'] : newSelection);
      } else {
        setSelectedAllergies([...filtered, option]);
      }
    }
  };

  const handleSave = async () => {
    setSaving(true);

    try {
      const tasteProfile = {
        dietary_preferences: selectedDietary.filter(item => item !== 'None'),
        favorite_cuisines: selectedCuisines,
        skill_level: selectedSkill,
        allergies: selectedAllergies.filter(item => item !== 'None'),
      };

      const { error } = await updateProfile(tasteProfile);

      if (error) {
        Alert.alert('Error', 'Failed to save taste profile. Please try again.');
      } else {
        Alert.alert(
          'Profile Saved!',
          'Your taste profile has been saved. We\'ll use this to personalize your feed.',
          [
            {
              text: 'Continue',
              onPress: () => router.back()
            }
          ]
        );
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to save taste profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <ChefHat size={32} color="#FF6B35" />
        <Text style={styles.title}>Set Up Your Taste Profile</Text>
        <Text style={styles.subtitle}>
          Help us personalize your recipe recommendations
        </Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Dietary Preferences */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Dietary Preferences</Text>
          <Text style={styles.sectionSubtitle}>Select all that apply</Text>
          
          <View style={styles.optionsGrid}>
            {dietaryOptions.map((option) => (
              <TouchableOpacity
                key={option}
                style={[
                  styles.optionChip,
                  selectedDietary.includes(option) && styles.selectedChip
                ]}
                onPress={() => toggleDietary(option)}
              >
                {selectedDietary.includes(option) && (
                  <Check size={16} color="#FFFFFF" style={styles.checkIcon} />
                )}
                <Text style={[
                  styles.optionText,
                  selectedDietary.includes(option) && styles.selectedText
                ]}>
                  {option}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Favorite Cuisines */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Favorite Cuisines</Text>
          <Text style={styles.sectionSubtitle}>Choose your favorites (optional)</Text>
          
          <View style={styles.optionsGrid}>
            {cuisineOptions.map((cuisine) => (
              <TouchableOpacity
                key={cuisine}
                style={[
                  styles.optionChip,
                  selectedCuisines.includes(cuisine) && styles.selectedChip
                ]}
                onPress={() => toggleCuisine(cuisine)}
              >
                {selectedCuisines.includes(cuisine) && (
                  <Check size={16} color="#FFFFFF" style={styles.checkIcon} />
                )}
                <Text style={[
                  styles.optionText,
                  selectedCuisines.includes(cuisine) && styles.selectedText
                ]}>
                  {cuisine}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Skill Level */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cooking Skill Level</Text>
          <Text style={styles.sectionSubtitle}>How would you describe your cooking experience?</Text>
          
          <View style={styles.skillOptions}>
            {skillLevels.map((skill) => (
              <TouchableOpacity
                key={skill.id}
                style={[
                  styles.skillOption,
                  selectedSkill === skill.id && styles.selectedSkillOption
                ]}
                onPress={() => setSelectedSkill(skill.id as any)}
              >
                <View style={styles.skillContent}>
                  <Text style={[
                    styles.skillTitle,
                    selectedSkill === skill.id && styles.selectedSkillTitle
                  ]}>
                    {skill.title}
                  </Text>
                  <Text style={[
                    styles.skillDescription,
                    selectedSkill === skill.id && styles.selectedSkillDescription
                  ]}>
                    {skill.description}
                  </Text>
                </View>
                {selectedSkill === skill.id && (
                  <Check size={20} color="#FFFFFF" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Allergies */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Food Allergies</Text>
          <Text style={styles.sectionSubtitle}>Help us filter out recipes with allergens</Text>
          
          <View style={styles.optionsGrid}>
            {allergyOptions.map((allergy) => (
              <TouchableOpacity
                key={allergy}
                style={[
                  styles.optionChip,
                  selectedAllergies.includes(allergy) && styles.selectedChip
                ]}
                onPress={() => toggleAllergy(allergy)}
              >
                {selectedAllergies.includes(allergy) && (
                  <Check size={16} color="#FFFFFF" style={styles.checkIcon} />
                )}
                <Text style={[
                  styles.optionText,
                  selectedAllergies.includes(allergy) && styles.selectedText
                ]}>
                  {allergy}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Save Button */}
        <View style={styles.saveSection}>
          <TouchableOpacity 
            style={[styles.saveButton, saving && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={saving}
          >
            <Text style={styles.saveButtonText}>
              {saving ? 'Saving...' : 'Save & Continue'}
            </Text>
            <ArrowRight size={20} color="#FFFFFF" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.skipButton}
            onPress={() => router.back()}
          >
            <Text style={styles.skipButtonText}>Skip for now</Text>
          </TouchableOpacity>
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
  header: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 32,
    backgroundColor: '#FFFFFF',
  },
  title: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#1E293B',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 24,
  },
  content: {
    flex: 1,
  },
  section: {
    backgroundColor: '#FFFFFF',
    marginVertical: 8,
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  sectionTitle: {
    fontSize: 20,
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
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  optionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#E2E8F0',
  },
  selectedChip: {
    backgroundColor: '#FF6B35',
    borderColor: '#FF6B35',
  },
  checkIcon: {
    marginRight: 6,
  },
  optionText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#64748B',
  },
  selectedText: {
    color: '#FFFFFF',
  },
  skillOptions: {
    gap: 12,
  },
  skillOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    padding: 20,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#E2E8F0',
  },
  selectedSkillOption: {
    backgroundColor: '#FF6B35',
    borderColor: '#FF6B35',
  },
  skillContent: {
    flex: 1,
  },
  skillTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#1E293B',
    marginBottom: 4,
  },
  selectedSkillTitle: {
    color: '#FFFFFF',
  },
  skillDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
  },
  selectedSkillDescription: {
    color: '#FFFFFF',
    opacity: 0.9,
  },
  saveSection: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 24,
    marginVertical: 8,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF6B35',
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 16,
    gap: 8,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  skipButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  skipButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#64748B',
  },
  bottomPadding: {
    height: 80,
  },
});