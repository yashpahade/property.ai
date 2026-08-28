import json
import random

def generate():
    out = []
    # Helper lists
    builders = ["Mahindra Lifespaces", "Tata Housing", "Godrej Properties", "Lodha", "Oberoi", "Panchshil", "Kolte Patil", "Kukreja", "Pioneer", "VTP", "Goel Ganga", "Rachana Group", "Sandesh", "Hiranandani", "Kalpataru", "Runwal", "L&T Realty", "Shapoorji Pallonji", "Puraniks"]
    facing_options = ['North', 'South', 'East', 'West', 'North-East', 'South-West']
    prop_types = ['flat', 'villa', 'duplex', 'penthouse', 'plot', 'rowhouse', 'studio']
    possession_opts = ['Ready to Move', 'Dec 2025', 'Mar 2026', 'Jun 2026']
    buy_rent = ['buy', 'rent']
    
    nagpur_areas = [
        ("Civil Lines", 8500), ("Dharampeth", 10000), ("Ramdaspeth", 9000), ("Sadar", 7000), 
        ("Sitabuldi", 6500), ("Laxmi Nagar", 6800), ("Shankar Nagar", 7500), ("Seminary Hills", 6000), 
        ("Byramji Town", 8000), ("Gorepeth", 7000), ("Pratap Nagar", 5500), ("Trimurti Nagar", 5000), 
        ("Manish Nagar", 4800), ("Dhantoli", 9000), ("Mahal", 4500),
        ("Besa", 4800), ("Wardha Road", 5200), ("MIHAN", 6000), ("Jamtha", 4000), 
        ("Hingna", 3500), ("Koradi", 3800), ("Sonegaon", 4500), ("Umred Road", 3000), 
        ("Kamptee", 3200), ("Mankapur", 4000), ("Wadi", 3500), ("Narendra Nagar", 5000), 
        ("Khare Town", 7500), ("Parsodi", 4200), ("Medical Square", 5500), ("Ambazari", 8000)
    ]
    pune_areas = [
        ("Koregaon Park", 18500), ("Baner", 8500), ("Hinjewadi", 7500), ("Kharadi", 10000), 
        ("Wakad", 8000), ("Viman Nagar", 11000), ("Hadapsar", 7500), ("Kothrud", 12000), 
        ("Shivajinagar", 14000), ("Aundh", 11000), ("Bavdhan", 7500), ("Pimpri", 6500), 
        ("Chinchwad", 7000), ("Wagholi", 5200), ("Undri", 5000), ("Sinhagad Road", 6000), 
        ("Kondhwa", 5500), ("Balewadi", 8500), ("Magarpatta", 9000)
    ]
    mumbai_areas = [
        ("Bandra", 45000), ("Andheri East", 18000), ("Andheri West", 22000), ("Powai", 21500), 
        ("Goregaon", 16000), ("Mulund", 15000), ("Thane", 12500), ("Worli", 50000), 
        ("Lower Parel", 35000), ("Malad", 15000), ("Borivali", 14000), ("Dahisar", 11000), 
        ("Kharghar", 9000), ("Panvel", 7500), ("Vashi", 12000), ("Nerul", 11000), 
        ("Airoli", 10000), ("Virar", 6000), ("Mira Road", 8500), ("Kalyan", 6500), ("Dombivli", 6000)
    ]
    nashik_areas = [
        ("Gangapur Road", 6000), ("College Road", 6500), ("Indira Nagar", 4500), ("Nashik Road", 4000), 
        ("Satpur", 3500), ("Panchavati", 4200), ("Cidco", 4000), ("Deolali", 4500), 
        ("Pathardi", 3800), ("Sinnar", 2500)
    ]
    
    cities = [("Nagpur", nagpur_areas, 50), ("Pune", pune_areas, 40), ("Mumbai", mumbai_areas, 40), ("Nashik", nashik_areas, 20)]
    
    properties = []
    pid = 1
    
    for city, areas, count in cities:
        for _ in range(count):
            area, base_price = random.choice(areas)
            ptype = random.choice(prop_types)
            tr_type = random.choices(buy_rent, weights=[0.8, 0.2])[0]
            
            bhk = random.choice([1,2,3,4,5]) if ptype != 'plot' else 0
            sqft = random.randint(500, 3000) if ptype != 'plot' else random.randint(1000, 5000)
            
            price_per_sqft = int(base_price * random.uniform(0.9, 1.1))
            
            if tr_type == 'buy':
                price = price_per_sqft * sqft
            else:
                price = int((price_per_sqft * sqft) * 0.03 / 12) # ~3% rental yield
                
            properties.append({
                "id": f"prop-{pid}",
                "title": f"{bhk} BHK {ptype.title()} in {area}" if ptype != 'plot' else f"{sqft} sqft Plot in {area}",
                "locality": area,
                "city": city,
                "price": price,
                "pricePerSqft": price_per_sqft if tr_type == 'buy' else int(price / sqft),
                "bhk": bhk,
                "area": sqft,
                "propertyType": ptype,
                "age": random.randint(0, 15),
                "floor": random.randint(0, 20) if ptype not in ['villa', 'plot', 'rowhouse'] else 0,
                "totalFloors": random.randint(4, 30) if ptype not in ['villa', 'plot', 'rowhouse'] else (2 if ptype != 'plot' else 0),
                "facing": random.choice(facing_options),
                "score": random.randint(60, 98),
                "amenities": random.sample(["Swimming Pool", "Gym", "Clubhouse", "Security", "Parking", "Park", "Lift", "Power Backup"], random.randint(3, 7)),
                "description": f"A beautiful {ptype} located in {area}, {city}.",
                "builder": random.choice(builders),
                "possession": random.choice(possession_opts),
                "lat": random.uniform(18.0, 21.5),
                "lng": random.uniform(72.0, 79.5),
                "type": tr_type
            })
            pid += 1

    localities = []
    lid = 1
    
    nagpur_hosp = ["Orange City Hospital", "Wockhardt Hospital", "AIIMS Nagpur", "Care Hospital", "Lata Mangeshkar Hospital", "Alexis Hospital"]
    nagpur_sch = ["Centre Point School", "Sandipani School", "Bhavan's BP Vidya Mandir", "St. Xavier's", "Delhi Public School"]
    nagpur_col = ["VNIT", "IIM Nagpur", "Nagpur University", "RCOEM", "Government Medical College"]
    nagpur_gym = ["Gold's Gym", "Talwalkars", "Anytime Fitness", "Snap Fitness"]
    nagpur_rest = ["Hotel Tuli Imperial", "Barbeque Nation", "Mainland China", "Haldiram's", "Radisson Blu"]
    nagpur_mall = ["Empress Mall", "Eternity Mall", "VR Nagpur", "Poonam Mall"]

    pune_hosp = ["Ruby Hall Clinic", "Jehangir Hospital", "Deenanath Mangeshkar Hospital"]
    pune_sch = ["Bishop's School", "St. Mary's School", "Symbiosis School"]
    pune_col = ["Fergusson College", "Symbiosis", "COEP"]
    pune_mall = ["Phoenix Marketcity", "Amanora Mall", "Seasons Mall"]

    mumbai_hosp = ["Lilavati Hospital", "Hinduja Hospital", "Kokilaben Hospital"]
    mumbai_sch = ["Dhirubhai Ambani School", "Bombay Scottish", "Jamnabai Narsee"]
    mumbai_col = ["St. Xavier's College", "Mithibai College", "IIT Bombay"]
    mumbai_mall = ["High Street Phoenix", "Infiniti Mall", "Oberoi Mall"]

    nashik_hosp = ["Wockhardt Hospital", "Apollo Hospitals", "Sahyadri Hospital"]
    nashik_sch = ["Fravashi Academy", "Ryan International", "Delhi Public School"]
    nashik_col = ["KTHM College", "MET BKC", "KK Wagh"]
    nashik_mall = ["City Centre Mall", "Pinnacle Mall", "Star Mall"]

    def get_amenities(city):
        if city == "Nagpur":
            return nagpur_hosp, nagpur_sch, nagpur_col, nagpur_gym, nagpur_rest, nagpur_mall
        elif city == "Pune":
            return pune_hosp, pune_sch, pune_col, nagpur_gym, nagpur_rest, pune_mall
        elif city == "Mumbai":
            return mumbai_hosp, mumbai_sch, mumbai_col, nagpur_gym, nagpur_rest, mumbai_mall
        else:
            return nashik_hosp, nashik_sch, nashik_col, nagpur_gym, nagpur_rest, nashik_mall

    for city, areas, _ in cities:
        for area, base_price in areas:
            h, s, c, g, r, m = get_amenities(city)
            localities.append({
                "id": f"{city.lower()}-{area.lower().replace(' ', '-')}",
                "name": area,
                "city": city,
                "avgPricePerSqft": base_price,
                "priceGrowth1Y": round(random.uniform(2.0, 12.0), 1),
                "priceGrowth3Y": round(random.uniform(8.0, 35.0), 1),
                "rentalYield": round(random.uniform(2.5, 5.0), 1),
                "aiScore": random.randint(65, 95),
                "totalProperties": random.randint(50, 500),
                "description": f"Prime locality in {city}.",
                "pincode": f"{random.randint(400000, 440000)}",
                "nearbyAmenities": {
                    "hospitals": [{"name": random.choice(h), "distance": f"{random.uniform(0.5, 5.0):.1f} km"} for _ in range(2)],
                    "schools": [{"name": random.choice(s), "distance": f"{random.uniform(0.5, 5.0):.1f} km"} for _ in range(2)],
                    "colleges": [{"name": random.choice(c), "distance": f"{random.uniform(0.5, 10.0):.1f} km"} for _ in range(1)],
                    "gyms": [{"name": random.choice(g), "distance": f"{random.uniform(0.2, 3.0):.1f} km"} for _ in range(2)],
                    "restaurants": [{"name": random.choice(r), "distance": f"{random.uniform(0.1, 4.0):.1f} km"} for _ in range(3)],
                    "malls": [{"name": random.choice(m), "distance": f"{random.uniform(1.0, 8.0):.1f} km"} for _ in range(1)]
                },
                "connectivity": [
                    {"type": "Metro", "name": "Nearest Metro Station", "distance": f"{random.uniform(0.5, 5.0):.1f} km"},
                    {"type": "Bus", "name": "Local Bus Stand", "distance": f"{random.uniform(0.1, 2.0):.1f} km"}
                ],
                "priceHistory": [{"month": mth, "price": int(base_price * (1 + (i*0.01)))} for i, mth in enumerate(["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"])],
                "lat": random.uniform(18.0, 21.5),
                "lng": random.uniform(72.0, 79.5)
            })

    ts_content = f"export const MOCK_PROPERTIES = {json.dumps(properties, indent=2)};\n\n"
    ts_content += f"export const MOCK_LOCALITIES = {json.dumps(localities, indent=2)};\n\n"
    
    ts_content += '''export const MOCK_PRICE_TRENDS = [
  { city: 'Nagpur', trend: [100, 105, 110, 115] },
  { city: 'Pune', trend: [120, 122, 125, 128] },
  { city: 'Mumbai', trend: [200, 205, 212, 218] },
  { city: 'Nashik', trend: [80, 82, 85, 87] }
];

export const MOCK_CITY_DIST = [
  { city: 'Nagpur', count: 50 },
  { city: 'Pune', count: 40 },
  { city: 'Mumbai', count: 40 },
  { city: 'Nashik', count: 20 }
];

export const MOCK_TOP_LOCALITIES = [
  { name: 'Civil Lines, Nagpur', score: 95 },
  { name: 'Koregaon Park, Pune', score: 94 },
  { name: 'Bandra, Mumbai', score: 98 },
  { name: 'Baner, Pune', score: 92 },
  { name: 'Dharampeth, Nagpur', score: 90 },
  { name: 'Powai, Mumbai', score: 93 },
  { name: 'Hinjewadi, Pune', score: 89 },
  { name: 'Worli, Mumbai', score: 96 },
  { name: 'College Road, Nashik', score: 85 },
  { name: 'Ramdaspeth, Nagpur', score: 88 }
];

export const MOCK_RECENT_PREDS = [
  { id: 1, text: 'High growth expected in MIHAN, Nagpur over next 3 years.' },
  { id: 2, text: 'Wakad, Pune showing strong rental yield potential.' }
];
'''
    with open('c:/Users/omkar/Desktop/props.ai/frontend/src/lib/mockData.ts', 'w', encoding='utf-8') as f:
        f.write(ts_content)
    print("Done")

generate()
