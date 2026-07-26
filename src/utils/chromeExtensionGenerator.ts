import JSZip from 'jszip';
import { CollegeApplicationData } from '../types';

export function getExtensionFiles(appData: CollegeApplicationData) {
  const manifest = JSON.stringify(
    {
      manifest_version: 3,
      name: 'Collegeify — College Application Autofill & Essay AI',
      version: '1.0.0',
      description: 'Instantly autofill college application forms (Common App, UC Application, Coalition App, College Portals) with your Collegeify dossier data and AI essays.',
      permissions: ['activeTab', 'storage', 'scripting'],
      action: {
        default_popup: 'popup.html',
        default_title: 'Collegeify Autofill & Essay AI',
      },
      content_scripts: [
        {
          matches: ['<all_urls>'],
          js: ['content.js'],
          run_at: 'document_end',
        },
      ],
      background: {
        service_worker: 'background.js',
      },
      icons: {
        '16': 'icon16.png',
        '48': 'icon48.png',
        '128': 'icon128.png',
      },
    },
    null,
    2
  );

  const backgroundJs = `// Collegeify Chrome Extension Background Service Worker
chrome.runtime.onInstalled.addListener(() => {
  console.log('Collegeify Extension installed successfully!');
  chrome.contextMenus.create({
    id: 'collegeify-autofill-field',
    title: 'Autofill with Collegeify Dossier',
    contexts: ['editable'],
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'collegeify-autofill-field' && tab?.id) {
    chrome.tabs.sendMessage(tab.id, { action: 'TRIGGER_AUTOFILL_ACTIVE' });
  }
});
`;

  const contentJs = `// Collegeify Chrome Extension Content Script
// Automatically detects college application input fields and fills them out securely.

(function () {
  console.log("Collegeify Extension loaded on page:", window.location.href);

  // Default profile data from Collegeify
  let currentProfile = ${JSON.stringify(appData, null, 2)};

  // Listen for storage updates or messages from popup
  chrome.runtime?.onMessage?.addListener((request, sender, sendResponse) => {
    if (request.action === "AUTOFILL_PAGE") {
      const data = request.data || currentProfile;
      const filledCount = performAutofill(data);
      sendResponse({ success: true, filledCount });
    } else if (request.action === "DETECT_FIELDS") {
      const fields = detectFormFields();
      sendResponse({ success: true, fields });
    }
  });

  // Intelligent field matching map including UC Application & Common App portals
  const FIELD_MAPPINGS = [
    { keys: ["applicantName", "name", "full_name", "first_name", "fullname", "applicant_name", "student_name", "legal_name", "uc_name"], valueKey: "applicantName" },
    { keys: ["email", "e-mail", "student_email", "email_address", "uc_email"], valueKey: "email" },
    { keys: ["phone", "mobile", "telephone", "phone_number", "contact_phone"], valueKey: "phone" },
    { keys: ["address", "street", "city", "state", "zip", "location", "mailing_address"], valueKey: "address" },
    { keys: ["dob", "birth", "birthday", "date_of_birth"], valueKey: "dob" },
    { keys: ["highSchool", "high_school", "school", "secondary_school", "uc_school", "ceeb_code"], valueKey: "highSchool" },
    { keys: ["gpa", "grade_point_average", "cumulative_gpa", "uc_gpa", "unweighted_gpa", "weighted_gpa"], valueKey: "gpa" },
    { keys: ["testScores", "sat", "act", "scores", "standardized_tests", "toefl", "ap_scores"], valueKey: "testScores" },
    { keys: ["intendedMajor", "major", "field_of_study", "program", "discipline", "first_choice_major", "uc_major"], valueKey: "intendedMajor" },
    { keys: ["personalStatement", "essay", "personal_essay", "statement", "statement_prompt", "piq1", "piq", "personal_insight_question_1", "uc_piq1"], valueKey: "personalStatement" },
    { keys: ["supplementalEssay1", "supplemental", "why_us", "short_answer", "piq2", "personal_insight_question_2", "uc_piq2"], valueKey: "supplementalEssay1" },
    { keys: ["signatureName", "signature", "sign_name", "certify_name"], valueKey: "signatureName" },
    { keys: ["signatureDate", "sign_date", "date_signed"], valueKey: "signatureDate" }
  ];

  function createFloatingAutofillBadge() {
    if (document.getElementById('collegeify-floating-badge')) return;
    const badge = document.createElement('div');
    badge.id = 'collegeify-floating-badge';
    badge.style.cssText = "position: fixed; bottom: 24px; right: 24px; z-index: 999999; background: #1A1A1A; color: #FFFFFF; border: 2px solid #10b981; padding: 10px 16px; font-family: system-ui, -apple-system, sans-serif; font-size: 12px; font-weight: bold; box-shadow: 4px 4px 0px #10b981; cursor: pointer; display: flex; align-items: center; gap: 8px; transition: all 0.2s ease;";
    badge.innerHTML = '<span style="background:#10b981; color:#000; padding:2px 6px; font-weight:900; font-size:10px;">C</span><span>⚡ Autofill with Collegeify</span>';
    badge.addEventListener('mouseover', () => {
      badge.style.transform = 'translateY(-2px)';
    });
    badge.addEventListener('mouseout', () => {
      badge.style.transform = 'translateY(0px)';
    });
    badge.addEventListener('click', () => {
      const filled = performAutofill(currentProfile);
      badge.innerHTML = '<span style="background:#10b981; color:#000; padding:2px 6px; font-weight:900; font-size:10px;">✓</span><span>Filled ' + filled + ' UC / App Fields!</span>';
      setTimeout(() => {
        badge.innerHTML = '<span style="background:#10b981; color:#000; padding:2px 6px; font-weight:900; font-size:10px;">C</span><span>⚡ Autofill with Collegeify</span>';
      }, 3000);
    });
    document.body.appendChild(badge);
  }

  // Inject floating badge on application pages (UC App, Common App, Coalition, etc.)
  if (
    window.location.hostname.includes('universityofcalifornia') ||
    window.location.hostname.includes('commonapp') ||
    window.location.hostname.includes('coalitionforcollege') ||
    window.location.hostname.includes('applytexas') ||
    document.querySelectorAll('input, textarea').length > 3
  ) {
    if (document.readyState === 'complete') {
      createFloatingAutofillBadge();
    } else {
      window.addEventListener('load', createFloatingAutofillBadge);
    }
  }

  function setElementValue(el, val) {
    if (!el || val === undefined || val === null) return false;
    el.focus();
    el.value = val;
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
    el.dispatchEvent(new Event('blur', { bubbles: true }));
    
    // Add visual feedback ring
    const originalBorder = el.style.border;
    const originalShadow = el.style.boxShadow;
    el.style.border = '2px solid #10b981';
    el.style.boxShadow = '0 0 8px rgba(16, 185, 129, 0.4)';
    setTimeout(() => {
      el.style.border = originalBorder;
      el.style.boxShadow = originalShadow;
    }, 2500);
    return true;
  }

  function performAutofill(data) {
    let filledCount = 0;
    const inputs = Array.from(document.querySelectorAll('input, textarea, select'));

    inputs.forEach(input => {
      const identifier = (
        (input.name || '') + ' ' + 
        (input.id || '') + ' ' + 
        (input.placeholder || '') + ' ' + 
        (input.getAttribute('aria-label') || '') + ' ' +
        (input.labels ? Array.from(input.labels).map(l => l.innerText).join(' ') : '')
      ).toLowerCase();

      for (const map of FIELD_MAPPINGS) {
        const valueToFill = data[map.valueKey];
        if (!valueToFill) continue;

        const isMatch = map.keys.some(key => identifier.includes(key.toLowerCase()));
        if (isMatch) {
          if (setElementValue(input, valueToFill)) {
            filledCount++;
            break;
          }
        }
      }
    });

    return filledCount;
  }

  function detectFormFields() {
    const inputs = Array.from(document.querySelectorAll('input, textarea, select'));
    return inputs.map(i => ({
      id: i.id || '(no id)',
      name: i.name || '(no name)',
      type: i.type || i.tagName.toLowerCase(),
      placeholder: i.placeholder || '',
    }));
  }
})();
`;

  const popupHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Collegeify Extension</title>
  <link rel="stylesheet" href="popup.css">
</head>
<body>
  <div class="popup-container">
    <div class="header">
      <div class="logo-badge">C</div>
      <div>
        <h1>Collegeify</h1>
        <p class="subtitle">College Application Autofill & Essay AI</p>
      </div>
    </div>

    <div class="profile-card">
      <div class="profile-label">ACTIVE STUDENT DOSSIER</div>
      <div class="profile-name" id="studentName">${appData.applicantName || 'Student Dossier'}</div>
      <div class="profile-details">
        <span id="studentMajor">${appData.intendedMajor || 'Undecided'}</span> • 
        <span id="studentGPA">GPA ${appData.gpa || 'N/A'}</span>
      </div>
    </div>

    <div class="actions font-sans">
      <button id="autofillBtn" class="btn btn-primary">
        <span class="icon">⚡</span> Autofill Current Application Page
      </button>

      <button id="detectBtn" class="btn btn-secondary">
        <span class="icon">🔍</span> Detect Application Fields
      </button>
    </div>

    <div class="essay-quick-copy">
      <div class="section-title">QUICK ESSAY COPY</div>
      <button id="copyStatementBtn" class="btn btn-outline text-xs">
        📋 Copy Personal Statement (${appData.personalStatement ? appData.personalStatement.split(' ').length : 0} words)
      </button>
      <button id="copySupplementalBtn" class="btn btn-outline text-xs mt-1">
        📋 Copy Why Major Essay (${appData.supplementalEssay1 ? appData.supplementalEssay1.split(' ').length : 0} words)
      </button>
    </div>

    <div id="statusMessage" class="status-msg"></div>

    <div class="footer">
      Collegeify Manifest V3 • Connected to Cloud Dossier
    </div>
  </div>
  <script src="popup.js"></script>
</body>
</html>
`;

  const popupCss = `body {
  width: 340px;
  margin: 0;
  padding: 16px;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  background-color: #F9F7F2;
  color: #1A1A1A;
}

.popup-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.header {
  display: flex;
  align-items: center;
  gap: 10px;
  border-bottom: 1px solid #1A1A1A;
  padding-bottom: 10px;
}

.logo-badge {
  width: 32px;
  height: 32px;
  background: #1A1A1A;
  color: #FFFFFF;
  font-family: Georgia, serif;
  font-style: italic;
  font-weight: bold;
  font-size: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
}

h1 {
  font-family: Georgia, serif;
  font-style: italic;
  font-size: 18px;
  margin: 0;
  line-height: 1.1;
}

.subtitle {
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: #666;
  margin: 2px 0 0 0;
}

.profile-card {
  background: #FFFFFF;
  border: 1px solid #1A1A1A;
  padding: 10px 12px;
  box-shadow: 2px 2px 0px #1A1A1A;
}

.profile-label {
  font-size: 9px;
  font-weight: bold;
  letter-spacing: 1px;
  color: #888;
}

.profile-name {
  font-size: 15px;
  font-weight: bold;
  margin-top: 2px;
}

.profile-details {
  font-size: 11px;
  color: #555;
  margin-top: 2px;
}

.actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 9px 12px;
  font-size: 11px;
  font-weight: bold;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border: 1px solid #1A1A1A;
  cursor: pointer;
  transition: all 0.15s ease;
}

.btn-primary {
  background: #1A1A1A;
  color: #FFFFFF;
  box-shadow: 2px 2px 0px #888;
}

.btn-primary:hover {
  background: #333;
}

.btn-secondary {
  background: #FFFFFF;
  color: #1A1A1A;
}

.btn-secondary:hover {
  background: #EFECE6;
}

.btn-outline {
  background: transparent;
  border: 1px dashed #1A1A1A;
  font-size: 10px;
  padding: 6px 10px;
  width: 100%;
}

.btn-outline:hover {
  background: #EFECE6;
}

.section-title {
  font-size: 9px;
  font-weight: bold;
  letter-spacing: 1px;
  color: #666;
  margin-bottom: 4px;
}

.essay-quick-copy {
  background: #FFFFFF;
  border: 1px solid #E5E0D8;
  padding: 8px 10px;
}

.status-msg {
  font-size: 11px;
  font-weight: bold;
  text-align: center;
  min-height: 16px;
  color: #059669;
}

.footer {
  font-size: 9px;
  text-align: center;
  color: #888;
  margin-top: 4px;
}
`;

  const popupJs = `// Collegeify Chrome Extension Popup Script
document.addEventListener('DOMContentLoaded', () => {
  const autofillBtn = document.getElementById('autofillBtn');
  const detectBtn = document.getElementById('detectBtn');
  const copyStatementBtn = document.getElementById('copyStatementBtn');
  const copySupplementalBtn = document.getElementById('copySupplementalBtn');
  const statusMessage = document.getElementById('statusMessage');

  const profileData = ${JSON.stringify(appData, null, 2)};

  function showStatus(msg, isError = false) {
    statusMessage.style.color = isError ? '#dc2626' : '#059669';
    statusMessage.innerText = msg;
    setTimeout(() => {
      statusMessage.innerText = '';
    }, 3000);
  }

  autofillBtn.addEventListener('click', () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (!tabs || !tabs[0]) {
        showStatus('No active tab found.', true);
        return;
      }
      chrome.tabs.sendMessage(
        tabs[0].id,
        { action: 'AUTOFILL_PAGE', data: profileData },
        (response) => {
          if (chrome.runtime.lastError) {
            showStatus('Please refresh the application page to activate autofill.', true);
          } else if (response && response.success) {
            showStatus(\`⚡ Filled \${response.filledCount} application fields!\`);
          } else {
            showStatus('Autofill complete.', false);
          }
        }
      );
    });
  });

  detectBtn.addEventListener('click', () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (!tabs || !tabs[0]) return;
      chrome.tabs.sendMessage(tabs[0].id, { action: 'DETECT_FIELDS' }, (response) => {
        if (response && response.fields) {
          showStatus(\`Detected \${response.fields.length} form inputs on page.\`);
        }
      });
    });
  });

  copyStatementBtn.addEventListener('click', () => {
    if (profileData.personalStatement) {
      navigator.clipboard.writeText(profileData.personalStatement);
      showStatus('Copied Personal Statement to clipboard!');
    } else {
      showStatus('No personal statement in dossier.', true);
    }
  });

  copySupplementalBtn.addEventListener('click', () => {
    if (profileData.supplementalEssay1) {
      navigator.clipboard.writeText(profileData.supplementalEssay1);
      showStatus('Copied Why Major Essay to clipboard!');
    } else {
      showStatus('No supplemental essay in dossier.', true);
    }
  });
});
`;

  const readme = `# Collegeify Chrome Extension (Manifest V3)

This Chrome Extension allows you to automatically fill out college application portals (such as Common App, Coalition App, ApplyTexas, and individual university admissions forms) using your saved Collegeify applicant dossier.

## Features
- **Smart DOM Autofill**: Detects inputs for Name, Email, Phone, Address, High School, GPA, SAT/ACT scores, Intended Major, and Essays.
- **Visual Feedback**: Highlights filled fields with a green success border and triggers native input events so React/Vue forms capture state.
- **One-Click Quick Copy**: Quick copy buttons for Personal Statements & Supplemental Essays.
- **Manifest V3 Compliant**: Uses modern Chrome extension standards.

## How to Install in Google Chrome
1. Extract the downloaded \`collegeify-chrome-extension.zip\` file to a folder on your computer.
2. Open Google Chrome and go to \`chrome://extensions\`.
3. Toggle on **Developer mode** in the top right corner.
4. Click **Load unpacked**.
5. Select the extracted folder containing \`manifest.json\`.
6. Click the Extensions puzzle icon in Chrome and pin **Collegeify**.
7. Open any college application web portal and click **Autofill Current Application Page**!
`;

  // Standard SVG icon placeholders for 16, 48, 128
  const iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128">
  <rect width="128" height="128" fill="#1A1A1A"/>
  <rect y="112" width="128" height="16" fill="#10b981"/>
  <text x="64" y="85" font-family="Georgia, serif" font-style="italic" font-weight="bold" font-size="80" fill="#FFFFFF" text-anchor="middle">C</text>
</svg>`;

  return {
    manifest,
    backgroundJs,
    contentJs,
    popupHtml,
    popupCss,
    popupJs,
    readme,
    iconSvg,
  };
}

function createPngIconBlob(size: number): Promise<Blob> {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      // Dark background
      ctx.fillStyle = '#1A1A1A';
      ctx.fillRect(0, 0, size, size);

      // Emerald accent bar
      ctx.fillStyle = '#10b981';
      const barHeight = Math.max(2, Math.round(size * 0.12));
      ctx.fillRect(0, size - barHeight, size, barHeight);

      // White "C" letter
      ctx.fillStyle = '#FFFFFF';
      ctx.font = `italic bold ${Math.round(size * 0.65)}px Georgia, serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('C', size / 2, size / 2 - Math.round(size * 0.04));
    }
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob);
      } else {
        resolve(new Blob([], { type: 'image/png' }));
      }
    }, 'image/png');
  });
}

export async function downloadExtensionZip(appData: CollegeApplicationData) {
  const files = getExtensionFiles(appData);
  const zip = new JSZip();

  const [icon16Blob, icon48Blob, icon128Blob] = await Promise.all([
    createPngIconBlob(16),
    createPngIconBlob(48),
    createPngIconBlob(128),
  ]);

  zip.file('manifest.json', files.manifest);
  zip.file('background.js', files.backgroundJs);
  zip.file('content.js', files.contentJs);
  zip.file('popup.html', files.popupHtml);
  zip.file('popup.css', files.popupCss);
  zip.file('popup.js', files.popupJs);
  zip.file('README.md', files.readme);
  zip.file('icon16.png', icon16Blob);
  zip.file('icon48.png', icon48Blob);
  zip.file('icon128.png', icon128Blob);
  zip.file('icon.svg', files.iconSvg);

  const content = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(content);
  const a = document.createElement('a');
  a.href = url;
  a.download = `collegeify-chrome-extension-${(appData.applicantName || 'dossier').toLowerCase().replace(/\s+/g, '-')}.zip`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
