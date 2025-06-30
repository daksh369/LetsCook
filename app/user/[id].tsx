import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, SafeAreaView, TouchableOpacity, Image, RefreshControl } from 'react-native';
import { ArrowLeft, Share, Users, BookOpen, Heart, MessageCircle } from 'lucide-react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useUsers, User } from '@/hooks/useUsers';
import { useRecipes } from '@/hooks/useRecipes';
import RecipeCard from '@/components/RecipeCard';

export default function UserProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('recipes');

  const { getUserById, toggleFollow } = useUsers();
  const { recipes, toggleBookmark, toggleLike } = useRecipes();

  useEffect(() => {
    if (id) {
      loadUser();
    }
  }, [id]);

  const loadUser = async () => {
    try {
      setLoading(true);
      const userData = await getUserById(id);
      setUser(userData);
    } catch (error) {
      console.error('Error loading user:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadUser();
    setRefreshing(false);
  };

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.push('/(tabs)/search');
    }
  };

  const handleFollow = async () => {
    if (!user) return;
    
    await toggleFollow(user.id);
    // Update local state
    setUser(prev => prev ? {
      ...prev,
      isFollowing: !prev.isFollowing,
      followers_count: prev.isFollowing 
        ? prev.followers_count - 1 
        : prev.followers_count + 1
    } : null);
  };

  const handleRecipePress = (recipeId: string) => {
    router.push(`/recipe/${recipeId}`);
  };

  const handleMessage = () => {
    // TODO: Implement messaging
    console.log('Message user:', user?.id);
  };

  const handleShare = () => {
    // TODO: Implement profile sharing
    console.log('Share profile:', user?.id);
  };

  // Filter recipes by this user
  const userRecipes = recipes.filter(recipe => recipe.author_id === id);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>User not found</Text>
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
        <Text style={styles.title}>{user.name}</Text>
        <TouchableOpacity style={styles.headerButton} onPress={handleShare}>
          <Share size={24} color="#64748B" />
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Profile Info */}
        <View style={styles.profileSection}>
          <Image 
            source={{ 
              uri: user.avatar_url || 'https://images.pexels.com/photos/3778876/pexels-photo-3778876.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop' 
            }} 
            style={styles.avatar} 
          />
          
          <Text style={styles.name}>{user.name}</Text>
          <Text style={styles.username}>@{user.username}</Text>
          <Text style={styles.bio}>{user.bio || 'No bio yet'}</Text>
          
          <View style={styles.stats}>
            <View style={styles.stat}>
              <Text style={styles.statNumber}>{user.recipes_count}</Text>
              <Text style={styles.statLabel}>Recipes</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statNumber}>{user.followers_count}</Text>
              <Text style={styles.statLabel}>Followers</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statNumber}>{user.following_count}</Text>
              <Text style={styles.statLabel}>Following</Text>
            </View>
          </View>

          <View style={styles.actionButtons}>
            {user.isFollowing !== undefined && (
              <TouchableOpacity 
                style={[styles.followButton, user.isFollowing && styles.followingButton]}
                onPress={handleFollow}
              >
                <Users size={20} color={user.isFollowing ? "#64748B" : "#FFFFFF"} />
                <Text style={[styles.followButtonText, user.isFollowing && styles.followingButtonText]}>
                  {user.isFollowing ? 'Following' : 'Follow'}
                </Text>
              </TouchableOpacity>
            )}
            
            <TouchableOpacity style={styles.messageButton} onPress={handleMessage}>
              <MessageCircle size={20} color="#FF6B35" />
              <Text style={styles.messageButtonText}>Message</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Cooking Profile */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cooking Profile</Text>
          
          <View style={styles.cookingInfo}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Skill Level:</Text>
              <Text style={styles.infoValue}>{user.skill_level}</Text>
            </View>
            
            {user.dietary_preferences.length > 0 && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Dietary Preferences:</Text>
                <Text style={styles.infoValue}>{user.dietary_preferences.join(', ')}</Text>
              </View>
            )}
            
            {user.favorite_cuisines && user.favorite_cuisines.length > 0 && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Favorite Cuisines:</Text>
                <Text style={styles.infoValue}>{user.favorite_cuisines.join(', ')}</Text>
              </View>
            )}
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
                Recipes ({userRecipes.length})
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.tabContent}>
            {userRecipes.length > 0 ? (
              userRecipes.map((recipe) => (
                <RecipeCard
                  key={recipe.id}
                  recipe={recipe}
                  onPress={() => handleRecipePress(recipe.id)}
                  onBookmark={() => toggleBookmark(recipe.id)}
                  onLike={() => toggleLike(recipe.id)}
                />
              ))
            ) : (
              <View style={styles.emptyTabContent}>
                <BookOpen size={48} color="#94A3B8" />
                <Text style={styles.emptyTabTitle}>No recipes yet</Text>
                <Text style={styles.emptyTabText}>
                  {user.name} hasn't shared any recipes yet
                </Text>
              </View>
            )}
          </View>
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
  content: {
    flex: 1,
  },
  profileSection: {
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
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
    lineHeight: 20,
  },
  stats: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  stat: {
    alignItems: 'center',
    marginHorizontal: 20,
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
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  followButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF6B35',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 8,
  },
  followingButton: {
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  followButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  followingButtonText: {
    color: '#64748B',
  },
  messageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 8,
  },
  messageButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#FF6B35',
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
    gap: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#64748B',
  },
  infoValue: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#1E293B',
    flex: 1,
    textAlign: 'right',
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
    gap: 6,
  },
  activeTab: {
    backgroundColor: '#FF6B35',
  },
  tabText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#64748B',
  },
  activeTabText: {
    color: '#FFFFFF',
  },
  tabContent: {
    minHeight: 200,
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
  },
  bottomPadding: {
    height: 80,
  },
});