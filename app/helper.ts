import { NextActionLink } from "@solana/actions-spec";

export const getCompletedAction = (stage: string, message: string): NextActionLink => {
  return {
    type: "inline",
    action: {
      description: message,
      icon: `https://media1.tenor.com/m/r0viDQikSWcAAAAC/samoyedcoin-solana.gif`,
      label: ``,
      title: `Bid on ${stage}`,
      type: "completed",
    },
  };
};

export const getNextAction = (stage: string, stage1: string, stage2: string, icon: string): NextActionLink => {
  return {
    type: "inline",
    action: {
      description: `Predict if price of ${stage} will go up or down in the next 20 seconds.`,
      icon: `${icon}`,
      label: ``,
      title: `Bid on ${stage}`,
      type: "action",
      links: {
        actions: [
          {
            label: `${stage1}`,
            href: `/api/action?chain=${stage}&stage=${stage1}`,
          },
          {
            label: `${stage2}`,
            href: `/api/action?chain=${stage}&stage=${stage2}`,
          },
        ],
      },
    },
  };
};