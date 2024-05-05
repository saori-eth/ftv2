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
  let clubName, clubDescription;
  try {
    const clubRes = await fetch(CLUB_API + id, { headers });
    const clubInfo = await clubRes.json();
    clubName = clubInfo.clubName;
    clubDescription = clubInfo.clubDescription;
  } catch (error) {
    console.log("failed to fetch club details", id, creator);
  }
  let twitterUsername, holderCount, watchlistCount, ftUsername, ftPfpUrl;
  try {
    const creatorRes = await fetch(usersAPI + creator);
    const creatorInfo = await creatorRes.json();
    twitterUsername = creatorInfo.twitterUsername;
    holderCount = creatorInfo.holderCount;
    watchlistCount = creatorInfo.watchlistCount;
    ftUsername = creatorInfo.ftUsername;
    ftPfpUrl = creatorInfo.ftPfpUrl;
  } catch (error) {
    console.log("failed to fetch creator details", id, creator);
  }
  if (holderCount < 20 || holderCount === undefined) return; // not enough holders
  const discordMessage = {
    content: `
      ===================================================
      \n🚀 New Frientech Group Launched! 🚀
      [Club](${clubLink}${id}) ${id}
      Club Name: ${clubName || "N/A"}
      Club Description: ${clubDescription || "N/A"}
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
  try {
    fetch(DISCORD_WEBHOOK, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(discordMessage),
    });
  } catch (error) {
    console.log("failed to send discord message", id, creator);
    console.error(error);
  }
});

console.log("listening for CoinLaunched events...");
