import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const fileUrl = `${req.protocol}://${req.get('host')}/uploads/chat/${req.file.filename}`;
    
    console.log('📁 File uploaded:', {
      filename: req.file.filename,
      originalname: req.file.originalname,
      path: req.file.path,
      url: fileUrl
    });
    
    return res.status(200).json({
      success: true,
      file: {
        url: fileUrl,
        name: req.file.originalname,
        type: req.file.mimetype,
        size: req.file.size
      }
    });
  } catch (error) {
    console.error('File upload error:', error);
    return res.status(500).json({
      success: false,
      message: 'File upload failed'
    });
  }
};
