import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Query,
  Res,
  UseGuards,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import type { Response } from 'express';
import { AuthService } from './auth.service';
import { OAuthService } from './oauth/oauth.service';
import { isOAuthProvider } from './oauth/oauth.providers';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { GuestDto } from './dto/guest.dto';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';

@UseGuards(ThrottlerGuard)
@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(
    private authService: AuthService,
    private oauthService: OAuthService,
  ) {}

  @Throttle({ default: { limit: 20, ttl: 60000 } })
  @Get(':provider')
  oauthStart(@Param('provider') provider: string, @Res() res: Response) {
    if (!isOAuthProvider(provider)) throw new NotFoundException();
    res.redirect(this.oauthService.buildAuthorizeUrl(provider));
  }

  @Throttle({ default: { limit: 20, ttl: 60000 } })
  @Get(':provider/callback')
  async oauthCallback(
    @Param('provider') provider: string,
    @Query('code') code: string | undefined,
    @Query('state') state: string | undefined,
    @Res() res: Response,
  ) {
    const appUrl = this.oauthService.appUrl();
    try {
      if (!isOAuthProvider(provider) || !code || !state) {
        throw new Error('Invalid OAuth callback');
      }
      const { accessToken } = await this.oauthService.handleCallback(
        provider,
        code,
        state,
      );
      res.redirect(`${appUrl}/auth/callback#token=${accessToken}`);
    } catch (err) {
      this.logger.warn(`OAuth ${provider} failed: ${String(err)}`);
      res.redirect(`${appUrl}/login?error=oauth`);
    }
  }

  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post('guest')
  guest(@Body() dto: GuestDto) {
    return this.authService.guest(dto);
  }
}
