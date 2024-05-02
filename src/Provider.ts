import { ethers } from "ethers";
const { BASE_WS } = process.env;

if (!BASE_WS) console.error("BASE_WS is not set");

export class Provider {
  public provider: ethers.WebSocketProvider;
  constructor() {
    this.provider = new ethers.WebSocketProvider(BASE_WS);
  }
}
