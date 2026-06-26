const PROJECT_ID = 'omhonria-pauline-birthday';
const API_KEY = 'AIzaSyDgrVJyduLGrTdDAG0ASZ44E5x8qfMI0Vs';
const BASE_URL = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents`;

const SEED_WISHES = [
  {
    name: 'Praise Odine',
    relationship: 'Leader',
    wish:
      'A Mother \n\n An Inspiration \n\n A Model\n\n\nThank you very much Mummy for being a source of inspiration and motivation to us all. You have been a support system to our Father and that is something we can never appreciate you enough for.\n\nThank you for everything you represent to us at Psalmist Nation Tabernacle.\n\nI sincerely HONOR and APPRECIATE you Ma\n\nHappy Birthday Mummy!',
  },
  {
    name: 'Elizabeth',
    relationship: 'Leader',
    wish:
      "Happy Birthday Mum\n\nThank You for being ALL shades of Amazing! You've embodied Wisdom and Strength in a manner that's unfathomable, God has Blessed You greatly, I Love YOU!!!\n\nHAPPY BIRTHDAY MUM",
  },
  {
    name: 'Stephanie',
    relationship: 'Leader',
    wish:
      "Happy Birthday Mama ❤️🥹\n\nToday I celebrate not just your birthday, but the gift that you are to so many lives including mine. I am grateful to God for the privilege of knowing you, learning from you, and experiencing your love, prayers, and guidance.\n\nMama, thank you for being a vessel of God's love and for the way you carry people in your heart. Thank you for your sacrifices, your intentionality, your prayers, and for the many ways you pour into me  even when I didn't see.\n\nYou have been a blessing, a mother, and an example in ways words cannot fully express. I pray that this new year brings you deeper encounters with God, renewed strength, joy that overflows, and the fulfilment of every purpose He has placed inside you.\n\nMay the Lord continue to honour you, enlarge your territory, and surround you with the same love and grace you have poured into others.\n\nI loveeeeeeeeeeeeeeeee and celebrate you so much Mama. \nHappy birthday mummmmmmmyyyyyyy😁❤️🥳",
  },
  {
    name: 'Samson Odunayo',
    relationship: 'Leader',
    wish:
      "Happy Birthday, Mama\n\nOn this special day, I celebrate the wonderful gift that you are to the body of Christ and to everyone privileged to know you. Your kindness, wisdom, prayers, and motherly love have touched many lives and continue to be a blessing to us all.\n\nMay God bless you with good health, overflowing joy, renewed strength, and many more years of grace and fulfillment. May He reward your labor of love, enlarge your influence, and grant every desire of your heart according to His perfect will.\n\nThank you for being a source of encouragement, inspiration, and spiritual support. We are grateful for your life and all that God is doing through you.\n\nHappy Birthday, Ma. May your new year be filled with God's favor, peace, and abundant blessings.\n\nWith love and heartfelt prayers.",
  },
  {
    name: 'Edith',
    relationship: 'Leader',
    wish:
      'Mama!!!\nHappy Birthday Ma\nThank you for your love ,care, and support.\nThank you for all you do, Ma \nThe Lord bless and increase you greatly, Ma',
  },
  {
    name: 'Goddey',
    relationship: 'Leader',
    wish:
      'Happy Birthday Mummy,\n\nThis joy gave us life,\nThis voice gave us peace. \nYour words like sweetener\nand like line marking \nour path to wisdom. \n\nYour name gave voice \nto speak joy in our \nmoment. \n\nA man sought strength \nand found one that can \nhold him;\nHe built and found one\nwho can beautify. \n\nThank you for accepting us and loving us ma. Thank you for always checking up and helping us to serve well. \n\nHappy Birthday Mummy 🙇‍♂️❤️🙇‍♂️',
  },
  {
    name: 'Joshua John',
    relationship: 'Leader',
    wish:
      "Happy Birthday Mama,\n \nWe thank God for your life and for the blessing you have been to our church family through your love and dedication. Your presence here continue to inspire us. May the Lord bless you with divine health, overflowing joy, and abundant grace in this new year of your life. More Grace and Strength. May the Lord continue to guide your path. Wishing you a wonderful birthday and many more years of God's favor and goodness.",
  },
  {
    name: 'Nmesoma Okafor',
    relationship: 'Leader',
    wish:
      'Happiest birthday, Mama❤️🎊 \nThank you for your gentle leadership, steadfast faith, and the love you pour into this church. I pray God enlarges your territory, renews your strength like the eagle’s, and fills this new year with fresh grace, peace, and supernatural favour🔥🤍\nYou are deeply appreciated Ma🙇🏾‍♀️',
  },
  {
    name: 'Victor oriade',
    relationship: 'Leader',
    wish:
      "God is good!. On this special day, I pray that the Lord will continually uphold you with His grace, strengthen you for greater exploits, and fill your life with unending joy, peace, and divine favor. May your new year be crowned with blessings, good health, and remarkable testimonies. Wishing you many more glorious and fruitful years in Jesus' name.",
  },
  {
    name: 'Boluwatife Maria',
    relationship: 'Leader',
    wish:
      'Happy Birthday, Mama! 🤍\n\nThank you for the way you support Papa and the ministry with such grace and strength. Thank you for your love for the brethren, your calm spirit, and your beautiful smile that always brings warmth.\n\nThank you also for being an example of prayerfulness and dedication. Watching your commitment to God is truly inspiring.\n\nI pray that the Lord continually strengthens you, increases His grace upon your life, and fills your days with joy.\n\nHappy Birthday once again, Mama. 🎉',
  },
];

function toFirestoreFields(wish, timestampIso) {
  return {
    fields: {
      name: { stringValue: wish.name },
      relationship: { stringValue: wish.relationship },
      wish: { stringValue: wish.wish },
      timestamp: { timestampValue: timestampIso },
    },
  };
}

async function listWishes() {
  const url = `${BASE_URL}/wishes?key=${API_KEY}&pageSize=1`;
  const res = await fetch(url);
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error?.message || `List failed (${res.status})`);
  }

  return data.documents?.length || 0;
}

async function addWish(wish, timestampIso) {
  const url = `${BASE_URL}/wishes?key=${API_KEY}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(toFirestoreFields(wish, timestampIso)),
  });
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error?.message || `Create failed (${res.status})`);
  }

  return data;
}

async function seed() {
  const existing = await listWishes();
  if (existing > 0) {
    console.log(`Skipping seed: ${existing}+ wish(es) already in Firestore.`);
    return;
  }

  const baseTime = Date.now() - SEED_WISHES.length * 60_000;

  for (let i = 0; i < SEED_WISHES.length; i++) {
    const wish = SEED_WISHES[i];
    const timestampIso = new Date(baseTime + (SEED_WISHES.length - i) * 60_000).toISOString();

    await addWish(wish, timestampIso);
    console.log(`Seeded: ${wish.name}`);
  }

  console.log(`Done — ${SEED_WISHES.length} wishes added.`);
}

seed().catch((err) => {
  console.error('Seed failed:', err.message || err);
  process.exit(1);
});