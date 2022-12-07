import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default ({ mode }) => {
    return defineConfig({
        envPrefix: 'REACT_APP',
        plugins: [react()],
        server: {
            port: Number(process.env.PORT || 3000)
        },
        define: {
            "process.env.NODE_ENV": `"${mode}"`,
            "process.env.REACT_APP_API_URL": `"${process.env.REACT_APP_API_URL}"`,
        },
    })
}