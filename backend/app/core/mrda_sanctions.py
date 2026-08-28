"""
MRDA (Metropolitan Region Development Authority) Sanctions & RL Verification Engine
Covers:
- NMRDA (Nagpur Metropolitan Region Development Authority) - RL (Release Letter) & Gunthewari Regularization
- PMRDA (Pune Metropolitan Region Development Authority) - Town Planning & NA Layout Sanctions
- MMRDA (Mumbai Metropolitan Region Development Authority) - Regional Infrastructure & TOD Sanctions
- BMRDA / BDA (Bangalore), HMDA (Hyderabad), CMDA (Chennai), GMDA / DDA (Delhi NCR)
"""

from typing import Dict, Any, List, Optional

MRDA_REGISTRY = {
    "NMRDA": {
        "acronym": "NMRDA",
        "full_name": "Nagpur Metropolitan Region Development Authority",
        "jurisdiction": "Nagpur Metro Region (Wardha Road, Besa, Pipla, Shankarpur, Hingna, Butibori, Wadi, Koradi, Kamptee, Umred Road, Mouda, Katol)",
        "sanction_types": [
            "NMRDA RL (Release Letter / Sanction Order)",
            "Gunthewari Regularization Certificate (Act 2001 / Amendment 2021)",
            "Town Planning Scheme (TPS) Final Sanction",
            "MahaRERA Registered Layout Sanction"
        ],
        "statutory_act": "Maharashtra Regional and Town Planning (MRTP) Act 1966 & NMRDA Act 2016",
        "official_portal": "https://nmrda.org",
        "portal_name": "NMRDA Official Portal (nmrda.org)",
        "bank_loan_eligibility": "100% Eligible for Nationalized & Private Bank Loans (SBI, HDFC, ICICI, Bank of Maharashtra)",
        "verification_checklist": [
            "1. Check NMRDA RL (Release Letter) Number on the approved layout blueprint",
            "2. Verify Demand Note Payment Receipt deposited to NMRDA treasury",
            "3. Confirm 10% Open Space & Public Amenity Land handed over to NMRDA via Gift Deed",
            "4. Verify 7/12 (Saat-Baara) Extract with NA Sanction Mutation Entry (Ferfar No.)",
            "5. Verify MahaRERA Project Registration Certificate on maharera.mahaonline.gov.in"
        ],
        "buyer_caution": "Plots with ONLY Gram Panchayat approval without NMRDA RL are unapproved/illegal for construction under MRTP Act. Always demand NMRDA RL Letter."
    },
    "PMRDA": {
        "acronym": "PMRDA",
        "full_name": "Pune Metropolitan Region Development Authority",
        "jurisdiction": "Pune Metro Region (Hinjewadi 1-4, Marunji, Maan, Wakad, Ravet, Moshi, Chakan, Kharadi, Wagholi, Bavdhan, Pirangut, Undri, Sinhagad Rd)",
        "sanction_types": [
            "PMRDA Approved Layout & Building Sanction",
            "Collector NA Order with PMRDA Town Planning Clearance",
            "Ring Road & TOD (Transit Oriented Development) Sanction",
            "Gunthewari Regularization Scheme"
        ],
        "statutory_act": "MRTP Act 1966 & Pune Metropolitan Region Development Authority Act 2015",
        "official_portal": "https://pmrda.gov.in",
        "portal_name": "PMRDA Official Portal (pmrda.gov.in)",
        "bank_loan_eligibility": "100% Eligible for Home Loans & Plot Purchase + Construction Loans",
        "verification_checklist": [
            "1. Verify PMRDA Layout Sanction Letter & Town Planning (ADTP) blueprint",
            "2. Confirm development charges payment receipt to PMRDA",
            "3. Check 7/12 (Saat-Baara) extract with PMRDA approved NA 44 order",
            "4. Check Zone status on PMRDA Development Plan (DP 2021-2041): Residential (R-Zone) vs Agricultural",
            "5. Validate MahaRERA registration number"
        ],
        "buyer_caution": "Ensure land falls in Residential Zone (R-Zone / Yellow Zone) on PMRDA DP map and not in Green/Hill-top zone."
    },
    "MMRDA": {
        "acronym": "MMRDA",
        "full_name": "Mumbai Metropolitan Region Development Authority",
        "jurisdiction": "Mumbai Metropolitan Region (Mumbai, Thane, Navi Mumbai, Kalyan-Dombivli, Mira-Bhayandar, Vasai-Virar, Panvel, Alibaug, Karjat)",
        "sanction_types": [
            "MMRDA Regional Plan & Infrastructure Clearance",
            "CIDCO Tripartite Agreement / Sanction (Navi Mumbai / Airport Zone)",
            "TMC / KDMC / MBMC / VVCMC Municipal Layout Sanction",
            "Coastal Regulation Zone (CRZ) & Collector NA 44 Order"
        ],
        "statutory_act": "Mumbai Metropolitan Region Development Authority Act 1974",
        "official_portal": "https://mmrda.maharashtra.gov.in",
        "portal_name": "MMRDA Official Portal (mmrda.maharashtra.gov.in)",
        "bank_loan_eligibility": "100% Eligible for Tier-1 Bank Financing",
        "verification_checklist": [
            "1. Verify Municipal / CIDCO / MMRDA Sanctioned Architectural Plan",
            "2. Check IOD (Intimation of Disapproval) and Commencement Certificate (CC)",
            "3. Title Search Report (30-Year Search) & Non-Encumbrance Certificate",
            "4. MahaRERA registration and quarterly disclosure updates",
            "5. Society Registration or Tripartite Deed"
        ],
        "buyer_caution": "For plots in Alibaug, Karjat, or Virar, verify Collector NA conversion and ensure layout is outside CRZ-1 / Eco-Sensitive buffer."
    },
    "HMDA": {
        "acronym": "HMDA",
        "full_name": "Hyderabad Metropolitan Development Authority",
        "jurisdiction": "Hyderabad Metro Region (Gachibowli, Tellapur, Kokapet, Mokila, Shamshabad, Kompally, Medchal)",
        "sanction_types": ["HMDA Approved Gated Layout", "LRS (Layout Regularization Scheme)", "TS-bPASS Building Permission"],
        "statutory_act": "HMDA Act 2008 & Telangana Urban Areas Act",
        "official_portal": "https://www.hmda.org.in",
        "portal_name": "HMDA Official Portal (hmda.org.in)",
        "bank_loan_eligibility": "100% Eligible for Bank Loans",
        "verification_checklist": [
            "1. Check HMDA Technical Sanction & Final Layout Approval (LP Number)",
            "2. Verify Dharani portal passbook and digital title deed",
            "3. Confirm 10% open space & park area registered to HMDA/Local body",
            "4. Verify TS-RERA registration"
        ],
        "buyer_caution": "Unapproved panchayat layouts without HMDA LP number cannot be registered or mortgaged."
    },
    "BDA": {
        "acronym": "BDA / BMRDA",
        "full_name": "Bangalore Development Authority / BMRDA",
        "jurisdiction": "Bangalore Urban & Rural (Whitefield, Sarjapur, Electronic City, Yelahanka, Devanahalli)",
        "sanction_types": ["BDA Approved Layout", "BMRDA / BIAPPA Sanctioned Plot", "A-Khata Property Certificate"],
        "statutory_act": "Bangalore Development Authority Act 1976",
        "official_portal": "https://bdabangalore.org",
        "portal_name": "BDA Portal (bdabangalore.org)",
        "bank_loan_eligibility": "A-Khata BDA/BMRDA layouts eligible for 80-85% bank funding",
        "verification_checklist": [
            "1. Verify BDA / BMRDA / BIAPPA Layout Approval Order",
            "2. Ensure e-Khata (A-Khata from BBMP/BDA) is clear",
            "3. Check Bhoomi RTC & Mutation status",
            "4. Verify K-RERA registration"
        ],
        "buyer_caution": "Avoid B-Khata or unapproved revenue site layouts as they face demolition risks and lack bank loans."
    }
}

def get_mrda_approval_details(query_or_location: str, state_name: str = "Maharashtra") -> Dict[str, Any]:
    """Returns official MRDA sanction details based on location"""
    q = query_or_location.lower()
    
    # 1. Exact Acronym Matching (Highest Priority)
    if "pmrda" in q:
        return MRDA_REGISTRY["PMRDA"]
    if "nmrda" in q:
        return MRDA_REGISTRY["NMRDA"]
    if "mmrda" in q:
        return MRDA_REGISTRY["MMRDA"]
    if "hmda" in q:
        return MRDA_REGISTRY["HMDA"]
    if "bmrda" in q or "bda" in q:
        return MRDA_REGISTRY["BDA"]

    # 2. City & Region Specific Matching
    # Pune PMRDA
    if any(w in q for w in ["pune", "hinjewadi", "marunji", "maan", "wakad", "ravet", "moshi", "chakan", "kharadi", "wagholi", "bavdhan", "pirangut", "undri", "kothrud", "baner", "hadapsar"]):
        return MRDA_REGISTRY["PMRDA"]

    # Nagpur NMRDA
    if any(w in q for w in ["nagpur", "wardha", "besa", "pipla", "shankarpur", "mihan", "butibori", "hingna", "wadi", "koradi", "kamptee", "umred", "dighori", "manish nagar"]):
        return MRDA_REGISTRY["NMRDA"]
        
    # Mumbai MMRDA
    if any(w in q for w in ["mumbai", "thane", "navi mumbai", "kharghar", "panvel", "ulwe", "kalyan", "dombivli", "alibaug", "karjat", "virar", "bhandup", "bandra", "andheri", "worli", "cidco"]):
        return MRDA_REGISTRY["MMRDA"]
        
    # Hyderabad HMDA
    if any(w in q for w in ["hyderabad", "gachibowli", "tellapur", "kokapet", "mokila", "shamshabad", "secunderabad", "hitec"]):
        return MRDA_REGISTRY["HMDA"]
        
    # Bangalore BDA/BMRDA
    if any(w in q for w in ["bangalore", "bengaluru", "whitefield", "sarjapur", "yelahanka", "devanahalli", "electronic city", "bellandur"]):
        return MRDA_REGISTRY["BDA"]
        
    # Default fallback by state
    if "karnataka" in state_name.lower():
        return MRDA_REGISTRY["BDA"]
    if "telangana" in state_name.lower():
        return MRDA_REGISTRY["HMDA"]
    return MRDA_REGISTRY["NMRDA"] if "nagpur" in q else (MRDA_REGISTRY["PMRDA"] if "pune" in q else MRDA_REGISTRY["MMRDA"])
        
    # Default to Maharashtra PMRDA/NMRDA template
    return MRDA_REGISTRY["NMRDA"] if "nagpur" in q else (MRDA_REGISTRY["PMRDA"] if "pune" in q else MRDA_REGISTRY["MMRDA"])
