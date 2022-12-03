import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as pactum from 'pactum';
import { PrismaService } from '../src/prisma/prisma.service';
import { AppModule } from '../src/app.module';
import { AuthDto } from 'src/auth/dto';
import { EditUserDto } from 'src/prisma/user/dto';
import { CreateBookmarkDto, EditBookmarkDto } from 'src/bookmark/dto';

describe('App e2e', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();
    await app.listen(3333);
    prisma = app.get(PrismaService);
    await prisma.cleanDb();
    pactum.request.setBaseUrl('http://localhost:3333');
  });

  afterAll(() => {
    app.close();
  });

  describe('Auth', () => {
    const dto: AuthDto = {
      email: 'samtufail@gmail.com',
      password: '123456',
    };
    describe('Signup', () => {
      it('shoud throw error if email is empty', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody({ password: dto.password })
          .expectStatus(400);
      });
      it('shoud throw error if password is empty', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody({ email: dto.email })
          .expectStatus(400);
      });
      it('shoud throw error if body is empty', () => {
        return pactum.spec().post('/auth/signup').expectStatus(400);
      });
      it('shoud signup', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody(dto)
          .expectStatus(201);
      });
    });

    describe('Signin', () => {
      it('shoud signin', () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .withBody(dto)
          .expectStatus(200)
          .stores('access_token', 'access_token');
      });
    });
  });

  describe('User', () => {
    const dto: EditUserDto = {
      email: 'samtufail@gmail.com',
      firstName: 'Usama Tufail',
      lastName: 'Muhammad Tufail',
    };
    describe('Get Me', () => {
      it('should get current user', () => {
        return pactum
          .spec()
          .get('/users/me')
          .withHeaders({ Authorization: `Bearer $S{access_token}` })
          .expectStatus(200);
      });
    });

    describe('Edit User', () => {
      it('should edit current user', () => {
        return pactum
          .spec()
          .patch('/users')
          .withBody(dto)
          .withHeaders({ Authorization: `Bearer $S{access_token}` })
          .expectStatus(200);
      });
    });
  });

  describe('Bookmarks', () => {
    describe('Get empty bookmarks', () => {
      it('should get empty bookmarks', () => {
        return pactum
          .spec()
          .get('/bookmarks')
          .withHeaders({ Authorization: `Bearer $S{access_token}` })
          .expectStatus(200)
          .expectBody([]);
      });
    });

    describe('Create Bookmark', () => {
      const dto: CreateBookmarkDto = {
        title: 'test',
        description: 'test',
        link: 'https://usamatufail.com',
      };
      it('should create a bookmark for logged in user', () => {
        return pactum
          .spec()
          .post('/bookmarks')
          .withBody(dto)
          .withHeaders({ Authorization: `Bearer $S{access_token}` })
          .expectStatus(201)
          .stores('bookmarkId', 'id');
      });
    });

    describe('Get bookmarks', () => {
      it('should get bookmarks', () => {
        return pactum
          .spec()
          .get('/bookmarks')
          .withHeaders({ Authorization: `Bearer $S{access_token}` })
          .expectStatus(200)
          .expectJsonLength(1);
      });
    });

    describe('Get Bookmark by Id', () => {
      it('should get bookmark by id', () => {
        return pactum
          .spec()
          .get(`/bookmarks/{id}`)
          .withPathParams('id', `$S{bookmarkId}`)
          .withHeaders({ Authorization: `Bearer $S{access_token}` })
          .expectStatus(200)
          .expectBodyContains(`$S{bookmarkId}`);
      });
    });

    describe('Edit Bookmark by Id', () => {
      const dto: EditBookmarkDto = {
        title: `Sam's Portfolio`,
        description: `This is a bookmark to access Sam Tufail's portfolio.`,
      };
      it('should edit bookmark', () => {
        return pactum
          .spec()
          .patch(`/bookmarks/{id}`)
          .withPathParams('id', `$S{bookmarkId}`)
          .withBody(dto)
          .withHeaders({ Authorization: `Bearer $S{access_token}` })
          .expectStatus(200)
          .expectBodyContains(dto.title)
          .expectBodyContains(dto.description);
      });
    });

    describe('Delete Bookmark by Id', () => {
      it('should delete bookmark', () => {
        return pactum
          .spec()
          .delete(`/bookmarks/{id}`)
          .withPathParams('id', `$S{bookmarkId}`)
          .withHeaders({ Authorization: `Bearer $S{access_token}` })
          .expectStatus(204);
      });

      it('should get empty bookmarks', () => {
        return pactum
          .spec()
          .get('/bookmarks')
          .withHeaders({ Authorization: `Bearer $S{access_token}` })
          .expectStatus(200)
          .expectBody([]);
      });
    });
  });
});
