const fs = require('fs');

// Fix localities page
const locPath = 'src/app/localities/[id]/page.tsx';
let locContent = fs.readFileSync(locPath, 'utf8');

locContent = locContent.replace(/<div style={{ fontSize: '24px' }}>🏥<\/div>/g, '<img src="/icons/hospital.jpg" style={{ width: "48px", height: "48px", borderRadius: "12px", objectFit: "cover" }} alt="Hospital" />');
locContent = locContent.replace(/<div style={{ fontSize: '24px' }}>🏫<\/div>/g, '<img src="/icons/school.jpg" style={{ width: "48px", height: "48px", borderRadius: "12px", objectFit: "cover" }} alt="School" />');
locContent = locContent.replace(/<div style={{ fontSize: '24px' }}>🎓<\/div>/g, '<img src="/icons/college.jpg" style={{ width: "48px", height: "48px", borderRadius: "12px", objectFit: "cover" }} alt="College" />');
locContent = locContent.replace(/<div style={{ fontSize: '24px' }}>💪<\/div>/g, '<img src="/icons/gym.jpg" style={{ width: "48px", height: "48px", borderRadius: "12px", objectFit: "cover" }} alt="Gym" />');
locContent = locContent.replace(/<div style={{ fontSize: '24px' }}>🍽️<\/div>/g, '<img src="/icons/restaurant.jpg" style={{ width: "48px", height: "48px", borderRadius: "12px", objectFit: "cover" }} alt="Restaurant" />');
locContent = locContent.replace(/<div style={{ fontSize: '24px' }}>🛍️<\/div>/g, '<img src="/icons/mall.jpg" style={{ width: "48px", height: "48px", borderRadius: "12px", objectFit: "cover" }} alt="Mall" />');

fs.writeFileSync(locPath, locContent);
console.log('Fixed localities page emojis');

// Fix ChatBot page
const chatPath = 'src/components/ChatBot.tsx';
let chatContent = fs.readFileSync(chatPath, 'utf8');

chatContent = chatContent.replace(/👋/g, '');
chatContent = chatContent.replace(/🏆/g, '');
chatContent = chatContent.replace(/💡/g, '');
chatContent = chatContent.replace(/📊/g, '');
chatContent = chatContent.replace(/🔎/g, '');
chatContent = chatContent.replace(/💰/g, '');
chatContent = chatContent.replace(/🏫/g, '');
chatContent = chatContent.replace(/📈/g, '');

fs.writeFileSync(chatPath, chatContent);
console.log('Fixed chatbot page emojis');
