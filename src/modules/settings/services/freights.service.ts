import { Injectable, Logger, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../../../database/prisma.service'
import {
  CalculateFreightDto,
  CreateFreightDto,
  UpdateFreightDto,
} from '../dto'

@Injectable()
export class FreightsService {
  private readonly logger = new Logger(FreightsService.name);

  private readonly freightTables = [
    { maxWeight: 1000, pricePerKm: 8.71225 },
    { maxWeight: 3000, pricePerKm: 9.5580625 },
    { maxWeight: 6000, pricePerKm: 10.4039375 },
    { maxWeight: 12000, pricePerKm: 11.334375 },
    { maxWeight: 25000, pricePerKm: 14.23125 },
  ];

  constructor(private readonly prisma: PrismaService) {}

  async create(createFreightDto: CreateFreightDto) {
    const freight = await this.prisma.freight.create({
      data: createFreightDto,
    });

    return freight;
  }

  async findAll() {
    const freights = await this.prisma.freight.findMany({
      orderBy: {
        destino: "asc",
      },
    });

    return freights;
  }

  async findOne(id: string | bigint) {
    const freightId = typeof id === "string" ? BigInt(id) : id;
    const freight = await this.prisma.freight.findUnique({
      where: { id: freightId },
    });

    if (!freight) {
      throw new NotFoundException("Frete não encontrado");
    }

    return freight;
  }

  async update(id: string | bigint, updateFreightDto: UpdateFreightDto) {
    const freightId = typeof id === "string" ? BigInt(id) : id;
    const freight = await this.prisma.freight.findUnique({
      where: { id: freightId },
    });

    if (!freight) {
      throw new NotFoundException("Frete não encontrado");
    }

    const updatedFreight = await this.prisma.freight.update({
      where: { id: freightId },
      data: updateFreightDto,
    });

    return updatedFreight;
  }

  async remove(id: string | bigint) {
    const freightId = typeof id === "string" ? BigInt(id) : id;
    const freight = await this.prisma.freight.findUnique({
      where: { id: freightId },
    });

    if (!freight) {
      throw new NotFoundException("Frete não encontrado");
    }

    await this.prisma.freight.delete({
      where: { id: freightId },
    });

    return {
      message: "Frete removido com sucesso",
    };
  }

  async calculateFreight(calculateDto: CalculateFreightDto) {
    const { origin, destination, weight, volume, cifValue, distance } = calculateDto;

    const freight = await this.findNearestFreight(origin, destination);

    if (!freight && !distance) {
      throw new NotFoundException("Frete não encontrado e distância não fornecida");
    }

    const weightInKg = weight / 1000;
    let pricePerKg = 0;

    if (freight) {
      if (weightInKg <= 10 && freight.peso10) {
        pricePerKg = Number(freight.peso10);
      } else if (weightInKg <= 20 && freight.peso20) {
        pricePerKg = Number(freight.peso20);
      } else if (weightInKg <= 35 && freight.peso35) {
        pricePerKg = Number(freight.peso35);
      } else if (weightInKg <= 50 && freight.peso50) {
        pricePerKg = Number(freight.peso50);
      } else if (weightInKg <= 70 && freight.peso70) {
        pricePerKg = Number(freight.peso70);
      } else if (weightInKg <= 100 && freight.peso100) {
        pricePerKg = Number(freight.peso100);
      } else if (weightInKg <= 300 && freight.peso300) {
        pricePerKg = Number(freight.peso300);
      } else if (weightInKg <= 500 && freight.peso500) {
        pricePerKg = Number(freight.peso500);
      }
    }

    if (pricePerKg === 0) {
      pricePerKg = this.getPricePerKm(weight);
    }

    const calculatedDistance = distance || 1000;
    const freightByKm = this.round2(calculatedDistance * pricePerKg * weightInKg);

    const breakdown: any = {
      distance: calculatedDistance,
      weight,
      weightInKg,
      pricePerKg,
      freightByKm,
    };

    if (volume) {
      breakdown.volume = volume;
      breakdown.cbm = this.calculateCBM(volume, weight);
    }

    if (cifValue && freight) {
      const grisRate = freight.gris ? Number(freight.gris) : 0;
      const grisMin = freight.grisMin ? Number(freight.grisMin) : 0;
      let gris = this.round2((cifValue * grisRate) / 100);

      if (grisMin > 0 && gris < grisMin) {
        gris = grisMin;
      }

      breakdown.cifValue = cifValue;
      breakdown.gris = gris;
    }

    const total = freightByKm + (breakdown.gris || 0);

    if (freight?.taxaMin) {
      const taxaMin = Number(freight.taxaMin);
      if (total < taxaMin) {
        breakdown.taxaMin = taxaMin;
        return {
          total: taxaMin,
          breakdown: {
            ...breakdown,
            total: taxaMin,
          },
        };
      }
    }

    return {
      total: this.round2(total),
      breakdown,
    };
  }

  async findNearestFreight(origin: string, destination: string) {
    const freights = await this.prisma.freight.findMany({
      where: {
        OR: [
          { destino: { contains: destination } },
          { cep: { contains: destination } },
          { uf: { contains: destination } },
        ],
      },
      orderBy: {
        createdAt: "asc",
      },
      take: 1,
    });

    return freights[0] || null;
  }

  calculateCBM(volume: number, weight: number): number {
    const cbm = volume / 1000000;
    const weightInKg = weight / 1000;
    return Math.max(cbm, weightInKg / 167);
  }

  private getPricePerKm(weight: number): number {
    for (const table of this.freightTables) {
      if (weight <= table.maxWeight) {
        return table.pricePerKm;
      }
    }
    return 0;
  }

  private round2(value: number): number {
    return Math.round(value * 100) / 100;
  }
}
