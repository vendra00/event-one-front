module.exports = {
    presets: ["babel-preset-expo"],
    plugins: [
        [
            "module-resolver",
            {
                root: ["./src"],
                alias: {
                    "@": "./src",
                    "@screens": "./src/screens",
                    "@api": "./src/api",
                    "@theme": "./src/theme",
                },
                extensions: [".ts", ".tsx", ".js", ".jsx", ".json"],
            },
        ],
    ],
};