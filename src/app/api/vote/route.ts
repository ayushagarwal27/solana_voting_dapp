import {
  ActionGetResponse,
  ActionPostRequest,
  ACTIONS_CORS_HEADERS,
  createPostResponse,
} from "@solana/actions";
import { NextResponse } from "next/server";
import { Connection, PublicKey, Transaction } from "@solana/web3.js";
import { Voting } from "@/../anchor/target/types/voting";
import { Program, BN } from "@coral-xyz/anchor";

const IDL = require("@/../anchor/target/idl/voting.json");

export const OPTIONS = GET;

export async function GET(request: Request) {
  const actionMetadata: ActionGetResponse = {
    icon: "https://imgs.search.brave.com/tDWWRoXgOgNqHFe7YE6UVbHFpimS43rgy6LBDazWq_M/rs:fit:500:0:0:0/g:ce/aHR0cHM6Ly9jZG4u/YnJpdGFubmljYS5j/b20vMzMvNDgzMy0w/NTAtRjZFNDE1RkUv/RmxhZy1Vbml0ZWQt/U3RhdGVzLW9mLUFt/ZXJpY2EuanBn",
    title: "Vote for your President!",
    description: "Vote between Kamala & Donald",
    label: "Vote",
    links: {
      actions: [
        {
          type: "transaction",
          href: "/api/vote?=Kamala",
          label: "Vote for Kamala",
        },
        {
          type: "transaction",
          href: "/api/vote?=Donald",
          label: "Vote for Donald",
        },
      ],
    },
  };
  return NextResponse.json(actionMetadata, { headers: ACTIONS_CORS_HEADERS });
}

export async function POST(request: Request) {
  const url = new URL(request.url);
  const candidate = url.searchParams.get("candidate");

  if (candidate !== "Kamala" && candidate !== "Donald") {
    return new Response("Invalid Candidate", {
      status: 400,
      headers: ACTIONS_CORS_HEADERS,
    });
  }

  const connection = new Connection("http://127.0.0.1:8899", "confirmed");
  const program: Program<Voting> = new Program(IDL, { connection });
  const body: ActionPostRequest = await request.json();
  let voter;

  try {
    voter = new PublicKey(body.account);
  } catch (err) {
    return new Response("Invalid Account", {
      status: 400,
      headers: ACTIONS_CORS_HEADERS,
    });
  }

  const instruction = await program.methods
    .vote(candidate, new BN(1))
    .accounts({ signer: voter })
    .instruction();

  const blockhash = await connection.getLatestBlockhash();

  const transaction = new Transaction({
    feePayer: voter,
    blockhash: blockhash.blockhash,
    lastValidBlockHeight: blockhash.lastValidBlockHeight,
  }).add(instruction);
  const response = await createPostResponse({ fields: { transaction } });
  return NextResponse.json(response, { headers: ACTIONS_CORS_HEADERS });
}
