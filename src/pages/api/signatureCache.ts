import type { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from 'redis';

type Data = {
  // transaction: string,
  // pkh: string,
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const client = await createClient({url: 'redis://localhost:6379'})
    .on('error', err => console.log('Redis Client Error', err))
    .connect();

  console.log(req)
  console.log(res)

  // const orgvalue = await client.get(res.transaction+":"+res);

  // console.log(orgvalue);

  // await client.set('key', 'aa');
  // const value = await client.get('key');

  // console.log(value);
  // await client.disconnect();


  res.status(200).json({ })
}
