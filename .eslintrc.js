module.exports = {
    "env": {
        "browser": true,
        "node": true,
        "es2021": true
    },
    "extends": [
        "eslint:recommended",
        "plugin:@typescript-eslint/recommended"
    ],
    "overrides": [{
        "files": [
            "**/src/tests/unit/**/*.spec.{j,t}s?(x)"
        ],
        "env": {
            "mocha": true
        }
    }],
    "parser": "@typescript-eslint/parser",
    "parserOptions": {
        "ecmaVersion": "latest",
        "sourceType": "module"
    },
    "plugins": [
        "@typescript-eslint"
    ],
    "rules": {
        "comma-dangle": ["warn", "only-multiline"],
        "indent": ["warn", 4],
        "no-console": process.env.NODE_ENV === "production" ? "warn" : "off",
        "no-debugger": process.env.NODE_ENV === "production" ? "warn" : "off",
        "semi": ["warn", "never"],
        "@typescript-eslint/no-use-before-define": ["error"],
        "@typescript-eslint/no-useless-constructor": ["error"]
    }
}
