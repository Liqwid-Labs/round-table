import type { NextApiRequest, NextApiResponse } from "next";
import { Redis } from "ioredis";
import kv from "@vercel/kv";

async function vercelKVHandler(
  req: NextApiRequest,
  res: NextApiResponse<{ [index: string]: string }>,
) {
  const { transaction, pkh } = req.query;

  if (req.method === "GET") {
    const signature = await kv.get(transaction + ":" + pkh);
    res.status(200).json({ signature: signature as string });
  } else if (req.method === "POST") {
    const { vkeywitness } = JSON.parse(req.body);
    await kv.set(transaction + ":" + pkh, vkeywitness);
    res.status(200).json({});
  }
}

async function redisHandler(
  req: NextApiRequest,
  res: NextApiResponse<{ [index: string]: string }>,
) {
  const { transaction, pkh } = req.query;

  let client =
    new Redis({
      sentinels: [
	{ host: process.env.REDIS_HOST, port: 26379 },
      ],
      name: process.env.REDIS_MASTER_NAME ?? 'mymaster',
    })

  if (req.method === "GET") {
    const signature = await client.get(transaction + ":" + pkh);
    res.status(200).json({ signature: signature as string });
  } else if (req.method === "POST") {
    const { vkeywitness } = JSON.parse(req.body);
    await client.set(transaction + ":" + pkh, vkeywitness);
    res.status(200).json({});
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{ [index: string]: string }>,
) {
  if(process.env.REDIS_HOST === "vercel") return vercelKVHandler(req, res);
  return redisHandler(req, res);
}
