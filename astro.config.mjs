import { defineConfig } from 'astro/config';
import fs from 'node:fs';
import path from 'node:path';

// https://astro.build/config
export default defineConfig({
    trailingSlash: 'always',
    build: {
        format: 'directory'
    },
    vite: {
        plugins: [
            {
                name: 'serve-markups-dev',
                configureServer(server) {
                    server.middlewares.use((req, res, next) => {
                        // Si la URL empieza por /markups/
                        const match = req.url?.match(/^\/markups\/(.+)$/);
                        if (match) {
                            // Quitamos posibles parámetros de búsqueda (?v=...)
                            const filename = match[1].split('?')[0];
                            const filePath = path.join(process.cwd(), 'data', 'markups', filename);

                            if (fs.existsSync(filePath)) {
                                const ext = path.extname(filename).toLowerCase();
                                const contentType = ext === '.svg' ? 'image/svg+xml' : 'image/jpeg';

                                res.setHeader('Content-Type', contentType);
                                res.setHeader('Cache-Control', 'no-cache');
                                res.end(fs.readFileSync(filePath));
                                return;
                            }
                        }
                        next();
                    });
                }
            }
        ]
    }
});
