import type { NextApiRequest, NextApiResponse } from "next";
import { Redis } from "ioredis";
import kv from "@vercel/kv";

async function vercelKVHandler(
  req: NextApiRequest,
  res: NextApiResponse<{ [index: string]: string }>,
) {
  const { transaction, pkh } = req.query;

  let ret: { [index: string]: string } = {};
  for await (const key of kv.scanIterator({ match: transaction + ":*" })) {
    const signature = await kv.get(key);
    ret[key.split(":")[1]] = signature as string;
  }

  res.status(200).json(ret);
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

  const ret = await new Promise(res => {
    const stream = client.scanStream({
      match: transaction+":*",
    });
    let allKeys:string[] = [];

    stream.on("data", (resultKeys) => {
      resultKeys.forEach((key: string) => {
	allKeys.push(key);
      })
    });
    stream.on("end", () => {
      res(allKeys);
    });
  }).then(keys =>
    client
      .pipeline((keys as string[]).map(x => ["get", x]))
      .exec()
      .then(res => {
	if(!res) return {};
	return res
	  .map((x,i)=>{
	    let r: {[index:string]:string} = {}
	    r[(keys as string[])[i].split(":")[1]] = x[1] as string;
	    return r;
	  })
	  .reduce((x,y)=>{
	    return {...x, ...y};
	  }, {})
      }))

  res.status(200).json(ret);
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{ [index: string]: string }>,
) {
  if(process.env.REDIS_HOST === "vercel") return vercelKVHandler(req, res);
  return redisHandler(req, res);
}
