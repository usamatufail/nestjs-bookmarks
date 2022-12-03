import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBookmarkDto, EditBookmarkDto } from './dto';

@Injectable()
export class BookmarkService {
  constructor(private prisma: PrismaService) {}

  async createBookmark(userId: number, createDto: CreateBookmarkDto) {
    const bookmark = await this.prisma.bookmark.create({
      data: {
        userId,
        ...createDto,
      },
    });

    return bookmark;
  }

  getBookmarks(userId: number) {
    const bookmarks = this.prisma.bookmark.findMany({
      where: { userId },
    });
    return bookmarks;
  }

  getBookmarkById(userId: number, bookmarkId: number) {
    const bookmark = this.prisma.bookmark.findFirst({
      where: { userId, id: bookmarkId },
    });
    return bookmark;
  }

  async editBookmarkById(
    userId: number,
    bookmarkId: number,
    editDto: EditBookmarkDto,
  ) {
    const bookmark = await this.prisma.bookmark.findUnique({
      where: { id: bookmarkId },
    });

    if (!bookmark) throw new NotFoundException('Bookmark not found');

    if (bookmark.userId !== userId)
      throw new ForbiddenException('You can only edit your own bookmarks');

    const updatedBookmark = await this.prisma.bookmark.update({
      where: { id: bookmarkId },
      data: {
        ...editDto,
      },
    });

    return updatedBookmark;
  }

  async deleteBookmarkById(userId: number, bookmarkId: number) {
    const bookmark = await this.prisma.bookmark.findUnique({
      where: { id: bookmarkId },
    });

    if (!bookmark) throw new NotFoundException('Bookmark not found');

    if (bookmark.userId !== userId)
      throw new ForbiddenException('You can only delete your own bookmarks');

    await this.prisma.bookmark.delete({
      where: { id: bookmarkId },
    });
  }
}
