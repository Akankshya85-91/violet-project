// Free MyMemory Translation API
const MYMEMORY_API = 'https://api.mymemory.translated.net/get';

// Technical term glossary for better translations
const TECHNICAL_TERMS: Record<string, Record<string, string>> = {
  hi: { // Hindi translations - Medical & Scientific
    'cardiologist': 'हृदय रोग विशेषज्ञ',
    'neurologist': 'स्नायु रोग विशेषज्ञ',
    'dermatologist': 'त्वचा रोग विशेषज्ञ',
    'psychiatrist': 'मनोचिकित्सक',
    'surgeon': 'शल्य चिकित्सक',
    'pediatrician': 'बाल रोग विशेषज्ञ',
    'oncologist': 'कैंसर विशेषज्ञ',
    'radiologist': 'रेडियोलॉजिस्ट',
    'anesthesiologist': 'संज्ञाहरण विशेषज्ञ',
    'endocrinologist': 'अंतःस्रावी रोग विशेषज्ञ',
    'orthopedic': 'हड्डी रोग विशेषज्ञ',
    'gynecologist': 'स्त्री रोग विशेषज्ञ',
    'ophthalmologist': 'नेत्र रोग विशेषज्ञ',
    'dentist': 'दंत चिकित्सक',
    'pathologist': 'रोग विज्ञानी',
    'physiotherapist': 'भौतिक चिकित्सक',
    'diabetes': 'मधुमेह',
    'hypertension': 'उच्च रक्तचाप',
    'cholesterol': 'कोलेस्ट्रॉल',
    'arthritis': 'गठिया',
    'asthma': 'दमा',
    'pneumonia': 'निमोनिया',
    'tuberculosis': 'क्षय रोग',
    'malaria': 'मलेरिया',
    'dengue': 'डेंगू',
    'covid': 'कोविड',
    'vaccine': 'टीका',
    'antibiotic': 'प्रतिजैविक',
    'prescription': 'नुस्खा',
    'surgery': 'शल्य चिकित्सा',
    'diagnosis': 'निदान',
    'treatment': 'उपचार',
    'medicine': 'दवा',
    'injection': 'इंजेक्शन',
    'x-ray': 'एक्स-रे',
    'mri': 'एमआरआई',
    'ct scan': 'सीटी स्कैन',
    'ultrasound': 'अल्ट्रासाउंड',
    'blood test': 'रक्त परीक्षण',
    'heart attack': 'हृदयाघात',
    'stroke': 'आघात',
    'cancer': 'कैंसर',
    'tumor': 'ट्यूमर',
    'fracture': 'हड्डी टूटना',
    'fever': 'बुखार',
    'cough': 'खांसी',
    'headache': 'सिरदर्द',
    'pain': 'दर्द',
    'infection': 'संक्रमण',
  },
  mr: { // Marathi translations - Medical & Scientific
    'cardiologist': 'हृदयरोग तज्ञ',
    'neurologist': 'न्यूरोलॉजिस्ट',
    'dermatologist': 'त्वचारोग तज्ञ',
    'psychiatrist': 'मनोचिकित्सक',
    'surgeon': 'शस्त्रक्रिया तज्ञ',
    'pediatrician': 'बालरोग तज्ञ',
    'oncologist': 'कर्करोग तज्ञ',
    'radiologist': 'रेडिओलॉजिस्ट',
    'anesthesiologist': 'भूल तज्ञ',
    'endocrinologist': 'अंतःस्रावी तज्ञ',
    'orthopedic': 'हाडे तज्ञ',
    'gynecologist': 'स्त्रीरोग तज्ञ',
    'ophthalmologist': 'नेत्ररोग तज्ञ',
    'dentist': 'दंतवैद्य',
    'pathologist': 'रोगविज्ञानी',
    'physiotherapist': 'भौतिक चिकित्सक',
    'diabetes': 'मधुमेह',
    'hypertension': 'उच्च रक्तदाब',
    'cholesterol': 'कोलेस्टेरॉल',
    'arthritis': 'संधिवात',
    'asthma': 'दमा',
    'pneumonia': 'निमोनिया',
    'tuberculosis': 'क्षयरोग',
    'malaria': 'मलेरिया',
    'dengue': 'डेंग्यू',
    'covid': 'कोविड',
    'vaccine': 'लस',
    'antibiotic': 'प्रतिजैविक',
    'prescription': 'औषधपत्रक',
    'surgery': 'शस्त्रक्रिया',
    'diagnosis': 'निदान',
    'treatment': 'उपचार',
    'medicine': 'औषध',
    'injection': 'इंजेक्शन',
    'x-ray': 'क्ष-किरण',
    'mri': 'एमआरआय',
    'ct scan': 'सीटी स्कॅन',
    'ultrasound': 'अल्ट्रासाउंड',
    'blood test': 'रक्त तपासणी',
    'heart attack': 'हृदयविकाराचा झटका',
    'stroke': 'पक्षाघात',
    'cancer': 'कर्करोग',
    'tumor': 'गाठ',
    'fracture': 'हाड मोडणे',
    'fever': 'ताप',
    'cough': 'खोकला',
    'headache': 'डोकेदुखी',
    'pain': 'वेदना',
    'infection': 'संसर्ग',
  },
  es: { // Spanish translations
    'cardiologist': 'cardiólogo',
    'neurologist': 'neurólogo',
    'dermatologist': 'dermatólogo',
    'psychiatrist': 'psiquiatra',
    'surgeon': 'cirujano',
    'pediatrician': 'pediatra',
    'oncologist': 'oncólogo',
    'radiologist': 'radiólogo',
    'anesthesiologist': 'anestesiólogo',
    'endocrinologist': 'endocrinólogo',
  },
};

// Function to replace technical terms in text
function replaceTechnicalTerms(text: string, targetLang: string): string {
  if (!TECHNICAL_TERMS[targetLang]) return text;
  
  let result = text;
  const terms = TECHNICAL_TERMS[targetLang];
  
  for (const [english, translated] of Object.entries(terms)) {
    const regex = new RegExp(`\\b${english}\\b`, 'gi');
    result = result.replace(regex, translated);
  }
  
  return result;
}

export async function translateText(
  text: string,
  sourceLang: string,
  targetLang: string
): Promise<string> {
  try {
    // First, try to replace known technical terms
    const preprocessedText = replaceTechnicalTerms(text, targetLang);
    
    // Split long text into chunks to avoid API limits (500 char limit)
    const maxChunkSize = 500;
    const chunks: string[] = [];
    
    if (preprocessedText.length <= maxChunkSize) {
      chunks.push(preprocessedText);
    } else {
      // Split by sentences to maintain context
      const sentences = preprocessedText.match(/[^.!?]+[.!?]+/g) || [preprocessedText];
      let currentChunk = '';
      
      for (const sentence of sentences) {
        if ((currentChunk + sentence).length <= maxChunkSize) {
          currentChunk += sentence;
        } else {
          if (currentChunk) chunks.push(currentChunk.trim());
          currentChunk = sentence;
        }
      }
      if (currentChunk) chunks.push(currentChunk.trim());
    }
    
    // Translate each chunk with delay to avoid rate limits
    const translatedChunks: string[] = [];
    
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      const langPair = `${sourceLang}|${targetLang}`;
      
      try {
        const response = await fetch(
          `${MYMEMORY_API}?q=${encodeURIComponent(chunk)}&langpair=${langPair}`
        );
        
        if (!response.ok) {
          console.error('Translation API error:', response.status, response.statusText);
          throw new Error(`Translation request failed: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('API Response:', data);
        
        if (data.responseData?.translatedText) {
          let translated = data.responseData.translatedText;
          // Post-process to ensure technical terms are correctly translated
          translated = replaceTechnicalTerms(translated, targetLang);
          translatedChunks.push(translated);
        } else if (data.responseStatus === 403 || data.responseStatus === '403') {
          throw new Error('Invalid language pair. Please select valid languages.');
        } else {
          console.error('Invalid API response:', data);
          // Fallback: return original text if translation fails
          translatedChunks.push(chunk);
        }
        
        // Add small delay between requests to avoid rate limiting
        if (i < chunks.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 300));
        }
      } catch (err) {
        console.error('Translation chunk error:', err);
        // Fallback: use original text for failed chunks
        translatedChunks.push(chunk);
      }
    }
    
    return translatedChunks.join(' ');
  } catch (error) {
    console.error('Translation error:', error);
    throw new Error('Failed to translate text. Please try again.');
  }
}

export async function detectLanguage(text: string): Promise<string> {
  try {
    const response = await fetch(
      `${MYMEMORY_API}?q=${encodeURIComponent(text)}&langpair=en|es`
    );
    
    const data = await response.json();
    
    // MyMemory doesn't provide language detection directly
    // This is a simplified approach - in production, you'd use a dedicated API
    return 'en';
  } catch (error) {
    console.error('Language detection error:', error);
    return 'en';
  }
}

// Text-to-Speech using Web Speech API with improved clarity for Hindi and Marathi
export function speakText(text: string, lang: string) {
  if ('speechSynthesis' in window) {
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Set language-specific voice settings for better clarity
    if (lang === 'hi' || lang === 'hi-IN') {
      utterance.lang = 'hi-IN';
      utterance.rate = 0.75; // Slower for better clarity
      utterance.pitch = 1.1; // Slightly higher pitch for better articulation
    } else if (lang === 'mr' || lang === 'mr-IN') {
      utterance.lang = 'mr-IN';
      utterance.rate = 0.75; // Slower for better clarity
      utterance.pitch = 1.1; // Slightly higher pitch for better articulation
    } else {
      utterance.lang = lang;
      utterance.rate = 0.9;
      utterance.pitch = 1;
    }
    
    window.speechSynthesis.speak(utterance);
  } else {
    throw new Error('Text-to-speech not supported');
  }
}

// Stop speech
export function stopSpeech() {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}