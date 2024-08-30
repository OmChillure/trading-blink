import { NextRequest, NextResponse } from "next/server";
import { Transaction, PublicKey, SystemProgram, Connection, clusterApiUrl, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { ACTIONS_CORS_HEADERS, createPostResponse, ActionGetResponse } from "@solana/actions";
import { getCompletedAction, getNextAction } from "@/app/helper";

const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

export async function GET(req: NextRequest) {
  let response: ActionGetResponse = {
    type: "action",
    icon: `https://media1.tenor.com/m/E2Uhjmd2YDIAAAAC/multiversx-srb.gif`,
    title: "Crypto Price Prediction",
    description: "Predict the price movement of Ethereum or Solana!",
    label: "Start Prediction",
    links: {
      actions: [
        {
          label: "Bid on Ethereum",
          href: "/api/action?chain=ethereum&stage=initial",
        },
        {
          label: "Bid on Solana",
          href: "/api/action?chain=solana&stage=initial",
        },
      ],
    },
  };

  return NextResponse.json(response, {
    headers: ACTIONS_CORS_HEADERS,
  });
}

export const OPTIONS = GET;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as { account: string; signature: string };

    const { searchParams } = new URL(req.url);
    const chain = searchParams.get("chain") as string;
    const stage = searchParams.get("stage") as string;

    let iconUrl = `https://media1.tenor.com/m/E2Uhjmd2YDIAAAAC/multiversx-srb.gif`; 

    if (chain === "ethereum") {
      iconUrl = `https://media1.tenor.com/m/Gw2Agodo6ZEAAAAC/ethereum-eth.gif`;
    } else if (chain === "solana") {
      iconUrl = `https://media1.tenor.com/m/r0viDQikSWcAAAAC/samoyedcoin-solana.gif`;
    }

    if (!chain || !stage) {
      return NextResponse.json({ error: "Chain and stage are required" }, {
        status: 400,
        headers: ACTIONS_CORS_HEADERS,
      });
    }

    const sender = new PublicKey(body.account);
    const tx = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: sender,
        toPubkey: new PublicKey("CovFLcdngBTA2N9jbd3kRuid94HzSzF2NJ5Y54bAJSNd"),
        lamports: LAMPORTS_PER_SOL * 0.1,
      })
    );
    tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
    tx.feePayer = sender;

    if (stage === "initial") {
      const nextAction = getNextAction(chain, "Price will go up", "Price will go down", iconUrl);
      return NextResponse.json(
        await createPostResponse({
          fields: {
            links: { next: nextAction },
            transaction: tx,
            message: `You win! ${chain}'s price moved as you predicted.`,
          },
        }),
        { headers: ACTIONS_CORS_HEADERS }
      );
    } else if (stage === "Price will go up" || stage === "Price will go down") {
      const initialPrice = await getPrice(chain);
      console.log(`Initial price: $${initialPrice}`);
      
      await new Promise(resolve => setTimeout(resolve, 20000));
      
      const newPrice = await getPrice(chain);
      console.log(`New price: $${newPrice}`);

      const priceIncreased = newPrice > initialPrice;
      const priceDecreased = newPrice < initialPrice;
      const predictionCorrect = (stage === "Price will go up" && priceIncreased) || (stage === "Price will go down" && priceDecreased);

      let message: string;
      let transaction: Transaction | null = null;

      if (predictionCorrect) {
        message = `Congratulations! Your prediction was correct. The price went ${priceIncreased ? "up" : "down"} (from $${initialPrice.toFixed(2)} to $${newPrice.toFixed(2)}). Transaction executed.`;
        transaction = tx;
      } else {
        message = `Sorry, your prediction was incorrect. The price went ${priceIncreased ? "up" : "down"} (from $${initialPrice.toFixed(2)} to $${newPrice.toFixed(2)}). No transaction executed.`;
      }

      const completedAction = getCompletedAction(chain, message);
      const responseFields: any = {
        links: { next: completedAction },
        message: `You win! ${chain} price moved as you predicted.`,
        icon: iconUrl,
      };

      if (transaction) {
        responseFields.transaction = transaction;
        responseFields.message = `You win! ${chain} price moved as you predicted.`;
      }

      return NextResponse.json(
        await createPostResponse({
          fields: responseFields,
        }),
        { headers: ACTIONS_CORS_HEADERS }
      );
    }

    return NextResponse.json({ error: "Invalid stage or prediction" }, {
      status: 400,
      headers: ACTIONS_CORS_HEADERS,
    });
  } catch (err) {
    console.error("Error in POST /api/action", err);
    let message = "An unknown error occurred";
    if (err instanceof Error) message = err.message;
    return NextResponse.json({ error: message }, {
      status: 500,
      headers: ACTIONS_CORS_HEADERS,
    });
  }
}

async function getPrice(chain: string): Promise<number> {
  const symbol = chain.toLowerCase() === "ethereum" ? "ETH" : "SOL";
  const response = await fetch(`https://min-api.cryptocompare.com/data/price?fsym=${symbol}&tsyms=USD`);
  const data = await response.json();

  return data.USD;
}