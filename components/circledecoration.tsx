import React from "react";
import { View, StyleSheet } from "react-native";

/**
 * Two circles overlapping in the top-left corner.
 * - circleOne is bigger and partially off the screen
 * - circleTwo is smaller and overlaps circleOne
 */
export function CircleDecoration() {
  return (
    <View style={styles.container}>
      {/* Larger circle (behind) */}
      <View style={styles.circleOne} />
      {/* Smaller circle (front) */}
      <View style={styles.circleTwo} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    // Make this component absolutely positioned so it sits on top-left of the screen
    position: "absolute",
    top: 0,
    left: 0,
    width: 300, // container width
    height: 300, // container height
    // If you want to hide the portion that goes outside, you can set overflow: "hidden"
  },
  circleOne: {
    position: "absolute",
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: "#EAF4F4", // primary100
    top: -40,   // negative moves circle partially offscreen
    left: -40,
  },
  circleTwo: {
    position: "absolute",
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: "#CCE3DE", // primary200
    top: 30,   // overlaps circleOne
    left: 50,
  },
});
