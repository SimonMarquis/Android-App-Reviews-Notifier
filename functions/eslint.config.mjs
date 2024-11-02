import globals from "globals";
import pluginJs from "@eslint/js";


export default [
    {languageOptions: {globals: {...globals.builtin, ...globals.node}}},
    pluginJs.configs.recommended,
    {
        rules: {
            "no-restricted-globals": ["error", "name", "length"],
            "prefer-arrow-callback": "error",
            "quotes": ["error", "double", {"allowTemplateLiterals": true}],
        },
    },
];