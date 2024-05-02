import { ethers } from "ethers";
const { DISCORD_WEBHOOK, BASE_WS } = process.env;

if (!DISCORD_WEBHOOK) console.error("DISCORD_WEBHOOK is not set");
const CLUBS_ADDRESS = "0x31c116ee1a684E701A7b9bFDA0afE210eCB9E188";
const usersAPI = "https://prod-api.kosetto.com/users/";
const followersAPI = "http://http://127.0.0.1:5000/followers/";
const provider = new ethers.WebSocketProvider(BASE_WS);

const factory = new ethers.Contract(
  CLUBS_ADDRESS,
  ["event CoinLaunched(uint256 indexed id, address indexed creator)"],
  provider
);

factory.on("CoinLaunched", async (id, creator) => {
  console.log("CoinLaunched", id, creator);
  try {
    const res = await fetch(usersAPI + creator);
    const data = await res.json();
    const { twitterUsername, holderCount, watchlistCount, userBio } = data;
    const twitterRes = await fetch(followersAPI + twitterUsername);
    const twitterData = await twitterRes.json();
    const { description, followers } = twitterData;
    const discordMessage = {
      content: `
      🚀 New Coin Launched! 🚀
      \n\n👤 Creator: ${twitterUsername} [twitter](https://x.com/${twitterUsername})
      \n\n📈 Holder Count: ${holderCount}
      \n\n🔍 Watchlist Count: ${watchlistCount}
      \n\n📝 Bio: ${userBio}
      \n\n📝 Twitter Description: ${description}
      \n\n👥 Followers: ${followers}`,
    };
    fetch(DISCORD_WEBHOOK, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(discordMessage),
    });
  } catch (error) {
    console.error(error);
    fetch(DISCORD_WEBHOOK, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ content: "An error occurred" }),
    });
  }
});

console.log("listening for CoinLaunched events...");
