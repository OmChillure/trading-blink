import {
  ActionGetResponse,
  ActionPostRequest,
  ActionPostResponse,
  ACTIONS_CORS_HEADERS,
} from "@solana/actions";
import {
  Transaction,
  clusterApiUrl,
  Connection,
  PublicKey,
  SystemProgram,
} from "@solana/web3.js";
// import { NextActionLink } from "@solana/actions-spec";
// import { useSearchParams } from "next/navigation";
// const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
// import { getCompletedAction, getNextAction } from "@/app/helper";

//{ GET request f/r BLINKS}
export async function GET(request: Request) {
  const responseBody: ActionGetResponse = {
    type: "action",
    title: "Bid On Solana",
    icon: "https://media1.tenor.com/m/r0viDQikSWcAAAAC/samoyedcoin-solana.gif", 
    description: `Predict if price of SOLANA will go up or down in the next 20 seconds.

👉Current Price of SOLANA: ${await getSolanaPrice()}
    `,
    label: "Make Your Choice",
    links: {
      actions: [
        {
          label: "Up",
          href: `${request.url}?action=up`,
        },
        {
          label: "Down",
          href: `${request.url}?action=down`,
        },
      ],
    },
  };
  return Response.json(responseBody, { headers: ACTIONS_CORS_HEADERS });
}


//{POST request f/r BLINKS}
export async function POST(request: Request) {
  const postRequest: ActionPostRequest = await request.json();
  const userPubkey = postRequest.account;
  const user = new PublicKey(userPubkey);

  const url = new URL(request.url);
  const action = url.searchParams.get("action") || "up";

  const initialPrice = await getSolanaPrice();
  console.log(initialPrice);

  await delay(20000);

  const newPrice = await getSolanaPrice();
  console.log(newPrice);

  const upPrice = action === "up" ? newPrice > initialPrice : newPrice < initialPrice;
  const downPrice = action === "down" ? newPrice < initialPrice : newPrice > initialPrice;

  //{For Up_price}
  if (upPrice) {
    const ix = SystemProgram.transfer({
      fromPubkey: user,
      toPubkey: new PublicKey("CovFLcdngBTA2N9jbd3kRuid94HzSzF2NJ5Y54bAJSNd"),
      lamports: 1,
    });
    
    //{Transaction}
    const tx = new Transaction().add(ix);
    tx.feePayer = user;
    const bh = (await new Connection(clusterApiUrl("devnet")).getLatestBlockhash({commitment: "finalized",})).blockhash;
    tx.recentBlockhash = bh;
    const serialTX = tx.serialize({requireAllSignatures: false,verifySignatures: false,}).toString("base64");

    const response: ActionPostResponse = {
      transaction: serialTX,
      message: "You win! Solana's price moved as you predicted.",
    };

    return Response.json(response, { headers: ACTIONS_CORS_HEADERS });
  } else {
    const response: ActionPostResponse = {
      message: "You lose! Solana's price did not move as you predicted.",
      transaction: "",
    };
    return Response.json(response, { headers: ACTIONS_CORS_HEADERS });
  }


  //{For Down_price}
  if (downPrice) {
    const ix = SystemProgram.transfer({
      fromPubkey: user,
      toPubkey: new PublicKey("CovFLcdngBTA2N9jbd3kRuid94HzSzF2NJ5Y54bAJSNd"),
      lamports: 1,
    });
    
    //{Transaction}
    const tx = new Transaction().add(ix);
    tx.feePayer = user;
    const bh = (await new Connection(clusterApiUrl("devnet")).getLatestBlockhash({commitment: "finalized",})).blockhash;
    tx.recentBlockhash = bh;
    const serialTX = tx.serialize({requireAllSignatures: false,verifySignatures: false,}).toString("base64");

    const response: ActionPostResponse = {
      transaction: serialTX,
      message: "You win! Solana's price moved as you predicted.",
    };

    return Response.json(response, { headers: ACTIONS_CORS_HEADERS });
  } else {
    const response: ActionPostResponse = {
      message: "You lose! Solana's price did not move as you predicted.",
      transaction: ""
    };

    return Response.json(response, { headers: ACTIONS_CORS_HEADERS });
  }
}



//{ CORS for options}
export async function OPTIONS(request: Request) {
  return Response.json(null, { headers: ACTIONS_CORS_HEADERS });
}

//{ Below function to get solana price}
async function getSolanaPrice(): Promise<number> {
  const response = await fetch(
    `https://min-api.cryptocompare.com/data/price?fsym=SOL&tsyms=USD`,
  );
  const data = await response.json();
  return data.USD;
}


function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
