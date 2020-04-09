const libDir = process.env.LIB_DIR;

const transformIgnorePatterns = [
  '/dist/',
  // Ignore modules without es dir.
  // Update: @babel/runtime should also be transformed
  'node_modules/(?!.*@babel)[^/]+?/(?!(es|node_modules)/)',
];

module.exports = {
  verbose: true,
  setupFiles: ['./tests/setup.js'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'md'],
  modulePathIgnorePatterns: ['/_site/'],
  moduleNameMapper: {
    '^dnd-core$': 'dnd-core/dist/cjs',
    '^react-dnd$': 'react-dnd/dist/cjs',
    '^react-dnd-html5-backend$': 'react-dnd-html5-backend/dist/cjs',
    '^react-dnd-touch-backend$': 'react-dnd-touch-backend/dist/cjs',
    '^react-dnd-test-backend$': 'react-dnd-test-backend/dist/cjs',
    '^react-dnd-test-utils$': 'react-dnd-test-utils/dist/cjs',
  },
  testPathIgnorePatterns: ['/node_modules/', 'dekko', 'node'],
  transform: {
    '\\.tsx?$': './node_modules/@ant-design/tools/lib/jest/codePreprocessor',
    '\\.js$': './node_modules/@ant-design/tools/lib/jest/codePreprocessor',
    '\\.md$': './node_modules/@ant-design/tools/lib/jest/demoPreprocessor',
    '\\.(jpg|png|gif|svg)$': './node_modules/@ant-design/tools/lib/jest/imagePreprocessor',
  },
  testRegex: `${libDir === 'dist' ? 'demo' : '.*'}\\.test\\.js$`,
  collectCoverageFrom: [
    'components/**/*.{ts,tsx}',
    '!components/*/style/index.tsx',
    '!components/style/index.tsx',
    '!components/*/locale/index.tsx',
    '!components/*/__tests__/type.test.tsx',
    '!components/**/*/interface.{ts,tsx}',
  ],
  transformIgnorePatterns,
  snapshotSerializers: ['enzyme-to-json/serializer'],
  globals: {
    'ts-jest': {
      tsConfig: './tsconfig.test.json',
    },
  },
  testURL: 'http://localhost',
};
