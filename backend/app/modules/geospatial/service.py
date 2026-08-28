from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List, Dict, Any, Optional
from app.modules.property.models import PropertyModel, LocalityModel, GovernmentProjectModel
from app.core.india_data import ALL_INDIA_LOCALITIES, STATE_STAMP_DUTY

# Authentic Real-World POI Datasets for ALL Major Indian Metropolitan Cities & Corridors
CITY_GENUINE_POIS: Dict[str, List[Dict[str, Any]]] = {
    "Nagpur": [
        {"name": "AIIMS Nagpur Super Speciality (Wardha Rd)", "type": "hospital", "lat": 20.9850, "lng": 79.0320, "city": "Nagpur"},
        {"name": "Orange City Hospital & Research Institute", "type": "hospital", "lat": 21.1150, "lng": 79.0680, "city": "Nagpur"},
        {"name": "Revati Hospital & Trauma Care Besa", "type": "hospital", "lat": 21.0825, "lng": 79.0840, "city": "Nagpur"},
        {"name": "Podar International School Besa", "type": "school", "lat": 21.0830, "lng": 79.0820, "city": "Nagpur"},
        {"name": "Delhi Public School (DPS) MIHAN", "type": "school", "lat": 20.9950, "lng": 79.0410, "city": "Nagpur"},
        {"name": "Centre Point School Wardha Road", "type": "school", "lat": 21.0920, "lng": 79.0650, "city": "Nagpur"},
        {"name": "VNIT Nagpur (Visvesvaraya National Tech)", "type": "college", "lat": 21.1235, "lng": 79.0515, "city": "Nagpur"},
        {"name": "St. Vincent Pallotti College of Engineering", "type": "college", "lat": 21.0650, "lng": 79.0720, "city": "Nagpur"},
        {"name": "IIM Nagpur MIHAN Campus", "type": "college", "lat": 20.9980, "lng": 79.0380, "city": "Nagpur"},
        {"name": "Starbucks Wardha Road", "type": "cafe", "lat": 21.1100, "lng": 79.0650, "city": "Nagpur"},
        {"name": "Corridor Seven Coffee Roasters", "type": "cafe", "lat": 21.1410, "lng": 79.0610, "city": "Nagpur"},
        {"name": "Three Beans Coffee Lounge Besa", "type": "cafe", "lat": 21.0810, "lng": 79.0830, "city": "Nagpur"},
        {"name": "Fortune Mall Wardha Road", "type": "market", "lat": 21.1050, "lng": 79.0670, "city": "Nagpur"},
        {"name": "Besa Main Square Market & DMart", "type": "market", "lat": 21.0815, "lng": 79.0850, "city": "Nagpur"},
        {"name": "Empress Mall & Retail Complex", "type": "market", "lat": 21.1480, "lng": 79.0920, "city": "Nagpur"},
        {"name": "Cult.fit Shankar Nagar", "type": "gym", "lat": 21.1380, "lng": 79.0600, "city": "Nagpur"},
        {"name": "Anytime Fitness Manish Nagar", "type": "gym", "lat": 21.0910, "lng": 79.0780, "city": "Nagpur"},
        {"name": "Airport South Metro Station (Orange Line)", "type": "metro", "lat": 21.0920, "lng": 79.0620, "city": "Nagpur"},
        {"name": "Sitabuldi Metro Interchange", "type": "metro", "lat": 21.1460, "lng": 79.0820, "city": "Nagpur"},
        {"name": "Khapri Metro Station MIHAN", "type": "metro", "lat": 20.9920, "lng": 79.0350, "city": "Nagpur"}
    ],
    "Pune": [
        {"name": "Ruby Hall Clinic Hinjewadi", "type": "hospital", "lat": 18.5910, "lng": 73.7380, "city": "Pune"},
        {"name": "Jupiter Hospital Baner", "type": "hospital", "lat": 18.5580, "lng": 73.7890, "city": "Pune"},
        {"name": "Manipal Hospital Kharadi", "type": "hospital", "lat": 18.5520, "lng": 73.9420, "city": "Pune"},
        {"name": "Mercedes-Benz International School Hinjewadi", "type": "school", "lat": 18.5980, "lng": 73.7350, "city": "Pune"},
        {"name": "VIBGYOR High School Balewadi", "type": "school", "lat": 18.5720, "lng": 73.7740, "city": "Pune"},
        {"name": "The Bishop's School Kalyani Nagar", "type": "school", "lat": 18.5490, "lng": 73.9010, "city": "Pune"},
        {"name": "COEP Technological University", "type": "college", "lat": 18.5290, "lng": 73.8560, "city": "Pune"},
        {"name": "Symbiosis International University Lavale", "type": "college", "lat": 18.5350, "lng": 73.7320, "city": "Pune"},
        {"name": "MIT World Peace University Kothrud", "type": "college", "lat": 18.5180, "lng": 73.8150, "city": "Pune"},
        {"name": "Starbucks High Street Balewadi", "type": "cafe", "lat": 18.5740, "lng": 73.7730, "city": "Pune"},
        {"name": "Blue Tokai Coffee Roasters Baner", "type": "cafe", "lat": 18.5610, "lng": 73.7910, "city": "Pune"},
        {"name": "Third Wave Coffee Kharadi EON", "type": "cafe", "lat": 18.5540, "lng": 73.9480, "city": "Pune"},
        {"name": "Phoenix Marketcity Viman Nagar", "type": "market", "lat": 18.5620, "lng": 73.9170, "city": "Pune"},
        {"name": "Balewadi High Street Commercial Axis", "type": "market", "lat": 18.5730, "lng": 73.7720, "city": "Pune"},
        {"name": "Westend Mall Aundh", "type": "market", "lat": 18.5615, "lng": 73.8080, "city": "Pune"},
        {"name": "Cult.fit Baner", "type": "gym", "lat": 18.5590, "lng": 73.7850, "city": "Pune"},
        {"name": "MultiFit Hinjewadi Phase 1", "type": "gym", "lat": 18.5920, "lng": 73.7390, "city": "Pune"},
        {"name": "Hinjewadi Megapolis Metro Station (Line 3)", "type": "metro", "lat": 18.5880, "lng": 73.7250, "city": "Pune"},
        {"name": "Vanaz Metro Station (Aqua Line)", "type": "metro", "lat": 18.5080, "lng": 73.8050, "city": "Pune"},
        {"name": "Civil Court Metro Interchange", "type": "metro", "lat": 18.5310, "lng": 73.8560, "city": "Pune"}
    ],
    "Mumbai": [
        {"name": "Lilavati Hospital & Research Centre Bandra", "type": "hospital", "lat": 19.0520, "lng": 72.8290, "city": "Mumbai"},
        {"name": "Kokilaben Dhirubhai Ambani Hospital Andheri", "type": "hospital", "lat": 19.1310, "lng": 72.8250, "city": "Mumbai"},
        {"name": "Hiranandani Hospital Powai", "type": "hospital", "lat": 19.1180, "lng": 72.9120, "city": "Mumbai"},
        {"name": "Dhirubhai Ambani International School BKC", "type": "school", "lat": 19.0680, "lng": 72.8680, "city": "Mumbai"},
        {"name": "American School of Bombay BKC", "type": "school", "lat": 19.0650, "lng": 72.8690, "city": "Mumbai"},
        {"name": "Bombay Scottish School Mahim", "type": "school", "lat": 19.0340, "lng": 72.8410, "city": "Mumbai"},
        {"name": "IIT Bombay Powai", "type": "college", "lat": 19.1330, "lng": 72.9150, "city": "Mumbai"},
        {"name": "St. Xavier's College Mumbai", "type": "college", "lat": 18.9430, "lng": 72.8310, "city": "Mumbai"},
        {"name": "NMIMS University Vile Parle", "type": "college", "lat": 19.1030, "lng": 72.8370, "city": "Mumbai"},
        {"name": "Subko Specialty Coffee Bandra West", "type": "cafe", "lat": 19.0580, "lng": 72.8310, "city": "Mumbai"},
        {"name": "Blue Tokai Coffee Roasters BKC", "type": "cafe", "lat": 19.0660, "lng": 72.8670, "city": "Mumbai"},
        {"name": "Starbucks Bandra Linking Road", "type": "cafe", "lat": 19.0620, "lng": 72.8340, "city": "Mumbai"},
        {"name": "Jio World Drive BKC", "type": "market", "lat": 19.0640, "lng": 72.8640, "city": "Mumbai"},
        {"name": "Phoenix Palladium Lower Parel", "type": "market", "lat": 18.9950, "lng": 72.8250, "city": "Mumbai"},
        {"name": "Inorbit Mall Malad West", "type": "market", "lat": 19.1730, "lng": 72.8360, "city": "Mumbai"},
        {"name": "Cult.fit BKC Godrej One", "type": "gym", "lat": 19.0630, "lng": 72.8710, "city": "Mumbai"},
        {"name": "Gold's Gym Bandra West", "type": "gym", "lat": 19.0560, "lng": 72.8330, "city": "Mumbai"},
        {"name": "Bandra Kurla Complex Metro (Aqua Line 3)", "type": "metro", "lat": 19.0650, "lng": 72.8650, "city": "Mumbai"},
        {"name": "Western Express Highway Metro (Line 1)", "type": "metro", "lat": 19.1150, "lng": 72.8550, "city": "Mumbai"},
        {"name": "Chhatrapati Shivaji Maharaj Airport T2", "type": "metro", "lat": 19.0960, "lng": 72.8740, "city": "Mumbai"}
    ],
    "Bangalore": [
        {"name": "Manipal Hospital Old Airport Road", "type": "hospital", "lat": 12.9580, "lng": 77.6490, "city": "Bangalore"},
        {"name": "Aster CMI Hospital Hebbal", "type": "hospital", "lat": 13.0560, "lng": 77.5920, "city": "Bangalore"},
        {"name": "Fortis Hospital Bannerghatta Road", "type": "hospital", "lat": 12.8940, "lng": 77.5980, "city": "Bangalore"},
        {"name": "The International School Bangalore (TISB)", "type": "school", "lat": 12.8880, "lng": 77.7650, "city": "Bangalore"},
        {"name": "Greenwood High Sarjapur", "type": "school", "lat": 12.8920, "lng": 77.7510, "city": "Bangalore"},
        {"name": "Presidency School Bangalore North", "type": "school", "lat": 13.0850, "lng": 77.5940, "city": "Bangalore"},
        {"name": "Indian Institute of Science (IISc Bangalore)", "type": "college", "lat": 13.0210, "lng": 77.5670, "city": "Bangalore"},
        {"name": "IIM Bangalore Bannerghatta Road", "type": "college", "lat": 12.8960, "lng": 77.6010, "city": "Bangalore"},
        {"name": "RV College of Engineering (RVCE) Mysore Rd", "type": "college", "lat": 12.9230, "lng": 77.4980, "city": "Bangalore"},
        {"name": "Third Wave Coffee Koramangala 4th Block", "type": "cafe", "lat": 12.9340, "lng": 77.6270, "city": "Bangalore"},
        {"name": "Blue Tokai Coffee Roasters Indiranagar", "type": "cafe", "lat": 12.9710, "lng": 77.6410, "city": "Bangalore"},
        {"name": "Araku Coffee 12th Main Indiranagar", "type": "cafe", "lat": 12.9690, "lng": 77.6390, "city": "Bangalore"},
        {"name": "Phoenix Marketcity Whitefield", "type": "market", "lat": 12.9960, "lng": 77.6970, "city": "Bangalore"},
        {"name": "UB City Luxury Mall Vittal Mallya Rd", "type": "market", "lat": 12.9715, "lng": 77.5960, "city": "Bangalore"},
        {"name": "Orion Mall Rajajinagar Brigade Gateway", "type": "market", "lat": 13.0110, "lng": 77.5550, "city": "Bangalore"},
        {"name": "Cult.fit HSR Layout 27th Main", "type": "gym", "lat": 12.9120, "lng": 77.6480, "city": "Bangalore"},
        {"name": "Gold's Gym Indiranagar 100ft Road", "type": "gym", "lat": 12.9730, "lng": 77.6440, "city": "Bangalore"},
        {"name": "Majestic Interchange Metro (Purple/Green)", "type": "metro", "lat": 12.9750, "lng": 77.5720, "city": "Bangalore"},
        {"name": "Whitefield Kadugodi Metro Terminal", "type": "metro", "lat": 12.9980, "lng": 77.7580, "city": "Bangalore"},
        {"name": "Indiranagar Metro Station", "type": "metro", "lat": 12.9780, "lng": 77.6380, "city": "Bangalore"}
    ],
    "Hyderabad": [
        {"name": "AIG Hospitals Gachibowli", "type": "hospital", "lat": 17.4410, "lng": 78.3620, "city": "Hyderabad"},
        {"name": "Apollo Hospitals Jubilee Hills", "type": "hospital", "lat": 17.4260, "lng": 78.4120, "city": "Hyderabad"},
        {"name": "KIMS Hospitals Secunderabad", "type": "hospital", "lat": 17.4430, "lng": 78.4980, "city": "Hyderabad"},
        {"name": "Oakridge International School Gachibowli", "type": "school", "lat": 17.4180, "lng": 78.3450, "city": "Hyderabad"},
        {"name": "Chirec International School Kondapur", "type": "school", "lat": 17.4640, "lng": 78.3610, "city": "Hyderabad"},
        {"name": "Delhi Public School Khajaguda", "type": "school", "lat": 17.4120, "lng": 78.3710, "city": "Hyderabad"},
        {"name": "ISB (Indian School of Business) Gachibowli", "type": "college", "lat": 17.4450, "lng": 78.3510, "city": "Hyderabad"},
        {"name": "IIIT Hyderabad Gachibowli", "type": "college", "lat": 17.4450, "lng": 78.3480, "city": "Hyderabad"},
        {"name": "IIT Hyderabad Kandi Campus", "type": "college", "lat": 17.5950, "lng": 78.1250, "city": "Hyderabad"},
        {"name": "Roastery Coffee House Banjara Hills", "type": "cafe", "lat": 17.4210, "lng": 78.4410, "city": "Hyderabad"},
        {"name": "Third Wave Coffee Jubilee Hills", "type": "cafe", "lat": 17.4320, "lng": 78.4060, "city": "Hyderabad"},
        {"name": "True Black Coffee Film Nagar", "type": "cafe", "lat": 17.4180, "lng": 78.4010, "city": "Hyderabad"},
        {"name": "Inorbit Mall Cyberabad Madhapur", "type": "market", "lat": 17.4360, "lng": 78.3860, "city": "Hyderabad"},
        {"name": "Sarath City Capital Mall Gachibowli", "type": "market", "lat": 17.4580, "lng": 78.3640, "city": "Hyderabad"},
        {"name": "GVK One Mall Banjara Hills", "type": "market", "lat": 17.4200, "lng": 78.4480, "city": "Hyderabad"},
        {"name": "Cult.fit Gachibowli Financial District", "type": "gym", "lat": 17.4220, "lng": 78.3490, "city": "Hyderabad"},
        {"name": "F45 Training Jubilee Hills", "type": "gym", "lat": 17.4300, "lng": 78.4080, "city": "Hyderabad"},
        {"name": "Raidurg Metro Station Terminal (Blue Line)", "type": "metro", "lat": 17.4420, "lng": 78.3780, "city": "Hyderabad"},
        {"name": "HITEC City Metro Station", "type": "metro", "lat": 17.4480, "lng": 78.3790, "city": "Hyderabad"},
        {"name": "Ameerpet Metro Interchange", "type": "metro", "lat": 17.4360, "lng": 78.4440, "city": "Hyderabad"}
    ],
    "Delhi NCR": [
        {"name": "Medanta - The Medicity Sector 38 Gurgaon", "type": "hospital", "lat": 28.4390, "lng": 77.0420, "city": "Delhi NCR"},
        {"name": "Max Super Speciality Hospital Saket", "type": "hospital", "lat": 28.5280, "lng": 77.2120, "city": "Delhi NCR"},
        {"name": "Jaypee Hospital Sector 128 Noida", "type": "hospital", "lat": 28.5150, "lng": 77.3690, "city": "Delhi NCR"},
        {"name": "The Shri Ram School Moulsari DLF Phase 3", "type": "school", "lat": 28.4910, "lng": 77.0980, "city": "Delhi NCR"},
        {"name": "DPS R.K. Puram Sector 12 Delhi", "type": "school", "lat": 28.5680, "lng": 77.1720, "city": "Delhi NCR"},
        {"name": "Step by Step School Sector 132 Noida", "type": "school", "lat": 28.5080, "lng": 77.3820, "city": "Delhi NCR"},
        {"name": "IIT Delhi Hauz Khas", "type": "college", "lat": 28.5450, "lng": 77.1920, "city": "Delhi NCR"},
        {"name": "Delhi University North Campus", "type": "college", "lat": 28.6890, "lng": 77.2100, "city": "Delhi NCR"},
        {"name": "MDI Gurgaon Management Dev Institute", "type": "college", "lat": 28.4760, "lng": 77.0510, "city": "Delhi NCR"},
        {"name": "Blue Tokai Coffee Roasters Galleria Gurgaon", "type": "cafe", "lat": 28.4680, "lng": 77.0810, "city": "Delhi NCR"},
        {"name": "United Coffee House Connaught Place", "type": "cafe", "lat": 28.6320, "lng": 77.2190, "city": "Delhi NCR"},
        {"name": "Cafe Lota Crafts Museum Pragati Maidan", "type": "cafe", "lat": 28.6140, "lng": 77.2420, "city": "Delhi NCR"},
        {"name": "Ambience Mall NH-8 Gurgaon", "type": "market", "lat": 28.5040, "lng": 77.0970, "city": "Delhi NCR"},
        {"name": "DLF Mall of India Sector 18 Noida", "type": "market", "lat": 28.5670, "lng": 77.3210, "city": "Delhi NCR"},
        {"name": "Select CITYWALK Saket District Centre", "type": "market", "lat": 28.5285, "lng": 77.2190, "city": "Delhi NCR"},
        {"name": "Cult.fit DLF Cyber City Gurgaon", "type": "gym", "lat": 28.4950, "lng": 77.0890, "city": "Delhi NCR"},
        {"name": "Anytime Fitness Greater Kailash 1", "type": "gym", "lat": 28.5520, "lng": 77.2380, "city": "Delhi NCR"},
        {"name": "Rajiv Chowk Metro Interchange (Blue/Yellow)", "type": "metro", "lat": 28.6330, "lng": 77.2190, "city": "Delhi NCR"},
        {"name": "Cyber City Rapid Metro Station Gurgaon", "type": "metro", "lat": 28.4920, "lng": 77.0880, "city": "Delhi NCR"},
        {"name": "Botanical Garden Metro Interchange Noida", "type": "metro", "lat": 28.5640, "lng": 77.3340, "city": "Delhi NCR"}
    ],
    "Ahmedabad": [
        {"name": "Apollo Hospitals Gandhinagar Highway", "type": "hospital", "lat": 23.1090, "lng": 72.5990, "city": "Ahmedabad"},
        {"name": "Zydus Hospital SG Highway Thaltej", "type": "hospital", "lat": 23.0640, "lng": 72.5180, "city": "Ahmedabad"},
        {"name": "KD Hospital Sarkhej-Gandhinagar Rd", "type": "hospital", "lat": 23.1310, "lng": 72.5480, "city": "Ahmedabad"},
        {"name": "The Riverside School Ahmedabad", "type": "school", "lat": 23.0680, "lng": 72.6050, "city": "Ahmedabad"},
        {"name": "DPS Bopal Ahmedabad", "type": "school", "lat": 23.0310, "lng": 72.4640, "city": "Ahmedabad"},
        {"name": "IIM Ahmedabad (Vastrapur Campus)", "type": "college", "lat": 23.0320, "lng": 72.5310, "city": "Ahmedabad"},
        {"name": "NID National Institute of Design Paldi", "type": "college", "lat": 23.0120, "lng": 72.5690, "city": "Ahmedabad"},
        {"name": "DA-IICT Gandhinagar InfoCity", "type": "college", "lat": 23.1880, "lng": 72.6280, "city": "Ahmedabad"},
        {"name": "Mocha Cafe Bodakdev SG Highway", "type": "cafe", "lat": 23.0410, "lng": 72.5120, "city": "Ahmedabad"},
        {"name": "Blue Tokai Sindhu Bhavan Road", "type": "cafe", "lat": 23.0450, "lng": 72.4980, "city": "Ahmedabad"},
        {"name": "Palladium Mall SG Highway Thaltej", "type": "market", "lat": 23.0560, "lng": 72.5190, "city": "Ahmedabad"},
        {"name": "Nexus Ahmedabad One Mall Vastrapur", "type": "market", "lat": 23.0390, "lng": 72.5320, "city": "Ahmedabad"},
        {"name": "Cult.fit Sindhu Bhavan Road", "type": "gym", "lat": 23.0460, "lng": 72.4950, "city": "Ahmedabad"},
        {"name": "Thaltej Metro Station (Blue Line)", "type": "metro", "lat": 23.0510, "lng": 72.5180, "city": "Ahmedabad"},
        {"name": "Old High Court Metro Interchange", "type": "metro", "lat": 23.0380, "lng": 72.5690, "city": "Ahmedabad"}
    ],
    "Chennai": [
        {"name": "Apollo Hospitals Greams Road Thousand Lights", "type": "hospital", "lat": 13.0610, "lng": 78.2540, "city": "Chennai"},
        {"name": "MGM Healthcare Aminjikarai", "type": "hospital", "lat": 13.0740, "lng": 80.2180, "city": "Chennai"},
        {"name": "Sishya School Adyar", "type": "school", "lat": 13.0060, "lng": 80.2580, "city": "Chennai"},
        {"name": "Chettinad Vidyashram R.A. Puram", "type": "school", "lat": 13.0210, "lng": 80.2640, "city": "Chennai"},
        {"name": "IIT Madras Adyar Guindy Campus", "type": "college", "lat": 12.9910, "lng": 80.2330, "city": "Chennai"},
        {"name": "Anna University Guindy", "type": "college", "lat": 13.0110, "lng": 80.2350, "city": "Chennai"},
        {"name": "Writer's Cafe Gopalapuram", "type": "cafe", "lat": 13.0510, "lng": 80.2540, "city": "Chennai"},
        {"name": "Chamiers Cafe R.A. Puram", "type": "cafe", "lat": 13.0280, "lng": 80.2480, "city": "Chennai"},
        {"name": "Phoenix Marketcity Velachery", "type": "market", "lat": 12.9920, "lng": 80.2170, "city": "Chennai"},
        {"name": "Express Avenue Royapettah", "type": "market", "lat": 13.0580, "lng": 80.2640, "city": "Chennai"},
        {"name": "Cult.fit Alwarpet TTK Road", "type": "gym", "lat": 13.0360, "lng": 80.2510, "city": "Chennai"},
        {"name": "Chennai Central Metro Interchange", "type": "metro", "lat": 13.0820, "lng": 80.2750, "city": "Chennai"},
        {"name": "Guindy Metro Station", "type": "metro", "lat": 13.0080, "lng": 80.2130, "city": "Chennai"}
    ],
    "Kolkata": [
        {"name": "Apollo Multispeciality Hospitals EM Bypass", "type": "hospital", "lat": 22.5710, "lng": 88.4060, "city": "Kolkata"},
        {"name": "Fortis Hospital Anandapur EM Bypass", "type": "hospital", "lat": 22.5180, "lng": 88.4010, "city": "Kolkata"},
        {"name": "La Martiniere for Boys/Girls Loudon St", "type": "school", "lat": 22.5450, "lng": 88.3580, "city": "Kolkata"},
        {"name": "South Point High School Ballygunge", "type": "school", "lat": 22.5210, "lng": 88.3680, "city": "Kolkata"},
        {"name": "IIM Calcutta Joka Diamond Harbour Rd", "type": "college", "lat": 22.4410, "lng": 88.3020, "city": "Kolkata"},
        {"name": "Jadavpur University Campus", "type": "college", "lat": 22.4990, "lng": 88.3710, "city": "Kolkata"},
        {"name": "Flurys Heritage Tearoom Park Street", "type": "cafe", "lat": 22.5530, "lng": 88.3540, "city": "Kolkata"},
        {"name": "Roastery Coffee House Kolkata Gariahat", "type": "cafe", "lat": 22.5170, "lng": 88.3610, "city": "Kolkata"},
        {"name": "South City Mall Prince Anwar Shah Rd", "type": "market", "lat": 22.4990, "lng": 88.3620, "city": "Kolkata"},
        {"name": "Quest Mall Syed Amir Ali Ave", "type": "market", "lat": 22.5390, "lng": 88.3660, "city": "Kolkata"},
        {"name": "Cult.fit Salt Lake Sector 5", "type": "gym", "lat": 22.5830, "lng": 88.4310, "city": "Kolkata"},
        {"name": "Howrah Maidan Underwater Metro (Green Line)", "type": "metro", "lat": 22.5850, "lng": 88.3320, "city": "Kolkata"},
        {"name": "Salt Lake Sector V IT Metro", "type": "metro", "lat": 22.5800, "lng": 88.4350, "city": "Kolkata"}
    ],
    "Jaipur": [
        {"name": "Fortis Escorts Hospital Malviya Nagar", "type": "hospital", "lat": 26.8510, "lng": 75.8080, "city": "Jaipur"},
        {"name": "Eternal Hospital (EHCC) Jawahar Circle", "type": "hospital", "lat": 26.8390, "lng": 75.8010, "city": "Jaipur"},
        {"name": "Maharani Gayatri Devi Girls' School (MGD)", "type": "school", "lat": 26.9150, "lng": 75.8180, "city": "Jaipur"},
        {"name": "Jayshree Periwal High School Chitrakoot", "type": "school", "lat": 26.8920, "lng": 75.7410, "city": "Jaipur"},
        {"name": "MNIT Jaipur Malaviya National Tech", "type": "college", "lat": 26.8630, "lng": 75.8110, "city": "Jaipur"},
        {"name": "Tapri The Tea House Central Park", "type": "cafe", "lat": 26.9030, "lng": 75.8070, "city": "Jaipur"},
        {"name": "Town Coffee C-Scheme Subhash Marg", "type": "cafe", "lat": 26.9080, "lng": 75.8010, "city": "Jaipur"},
        {"name": "World Trade Park (WTP) Malviya Nagar", "type": "market", "lat": 26.8530, "lng": 75.8050, "city": "Jaipur"},
        {"name": "Bapu Bazaar Heritage Market", "type": "market", "lat": 26.9200, "lng": 75.8240, "city": "Jaipur"},
        {"name": "Cult.fit Vaishali Nagar", "type": "gym", "lat": 26.8990, "lng": 75.7440, "city": "Jaipur"},
        {"name": "Badi Chaupar Metro Station (Pink Line)", "type": "metro", "lat": 26.9240, "lng": 75.8310, "city": "Jaipur"},
        {"name": "Mansarovar Metro Terminal", "type": "metro", "lat": 26.8790, "lng": 75.7580, "city": "Jaipur"}
    ],
    "Lucknow": [
        {"name": "Medanta Hospital Shaheed Path", "type": "hospital", "lat": 26.7820, "lng": 80.9980, "city": "Lucknow"},
        {"name": "SGPGIMS Super Speciality Hospital", "type": "hospital", "lat": 26.7480, "lng": 80.9410, "city": "Lucknow"},
        {"name": "La Martiniere College Lucknow", "type": "school", "lat": 26.8390, "lng": 80.9580, "city": "Lucknow"},
        {"name": "City Montessori School (CMS) Gomti Nagar", "type": "school", "lat": 26.8520, "lng": 80.9980, "city": "Lucknow"},
        {"name": "IIM Lucknow Prabandh Nagar", "type": "college", "lat": 26.9260, "lng": 80.9180, "city": "Lucknow"},
        {"name": "KGMU King George's Medical University", "type": "college", "lat": 26.8680, "lng": 80.9150, "city": "Lucknow"},
        {"name": "Roastery Coffee House Gomti Nagar", "type": "cafe", "lat": 26.8480, "lng": 80.9780, "city": "Lucknow"},
        {"name": "The Hazelnut Factory Hazratganj", "type": "cafe", "lat": 26.8490, "lng": 80.9460, "city": "Lucknow"},
        {"name": "Lulu Mall Shaheed Path Golf City", "type": "market", "lat": 26.7720, "lng": 80.9950, "city": "Lucknow"},
        {"name": "Phoenix Palassio Gomti Nagar Extension", "type": "market", "lat": 26.8120, "lng": 81.0110, "city": "Lucknow"},
        {"name": "Cult.fit Gomti Nagar Patrakarpuram", "type": "gym", "lat": 26.8540, "lng": 80.9920, "city": "Lucknow"},
        {"name": "Hazratganj Metro Station (Red Line)", "type": "metro", "lat": 26.8470, "lng": 80.9450, "city": "Lucknow"},
        {"name": "CCS Airport Metro Station Amausi", "type": "metro", "lat": 26.7640, "lng": 80.8840, "city": "Lucknow"}
    ],
    "Goa": [
        {"name": "Manipal Hospital Dona Paula Panaji", "type": "hospital", "lat": 15.4580, "lng": 73.8050, "city": "Goa"},
        {"name": "Goa Medical College (GMC) Bambolim", "type": "hospital", "lat": 15.4610, "lng": 73.8560, "city": "Goa"},
        {"name": "Sharada Mandir School Miramar", "type": "school", "lat": 15.4810, "lng": 73.8110, "city": "Goa"},
        {"name": "BITS Pilani K.K. Birla Goa Campus Zuarinagar", "type": "college", "lat": 15.3910, "lng": 73.8780, "city": "Goa"},
        {"name": "Goa Institute of Management (GIM Sanquelim)", "type": "college", "lat": 15.5560, "lng": 74.0150, "city": "Goa"},
        {"name": "Caravela Cafe Latin Quarter Fontainhas", "type": "cafe", "lat": 15.4980, "lng": 73.8320, "city": "Goa"},
        {"name": "Artjuna Lifestyle Cafe Assagao", "type": "cafe", "lat": 15.5890, "lng": 73.7650, "city": "Goa"},
        {"name": "Mall De Goa Porvorim", "type": "market", "lat": 15.5240, "lng": 73.8290, "city": "Goa"},
        {"name": "Saturday Night Market Arpora", "type": "market", "lat": 15.5780, "lng": 73.7640, "city": "Goa"},
        {"name": "Cult.fit Panaji Patto Plaza", "type": "gym", "lat": 15.4950, "lng": 73.8410, "city": "Goa"},
        {"name": "Mopa International Airport Expressway Axis", "type": "metro", "lat": 15.7510, "lng": 73.8640, "city": "Goa"},
        {"name": "Atal Setu Mandovi Cable Bridge Axis", "type": "metro", "lat": 15.5030, "lng": 73.8380, "city": "Goa"}
    ]
}

async def get_india_map_data(city: Optional[str] = None, state: Optional[str] = None) -> Dict[str, Any]:
    """Returns geospatial dataset of micro-markets, verified rates, AND authentic nearby POIs."""
    results = []
    
    for idx, loc in enumerate(ALL_INDIA_LOCALITIES):
        if city and city != "All" and loc["city"].lower() != city.lower():
            continue
        if state and state != "All" and loc["state"].lower() != state.lower():
            continue
            
        results.append({
            "id": f"geo-{idx+1}",
            "locality": loc["locality"],
            "city": loc["city"],
            "state": loc["state"],
            "lat": loc["lat"],
            "lng": loc["lng"],
            "circle_rate": loc["circle_rate"],
            "market_rate_min": loc["market_rate_min"],
            "market_rate_max": loc["market_rate_max"],
            "market_rate_avg": loc["market_rate_avg"],
            "plot_rate_sqft": loc.get("plot_rate_sqft", round(loc["market_rate_avg"] * 0.65)),
            "plot_rate_guntha": loc.get("plot_rate_guntha", round(loc["market_rate_avg"] * 0.65 * 1089)),
            "rental_yield": loc["rental_yield"],
            "cagr_5y": loc["cagr_5y"],
            "infra_score": loc["infra_score"],
            "livability_score": loc["livability_score"],
            "connectivity": loc.get("connectivity", ""),
            "notable_projects": loc.get("notable_projects", []),
            "tags": loc.get("tags", []),
            "ai_score": round((loc["infra_score"] * 5) + (loc["livability_score"] * 5))
        })

    # Gather Real Civic POIs for the requested city or pan-India
    matched_pois = []
    if city and city in CITY_GENUINE_POIS:
        matched_pois = CITY_GENUINE_POIS[city]
    elif city == "All" or not city:
        for c_pois in CITY_GENUINE_POIS.values():
            matched_pois.extend(c_pois)
    else:
        # Match by case-insensitive city key
        found = False
        for c_key, c_pois in CITY_GENUINE_POIS.items():
            if c_key.lower() in (city or "").lower() or (city or "").lower() in c_key.lower():
                matched_pois = c_pois
                found = True
                break
        if not found:
            for c_pois in CITY_GENUINE_POIS.values():
                matched_pois.extend(c_pois[:3])

    return {
        "locations": results,
        "poi_markers": matched_pois,
        "total_locations": len(results),
        "total_pois": len(matched_pois)
    }

async def get_available_cities() -> Dict[str, Any]:
    """Returns all available cities grouped by state."""
    states_dict = {}
    for loc in ALL_INDIA_LOCALITIES:
        st = loc["state"]
        ct = loc["city"]
        if st not in states_dict:
            states_dict[st] = set()
        states_dict[st].add(ct)
        
    formatted = []
    for st, cities in states_dict.items():
        formatted.append({
            "state": st,
            "cities": sorted(list(cities))
        })
    return {"states": formatted}

async def get_nearby_amenities(lat: float, lon: float, radius_m: float = 5000, types: str = "all") -> List[Dict[str, Any]]:
    """Returns nearby infrastructure POIs with exact real coordinates."""
    all_pois = []
    for pois in CITY_GENUINE_POIS.values():
        all_pois.extend(pois)
        
    results = []
    for poi in all_pois:
        if types != "all" and poi["type"] != types:
            continue
        dist_approx = ((poi["lat"] - lat)**2 + (poi["lng"] - lon)**2)**0.5 * 111000
        if dist_approx <= radius_m:
            results.append({
                "name": poi["name"],
                "type": poi["type"],
                "lat": poi["lat"],
                "lng": poi["lng"],
                "distance_m": round(dist_approx)
            })
    return results

async def get_heatmap_data(db: AsyncSession, city: str, metric: str = "price"):
    query = select(PropertyModel.latitude, PropertyModel.longitude, PropertyModel.actual_price, PropertyModel.price_per_sqft)
    if city and city != "All":
        query = query.where(PropertyModel.city.ilike(f"%{city}%"))
    res = await db.execute(query)
    data = res.all()
    
    if not data:
        return [
            {"lat": loc["lat"], "lon": loc["lng"], "weight": loc["market_rate_avg"]}
            for loc in ALL_INDIA_LOCALITIES
            if city == "All" or loc["city"].lower() == city.lower()
        ]
        
    return [{"lat": r.latitude, "lon": r.longitude, "weight": float(r.price_per_sqft or 10000)} for r in data]