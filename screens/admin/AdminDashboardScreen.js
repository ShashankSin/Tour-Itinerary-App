import React from 'react'
import { View, Text, ScrollView, TouchableOpacity } from 'react-native'
import {
  BarChart3,
  Users,
  Building2,
  TrendingUp,
  DollarSign,
  Activity,
} from 'lucide-react-native'

function AdminDashboardScreen() {
  const stats = [
    {
      title: 'Total Users',
      value: '2,847',
      change: '+12%',
      icon: Users,
      color: 'bg-blue-500',
    },
    {
      title: 'Companies',
      value: '156',
      change: '+8%',
      icon: Building2,
      color: 'bg-green-500',
    },
    {
      title: 'Revenue',
      value: '$45,231',
      change: '+23%',
      icon: DollarSign,
      color: 'bg-purple-500',
    },
    {
      title: 'Growth',
      value: '18.2%',
      change: '+5%',
      icon: TrendingUp,
      color: 'bg-orange-500',
    },
  ]

  const recentActivities = [
    { action: 'New user registered', user: 'John Doe', time: '2 minutes ago' },
    { action: 'Company verified', user: 'Acme Corp', time: '15 minutes ago' },
    { action: 'Payment processed', user: 'Tech Solutions', time: '1 hour ago' },
    { action: 'User profile updated', user: 'Jane Smith', time: '2 hours ago' },
  ]

  return (
    <ScrollView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white px-6 py-8 border-b border-gray-200">
        <Text className="text-3xl font-bold text-gray-900">Dashboard</Text>
        <Text className="text-gray-600 mt-1">Welcome back, Admin</Text>
      </View>

      {/* Stats Grid */}
      <View className="px-6 py-6">
        <Text className="text-xl font-semibold text-gray-900 mb-4">
          Overview
        </Text>
        <View className="flex-row flex-wrap -mx-2">
          {stats.map((stat, index) => (
            <View key={index} className="w-1/2 px-2 mb-4">
              <View className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <View className="flex-row items-center justify-between mb-3">
                  <View
                    className={`w-10 h-10 rounded-lg ${stat.color} items-center justify-center`}
                  >
                    <stat.icon size={20} color="white" />
                  </View>
                  <Text className="text-green-600 text-sm font-medium">
                    {stat.change}
                  </Text>
                </View>
                <Text className="text-2xl font-bold text-gray-900">
                  {stat.value}
                </Text>
                <Text className="text-gray-600 text-sm">{stat.title}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* Quick Actions */}
      <View className="px-6 pb-6">
        <Text className="text-xl font-semibold text-gray-900 mb-4">
          Quick Actions
        </Text>
        <View className="flex-row space-x-3">
          <TouchableOpacity className="flex-1 bg-blue-500 rounded-xl p-4 items-center">
            <Users size={24} color="white" />
            <Text className="text-white font-medium mt-2">Manage Users</Text>
          </TouchableOpacity>
          <TouchableOpacity className="flex-1 bg-green-500 rounded-xl p-4 items-center">
            <Building2 size={24} color="white" />
            <Text className="text-white font-medium mt-2">View Companies</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Recent Activity */}
      <View className="px-6 pb-8">
        <Text className="text-xl font-semibold text-gray-900 mb-4">
          Recent Activity
        </Text>
        <View className="bg-white rounded-xl border border-gray-200">
          {recentActivities.map((activity, index) => (
            <View
              key={index}
              className={`p-4 ${
                index !== recentActivities.length - 1
                  ? 'border-b border-gray-100'
                  : ''
              }`}
            >
              <View className="flex-row items-center">
                <View className="w-8 h-8 bg-blue-100 rounded-full items-center justify-center mr-3">
                  <Activity size={16} color="#3B82F6" />
                </View>
                <View className="flex-1">
                  <Text className="text-gray-900 font-medium">
                    {activity.action}
                  </Text>
                  <Text className="text-gray-600 text-sm">
                    {activity.user} • {activity.time}
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  )
}

export default AdminDashboardScreen
