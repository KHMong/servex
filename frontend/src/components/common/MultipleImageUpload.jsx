import React, { useState, useEffect } from 'react';
import { FaTimes } from 'react-icons/fa';
import { getImageUrl } from '../../utils/imageUrl';
import './MultipleImageUpload.css';

const MultipleImageUpload = ({ 
  label, 
  required = false,
  UploadIcon,
  uploadMsg = 'Upload images',
  reqMsg = '.png, .jpg up to 2MB',
  existingPhotos = [],
  maxFiles = 5,
  onFilesChange, 
  onDeleteExisting,
  readOnly = false
}) => {
  const [newFiles, setNewFiles] = useState([]);
  const [previews, setPreviews] = useState([]);

  useEffect(() => {
    // Create object URLs for new files
    const newPreviews = newFiles.map(file => URL.createObjectURL(file));
    setPreviews(newPreviews);
    return () => newPreviews.forEach(url => URL.revokeObjectURL(url));
  }, [newFiles]);

  const handleFileChange = (e) => {
    if (readOnly) return;
    const selected = Array.from(e.target.files);
    const totalCount = existingPhotos.length + newFiles.length + selected.length;
    
    if (totalCount > maxFiles) {
      alert(`You can only upload a maximum of ${maxFiles} photos.`);
      return;
    }
    
    const updatedFiles = [...newFiles, ...selected];
    setNewFiles(updatedFiles);
    onFilesChange(updatedFiles);
  };

  const removeNewFile = (index) => {
    if (readOnly) return;
    const updatedFiles = newFiles.filter((_, i) => i !== index);
    setNewFiles(updatedFiles);
    onFilesChange(updatedFiles);
  };

  return (
    <div className="mb-3">
      <label className="form-label fw-medium">
        {label}
        {required && <span className="text-danger"> *</span>}
      </label>
      
      <div className="d-flex flex-wrap gap-3">
        {/* Existing Photos */}
        {existingPhotos.map((photo) => (
          <div key={photo.id} className="position-relative photo-preview-container">
            <img src={getImageUrl(photo.path)} alt="Venue" className="photo-preview" />

            {!readOnly && (
              <button 
                type="button"
                className="remove-btn"
                onClick={() => onDeleteExisting(photo.id)}
                >
                <FaTimes />
              </button>
            )}
          </div>
        ))}

        {/* New File Previews */}
        {previews.map((url, index) => (
          <div key={index} className="position-relative photo-preview-container">
            <img src={url} alt="New Upload" className="photo-preview" />

            {!readOnly && (
              <button 
                type="button"
                className="remove-btn"
                onClick={() => removeNewFile(index)}
                >
                <FaTimes />
              </button>
            )}
          </div>
        ))}

        {/* Upload Button (Only show if not readOnly AND limit not reached) */}
        {!readOnly && (existingPhotos.length + newFiles.length) < maxFiles && (
          <label className="upload-box w-100">
            <input 
              type="file" 
              multiple 
              accept="image/png, image/jpeg" 
              onChange={handleFileChange} 
              className="d-none"
            />
            <div className="text-center">
              <UploadIcon className="image-upload-icon" />
              <p className="mb-0">
                <span style={{ color: 'var(--servex-green)', fontWeight: 500 }}>{uploadMsg}</span>
              </p>
              <small className="text-muted">{reqMsg}</small>
            </div>
          </label>
        )}
      </div>

      {!readOnly && (
        <div className="form-text mt-2">Max {maxFiles} photos.</div>
      )}
    </div>
  );
};

export default MultipleImageUpload;