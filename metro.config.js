const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const defaultConfig = getDefaultConfig(__dirname);

// Wrap with NativeWind
const config = withNativeWind(defaultConfig, {
  input: "./css/global.css",
});

// Add react-native-qrcode-svg transformer safely
config.transformer = {
  ...config.transformer,
  babelTransformerPath: require.resolve(
    "react-native-qrcode-svg/textEncodingTransformation"
  ),
};

module.exports = config;
