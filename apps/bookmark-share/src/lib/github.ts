interface GitHubOrg {
  id: number;
  login: string;
  avatar_url: string;
  description: string | null;
}

interface GitHubMembership {
  role: 'admin' | 'member';
  state: 'active' | 'pending';
}

export async function getUserOrganizations(accessToken: string): Promise<GitHubOrg[]> {
  const response = await fetch('https://api.github.com/user/orgs', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch organizations');
  }

  return response.json();
}

export async function getOrgMembership(
  accessToken: string,
  org: string,
  username: string
): Promise<GitHubMembership | null> {
  const response = await fetch(
    `https://api.github.com/orgs/${org}/memberships/${username}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
      },
    }
  );

  if (!response.ok) {
    if (response.status === 404) {
      return null;
    }
    throw new Error('Failed to fetch organization membership');
  }

  return response.json();
}

export async function checkOrgMembership(
  accessToken: string,
  org: string,
  username: string
): Promise<boolean> {
  const response = await fetch(
    `https://api.github.com/orgs/${org}/members/${username}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
      },
    }
  );

  return response.status === 204;
}
