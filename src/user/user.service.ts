import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { payload } from 'src/auth/jwt.strategy';
@Injectable()
export class UserService {
  constructor(private readonly prismaService: PrismaService) {}
  async getUsers() {
    const users = await this.prismaService.user.findMany({
      select: {
        idUser: true,
        email: true,
      },
    });
    return users;
  }
  async getUser({ idUser }: payload) {
    const user = await this.prismaService.user.findUnique({
      where: {
        idUser: +idUser,
      },
      select: {
        idUser: true,
        userName: true,
        email: true,
      },
    });
    return user;
  }
}
