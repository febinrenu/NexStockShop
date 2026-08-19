import { redirect } from 'next/navigation';

export default function RootPage() {
  // Automatically redirect the entry point to the dashboard portal
  redirect('/dashboard');
}
