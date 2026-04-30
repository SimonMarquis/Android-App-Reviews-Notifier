import globals from "globals";
import pluginJs from "@eslint/js";


export default [
    {
        ignores: ["eslint.config.mjs"],
    },
    {
        languageOptions: {
            globals: {...globals.builtin, ...globals.node},
            sourceType: "module",
        }
    },
    pluginJs.configs.recommended,
    {
        rules: {
            "no-restricted-globals": ["error", "name", "length"],
            "prefer-arrow-callback": "error",
            "quotes": ["error", "double", {"allowTemplateLiterals": true}],
            "max-len": "off",
        },
    },
];
