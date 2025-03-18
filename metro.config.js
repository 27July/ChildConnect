const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

module.exports = withNativeWind(
  (() => {
    const config = getDefaultConfig(__dirname);

    // Remove svg from assetExts and add it to sourceExts
    config.resolver.assetExts = config.resolver.assetExts.filter((ext) => ext !== "svg");
    config.resolver.sourceExts.push("svg");

    config.transformer = {
      ...config.transformer,
      babelTransformerPath: require.resolve("react-native-svg-transformer"),
    };

    return config;
  })(),
  { input: "./app/globals.css" } // NativeWind config
);
