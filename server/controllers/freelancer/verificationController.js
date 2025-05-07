import { User } from '../../models/User.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

// Configure multer for file storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = 'uploads/verification';
        // Create directory if it doesn't exist
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniquePrefix = uuidv4();
        cb(null, uniquePrefix + '-' + file.originalname);
    }
});

// File filter to only allow certain document types
const fileFilter = (req, file, cb) => {
    // Allow PDF, images, and common document formats
    const allowedFileTypes = [
        'application/pdf',
        'image/jpeg',
        'image/png',
        'image/jpg',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    
    if (allowedFileTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Unsupported file type. Only PDF, JPEG, PNG, and DOC/DOCX files are allowed.'), false);
    }
};

// Initialize multer upload
export const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB file size limit
}).array('documents', 5);  // Maximum 5 documents

// Controller methods
export const requestVerification = async (req, res) => {
    try {
        const userId = req.user.id;
        const { documentTypes } = req.body;
        
        // Check if the user already has a pending or verified status
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ 
                success: false, 
                message: 'User not found' 
            });
        }
        
        if (user.verificationStatus === 'verified') {
            return res.status(400).json({ 
                success: false, 
                message: 'Your account is already verified' 
            });
        }
        
        if (user.verificationStatus === 'pending') {
            return res.status(400).json({ 
                success: false, 
                message: 'Your verification request is already pending review' 
            });
        }
        
        // Process uploaded files
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ 
                success: false, 
                message: 'No documents uploaded' 
            });
        }
        
        // Create verification documents array
        const verificationDocuments = req.files.map((file, index) => {
            return {
                type: documentTypes[index] || 'other',
                filename: file.originalname,
                fileUrl: file.path,
                uploadDate: new Date(),
                status: 'pending'
            };
        });
        
        // Update user with verification documents and change status to pending
        user.verificationDocuments = verificationDocuments;
        user.verificationStatus = 'pending';
        await user.save();
        
        res.status(200).json({
            success: true,
            message: 'Verification request submitted successfully',
            data: {
                status: user.verificationStatus,
                documents: user.verificationDocuments
            }
        });
    } catch (error) {
        console.error('Error submitting verification request:', error);
        res.status(500).json({
            success: false,
            message: 'Error processing verification request',
            error: error.message
        });
    }
};

// Get verification status
export const getVerificationStatus = async (req, res) => {
    try {
        const userId = req.user.id;
        
        const user = await User.findById(userId).select('verificationStatus verificationLevel verificationDocuments rejectionReason');
        
        if (!user) {
            return res.status(404).json({ 
                success: false, 
                message: 'User not found' 
            });
        }
        
        res.status(200).json({
            success: true,
            data: {
                status: user.verificationStatus,
                level: user.verificationLevel,
                documents: user.verificationDocuments,
                rejectionReason: user.rejectionReason
            }
        });
    } catch (error) {
        console.error('Error fetching verification status:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching verification status',
            error: error.message
        });
    }
};

// Get verification documents
export const getVerificationDocuments = async (req, res) => {
    try {
        const userId = req.user.id;
        
        const user = await User.findById(userId).select('verificationDocuments');
        
        if (!user) {
            return res.status(404).json({ 
                success: false, 
                message: 'User not found' 
            });
        }
        
        res.status(200).json({
            success: true,
            data: user.verificationDocuments || []
        });
    } catch (error) {
        console.error('Error fetching verification documents:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching verification documents',
            error: error.message
        });
    }
};

// Delete a verification document
export const deleteVerificationDocument = async (req, res) => {
    try {
        const userId = req.user.id;
        const { documentId } = req.params;
        
        // Find the user
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ 
                success: false, 
                message: 'User not found' 
            });
        }
        
        // Check if user can modify documents (only if not verified or rejected)
        if (['verified'].includes(user.verificationStatus)) {
            return res.status(400).json({
                success: false,
                message: 'Cannot modify documents after verification'
            });
        }
        
        // Find the document to delete
        const documentIndex = user.verificationDocuments.findIndex(doc => doc._id.toString() === documentId);
        if (documentIndex === -1) {
            return res.status(404).json({
                success: false,
                message: 'Document not found'
            });
        }
        
        // Get document path to delete the file
        const filePath = user.verificationDocuments[documentIndex].fileUrl;
        
        // Remove from array
        user.verificationDocuments.splice(documentIndex, 1);
        
        // If no documents left and status is pending, change to unverified
        if (user.verificationDocuments.length === 0 && user.verificationStatus === 'pending') {
            user.verificationStatus = 'unverified';
        }
        
        await user.save();
        
        // Delete file from storage if it exists
        try {
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        } catch (fileError) {
            console.error('Error deleting file:', fileError);
            // Continue with response even if file deletion fails
        }
        
        res.status(200).json({
            success: true,
            message: 'Document deleted successfully',
            data: {
                status: user.verificationStatus,
                documents: user.verificationDocuments
            }
        });
    } catch (error) {
        console.error('Error deleting verification document:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting verification document',
            error: error.message
        });
    }
};