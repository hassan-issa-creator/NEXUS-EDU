import { StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { Text, View } from '@/components/Themed';
import { useAuth } from '@/context/AuthContext';
import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api';
import { router } from 'expo-router';

export default function TabOneScreen() {
  const { user, signOut } = useAuth();
  const [classes, setClasses] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchClasses = async () => {
    try {
      // Assuming existing backend endpoint: /classes/student/enrolled
      // Or similar. I should check backend routes.
      // Based on ClassController: @Get('student') -> findAllEnrolled
      const res = await apiClient.get('/classes/student');
      setClasses(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchClasses();
    setRefreshing(false);
  };

  useEffect(() => {
    if (user) {
      fetchClasses();
    } else {
      // If not logged in and somehow here, redirect?
      // AuthContext handles redirect usually.
    }
  }, [user]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
         <Text style={styles.title}>Welcome, {user?.name || user?.firstName || 'Student'}</Text>
         <TouchableOpacity onPress={signOut}>
            <Text style={{ color: 'red' }}>Logout</Text>
         </TouchableOpacity>
      </View>
      
      <Text style={styles.subtitle}>My Classes</Text>
      
      <FlatList
        data={classes}
        keyExtractor={(item: any) => item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{item.name}</Text>
            <Text style={styles.cardDesc}>{item.description || 'No description'}</Text>
            {/* Display next live session if any? */}
          </View>
        )}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 40, 
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
    color: '#666',
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%',
  },
  card: {
    backgroundColor: '#f0f0f0', // Should use theme colors ideally
    padding: 20,
    borderRadius: 12,
    marginBottom: 15,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#000',
  },
  cardDesc: {
    color: '#666',
  },
});
