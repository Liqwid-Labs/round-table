// import type { NextApiRequest, NextApiResponse } from 'next'
// import { createClient } from 'redis';

// type Data = {
//   // transaction: string,
//   // pkh: string,
// }

// export default async function handler(
//   req: NextApiRequest,
//   res: NextApiResponse<Data>
// ) {
//   const client = await createClient({url: 'redis://localhost:6379'})
//     .on('error', err => console.log('Redis Client Error', err))
//     .connect();

//   const {transaction, pkh} = req.query

//   if(req.method === 'GET') {
//     const signature = await client.get(transaction+":"+pkh);
//     res.status(200).json({signature: signature})
//   } else if(req.method === 'POST') {
//     const {vkeywitness} = JSON.parse(req.body);
//     const signature =
//       await client.set(transaction+":"+pkh, vkeywitness);
//     res.status(200).json({})
//   }
// }
import type { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from 'redis';
import kv from '@vercel/kv';

type Data = {
  // transaction: string,
  // pkh: string,
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const {transaction, pkh} = req.query

  if(req.method === 'GET') {
    const signature = await kv.get(transaction+":"+pkh);
    res.status(200).json({signature: signature})
  } else if(req.method === 'POST') {
    const {vkeywitness} = JSON.parse(req.body);
    const signature =
      await kv.set(transaction+":"+pkh, vkeywitness);
    res.status(200).json({})
  }
}
