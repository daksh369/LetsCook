import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, SafeAreaView, TouchableOpacity, Switch, Alert } from 'react-native';
import { ArrowLeft, Bell, Shield, Palette, Download, HelpCircle, LogOut, ChevronRight } from 'lucide-react-native';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';

export default function SettingsScreen() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(false);
  const [socialNotifications, setSocialNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [privateProfile, setPrivateProfile] = useState(false);

  const { signOut } = useAuth();

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

  const SettingItem = ({ 
    icon, 
    title, 
    subtitle, 
    onPress, 
    showSwitch = false, 
    switchValue = false, 
    onSwitchChange 
  }: {
    icon: React.ReactNode;
    title: string;
    subtitle?: string;
    onPress?: () => void;
    showSwitch?: boolean;
    switchValue?: boolean;
    onSwitchChange?: (value: boolean) => void;
  }) => (
    <TouchableOpacity 
      style={styles.settingItem} 
      onPress={onPress}
      disabled={showSwitch}
    >
      <View style={styles.settingIcon}>
        {icon}
      </View>
      <View style={styles.settingContent}>
        <Text style={styles.settingTitle}>{title}</Text>
        {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
      </View>
      {showSwitch ? (
        <Switch
          value={switchValue}
          onValueChange={onSwitchChange}
          trackColor={{ false: '#E2E8F0', true: '#FF6B35' }}
          thumbColor={switchValue ? '#FFFFFF' : '#94A3B8'}
        />
      ) : (
        <ChevronRight size={20} color="#94A3B8" />
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color="#1E293B" />
        </TouchableOpacity>
        <Text style={styles.title}>Settings</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Notifications */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          
          <SettingItem
            icon={<Bell size={20} color="#FF6B35" />}
            title="Push Notifications"
            subtitle="Receive notifications on your device"
            showSwitch
            switchValue={pushNotifications}
            onSwitchChange={setPushNotifications}
          />
          
          <SettingItem
            icon={<Bell size={20} color="#4ECDC4" />}
            title="Email Notifications"
            subtitle="Receive notifications via email"
            showSwitch
            switchValue={emailNotifications}
            onSwitchChange={setEmailNotifications}
          />
          
          <SettingItem
            icon={<Bell size={20} color="#6C5CE7" />}
            title="Social Activity"
            subtitle="Likes, follows, and comments"
            showSwitch
            switchValue={socialNotifications}
            onSwitchChange={setSocialNotifications}
          />
        </View>

        {/* Privacy & Security */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Privacy & Security</Text>
          
          <SettingItem
            icon={<Shield size={20} color="#EF4444" />}
            title="Private Profile"
            subtitle="Only followers can see your recipes"
            showSwitch
            switchValue={privateProfile}
            onSwitchChange={setPrivateProfile}
          />
          
          <SettingItem
            icon={<Shield size={20} color="#10B981" />}
            title="Data & Privacy"
            subtitle="Manage your data and privacy settings"
            onPress={() => Alert.alert('Coming Soon', 'Data & Privacy settings will be available soon.')}
          />
          
          <SettingItem
            icon={<Shield size={20} color="#F59E0B" />}
            title="Blocked Users"
            subtitle="Manage blocked users"
            onPress={() => Alert.alert('Coming Soon', 'Blocked users management will be available soon.')}
          />
        </View>

        {/* Appearance */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Appearance</Text>
          
          <SettingItem
            icon={<Palette size={20} color="#8B5CF6" />}
            title="Dark Mode"
            subtitle="Switch to dark theme"
            showSwitch
            switchValue={darkMode}
            onSwitchChange={setDarkMode}
          />
          
          <SettingItem
            icon={<Palette size={20} color="#06B6D4" />}
            title="Theme Color"
            subtitle="Customize your app theme"
            onPress={() => Alert.alert('Coming Soon', 'Theme customization will be available soon.')}
          />
        </View>

        {/* Data */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data</Text>
          
          <SettingItem
            icon={<Download size={20} color="#059669" />}
            title="Export Data"
            subtitle="Download your recipes and data"
            onPress={() => Alert.alert('Coming Soon', 'Data export will be available soon.')}
          />
          
          <SettingItem
            icon={<Download size={20} color="#DC2626" />}
            title="Delete Account"
            subtitle="Permanently delete your account"
            onPress={() => Alert.alert(
              'Delete Account',
              'This action cannot be undone. Are you sure you want to delete your account?',
              [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Delete', style: 'destructive' }
              ]
            )}
          />
        </View>

        {/* Support */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>
          
          <SettingItem
            icon={<HelpCircle size={20} color="#3B82F6" />}
            title="Help Center"
            subtitle="Get help and support"
            onPress={() => Alert.alert('Coming Soon', 'Help center will be available soon.')}
          />
          
          <SettingItem
            icon={<HelpCircle size={20} color="#F59E0B" />}
            title="Contact Us"
            subtitle="Send feedback or report issues"
            onPress={() => Alert.alert('Coming Soon', 'Contact form will be available soon.')}
          />
        </View>

        {/* Account */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          
          <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
            <LogOut size={20} color="#EF4444" />
            <Text style={styles.signOutText}>Sign Out</Text>
          </TouchableOpacity>
        </View>

        {/* App Info */}
        <View style={styles.appInfo}>
          <Text style={styles.appVersion}>LetsCook v1.0.0</Text>
          <Text style={styles.appCopyright}>© 2024 LetsCook. All rights reserved.</Text>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  backButton: {
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
  section: {
    backgroundColor: '#FFFFFF',
    marginVertical: 8,
    paddingVertical: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1E293B',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#F8FAFC',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1E293B',
  },
  settingSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#64748B',
    marginTop: 2,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  signOutText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#EF4444',
    marginLeft: 12,
  },
  appInfo: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 16,
  },
  appVersion: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#64748B',
    marginBottom: 4,
  },
  appCopyright: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#94A3B8',
  },
  bottomPadding: {
    height: 80,
  },
});