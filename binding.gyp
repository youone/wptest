{
  "targets": [
    {
      "target_name": "addon",
      "cflags!": [ "-fno-exceptions" ],
      "cflags_cc!": [ "-fno-exceptions" ],
      "sources": [ "native/addon.cpp" ],
      "include_dirs": [
          "<!@(node -p \"require('node-addon-api').include\")"
      ],
      "dependencies": [
          "<!(node -p \"require('node-addon-api').gyp\")"
      ],
      "defines": [ 'NAPI_DISABLE_CPP_EXCEPTIONS', 'BUILD_HASH=\"$(CI_COMMIT_SHORT_SHA)\"']
    }
  ]
}