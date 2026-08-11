import { createSupabaseServerClient } from "./supabase-server";
import type { Database } from "@/types/supabase";

type GameRow = Database["public"]["Tables"]["games"]["Row"];
type PricingRow = Database["public"]["Tables"]["pricing"]["Row"];
type SettingsRow = Database["public"]["Tables"]["settings"]["Row"];

export interface DbGame {
  id: string;
  slug: string;
  name: string;
  icon_url: string;
  icon_width: number;
  icon_height: number;
  range_label: string;
  user_id_label: string;
  user_id_placeholder: string;
  server_id_label: string;
  server_id_placeholder: string;
  server_id_required: boolean;
  hide_server_id: boolean;
}

export interface DbNominal {
  id: string;
  game_id: string;
  nominal_label: string;
  price: number;
  sort_order: number;
}

export interface DbGameWithNominals extends DbGame {
  nominals: DbNominal[];
}

export async function getActiveGames(): Promise<DbGameWithNominals[]> {
  const supabase = await createSupabaseServerClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: games } = await (supabase.from("games") as any)
    .select("*")
    .eq("is_active", true)
    .order("sort_order") as { data: GameRow[] | null };

  if (!games || games.length === 0) return [];

  const gameIds = games.map((g) => g.id);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: allPricing } = await (supabase.from("pricing") as any)
    .select("*")
    .in("game_id", gameIds)
    .order("sort_order") as { data: PricingRow[] | null };

  const pricingByGame = new Map<string, DbNominal[]>();
  (allPricing ?? []).forEach((p) => {
    const list = pricingByGame.get(p.game_id) ?? [];
    list.push(p);
    pricingByGame.set(p.game_id, list);
  });

  return games.map((g) => ({
    ...g,
    nominals: pricingByGame.get(g.id) ?? [],
  }));
}

export async function getGameBySlug(slug: string): Promise<DbGameWithNominals | null> {
  const supabase = await createSupabaseServerClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: game } = await (supabase.from("games") as any)
    .select("*")
    .eq("slug", slug)
    .eq("is_active", true)
    .single() as { data: GameRow | null };

  if (!game) return null;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: nominals } = await (supabase.from("pricing") as any)
    .select("*")
    .eq("game_id", game.id)
    .order("sort_order") as { data: PricingRow[] | null };

  return { ...game, nominals: nominals ?? [] };
}

export async function getQrisUrl(): Promise<string> {
  const supabase = await createSupabaseServerClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (supabase.from("settings") as any)
    .select("value")
    .eq("key", "qris_image_url")
    .single() as { data: SettingsRow | null };
  return (data?.value as string) ?? "";
}

export async function getWhatsAppNumber(): Promise<string> {
  const supabase = await createSupabaseServerClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (supabase.from("settings") as any)
    .select("value")
    .eq("key", "whatsapp_number")
    .single() as { data: SettingsRow | null };

  if (!data?.value) return "6281234567890";
  try {
    const parsed = JSON.parse(String(data.value));
    return String(parsed);
  } catch {
    return String(data.value).replace(/"/g, "");
  }
}
