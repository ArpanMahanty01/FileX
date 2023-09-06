require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');

const app = express();
const port = 8080;

mongoose.connect(
  'mongodb://127.0.0.1:27017/?directConnection=true&serverSelectionTimeoutMS=2000&appName=mongosh+1.10.6/files',
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
);

const conn = mongoose.connection;

conn.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});

conn.once('open', () => {
  console.log('Connected to MongoDB');
});

const FileSchema = new mongoose.Schema({
  filename: String,
  path: String,
  originalname: String,
  mimetype: String,
  size: Number,
});

const File = mongoose.model('File', FileSchema);

const storage = multer.diskStorage({
  destination: 'uploads/', 
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

const upload = multer({ storage });

app.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded.' });
    }

    const { filename, path, originalname, mimetype, size } = req.file;

    const fileRecord = new File({
      filename,
      path,
      originalname,
      mimetype,
      size,
    });

    await fileRecord.save();

    res.status(201).json({ message: 'File uploaded successfully.' });
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

app.get('/download/:filename', async (req, res) => {
  try {
    const filename = req.params.filename;

    const fileRecord = await File.findOne({ filename });

    if (!fileRecord) {
      return res.status(404).json({ message: 'File not found.' });
    }

    res.download(fileRecord.path, fileRecord.originalname);
  } catch (error) {
    console.error('Error downloading file:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
