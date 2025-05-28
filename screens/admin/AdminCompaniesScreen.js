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
  Users,
  MapPin,
  Calendar,
  Star,
} from 'lucide-react-native'

function AdminCompaniesScreen() {
  const [searchQuery, setSearchQuery] = useState('')

  const companies = [
    {
      id: 1,
      name: 'Acme Corporation',
      industry: 'Technology',
      employees: 250,
      location: 'San Francisco, CA',
      status: 'Verified',
      joinDate: '2024-01-15',
      rating: 4.8,
      logo: 'AC',
    },
    {
      id: 2,
      name: 'Tech Solutions Inc',
      industry: 'Software',
      employees: 120,
      location: 'Austin, TX',
      status: 'Pending',
      joinDate: '2024-01-20',
      rating: 4.5,
      logo: 'TS',
    },
    {
      id: 3,
      name: 'Global Dynamics',
      industry: 'Manufacturing',
      employees: 500,
      location: 'Detroit, MI',
      status: 'Verified',
      joinDate: '2024-01-10',
      rating: 4.2,
      logo: 'GD',
    },
    {
      id: 4,
      name: 'Innovation Labs',
      industry: 'Research',
      employees: 75,
      location: 'Boston, MA',
      status: 'Rejected',
      joinDate: '2024-01-18',
      rating: 3.9,
      logo: 'IL',
    },
  ]

  const getStatusColor = (status) => {
    switch (status) {
      case 'Verified':
        return 'bg-green-100 text-green-800'
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'Rejected':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getIndustryColor = (industry) => {
    switch (industry) {
      case 'Technology':
        return 'bg-blue-100 text-blue-800'
      case 'Software':
        return 'bg-purple-100 text-purple-800'
      case 'Manufacturing':
        return 'bg-orange-100 text-orange-800'
      case 'Research':
        return 'bg-teal-100 text-teal-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white px-6 py-8 border-b border-gray-200">
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-3xl font-bold text-gray-900">Companies</Text>
            <Text className="text-gray-600 mt-1">
              {companies.length} registered companies
            </Text>
          </View>
          <TouchableOpacity className="bg-blue-500 rounded-xl px-4 py-3 flex-row items-center">
            <Plus size={20} color="white" />
            <Text className="text-white font-medium ml-2">Add Company</Text>
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
              placeholder="Search companies..."
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
          <TouchableOpacity className="bg-gray-100 rounded-xl px-4 py-3">
            <Filter size={20} color="#6B7280" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Company List */}
      <ScrollView className="flex-1 px-6 py-4">
        {companies.map((company) => (
          <View
            key={company.id}
            className="bg-white rounded-xl p-4 mb-3 border border-gray-200"
          >
            <View className="flex-row items-start justify-between">
              <View className="flex-row flex-1">
                {/* Company Logo */}
                <View
                  style={{ backgroundColor: '#4F46E5' }}
                  className="w-14 h-14 rounded-xl items-center justify-center mr-4"
                >
                  <Text className="text-white font-bold text-lg">
                    {company.logo}
                  </Text>
                </View>

                {/* Info */}
                <View className="flex-1">
                  <View className="flex-row items-center mb-2">
                    <Text className="text-lg font-semibold text-gray-900 mr-2">
                      {company.name}
                    </Text>
                    <View
                      className={`px-2 py-1 rounded-full ${getStatusColor(
                        company.status
                      )}`}
                    >
                      <Text className="text-xs font-medium">
                        {company.status}
                      </Text>
                    </View>
                  </View>

                  <View
                    className={`self-start px-2 py-1 rounded-full mb-3 ${getIndustryColor(
                      company.industry
                    )}`}
                  >
                    <Text className="text-xs font-medium">
                      {company.industry}
                    </Text>
                  </View>

                  <View className="space-y-2">
                    <View className="flex-row items-center">
                      <Users size={14} color="#6B7280" />
                      <Text className="text-gray-600 text-sm ml-2">
                        {company.employees} employees
                      </Text>
                    </View>
                    <View className="flex-row items-center">
                      <MapPin size={14} color="#6B7280" />
                      <Text className="text-gray-600 text-sm ml-2">
                        {company.location}
                      </Text>
                    </View>
                    <View className="flex-row items-center">
                      <Star size={14} color="#F59E0B" />
                      <Text className="text-gray-600 text-sm ml-2">
                        {company.rating} rating
                      </Text>
                    </View>
                    <View className="flex-row items-center">
                      <Calendar size={14} color="#6B7280" />
                      <Text className="text-gray-600 text-sm ml-2">
                        Joined {company.joinDate}
                      </Text>
                    </View>
                  </View>
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

export default AdminCompaniesScreen
