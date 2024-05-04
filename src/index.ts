import { ethers } from "ethers";
const { DISCORD_WEBHOOK, BASE_WS } = process.env;

if (!DISCORD_WEBHOOK || !BASE_WS) throw new Error("Missing env vars");
const CLUBS_ADDRESS = "0x201e95f275F39a5890C976Dc8A3E1b4Af114E635";
const clubLink = "https://www.friend.tech/clubs/";
const usersAPI = "https://prod-api.kosetto.com/users/";
const buyBotLink = "https://ft-buy.vercel.app/";
const provider = new ethers.WebSocketProvider(BASE_WS);

const clubs = new ethers.Contract(
  CLUBS_ADDRESS,
  ["event CoinLaunched(uint256 indexed id, address indexed creator)"],
  provider
);

clubs.on("CoinLaunched", async (id, creator) => {
  try {
    const res = await fetch(usersAPI + creator);
    const {
      twitterUsername,
      holderCount,
      watchlistCount,
      ftUsername,
      ftPfpUrl,
    } = await res.json();
    if (holderCount < 20 || holderCount === undefined) return;
    const discordMessage = {
      content: `
      =================================================================================
      🚀 New Frientech Group Launched! 🚀
      \n [Club](${clubLink}${id}) ${id}
      \n\n Creator details
      \n🖼️ [pfp](${ftPfpUrl})
      \n👥 ft username: ${ftUsername}
      \n👤 twitter username: ${twitterUsername} [twitter](https://x.com/${twitterUsername})
      \n📈 Holder Count: ${holderCount}
      \n🔍 Watchlist Count: ${watchlistCount}
      \n\n🤖 [Buy Bot](${buyBotLink}${id})
      =================================================================================
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
