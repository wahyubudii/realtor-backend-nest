import { Test, TestingModule } from '@nestjs/testing';
import { HomeController } from './home.controller.js';
import { HomeService } from './home.service.js';
import { PrismaService } from 'src/prisma/prisma.service.js';
import { PropertyType } from '@prisma/client';
import { UnauthorizedException } from '@nestjs/common';

const mockUser = {
  id: 100,
  name: 'Wahyu Budi Utomo Testing',
  email: 'wahyutesting@gmail.com',
  phone: '+6285856196359',
};

const mockHome = {
  id: 11,
  address: '1111 Jendral Sudirman',
  city: 'Jakarta',
  price: 100000000,
  property_type: PropertyType.CONDO,
  image: 'img5',
  number_of_bedrooms: 4,
  number_of_bathrooms: 5,
};

describe('HomeController', () => {
  let controller: HomeController;
  let homeService: HomeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HomeController],
      providers: [
        {
          provide: HomeService,
          useValue: {
            getHomes: jest.fn().mockReturnValue([]),
            getRealtorByHomeId: jest.fn().mockReturnValue(mockUser),
            updateHomeById: jest.fn().mockReturnValue(mockHome),
          },
        },
        PrismaService,
      ],
    }).compile();

    controller = module.get<HomeController>(HomeController);
    homeService = module.get<HomeService>(HomeService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getHomes', () => {
    it('should construct filter object correctly', async () => {
      const mockGetHomes = jest.fn().mockReturnValue([]);
      jest.spyOn(homeService, 'getHomes').mockImplementation(mockGetHomes);
      await controller.getHomes('Jakarta', '100000000');

      expect(mockGetHomes).toBeCalledWith({
        city: 'Jakarta',
        price: {
          gte: 100000000,
        },
      });
    });
  });

  describe('updateHome', () => {
    const mockUserInfo = {
      name: 'Wahyu Budi Utomo',
      id: 99,
      iat: 1,
      exp: 2,
    };

    const mockUpdateHomeParams = {
      city: 'Updated Jakarta',
      address: '1111 Jendral Sudirman',
      price: 400000000,
      numberOfBathrooms: 3,
      numberOfBedrooms: 5,
      landSize: 4444,
      propertyType: PropertyType.CONDO,
    };

    it("should throw unauth error if realtor didn't create home", async () => {
      await expect(
        controller.updateHome(11, mockUpdateHomeParams, mockUserInfo),
      ).rejects.toThrowError(UnauthorizedException);
    });

    it('should update home if realtor id is valid', async () => {
      const mockUpdateHome = jest.fn().mockReturnValue(mockHome);

      jest
        .spyOn(homeService, 'updateHomeById')
        .mockImplementation(mockUpdateHome);

      await controller.updateHome(5, mockUpdateHomeParams, {
        ...mockUserInfo,
        id: 100,
      });

      expect(mockUpdateHome).toBeCalled();
    });
  });
});
