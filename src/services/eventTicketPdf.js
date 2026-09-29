const navy = [8, 13, 27];
const cyan = [103, 232, 249];
const slate = [71, 85, 105];

function safeFilename(value) {
  return String(value || "evenement")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase()
    .slice(0, 60);
}

function displayDate(value) {
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "full",
    timeStyle: "short",
  }).format(new Date(value));
}

function writeLabelValue(document, label, value, x, y, width = 78) {
  document.setFont("helvetica", "bold");
  document.setFontSize(8);
  document.setTextColor(...slate);
  document.text(label.toUpperCase(), x, y);
  document.setFont("helvetica", "normal");
  document.setFontSize(11);
  document.setTextColor(...navy);
  const lines = document.splitTextToSize(value || "Non renseigné", width);
  document.text(lines, x, y + 6);
}

export async function createEventTicketPdf({ event, student, download = true }) {
  if (!event?.qr_token) throw new Error("Le billet ne contient aucun code QR.");

  const [{ jsPDF }, { default: QRCode }] = await Promise.all([
    import("jspdf"),
    import("qrcode"),
  ]);
  const document = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });
  const pageWidth = document.internal.pageSize.getWidth();
  const origin = event.origin || (typeof window !== "undefined" ? window.location.origin : "https://aeieniadb.vercel.app");
  const ticketUrl = `${origin}/evenements/confirmation?token=${encodeURIComponent(event.qr_token)}`;
  const qrDataUrl = await QRCode.toDataURL(ticketUrl, {
    width: 420,
    margin: 2,
    errorCorrectionLevel: "H",
    color: { dark: "#080d1b", light: "#ffffff" },
  });

  document.setFillColor(...navy);
  document.rect(0, 0, pageWidth, 64, "F");
  document.setFillColor(...cyan);
  document.roundedRect(16, 14, 36, 10, 5, 5, "F");
  document.setFont("helvetica", "bold");
  document.setFontSize(9);
  document.setTextColor(...navy);
  document.text("AEI ENIADB", 34, 20.5, { align: "center" });

  document.setTextColor(255, 255, 255);
  document.setFontSize(25);
  document.text("Billet d'inscription", 16, 39);
  document.setFont("helvetica", "normal");
  document.setFontSize(10);
  document.setTextColor(203, 213, 225);
  document.text("Accès personnel - présentation du QR code obligatoire", 16, 49);

  document.setFillColor(255, 255, 255);
  document.setDrawColor(226, 232, 240);
  document.roundedRect(12, 72, pageWidth - 24, 202, 6, 6, "FD");

  document.setFont("helvetica", "bold");
  document.setTextColor(...navy);
  document.setFontSize(19);
  const titleLines = document.splitTextToSize(event.title, 108);
  document.text(titleLines, 22, 91);
  const titleHeight = titleLines.length * 7;
  document.setFont("helvetica", "normal");
  document.setFontSize(10);
  document.setTextColor(...slate);
  document.text(event.organizer || "AEI ENIADB", 22, 94 + titleHeight);

  const infoY = Math.max(119, 104 + titleHeight);
  writeLabelValue(document, "Étudiant", student.fullName, 22, infoY, 72);
  writeLabelValue(document, "Adresse e-mail", student.email, 112, infoY, 70);
  writeLabelValue(document, "Filière", student.specialty, 22, infoY + 25, 72);
  writeLabelValue(document, "Niveau", student.level, 112, infoY + 25, 70);
  writeLabelValue(document, "Date", displayDate(event.starts_at), 22, infoY + 50, 72);
  writeLabelValue(document, "Lieu", event.location, 112, infoY + 50, 70);

  const qrY = infoY + 73;
  document.setFillColor(248, 250, 252);
  document.roundedRect(22, qrY, pageWidth - 44, 77, 5, 5, "F");
  document.addImage(qrDataUrl, "PNG", 29, qrY + 8, 61, 61, undefined, "FAST");
  document.setFont("helvetica", "bold");
  document.setFontSize(12);
  document.setTextColor(...navy);
  document.text("Votre inscription est confirmée", 102, qrY + 19);
  document.setFont("helvetica", "normal");
  document.setFontSize(9.5);
  document.setTextColor(...slate);
  const instructions = document.splitTextToSize(
    "Présentez ce billet au responsable du club. Le code QR est unique, personnel et associé uniquement à cet événement.",
    79
  );
  document.text(instructions, 102, qrY + 29);
  document.setFont("courier", "bold");
  document.setFontSize(8);
  document.setTextColor(79, 70, 229);
  document.text(`ID ${event.qr_token}`, 102, qrY + 56, { maxWidth: 79 });

  document.setDrawColor(226, 232, 240);
  document.line(22, 259, pageWidth - 22, 259);
  document.setFont("helvetica", "normal");
  document.setFontSize(8);
  document.setTextColor(100, 116, 139);
  document.text("Billet généré par le portail AEI ENIADB", 22, 266);
  document.text("Document non transférable", pageWidth - 22, 266, { align: "right" });

  const filename = `billet-${safeFilename(event.title)}-${event.qr_token.slice(0, 8)}.pdf`;
  if (download) document.save(filename);
  return { document, filename, qrDataUrl };
}
