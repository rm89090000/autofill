import JSZip from 'jszip';
import { CollegeApplicationData } from '../types';

import manifest from '../chrome-extension-source/manifest.json?raw';
import backgroundJs from '../chrome-extension-source/background.js?raw';
import contentJs from '../chrome-extension-source/content.js?raw';
import popupHtml from '../chrome-extension-source/popup.html?raw';
import popupJs from '../chrome-extension-source/popup.js?raw';
import sampleResume from '../chrome-extension-source/sample-resume.txt?raw';
import sampleTranscript from '../chrome-extension-source/sample-transcript.txt?raw';

const readme = `# UC App Autofill (Manifest V3)

An AI-powered Chrome Extension that autofills the University of California (UC) application from a saved applicant profile. Import a resume and transcript, review the extracted profile, then autofill the visible fields on apply.universityofcalifornia.edu using Gemma 4 (with a built-in local mapper as a fallback when no API key is set).

## Features
- **Resume & Transcript Import**: Paste or upload text (or a text-based PDF) to auto-extract name, contact info, GPA, high school, courses, and activities.
- **AI Field Mapping**: Uses Google AI Studio's Gemma 4 (\`gemma-4-31b-it\`) model to map your profile onto the UC application's visible fields, with a deterministic local mapper as a fallback or demo mode.
- **School Recommendations**: Suggests UC campuses and other schools based on your major and interests.
- **Sensitive Field Guardrail**: Household/background/demographic fields are only filled after explicit approval.
- **Manifest V3 Compliant**: Uses a service worker background script and scoped host permissions.

## How to Install in Google Chrome
1. Extract the downloaded \`uc-app-autofill-extension.zip\` file to a folder on your computer.
2. Open Google Chrome and go to \`chrome://extensions\`.
3. Toggle on **Developer mode** in the top right corner.
4. Click **Load unpacked**.
5. Select the extracted folder containing \`manifest.json\`.
6. Click the Extensions puzzle icon in Chrome and pin **UC Fill Assistant**.
7. Open the extension popup, import a resume/transcript (or click "Use sample resume"), then open your UC application and click **Fill current section**.

## Optional: Enable AI-powered mapping
Add a Google AI Studio API key in the extension's UC tab to route field mapping through Gemma 4. Without a key, the extension falls back to its built-in demo mapper.
`;

export function getExtensionFiles(_appData?: CollegeApplicationData) {
  return {
    manifest,
    backgroundJs,
    contentJs,
    popupHtml,
    popupJs,
    sampleResume,
    sampleTranscript,
    readme,
  };
}

export async function downloadExtensionZip(appData?: CollegeApplicationData) {
  const files = getExtensionFiles();
  const zip = new JSZip();

  zip.file('manifest.json', files.manifest);
  zip.file('background.js', files.backgroundJs);
  zip.file('content.js', files.contentJs);
  zip.file('popup.html', files.popupHtml);
  zip.file('popup.js', files.popupJs);
  zip.file('sample-resume.txt', files.sampleResume);
  zip.file('sample-transcript.txt', files.sampleTranscript);
  zip.file('README.md', files.readme);

  const content = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(content);
  const a = document.createElement('a');
  a.href = url;
  a.download = `uc-app-autofill-extension${appData?.applicantName ? '-' + appData.applicantName.toLowerCase().replace(/\s+/g, '-') : ''}.zip`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
