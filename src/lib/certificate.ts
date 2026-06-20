import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

/** Renders a simple, clean completion certificate as a PDF buffer. */
export async function generateCertificatePdf(opts: {
  recipientName: string;
  courseName: string;
  issuedAt: Date;
  certificateId: string;
}): Promise<Uint8Array> {
  const { recipientName, courseName, issuedAt, certificateId } = opts;

  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([842, 595]); // A4 landscape

  const serif = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);
  const serifRegular = await pdfDoc.embedFont(StandardFonts.TimesRoman);
  const sans = await pdfDoc.embedFont(StandardFonts.Helvetica);

  const ink = rgb(0.082, 0.098, 0.169); // matches --ink
  const coral = rgb(1, 0.42, 0.28);
  const muted = rgb(0.435, 0.424, 0.369);

  const { width, height } = page.getSize();

  // Border
  page.drawRectangle({
    x: 24,
    y: 24,
    width: width - 48,
    height: height - 48,
    borderColor: coral,
    borderWidth: 2,
  });
  page.drawRectangle({
    x: 36,
    y: 36,
    width: width - 72,
    height: height - 72,
    borderColor: ink,
    borderWidth: 0.75,
  });

  const center = (text: string, font: typeof serif, size: number) => {
    const w = font.widthOfTextAtSize(text, size);
    return (width - w) / 2;
  };

  page.drawText("ATLAS", {
    x: center("ATLAS", serif, 22),
    y: height - 100,
    size: 22,
    font: serif,
    color: coral,
  });
  page.drawText("Certificate of Completion", {
    x: center("Certificate of Completion", serif, 30),
    y: height - 150,
    size: 30,
    font: serif,
    color: ink,
  });

  page.drawText("This certifies that", {
    x: center("This certifies that", sans, 13),
    y: height - 220,
    size: 13,
    font: sans,
    color: muted,
  });

  page.drawText(recipientName, {
    x: center(recipientName, serif, 34),
    y: height - 270,
    size: 34,
    font: serif,
    color: ink,
  });

  const completedLine = "has successfully completed";
  page.drawText(completedLine, {
    x: center(completedLine, sans, 13),
    y: height - 320,
    size: 13,
    font: sans,
    color: muted,
  });

  page.drawText(courseName, {
    x: center(courseName, serifRegular, 22),
    y: height - 360,
    size: 22,
    font: serifRegular,
    color: ink,
  });

  const dateStr = issuedAt.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  page.drawText(`Issued ${dateStr}`, {
    x: 80,
    y: 80,
    size: 10,
    font: sans,
    color: muted,
  });
  page.drawText(`Certificate ID: ${certificateId}`, {
    x: width - 80 - sans.widthOfTextAtSize(`Certificate ID: ${certificateId}`, 10),
    y: 80,
    size: 10,
    font: sans,
    color: muted,
  });

  return pdfDoc.save();
}
