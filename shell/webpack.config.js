const ModuleFederationPlugin = require("webpack/lib/container/ModuleFederationPlugin");
const mf = require("@angular-architects/module-federation/webpack");
const path = require("path");
const share = mf.share;

const sharedMappings = new mf.SharedMappings();
sharedMappings.register(
  path.join(__dirname, 'tsconfig.json'),
  [/* mapped paths to share */]);

module.exports = {
  output: {
    uniqueName: "ssrTest"
  },
  optimization: {
    runtimeChunk: false
  },
  resolve: {
    alias: {
      ...sharedMappings.getAliases(),
    },
    fallback: {
      "path": require.resolve("path-browserify"),
      "module": require.resolve("module")
    }
  },
  plugins: [
    new ModuleFederationPlugin({

        // For remotes (please adjust)
        // name: "ssrTest",
        // filename: "remoteEntry.js",
        // exposes: {
        //     './Component': './/src/app/app.component.ts',
        // },

        // For hosts (please adjust)
        // remotes: {
        //     "mfe1": "mfe1@http://localhost:3000/remoteEntry.js",

        // },

        shared: share({
          "@angular/core": { singleton: true, strictVersion: false, requiredVersion: 'auto' },
          "@angular/common": { singleton: true, strictVersion: false, requiredVersion: 'auto' },
          "@angular/common/http": { singleton: true, strictVersion: false, requiredVersion: 'auto' },
          "@angular/router": { singleton: true, strictVersion: false, requiredVersion: 'auto' },

          ...sharedMappings.getDescriptors()
        })

    }),
    sharedMappings.getPlugin()
  ],
};
