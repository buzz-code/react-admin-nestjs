import { Controller, Get, HttpCode, Post, Request, Res, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { AuthService } from '@shared/auth/auth.service';
import { JwtAuthGuard } from '@shared/auth/jwt-auth.guard';
import { LocalAuthGuard } from '@shared/auth/local-auth.guard';
import { Response } from 'express';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private authService: AuthService) { }

  @UseGuards(LocalAuthGuard)
  @Post('auth/login')
  @HttpCode(200)
  async login(@Request() req, @Res() response: Response) {
    const cookie = await this.authService.getCookieWithJwtToken(req.user);
    response.setHeader('Set-Cookie', cookie);
    return response.send({ success: true });
  }

  @Post('auth/logout')
  async logOut(@Res() response: Response) {
    response.setHeader('Set-Cookie', this.authService.getCookieForLogOut());
    return response.sendStatus(200);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req) {
    return req.user;
  }

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
