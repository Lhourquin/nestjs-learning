import { Injectable } from '@nestjs/common';
import { AuthBody, RegisterBody } from './auth.controller';
import { PrismaService } from 'src/prisma.service';
import { compare, hash } from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
@Injectable()
export class AuthService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly jwtService: JwtService,
  ) {}
  async register({ userName, email, password }: RegisterBody) {
    const user = await this.prismaService.user.findMany({
      where: {
        OR: [{ email: email }, { userName: userName }],
      },
    });
    if (!!user.length) {
      if (user[0].email == email) {
        console.log({ email });
        throw new Error(
          `Utilisateur existant sous l'adresse ${user[0].email}.`,
        );
      } else if (user[0].userName == userName) {
        console.log({ userName });
        throw new Error(
          `Utilisateur existant sous le nom d'utilisateur ${user[0].userName}.`,
        );
      }
    }

    const hashPassword = await this.hashPassword({ password });

    const new_user = await this.prismaService.user.create({
      data: {
        userName: userName,
        email: email,
        password: hashPassword,
      },
    });
    const authenticatedUser = this.authenticateUser(new_user);
    return authenticatedUser;
  }
  async login({ email, password }: AuthBody) {
    const user = await this.prismaService.user.findUnique({
      where: {
        email: email,
      },
    });

    if (!user) {
      throw new Error(`Pas d'utilisateur existant.`);
    }

    const isPasswordSame = await this.isPasswordValid({
      password,
      hashedPassword: user.password,
    });

    if (!isPasswordSame) {
      throw new Error(`Mauvais mot de passe.`);
    }

    const authenticatedUser = await this.authenticateUser({
      idUser: user.idUser,
    });
    return authenticatedUser;
  }

  private async hashPassword({ password }: { password: string }) {
    const hashedPassword = await hash(password, 10);
    return hashedPassword;
  }

  private async isPasswordValid({
    password,
    hashedPassword,
  }: {
    password: string;
    hashedPassword: string;
  }) {
    const isPasswordValid = await compare(password, hashedPassword);
    return isPasswordValid;
  }

  private async authenticateUser({ idUser }: { idUser: number }) {
    const payload = { idUser };
    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }
}
