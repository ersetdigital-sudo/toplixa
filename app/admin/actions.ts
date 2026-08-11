"use server";

import { createSupabaseServerClient } from "@/lib/supabase-server";
import { revalidatePath } from "next/cache";
import type { Database } from "@/types/supabase";

type TypedSupabase = ReturnType<typeof createSupabaseServerClient> extends Promise<infer T> ? T : never;

async function requireAdmin(): Promise<TypedSupabase> {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: admin } = await (supabase.from("admin_users") as any)
    .select("id")
    .eq("user_id", user.id)
    .single();
  if (!admin) throw new Error("Not an admin");
  return supabase;
}

async function revalidateGame(gameId: string) {
  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/admin/games");

  // Look up slug to revalidate specific game page
  const supabase = await createSupabaseServerClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: game } = await (supabase.from("games") as any)
    .select("slug")
    .eq("id", gameId)
    .single();
  if (game?.slug) {
    revalidatePath(`/top-up/${game.slug}`);
  }
}

export async function addPricing(gameId: string, nominalLabel: string, price: number) {
  const supabase = await requireAdmin();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: last } = await (supabase.from("pricing") as any)
    .select("sort_order")
    .eq("game_id", gameId)
    .order("sort_order", { ascending: false })
    .limit(1)
    .single();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from("pricing") as any).insert({
    game_id: gameId,
    nominal_label: nominalLabel,
    price,
    sort_order: (last?.sort_order ?? 0) + 1,
  });

  if (error) throw error.message;
  await revalidateGame(gameId);
}

export async function updatePricing(id: string, nominalLabel: string, price: number) {
  const supabase = await requireAdmin();

  // Get game_id before update
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: pricing } = await (supabase.from("pricing") as any)
    .select("game_id")
    .eq("id", id)
    .single();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from("pricing") as any)
    .update({ nominal_label: nominalLabel, price })
    .eq("id", id);
  if (error) throw error.message;

  if (pricing?.game_id) {
    await revalidateGame(pricing.game_id);
  }
}

export async function deletePricing(id: string) {
  const supabase = await requireAdmin();

  // Get game_id before delete
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: pricing } = await (supabase.from("pricing") as any)
    .select("game_id")
    .eq("id", id)
    .single();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from("pricing") as any).delete().eq("id", id);
  if (error) throw error.message;

  if (pricing?.game_id) {
    await revalidateGame(pricing.game_id);
  }
}

export async function updateGameField(gameId: string, field: string, value: unknown) {
  const supabase = await requireAdmin();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from("games") as any)
    .update({ [field]: value })
    .eq("id", gameId);
  if (error) throw error.message;
  await revalidateGame(gameId);
}

export async function updateGameActive(gameId: string, isActive: boolean) {
  const supabase = await requireAdmin();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from("games") as any)
    .update({ is_active: isActive })
    .eq("id", gameId);
  if (error) throw error.message;
  await revalidateGame(gameId);
}

export async function updateQrisImage(url: string) {
  const supabase = await requireAdmin();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from("settings") as any)
    .upsert({ key: "qris_image_url", value: url }, { onConflict: "key" });
  if (error) throw error.message;
  revalidatePath("/admin/qris");
  revalidatePath("/admin");
  revalidatePath("/");
}

export async function updateWhatsAppNumber(number: string) {
  await requireAdmin();
  const supabase = await createSupabaseServerClient();

  const digits = number.replace(/\D/g, "");
  if (digits.length < 10) {
    return { success: false, error: "Nomor minimal 10 digit" };
  }

  const normalized = digits.startsWith("62")
    ? digits
    : digits.startsWith("0")
    ? "62" + digits.slice(1)
    : "62" + digits;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from("settings") as any)
    .upsert(
      { key: "whatsapp_number", value: JSON.stringify(normalized) },
      { onConflict: "key" }
    );

  if (error) return { success: false, error: error.message };
  return { success: true };
}
