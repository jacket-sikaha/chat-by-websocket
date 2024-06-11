import { readFile } from "fs/promises";
import type { NextApiRequest, NextApiResponse } from "next";
import { join } from "path";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const __dirname = process.cwd();
  const projectFolder = join(__dirname, "tmp", "upload");

  if (req.method === "POST") {
    const { name } = req.body;
    const file = await readFile(join(projectFolder, name));
    res.status(200).send(file);
  } else {
    res.status(405).json({ message: "not found" });
  }
}
