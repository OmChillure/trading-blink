import { NextActionLink } from "@solana/actions-spec";

// just a helper function to get the completed action at final stage [ last action in the chain ]
export const getCompletedAction = (stage: string): NextActionLink => {
  return {
    type: "inline",
    action: {
      description: `Predict if price of ${stage} will go up or down in the next 20 seconds.`,
      icon: `https://media1.tenor.com/m/r0viDQikSWcAAAAC/samoyedcoin-solana.gif`,
      label: ``,
      title: `Bid on ${stage}`,
      type: "completed",
    },
  };
};

export const getNextAction = (stage: string): NextActionLink => {
  return {
    type: "inline",
    action: {
      description: `Predict if price of ${stage} will go up or down in the next 20 seconds.`,
      icon: `hhttps://media1.tenor.com/m/r0viDQikSWcAAAAC/samoyedcoin-solana.gif`,
      label: ``,
      title: `Bid on ${stage}`,
      type: "action",
      links: {
        actions: [
          {
            label: `Chain Name ${stage}`, 
            href: `/api/action?chain={chain}&stage=${stage}`,
            parameters: [
              {
                name: "chain",
                label: "Choose: Solana or Ethereum",
              },
            ],
          },
          {
            label: `Submit ${stage}`, 
            href: `/api/action?amount={amount}&stage=${stage}`,
            parameters: [
              {
                name: "amount",
                label: "Enter a custom SOL amount",
              },
            ],
          },
        ],
      },
    },
  };
};
