import { createRequire } from "node:module";
import express, { Router } from "express";
import mammoth from "mammoth";

interface PdfParseResult {
  text: string;
}

const require = createRequire(import.meta.url);
const pdfParse = require("pdf-parse/lib/pdf-parse.js") as (dataBuffer: Buffer) => Promise<PdfParseResult>;

const router = Router();

const supportedTypes = new Set([
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

router.post(
  "/extract",
  express.raw({
    limit: "15mb",
    type: () => true,
  }),
  async (req, res) => {
    try {
      const body = Buffer.isBuffer(req.body) ? req.body : Buffer.from([]);
      const contentType = req.header("content-type")?.split(";")[0]?.trim().toLowerCase() ?? "";
      const encodedFileName = req.header("x-file-name") ?? "uploaded-file";
      const fileName = decodeURIComponent(encodedFileName);
      const lowerName = fileName.toLowerCase();

      if (body.length === 0) {
        res.status(400).json({ error: "Uploaded file was empty." });
        return;
      }

      const isPdf = contentType === "application/pdf" || lowerName.endsWith(".pdf");
      const isDocx =
        contentType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
        lowerName.endsWith(".docx");

      if (!isPdf && !isDocx) {
        res.status(400).json({
          error: "Unsupported file type. Please upload a PDF or DOCX file.",
          supportedTypes: [...supportedTypes],
        });
        return;
      }

      const text = isPdf
        ? (await pdfParse(body)).text
        : (await mammoth.extractRawText({ buffer: body })).value;

      const cleanedText = text.replace(/\u0000/g, "").replace(/[ \t]+\n/g, "\n").trim();

      if (cleanedText.length < 20) {
        res.status(422).json({
          error: "Could not extract enough readable text from this file. Try pasting the JD text directly.",
        });
        return;
      }

      res.json({
        fileName,
        fileType: isPdf ? "pdf" : "docx",
        characters: cleanedText.length,
        text: cleanedText,
      });
    } catch (err) {
      req.log.error({ err }, "Failed to extract document text");
      res.status(500).json({ error: "Failed to extract document text." });
    }
  },
);

export default router;
