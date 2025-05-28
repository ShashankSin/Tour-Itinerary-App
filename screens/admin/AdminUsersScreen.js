import React, { useState } from 'react'
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native'
import {
  Search,
  Filter,
  Plus,
  MoreVertical,
  Mail,
  Phone,
  MapPin,
} from 'lucide-react-native'
import { useNavigation } from '@react-navigation/native'

function AdminUsersScreen() {
  const navigation = useNavigation()
  const [searchQuery, setSearchQuery] = useState('')

  const users = [
    {
      id: 1,
      name: 'John Doe',
      email: 'john.doe@example.com',
      phone: '+1 (555) 123-4567',
      location: 'New York, NY',
      status: 'Active',
      role: 'User',
      joinDate: '2024-01-15',
      avatar: 'JD',
    },
    {
      id: 2,
      name: 'Jane Smith',
      email: 'jane.smith@example.com',
      phone: '+1 (555) 987-6543',
      location: 'Los Angeles, CA',
      status: 'Active',
      role: 'Admin',
      joinDate: '2024-01-10',
      avatar: 'JS',
    },
    {
      id: 3,
      name: 'Mike Johnson',
      email: 'mike.johnson@example.com',
      phone: '+1 (555) 456-7890',
      location: 'Chicago, IL',
      status: 'Inactive',
      role: 'User',
      joinDate: '2024-01-08',
      avatar: 'MJ',
    },
    {
      id: 4,
      name: 'Sarah Wilson',
      email: 'sarah.wilson@example.com',
      phone: '+1 (555) 321-0987',
      location: 'Miami, FL',
      status: 'Active',
      role: 'Moderator',
      joinDate: '2024-01-12',
      avatar: 'SW',
    },
  ]

  const filteredUsers = users.filter((user) =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getStatusColor = (status) => {
    return status === 'Active'
      ? 'bg-green-100 text-green-800'
      : 'bg-red-100 text-red-800'
  }

  const getRoleColor = (role) => {
    switch (role) {
      case 'Admin':
        return 'bg-purple-100 text-purple-800'
      case 'Moderator':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const handleAddUser = () => {
    // Replace this with navigation logic if needed
    console.log('Add User Pressed')
    // navigation.navigate('AddUserScreen')
  }

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white px-6 py-8 border-b border-gray-200">
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-3xl font-bold text-gray-900">Users</Text>
            <Text className="text-gray-600 mt-1">
              {filteredUsers.length} total users
            </Text>
          </View>
          <TouchableOpacity
            className="bg-blue-500 rounded-xl px-4 py-3 flex-row items-center"
            onPress={handleAddUser}
          >
            <Plus size={20} color="white" />
            <Text className="text-white font-medium ml-2">Add User</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Search and Filter */}
      <View className="bg-white px-6 py-4 border-b border-gray-200">
        <View className="flex-row space-x-3">
          <View className="flex-1 bg-gray-100 rounded-xl px-4 py-3 flex-row items-center">
            <Search size={20} color="#6B7280" />
            <TextInput
              className="flex-1 ml-3 text-gray-900"
              placeholder="Search users..."
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
          <TouchableOpacity className="bg-gray-100 rounded-xl px-4 py-3">
            <Filter size={20} color="#6B7280" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Users List */}
      <ScrollView className="flex-1 px-6 py-4">
        {filteredUsers.map((user) => (
          <View
            key={user.id}
            className="bg-white rounded-xl p-4 mb-3 border border-gray-200"
          >
            <View className="flex-row items-start justify-between">
              <View className="flex-row flex-1">
                {/* Avatar */}
                <View className="w-12 h-12 bg-blue-500 rounded-full items-center justify-center mr-4">
                  <Text className="text-white font-bold">{user.avatar}</Text>
                </View>

                {/* User Info */}
                <View className="flex-1">
                  <View className="flex-row items-center mb-1">
                    <Text className="text-lg font-semibold text-gray-900 mr-2">
                      {user.name}
                    </Text>
                    <View
                      className={`px-2 py-1 rounded-full ${getStatusColor(
                        user.status
                      )}`}
                    >
                      <Text className="text-xs font-medium">{user.status}</Text>
                    </View>
                  </View>

                  <View
                    className={`self-start px-2 py-1 rounded-full mb-3 ${getRoleColor(
                      user.role
                    )}`}
                  >
                    <Text className="text-xs font-medium">{user.role}</Text>
                  </View>

                  <View className="space-y-2">
                    <View className="flex-row items-center">
                      <Mail size={14} color="#6B7280" />
                      <Text className="text-gray-600 text-sm ml-2">
                        {user.email}
                      </Text>
                    </View>
                    <View className="flex-row items-center">
                      <Phone size={14} color="#6B7280" />
                      <Text className="text-gray-600 text-sm ml-2">
                        {user.phone}
                      </Text>
                    </View>
                    <View className="flex-row items-center">
                      <MapPin size={14} color="#6B7280" />
                      <Text className="text-gray-600 text-sm ml-2">
                        {user.location}
                      </Text>
                    </View>
                  </View>

                  <Text className="text-gray-500 text-xs mt-3">
                    Joined {user.joinDate}
                  </Text>
                </View>
              </View>

              {/* Actions */}
              <TouchableOpacity className="p-2">
                <MoreVertical size={20} color="#6B7280" />
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  )
}

export default AdminUsersScreen
