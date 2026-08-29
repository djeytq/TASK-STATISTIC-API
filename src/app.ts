import express from 'express';
import cors from 'cors';
import { configDotenv } from 'dotenv';
import MasterRouter from './routes/index';


configDotenv();

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.json({
        message: 'Task Statistics!',
        documentation: '/dev/docs',
        demo: '/dev/demo'
    });
});

app.use('/dev', MasterRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});