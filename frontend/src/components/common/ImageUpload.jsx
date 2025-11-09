import React, { useState, useEffect } from 'react';
import { FaFilePdf } from 'react-icons/fa';
import './ImageUpload.css';

const ImageUpload = ({ 
  label, 
  required = false,
  accept = "image/png, image/jpeg",
  UploadIcon, 
  uploadMsg = 'Upload an image', 
  reqMsg = '.png, .jpg up to 2MB', 
  onFileChange 
}) => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      onFileChange(selectedFile);
    }
  };
  
  const handleRemoveImage = () => {
    setFile(null);
    setPreview(null);
    onFileChange(null);
  };
  
  useEffect(() => {
    if (!file) {
      setPreview(null);
      return;
    }

    if (file.type.startsWith('image/')) {
      const objectUrl = URL.createObjectURL(file);
      setPreview(objectUrl);
      
      // Cleanup to prevent memory leaks
      return () => URL.revokeObjectURL(objectUrl);
    } else {
      // For non-image files (like PDF)
      setPreview(file);
    }
  }, [file]);

  const renderPreview = () => {
    if (!preview) return null;
    
    // String means image URL
    if (typeof preview === 'string') {
      return <img src={preview} alt="Preview" className="image-preview" />;
    }
    
    // File object
    if (preview.type === 'application/pdf') {
      return (
        <div className="text-center">
          <FaFilePdf className="pdf-preview-icon" />
          <p className="mb-0 text-muted">{preview.name}</p>
        </div>
      );
    }

    // Other file types
    return <p>Preview is not available for this file type.</p>;
  };

  return (
    <div className="image-upload-wrapper">
      {label && 
        <label className="image-upload-label">
          {label}
          {required && <span className="text-danger"> *</span>}
        </label>
      }
      {preview ? (
        <div className="image-preview-wrapper">
          {renderPreview()}
          <button onClick={handleRemoveImage} className="remove-image-btn">&times;</button>
        </div>
      ) : (
        <label className="image-upload-box w-100">
          <input type="file" onChange={handleFileChange} accept={accept} />
          <UploadIcon className="image-upload-icon" />
          <p className="mb-0">
            <span style={{ color: 'var(--servex-green)', fontWeight: 500 }}>{uploadMsg}</span>
          </p>
          <small className="text-muted">{reqMsg}</small>
        </label>
      )}
    </div>
  );
};

export default ImageUpload;