import type { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from 'redis';
import kv from '@vercel/kv';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const {transaction, pkh} = req.query

  let client;
  if(process.env.REDIS_SOURCE == 'vercel') {
    client = kv;
  } else {
    client = await createClient({url: process.env.REDIS_SOURCE})
      .on('error', err => console.log('Redis Client Error', err))
      .connect();
  }

  let ret = {}
  for await (const key of client.scanIterator({MATCH: transaction+":*"})) {
    const signature = await client.get(key);
    ret[key.split(":")[1]] = signature;
  }

  res.status(200).json(ret)
}
