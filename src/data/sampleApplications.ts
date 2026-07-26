import { CollegeApplicationData } from '../types';

export const EMPTY_APPLICATION_DATA: CollegeApplicationData = {
  applicantName: '',
  email: '',
  phone: '',
  address: '',
  dob: '',
  highSchool: '',
  gpa: '',
  testScores: '',
  intendedMajor: '',
  targetColleges: [],
  personalStatementPrompt: 'Some students have a background, identity, interest, or talent that is so meaningful they believe their application would be incomplete without it. Share your story.',
  personalStatement: '',
  supplementalEssay1Prompt: 'Why are you interested in your intended major or university?',
  supplementalEssay1: '',
  activities: [],
  honors: [],
  signatureName: '',
  signatureDate: '',
};

export const SAMPLE_APPLICATIONS: { id: string; label: string; college: string; data: CollegeApplicationData }[] = [
  {
    id: 'stanford-cs',
    label: 'Stanford CS & AI Applicant',
    college: 'Stanford University',
    data: {
      applicantName: 'Alex Rivera',
      email: 'alex.rivera@example.com',
      phone: '(555) 382-9102',
      address: '428 Oakwood Ave, Palo Alto, CA 94301',
      dob: '2008-04-12',
      highSchool: 'Palo Alto High School',
      gpa: '3.98 (Unweighted) / 4.42 (Weighted)',
      testScores: 'SAT: 1560 (Math: 800, EBRW: 760)',
      intendedMajor: 'Computer Science & Human-AI Interaction',
      targetColleges: ['Stanford University', 'MIT', 'UC Berkeley', 'Carnegie Mellon'],
      
      personalStatementPrompt: 'Some students have a background, identity, interest, or talent that is so meaningful they believe their application would be incomplete without it. Share your story.',
      personalStatement: `My grandfather sat silently on the porch, staring at the blurred photo of his childhood village in Guadalajara. Glaucoma had dimmed his sight to faint shadows, rendering his old photo albums useless. Driven by a desire to reconnect him with his memories, I spent my junior year developing SightEcho—a mobile computer vision tool that converts static photographs into rich spatial audio narratives.

Building SightEcho wasn't just a coding exercise; it was an exercise in empathy. When I first demoed the prototype to my grandfather, hearing a synthetic voice describe 'a sunlit courtyard with two red tiles' brought tears to his eyes. That moment fundamentally shifted my perspective on technology. I realized code is not merely syntax and logic gates—it is a paintbrush for human dignity. I want to spend my college years researching assistive AI models at the intersection of computer vision and human-computer interaction, building technology that heals human isolation.`,

      supplementalEssay1Prompt: 'Virtually all of Stanford’s undergraduates live on campus. What would you want your future roommate to know about you?',
      supplementalEssay1: `Dear future roommate: Be prepared for late-night matcha brews, a desk perpetually covered in microcontrollers and soldering kits, and an endless playlist of 80s synth-wave mixed with classical guitar. I am the kind of person who gets irrationally excited about debugging a C++ algorithm at 1 AM, but I will always stop to make you a grilled cheese sandwich when midterms hit.`,

      activities: [
        {
          id: 'act-1',
          title: 'Founder & Lead Developer',
          organization: 'SightEcho Accessibility Project',
          role: 'Founder',
          grades: ['11', '12'],
          hoursPerWeek: 12,
          weeksPerYear: 40,
          description: 'Engineered an open-source computer vision app for visually impaired seniors. Deployed to 4,500+ active users across 12 senior centers in Northern California.'
        },
        {
          id: 'act-2',
          title: 'Captain & Strategy Lead',
          organization: 'FIRST Robotics Competition Team 192',
          role: 'Team Captain',
          grades: ['10', '11', '12'],
          hoursPerWeek: 15,
          weeksPerYear: 30,
          description: 'Led 45-student team to Silicon Valley Regional Championship. Managed $25k budget, programmed autonomous vision tracking, and mentored 15 junior engineers.'
        },
        {
          id: 'act-3',
          title: 'AI Research Intern',
          organization: 'Stanford AI Literacy Lab',
          role: 'Research Assistant',
          grades: ['11'],
          hoursPerWeek: 10,
          weeksPerYear: 12,
          description: 'Co-authored paper on lightweight multimodal transformer models for edge devices under Dr. H. Vance. Presented poster at Bay Area Youth STEM Summit.'
        }
      ],
      honors: [
        {
          id: 'hon-1',
          title: 'USA Computing Olympiad (USACO) Gold Division',
          gradeLevel: '11th Grade',
          levelOfRecognition: 'National'
        },
        {
          id: 'hon-2',
          title: 'National Merit Finalist',
          gradeLevel: '12th Grade',
          levelOfRecognition: 'National'
        },
        {
          id: 'hon-3',
          title: 'Presidential Volunteer Service Award (Gold)',
          gradeLevel: '11th Grade',
          levelOfRecognition: 'National'
        }
      ],
      signatureName: 'Alex Rivera',
      signatureDate: '2026-11-01'
    }
  },
  {
    id: 'harvard-premed',
    label: 'Harvard Pre-Med & Bioethics Applicant',
    college: 'Harvard University',
    data: {
      applicantName: 'Maya Lin Chen',
      email: 'maya.chen@example.com',
      phone: '(555) 921-4401',
      address: '104 Beacon Street, Boston, MA 02116',
      dob: '2008-01-29',
      highSchool: 'Boston Latin School',
      gpa: '4.00 (Unweighted) / 4.65 (Weighted)',
      testScores: 'ACT: 35 (English: 36, Math: 35, Reading: 36, Science: 35)',
      intendedMajor: 'Molecular & Cellular Biology / Global Health',
      targetColleges: ['Harvard University', 'Yale University', 'Johns Hopkins', 'Brown University'],
      
      personalStatementPrompt: 'Describe a topic, idea, or concept you find so engaging that it makes you lose all track of time.',
      personalStatement: `The hum of the centrifuge in the Boston Children's Hospital research floor was my heartbeat every Tuesday afternoon. I spent eight months examining cellular responses to novel micro-fluidic enzyme assays. But what truly captivated me was not just the pipetting or fluorescence microscopy; it was the story behind sample #304—a seven-year-old pediatric oncology patient whose diagnosis highlighted structural healthcare inequities.

Science in a vacuum is merely laboratory curiosity. True medicine happens when molecular biology meets human advocacy. At Harvard, I hope to bridge the gap between benchtop research and community healthcare equity, fighting for universal diagnostic access while discovering the next generation of targeted therapies.`,

      supplementalEssay1Prompt: 'How will you engage with the Harvard community?',
      supplementalEssay1: `I plan to bring both my laboratory passion and my background as a cello soloist in the Boston Youth Symphony Orchestra to Harvard. Whether organizing community health clinics through the Phillips Brooks House Association or performing chamber music in Annenberg Hall, I thrive at the crossroad of science, art, and service.`,

      activities: [
        {
          id: 'act-1',
          title: 'Oncology Research Associate',
          organization: 'Boston Children\'s Hospital',
          role: 'Student Researcher',
          grades: ['11', '12'],
          hoursPerWeek: 14,
          weeksPerYear: 36,
          description: 'Investigated microfluidic enzyme markers for early pediatric leukemia detection. Synthesized data for 120+ trials and presented findings at MA Bio-Tech Forum.'
        },
        {
          id: 'act-2',
          title: 'Principal Cellist',
          organization: 'Boston Youth Symphony Orchestra',
          role: 'Principal Cellist',
          grades: ['9', '10', '11', '12'],
          hoursPerWeek: 10,
          weeksPerYear: 42,
          description: 'Led 18-cellist section in international tour performing in Prague and Vienna. Organized benefit concerts raising $18,000 for local children\'s hospitals.'
        }
      ],
      honors: [
        {
          id: 'hon-1',
          title: 'Intel International Science & Engineering Fair (ISEF) 2nd Place',
          gradeLevel: '11th Grade',
          levelOfRecognition: 'International'
        },
        {
          id: 'hon-2',
          title: 'U.S. Biology Olympiad (USABO) Semifinalist',
          gradeLevel: '11th Grade',
          levelOfRecognition: 'National'
        }
      ],
      signatureName: 'Maya Lin Chen',
      signatureDate: '2026-10-28'
    }
  }
];
