import express from 'express';
// Require necessary packages
import multer from 'multer';
import path from 'path';
import DietChartProcessor from './DietChartProcessor.js';
import processPDF from './utils.js';
import cors from 'cors';

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
// Configure multer for file upload
// const storage = multer.diskStorage({
//     destination: function (req, file, cb) {
//         cb(null, 'uploads/')
//     },
//     filename: function (req, file, cb) {
//         cb(null, Date.now() + path.extname(file.originalname))
//     }
// });
const upload = multer({
  storage: multer.memoryStorage()
});

// const upload = multer({ storage: storage });

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the API' });
});

// Handle PDF upload
app.post('/upload', upload.single('pdf'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).send('No file uploaded.');
    }

    const pdfPath = req.file.buffer;

    const processor = new DietChartProcessor();

    // Process the PDF
    const text = await processPDF(pdfPath);
    const meals = await processor.processDietChart(text);
    if (meals)
      res.json(meals);
    else throw new Error("")
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Error processing PDF');
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
