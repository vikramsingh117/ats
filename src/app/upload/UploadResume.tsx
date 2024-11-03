"use client";
import React, { useState } from "react";
import styles from "./UploadResume.module.css"; // Import CSS module for styles

const UploadResume: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [ratingData, setRatingData] = useState<any | null>(null); // Update to hold structured rating data
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
      return; // Removed alert
    }

    setLoading(true); // Set loading state to true
    console.log("Uploading file:", file.name);

    try {
      // Upload and parse the resume using the apilayer API
      const response = await fetch(
        "https://api.apilayer.com/resume_parser/upload",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/octet-stream",
            apikey: "s5Fqbn8vZC010iXr8VBUTxhQ8dlizDAF",
          },
          body: file,
        }
      );

      if (!response.ok) {
        throw new Error("Failed to parse resume");
      }

      const data = await response.json();
      setParsedData(data); // Save parsed data to state
      console.log("Resume parsed successfully:", data);

      // Send parsed data to Gemini model for rating
      console.log("Sending parsed data to Gemini model for rating...");
      const prompt = `return as json file and follow this strict structure of keys and values, 1. resume rating(100)number only, 2.key areas to improve(title only) 3. best suited job role(job position single word only) 4.summary(provide a summary of good and bad things)${JSON.stringify(
        data
      )}`;
      const apiKey = "AIzaSyCt6I3_PyyhO8MBRqi7TsFWjxYocFELMME"; // Use your API key from environment variables
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`;

      const ratingResponse = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }],
            },
          ],
        }),
      });

      if (!ratingResponse.ok) {
        throw new Error("Failed to get a valid response from Gemini model");
      }

      const ratingResponseData = await ratingResponse.json();
      console.log("Rating Response:", ratingResponseData);

      // Extract the relevant content parts
      const contentText =
        ratingResponseData.candidates[0].content.parts[0].text;
      console.log("Original Response Text:", contentText);

      // Clean up the text: remove backticks and "```json" markers
      let cleanedResponse = contentText
        .replace(/```json/g, "") // Remove "```json"
        .replace(/```/g, "") // Remove triple backticks
        .replace(/\\n/g, "") // Remove escaped newlines
        .trim(); // Trim any excess whitespace

      try {
        // Attempt to parse the cleaned response as JSON
        const jsonResponse = JSON.parse(cleanedResponse);
        setRatingData(jsonResponse); // Store structured rating data
      } catch (error) {
        console.error("Failed to parse JSON response:", error);
        console.log("Cleaned Response:", cleanedResponse); // Log cleaned response for debugging
        setRatingData(null); // Set to null if parsing fails
      }
    } catch (error) {
      console.error("Error occurred:", error);
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
  <button
    onClick={handleUpload}
    disabled={!file || loading}
    className={styles.uploadButton}
  >
    {loading ? "Uploading..." : "Upload Resume"}
  </button>

  {previewUrl && (
    <div className={styles.previewContainer}>
      <div className={styles.preview}>
        <h3>File Preview:</h3>
        {file?.type === "application/pdf" ? (
          <iframe src={previewUrl} title="Uploaded PDF" />
        ) : (
          <img src={previewUrl} alt="File preview" />
        )}
      </div>

      <div className={styles.dataSection}>
        {parsedData && (
          <div className={styles.parsedData}>
            <h3>Parsed Data:</h3>
            <pre>{JSON.stringify(parsedData, null, 2)}</pre>
          </div>
        )}
        {ratingData && (
          <div className={styles.rating}>
            <h3>Resume Rating:</h3>
            <pre>{JSON.stringify(ratingData, null, 2)}</pre>
          </div>
        )}
      </div>
    </div>
  )}
</div>

  );
};

export default UploadResume;
