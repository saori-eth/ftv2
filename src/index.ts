import { ethers } from "ethers";
const { DISCORD_WEBHOOK, BASE_WS, JWT } = process.env;

if (!DISCORD_WEBHOOK || !BASE_WS) throw new Error("Missing env vars");
const CLUBS_ADDRESS = "0x201e95f275F39a5890C976Dc8A3E1b4Af114E635";
const clubLink = "https://www.friend.tech/clubs/";
const usersAPI = "https://prod-api.kosetto.com/users/";
const buyBotLink = "https://ft-buy.vercel.app/";
const CLUB_API = "https://prod-api.kosetto.com/clubs/";
const headers = {
  Authorization: `${JWT}`,
};

const provider = new ethers.WebSocketProvider(BASE_WS);

const clubs = new ethers.Contract(
  CLUBS_ADDRESS,
  ["event CoinLaunched(uint256 indexed id, address indexed creator)"],
  provider
);

const blacklist = [
  "0x0b28bdce48a29635cd7dc3a51a66d103e564c564",
  "0xba615b00be84bc315d483f08cd94c84ce283caac",
  "0xf9b7cf4be6f4cde37dd1a5b75187d431d94a4fcc",
].map((str) => str.toLowerCase());

clubs.on("CoinLaunched", async (id, creator) => {
  if (blacklist.includes(creator.toLowerCase())) return;
  try {
    const clubRes = await fetch(CLUB_API + id, { headers });
    const { clubName, clubDescription } = await clubRes.json();
    if (clubName === undefined) return;
    const creatorRes = await fetch(usersAPI + creator);
    const {
      twitterUsername,
      holderCount,
      watchlistCount,
      ftUsername,
      ftPfpUrl,
    } = await creatorRes.json();
    console.log(clubName, clubDescription);
    if (holderCount < 20 || holderCount === undefined) return;
    const discordMessage = {
      content: `
      ===================================================
      \n🚀 New Frientech Group Launched! 🚀
      [Club](${clubLink}${id}) ${id}
      Club Name: ${clubName}
      Club Description: ${clubDescription}
      \n Creator details
      [pfp](${ftPfpUrl})
      👥 ft username: ${ftUsername}
      👤 twitter username: ${twitterUsername} [twitter](https://x.com/${twitterUsername})
      📈 Holder Count: ${holderCount}
      🔍 Watchlist Count: ${watchlistCount}
      \n🤖 [Buy Bot](${buyBotLink}${id}) ${id}
      `,
    };
    console.log(discordMessage);
    fetch(DISCORD_WEBHOOK, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(discordMessage),
    });
  } catch (error) {
    console.error(error);
  }
});

console.log("listening for CoinLaunched events...");
