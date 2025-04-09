import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  SafeAreaView,
  Dimensions,
  ScrollView,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { auth } from "@/firebaseConfig";
import { ip } from "@/utils/server_ip.json";
import { BarChart, LineChart } from "react-native-gifted-charts";
import * as Progress from "react-native-progress";

export default function TestResultScreen() {
  const { id } = useLocalSearchParams(); // test docid
  const [test, setTest] = useState(null);
  const [loading, setLoading] = useState(true);
  const apiURL = `http://${ip}:8000`;

  useEffect(() => {
    fetchTest();
  }, [id]);

  const fetchTest = async () => {
    const token = await auth.currentUser.getIdToken();
    const res = await fetch(`${apiURL}/grades/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      console.error("❌ Failed to fetch test");
      setLoading(false);
      return;
    }

    const data = await res.json();
    setTest(data);
    setLoading(false);
  };

  const calculateStats = () => {
    const scores = test?.childrenscore || [];
    if (!scores.length) return { average: 0, median: 0, mode: 0, min: 0, max: 0 };

    const average = scores.reduce((sum, val) => sum + val, 0) / scores.length;

    const sorted = [...scores].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    const median = sorted.length % 2 === 0
      ? (sorted[mid - 1] + sorted[mid]) / 2
      : sorted[mid];

    const frequency = {};
    let mode = scores[0];
    let maxFreq = 0;
    for (let score of scores) {
      frequency[score] = (frequency[score] || 0) + 1;
      if (frequency[score] > maxFreq) {
        maxFreq = frequency[score];
        mode = score;
      }
    }

    const min = sorted[0];
    const max = sorted[sorted.length - 1];

    return { average, median, mode, min, max };
  };

  const renderItem = ({ item, index }) => {
    const name = test?.childrenname[index] || "Unnamed";
    const score = test?.childrenscore[index] ?? 0;
    const percentage = Math.min(score / 100, 1);

    return (
      <View className="bg-white px-4 py-3 rounded-xl mb-3 shadow-md border border-gray-200">
        <Text className="text-base font-bold text-gray-800 mb-1">{name}</Text>
        <Progress.Bar
          progress={percentage}
          width={null}
          color="#6FCF97"
          unfilledColor="#E0E0E0"
          borderWidth={0}
          height={12}
        />
        <Text className="text-sm text-gray-600 mt-1">Score: {score}</Text>
      </View>
    );
  };

  const screenWidth = Dimensions.get("window").width;
  const stats = calculateStats();
  const { average, median, mode, min, max } = stats;
  const barData = test?.childrenname.map((name, index) => ({
    label: name.split(" ")[0],
    value: test.childrenscore[index],
  })) || [];

  const lineData = test?.childrenscore.map((value, index) => ({
    value,
    label: test.childrenname[index]?.split(" ")[0] || index.toString(),
  })) || [];

  return (
    <SafeAreaView className="flex-1 bg-primary-50 px-5 pt-6">
      {loading ? (
        <ActivityIndicator size="large" color="#999" />
      ) : (
        <ScrollView showsVerticalScrollIndicator={false}>
          <Text className="text-2xl font-extrabold text-[#2A2E43] mb-2">
            {test?.testname}
          </Text>
          <Text className="text-base text-gray-500 mb-4">
            Class: {test?.class}
          </Text>

          {/* Class Stats */}
          <View className="mb-6 bg-white p-4 rounded-2xl shadow-sm border border-gray-200">
            <Text className="text-xl font-bold text-[#2A2E43] mb-2">
              📊 Class Statistics
            </Text>
            <Text className="text-sm text-gray-700 leading-6">
              Average: <Text className="font-semibold text-[#FF6B6B]">{average.toFixed(2)}</Text>{"  "}
              Median: <Text className="font-semibold text-[#6A5ACD]">{median.toFixed(2)}</Text>{"  "}
              Mode: <Text className="font-semibold text-[#1D4ED8]">{mode.toFixed(2)}</Text>{"  "}
              Min: <Text className="font-semibold text-[#059669]">{min}</Text>{"  "}
              Max: <Text className="font-semibold text-[#DC2626]">{max}</Text>
            </Text>
          </View>

          {/* Bar Chart with Stats Lines */}
          <View className="mb-8 bg-white p-4 rounded-2xl shadow-sm">
            <Text className="text-base font-semibold text-[#2A2E43] mb-3">Overview</Text>
            <BarChart
              barWidth={26}
              noOfSections={5}
              maxValue={100}
              frontColor="#6FCF97"
              gradientColor="#72E1D1"
              showGradient
              isAnimated
              animateOnRender
              hideRules
              yAxisThickness={0}
              labelTextStyle={{ color: '#6B7280', fontSize: 10 }}
              data={barData}
              referenceLinesCustom={[
                {
                  value: average,
                  color: '#FF6B6B',
                  label: 'Average',
                  labelTextStyle: { color: '#FF6B6B', fontSize: 12, fontWeight: 'bold' },
                },
                {
                  value: median,
                  color: '#6A5ACD',
                  label: 'Median',
                  labelTextStyle: { color: '#6A5ACD', fontSize: 12, fontWeight: 'bold' },
                },
                {
                  value: mode,
                  color: '#1D4ED8',
                  label: 'Mode',
                  labelTextStyle: { color: '#1D4ED8', fontSize: 12, fontWeight: 'bold' },
                },
              ]}
            />
          </View>

          {/* Line Chart */}
          <View className="mb-8 bg-white p-4 rounded-2xl shadow-sm">
            <Text className="text-base font-semibold text-[#2A2E43] mb-3">Trend Line</Text>
            <LineChart
              areaChart
              curved
              data={lineData}
              hideDataPoints
              isAnimated
              thickness={2}
              color="#FF9F40"
              maxValue={100}
              noOfSections={5}
              yAxisThickness={0}
              xAxisLabelTextStyle={{ color: '#6B7280', fontSize: 10 }}
            />
          </View>

          {/* Detailed List */}
          <FlatList
            data={test?.childrenid || []}
            renderItem={renderItem}
            keyExtractor={(item, index) => `${item}_${index}`}
            scrollEnabled={false}
            contentContainerStyle={{ paddingBottom: 40 }}
          />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}