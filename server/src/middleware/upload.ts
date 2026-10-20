import multer from 'multer';
import { MAX_UPLOAD_BYTES } from '../config/constants';
import { AppError } from '../utils/errors';

const memoryStorage = multer.memoryStorage();

const imageOnly = multer({
  storage: memoryStorage,
  limits: { fileSize: MAX_UPLOAD_BYTES.image, files: 1 },
  fileFilter: (_req, file, callback) => {
    if (!file.mimetype.startsWith('image/')) {
      callback(new AppError(422, 'INVALID_FILE_TYPE', 'Only image files are accepted'));
      return;
    }
    callback(null, true);
  },
});

const certificateUpload = multer({
  storage: memoryStorage,
  limits: { fileSize: MAX_UPLOAD_BYTES.image, files: 1 },
  fileFilter: (_req, file, callback) => {
    if (!file.mimetype.startsWith('image/') && file.mimetype !== 'application/pdf') {
      callback(new AppError(422, 'INVALID_FILE_TYPE', 'Only images or PDF files are accepted'));
      return;
    }
    callback(null, true);
  },
});

const cvUpload = multer({
  storage: memoryStorage,
  limits: { fileSize: MAX_UPLOAD_BYTES.cv, files: 1 },
  fileFilter: (_req, file, callback) => {
    if (file.mimetype !== 'application/pdf' && file.mimetype !== 'application/octet-stream') {
      callback(new AppError(422, 'INVALID_FILE_TYPE', 'Only PDF documents are accepted'));
      return;
    }
    callback(null, true);
  },
});

export const uploadProfileImage = imageOnly.single('image');
export const uploadProjectImage = imageOnly.single('image');
export const uploadCertificate = certificateUpload.single('certificate');
export const uploadCv = cvUpload.single('cv');
