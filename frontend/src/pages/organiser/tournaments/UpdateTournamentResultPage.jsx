import React, { useState, useEffect } from 'react';
import { Container, Card, Alert, Spinner } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import { FaFileAlt } from 'react-icons/fa';
import { LuClipboardList } from "react-icons/lu";

import apiClient from '../../../api/apiClient';
import { useNotification } from '../../../contexts/NotificationContext';
import BackButton from '../../../components/common/BackButton';
import Button from '../../../components/common/Button';
import { getImageUrl } from '../../../utils/imageUrl';
import ImageUpload from '../../../components/common/ImageUpload';
import ShowModal from '../../../components/common/ShowModal';

const UpdateTournamentResultPage = () => {
  const { tournamentId } = useParams();
  const { showNotification } = useNotification();

  // State
  const [tournamentName, setTournamentName] = useState('');
  const [dates, setDates] = useState('');
  const [currentResultPath, setCurrentResultPath] = useState(null);
  const [resultFile, setResultFile] = useState(null);
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await apiClient.get(`/organiser/tournaments/${tournamentId}`);
        const data = res.data.form_data;
        
        setTournamentName(data.name);
        setDates(data.dates);
        
        if (data.result_path) {
            setCurrentResultPath(getImageUrl(data.result_path));
        }

      } catch (err) {
        setError("Failed to load tournament data.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [tournamentId]);

  // Handler
  const handleFileChange = (file) => setResultFile(file);

  const handleSubmit = async () => {
    if (!resultFile) {
      return setError("Please upload a result file.");
    }
    setSubmitting(true);
    setError('');

    const formData = new FormData();
    formData.append('result', resultFile);

    try {
      const res = await apiClient.post(`/organiser/tournaments/${tournamentId}/result`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      showNotification("Result uploaded successfully!", "success");
      setCurrentResultPath(getImageUrl(res.data.result_path));
      setResultFile(null); // Reset file input
    } catch (err) {
      setError(err.response?.data?.message || "Failed to upload result.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="text-center p-5"><Spinner /></div>;

  return (
    <>
      <BackButton to="/organiser/tournaments" place="Tournaments" />
      
      <div className="mb-4">
        <h2 className="fw-bold mb-2">{tournamentName}</h2>
        <h5 className="text-muted fw-semibold">{dates}</h5>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      <Container className="py-5 d-flex justify-content-center">
        <Card className="border-0 shadow-sm" style={{ width: '100%' }}>
            <Card.Body className="p-4 p-md-5">
                <div className="d-flex flex-column gap-3">
                    <div>
                        <h4 className="fw-bold mb-3">Tournament Result</h4>
                        {/* Current Result */}
                        {currentResultPath ? (
                            <div className="mb-3">
                                <Button 
                                    variant="secondary" 
                                    icon={<FaFileAlt />} 
                                    onClick={() => setShowModal(true)}
                                >
                                    View Current Result
                                </Button>
                            </div>
                        ) : (
                            <p className="text-muted mb-4">No result file has been uploaded yet.</p>
                        )}
                    </div>
                    <div>
                        {/* Upload Result */}
                        <ImageUpload 
                            label="Upload Result" 
                            accept="application/pdf, image/png, image/jpeg" 
                            UploadIcon={LuClipboardList} 
                            uploadMsg="Upload a file" 
                            reqMsg=".pdf, .png, .jpg up to 20MB"
                            onFileChange={handleFileChange} 
                            required
                        />
                    </div>
                </div>
                <Button 
                    className="w-100 mt-4" 
                    onClick={handleSubmit} 
                    disabled={submitting || !resultFile}
                >
                    {submitting ? <div className="text-center"><Spinner animation="border" variant="success" /></div> : 'Save Changes'}
                </Button>
            </Card.Body>
        </Card>
      </Container>

      {/* View Modal */}
      <ShowModal 
        text="Tournament Result"
        show={showModal} 
        onHide={() => setShowModal(false)} 
        path={currentResultPath}
      />
    </>
  );
};

export default UpdateTournamentResultPage;