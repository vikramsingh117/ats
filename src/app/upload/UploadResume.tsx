"use client";
import React, { useState } from 'react';
import styles from './UploadResume.module.css'; // Import CSS module for styles

const UploadResume: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [rating, setRating] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile)); // Create preview URL
      console.log("File selected:", selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      console.log("No file selected for upload.");
      return alert("Please select a file");
    }

    setLoading(true); // Set loading state to true
    console.log("Uploading file:", file.name);

    try {
      // Upload and parse the resume using the apilayer API
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
      console.log("Resume parsed successfully:", data);
      alert("Resume parsed successfully");

      // Send parsed data to Gemini model for rating
      console.log("Sending parsed data to Gemini model for rating...");
      const prompt = `return as json file and follow this strict structure of keys and values, 1. resume rating(100)number only, 2.key areas to improve(title only) 3. best suited job role(job position single word only) 4.summary(provide a summary of good and bad things)${JSON.stringify(data)}`;
      const apiKey = "AIzaSyCt6I3_PyyhO8MBRqi7TsFWjxYocFELMME"; // Use your API key from environment variables
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`;

      const ratingResponse = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: prompt }
              ]
            }
          ]
        }),
      });

      if (!ratingResponse.ok) {
        throw new Error('Failed to get a valid response from Gemini model');
      }

      const ratingData = await ratingResponse.json();
      console.log('Rating Response:', ratingData);

      // Safely access the response to get the rating
      if (ratingData.candidates && ratingData.candidates.length > 0 && ratingData.candidates[0].content && ratingData.candidates[0].content.parts && ratingData.candidates[0].content.parts.length > 0) {
        setRating(ratingData.candidates[0].content.parts[0].text);
      } else {
        throw new Error('Unexpected response structure from Gemini model');
      }

      console.log("Received rating from Gemini model:", rating);
    } catch (error) {
      console.error('Error occurred:', error);
      alert("An error occurred while processing the resume or getting the rating");
    } finally {
      setLoading(false); // Reset loading state
      console.log("Upload and rating process completed.");
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

      {rating && (
        <div className={styles.rating}>
          <h3>Resume Rating:</h3>
          <p>{rating}</p>
        </div>
      )}
    </div>
  );
};

export default UploadResume;
