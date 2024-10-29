import Image from "next/image";
import styles from "./page.module.css";
// src/app/page.tsx

import UploadResume from "./upload/UploadResume";

export default function Home() {
  return (
    <div>
      <h1>Resume Analyzer</h1>
      <UploadResume />
    </div>
  );
}
