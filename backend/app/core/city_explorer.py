"""
City Micro-Market Explorer & Locality Directory Engine
When a user searches for a broader city like "Mumbai", "Pune", "Nagpur", "Bangalore", "Hyderabad", or "Delhi",
this engine provides a categorized grid of micro-markets, zones, and 1-tap selectors.
"""

from typing import Dict, Any, List, Optional

CITY_LOCALITIES_DIRECTORY = {
    "mumbai": {
        "city_name": "Mumbai Metropolitan Region (MMR)",
        "state": "Maharashtra",
        "planning_authorities": ["BMC (MCGM)", "MMRDA", "CIDCO", "TMC", "KDMC", "MBMC", "VVCMC"],
        "zones": [
            "All Areas",
            "South Mumbai & Prime",
            "Western Suburbs",
            "Central Suburbs",
            "Navi Mumbai & Airport",
            "Thane & Outer MMR",
            "Coastal & Satellite Belts"
        ],
        "localities": [
            {
                "name": "Bandra West & BKC",
                "zone": "South Mumbai & Prime",
                "authority": "MCGM / MMRDA",
                "rate_avg_sqft": 72000,
                "circle_rate_sqft": 42000,
                "plot_rate_guntha": 70785000,
                "property_types": "Luxury High-Rise, Penthouses & Commercial",
                "highlights": "Bollywood & Corporate Headquarters, Bandra-Worli Sea Link",
                "query": "Bandra West Mumbai"
            },
            {
                "name": "Worli, Lower Parel & Prabhadevi",
                "zone": "South Mumbai & Prime",
                "authority": "MCGM",
                "rate_avg_sqft": 64000,
                "circle_rate_sqft": 38000,
                "plot_rate_guntha": 63162000,
                "property_types": "Skyscraper Apartments & Duplexes",
                "highlights": "Mumbai Coastal Road, High Net Worth Sea Views",
                "query": "Worli Lower Parel Mumbai"
            },
            {
                "name": "Andheri West (Lokhandwala & Versova)",
                "zone": "Western Suburbs",
                "authority": "MCGM",
                "rate_avg_sqft": 28500,
                "circle_rate_sqft": 18500,
                "plot_rate_guntha": 28000000,
                "property_types": "Flats, Gated Societies & Studios",
                "highlights": "Metro Lines 1, 2A & 7 Junction, Entertainment Hub",
                "query": "Andheri West Mumbai"
            },
            {
                "name": "Goregaon & Malad (Link Road & East)",
                "zone": "Western Suburbs",
                "authority": "MCGM",
                "rate_avg_sqft": 21500,
                "circle_rate_sqft": 14200,
                "plot_rate_guntha": 21000000,
                "property_types": "2 & 3 BHK High-Rise Townships",
                "highlights": "Mindspace IT Hub, Western Express Highway, Oberoi Mall",
                "query": "Goregaon East Mumbai"
            },
            {
                "name": "Borivali & Kandivali West",
                "zone": "Western Suburbs",
                "authority": "MCGM",
                "rate_avg_sqft": 19500,
                "circle_rate_sqft": 13000,
                "plot_rate_guntha": 18500000,
                "property_types": "Family Apartments & High-Rise Towers",
                "highlights": "Metro Line 2A & 7, Borivali Station, Sanjay Gandhi National Park",
                "query": "Borivali West Mumbai"
            },
            {
                "name": "Powai, Hiranandani & Kanjurmarg",
                "zone": "Central Suburbs",
                "authority": "MCGM",
                "rate_avg_sqft": 24500,
                "circle_rate_sqft": 15800,
                "plot_rate_guntha": 24000000,
                "property_types": "Luxury Township Flats & Lake View Towers",
                "highlights": "Hiranandani Gardens, IIT Bombay, JVLR & Metro Line 6",
                "query": "Powai Hiranandani Mumbai"
            },
            {
                "name": "Bhandup & Mulund West",
                "zone": "Central Suburbs",
                "authority": "MCGM",
                "rate_avg_sqft": 17500,
                "circle_rate_sqft": 11800,
                "plot_rate_guntha": 13600000,
                "property_types": "High-Rise Flats & Redevelopment Towers",
                "highlights": "Eastern Express Highway, Metro Line 4, LBS Marg Corridor",
                "query": "Bhandup Sonapur Mumbai"
            },
            {
                "name": "Chembur & Ghatkopar East",
                "zone": "Central Suburbs",
                "authority": "MCGM",
                "rate_avg_sqft": 22000,
                "circle_rate_sqft": 14500,
                "plot_rate_guntha": 22000000,
                "property_types": "Boutique Flats & Gated Towers",
                "highlights": "Eastern Freeway direct to South Mumbai, BKC Connector",
                "query": "Chembur Mumbai"
            },
            {
                "name": "Kharghar, Panvel & Ulwe",
                "zone": "Navi Mumbai & Airport",
                "authority": "CIDCO / PMC",
                "rate_avg_sqft": 12800,
                "circle_rate_sqft": 7800,
                "plot_rate_guntha": 9256500, # ~₹92.5L/Guntha
                "property_types": "CIDCO NA Plots, High-Rise & Townships",
                "highlights": "Navi Mumbai International Airport (NMIA), Atal Setu (MTHL)",
                "query": "Kharghar Panvel Navi Mumbai"
            },
            {
                "name": "Vashi, Seawoods & Nerul",
                "zone": "Navi Mumbai & Airport",
                "authority": "NMMC / CIDCO",
                "rate_avg_sqft": 18500,
                "circle_rate_sqft": 12500,
                "plot_rate_guntha": 18000000,
                "property_types": "Premium Navi Mumbai Apartments & Row Houses",
                "highlights": "Palm Beach Road, Seawoods Grand Central, Vashi Commercial Hub",
                "query": "Vashi Seawoods Navi Mumbai"
            },
            {
                "name": "Dronagiri & Uran (JNPT & MTHL Axis)",
                "zone": "Navi Mumbai & Airport",
                "authority": "CIDCO",
                "rate_avg_sqft": 8200,
                "circle_rate_sqft": 5100,
                "plot_rate_guntha": 6800000,
                "property_types": "Affordable CIDCO Plots & High-Rise",
                "highlights": "Atal Setu exit, JNPT Port SEZ, Coastal Highway",
                "query": "Dronagiri Uran Navi Mumbai"
            },
            {
                "name": "Thane West (Ghodbunder & Majiwada)",
                "zone": "Thane & Outer MMR",
                "authority": "TMC / MMRDA",
                "rate_avg_sqft": 15200,
                "circle_rate_sqft": 9200,
                "plot_rate_guntha": 13939200,
                "property_types": "Mega Townships (Lodha, Rustomjee, Hiranandani)",
                "highlights": "Metro Lines 4 & 5, Borivali-Thane Twin Tunnel, Eastern Express Highway",
                "query": "Thane West Ghodbunder Road"
            },
            {
                "name": "Kalyan-Dombivli & Lodha Palava City",
                "zone": "Thane & Outer MMR",
                "authority": "KDMC / MMRDA",
                "rate_avg_sqft": 7800,
                "circle_rate_sqft": 4800,
                "plot_rate_guntha": 4573800,
                "property_types": "Smart City 1-3 BHK Flats & Row Houses",
                "highlights": "Airoli-Katai Tunnel Road, Central Railway, Palava Smart City",
                "query": "Kalyan Dombivli Palava"
            },
            {
                "name": "Mira Road & Bhayandar",
                "zone": "Thane & Outer MMR",
                "authority": "MBMC / MMRDA",
                "rate_avg_sqft": 10500,
                "circle_rate_sqft": 6800,
                "plot_rate_guntha": 8500000,
                "property_types": "Affordable 1, 2, 3 BHK Family Flats",
                "highlights": "Metro Line 9 extension, Western Railway suburban corridor",
                "query": "Mira Road Bhayandar"
            },
            {
                "name": "Vasai & Virar (VVCMC Belt)",
                "zone": "Thane & Outer MMR",
                "authority": "VVCMC / MMRDA",
                "rate_avg_sqft": 6200,
                "circle_rate_sqft": 4100,
                "plot_rate_guntha": 4200000,
                "property_types": "Budget Apartments & Gaothan NA Land",
                "highlights": "Coastal Highway, Western Railway Quadrupling",
                "query": "Vasai Virar Mumbai"
            },
            {
                "name": "Alibaug (Mandwa, Kihim & Awas Coastal)",
                "zone": "Coastal & Satellite Belts",
                "authority": "Collector NA 44 / MMRDA",
                "rate_avg_sqft": 4500,
                "circle_rate_sqft": 2800,
                "plot_rate_guntha": 3811500, # ~₹38.1L/Guntha
                "property_types": "Gated NA Plots, Coastal Villas & Farmhouses",
                "highlights": "Mandwa Ro-Pax & Speedboat (15 mins from Mumbai), Coastal Highway",
                "query": "Alibaug Mandwa Coastal NA Plots"
            },
            {
                "name": "Karjat & Neral (Hillside Belt)",
                "zone": "Coastal & Satellite Belts",
                "authority": "Collector NA 44 / MMRDA",
                "rate_avg_sqft": 3600,
                "circle_rate_sqft": 2200,
                "plot_rate_guntha": 2395800, # ~₹24.0L/Guntha
                "property_types": "Weekend Villas, Second Homes & NA Plots",
                "highlights": "Panvel-Karjat Suburban Railway, Matheran Eco-Zone",
                "query": "Karjat Neral Plots"
            },
            {
                "name": "Badlapur & Ambernath",
                "zone": "Coastal & Satellite Belts",
                "authority": "Municipal Council / MMRDA",
                "rate_avg_sqft": 4800,
                "circle_rate_sqft": 3200,
                "plot_rate_guntha": 3400000,
                "property_types": "Budget 1 & 2 BHK Apartments",
                "highlights": "Central Railway Suburban Node, MIDC Employment",
                "query": "Badlapur Ambernath"
            }
        ]
    },
    "nagpur": {
        "city_name": "Nagpur Metro Region",
        "state": "Maharashtra",
        "planning_authorities": ["NMC", "NMRDA", "NIT", "MIDC"],
        "zones": [
            "All Areas",
            "Main City Prime",
            "Wardha Road & MIHAN SEZ",
            "Hingna & Amravati Corridor",
            "Koradi, Kamptee & Umred Belts"
        ],
        "localities": [
            {
                "name": "Dharampeth, Ramdaspeth & Shankar Nagar",
                "zone": "Main City Prime",
                "authority": "NMC / NIT",
                "rate_avg_sqft": 10500,
                "circle_rate_sqft": 6500,
                "plot_rate_guntha": 8929800,
                "property_types": "Premium Flats, Duplexes & Commercial",
                "highlights": "Posh Central Nagpur, Aqua Line Metro, Medical Hub",
                "query": "Dharampeth Ramdaspeth Nagpur"
            },
            {
                "name": "Civil Lines & Seminary Hills",
                "zone": "Main City Prime",
                "authority": "NMC / NIT",
                "rate_avg_sqft": 9800,
                "circle_rate_sqft": 6200,
                "plot_rate_guntha": 8500000,
                "property_types": "Bungalows, Government Enclaves & Luxury Towers",
                "highlights": "High Court, Lush Green Environs, Zero Mile",
                "query": "Civil Lines Nagpur"
            },
            {
                "name": "Besa, Pipla & Shankarpur (Wardha Rd)",
                "zone": "Wardha Road & MIHAN SEZ",
                "authority": "NMRDA RL",
                "rate_avg_sqft": 5200,
                "circle_rate_sqft": 3400,
                "plot_rate_guntha": 4140000, # ₹41.4L/Guntha
                "property_types": "NMRDA RL Sanctioned NA Plots & 2/3 BHK Flats",
                "highlights": "Fastest growing suburb, Metro Orange Line, Podar School",
                "query": "Besa Pipla Plots Nagpur"
            },
            {
                "name": "Wardha Road, MIHAN SEZ & AIIMS",
                "zone": "Wardha Road & MIHAN SEZ",
                "authority": "NMRDA / MADC",
                "rate_avg_sqft": 4800,
                "circle_rate_sqft": 3200,
                "plot_rate_guntha": 3850000, # ₹38.5L/Guntha
                "property_types": "IT SEZ Apartments, Gated Townships & NA Plots",
                "highlights": "TCS, Infosys, AIIMS Hospital, Nagpur Airport, Orange Line Metro",
                "query": "Wardha Road MIHAN Nagpur"
            },
            {
                "name": "Butibori MIDC & Jamtha Stadium",
                "zone": "Wardha Road & MIHAN SEZ",
                "authority": "NMRDA / MIDC",
                "rate_avg_sqft": 3200,
                "circle_rate_sqft": 2100,
                "plot_rate_guntha": 2200000, # ₹22.0L/Guntha
                "property_types": "Industrial NA Plots, Row Houses & Budget Flats",
                "highlights": "VCA Jamtha Stadium, Asia's Largest Industrial Estate, NH 44",
                "query": "Butibori Jamtha Nagpur"
            },
            {
                "name": "Hingna Road, Wanadongri & ICAD",
                "zone": "Hingna & Amravati Corridor",
                "authority": "NMRDA / MIDC",
                "rate_avg_sqft": 4200,
                "circle_rate_sqft": 2800,
                "plot_rate_guntha": 2722500, # ₹27.2L/Guntha
                "property_types": "Plots, Student Housing & 2 BHK Apartments",
                "highlights": "Lokmanya Nagar Metro Terminal, Medical & Engineering Colleges",
                "query": "Hingna Wanadongri Nagpur"
            },
            {
                "name": "Wadi, Dattawadi & Gondkhairi (Samruddhi Axis)",
                "zone": "Hingna & Amravati Corridor",
                "authority": "NMRDA / NHAI",
                "rate_avg_sqft": 3900,
                "circle_rate_sqft": 2600,
                "plot_rate_guntha": 2123550, # ₹21.2L/Guntha
                "property_types": "Samruddhi Mahamarg NA Plots & Logistics Land",
                "highlights": "Samruddhi Expressway Junction, NH 53 Amravati Road",
                "query": "Wadi Gondkhairi Samruddhi Nagpur"
            },
            {
                "name": "Koradi Road & Godhani",
                "zone": "Koradi, Kamptee & Umred Belts",
                "authority": "NMRDA / NMC",
                "rate_avg_sqft": 4900,
                "circle_rate_sqft": 3100,
                "plot_rate_guntha": 3049200, # ₹30.5L/Guntha
                "property_types": "Residential Plots & Gated Row Houses",
                "highlights": "Koradi 4-Lane Highway, Mankapur Sports Complex",
                "query": "Koradi Road Nagpur"
            },
            {
                "name": "Umred Road, Dighori & Kharbi",
                "zone": "Koradi, Kamptee & Umred Belts",
                "authority": "NMRDA / NIT",
                "rate_avg_sqft": 4100,
                "circle_rate_sqft": 2700,
                "plot_rate_guntha": 2286900, # ₹22.9L/Guntha
                "property_types": "Budget NA Plots & Independent Duplexes",
                "highlights": "Outer Ring Road Interchange, Fast Plot Absorption",
                "query": "Dighori Umred Road Nagpur"
            }
        ]
    },
    "pune": {
        "city_name": "Pune Metropolitan Region (PMRDA)",
        "state": "Maharashtra",
        "planning_authorities": ["PMC", "PCMC", "PMRDA", "MIDC"],
        "zones": [
            "All Areas",
            "Core Pune & Prime",
            "West IT Corridor (Hinjewadi & Wakad)",
            "North Industrial (Moshi & Chakan)",
            "East IT Hub (Kharadi & Wagholi)",
            "South Scenic Belts (Bavdhan & Sinhagad)"
        ],
        "localities": [
            {
                "name": "Kothrud, Karve Nagar & Deccan",
                "zone": "Core Pune & Prime",
                "authority": "PMC",
                "rate_avg_sqft": 15500,
                "circle_rate_sqft": 9500,
                "plot_rate_guntha": 15790500,
                "property_types": "High-Rise Apartments & Luxury Bungalows",
                "highlights": "Pune Metro Aqua Line, Cultural Core, Top Schools",
                "query": "Kothrud Pune"
            },
            {
                "name": "Koregaon Park & Kalyani Nagar",
                "zone": "Core Pune & Prime",
                "authority": "PMC",
                "rate_avg_sqft": 19500,
                "circle_rate_sqft": 11800,
                "plot_rate_guntha": 20146500,
                "property_types": "Trump Towers, Luxury Penthouses & Villas",
                "highlights": "Ultra-posh lifestyle, Fine dining, Airport proximity",
                "query": "Koregaon Park Pune"
            },
            {
                "name": "Baner, Balewadi & Aundh",
                "zone": "Core Pune & Prime",
                "authority": "PMC",
                "rate_avg_sqft": 13400,
                "circle_rate_sqft": 8200,
                "plot_rate_guntha": 12523500,
                "property_types": "Premium Gated Communities & Techie Homes",
                "highlights": "Balewadi High Street, Mumbai-Bangalore Highway NH 48",
                "query": "Baner Balewadi Pune"
            },
            {
                "name": "Hinjewadi (Phases 1-4) & Marunji",
                "zone": "West IT Corridor (Hinjewadi & Wakad)",
                "authority": "PMRDA / MIDC",
                "rate_avg_sqft": 6800,
                "circle_rate_sqft": 4500,
                "plot_rate_guntha": 4573800, # ₹45.7L/Guntha
                "property_types": "PMRDA Sanctioned NA Plots & 1-3 BHK Flats",
                "highlights": "Rajiv Gandhi Infotech Park (Wipro, Infosys, TCS), Metro Line 3",
                "query": "Hinjewadi Marunji PMRDA Plots Pune"
            },
            {
                "name": "Wakad, Ravet & Punawale",
                "zone": "West IT Corridor (Hinjewadi & Wakad)",
                "authority": "PCMC / PMRDA",
                "rate_avg_sqft": 8200,
                "circle_rate_sqft": 5400,
                "plot_rate_guntha": 7500000,
                "property_types": "High-Rise Towers & Gated Townships",
                "highlights": "Mumbai-Pune Expressway Gateway, Dange Chowk Flyover",
                "query": "Wakad Ravet Pune"
            },
            {
                "name": "Moshi (Spine Rd), Chakan & Alandi",
                "zone": "North Industrial (Moshi & Chakan)",
                "authority": "PCMC / PMRDA",
                "rate_avg_sqft": 6800,
                "circle_rate_sqft": 4200,
                "plot_rate_guntha": 3158100, # ₹31.6L/Guntha
                "property_types": "Auto Hub Plots, Duplexes & Affordable Flats",
                "highlights": "Spine Road, Mercedes/VW/Bajaj Auto Hub, PIECC Center",
                "query": "Moshi Chakan Pune"
            },
            {
                "name": "Kharadi (EON & WTC) & Wagholi",
                "zone": "East IT Hub (Kharadi & Wagholi)",
                "authority": "PMC / PMRDA",
                "rate_avg_sqft": 11800,
                "circle_rate_sqft": 7400,
                "plot_rate_guntha": 7078500,
                "property_types": "World Trade Center Townships & PMRDA Plots",
                "highlights": "EON Free Zone, World Trade Center, Nagar Road Metro",
                "query": "Kharadi Wagholi Pune"
            },
            {
                "name": "Bavdhan, Sus & Pirangut (Lavasa Rd)",
                "zone": "South Scenic Belts (Bavdhan & Sinhagad)",
                "authority": "PMRDA / PMC",
                "rate_avg_sqft": 9800,
                "circle_rate_sqft": 6200,
                "plot_rate_guntha": 4900500, # ₹49.0L/Guntha
                "property_types": "Hillside Villas, Second Homes & Gated Land",
                "highlights": "Chandani Chowk Multilevel Flyover, Shapoorji Vanaha",
                "query": "Bavdhan Pirangut Pune"
            },
            {
                "name": "Sinhagad Road, Narhe & Nanded City",
                "zone": "South Scenic Belts (Bavdhan & Sinhagad)",
                "authority": "PMC",
                "rate_avg_sqft": 8600,
                "circle_rate_sqft": 5600,
                "plot_rate_guntha": 4573800,
                "property_types": "Nanded City Megatownship Flats & Duplexes",
                "highlights": "Scenic Khadakwasla Dam, Sinhagad Flyover",
                "query": "Sinhagad Road Nanded City Pune"
            }
        ]
    }
}

def get_city_directory(query: str) -> Optional[Dict[str, Any]]:
    """Returns city directory with micro-markets if query matches a broader city"""
    q = query.lower().strip()
    
    # Check Mumbai
    if q in ["mumbai", "mumbai mmr", "mumbai city", "mumbai property", "bombay", "navimumbai", "thane"]:
        return CITY_LOCALITIES_DIRECTORY["mumbai"]
        
    # Check Nagpur
    if q in ["nagpur", "nagpur city", "nagpur plots", "nagpur property", "nagpur flats", "nmrda nagpur"]:
        return CITY_LOCALITIES_DIRECTORY["nagpur"]
        
    # Check Pune
    if q in ["pune", "pune city", "pune flats", "pune plots", "pmrda pune", "pcmc"]:
        return CITY_LOCALITIES_DIRECTORY["pune"]

    return None
