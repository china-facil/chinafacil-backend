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
    const pricePerKg = this.calculatePricePerKg(freight, weightInKg, weight);
    const calculatedDistance = distance || 1000;
    const freightByKm = this.round2(calculatedDistance * pricePerKg * weightInKg);

    const breakdown = this.buildInitialBreakdown(
      calculatedDistance,
      weight,
      weightInKg,
      pricePerKg,
      freightByKm,
      volume,
    );

    this.addGrisToBreakdown(breakdown, cifValue, freight);

    const total = freightByKm + (breakdown.gris || 0);
    const resultWithMinimumTax = this.applyMinimumTax(total, freight, breakdown);

    if (resultWithMinimumTax) {
      return resultWithMinimumTax;
    }

    return {
      total: this.round2(total),
      breakdown,
    };
  }

  private calculatePricePerKg(freight: any, weightInKg: number, weight: number): number {
    if (!freight) {
      return this.getPricePerKm(weight);
    }

    const weightPriceMap = [
      { maxWeight: 10, price: freight.peso10 },
      { maxWeight: 20, price: freight.peso20 },
      { maxWeight: 35, price: freight.peso35 },
      { maxWeight: 50, price: freight.peso50 },
      { maxWeight: 70, price: freight.peso70 },
      { maxWeight: 100, price: freight.peso100 },
      { maxWeight: 300, price: freight.peso300 },
      { maxWeight: 500, price: freight.peso500 },
    ];

    for (const weightPrice of weightPriceMap) {
      if (weightInKg <= weightPrice.maxWeight && weightPrice.price) {
        return Number(weightPrice.price);
      }
    }

    return this.getPricePerKm(weight);
  }

  private buildInitialBreakdown(
    distance: number,
    weight: number,
    weightInKg: number,
    pricePerKg: number,
    freightByKm: number,
    volume?: number,
  ): any {
    const breakdown: any = {
      distance,
      weight,
      weightInKg,
      pricePerKg,
      freightByKm,
    };

    if (volume) {
      breakdown.volume = volume;
      breakdown.cbm = this.calculateCBM(volume, weight);
    }

    return breakdown;
  }

  private addGrisToBreakdown(breakdown: any, cifValue?: number, freight?: any): void {
    if (!cifValue || !freight) {
      return;
    }

    const grisRate = freight.gris ? Number(freight.gris) : 0;
    const grisMin = freight.grisMin ? Number(freight.grisMin) : 0;
    let gris = this.round2((cifValue * grisRate) / 100);

    if (grisMin > 0 && gris < grisMin) {
      gris = grisMin;
    }

    breakdown.cifValue = cifValue;
    breakdown.gris = gris;
  }

  private applyMinimumTax(total: number, freight: any, breakdown: any): any | null {
    if (!freight?.taxaMin) {
      return null;
    }

    const taxaMin = Number(freight.taxaMin);
    if (total >= taxaMin) {
      return null;
    }

    breakdown.taxaMin = taxaMin;
    return {
      total: taxaMin,
      breakdown: {
        ...breakdown,
        total: taxaMin,
      },
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
