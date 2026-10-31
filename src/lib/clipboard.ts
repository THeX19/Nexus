import { toast } from '../ui/Toast';

export async function copyText(text: string, what = 'Value') {
  try {
    await navigator.clipboard.writeText(text);
    toast.success(`${what} copied`, text.length > 80 ? `${text.slice(0, 80)}…` : text);
  } catch {
    toast.error('Could not access the clipboard');
  }
}
