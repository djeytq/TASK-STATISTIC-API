import express from 'express';
import path from 'path';

/**
 * Demo frontend router.
 *
 * Serves the ready-made frontend from "src/tests" at "/dev/demo".
 * Useful for visitors that do not have their own frontend yet:
 * they can open this page and test the PDF generation right away.
 *
 * - GET /dev/demo/  ->  demo page (form.html)
 * - /dev/demo/style.css  ->  demo styles
 * - /dev/demo/script.js  ->  demo logic (uses the Blob fetch approach)
 */
const DemoRouter = express.Router();

const testsDir = path.resolve(__dirname, '..', 'tests');

/* Serve the static assets of the demo (style.css, script.js, ...) */
DemoRouter.use(express.static(testsDir));

/* Serve the demo page itself */
DemoRouter.get('/', (req, res) => {
    res.sendFile(path.join(testsDir, 'form.html'));
});

export default DemoRouter;