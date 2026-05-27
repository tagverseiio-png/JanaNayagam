import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Shield, CheckCircle, AlertTriangle, ArrowRight } from 'lucide-react';

/* ─── 38 Districts of Tamil Nadu ─────────────────────────────────────── */
const districts = [
  { name: "Chennai", tamil: "சென்னை" },
  { name: "Coimbatore", tamil: "கோயம்புத்தூர்" },
  { name: "Madurai", tamil: "மதுரை" },
  { name: "Salem", tamil: "சேலம்" },
  { name: "Trichy", tamil: "திருச்சி" },
  { name: "Vellore", tamil: "வேலூர்" },
  { name: "Tirunelveli", tamil: "திருநெல்வேலி" },
  { name: "Erode", tamil: "ஈரோடு" },
  { name: "Thanjavur", tamil: "தஞ்சாவூர்" },
  { name: "Dindigul", tamil: "திண்டுக்கல்" },
  { name: "Kancheepuram", tamil: "காஞ்சிபுரம்" },
  { name: "Tiruppur", tamil: "திருப்பூர்" },
  { name: "Thoothukudi", tamil: "தூத்துக்குடி" },
  { name: "Nagercoil", tamil: "நாகர்கோவில்" },
  { name: "Cuddalore", tamil: "கடலூர்" },
  { name: "Villupuram", tamil: "விழுப்புரம்" },
  { name: "Nagapattinam", tamil: "நாகப்பட்டினம்" },
  { name: "Dharmapuri", tamil: "தர்மபுரி" },
  { name: "Krishnagiri", tamil: "கிருஷ்ணகிரி" },
  { name: "Namakkal", tamil: "நாமக்கல்" },
  { name: "Karur", tamil: "கரூர்" },
  { name: "Pudukkottai", tamil: "புதுக்கோட்டை" },
  { name: "Sivaganga", tamil: "சிவகங்கை" },
  { name: "Virudhunagar", tamil: "விருதுநகர்" },
  { name: "Ramanathapuram", tamil: "ராமநாதபுரம்" },
  { name: "Theni", tamil: "தேனி" },
  { name: "Nilgiris", tamil: "நீலகிரி" },
  { name: "Perambalur", tamil: "பெரம்பலூர்" },
  { name: "Ariyalur", tamil: "அரியலூர்" },
  { name: "Tiruvarur", tamil: "திருவாரூர்" },
  { name: "Tiruvannamalai", tamil: "திருவண்ணாமலை" },
  { name: "Kallakurichi", tamil: "கள்ளக்குறிச்சி" },
  { name: "Ranipet", tamil: "ராணிப்பேட்டை" },
  { name: "Tenkasi", tamil: "தென்காசி" },
  { name: "Chengalpattu", tamil: "செங்கல்பட்டு" },
  { name: "Mayiladuthurai", tamil: "மயிலாடுதுறை" },
  { name: "Tirupattur", tamil: "திருப்பூர்" },
  { name: "Harur", tamil: "ஹாரூர்" }
];

/* ─── Available Roles in System ──────────────────────────────────────── */
const roles = [
  { id: 'citizen', name: 'Citizen', tamil: 'குடிமகன்' },
  { id: 'vao', name: 'VAO', tamil: 'கிராம நிர்வாக அலுவலர் (VAO)' },
  { id: 'ward_officer', name: 'Ward Officer', tamil: 'வார்டு அதிகாரி' },
  { id: 'bdo', name: 'BDO', tamil: 'வட்டார வளர்ச்சி அலுவலர் (BDO)' },
  { id: 'dro', name: 'DRO', tamil: 'வருவாய் கோட்டாட்சியர் (DRO)' },
  { id: 'collector', name: 'District Collector', tamil: 'மாவட்ட ஆட்சியர்' },
  { id: 'dept_secretary', name: 'Dept Secretary', tamil: 'துறைச் செயலாளர்' },
  { id: 'minister', name: 'Minister', tamil: 'அமைச்சர்' },
  { id: 'mla', name: 'MLA', tamil: 'சட்டமன்ற உறுப்பினர் (MLA)' },
  { id: 'cm', name: 'CM', tamil: 'முதலமைச்சர் (CM)' }
];

/* ─── Hardcoded Pincode Local Data ───────────────────────────────────── */
const pincodeData = {
  "600001": { district: "Chennai", area: ["Park Town", "Chennai GPO", "Fort St George"] },
  "600002": { district: "Chennai", area: ["Royapettah", "Greams Road"] },
  "600003": { district: "Chennai", area: ["Mylapore", "Mandaveli"] },
  "600004": { district: "Chennai", area: ["Nungambakkam", "Thousand Lights"] },
  "600005": { district: "Chennai", area: ["Egmore", "Kilpauk"] },
  "600006": { district: "Chennai", area: ["Chetpet", "Poonamallee High Road"] },
  "600010": { district: "Chennai", area: ["Saidapet", "Guindy"] },
  "600011": { district: "Chennai", area: ["Adyar", "Kotturpuram"] },
  "600014": { district: "Chennai", area: ["Alwarpet", "Teynampet"] },
  "600015": { district: "Chennai", area: ["Anna Nagar West"] },
  "600016": { district: "Chennai", area: ["Anna Nagar East"] },
  "600017": { district: "Chennai", area: ["Aminjikarai", "Shenoy Nagar"] },
  "600018": { district: "Chennai", area: ["Kodambakkam", "Vadapalani"] },
  "600020": { district: "Chennai", area: ["Perambur", "Kolathur"] },
  "600021": { district: "Chennai", area: ["Royapuram", "Tondiarpet"] },
  "600026": { district: "Chennai", area: ["Velachery", "Medavakkam"] },
  "600028": { district: "Chennai", area: ["Tambaram", "Chromepet"] },
  "600030": { district: "Chennai", area: ["Porur", "Valasaravakkam"] },
  "600033": { district: "Chennai", area: ["Ambattur", "Padi"] },
  "600040": { district: "Chennai", area: ["Sholinganallur", "Perungudi"] },
  "600042": { district: "Chennai", area: ["Pallavaram", "Pammal"] },
  "600045": { district: "Chennai", area: ["Madipakkam", "Nanganallur"] },
  "600050": { district: "Chennai", area: ["Villivakkam", "Ayanavaram"] },
  "600053": { district: "Chennai", area: ["Avadi", "Pattabiram"] },
  "600058": { district: "Chennai", area: ["Manali", "Madhavaram"] },
  "600060": { district: "Chennai", area: ["Thiruvottiyur"] },
  "600063": { district: "Chennai", area: ["Virugambakkam", "Ashok Nagar"] },
  "600073": { district: "Chennai", area: ["KK Nagar", "Arumbakkam"] },
  "600078": { district: "Chennai", area: ["Pallikaranai", "Kovilambakkam"] },
  "600091": { district: "Chennai", area: ["Sholinganallur IT Park", "OMR"] },
  "600096": { district: "Chennai", area: ["Thoraipakkam", "Karapakkam"] },
  "600100": { district: "Chennai", area: ["Injambakkam", "Akkarai"] },

  "641001": { district: "Coimbatore", area: ["Coimbatore Central", "Gandhipuram"] },
  "641002": { district: "Coimbatore", area: ["RS Puram", "Saibaba Colony"] },
  "641003": { district: "Coimbatore", area: ["Peelamedu", "Avinashi Road"] },
  "641004": { district: "Coimbatore", area: ["Singanallur", "Ramanathapuram"] },
  "641005": { district: "Coimbatore", area: ["Ukkadam", "Podanur"] },
  "641006": { district: "Coimbatore", area: ["Vadavalli", "Kalapatti"] },
  "641007": { district: "Coimbatore", area: ["Kuniyamuthur", "Kuniamuthur"] },
  "641008": { district: "Coimbatore", area: ["Sowripalayam", "Ganapathy"] },
  "641035": { district: "Coimbatore", area: ["Sulur", "Ettimadai"] },
  "641045": { district: "Coimbatore", area: ["Mettupalayam Road", "Selvapuram"] },

  "625001": { district: "Madurai", area: ["Madurai Central", "Tallakulam"] },
  "625002": { district: "Madurai", area: ["Anna Nagar Madurai", "KK Nagar Madurai"] },
  "625003": { district: "Madurai", area: ["Palanganatham", "Vilangudi"] },
  "625004": { district: "Madurai", area: ["Arasaradi", "Thiruppalai"] },
  "625005": { district: "Madurai", area: ["Anaiyur", "Surveyor Colony"] },
  "625006": { district: "Madurai", area: ["Goripalayam", "Nagamalai Pudukottai"] },
  "625007": { district: "Madurai", area: ["Simmakkal", "Teppakulam"] },
  "625009": { district: "Madurai", area: ["Sellur", "Kochadai"] },
  "625014": { district: "Madurai", area: ["Othakadai", "Thirumangalam"] },
  "625020": { district: "Madurai", area: ["Melur", "Usilampatti"] },

  "636001": { district: "Salem", area: ["Salem Main", "Shevapet"] },
  "636002": { district: "Salem", area: ["Suramangalam", "Hasthampatti"] },
  "636003": { district: "Salem", area: ["Ammapet", "Alagapuram"] },
  "636004": { district: "Salem", area: ["Fairlands", "Gugai"] },
  "636005": { district: "Salem", area: ["Kondalampatti", "Yercaud Road"] },
  "636007": { district: "Salem", area: ["Attur", "Vazhapadi"] },
  "636008": { district: "Salem", area: ["Omalur", "Mettur"] },

  "620001": { district: "Trichy", area: ["Trichy Main", "Palakkarai"] },
  "620002": { district: "Trichy", area: ["Woraiyur", "KK Nagar Trichy"] },
  "620003": { district: "Trichy", area: ["Ariyamangalam", "Thathanur"] },
  "620005": { district: "Trichy", area: ["Ponmalai", "Golden Rock"] },
  "620006": { district: "Trichy", area: ["Srirangam", "Thiruvanaikoil"] },
  "620017": { district: "Trichy", area: ["Manachanallur", "Samayapuram"] },
  "620018": { district: "Trichy", area: ["Thuvakudi", "Panjappur"] },
  "620021": { district: "Trichy", area: ["Thillai Nagar", "Crawford"] },

  "632001": { district: "Vellore", area: ["Vellore Main", "Sainathapuram"] },
  "632002": { district: "Vellore", area: ["Gandhi Nagar Vellore", "Kosapet"] },
  "632004": { district: "Vellore", area: ["Sathuvachari", "Bagayam"] },
  "632006": { district: "Vellore", area: ["Katpadi", "Virudhambut"] },
  "632007": { district: "Vellore", area: ["Gudiyatham", "Ambur"] },
  "632008": { district: "Vellore", area: ["Vaniyambadi", "Jolarpet"] },

  "627001": { district: "Tirunelveli", area: ["Tirunelveli Main", "Palayamkottai"] },
  "627002": { district: "Tirunelveli", area: ["Melapalayam", "Vannarpet"] },
  "627003": { district: "Tirunelveli", area: ["Pettai", "Manakadu"] },
  "627005": { district: "Tirunelveli", area: ["Krishnapuram", "Rajagopalapuram"] },
  "627007": { district: "Tirunelveli", area: ["Ambasamudram", "Cheranmahadevi"] },
  "627011": { district: "Tirunelveli", area: ["Tenkasi", "Sankarankovil"] },

  "613001": { district: "Thanjavur", area: ["Thanjavur Main", "Medical College Road"] },
  "613002": { district: "Thanjavur", area: ["Kumbakonam", "Papanasam"] },
  "613003": { district: "Thanjavur", area: ["Vallam", "Budalur"] },
  "613005": { district: "Thanjavur", area: ["Pattukottai", "Aranthangi"] },

  "638001": { district: "Erode", area: ["Erode Main", "Veerappanchatiram"] },
  "638002": { district: "Erode", area: ["Surampatti", "Arisipalayam"] },
  "638003": { district: "Erode", area: ["Chithode", "Modakurichi"] },
  "638004": { district: "Erode", area: ["Bhavani", "Gobichettipalayam"] },
  "638005": { district: "Erode", area: ["Perundurai", "Kangayam"] },

  "641601": { district: "Tiruppur", area: ["Tiruppur Main", "Velampalayam"] },
  "641602": { district: "Tiruppur", area: ["Anupparpalayam", "Rayapuram"] },
  "641603": { district: "Tiruppur", area: ["Avinashi", "Uthukuli"] },
  "641604": { district: "Tiruppur", area: ["Palladam", "Kangayam Road"] },

  "630001": { district: "Sivaganga", area: ["Sivaganga Main", "Manamadurai"] },
  "630002": { district: "Sivaganga", area: ["Karaikudi", "Devakottai"] },

  "623001": { district: "Ramanathapuram", area: ["Ramanathapuram Main", "Rameswaram"] },
  "623002": { district: "Ramanathapuram", area: ["Paramakudi", "Mudukulathur"] },

  "625531": { district: "Theni", area: ["Theni Main", "Periyakulam"] },
  "625532": { district: "Theni", area: ["Uthamapalayam", "Bodinayakanur"] },

  "643001": { district: "Nilgiris", area: ["Ooty", "Udhagamandalam"] },
  "643002": { district: "Nilgiris", area: ["Coonoor", "Wellington"] },
  "643003": { district: "Nilgiris", area: ["Kotagiri", "Gudalur"] },

  "621212": { district: "Perambalur", area: ["Perambalur Main", "Ariyalur"] },

  "614001": { district: "Nagapattinam", area: ["Nagapattinam Main", "Velankanni"] },
  "614002": { district: "Nagapattinam", area: ["Mayiladuthurai", "Sirkazhi"] },

  "629001": { district: "Kanyakumari", area: ["Nagercoil Main", "Marthandam"] },
  "629002": { district: "Kanyakumari", area: ["Thuckalay", "Colachel"] },
  "629003": { district: "Kanyakumari", area: ["Padmanabhapuram", "Kanyakumari Town"] },

  "628001": { district: "Thoothukudi", area: ["Thoothukudi Main", "Harbour"] },
  "628002": { district: "Thoothukudi", area: ["Tiruchendur", "Srivaikundam"] },
  "628003": { district: "Thoothukudi", area: ["Kovilpatti", "Vilathikulam"] },

  "626001": { district: "Virudhunagar", area: ["Virudhunagar Main", "Sivakasi"] },
  "626002": { district: "Virudhunagar", area: ["Rajapalayam", "Srivilliputhur"] },

  "622001": { district: "Pudukkottai", area: ["Pudukkottai Main", "Aranthangi"] },
  "622002": { district: "Pudukkottai", area: ["Karambakudi", "Gandarvakottai"] },

  "631001": { district: "Kancheepuram", area: ["Kancheepuram Main", "Uthiramerur"] },
  "631002": { district: "Kancheepuram", area: ["Chengalpattu", "Madurantakam"] },
  "631003": { district: "Kancheepuram", area: ["Tambaram West", "Vandalur"] },

  "604001": { district: "Villupuram", area: ["Villupuram Main", "Tindivanam"] },
  "604002": { district: "Villupuram", area: ["Gingee", "Kallakurichi"] },

  "606001": { district: "Cuddalore", area: ["Cuddalore Main", "Panruti"] },
  "606002": { district: "Cuddalore", area: ["Chidambaram", "Kattumannarkoil"] },

  "635001": { district: "Krishnagiri", area: ["Krishnagiri Main", "Hosur"] },
  "635002": { district: "Krishnagiri", area: ["Denkanikottai", "Uthangarai"] },

  "636701": { district: "Dharmapuri", area: ["Dharmapuri Main", "Palacode"] },
  "636702": { district: "Dharmapuri", area: ["Harur", "Pennagaram"] },

  "637001": { district: "Namakkal", area: ["Namakkal Main", "Rasipuram"] },
  "637002": { district: "Namakkal", area: ["Tiruchengode", "Komarapalayam"] },

  "639001": { district: "Karur", area: ["Karur Main", "Kulithalai"] },
  "639002": { district: "Karur", area: ["Manapparai", "Aravakurichi"] },

  "612001": { district: "Nagapattinam", area: ["Mayiladuthurai Main", "Tharangambadi"] },

  "632301": { district: "Ranipet", area: ["Ranipet Main", "Arcot"] },
  "632302": { district: "Ranipet", area: ["Walajah", "Arakkonam"] },

  "635601": { district: "Tirupattur", area: ["Tirupattur Main", "Vaniyambadi"] },
  "635602": { district: "Tirupattur", area: ["Jolarpet", "Natrampalli"] },

  "603001": { district: "Chengalpattu", area: ["Chengalpattu Main", "Thiruporur"] },
  "603002": { district: "Chengalpattu", area: ["Maraimalai Nagar", "Vandalur"] },

  "607001": { district: "Kallakurichi", area: ["Kallakurichi Main", "Ulundurpet"] },

  "627801": { district: "Tenkasi", area: ["Tenkasi Main", "Courtallam"] },
  "627802": { district: "Tenkasi", area: ["Shenkottai", "Kadayanallur"] },
};

function lookupPincode(pincode) {
  const result = pincodeData[pincode];
  if (result) {
    return { found: true, district: result.district, areas: result.area };
  }
  return { found: false };
}

/* ─── Hardcoded Wards Mapping by District ────────────────────────────── */
const wardsByDistrict = {
  "Chennai": [
    "Ward 1 - Thiruvottiyur", "Ward 2 - Manali", "Ward 3 - Madhavaram",
    "Ward 4 - Tondiarpet", "Ward 5 - Royapuram", "Ward 6 - Harbour",
    "Ward 7 - Basin Bridge", "Ward 8 - Perambur", "Ward 9 - Kolathur",
    "Ward 10 - Villivakkam", "Ward 11 - Ambattur", "Ward 12 - Annanagar",
    "Ward 13 - Teynampet", "Ward 14 - Egmore", "Ward 15 - Park Town",
    "Ward 16 - Thousand Lights", "Ward 17 - Anna Nagar", "Ward 18 - Valasaravakkam",
    "Ward 19 - Kodambakkam", "Ward 20 - Alandur", "Ward 21 - Adyar",
    "Ward 22 - Velachery", "Ward 23 - Sholinganallur", "Ward 24 - Perungudi",
    "Ward 25 - Madipakkam", "Ward 26 - Guindy", "Ward 27 - Saidapet",
    "Ward 28 - Mylapore", "Ward 29 - Royapettah", "Ward 30 - Nungambakkam"
  ],
  "Coimbatore": [
    "Ward 1 - Ukkadam", "Ward 2 - Singanallur", "Ward 3 - Peelamedu",
    "Ward 4 - RS Puram", "Ward 5 - Gandhipuram", "Ward 6 - Saibaba Colony",
    "Ward 7 - Vadavalli", "Ward 8 - Kuniyamuthur", "Ward 9 - Kavundampalayam",
    "Ward 10 - Thondamuthur"
  ],
  "Madurai": [
    "Ward 1 - Tallakulam", "Ward 2 - Anna Nagar", "Ward 3 - KK Nagar",
    "Ward 4 - Palanganatham", "Ward 5 - Vilangudi", "Ward 6 - Arasaradi",
    "Ward 7 - Thiruppalai", "Ward 8 - Anaiyur", "Ward 9 - Tavithanpatti",
    "Ward 10 - Goripalayam"
  ],
  "Salem": [
    "Ward 1 - Shevapet", "Ward 2 - Suramangalam", "Ward 3 - Hasthampatti",
    "Ward 4 - Kondalampatti", "Ward 5 - Ammapet", "Ward 6 - Alagapuram",
    "Ward 7 - Fairlands", "Ward 8 - Gugai"
  ],
  "Trichy": [
    "Ward 1 - Ariyamangalam", "Ward 2 - Manachanallur", "Ward 3 - Srirangam",
    "Ward 4 - Golden Rock", "Ward 5 - Palakkarai", "Ward 6 - Woraiyur",
    "Ward 7 - KK Nagar", "Ward 8 - Ponmalai"
  ],
  "Vellore": [
    "Ward 1 - Sainathapuram", "Ward 2 - Gandhi Nagar", "Ward 3 - Kosapet",
    "Ward 4 - Bagayam", "Ward 5 - Sathuvachari", "Ward 6 - Alamelumangapuram"
  ],
  "Tirunelveli": [
    "Ward 1 - Melapalayam", "Ward 2 - Palayamkottai", "Ward 3 - Vannarpet",
    "Ward 4 - Manakadu", "Ward 5 - Pettai", "Ward 6 - Krishnapuram"
  ],
  "Thanjavur": [
    "Ward 1 - Medical College Road", "Ward 2 - South Rampart",
    "Ward 3 - Vallam Road", "Ward 4 - Kumbakonam Road", "Ward 5 - Nanjikottai"
  ],
  "Erode": [
    "Ward 1 - Veerappanchatiram", "Ward 2 - Surampatti",
    "Ward 3 - Arisipalayam", "Ward 4 - Chithode", "Ward 5 - Modakurichi"
  ],
  "Tiruppur": [
    "Ward 1 - Velampalayam", "Ward 2 - Anupparpalayam",
    "Ward 3 - Avinashi Road", "Ward 4 - Muthur", "Ward 5 - Rayapuram"
  ]
};

/* ─── District Centroid Coordinates for Stamping ──────────────────────── */
const districtCoords = {
  "Chennai": { lat: 13.0827, lng: 80.2707 },
  "Coimbatore": { lat: 11.0168, lng: 76.9558 },
  "Madurai": { lat: 9.9252, lng: 78.1198 },
  "Salem": { lat: 11.6643, lng: 78.1460 },
  "Trichy": { lat: 10.7905, lng: 78.7047 },
  "Vellore": { lat: 12.9165, lng: 79.1325 },
  "Tirunelveli": { lat: 8.7139, lng: 77.7567 },
  "Erode": { lat: 11.3410, lng: 77.7172 },
  "Thanjavur": { lat: 10.7870, lng: 79.1378 },
  "Tiruppur": { lat: 11.1085, lng: 77.3411 }
};
const defaultCoords = { lat: 10.8505, lng: 78.6677 };

export default function LoginPage() {
  const { i18n } = useTranslation();
  const navigate = useNavigate();

  const [rawAadhaar, setRawAadhaar] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);

  // Form selections
  const [district, setDistrict] = useState('Chennai');
  const [selectedRole, setSelectedRole] = useState('citizen');

  // Pincode Auto-Suggest Ward flow states
  const [pincode, setPincode] = useState('');
  const [pincodeLoading, setPincodeLoading] = useState(false);
  const [pincodeStatus, setPincodeStatus] = useState('idle'); // 'idle' | 'success' | 'error'
  const [apiDistrictInfo, setApiDistrictInfo] = useState('');
  const [areas, setAreas] = useState([]);
  const [selectedArea, setSelectedArea] = useState('');
  const [isDistrictLocked, setIsDistrictLocked] = useState(true);
  const [selectedWard, setSelectedWard] = useState('');

  const isTa = i18n.language === 'ta';
  const tLabel = (en, ta) => isTa ? ta : en;

  // Masking implementation for Aadhaar: mask first 8 digits with '•'
  const handleAadhaarChange = (e) => {
    const inputVal = e.target.value.replace(/\s/g, ''); // Remove spaces
    let newRaw = '';
    let digitIndex = 0;

    for (let i = 0; i < inputVal.length; i++) {
      if (inputVal[i] === '•' || inputVal[i] === '●') {
        newRaw += rawAadhaar[digitIndex] || '';
        digitIndex++;
      } else if (/\D/.test(inputVal[i])) {
        // Ignore non-digits
      } else {
        newRaw += inputVal[i];
        digitIndex++;
      }
    }

    if (newRaw.length <= 12) {
      setRawAadhaar(newRaw);
    }
  };

  const getDisplayAadhaar = () => {
    let display = '';
    for (let i = 0; i < rawAadhaar.length; i++) {
      if (i < 8) {
        display += '•';
      } else {
        display += rawAadhaar[i];
      }
      if ((i === 3 || i === 7) && i < rawAadhaar.length - 1) {
        display += ' ';
      }
    }
    return display;
  };

  const handleSendOTP = () => {
    if (rawAadhaar.length !== 12) {
      toast.error(tLabel('Please enter a valid 12-digit Aadhaar Number', 'தயவுசெய்து செல்லுபடியாகும் 12-இலக்க ஆதார் எண்ணை உள்ளிடவும்'));
      return;
    }
    setOtpSent(true);
    toast.success(tLabel('Mock OTP sent successfully! (Use any 6 digits)', 'மாதிரி OTP வெற்றிகரமாக அனுப்பப்பட்டது! (ஏதேனும் 6 இலக்கங்களைப் பயன்படுத்தவும்)'));
  };

  const handleVerifyOTP = () => {
    if (otp.length !== 6) {
      toast.error(tLabel('Please enter the 6-digit OTP', 'தயவுசெய்து 6-இலக்க OTP-ஐ உள்ளிடவும்'));
      return;
    }
    setOtpVerified(true);
    toast.success(tLabel('Aadhaar eKYC Verified Successfully!', 'ஆதார் இ-கேஒய்சி வெற்றிகரமாக சரிபார்க்கப்பட்டது!'));
  };

  const fetchPincodeDetails = async (pin) => {
    setPincodeLoading(true);
    setPincodeStatus('idle');
    
    // Simulate a brief loading delay to showcase premium UX spinner
    await new Promise(resolve => setTimeout(resolve, 450));

    const result = lookupPincode(pin);
    if (result.found) {
      setAreas(result.areas);
      setPincodeStatus('success');
      setDistrict(result.district);
      setApiDistrictInfo(`${result.district}, Tamil Nadu`);
      setIsDistrictLocked(true);
      toast.success(tLabel("Pincode located!", "பின்கோடு கண்டறியப்பட்டது!"));
    } else {
      setPincodeStatus('error');
      setAreas([]);
      toast.error(tLabel("Pincode not found. Please check and try again.", "பின்கோடு கிடைக்கவில்லை. சரிபார்க்கவும்."));
    }
    setPincodeLoading(false);
  };

  const handlePincodeChange = async (e) => {
    const value = e.target.value.replace(/\D/g, '');
    if (value.length <= 6) {
      setPincode(value);
      setPincodeStatus('idle');
      
      if (value.length === 6) {
        // Auto-blur input
        e.target.blur();
        // Trigger lookup
        await fetchPincodeDetails(value);
      } else {
        // Clear dependent fields if pincode is not 6 digits
        setAreas([]);
        setSelectedArea('');
        setSelectedWard('');
      }
    }
  };

  const getDistrictWards = () => {
    const list = wardsByDistrict[district];
    if (list && list.length > 0) {
      return list;
    }
    // Generic fallback
    const fallback = [];
    for (let i = 1; i <= 20; i++) {
      fallback.push(`Ward ${i}`);
    }
    return fallback;
  };

  const handleLogin = (e) => {
    e.preventDefault();

    if (!otpVerified) {
      toast.error(tLabel('Please complete Aadhaar OTP verification first', 'தயவுசெய்து முதலில் ஆதார் OTP சரிபார்ப்பை பூர்த்தி செய்யவும்'));
      return;
    }

    if (pincode.length !== 6 || pincodeStatus !== 'success') {
      toast.error(tLabel('Please enter a valid 6-digit Pincode and complete lookup', 'தயவுசெய்து செல்லுபடியாகும் 6-இலக்க பின்கோடை உள்ளிட்டு சரிபார்ப்பை பூர்த்தி செய்யவும்'));
      return;
    }

    if (!selectedArea) {
      toast.error(tLabel('Please select your Area / Locality', 'தயவுசெய்து உங்கள் பகுதி / வட்டாரத்தைத் தேர்ந்தெடுக்கவும்'));
      return;
    }

    if (!selectedWard) {
      toast.error(tLabel('Please select your Ward', 'தயவுசெய்து உங்கள் வார்டைத் தேர்ந்தெடுக்கவும்'));
      return;
    }

    // Extract ward number from selectedWard (e.g. "Ward 22 - Velachery" -> "22", or "Ward 1" -> "1")
    let wardNumber = '142';
    const match = selectedWard.match(/Ward\s+(\d+)/i);
    if (match) {
      wardNumber = match[1];
    }

    // Lookup coordinates by district center
    const coords = districtCoords[district] || defaultCoords;

    // Generate random session UUID
    const uuid = 'jn-' + Math.random().toString(36).substr(2, 9) + '-' + Math.random().toString(36).substr(2, 5);

    // Save mock flow values to localStorage
    localStorage.setItem('jn_role', selectedRole);
    localStorage.setItem('jn_name', 'KARTHIK RAJ S.');
    localStorage.setItem('jn_ward', wardNumber);
    localStorage.setItem('jn_district', district);
    localStorage.setItem('jn_user_id', uuid);

    // Save Pincode details
    localStorage.setItem('jn_pincode', pincode);
    localStorage.setItem('jn_area', selectedArea);
    localStorage.setItem('jn_ward_name', selectedWard);
    localStorage.setItem('jn_ward_number', wardNumber);
    localStorage.setItem('jn_living_lat', coords.lat.toString());
    localStorage.setItem('jn_living_lng', coords.lng.toString());

    if (selectedRole === 'citizen') {
      if (!localStorage.getItem('jn_aadhaar_address')) {
        localStorage.setItem('jn_aadhaar_address', "123, Gandhi Nagar, Madurai - 625001");
        localStorage.setItem('jn_aadhaar_district', "Madurai");
        localStorage.setItem('jn_aadhaar_ward', "Ward 45");
      }
      
      // Auto-set the Living Address since they chose it on login!
      const completeAddress = `${selectedArea}, ${district}, Tamil Nadu - ${pincode}`;
      localStorage.setItem('jn_living_address', completeAddress);
      localStorage.setItem('jn_living_district', district);
      localStorage.setItem('jn_living_ward', `Ward ${wardNumber}`);
      localStorage.setItem('jn_living_lat', coords.lat.toString());
      localStorage.setItem('jn_living_lng', coords.lng.toString());
      
      const today = new Date();
      const nextDate = new Date();
      nextDate.setDate(today.getDate() + 90);
      localStorage.setItem('jn_location_last_updated', today.toISOString());
      localStorage.setItem('jn_location_next_update', nextDate.toISOString());
    }

    toast.success(tLabel(
      `Identity Verified: Welcome ${selectedRole.toUpperCase()}`,
      `அடையாளம் சரிபார்க்கப்பட்டது: நல்வரவு ${selectedRole.toUpperCase()}`
    ));

    // Redirect to proper role portal path
    const formattedRole = selectedRole.replace('_', '-');
    navigate(`/${formattedRole}`);
  };

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'ta' : 'en';
    i18n.changeLanguage(newLang);
    toast.success(newLang === 'en' ? 'Switched to English' : 'தமிழுக்கு மாற்றப்பட்டது');
  };

  return (
    <div style={{ backgroundColor: '#F0EBE3' }} className="min-h-screen flex flex-col justify-between font-sans selection:bg-[#8B1A1A]/10 selection:text-[#8B1A1A]">
      {/* Top Government Color Bar */}
      <div className="h-1.5 w-full flex shrink-0">
        <div className="flex-1 bg-[#FF6600]"></div>
        <div className="flex-1 bg-white"></div>
        <div className="flex-1 bg-[#138808]"></div>
      </div>

      {/* Header with Bilingual Toggle */}
      <header className="px-6 py-4 flex justify-between items-center max-w-7xl w-full mx-auto shrink-0">
        <div className="flex items-center gap-2 select-none">
          <Shield className="w-5 h-5 text-[#8B1A1A]" />
          <span className="text-xs font-black text-[#8B1A1A] tracking-wider uppercase">JanaNayagam</span>
        </div>
        <button
          onClick={toggleLanguage}
          className="text-xs font-extrabold px-3 py-1.5 rounded-lg border border-[#8B1A1A]/20 bg-white hover:bg-slate-50 text-[#8B1A1A] shadow-sm transition-all"
        >
          {i18n.language === 'en' ? 'தமிழ்' : 'English'}
        </button>
      </header>

      {/* Main Centered Container */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-8">
        
        {/* TOP SECTION (Centred) */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-[60px] h-[60px] bg-white rounded-full flex items-center justify-center shadow-[0_4px_12px_rgba(0,0,0,0.04)] border border-slate-100 mb-4 select-none">
            <Shield className="w-[30px] h-[30px] text-[#8B1A1A]" />
          </div>
          <h1 className="text-[28px] font-black tracking-widest leading-none text-[#8B1A1A]" style={{ letterSpacing: '0.12em' }}>
            {tLabel('JANANAYAGAM', 'ஜனநாயகம்')}
          </h1>
          <p className="text-[11px] font-extrabold text-slate-400 tracking-widest mt-2 uppercase" style={{ letterSpacing: '0.1em' }}>
            {tLabel('TAMIL NADU CIVIC COMMAND CENTER', 'தமிழ்நாடு குடிமை கட்டளை மையம்')}
          </p>
        </div>

        {/* LOGIN CARD */}
        <div className="w-full max-w-md bg-white rounded-[20px] p-[28px] shadow-[0_8px_30px_rgba(0,0,0,0.03)] border border-slate-100/80">
          
          <form onSubmit={handleLogin} className="space-y-5">
            
            {/* STEP 1 — Aadhaar Verification Row */}
            <div className="space-y-3.5">
              
              {/* Govt Link Pill Indicator */}
              <div className="w-full bg-[#FFF0F0] text-[#8B1A1A] rounded-full py-2.5 px-4 flex items-center justify-center gap-2 select-none border border-[#FFD8D8]">
                <Shield className="w-4 h-4 text-[#8B1A1A] fill-[#8B1A1A]/10" />
                <span className="font-extrabold text-[13px] tracking-wider">
                  {tLabel('GOVT KYC LINKING', 'அரசு கேஒய்சி இணைப்பு')}
                </span>
              </div>

              {/* Aadhaar Input Field */}
              <div className="space-y-1">
                <label className="text-[11px] font-extrabold text-slate-400 tracking-wider uppercase block" style={{ letterSpacing: '0.08em' }}>
                  {tLabel('AADHAAR NUMBER', 'ஆதார் எண்')}
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      disabled={otpSent}
                      value={getDisplayAadhaar()}
                      onChange={handleAadhaarChange}
                      placeholder="•••• •••• ••••"
                      className="w-full bg-slate-50 disabled:opacity-80 disabled:bg-slate-50/50 border border-slate-200 outline-none px-4 py-3 rounded-xl text-slate-700 font-extrabold text-sm shadow-sm tracking-widest placeholder-slate-400 placeholder:tracking-normal focus:border-[#8B1A1A] transition-all"
                    />
                    {rawAadhaar.length === 12 && !otpSent && (
                      <div className="absolute right-4 top-3">
                        <CheckCircle className="w-5 h-5 text-slate-300" />
                      </div>
                    )}
                    {otpVerified && (
                      <div className="absolute right-4 top-3">
                        <CheckCircle className="w-5 h-5 text-[#4CAF50] fill-[#4CAF50]/10" />
                      </div>
                    )}
                  </div>
                  
                  {!otpSent && (
                    <button
                      type="button"
                      onClick={handleSendOTP}
                      className="px-4 bg-[#8B1A1A] hover:opacity-90 text-white font-extrabold text-xs rounded-xl shadow-sm transition-all"
                    >
                      {tLabel('Send OTP', 'அனுப்பு')}
                    </button>
                  )}
                </div>
              </div>

              {/* OTP Field (Only show after Send OTP clicked and not verified) */}
              {otpSent && !otpVerified && (
                <motion.div 
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-1"
                >
                  <label className="text-[11px] font-extrabold text-slate-400 tracking-wider uppercase block" style={{ letterSpacing: '0.08em' }}>
                    {tLabel('ENTER 6-DIGIT OTP', 'ஒடிபி (OTP) உள்ளிடவும்')}
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      maxLength={6}
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                      placeholder="e.g. 123456"
                      className="flex-1 bg-slate-50 border border-slate-200 focus:border-[#8B1A1A] outline-none px-4 py-3 rounded-xl text-slate-700 font-extrabold text-sm shadow-sm tracking-widest placeholder-slate-400 placeholder:tracking-normal transition-all"
                    />
                    <button
                      type="button"
                      onClick={handleVerifyOTP}
                      className="px-4 bg-[#8B1A1A] hover:opacity-90 text-white font-extrabold text-xs rounded-xl shadow-sm transition-all"
                    >
                      {tLabel('Verify OTP', 'சரிபார்')}
                    </button>
                  </div>
                </motion.div>
              )}
            </div>

            {/* STEP 2, 3, 4 & Submit Button (Only show after Aadhaar OTP verified) */}
            <AnimatePresence>
              {otpVerified && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="space-y-4 overflow-hidden pt-1"
                >
                  {/* STEP 2 — Aadhaar Verified Name */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-extrabold text-slate-400 tracking-wider uppercase block" style={{ letterSpacing: '0.08em' }}>
                      {tLabel('AADHAAR VERIFIED NAME', 'சரிபார்க்கப்பட்ட பெயர் (ஆதார்)')}
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value="KARTHIK RAJ S."
                        readOnly
                        className="w-full bg-slate-50/80 border border-slate-200 outline-none px-4 py-3 rounded-xl text-slate-800 font-extrabold text-sm shadow-sm tracking-wide select-none"
                      />
                      <div className="absolute right-4 top-3">
                        <CheckCircle className="w-5 h-5 text-[#4CAF50] fill-[#4CAF50]/10" />
                      </div>
                    </div>
                    
                    {/* Govt Locked warning */}
                    <div className="flex items-center gap-1.5 text-[11px] text-[#FF9800] font-bold mt-1.5 select-none">
                      <AlertTriangle className="w-3.5 h-3.5 text-[#FF9800] shrink-0" />
                      <span>{tLabel('Name is locked to Official Govt Database.', 'பெயர் அரசு அதிகாரப்பூர்வ தரவுத்தளத்துடன் இணைக்கப்பட்டுள்ளது.')}</span>
                    </div>
                  </div>

                  {/* STEP 3 — Location Fields (Pincode Suggestion Flow) */}
                  
                  {/* PINCODE input */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-extrabold text-slate-400 tracking-wider uppercase block" style={{ letterSpacing: '0.08em' }}>
                      {tLabel('PINCODE', 'பின்கோடு')}
                    </label>
                    
                    <div className="relative">
                      <input
                        type="text"
                        maxLength={6}
                        inputMode="numeric"
                        value={pincode}
                        onChange={handlePincodeChange}
                        placeholder="e.g. 600001"
                        style={{ height: '52px' }}
                        className="w-full bg-white border border-slate-200 focus:border-[#8B1A1A] outline-none px-4 py-3 rounded-xl text-slate-700 font-extrabold text-sm shadow-sm tracking-widest placeholder-slate-400 placeholder:tracking-normal transition-all"
                      />
                      {pincodeLoading && (
                        <div className="absolute right-4 top-4">
                          <svg className="animate-spin h-4 w-4 text-[#8B1A1A]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        </div>
                      )}
                      {pincodeStatus === 'success' && !pincodeLoading && (
                        <div className="absolute right-4 top-4">
                          <CheckCircle className="w-5 h-5 text-[#4CAF50] fill-[#4CAF50]/10" />
                        </div>
                      )}
                      {pincodeStatus === 'error' && !pincodeLoading && (
                        <div className="absolute right-4 top-4">
                          <AlertTriangle className="w-5 h-5 text-[#F44336]" />
                        </div>
                      )}
                    </div>

                    {/* Success / Error labels */}
                    {pincodeStatus === 'success' && apiDistrictInfo && (
                      <div className="text-[12px] font-black text-emerald-600 pl-1 animate-in fade-in slide-in-from-top-1">
                        ✓ {apiDistrictInfo}
                      </div>
                    )}
                    {pincodeStatus === 'error' && (
                      <div className="text-[12px] font-black text-[#F44336] pl-1 animate-in fade-in slide-in-from-top-1">
                        {tLabel("Pincode not found. Please check and try again.", "பின்கோடு கிடைக்கவில்லை. சரிபார்க்கவும்.")}
                      </div>
                    )}

                    {/* Info Box */}
                    <div className="bg-[#E3F2FD] border border-[#BBDEFB] rounded-lg p-2.5 flex items-start gap-2 select-none">
                      <AlertTriangle className="w-4.5 h-4.5 text-[#1976D2] shrink-0 mt-0.5" />
                      <p className="text-[11px] font-bold text-[#1976D2] leading-normal">
                        {tLabel(
                          "Enter your home pincode — not your office or workplace pincode.",
                          "உங்கள் வீட்டு பின்கோடை உள்ளிடவும் — அலுவலக பின்கோடு அல்ல."
                        )}
                      </p>
                    </div>
                  </div>

                  {/* AREA / LOCALITY dropdown */}
                  {pincodeStatus === 'success' && areas.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-1.5"
                    >
                      <label className="text-[11px] font-extrabold text-slate-400 tracking-wider uppercase block" style={{ letterSpacing: '0.08em' }}>
                        {tLabel('AREA / LOCALITY', 'பகுதி / வட்டாரம்')}
                      </label>
                      <select
                        required
                        value={selectedArea}
                        onChange={(e) => setSelectedArea(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 outline-none px-4 py-3 rounded-xl text-slate-700 font-extrabold text-sm shadow-sm cursor-pointer focus:border-[#8B1A1A] transition-all"
                      >
                        <option value="">{tLabel("Select your area", "உங்கள் பகுதியைத் தேர்ந்தெடுக்கவும்")}</option>
                        {areas.map(area => (
                          <option key={area} value={area}>{area}</option>
                        ))}
                      </select>
                    </motion.div>
                  )}

                  {/* DISTRICT field */}
                  {pincodeStatus === 'success' && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-1.5"
                    >
                      <label className="text-[11px] font-extrabold text-slate-400 tracking-wider uppercase block" style={{ letterSpacing: '0.08em' }}>
                        {tLabel('DISTRICT', 'மாவட்டம்')}
                      </label>
                      <div className="relative">
                        {isDistrictLocked ? (
                          <>
                            <input
                              type="text"
                              readOnly
                              value={district}
                              className="w-full bg-slate-50/80 border border-slate-200 outline-none px-4 py-3 rounded-xl text-slate-500 font-extrabold text-sm shadow-sm select-none"
                            />
                            <button
                              type="button"
                              onClick={() => setIsDistrictLocked(false)}
                              className="absolute right-4 top-3 text-slate-400 hover:text-slate-600 transition-colors p-1 cursor-pointer"
                              title={tLabel("Unlock and edit district", "மாவட்டத்தைத் திருத்தத் திறக்கவும்")}
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-slate-400"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                            </button>
                          </>
                        ) : (
                          <select
                            value={district}
                            onChange={(e) => setDistrict(e.target.value)}
                            className="w-full bg-white border border-[#8B1A1A] outline-none px-4 py-3 rounded-xl text-slate-700 font-extrabold text-sm shadow-sm cursor-pointer transition-all"
                          >
                            {districts.map(d => (
                              <option key={d.name} value={d.name}>
                                {isTa ? d.tamil : d.name}
                              </option>
                            ))}
                          </select>
                        )}
                      </div>
                    </motion.div>
                  )}

                  {/* YOUR WARD dropdown */}
                  {pincodeStatus === 'success' && selectedArea && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-1.5"
                    >
                      <label className="text-[11px] font-extrabold text-slate-400 tracking-wider uppercase block" style={{ letterSpacing: '0.08em' }}>
                        {tLabel('YOUR WARD', 'உங்கள் வார்டு')}
                      </label>
                      <select
                        required
                        value={selectedWard}
                        onChange={(e) => setSelectedWard(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 outline-none px-4 py-3 rounded-xl text-slate-700 font-extrabold text-sm shadow-sm cursor-pointer focus:border-[#8B1A1A] transition-all"
                      >
                        <option value="">{tLabel("Select your ward", "உங்கள் வார்டைத் தேர்ந்தெடுக்கவும்")}</option>
                        {getDistrictWards().map(wardName => (
                          <option key={wardName} value={wardName}>{wardName}</option>
                        ))}
                      </select>
                    </motion.div>
                  )}

                  {/* STEP 4 — Role Selector (Full Width Dropdown) */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-extrabold text-slate-400 tracking-wider uppercase block" style={{ letterSpacing: '0.08em' }}>
                      {tLabel('SELECT YOUR ROLE', 'பங்கினைத் தேர்ந்தெடுக்கவும்')}
                    </label>
                    <select
                      value={selectedRole}
                      onChange={(e) => setSelectedRole(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 outline-none px-4 py-3.5 rounded-xl text-slate-700 font-extrabold text-sm shadow-sm cursor-pointer focus:border-[#8B1A1A] transition-all appearance-none"
                      style={{
                        backgroundImage: 'url("data:image/svg+xml;charset=UTF-8,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%2364748b\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3E%3Cpolyline points=\'6 9 12 15 18 9\'%3E%3C/polyline%3E%3C/svg%3E")',
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: 'right 16px center',
                        backgroundSize: '16px'
                      }}
                    >
                      {roles.map((r) => (
                        <option key={r.id} value={r.id}>
                          {isTa ? r.tamil : r.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    style={{ height: '52px', backgroundColor: '#8B1A1A' }}
                    className="w-full text-white font-extrabold text-sm rounded-xl shadow-[0_4px_12px_rgba(139,26,26,0.15)] hover:opacity-95 transition-all duration-300 flex items-center justify-center gap-2 mt-4"
                  >
                    <span>{tLabel('Enter Command Center', 'கட்டளை மையத்திற்குள் நுழையவும்')}</span>
                    <ArrowRight className="w-4 h-4 text-white/90" />
                  </button>

                </motion.div>
              )}
            </AnimatePresence>
          </form>
        </div>

        {/* BOTTOM SECURED NOTE */}
        <p className="text-center text-[11px] text-slate-400 font-bold tracking-wide mt-2 select-none">
          {tLabel(
            'Secured by Aadhaar eKYC · Tamil Nadu Government',
            'ஆதார் இ-கேஒய்சி மூலம் பாதுகாக்கப்பட்டது · தமிழ்நாடு அரசு'
          )}
        </p>
      </main>

      {/* Footer bar */}
      <footer className="text-center py-4 text-[10px] text-slate-400 font-bold shrink-0 border-t border-slate-300/30">
        <p>© 2026 Tamil Nadu e-Governance Agency (TNeGA). All rights reserved.</p>
      </footer>
    </div>
  );
}
