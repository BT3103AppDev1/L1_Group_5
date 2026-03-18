import admin from 'firebase-admin';
import fs from 'fs';

// Load service account JSON
const serviceAccount = JSON.parse(fs.readFileSync('./serviceAccountKey.json', 'utf8'));

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});
const db = admin.firestore();

// Load GeoJSON
const geojson = JSON.parse(fs.readFileSync('./EatingEstablishments.geojson', 'utf8'));

// Helper to extract fields from Description HTML
function extractField(desc, field) {
  const regex = new RegExp(`<th>${field}<\\/th>\\s*<td>(.*?)<\\/td>`, 'i');
  const match = desc.match(regex);
  return match ? match[1].replace(/<.*?>/g, '').trim() : '';
}

async function importRestaurants() {
  for (const feature of geojson.features) {
    const desc = feature.properties.Description;
    const restaurant = {
      restaurantId: extractField(desc, 'LIC_NO'),
      name: extractField(desc, 'BUSINESS_NAME'),
      nameLower: extractField(desc, 'BUSINESS_NAME').toLowerCase(),
      address: `${extractField(desc, 'BLK_HOUSE')} ${extractField(desc, 'STR_NAME')} #${extractField(desc, 'UNIT_NO')}, S${extractField(desc, 'POSTCODE')}`,
      location: {
        lat: feature.geometry.coordinates[1],
        lng: feature.geometry.coordinates[0]
      },
      isHalal: false,
      isVegetarian: false,
      cuisineTypes: [],
      isActive: true,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      openingHours: '',
    };

    await db.collection('restaurants').doc(restaurant.restaurantId).set(restaurant);
    console.log(`Imported: ${restaurant.name}`);
  }
  console.log('All done!');
}

importRestaurants();