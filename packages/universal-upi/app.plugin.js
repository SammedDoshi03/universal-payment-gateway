const { createRunOncePlugin, withAndroidManifest, withInfoPlist } = require('@expo/config-plugins');

const pkg = require('./package.json');

const withUpiManifest = (config) => {
  return withAndroidManifest(config, async (config) => {
    let androidManifest = config.modResults.manifest;

    if (!androidManifest.queries) {
      androidManifest.queries = [];
    }

    const intentList = androidManifest.queries.find(
      (element) => element.intent && Array.isArray(element.intent)
    );

    const upiIntent = {
      $: {},
      action: [{ $: { 'android:name': 'android.intent.action.VIEW' } }],
      data: [{ $: { 'android:scheme': 'upi' } }],
    };

    if (intentList) {
      // Avoid duplicate insert
      const hasUpi = intentList.intent.some((intent) => {
        return intent.data && intent.data.some((d) => d.$['android:scheme'] === 'upi');
      });
      if (!hasUpi) {
        intentList.intent.push(upiIntent);
      }
    } else {
      androidManifest.queries.push({
        intent: [upiIntent],
      });
    }

    return config;
  });
};

const withUpiInfoPlist = (config) => {
  return withInfoPlist(config, (config) => {
    if (!config.modResults.LSApplicationQueriesSchemes) {
      config.modResults.LSApplicationQueriesSchemes = [];
    }
    
    const schemes = ['upi', 'gpay', 'phonepe', 'paytm', 'bhim'];
    
    schemes.forEach((scheme) => {
      if (!config.modResults.LSApplicationQueriesSchemes.includes(scheme)) {
        config.modResults.LSApplicationQueriesSchemes.push(scheme);
      }
    });

    return config;
  });
};

const withUniversalUpi = (config) => {
  config = withUpiManifest(config);
  config = withUpiInfoPlist(config);
  return config;
};

module.exports = createRunOncePlugin(withUniversalUpi, pkg.name, pkg.version);
