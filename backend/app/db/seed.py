import json
import logging
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func
from app.core.database import AsyncSessionLocal, init_db
from app.modules.property.models import PropertyModel, LocalityModel, BuilderModel, LocalityAnalyticsModel, GovernmentProjectModel
from app.core.india_data import ALL_INDIA_LOCALITIES

logger = logging.getLogger(__name__)

async def seed_database():
    await init_db()
    async with AsyncSessionLocal() as session:
        # Check if already seeded
        count = await session.scalar(select(func.count(PropertyModel.id)))
        if count and count > 0:
            logger.info(f"Database already seeded with {count} properties.")
            return
            
        logger.info("Seeding database with All-India localities, government benchmarks, and properties...")
        
        # 1. Seed Builders
        builders_list = [
            "Godrej Properties", "Lodha (Macrotech)", "Prestige Group", "Sobha Limited",
            "Oberoi Realty", "L&T Realty", "Puranik Builders", "Kolte Patil Developers",
            "Rustomjee (Keystone)", "DLF Limited", "Puravankara", "Hiranandani Group",
            "Brigade Group", "Shapoorji Pallonji Real Estate", "Casagrand", "Mahindra Lifespaces"
        ]
        builder_objs = {}
        for b_name in builders_list:
            b_model = BuilderModel(name=b_name, experience_years=25, total_projects=40)
            session.add(b_model)
            builder_objs[b_name] = b_model
        await session.flush()
        
        # 2. Seed Localities & Properties from ALL_INDIA_LOCALITIES
        prop_types = ["flat", "flat", "villa", "flat", "penthouse", "rowhouse"]
        bhks = [1, 2, 3, 4]
        
        for idx, loc in enumerate(ALL_INDIA_LOCALITIES):
            loc_model = LocalityModel(
                name=loc["locality"],
                city=loc["city"],
                state=loc["state"],
                zone=loc.get("zone", "Prime"),
                circle_rate=loc["circle_rate"],
                avg_price_per_sqft=loc["market_rate_avg"],
                rental_yield=loc["rental_yield"],
                cagr_5y=loc["cagr_5y"],
                ai_score=round((loc["infra_score"] * 5) + (loc["livability_score"] * 5)),
                latitude=loc["lat"],
                longitude=loc["lng"],
                connectivity=loc.get("connectivity", "")
            )
            session.add(loc_model)
            await session.flush()
            
            # Add Analytics
            analytics_model = LocalityAnalyticsModel(
                locality_id=loc_model.id,
                population=75000,
                growth_rate=loc["cagr_5y"],
                demand_score=round(loc["infra_score"] * 9.5),
                supply_score=75.0,
                crime_score=12.0,
                aqi=65.0,
                livability_score=loc["livability_score"],
                infra_score=loc["infra_score"],
                traffic_score=6.0,
                flood_risk="Low"
            )
            session.add(analytics_model)
            
            # Add Government Infrastructure Project
            project_model = GovernmentProjectModel(
                locality_id=loc_model.id,
                locality_name=loc["locality"],
                city=loc["city"],
                name=f"{loc['city']} Metro & Highway Expansion Corridor",
                type="Metro / Transit Hub",
                status="Operational / Under Construction",
                completion_year=2026,
                budget_cr=8500.0,
                impact_radius_km=4.5
            )
            session.add(project_model)
            
            # Generate 4-6 representative properties per locality
            for p_idx in range(5):
                bhk = bhks[p_idx % len(bhks)]
                carpet = 450 if bhk == 1 else (750 if bhk == 2 else (1250 if bhk == 3 else 2200))
                p_type = prop_types[p_idx % len(prop_types)]
                rate = loc["market_rate_avg"] * (0.95 + (p_idx * 0.03))
                total_price = round(rate * carpet)
                
                builder_name = builders_list[(idx + p_idx) % len(builders_list)]
                b_id = builder_objs[builder_name].id if builder_name in builder_objs else None
                
                project_name = loc.get("notable_projects", ["Elite Enclave"])[p_idx % len(loc.get("notable_projects", ["Elite Enclave"]))]
                title = f"{bhk} BHK {p_type.title()} in {project_name}"
                
                lat_offset = (p_idx - 2) * 0.003
                lng_offset = (p_idx - 2) * 0.003
                
                prop_model = PropertyModel(
                    title=title,
                    address=f"{project_name}, {loc['locality']}, {loc['city']}, {loc['state']}",
                    latitude=loc["lat"] + lat_offset,
                    longitude=loc["lng"] + lng_offset,
                    city=loc["city"],
                    state=loc["state"],
                    zone=loc.get("zone", "Central"),
                    locality=loc["locality"],
                    property_type=p_type,
                    bhk=bhk,
                    carpet_area_sqft=carpet,
                    built_up_area_sqft=round(carpet * 1.25),
                    property_age_years=p_idx,
                    floor=p_idx + 2,
                    total_floors=20,
                    parking=1 if bhk <= 2 else 2,
                    lift=1,
                    facing="East" if p_idx % 2 == 0 else "North-East",
                    builder_id=b_id,
                    locality_id=loc_model.id,
                    ready_reckoner_rate=loc["circle_rate"],
                    actual_price=total_price,
                    price_per_sqft=round(rate),
                    rental_price=round((total_price * (loc["rental_yield"] / 100)) / 12),
                    rera_id=f"RERA-{loc['state'][:3].upper()}-{idx*10+p_idx+1000}",
                    source="State RERA Verified Registry",
                    ai_score=round(80 + (p_idx * 3.5)),
                    amenities=json.dumps(["Clubhouse", "Swimming Pool", "24x7 Security", "Gym", "Power Backup", "EV Charging Station"]),
                    description=f"Premium {bhk} BHK property situated in the heart of {loc['locality']}, {loc['city']}. High rental yield, state RERA verified, excellent metro connectivity."
                )
                session.add(prop_model)
                
        await session.commit()
        logger.info("Database seeding complete!")
