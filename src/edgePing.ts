"use server";

export async function pingEdge(): Promise<{ at: string }> {
  return { at: new Date().toISOString() };
}
