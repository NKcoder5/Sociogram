import multer from "multer";

// File filter to validate image types
const fileFilter = (req, file, cb) => {
    console.log('📁 File upload attempt:', {
        fieldname: file.fieldname,
        originalname: file.originalname,
        mimetype: file.mimetype,
        size: file.size
    });

    // Check if file is an image
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        console.log('❌ Invalid file type:', file.mimetype);
        cb(new Error('Only image files are allowed!'), false);
    }
};

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
        files: 1 // Only allow 1 file
    },
    fileFilter: fileFilter
});

// Error handling middleware for multer
export const handleMulterError = (error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        console.log('❌ Multer error:', error.message);
        
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                message: 'File too large. Maximum size is 10MB.',
                success: false
            });
        }
        
        if (error.code === 'LIMIT_FILE_COUNT') {
            return res.status(400).json({
                message: 'Too many files. Only 1 file allowed.',
                success: false
            });
        }
        
        return res.status(400).json({
            message: 'File upload error: ' + error.message,
            success: false
        });
    }
    
    if (error.message === 'Only image files are allowed!') {
        return res.status(400).json({
            message: 'Only image files (JPG, PNG, GIF, WebP) are allowed.',
            success: false
        });
    }
    
    next(error);
};

export default upload;