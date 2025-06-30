import { useState, useEffect } from 'react';
import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy,
  getDoc,
  limit
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';

export interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  avatar_url?: string;
  bio?: string;
  followers_count: number;
  following_count: number;
  recipes_count: number;
  dietary_preferences: string[];
  skill_level: 'Beginner' | 'Intermediate' | 'Advanced';
  created_at: string;
  updated_at: string;
  isFollowing?: boolean;
}

export function useUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchUsers = async (searchQuery?: string) => {
    try {
      setLoading(true);
      
      let usersQuery;
      if (searchQuery) {
        // Search by name or username
        usersQuery = query(
          collection(db, 'profiles'),
          orderBy('name'),
          limit(20)
        );
      } else {
        // Get all users
        usersQuery = query(
          collection(db, 'profiles'),
          orderBy('followers_count', 'desc'),
          limit(50)
        );
      }
      
      const usersSnapshot = await getDocs(usersQuery);
      const usersData = usersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as User[];

      // Filter by search query if provided
      let filteredUsers = usersData;
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        filteredUsers = usersData.filter(userData => 
          userData.name.toLowerCase().includes(query) ||
          userData.username.toLowerCase().includes(query)
        );
      }

      // Check following status if user is logged in
      if (user) {
        const usersWithFollowStatus = await Promise.all(
          filteredUsers.map(async (userData) => {
            if (userData.id === user.uid) {
              return { ...userData, isFollowing: false }; // Don't show follow button for self
            }

            try {
              const followQuery = query(
                collection(db, 'user_follows'),
                where('follower_id', '==', user.uid),
                where('following_id', '==', userData.id)
              );
              const followSnapshot = await getDocs(followQuery);
              const isFollowing = !followSnapshot.empty;

              return {
                ...userData,
                isFollowing,
              };
            } catch (error) {
              console.error('Error checking follow status:', error);
              return { ...userData, isFollowing: false };
            }
          })
        );
        setUsers(usersWithFollowStatus);
      } else {
        setUsers(filteredUsers);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const toggleFollow = async (userId: string) => {
    if (!user) return;

    try {
      const followQuery = query(
        collection(db, 'user_follows'),
        where('follower_id', '==', user.uid),
        where('following_id', '==', userId)
      );
      
      const followSnapshot = await getDocs(followQuery);
      const isCurrentlyFollowing = !followSnapshot.empty;
      
      if (isCurrentlyFollowing) {
        // Unfollow
        const followDoc = followSnapshot.docs[0];
        await deleteDoc(doc(db, 'user_follows', followDoc.id));
        
        // Update follower count
        const userRef = doc(db, 'profiles', userId);
        const userDoc = await getDoc(userRef);
        if (userDoc.exists()) {
          const currentCount = userDoc.data().followers_count || 0;
          await updateDoc(userRef, {
            followers_count: Math.max(0, currentCount - 1),
            updated_at: new Date().toISOString(),
          });
        }

        // Update current user's following count
        const currentUserRef = doc(db, 'profiles', user.uid);
        const currentUserDoc = await getDoc(currentUserRef);
        if (currentUserDoc.exists()) {
          const currentCount = currentUserDoc.data().following_count || 0;
          await updateDoc(currentUserRef, {
            following_count: Math.max(0, currentCount - 1),
            updated_at: new Date().toISOString(),
          });
        }
      } else {
        // Follow
        await addDoc(collection(db, 'user_follows'), {
          follower_id: user.uid,
          following_id: userId,
          created_at: new Date().toISOString(),
        });
        
        // Update follower count
        const userRef = doc(db, 'profiles', userId);
        const userDoc = await getDoc(userRef);
        if (userDoc.exists()) {
          const currentCount = userDoc.data().followers_count || 0;
          await updateDoc(userRef, {
            followers_count: currentCount + 1,
            updated_at: new Date().toISOString(),
          });
        }

        // Update current user's following count
        const currentUserRef = doc(db, 'profiles', user.uid);
        const currentUserDoc = await getDoc(currentUserRef);
        if (currentUserDoc.exists()) {
          const currentCount = currentUserDoc.data().following_count || 0;
          await updateDoc(currentUserRef, {
            following_count: currentCount + 1,
            updated_at: new Date().toISOString(),
          });
        }
      }

      // Update local state
      setUsers(prev => 
        prev.map(userData => 
          userData.id === userId 
            ? { 
                ...userData, 
                isFollowing: !userData.isFollowing,
                followers_count: isCurrentlyFollowing 
                  ? userData.followers_count - 1 
                  : userData.followers_count + 1
              }
            : userData
        )
      );
    } catch (error) {
      console.error('Error toggling follow:', error);
    }
  };

  const getUserById = async (userId: string): Promise<User | null> => {
    try {
      const userDoc = await getDoc(doc(db, 'profiles', userId));
      if (userDoc.exists()) {
        const userData = { id: userDoc.id, ...userDoc.data() } as User;
        
        // Check following status if current user is logged in
        if (user && user.uid !== userId) {
          const followQuery = query(
            collection(db, 'user_follows'),
            where('follower_id', '==', user.uid),
            where('following_id', '==', userId)
          );
          const followSnapshot = await getDocs(followQuery);
          userData.isFollowing = !followSnapshot.empty;
        }
        
        return userData;
      }
      return null;
    } catch (error) {
      console.error('Error fetching user by ID:', error);
      return null;
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [user]);

  return {
    users,
    loading,
    fetchUsers,
    toggleFollow,
    getUserById,
  };
}