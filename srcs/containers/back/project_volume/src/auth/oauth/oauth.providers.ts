export type OAuthProviderName = 'google' | 'discord';

// What we keep from a provider profile, whatever the provider.
export interface OAuthProfile {
  providerId: string;
  email: string | null;
  emailVerified: boolean;
  name: string;
  avatarUrl: string | null;
}

interface OAuthProviderConfig {
  authorizeUrl: string;
  tokenUrl: string;
  profileUrl: string;
  scope: string;
  clientIdEnv: string;
  clientSecretEnv: string;
  toProfile: (raw: unknown) => OAuthProfile;
}

// Field names below are imposed by the Google / Discord APIs.
/* eslint-disable @typescript-eslint/naming-convention */
interface GoogleUserInfo {
  sub: string;
  email?: string;
  email_verified?: boolean;
  name?: string;
  given_name?: string;
  picture?: string;
}

interface DiscordUser {
  id: string;
  username: string;
  global_name?: string | null;
  email?: string | null;
  verified?: boolean;
  avatar?: string | null;
}
/* eslint-enable @typescript-eslint/naming-convention */

export const OAUTH_PROVIDERS: Record<OAuthProviderName, OAuthProviderConfig> = {
  google: {
    authorizeUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
    tokenUrl: 'https://oauth2.googleapis.com/token',
    profileUrl: 'https://openidconnect.googleapis.com/v1/userinfo',
    scope: 'openid email profile',
    clientIdEnv: 'GOOGLE_CLIENT_ID',
    clientSecretEnv: 'GOOGLE_CLIENT_SECRET',
    toProfile: (raw) => {
      const user = raw as GoogleUserInfo;
      return {
        providerId: user.sub,
        email: user.email ?? null,
        emailVerified: user.email_verified === true,
        name: user.given_name ?? user.name ?? '',
        avatarUrl: user.picture ?? null,
      };
    },
  },
  discord: {
    authorizeUrl: 'https://discord.com/oauth2/authorize',
    tokenUrl: 'https://discord.com/api/oauth2/token',
    profileUrl: 'https://discord.com/api/users/@me',
    scope: 'identify email',
    clientIdEnv: 'DISCORD_CLIENT_ID',
    clientSecretEnv: 'DISCORD_CLIENT_SECRET',
    toProfile: (raw) => {
      const user = raw as DiscordUser;
      return {
        providerId: user.id,
        email: user.email ?? null,
        emailVerified: user.verified === true,
        name: user.global_name ?? user.username,
        avatarUrl: user.avatar
          ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`
          : null,
      };
    },
  },
};

export function isOAuthProvider(name: string): name is OAuthProviderName {
  return Object.hasOwn(OAUTH_PROVIDERS, name);
}
