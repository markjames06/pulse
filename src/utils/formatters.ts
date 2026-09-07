export function escapeHtml(value: unknown): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function getInitials(name?: string): string {
  if (!name) return 'U';
  return name
    .trim()
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

export function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  return `${Math.floor(diffInSeconds / 86400)}d ago`;
}

export function getRandomCoordsOffset(baseLat = 14.599512, baseLng = 120.984222) {
  const lat = baseLat + (Math.random() - 0.5) * 0.01;
  const lng = baseLng + (Math.random() - 0.5) * 0.01;
  return { lat, lng };
}

export async function getFriendlyPlaceName(latitude: number, longitude: number): Promise<string | undefined> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&zoom=18&lat=${latitude}&lon=${longitude}`
    );
    if (!response.ok) return undefined;
    const result = await response.json() as { display_name?: string };
    return result.display_name?.split(',').slice(0, 3).join(',').trim() || undefined;
  } catch {
    return undefined;
  }
}
