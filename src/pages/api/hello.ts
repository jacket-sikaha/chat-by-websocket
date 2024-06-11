// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import { join } from "path";

type Data = {
  name: string;
};

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const __dirname = process.cwd();
  const projectFolder = join(__dirname, "tmp", "upload");
  res.status(200).json({ name: projectFolder });
}
