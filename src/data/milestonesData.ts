import { Milestone } from '../types';

export const initialMilestones: Milestone[] = [
  {
    id: 'ms-1',
    stepOrder: 1,
    title: 'Main Conduit Piping & Trunking',
    titleHi: 'मुख्य कन्ड्यूट पाइपिंग एवं ट्रंकिंग',
    description:
      'Install heavy-duty rigid PVC/GI conduit pipes along the demarcated route on the wall. Ensure GI saddles are fixed with rawl plugs every 600mm, bends are seamless without kinks, and terminal junction boxes are securely fastened.',
    descriptionHi:
      'दीवार पर चिह्नित मार्ग के अनुसार भारी पीवीसी/जीआई कन्ड्यूट पाइप लगाएं। हर 600mm पर सैडल कसें और जंक्शन बॉक्स को मजबूती से लॉक करें।',
    referenceImageUrl:
      'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=800&q=80',
    youtubeVideoUrl: 'https://www.youtube.com/embed/PZl4z_y2nJc',
    estimatedMinutes: 45,
    criticalTools: ['Pipe Bender', 'Hacksaw', 'GI Saddles', 'Rawl Plugs', 'Spirit Level']
  },
  {
    id: 'ms-2',
    stepOrder: 2,
    title: 'Distribution Board (DB) Incomer Wiring',
    titleHi: 'वितरण बोर्ड (DB) इनकमर एवं वायरिंग',
    description:
      'Dress 3-phase 415V copper incoming cables into the Distribution Board enclosure. Connect via 63A 4-Pole Isolator and 30mA RCCB. Group outgoing circuits neatly with color-coded ferrule tags (R/Y/B/N) into individual MCBs.',
    descriptionHi:
      'डिस्ट्रिब्यूशन बोर्ड में 3-फेज केबल को व्यवस्थित करें। 63A 4-पोल आइसोलेटर और 30mA आरसीसीबी से जोड़ें तथा सभी तारों पर कलर फेरूल लगाएं।',
    referenceImageUrl:
      'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80',
    youtubeVideoUrl: 'https://www.youtube.com/embed/2e_G6vY3P8M',
    estimatedMinutes: 60,
    criticalTools: ['Wire Stripper', 'Ferrule Crimper', 'Insulated Screwdrivers (1000V)', 'Torque Spanner']
  },
  {
    id: 'ms-3',
    stepOrder: 3,
    title: 'Chemical Earthing Pit & Electrode Setup',
    titleHi: 'केमिकल अर्थिंग पिट एवं इलेक्ट्रोड स्थापना',
    description:
      'Drill 3-meter borehole for pure copper-bonded earth electrode (25mm dia). Fill with Earth Enhancement Bentonite/BFC compound. Fix heavy-duty CI/poly-plastic inspection chamber and test earth resistance (must be < 1.0 Ω).',
    descriptionHi:
      '3 मीटर गहरा अर्थिंग बोर कर कॉपर बॉन्डेड इलेक्ट्रोड डालें। बेंटोनाइट अर्थिंग कंपाउंड भरें और अर्थ रेजिस्टेंस 1.0 ओम से कम सुनिश्चित करें।',
    referenceImageUrl:
      'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
    youtubeVideoUrl: 'https://www.youtube.com/embed/yQd6d3v1b0U',
    estimatedMinutes: 90,
    criticalTools: ['Earth Tester (Megger)', 'Copper Tape 25x3mm', 'Earthing Compound', 'Brass Clamps']
  },
  {
    id: 'ms-4',
    stepOrder: 4,
    title: 'LT Busbar & Cable Glanding',
    titleHi: 'एलटी बसबार एवं केबल ग्लैंडिंग',
    description:
      'Gland armored XLPE cables using double-compression brass glands with earth tags. Crimp heavy-duty bimetallic terminal lugs with hydraulic crimper. Bolt onto tinned copper busbars with torque-rated high-tensile hardware.',
    descriptionHi:
      'आर्मर्ड केबल के लिए ब्रास डबल कम्प्रेशन ग्लैंड लगाएं। हाइड्रोलिक क्रिम्पर से कॉपर-एल्युमिनियम लग्स दबाकर बसबार पर कसें।',
    referenceImageUrl:
      'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=800&q=80',
    youtubeVideoUrl: 'https://www.youtube.com/embed/p9vN5Y4-8l4',
    estimatedMinutes: 75,
    criticalTools: ['Hydraulic Crimper', 'Double-Compression Glands', 'Torque Wrench', 'Belleville Washers']
  },
  {
    id: 'ms-5',
    stepOrder: 5,
    title: 'Insulation Resistance Testing (Megger) & Signoff',
    titleHi: 'इंसुलेशन रेजिस्टेंस परीक्षण (मेगर) एवं कमीशनिंग',
    description:
      'Perform 1000V DC Insulation Resistance (IR) test between Phase-Phase (>100 MΩ) and Phase-to-Earth (>50 MΩ). Record all readings on the site commissioning log sheet before applying energization clearance.',
    descriptionHi:
      '1000V डिजिटल मेगर से फेज-टू-फेज और फेज-टू-अर्थ इंसुलेशन टेस्ट करें और रीडिंग कमीशनिंग फॉर्म में दर्ज करें।',
    referenceImageUrl:
      'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=800&q=80',
    youtubeVideoUrl: 'https://www.youtube.com/embed/8v_RkZ_4yXw',
    estimatedMinutes: 30,
    criticalTools: ['1000V Digital Megger', 'Safety Gloves (Class 0)', 'Commissioning Log Sheet']
  }
];
