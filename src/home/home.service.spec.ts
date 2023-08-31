import { Test, TestingModule } from '@nestjs/testing';
import { HomeService, homeSelect } from './home.service.js';
import { PrismaService } from 'src/prisma/prisma.service.js';
import { PropertyType } from '@prisma/client';
import { NotFoundException } from '@nestjs/common';

const mockGetHomes = [
  {
    id: 11,
    address: '1111 Jendral Sudirman',
    city: 'Jakarta',
    price: 100000000,
    property_type: PropertyType.CONDO,
    image: 'img5',
    number_of_bedrooms: 4,
    number_of_bathrooms: 5,
    images: [
      {
        url: 'img5',
      },
      {
        url: 'img6',
      },
    ],
  },
];

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

const mockImages = [
  {
    id: 1,
    url: 'img5',
  },
  {
    id: 2,
    url: 'img6',
  },
];

describe('HomeService', () => {
  let service: HomeService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HomeService,
        {
          provide: PrismaService,
          useValue: {
            home: {
              findMany: jest.fn().mockReturnValue(mockGetHomes),
              create: jest.fn().mockReturnValue(mockHome),
            },
            image: {
              createMany: jest.fn().mockReturnValue(mockImages),
            },
          },
        },
      ],
    }).compile();

    service = module.get<HomeService>(HomeService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getHomes', () => {
    const filters = {
      city: 'Jakarta',
      price: {
        gte: 10000000,
        lte: 200000000,
      },
      propertyType: PropertyType.CONDO,
    };

    it('should call prisma home.findMany with correct params', async () => {
      const mockPrismaFindManyHomes = jest.fn().mockReturnValue(mockGetHomes);

      jest
        .spyOn(prismaService.home, 'findMany')
        .mockImplementation(mockPrismaFindManyHomes);

      await service.getHomes(filters);

      expect(mockPrismaFindManyHomes).toBeCalledWith({
        select: {
          ...homeSelect,
          images: {
            select: {
              url: true,
            },
            take: 1,
          },
        },
        where: filters,
      });
    });

    it('should throw not found exception if not homes are found', async () => {
      const mockPrismaFindManyHomes = jest.fn().mockReturnValue([]);

      jest
        .spyOn(prismaService.home, 'findMany')
        .mockImplementation(mockPrismaFindManyHomes);

      await expect(service.getHomes(filters)).rejects.toThrowError(
        NotFoundException,
      );
    });
  });

  describe('createHome', () => {
    const mockCreateHomeParams = {
      city: 'Jakarta',
      address: '1111 Jendral Sudirman',
      price: 400000000,
      numberOfBathrooms: 3,
      numberOfBedrooms: 5,
      propertyType: PropertyType.CONDO,
      landSize: 4444,
      images: [
        {
          url: 'img10',
        },
      ],
    };

    it('should call prisma home.create with the correct payload', async () => {
      const mockCreateHome = jest.fn().mockReturnValue(mockHome);

      jest
        .spyOn(prismaService.home, 'create')
        .mockImplementation(mockCreateHome);

      const aasdasd = await service.createHome(mockCreateHomeParams, 3);

      expect(mockCreateHome).toBeCalledWith({
        data: {
          address: '1111 Jendral Sudirman',
          number_of_bathrooms: 3,
          number_of_bedrooms: 5,
          city: 'Jakarta',
          price: 400000000,
          land_size: 4444,
          property_type: PropertyType.CONDO,
          realtor_id: 3,
        },
      });
    });

    it('should call prisma image.createMany with the correct payload', async () => {
      const mockCreateManyImage = jest.fn().mockReturnValue(mockImages);

      jest
        .spyOn(prismaService.image, 'createMany')
        .mockImplementation(mockCreateManyImage);

      await service.createHome(mockCreateHomeParams, 3);

      expect(mockCreateManyImage).toBeCalledWith({
        data: [
          {
            url: 'img10',
            home_id: 11,
          },
        ],
      });
    });
  });
});
