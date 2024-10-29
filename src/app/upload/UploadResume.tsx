"use client";
import React, { useState } from 'react';
import styles from './UploadResume.module.css'; // Import CSS module for styles

const UploadResume: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile)); // Create preview URL
    }
  };

  const handleUpload = async () => {
    if (!file) return alert("Please select a file");

    setLoading(true); // Set loading state to true
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('https://api.apilayer.com/resume_parser/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/octet-stream',
          'apikey': 's5Fqbn8vZC010iXr8VBUTxhQ8dlizDAF'
        },
        body: file,
      });

      if (!response.ok) {
        throw new Error('Failed to parse resume');
      }

      const data = await response.json();
      setParsedData(data); // Save parsed data to state
      alert("Resume parsed successfully");
    } catch (error) {
      console.error('Error uploading file:', error);
      alert("Error parsing resume");
    } finally {
      setLoading(false); // Reset loading state
    }
  };

  return (
    <div className={styles.container}>
      <input
        type="file"
        accept=".pdf,.doc,.docx"
        onChange={handleFileChange}
        className={styles.fileInput}
      />
      <button onClick={handleUpload} disabled={!file || loading} className={styles.uploadButton}>
        {loading ? 'Uploading...' : 'Upload Resume'}
      </button>

      {previewUrl && (
        <div className={styles.previewContainer}>
          <h3>File Preview:</h3>
          {file?.type === 'application/pdf' ? (
            <iframe 
              src={previewUrl} 
              className={styles.preview} 
              title="Uploaded PDF"
            />
          ) : (
            <img 
              src={previewUrl} 
              alt="File preview" 
              className={styles.preview} 
            />
          )}
        </div>
      )}

      {parsedData && (
        <div className={styles.parsedData}>
          <h3>Parsed Data:</h3>
          <pre>{JSON.stringify(parsedData, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default UploadResume;
