module.exports = {
    moduleNameMapper: {
        "backend/(.*)": "<rootDir>/backend/$1",
        "infra/(.*)": "<rootDir>/infra/$1",
        "tests/(.*)": "<rootDir>/tests/$1",
        "unit/(.*)": "<rootDir>/__tests__/unit/$1",
    },
    preset: "ts-jest",
    setupFiles: ["<rootDir>/tests/env.ts"],
    setupFilesAfterEnv: ["<rootDir>/tests/captureConsole.ts"],
    testEnvironment: "node",
    testTimeout: 90000,
};
