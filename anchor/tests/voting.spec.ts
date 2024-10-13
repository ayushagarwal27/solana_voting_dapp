import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Keypair, PublicKey } from "@solana/web3.js";
import { startAnchor } from "solana-bankrun";
import { Voting } from "../target/types/voting";

const IDL = require("../target/idl/voting.json");

import { BankrunProvider } from "anchor-bankrun";
import { beforeAll, describe, expect, it } from "@jest/globals";

const programAddress = new PublicKey(
  "AsjZ3kWAUSQRNt2pZVeJkywhZ6gpLpHZmJjduPmKZDZZ",
);

describe("voting", () => {
  let context;
  let provider;
  let votingProgram: anchor.Program<Voting>;

  beforeAll(async () => {
    context = await startAnchor(
      "",
      [{ name: "voting", programId: programAddress }],
      [],
    );
    provider = new BankrunProvider(context);

    votingProgram = new Program<Voting>(IDL, provider);
  });

  it("Initialize Poll", async () => {
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

  it("Initialize Candidate", async () => {
    await votingProgram.methods
      .initializeCandidate("Kamala", new anchor.BN(1))
      .rpc();
    await votingProgram.methods
      .initializeCandidate("Donald", new anchor.BN(1))
      .rpc();

    const [kAddress] = PublicKey.findProgramAddressSync(
      [new anchor.BN(1).toArrayLike(Buffer, "le", 8), Buffer.from("Kamala")],
      programAddress,
    );
    const [dAddress] = PublicKey.findProgramAddressSync(
      [new anchor.BN(1).toArrayLike(Buffer, "le", 8), Buffer.from("Donald")],
      programAddress,
    );
    const kam = await votingProgram.account.candidate.fetch(kAddress);
    const dona = await votingProgram.account.candidate.fetch(dAddress);

    console.log(kam);
    console.log(dona);

    expect(kam.candidateName).toEqual("Kamala");
    expect(kam.candidateVotes.toNumber()).toEqual(0);

    expect(dona.candidateName).toEqual("Donald");
    expect(dona.candidateVotes.toNumber()).toEqual(0);
  });

  it("Vote", async () => {
    await votingProgram.methods.vote("Donald", new anchor.BN(1)).rpc();
    const [dAddress] = PublicKey.findProgramAddressSync(
      [new anchor.BN(1).toArrayLike(Buffer, "le", 8), Buffer.from("Donald")],
      programAddress,
    );
    const dona = await votingProgram.account.candidate.fetch(dAddress);
    console.log(dona);
    expect(dona.candidateVotes.toNumber()).toEqual(1);
  });
});
