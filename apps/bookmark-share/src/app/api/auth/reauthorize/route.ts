import { NextResponse } from 'next/server';

export async function GET() {
  const clientId = process.env.GITHUB_CLIENT_ID;

  // Redirect to GitHub's OAuth app settings page where users can manage org access
  const githubAppSettingsUrl = `https://github.com/settings/connections/applications/${clientId}`;

  return NextResponse.redirect(githubAppSettingsUrl);
}
