import { getWhatsAppNumber } from "@/lib/db";
import { SettingsForm } from "./SettingsForm";

export default async function AdminSettingsPage() {
  const whatsappNumber = await getWhatsAppNumber();

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">Pengaturan</h1>
      <SettingsForm initialWhatsAppNumber={whatsappNumber} />
    </div>
  );
}
