import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Keypair, PublicKey } from "@solana/web3.js";
import { startAnchor } from "solana-bankrun";
import { VotingDapp } from "../target/types/voting_dapp";
import { Voting } from "../target/types/voting";

const IDL = require("../target/idl/voting.json");

import { BankrunProvider } from "anchor-bankrun";
import { describe, expect } from "@jest/globals";

const programAddress = new PublicKey(
  "AsjZ3kWAUSQRNt2pZVeJkywhZ6gpLpHZmJjduPmKZDZZ",
);

describe("voting", () => {
  it("Initialize Poll", async () => {
    const context = await startAnchor(
      "",
      [{ name: "voting", programId: programAddress }],
      [],
    );
    const provider = new BankrunProvider(context);

    const votingProgram = new Program<Voting>(IDL, provider);
    await votingProgram.methods
      .initializePoll(
        new anchor.BN(1),
        "Who to vote Kamala or Donald?",
        new anchor.BN(0),
        new anchor.BN(1828843229),
      )
      .rpc();

    const [pollAddress] = PublicKey.findProgramAddressSync(
      [new anchor.BN(1).toArrayLike(Buffer, "le", 8)],
      programAddress,
    );
    const poll = await votingProgram.account.poll.fetch(pollAddress);
    console.log(poll);
    expect(poll.pollId.toNumber()).toEqual(1);
    expect(poll.description).toEqual("Who to vote Kamala or Donald?");
    expect(poll.pollStart.toNumber()).toBeLessThan(poll.pollEnd.toNumber());
  });
});
