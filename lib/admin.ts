// Admin is identified by GitHub provider account ID
const ADMIN_GITHUB_IDS = ["1039"];

export function isAdmin(providerAccountId: string | null | undefined): boolean {
  return !!providerAccountId && ADMIN_GITHUB_IDS.includes(providerAccountId);
}
