import { Test, TestingModule } from '@nestjs/testing';
import { I18nService } from 'nestjs-i18n';
import { Response } from 'express';

import { AppController } from './app.controller';
import { createMockI18nService } from './testutils/create-mock-i18n-service';
import { createMockRequest } from './testutils/create-mock-request';
import organisationFactory from './testutils/factories/organisation';
import userFactory from './testutils/factories/user';
import { translationOf } from './testutils/translation-of';
import { getActingUser } from './users/helpers/get-acting-user.helper';
import { createMock } from '@golevelup/ts-jest';
import { parseString } from 'xml2js';

jest.mock('./users/helpers/get-acting-user.helper');

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const i18nService = createMockI18nService();

    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        {
          provide: I18nService,
          useValue: i18nService,
        },
      ],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('adminDashboard', () => {
    describe('when the user is a service owner', () => {
      it('returns the BEIS user', () => {
        const user = userFactory.build({ serviceOwner: true });

        const request = createMockRequest(
          'http://example.com/some/path',
          'example.com',
          { user },
        );

        (getActingUser as jest.Mock).mockReturnValue(user);

        expect(appController.adminDashboard(request)).toEqual({
          organisation: translationOf('app.beis'),
        });
      });
    });

    describe('when the user is not a service owner', () => {
      it("fetches the user's organisation", () => {
        const organisation = organisationFactory.build({
          name: 'Department for Education',
        });
        const user = userFactory.build({ serviceOwner: false, organisation });

        const request = createMockRequest(
          'http://example.com/some/path',
          'example.com',
          { user },
        );

        (getActingUser as jest.Mock).mockReturnValue(user);

        expect(appController.adminDashboard(request)).toEqual({
          organisation: 'Department for Education',
        });
      });
    });
  });

  describe('adminIndex', () => {
    it('returns without error', () => {
      expect(appController.adminIndex()).toEqual(undefined);
    });
  });

  describe('adminGuidance', () => {
    it('returns without error', () => {
      expect(appController.adminGuidance()).toEqual(undefined);
    });
  });

  describe('healthCheck', () => {
    const OLD_ENV = process.env;

    beforeEach(async () => {
      jest.resetModules();
      process.env = { ...OLD_ENV };
    });

    afterAll(() => {
      process.env = OLD_ENV;
    });

    it('should return OK', () => {
      expect(appController.healthCheck()).toEqual({ status: 'OK' });
    });

    describe('when the deployment variables are set', () => {
      beforeEach(async () => {
        process.env['CURRENT_SHA'] = 'b9c73f88';
        process.env['TIME_OF_BUILD'] = '2020-01-01T00:00:00Z';
      });

      it('should return the sha and the time it was built', () => {
        expect(appController.healthCheck()).toEqual({
          status: 'OK',
          git_sha: 'b9c73f88',
          built_at: '2020-01-01T00:00:00Z',
        });
      });
    });
  });

  describe('pingdom', () => {
    it('should return a valid XML response', () => {
      const options = {
        explicitArray: false,
      };

      const currentTimestamp = Date.now();

      const response = createMock<Response>();
      const res = appController.pingdom(response);

      parseString(res, options, function (err, xml) {
        expect(err).toBeNull();
        expect(xml.pingdom_http_custom_check.status).toEqual('OK');
        expect(
          parseInt(xml.pingdom_http_custom_check.response_time),
        ).toBeGreaterThanOrEqual(0);
        expect(
          Date.parse(xml.pingdom_http_custom_check.timestamp),
        ).toBeGreaterThanOrEqual(currentTimestamp);
      });
    });
  });

  describe('cookies', () => {
    it('returns without error', () => {
      expect(appController.cookies()).toEqual(undefined);
    });
  });

  describe('privacyPolicy', () => {
    it('returns without error', () => {
      expect(appController.privacyPolicy()).toEqual(undefined);
    });
  });

  describe('accessibility', () => {
    it('returns without error', () => {
      expect(appController.accessibility()).toEqual(undefined);
    });
  });

  describe('dataDisclaimer', () => {
    it('returns without error', () => {
      expect(appController.dataDisclaimer()).toEqual(undefined);
    });
  });
});
