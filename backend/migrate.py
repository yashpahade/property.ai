import json
import asyncio
from app.db.session import engine
from app.models import Property, Locality, Base

async def migrate_data():
    print("Creating tables...")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    
    print("Loading mockData.json...")
    with open('mockData.json', 'r') as f:
        data = json.load(f)
    
    properties = data.get('MOCK_PROPERTIES', [])
    localities = data.get('MOCK_LOCALITIES', [])
    
    from sqlalchemy.ext.asyncio import async_sessionmaker
    async_session = async_sessionmaker(engine, expire_on_commit=False)
    
    async with async_session() as session:
        print(f"Inserting {len(localities)} localities...")
        for loc in localities:
            db_loc = Locality(
                name=loc['name'],
                city=loc['city'],
                avg_price=loc['avgPricePerSqft'],
                ai_score=loc['aiScore'],
                # For SQLite, store as JSON (or leave null if not needed immediately)
                embedding=None
            )
            session.add(db_loc)
        
        print(f"Inserting {len(properties)} properties...")
        for prop in properties:
            db_prop = Property(
                title=prop['title'],
                locality=prop['locality'],
                city=prop['city'],
                price=prop['price'],
                type=prop['propertyType'],
                bhk=prop['bhk'],
                area=prop['area'],
                amenities=prop['amenities']
            )
            session.add(db_prop)
        
        await session.commit()
        print("Migration successful!")

if __name__ == "__main__":
    asyncio.run(migrate_data())
