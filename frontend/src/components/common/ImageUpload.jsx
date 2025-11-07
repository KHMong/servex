import React, { useState, useEffect } from 'react';
import { FaCamera } from 'react-icons/fa';
import './ImageUpload.css';

const ImageUpload = ({ label, onFileChange }) => {
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
      setPreview(undefined);
      return;
    }
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    
    // Cleanup to prevent memory leaks
    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);

  return (
    <div className="image-upload-wrapper">
      {label && <label className="image-upload-label">{label}</label>}
      {preview ? (
        <div className="image-preview-wrapper">
          <img src={preview} alt="Preview" className="image-preview" />
          <button onClick={handleRemoveImage} className="remove-image-btn">&times;</button>
        </div>
      ) : (
        <label className="image-upload-box w-100">
          <input type="file" onChange={handleFileChange} accept="image/png, image/jpeg" />
          <FaCamera className="image-upload-icon" />
          <p className="mb-0">
            <span style={{ color: 'var(--servex-green)', fontWeight: 500 }}>Upload an image</span>
          </p>
          <small className="text-muted">.png, .jpg up to 2MB</small>
        </label>
      )}
    </div>
  );
};

export default ImageUpload;