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
  HttpCode,
  HttpStatus,
  Req,
} from '@nestjs/common';
import type { Response } from 'express';
import { AuthService, type AuthSession } from './auth.service';
import { clearAuthCookie, setAuthCookie } from './auth-cookie';
import { JwtAuthGuard } from './jwt-auth.guard';
import type { AuthenticatedRequest } from '../common/authenticated-request';
import { OAuthService } from './oauth/oauth.service';
import { isOAuthProvider } from './oauth/oauth.providers';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { GuestDto } from './dto/guest.dto';
import { Throttle } from '@nestjs/throttler';

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
      const session = await this.oauthService.handleCallback(
        provider,
        code,
        state,
      );
      setAuthCookie(res, session.accessToken, session.expires);
      res.redirect(`${appUrl}/auth/callback`);
    } catch (err) {
      this.logger.warn(`OAuth ${provider} failed: ${String(err)}`);
      res.redirect(`${appUrl}/login?error=oauth`);
    }
  }

  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post('register')
  async register(
    @Body() dto: RegisterDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.startSession(res, await this.authService.register(dto));
  }

  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post('login')
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.startSession(res, await this.authService.login(dto));
  }

  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post('guest')
  async guest(
    @Body() dto: GuestDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.startSession(res, await this.authService.guest(dto));
  }

  @Throttle({ default: { limit: 20, ttl: 60000 } })
  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(
    @Req() req: AuthenticatedRequest,
    @Res({ passthrough: true }) res: Response,
  ) {
    await this.authService.logout(req.user.id);
    clearAuthCookie(res);
  }

  private startSession(res: Response, session: AuthSession) {
    setAuthCookie(res, session.accessToken, session.expires);
    return session.user;
  }
}
