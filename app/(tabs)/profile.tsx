import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, SafeAreaView, TouchableOpacity, Image, TextInput, Alert, RefreshControl } from 'react-native';
import { Settings, Share, ChefHat, Users, BookOpen, Heart, LocationEdit as Edit, LogOut, X, Check, Folder, Camera } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { useRecipes } from '@/hooks/useRecipes';
import { router } from 'expo-router';
import RecipeCard from '@/components/RecipeCard';

export default function ProfileScreen() {
  const [activeTab, setActiveTab] = useState('recipes');
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState('');
  const [editedBio, setEditedBio] = useState('');
  const [saving, setSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const { profile, signOut, updateProfile } = useAuth();
  const { 
    userRecipes, 
    likedRecipes, 
    userRecipesLoading, 
    likedRecipesLoading,
    fetchUserRecipes,
    fetchLikedRecipes,
    toggleBookmark, 
    toggleLike 
  } = useRecipes();

  // Mock tried recipes count
  const triedRecipesCount = 15;

  const achievements = [
    { id: 1, title: 'First Recipe', description: 'Posted your first recipe', icon: '🍳', unlocked: profile?.recipes_count > 0 },
    { id: 2, title: 'Popular Chef', description: '100+ followers', icon: '👨‍🍳', unlocked: profile?.followers_count >= 100 },
    { id: 3, title: 'Recipe Master', description: '50+ recipes shared', icon: '📚', unlocked: profile?.recipes_count >= 50 },
    { id: 4, title: 'Community Favorite', description: '1000+ likes received', icon: '❤️', unlocked: false },
  ];

  const handleEditProfile = () => {
    if (profile) {
      setEditedName(profile.name);
      setEditedBio(profile.bio || '');
      setIsEditing(true);
    }
  };

  const handleSaveProfile = async () => {
    if (!profile) return;

    setSaving(true);
    const { error } = await updateProfile({
      name: editedName.trim(),
      bio: editedBio.trim(),
    });

    if (error) {
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    } else {
      setIsEditing(false);
    }
    setSaving(false);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedName('');
    setEditedBio('');
  };

  const handleSignOut = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Sign Out', 
          style: 'destructive',
          onPress: async () => {
            await signOut();
            router.replace('/(auth)/login');
          }
        }
      ]
    );
  };

  const handleRecipePress = (recipeId: string) => {
    router.push(`/recipe/${recipeId}`);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    if (activeTab === 'recipes') {
      await fetchUserRecipes();
    } else if (activeTab === 'liked') {
      await fetchLikedRecipes();
    }
    setRefreshing(false);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'recipes':
        if (userRecipesLoading) {
          return (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Loading your recipes...</Text>
            </View>
          );
        }
        
        if (userRecipes.length === 0) {
          return (
            <View style={styles.emptyTabContent}>
              <Text style={styles.emptyTabTitle}>No recipes yet</Text>
              <Text style={styles.emptyTabText}>Start creating recipes to see them here</Text>
              <TouchableOpacity 
                style={styles.createButton}
                onPress={() => router.push('/(tabs)/add')}
              >
                <Text style={styles.createButtonText}>Create Your First Recipe</Text>
              </TouchableOpacity>
            </View>
          );
        }

        return (
          <ScrollView 
            style={styles.tabScrollContent}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            showsVerticalScrollIndicator={false}
          >
            {userRecipes.map((recipe) => (
              <RecipeCard
                key={recipe.id}
                recipe={recipe}
                onPress={() => handleRecipePress(recipe.id)}
                onBookmark={() => toggleBookmark(recipe.id)}
                onLike={() => toggleLike(recipe.id)}
              />
            ))}
          </ScrollView>
        );

      case 'liked':
        if (likedRecipesLoading) {
          return (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Loading liked recipes...</Text>
            </View>
          );
        }
        
        if (likedRecipes.length === 0) {
          return (
            <View style={styles.emptyTabContent}>
              <Text style={styles.emptyTabTitle}>No liked recipes</Text>
              <Text style={styles.emptyTabText}>Recipes you like will appear here</Text>
              <TouchableOpacity 
                style={styles.exploreButton}
                onPress={() => router.push('/(tabs)/search')}
              >
                <Text style={styles.exploreButtonText}>Explore Recipes</Text>
              </TouchableOpacity>
            </View>
          );
        }

        return (
          <ScrollView 
            style={styles.tabScrollContent}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            showsVerticalScrollIndicator={false}
          >
            {likedRecipes.map((recipe) => (
              <RecipeCard
                key={recipe.id}
                recipe={recipe}
                onPress={() => handleRecipePress(recipe.id)}
                onBookmark={() => toggleBookmark(recipe.id)}
                onLike={() => toggleLike(recipe.id)}
              />
            ))}
          </ScrollView>
        );

      case 'tried':
        return (
          <View style={styles.emptyTabContent}>
            <Camera size={48} color="#94A3B8" />
            <Text style={styles.emptyTabTitle}>No tried recipes yet</Text>
            <Text style={styles.emptyTabText}>Recipes you've cooked will appear here</Text>
            <TouchableOpacity 
              style={styles.exploreButton}
              onPress={() => router.push('/(tabs)/search')}
            >
              <Text style={styles.exploreButtonText}>Find Recipes to Try</Text>
            </TouchableOpacity>
          </View>
        );

      case 'collections':
        return (
          <View style={styles.emptyTabContent}>
            <Folder size={48} color="#94A3B8" />
            <Text style={styles.emptyTabTitle}>No collections yet</Text>
            <Text style={styles.emptyTabText}>Create collections to organize your recipes</Text>
            <TouchableOpacity 
              style={styles.createButton}
              onPress={() => router.push('/collections')}
            >
              <Text style={styles.createButtonText}>Create Collection</Text>
            </TouchableOpacity>
          </View>
        );

      case 'following':
        return (
          <View style={styles.emptyTabContent}>
            <Text style={styles.emptyTabTitle}>No following yet</Text>
            <Text style={styles.emptyTabText}>Chefs you follow will appear here</Text>
            <TouchableOpacity 
              style={styles.exploreButton}
              onPress={() => router.push('/(tabs)/search')}
            >
              <Text style={styles.exploreButtonText}>Find Chefs</Text>
            </TouchableOpacity>
          </View>
        );

      default:
        return null;
    }
  };

  if (!profile) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Profile</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.iconButton}>
            <Share size={24} color="#64748B" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <Settings size={24} color="#64748B" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton} onPress={handleSignOut}>
            <LogOut size={24} color="#EF4444" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Info */}
        <View style={styles.profileSection}>
          <View style={styles.profileHeader}>
            <Image 
              source={{ 
                uri: profile.avatar_url || 'https://images.pexels.com/photos/3778876/pexels-photo-3778876.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop' 
              }} 
              style={styles.avatar} 
            />
            {!isEditing && (
              <TouchableOpacity style={styles.editButton} onPress={handleEditProfile}>
                <Edit size={16} color="#FFFFFF" />
              </TouchableOpacity>
            )}
          </View>
          
          {isEditing ? (
            <View style={styles.editForm}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Name</Text>
                <TextInput
                  style={styles.input}
                  value={editedName}
                  onChangeText={setEditedName}
                  placeholder="Enter your name"
                  placeholderTextColor="#94A3B8"
                />
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Bio</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={editedBio}
                  onChangeText={setEditedBio}
                  placeholder="Tell us about yourself"
                  placeholderTextColor="#94A3B8"
                  multiline
                  numberOfLines={3}
                />
              </View>

              <View style={styles.editActions}>
                <TouchableOpacity 
                  style={styles.cancelButton} 
                  onPress={handleCancelEdit}
                  disabled={saving}
                >
                  <X size={16} color="#64748B" />
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.saveButton, saving && styles.saveButtonDisabled]} 
                  onPress={handleSaveProfile}
                  disabled={saving}
                >
                  <Check size={16} color="#FFFFFF" />
                  <Text style={styles.saveButtonText}>
                    {saving ? 'Saving...' : 'Save'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <>
              <Text style={styles.name}>{profile.name}</Text>
              <Text style={styles.username}>@{profile.username}</Text>
              <Text style={styles.bio}>{profile.bio || 'No bio yet'}</Text>
              
              <View style={styles.stats}>
                <View style={styles.stat}>
                  <Text style={styles.statNumber}>{triedRecipesCount}</Text>
                  <Text style={styles.statLabel}>Tried</Text>
                </View>
                <View style={styles.stat}>
                  <Text style={styles.statNumber}>{profile.recipes_count}</Text>
                  <Text style={styles.statLabel}>Recipes</Text>
                </View>
                <View style={styles.stat}>
                  <Text style={styles.statNumber}>{profile.followers_count}</Text>
                  <Text style={styles.statLabel}>Followers</Text>
                </View>
                <View style={styles.stat}>
                  <Text style={styles.statNumber}>{profile.following_count}</Text>
                  <Text style={styles.statLabel}>Following</Text>
                </View>
              </View>

              <TouchableOpacity style={styles.editProfileButton} onPress={handleEditProfile}>
                <Text style={styles.editProfileText}>Edit Profile</Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        {/* Cooking Profile */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cooking Profile</Text>
          
          <View style={styles.cookingInfo}>
            <View style={styles.infoItem}>
              <ChefHat size={20} color="#FF6B35" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Skill Level</Text>
                <Text style={styles.infoValue}>{profile.skill_level}</Text>
              </View>
            </View>
            
            <View style={styles.infoItem}>
              <Heart size={20} color="#4ECDC4" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Dietary Preferences</Text>
                <Text style={styles.infoValue}>
                  {profile.dietary_preferences.length > 0 
                    ? profile.dietary_preferences.join(', ') 
                    : 'None specified'
                  }
                </Text>
              </View>
            </View>
          </View>

          <TouchableOpacity 
            style={styles.updateProfileButton}
            onPress={() => router.push('/onboarding/taste-profile')}
          >
            <Text style={styles.updateProfileText}>Update Taste Profile</Text>
          </TouchableOpacity>
        </View>

        {/* Achievements */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Achievements</Text>
          <View style={styles.achievementsGrid}>
            {achievements.map((achievement) => (
              <View 
                key={achievement.id} 
                style={[
                  styles.achievement,
                  !achievement.unlocked && styles.achievementLocked
                ]}
              >
                <Text style={styles.achievementIcon}>{achievement.icon}</Text>
                <Text style={styles.achievementTitle}>{achievement.title}</Text>
                <Text style={styles.achievementDescription}>{achievement.description}</Text>
                {achievement.unlocked && (
                  <View style={styles.unlockedBadge}>
                    <Text style={styles.unlockedText}>Unlocked</Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        </View>

        {/* Activity Tabs */}
        <View style={styles.section}>
          <View style={styles.tabContainer}>
            <TouchableOpacity 
              style={[styles.tab, activeTab === 'recipes' && styles.activeTab]}
              onPress={() => setActiveTab('recipes')}
            >
              <BookOpen size={16} color={activeTab === 'recipes' ? '#FFFFFF' : '#64748B'} />
              <Text style={[styles.tabText, activeTab === 'recipes' && styles.activeTabText]}>
                Recipes
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.tab, activeTab === 'liked' && styles.activeTab]}
              onPress={() => setActiveTab('liked')}
            >
              <Heart size={16} color={activeTab === 'liked' ? '#FFFFFF' : '#64748B'} />
              <Text style={[styles.tabText, activeTab === 'liked' && styles.activeTabText]}>
                Liked
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.tab, activeTab === 'tried' && styles.activeTab]}
              onPress={() => setActiveTab('tried')}
            >
              <Camera size={16} color={activeTab === 'tried' ? '#FFFFFF' : '#64748B'} />
              <Text style={[styles.tabText, activeTab === 'tried' && styles.activeTabText]}>
                Tried
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.tab, activeTab === 'collections' && styles.activeTab]}
              onPress={() => setActiveTab('collections')}
            >
              <Folder size={16} color={activeTab === 'collections' ? '#FFFFFF' : '#64748B'} />
              <Text style={[styles.tabText, activeTab === 'collections' && styles.activeTabText]}>
                Collections
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.tabContentContainer}>
            {renderTabContent()}
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActions}>
            <TouchableOpacity 
              style={styles.quickAction}
              onPress={() => router.push('/(tabs)/add')}
            >
              <View style={styles.quickActionIcon}>
                <BookOpen size={24} color="#FF6B35" />
              </View>
              <Text style={styles.quickActionText}>Create Recipe</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.quickAction}
              onPress={() => router.push('/collections')}
            >
              <View style={styles.quickActionIcon}>
                <Folder size={24} color="#4ECDC4" />
              </View>
              <Text style={styles.quickActionText}>Collections</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.quickAction}>
              <View style={styles.quickActionIcon}>
                <Users size={24} color="#6C5CE7" />
              </View>
              <Text style={styles.quickActionText}>Find Friends</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.quickAction}>
              <View style={styles.quickActionIcon}>
                <Settings size={24} color="#94A3B8" />
              </View>
              <Text style={styles.quickActionText}>Settings</Text>
            </TouchableOpacity>
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
    paddingVertical: 32,
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
  title: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#1E293B',
  },
  headerActions: {
    flexDirection: 'row',
  },
  iconButton: {
    padding: 8,
    marginLeft: 8,
  },
  content: {
    flex: 1,
  },
  bottomPadding: {
    height: 80, // Account for tab bar
  },
  profileSection: {
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  profileHeader: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  editButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#FF6B35',
    borderRadius: 16,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editForm: {
    width: '100%',
    gap: 16,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#1E293B',
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
  editActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  cancelButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
  },
  cancelButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#64748B',
    marginLeft: 6,
  },
  saveButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#FF6B35',
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    marginLeft: 6,
  },
  name: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#1E293B',
    marginBottom: 4,
  },
  username: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
    marginBottom: 8,
  },
  bio: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 20,
  },
  stats: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  stat: {
    alignItems: 'center',
    marginHorizontal: 16,
  },
  statNumber: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#1E293B',
  },
  statLabel: {
    fontSize: 13,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
    marginTop: 4,
  },
  editProfileButton: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  editProfileText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#64748B',
  },
  section: {
    backgroundColor: '#FFFFFF',
    marginVertical: 4,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#1E293B',
    marginBottom: 16,
  },
  cookingInfo: {
    gap: 16,
    marginBottom: 16,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoContent: {
    marginLeft: 12,
    flex: 1,
  },
  infoLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#64748B',
  },
  infoValue: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1E293B',
    marginTop: 2,
  },
  updateProfileButton: {
    backgroundColor: '#4ECDC4',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    alignSelf: 'flex-start',
  },
  updateProfileText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  achievementsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  achievement: {
    width: '48%',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    position: 'relative',
  },
  achievementLocked: {
    opacity: 0.5,
  },
  achievementIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  achievementTitle: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#1E293B',
    textAlign: 'center',
    marginBottom: 4,
  },
  achievementDescription: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
    textAlign: 'center',
  },
  unlockedBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#4ECDC4',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  unlockedText: {
    fontSize: 10,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: '#FF6B35',
  },
  tabText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#64748B',
    marginLeft: 4,
  },
  activeTabText: {
    color: '#FFFFFF',
  },
  tabContentContainer: {
    minHeight: 200,
  },
  tabScrollContent: {
    flex: 1,
  },
  emptyTabContent: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    paddingHorizontal: 32,
  },
  emptyTabTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 8,
    marginTop: 16,
  },
  emptyTabText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#94A3B8',
    textAlign: 'center',
    marginBottom: 24,
  },
  createButton: {
    backgroundColor: '#FF6B35',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  createButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  exploreButton: {
    backgroundColor: '#4ECDC4',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  exploreButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  quickAction: {
    alignItems: 'center',
  },
  quickActionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  quickActionText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#64748B',
  },
});