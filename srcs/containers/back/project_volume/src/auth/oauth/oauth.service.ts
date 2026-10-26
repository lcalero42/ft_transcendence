import { Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { randomBytes } from 'crypto';
import { PrismaService } from '../../prisma.service';
import { requireEnv } from '../../common/require-env';
import {
  USERNAME_MAX_LENGTH,
  USERNAME_MIN_LENGTH,
} from '../../common/username-policy';
import { AuthService } from '../auth.service';
import { detectImageType } from '../../player/avatar-validation';
import { saveAvatar } from '../../player/avatar-storage';
import { PlayerService } from '../../player/player.service';
import { AVATAR_MAX_SIZE } from '../../player/avatar.constants';
import {
  OAUTH_PROVIDERS,
  OAuthProfile,
  OAuthProviderName,
} from './oauth.providers';

const STATE_EXPIRES_IN = '5m';
const AVATAR_FETCH_TIMEOUT_MS = 5000;

interface TokenResponse {
  // eslint-disable-next-line @typescript-eslint/naming-convention -- OAuth2 spec field name
  access_token?: string;
}

@Injectable()
export class OAuthService {
  private readonly logger = new Logger(OAuthService.name);

  constructor(
    private jwtService: JwtService,
    private prisma: PrismaService,
    private authService: AuthService,
    private playerService: PlayerService,
  ) {}

  appUrl() {
    return requireEnv('CORS_ORIGIN');
  }

  buildAuthorizeUrl(provider: OAuthProviderName) {
    const config = OAUTH_PROVIDERS[provider];
    const state = this.jwtService.sign(
      { provider },
      { secret: this.stateSecret(), expiresIn: STATE_EXPIRES_IN },
    );
    const params = new URLSearchParams({
      client_id: requireEnv(config.clientIdEnv),
      redirect_uri: this.callbackUrl(provider),
      response_type: 'code',
      scope: config.scope,
      state,
    });
    return `${config.authorizeUrl}?${params.toString()}`;
  }

  async handleCallback(
    provider: OAuthProviderName,
    code: string,
    state: string,
  ) {
    this.verifyState(provider, state);
    const providerToken = await this.exchangeCode(provider, code);
    const profile = await this.fetchProfile(provider, providerToken);
    const player = await this.findOrCreatePlayer(provider, profile);
    const avatarUrl = await this.importAvatar(profile.avatarUrl);
    if (avatarUrl) await this.playerService.updateAvatar(player.id, avatarUrl);
    return this.authService.signToken(player.id, player.email, true);
  }

  private stateSecret() {
    return `${requireEnv('JWT_SECRET')}:oauth-state`;
  }

  private callbackUrl(provider: OAuthProviderName) {
    return `${this.appUrl()}/api/auth/${provider}/callback`;
  }

  private verifyState(provider: OAuthProviderName, state: string) {
    const payload = this.jwtService.verify<{ provider: string }>(state, {
      secret: this.stateSecret(),
    });
    if (payload.provider !== provider) {
      throw new Error('OAuth state was issued for another provider');
    }
  }

  private async exchangeCode(provider: OAuthProviderName, code: string) {
    const config = OAUTH_PROVIDERS[provider];
    const res = await fetch(config.tokenUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: this.callbackUrl(provider),
        client_id: requireEnv(config.clientIdEnv),
        client_secret: requireEnv(config.clientSecretEnv),
      }),
    });
    if (!res.ok) {
      throw new Error(`${provider} token exchange failed (${res.status})`);
    }
    const body = (await res.json()) as TokenResponse;
    if (!body.access_token) {
      throw new Error(`${provider} token response has no access_token`);
    }
    return body.access_token;
  }

  private async fetchProfile(provider: OAuthProviderName, token: string) {
    const config = OAUTH_PROVIDERS[provider];
    const res = await fetch(config.profileUrl, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
      throw new Error(`${provider} profile request failed (${res.status})`);
    }
    return config.toProfile(await res.json());
  }

  private async findOrCreatePlayer(
    provider: OAuthProviderName,
    profile: OAuthProfile,
  ) {
    const providerIdField =
      provider === 'google'
        ? { googleId: profile.providerId }
        : { discordId: profile.providerId };

    const linked = await this.prisma.player.findUnique({
      where: providerIdField,
    });
    if (linked) return this.assertActive(linked);

    const verifiedEmail = profile.emailVerified ? profile.email : null;
    if (verifiedEmail) {
      const byEmail = await this.prisma.player.findUnique({
        where: { email: verifiedEmail },
      });
      if (byEmail) {
        this.assertActive(byEmail);
        return this.prisma.player.update({
          where: { id: byEmail.id },
          data: providerIdField,
        });
      }
    }

    return this.prisma.player.create({
      data: {
        ...providerIdField,
        name: await this.findAvailableName(profile.name),
        email: verifiedEmail,
      },
    });
  }

  private async importAvatar(url: string | null) {
    if (!url) return null;
    try {
      const res = await fetch(url, {
        signal: AbortSignal.timeout(AVATAR_FETCH_TIMEOUT_MS),
      });
      if (!res.ok) throw new Error(`status ${res.status}`);
      const buffer = Buffer.from(await res.arrayBuffer());
      if (buffer.length > AVATAR_MAX_SIZE) throw new Error('image too large');
      if (!detectImageType(buffer)) throw new Error('not an image');
      return await saveAvatar(buffer);
    } catch (error) {
      this.logger.warn(`could not import avatar ${url}: ${String(error)}`);
      return null;
    }
  }

  private assertActive<T extends { deletedAt: Date | null }>(player: T) {
    if (player.deletedAt) throw new Error('Account is deleted');
    return player;
  }

  private async findAvailableName(rawName: string) {
    let base = rawName
      .replace(/[^a-zA-Z0-9_-]/g, '')
      .slice(0, USERNAME_MAX_LENGTH - 4);
    if (base.length < USERNAME_MIN_LENGTH) base = 'player';

    for (let i = 1; i <= 50; i++) {
      const candidate = i === 1 ? base : `${base}_${i}`;
      const taken = await this.prisma.player.findUnique({
        where: { name: candidate },
      });
      if (!taken) return candidate;
    }
    return `player_${randomBytes(4).toString('hex')}`;
  }
}
