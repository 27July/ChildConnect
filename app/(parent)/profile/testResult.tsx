import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { auth } from "@/firebaseConfig";
import { ip } from "@/utils/server_ip.json";
import { PieChart } from "react-native-gifted-charts";

export default function TestResultScreen() {
  const { id: childid } = useLocalSearchParams();
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [countData, setCountData] = useState({ excellent: 0, average: 0, poor: 0 });
  const apiURL = `http://${ip}:8000`;

  useEffect(() => {
    fetchTests();
  }, [childid]);

  const fetchTests = async () => {
    try {
      const token = await auth.currentUser.getIdToken();
      const res = await fetch(`${apiURL}/grades/by-child/${childid}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Failed to fetch tests");
      const data = await res.json();
      setTests(data);
      calculateCounts(data);
    } catch (error) {
      console.error("❌ Error fetching tests:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateCounts = (testsData) => {
    let localCount = { excellent: 0, average: 0, poor: 0 };  // Changed from 'count' to 'localCount'
    testsData.forEach((test) => {
      const stats = calculateStats(test.all_scores);
      const category = getPerformanceCategory(test.score, stats.median);
      localCount[category]++;  // Updated to use localCount
    });
    setCountData(localCount);  // Pass localCount to setCountData
  };

  const calculateStats = (scores) => {
    if (!scores || scores.length === 0) return {};

    const sorted = [...scores].sort((a, b) => a - b);
    const average = scores.reduce((sum, s) => sum + s, 0) / scores.length;
    const mid = Math.floor(sorted.length / 2);
    const median =
      sorted.length % 2 === 0
        ? (sorted[mid - 1] + sorted[mid]) / 2
        : sorted[mid];
    const max = Math.max(...scores);
    const min = Math.min(...scores);

    const frequency = {};
    scores.forEach((s) => (frequency[s] = (frequency[s] || 0) + 1));
    const mode = parseInt(
      Object.keys(frequency).reduce((a, b) =>
        frequency[a] > frequency[b] ? a : b
      )
    );

    return { average, median, mode, max, min };
  };

  const getPerformanceCategory = (score, median) => {
    if (score >= median + 10) return "excellent";
    if (score <= median - 10) return "poor";
    return "average";
  };

  const getOverallPerformance = () => {
    const total = tests.length || 1;
    // Only include categories with values > 0, but don't show percentages
    return [
      ...(countData.excellent > 0 ? [{
        value: countData.excellent,
        color: "#34D399",
        text: "",  // Empty text to hide percentage
        focused: true,
      }] : []),
      ...(countData.average > 0 ? [{
        value: countData.average,
        color: "#FBBF24",
        text: "",  // Empty text to hide percentage
      }] : []),
      ...(countData.poor > 0 ? [{
        value: countData.poor,
        color: "#F87171", 
        text: "",  // Empty text to hide percentage
      }] : []),
    ];
  };

  const renderItem = ({ item }) => {
    const stats = calculateStats(item.all_scores);
    const category = getPerformanceCategory(item.score, stats.median);
    const color =
      category === "excellent"
        ? "text-green-600"
        : category === "poor"
        ? "text-red-500"
        : "text-yellow-500";

    return (
      <View className="bg-white px-4 py-3 rounded-xl mb-3 shadow-sm">
        <Text className="text-lg font-semibold text-primary-400">
          {item.testname}
        </Text>
        <Text className={`text-sm font-semibold mt-1 ${color}`}>
          Score: {item.score} / {item.total} ({category})
        </Text>
        <Text className="text-sm text-gray-400 mb-2">Class: {item.class}</Text>

        <View className="bg-primary-50 p-3 rounded-xl">
          <Text className="text-sm text-gray-600">
            Avg: {stats.average?.toFixed(1)} | Median: {stats.median} | Mode: {stats.mode}
          </Text>
          <Text className="text-sm text-gray-600">
            Max: {stats.max} | Min: {stats.min}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-primary-50 px-5 pt-6">
      <Text className="text-2xl font-extrabold text-[#2A2E43] mb-4">
        My Grades
      </Text>
      {loading ? (
        <ActivityIndicator size="large" color="#999" />
      ) : tests.length === 0 ? (
        <Text className="text-center text-gray-500">No test results found.</Text>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false}>
          <View className="bg-white rounded-2xl px-4 py-6 mb-5 shadow-sm">
            <Text className="text-lg font-semibold text-[#2A2E43] mb-3">
              Overall Performance
            </Text>
            <View className="items-center">
              <PieChart
                donut
                textColor="#2A2E43"
                textSize={14}
                radius={90}
                innerRadius={50}
                strokeWidth={0}
                data={getOverallPerformance()}
                centerLabelComponent={() => {
                  return (
                    <View style={{justifyContent: 'center', alignItems: 'center'}}>
                      <Text style={{fontSize: 18, fontWeight: '600', color: '#2A2E43'}}>
                        {tests.length}
                      </Text>
                      <Text style={{fontSize: 12, color: '#666'}}>Tests</Text>
                    </View>
                  );
                }}
              />
            </View>
            <View className="flex-row justify-around mt-6">
              {countData.excellent > 0 && (
                <View className="flex-row items-center">
                  <View className="w-3 h-3 rounded-full bg-green-400 mr-2" />
                  <Text className="text-sm text-gray-700">Excellent ({countData.excellent})</Text>
                </View>
              )}
              {countData.average > 0 && (
                <View className="flex-row items-center">
                  <View className="w-3 h-3 rounded-full bg-yellow-400 mr-2" />
                  <Text className="text-sm text-gray-700">Average ({countData.average})</Text>
                </View>
              )}
              {countData.poor > 0 && (
                <View className="flex-row items-center">
                  <View className="w-3 h-3 rounded-full bg-red-400 mr-2" />
                  <Text className="text-sm text-gray-700">Poor ({countData.poor})</Text>
                </View>
              )}
            </View>
          </View>

          <FlatList
            data={tests}
            renderItem={renderItem}
            keyExtractor={(item, index) => `${item.docid}_${index}`}
            scrollEnabled={false}
            contentContainerStyle={{ paddingBottom: 40 }}
          />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}