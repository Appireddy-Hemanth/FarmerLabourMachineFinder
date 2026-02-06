import { useEffect, useMemo, useRef, useState } from 'react';
import { User } from '../App';

interface ChatbotProps {
  currentUser: User | null;
}

type Lang = 'English' | 'हिन्दी' | 'తెలుగు' | 'தமிழ்' | 'ಕನ್ನಡ' | 'മലയാളം' | 'मराठी' | 'বাংলা';

interface Message {
  id: string;
  from: 'user' | 'bot';
  text: string;
}

const responses: Record<Lang, Record<string, string>> = {
  English: {
    welcome: "Hello! I'm AgriSahayak 🌾 How can I help you today?",
    askRole: 'Are you a farmer, labourer, or machine owner?',
    limited: 'I can help only with farming and this platform.',
    future: 'This feature is planned for future versions.',
    default: 'I can help you with jobs, machines, earnings, crop planning, or platform usage. What do you want to know?',
    job: 'To post a job: go to Post Work → fill details → Post Job. You can also use Auto-fill from last job.',
    hire: 'You can hire labour by posting a job. Use Smart Matching to find nearby labour.',
    machine: 'To rent machines: go to Find Machines → select machine → fill date/duration → Send Request.',
    crop: 'Crop Planning Assistant is in Insights. Choose crop to see stages and needs.',
    yield: 'Yield & Cost Simulator is in Insights. Choose crop and land size to view mock cost/yield.',
    alerts: 'Smart Alerts appear on your dashboard for delays and idle machines (mock).',
    trust: 'Trust Score is based on completed jobs and disputes (mock). Keep completing jobs on time.',
    tools: 'Farmers choose required tools while posting. Labour must confirm tools if they bring them. Tool responsibility is locked after acceptance.',
    roi: 'ROI dashboard is in Machine → Analytics. Enter purchase price to see ROI (mock).',
    maintenance: 'Predictive Maintenance is in Machine → Maintenance. Enter usage hours to see risk (mock).',
    group: 'Group Labour Mode is in Labour → Group Mode. Create a team and preview split (mock).',
    simulation: 'Simulation Mode is in Admin → Overview. Click "Simulate Full Farming Cycle".'
  },
  हिन्दी: {
    welcome: 'नमस्ते! मैं AgriSahayak 🌾 हूँ। मैं आपकी कैसे मदद कर सकता हूँ?',
    askRole: 'क्या आप किसान, श्रमिक, या मशीन मालिक हैं?',
    limited: 'मैं केवल खेती और इस प्लेटफॉर्म से जुड़ी मदद कर सकता हूँ।',
    future: 'यह सुविधा भविष्य के संस्करणों में आएगी।',
    default: 'मैं आपको नौकरियों, मशीनों, कमाई, फसल योजना या प्लेटफॉर्म उपयोग में मदद कर सकता हूँ। क्या जानना है?',
    job: 'काम पोस्ट करने के लिए: Post Work → विवरण भरें → Post Job.',
    hire: 'श्रमिक रखने के लिए जॉब पोस्ट करें। Smart Matching से पास के श्रमिक देखें।',
    machine: 'मशीन किराये के लिए: Find Machines → मशीन चुनें → तारीख/अवधि भरें → Send Request.',
    crop: 'Crop Planning Assistant Insights में है। फसल चुनकर चरण देखें।',
    yield: 'Yield & Cost Simulator Insights में है। फसल और जमीन का आकार चुनें।',
    alerts: 'Smart Alerts डैशबोर्ड पर दिखेंगे (मॉक).',
    trust: 'Trust Score पूर्ण किए गए काम और विवाद पर आधारित है (मॉक).',
    tools: 'किसान जॉब पोस्ट करते समय टूल्स चुनते हैं। अगर टूल्स श्रमिक लाएगा तो पुष्टि जरूरी है।',
    roi: 'ROI डैशबोर्ड Machine → Analytics में है (मॉक).',
    maintenance: 'Predictive Maintenance Machine → Maintenance में है (मॉक).',
    group: 'Group Labour Mode Labour → Group Mode में है (मॉक).',
    simulation: 'Simulation Mode Admin → Overview में है।'
  },
  తెలుగు: {
    welcome: 'హలో! నేను AgriSahayak 🌾. నేను మీకు ఎలా సహాయం చేయగలను?',
    askRole: 'మీరు రైతు, కూలీ, లేక యంత్ర యజమాని?',
    limited: 'నేను వ్యవసాయం మరియు ఈ ప్లాట్‌ఫారంతో మాత్రమే సహాయం చేస్తాను.',
    future: 'ఈ ఫీచర్ భవిష్యత్ వెర్షన్లలో ఉంటుంది.',
    default: 'జాబ్స్, యంత్రాలు, ఆదాయం, పంట ప్లానింగ్ లేదా ప్లాట్‌ఫారం వినియోగం గురించి అడగండి.',
    job: 'పని పోస్ట్ చేయాలంటే: Post Work → వివరాలు → Post Job.',
    hire: 'కూలీలను నియమించేందుకు జాబ్ పోస్ట్ చేయండి. Smart Matching ద్వారా చూడండి.',
    machine: 'యంత్రం కోసం: Find Machines → యంత్రం ఎంచుకోండి → తేదీ/వ్యవధి → Send Request.',
    crop: 'Crop Planning Assistant Insights లో ఉంటుంది. పంటను ఎంచుకోండి.',
    yield: 'Yield & Cost Simulator Insights లో ఉంటుంది.',
    alerts: 'Smart Alerts డ్యాష్‌బోర్డ్‌లో చూపిస్తాయి (మాక్).',
    trust: 'Trust Score పూర్తయిన పనులపై ఆధారపడుతుంది (మాక్).',
    tools: 'రైతు జాబ్ పోస్ట్ సమయంలో టూల్స్ ఎంచుకుంటారు. కూలీ టూల్స్ తీసుకొస్తే కన్ఫర్మ్ చేయాలి.',
    roi: 'ROI డ్యాష్‌బోర్డ్ Machine → Analytics లో ఉంది (మాక్).',
    maintenance: 'Predictive Maintenance Machine → Maintenance లో ఉంది (మాక్).',
    group: 'Group Labour Mode Labour → Group Mode లో ఉంది (మాక్).',
    simulation: 'Simulation Mode Admin → Overview లో ఉంది.'
  },
  தமிழ்: {
    welcome: 'வணக்கம்! நான் AgriSahayak 🌾. எப்படி உதவலாம்?',
    askRole: 'நீங்கள் விவசாயியா, தொழிலாளியா, இயந்திர உரிமையாளரா?',
    limited: 'நான் விவசாயம் மற்றும் இந்த தளத்திற்கு மட்டும் உதவுகிறேன்.',
    future: 'இந்த அம்சம் எதிர்காலத்தில் வரும்.',
    default: 'வேலை, இயந்திரம், வருமானம், பயிர் திட்டம் அல்லது பயன்பாடு குறித்து கேளுங்கள்.',
    job: 'வேலை பதிவு: Post Work → விவரங்கள் → Post Job.',
    hire: 'வேலைக்கு தொழிலாளரை பெற ஜாப் போஸ்ட் செய்யுங்கள்.',
    machine: 'இயந்திரம்: Find Machines → தேர்வு → தேதி/காலம் → Send Request.',
    crop: 'Crop Planning Assistant Insights இல் உள்ளது.',
    yield: 'Yield & Cost Simulator Insights இல் உள்ளது.',
    alerts: 'Smart Alerts டாஷ்போர்டில் (மாக்).',
    trust: 'Trust Score முடிந்த பணிகளின் அடிப்படையில் (மாக்).',
    tools: 'வேலை போஸ்ட் செய்யும்போது விவசாயி கருவிகளை தேர்வு செய்கிறார். தொழிலாளி கருவிகள் கொண்டுவரினால் உறுதி செய்ய வேண்டும்.',
    roi: 'ROI Machine → Analytics (மாக்).',
    maintenance: 'Predictive Maintenance Machine → Maintenance (மாக்).',
    group: 'Group Labour Mode Labour → Group Mode (மாக்).',
    simulation: 'Simulation Mode Admin → Overview.'
  },
  ಕನ್ನಡ: {
    welcome: 'ನಮಸ್ಕಾರ! ನಾನು AgriSahayak 🌾. ಹೇಗೆ ಸಹಾಯ ಮಾಡಲಿ?',
    askRole: 'ನೀವು ರೈತನಾ, ಕಾರ್ಮಿಕನಾ, ಅಥವಾ ಯಂತ್ರ ಮಾಲೀಕನಾ?',
    limited: 'ನಾನು ಕೃಷಿ ಮತ್ತು ಈ ವೇದಿಕೆ ಬಗ್ಗೆ ಮಾತ್ರ ಸಹಾಯ ಮಾಡುತ್ತೇನೆ.',
    future: 'ಈ ಫೀಚರ್ ಭವಿಷ್ಯದ ಆವೃತ್ತಿಯಲ್ಲಿ ಬರುತ್ತದೆ.',
    default: 'ಉದ್ಯೋಗ, ಯಂತ್ರ, ಆದಾಯ, ಬೆಳೆ ಯೋಜನೆ ಅಥವಾ ಬಳಕೆ ಬಗ್ಗೆ ಕೇಳಿ.',
    job: 'ಕೆಲಸ ಪೋಸ್ಟ್ ಮಾಡಲು: Post Work → ವಿವರಗಳು → Post Job.',
    hire: 'ಕಾರ್ಮಿಕರನ್ನು ಪಡೆಯಲು ಜಾಬ್ ಪೋಸ್ಟ್ ಮಾಡಿ.',
    machine: 'ಯಂತ್ರಕ್ಕೆ: Find Machines → ಆಯ್ಕೆ → ದಿನಾಂಕ/ಅವಧಿ → Send Request.',
    crop: 'Crop Planning Assistant Insights ನಲ್ಲಿ ಇದೆ.',
    yield: 'Yield & Cost Simulator Insights ನಲ್ಲಿ ಇದೆ.',
    alerts: 'Smart Alerts ಡ್ಯಾಶ್‌ಬೋರ್ಡ್‌ನಲ್ಲಿ (ಮಾಕ್).',
    trust: 'Trust Score ಪೂರ್ಣ ಕೆಲಸಗಳ ಮೇಲೆ (ಮಾಕ್).',
    tools: 'ರೈತರು ಜಾಬ್ ಪೋಸ್ಟ್ ವೇಳೆ ಟೂಲ್ಸ್ ಆಯ್ಕೆಮಾಡುತ್ತಾರೆ. ಕಾರ್ಮಿಕರು ಟೂಲ್ಸ್ ತರುತ್ತಿದ್ದರೆ ದೃಢೀಕರಣ ಬೇಕು.',
    roi: 'ROI Machine → Analytics (ಮಾಕ್).',
    maintenance: 'Predictive Maintenance Machine → Maintenance (ಮಾಕ್).',
    group: 'Group Labour Mode Labour → Group Mode (ಮಾಕ್).',
    simulation: 'Simulation Mode Admin → Overview.'
  },
  മലയാളം: {
    welcome: 'ഹലോ! ഞാൻ AgriSahayak 🌾. എങ്ങനെ സഹായിക്കാം?',
    askRole: 'നിങ്ങൾ കർഷകനോ, തൊഴിലാളിയോ, യന്ത്ര ഉടമയോ?',
    limited: 'കൃഷിയും ഈ പ്ലാറ്റ്ഫോമും മാത്രം സഹായിക്കും.',
    future: 'ഈ ഫീച്ചർ ഭാവിയിൽ ലഭിക്കും.',
    default: 'ജോബ്, യന്ത്രം, വരുമാനം, വിള പദ്ധതി എന്നിവ ചോദിക്കാം.',
    job: 'ജോബ് പോസ്റ്റ് ചെയ്യാൻ: Post Work → വിശദാംശങ്ങൾ → Post Job.',
    hire: 'തൊഴിലാളികളെ നേടാൻ ജോബ് പോസ്റ്റ് ചെയ്യുക.',
    machine: 'യന്ത്രത്തിന്: Find Machines → തിരഞ്ഞെടുക്കുക → തീയതി/ദൈർഘ്യം → Send Request.',
    crop: 'Crop Planning Assistant Insights ൽ.',
    yield: 'Yield & Cost Simulator Insights ൽ.',
    alerts: 'Smart Alerts ഡാഷ്ബോർഡിൽ (മോക്ക്).',
    trust: 'Trust Score പൂർത്തിയായ ജോബുകൾ അടിസ്ഥാനമാക്കിയാണ് (മോക്ക്).',
    tools: 'ജോബ് പോസ്റ്റ് ചെയ്യുമ്പോൾ കർഷകൻ ടൂളുകൾ തിരഞ്ഞെടുക്കുന്നു. തൊഴിലാളി കൊണ്ടുവരുകയാണെങ്കിൽ സ്ഥിരീകരണം ആവശ്യം.',
    roi: 'ROI Machine → Analytics (മോക്ക്).',
    maintenance: 'Predictive Maintenance Machine → Maintenance (മോക്ക്).',
    group: 'Group Labour Mode Labour → Group Mode (മോക്ക്).',
    simulation: 'Simulation Mode Admin → Overview.'
  },
  मराठी: {
    welcome: 'नमस्कार! मी AgriSahayak 🌾. कशी मदत करू?',
    askRole: 'आपण शेतकरी, कामगार की मशीन मालक आहात?',
    limited: 'मी फक्त शेती आणि या प्लॅटफॉर्मबद्दल मदत करू शकतो.',
    future: 'हा फिचर भविष्यात येईल.',
    default: 'जॉब, मशीन, कमाई, पीक नियोजन किंवा वापर याबद्दल विचारा.',
    job: 'काम पोस्ट: Post Work → तपशील → Post Job.',
    hire: 'कामगार मिळवण्यासाठी जॉब पोस्ट करा.',
    machine: 'मशीनसाठी: Find Machines → निवडा → तारीख/कालावधी → Send Request.',
    crop: 'Crop Planning Assistant Insights मध्ये आहे.',
    yield: 'Yield & Cost Simulator Insights मध्ये आहे.',
    alerts: 'Smart Alerts डॅशबोर्डवर (मॉक).',
    trust: 'Trust Score पूर्ण कामांवर आधारित (मॉक).',
    tools: 'जॉब पोस्ट करताना शेतकरी टूल्स निवडतो. कामगार टूल्स आणत असेल तर कन्फर्म करणे आवश्यक.',
    roi: 'ROI Machine → Analytics (मॉक).',
    maintenance: 'Predictive Maintenance Machine → Maintenance (मॉक).',
    group: 'Group Labour Mode Labour → Group Mode (मॉक).',
    simulation: 'Simulation Mode Admin → Overview.'
  },
  বাংলা: {
    welcome: 'হ্যালো! আমি AgriSahayak 🌾। কীভাবে সাহায্য করতে পারি?',
    askRole: 'আপনি কি কৃষক, শ্রমিক, না মেশিন মালিক?',
    limited: 'আমি শুধু কৃষি ও এই প্ল্যাটফর্ম নিয়ে সাহায্য করি।',
    future: 'এই ফিচার ভবিষ্যতে আসবে।',
    default: 'চাকরি, মেশিন, আয়, ফসল পরিকল্পনা বা প্ল্যাটফর্ম ব্যবহারে প্রশ্ন করুন।',
    job: 'কাজ পোস্ট: Post Work → বিস্তারিত → Post Job.',
    hire: 'শ্রমিক পেতে জব পোস্ট করুন।',
    machine: 'মেশিনের জন্য: Find Machines → নির্বাচন → তারিখ/সময় → Send Request.',
    crop: 'Crop Planning Assistant Insights এ আছে।',
    yield: 'Yield & Cost Simulator Insights এ আছে।',
    alerts: 'Smart Alerts ড্যাশবোর্ডে (মক).',
    trust: 'Trust Score সম্পন্ন কাজের উপর ভিত্তি করে (মক).',
    tools: 'জব পোস্ট করার সময় কৃষক টুলস নির্ধারণ করেন। শ্রমিক টুলস আনলে নিশ্চিত করতে হবে.',
    roi: 'ROI Machine → Analytics (মক).',
    maintenance: 'Predictive Maintenance Machine → Maintenance (মক).',
    group: 'Group Labour Mode Labour → Group Mode (মক).',
    simulation: 'Simulation Mode Admin → Overview.'
  }
};

const languageFromText = (text: string): Lang => {
  if (/[അ-ഺ]/.test(text)) return 'മലയാളം';
  if (/[ಅ-಺]/.test(text)) return 'ಕನ್ನಡ';
  if (/[அ-஺]/.test(text)) return 'தமிழ்';
  if (/[అ-఺]/.test(text)) return 'తెలుగు';
  if (/[ऀ-ॿ]/.test(text)) return 'हिन्दी';
  if (/[অ-঺]/.test(text)) return 'বাংলা';
  return 'English';
};

const detectIntent = (text: string) => {
  const lower = text.toLowerCase();
  if (/(movie|politics|cricket|code|programming|music|stock)/.test(lower)) return 'limited';
  if (/(aadhaar|aadhar|gps|payment|upi|wallet)/.test(lower)) return 'future';
  if (/(job|post|work)/.test(lower)) return 'job';
  if (/(hire|labour|labor)/.test(lower)) return 'hire';
  if (/(machine|tractor|harvester|sprayer|drone)/.test(lower)) return 'machine';
  if (/(crop|planning|calendar)/.test(lower)) return 'crop';
  if (/(yield|cost|profit)/.test(lower)) return 'yield';
  if (/(alert|warning)/.test(lower)) return 'alerts';
  if (/(trust|rating|score)/.test(lower)) return 'trust';
  if (/(tool|tools|spade|sickle|sprayer|cutter|rope)/.test(lower)) return 'tools';
  if (/(roi)/.test(lower)) return 'roi';
  if (/(maintenance|service|breakdown)/.test(lower)) return 'maintenance';
  if (/(group|team)/.test(lower)) return 'group';
  if (/(simulation|demo)/.test(lower)) return 'simulation';
  return 'default';
};

export function Chatbot({ currentUser }: ChatbotProps) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [position, setPosition] = useState({ x: 24, y: 24 });
  const draggingRef = useRef(false);
  const dragOffsetRef = useRef({ x: 0, y: 0 });

  const storedLang = (localStorage.getItem('appLanguage') as Lang) || 'English';
  const role = currentUser?.role || null;

  const initialLang = useMemo<Lang>(() => storedLang, [storedLang]);

  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: 'welcome',
          from: 'bot',
          text: responses[initialLang].welcome
        }
      ]);
    }
  }, [messages.length, initialLang]);

  const sendMessage = () => {
    const text = input.trim();
    if (!text) return;
    const userLang = languageFromText(text);
    const lang = userLang === 'English' ? initialLang : userLang;
    const intent = detectIntent(text);

    const next: Message[] = [
      ...messages,
      { id: `${Date.now()}-u`, from: 'user', text },
      {
        id: `${Date.now()}-b`,
        from: 'bot',
        text: role ? responses[lang][intent] : responses[lang].askRole
      }
    ];
    setMessages(next);
    setInput('');
  };

  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      if (!draggingRef.current) return;
      const x = Math.max(0, window.innerWidth - e.clientX - dragOffsetRef.current.x);
      const y = Math.max(0, e.clientY - dragOffsetRef.current.y);
      setPosition({ x, y });
    };
    const handleUp = () => {
      draggingRef.current = false;
    };
    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleUp);
    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleUp);
    };
  }, []);

  return (
    <div className="fixed z-50" style={{ right: position.x, top: position.y }}>
      {open && (
        <div className="w-80 h-96 bg-white rounded-xl shadow-xl border border-gray-200 flex flex-col overflow-hidden">
          <div
            className="px-4 py-3 bg-green-600 text-white flex items-center justify-between cursor-move"
            onMouseDown={(e) => {
              draggingRef.current = true;
              dragOffsetRef.current = {
                x: window.innerWidth - e.clientX - position.x,
                y: e.clientY - position.y
              };
            }}
          >
            <span className="font-semibold">AgriSahayak 🌾</span>
            <button onClick={() => setOpen(false)} className="text-white">×</button>
          </div>
          <div className="flex-1 p-3 space-y-2 overflow-auto text-sm">
            {messages.map(msg => (
              <div
                key={msg.id}
                className={`px-3 py-2 rounded-lg max-w-[90%] ${
                  msg.from === 'user'
                    ? 'bg-green-100 text-gray-900 ml-auto'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                {msg.text}
              </div>
            ))}
          </div>
          <div className="p-3 border-t border-gray-200 flex gap-2">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => (e.key === 'Enter' ? sendMessage() : null)}
              placeholder="Type your question..."
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm"
            />
            <button
              onClick={sendMessage}
              className="px-3 py-2 bg-green-600 text-white rounded-lg text-sm"
            >
              Send
            </button>
          </div>
        </div>
      )}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          onMouseDown={(e) => {
            draggingRef.current = true;
            dragOffsetRef.current = {
              x: window.innerWidth - e.clientX - position.x,
              y: e.clientY - position.y
            };
          }}
          className="w-12 h-12 rounded-full bg-green-600 text-white shadow-lg flex items-center justify-center text-xl"
          title="Chat with AgriSahayak"
        >
          💬
        </button>
      )}
    </div>
  );
}
