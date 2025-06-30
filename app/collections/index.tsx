import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, SafeAreaView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { ArrowLeft, Plus, Folder, Heart, Clock, ChefHat, X } from 'lucide-react-native';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';

interface Collection {
  id: string;
  name: string;
  description: string;
  recipe_count: number;
  created_at: string;
  is_default: boolean;
}

export default function CollectionsScreen() {
  const [collections, setCollections] = useState<Collection[]>([
    {
      id: '1',
      name: 'Favorites',
      description: 'My all-time favorite recipes',
      recipe_count: 12,
      created_at: '2024-01-01',
      is_default: true,
    },
    {
      id: '2',
      name: 'To Try Next Week',
      description: 'Recipes I want to cook soon',
      recipe_count: 8,
      created_at: '2024-01-15',
      is_default: false,
    },
    {
      id: '3',
      name: 'Festive Dishes',
      description: 'Special occasion recipes',
      recipe_count: 15,
      created_at: '2024-01-10',
      is_default: false,
    },
  ]);
  
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [newCollectionDescription, setNewCollectionDescription] = useState('');
  const [creating, setCreating] = useState(false);

  const { user } = useAuth();

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.push('/(tabs)/profile');
    }
  };

  const handleCreateCollection = async () => {
    if (!newCollectionName.trim()) {
      Alert.alert('Error', 'Please enter a collection name');
      return;
    }

    setCreating(true);

    try {
      // In a real app, this would be an API call
      const newCollection: Collection = {
        id: Date.now().toString(),
        name: newCollectionName.trim(),
        description: newCollectionDescription.trim(),
        recipe_count: 0,
        created_at: new Date().toISOString(),
        is_default: false,
      };

      setCollections(prev => [newCollection, ...prev]);
      setNewCollectionName('');
      setNewCollectionDescription('');
      setShowCreateForm(false);
      
      Alert.alert('Success', 'Collection created successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to create collection. Please try again.');
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteCollection = (collectionId: string) => {
    const collection = collections.find(c => c.id === collectionId);
    
    if (collection?.is_default) {
      Alert.alert('Cannot Delete', 'Default collections cannot be deleted');
      return;
    }

    Alert.alert(
      'Delete Collection',
      'Are you sure you want to delete this collection? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setCollections(prev => prev.filter(c => c.id !== collectionId));
          }
        }
      ]
    );
  };

  const handleCollectionPress = (collectionId: string) => {
    router.push(`/collections/${collectionId}`);
  };

  const getCollectionIcon = (name: string) => {
    if (name.toLowerCase().includes('favorite')) return Heart;
    if (name.toLowerCase().includes('try') || name.toLowerCase().includes('next')) return Clock;
    if (name.toLowerCase().includes('festive') || name.toLowerCase().includes('special')) return ChefHat;
    return Folder;
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerButton} onPress={handleBack}>
          <ArrowLeft size={24} color="#1E293B" />
        </TouchableOpacity>
        <Text style={styles.title}>My Collections</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => setShowCreateForm(true)}
        >
          <Plus size={24} color="#FF6B35" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Create Collection Form */}
        {showCreateForm && (
          <View style={styles.createForm}>
            <View style={styles.formHeader}>
              <Text style={styles.formTitle}>Create New Collection</Text>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => {
                  setShowCreateForm(false);
                  setNewCollectionName('');
                  setNewCollectionDescription('');
                }}
              >
                <X size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Collection Name *</Text>
              <TextInput
                style={styles.input}
                value={newCollectionName}
                onChangeText={setNewCollectionName}
                placeholder="e.g., Weekend Brunch, Comfort Food"
                placeholderTextColor="#94A3B8"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Description (Optional)</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={newCollectionDescription}
                onChangeText={setNewCollectionDescription}
                placeholder="Describe what this collection is for..."
                placeholderTextColor="#94A3B8"
                multiline
                numberOfLines={3}
              />
            </View>

            <TouchableOpacity 
              style={[styles.createButton, creating && styles.createButtonDisabled]}
              onPress={handleCreateCollection}
              disabled={creating}
            >
              <Text style={styles.createButtonText}>
                {creating ? 'Creating...' : 'Create Collection'}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Collections List */}
        <View style={styles.collectionsSection}>
          <Text style={styles.sectionTitle}>
            {collections.length} Collection{collections.length !== 1 ? 's' : ''}
          </Text>
          
          {collections.map((collection) => {
            const IconComponent = getCollectionIcon(collection.name);
            
            return (
              <TouchableOpacity
                key={collection.id}
                style={styles.collectionItem}
                onPress={() => handleCollectionPress(collection.id)}
              >
                <View style={styles.collectionIcon}>
                  <IconComponent size={24} color="#FF6B35" />
                </View>
                
                <View style={styles.collectionInfo}>
                  <View style={styles.collectionHeader}>
                    <Text style={styles.collectionName}>{collection.name}</Text>
                    {collection.is_default && (
                      <View style={styles.defaultBadge}>
                        <Text style={styles.defaultBadgeText}>Default</Text>
                      </View>
                    )}
                  </View>
                  
                  {collection.description ? (
                    <Text style={styles.collectionDescription}>{collection.description}</Text>
                  ) : null}
                  
                  <Text style={styles.collectionCount}>
                    {collection.recipe_count} recipe{collection.recipe_count !== 1 ? 's' : ''}
                  </Text>
                </View>

                {!collection.is_default && (
                  <TouchableOpacity 
                    style={styles.deleteButton}
                    onPress={() => handleDeleteCollection(collection.id)}
                  >
                    <X size={16} color="#EF4444" />
                  </TouchableOpacity>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Empty State */}
        {collections.length === 0 && (
          <View style={styles.emptyState}>
            <Folder size={48} color="#94A3B8" />
            <Text style={styles.emptyTitle}>No Collections Yet</Text>
            <Text style={styles.emptyText}>
              Create collections to organize your favorite recipes
            </Text>
            <TouchableOpacity 
              style={styles.emptyButton}
              onPress={() => setShowCreateForm(true)}
            >
              <Plus size={20} color="#FFFFFF" />
              <Text style={styles.emptyButtonText}>Create Your First Collection</Text>
            </TouchableOpacity>
          </View>
        )}

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
  addButton: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
  createForm: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  formHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  formTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#1E293B',
  },
  closeButton: {
    padding: 4,
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
  createButton: {
    backgroundColor: '#FF6B35',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  createButtonDisabled: {
    opacity: 0.6,
  },
  createButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  collectionsSection: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    borderRadius: 16,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#1E293B',
    marginBottom: 16,
  },
  collectionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  collectionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FEF7F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  collectionInfo: {
    flex: 1,
  },
  collectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  collectionName: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1E293B',
    marginRight: 8,
  },
  defaultBadge: {
    backgroundColor: '#4ECDC4',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  defaultBadgeText: {
    fontSize: 10,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  collectionDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
    marginBottom: 4,
  },
  collectionCount: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#94A3B8',
  },
  deleteButton: {
    padding: 8,
    marginLeft: 8,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    color: '#64748B',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#94A3B8',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF6B35',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    gap: 8,
  },
  emptyButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
  },
  bottomPadding: {
    height: 80,
  },
});