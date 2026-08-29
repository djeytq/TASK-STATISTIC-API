import express from 'express';
import path from 'path';

/**
 * Documentation router.
 *
 * Serves the API documentation page (files inside "src/pages")
 * at "/dev/docs".
 *
 * - GET /dev/docs/  ->  documentation page (index.html)
 * - /dev/docs/resources/...  ->  css / js / assets of the page
 */
const DocsRouter = express.Router();

const pagesDir = path.resolve(__dirname, '..', 'pages');

/* Serve the static assets of the documentation (css, js, images, ...) */
DocsRouter.use(express.static(pagesDir));

/* Serve the documentation page itself */
DocsRouter.get('/', (req, res) => {
    res.sendFile(path.join(pagesDir, 'index.html'));
});

export default DocsRouter;