import { Injectable, Logger, NotFoundException } from '@nestjs/common'
import { UserRole } from '@prisma/client'
import { PrismaService } from '../../database/prisma.service'
import { GoHighLevelService } from '../../integrations/crm/gohighlevel/gohighlevel.service'
import { CreateLeadDto, FilterLeadDto, LandingEkonomiDto, UpdateLeadDto } from './dto'
import * as crypto from 'crypto'

@Injectable()
export class LeadsService {
  private readonly logger = new Logger(LeadsService.name)

  constructor(
    private readonly prisma: PrismaService,
    private readonly goHighLevelService: GoHighLevelService,
  ) {}

  async create(createLeadDto: CreateLeadDto) {
    const existing = await this.prisma.user.findFirst({
      where: { 
        email: createLeadDto.email,
      },
    })

    if (existing) {
      return existing
    }

    const lead = await this.prisma.user.create({
      data: {
        id: crypto.randomUUID(),
        name: createLeadDto.name,
        email: createLeadDto.email,
        phone: createLeadDto.phone,
        password: crypto.randomBytes(32).toString('hex'),
        role: UserRole.lead,
        companyData: createLeadDto.company ? { company: createLeadDto.company } : undefined,
      },
    })

    return lead
  }

  async findAll(filterLeadDto: FilterLeadDto) {
    const { search, page = 1, limit = 10 } = filterLeadDto

    const where: any = {
      role: UserRole.lead,
    }

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
        { phone: { contains: search } },
      ]
    }

    const [leads, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          companyData: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      this.prisma.user.count({ where }),
    ])

    return {
      data: leads,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    }
  }

  async findOne(id: string) {
    const lead = await this.prisma.user.findFirst({
      where: { 
        id,
        role: UserRole.lead,
      },
    })

    if (!lead) {
      throw new NotFoundException('Lead não encontrado')
    }

    return lead
  }

  async update(id: string, updateLeadDto: UpdateLeadDto) {
    const lead = await this.findOne(id)

    const updateData: any = {}
    if (updateLeadDto.name) updateData.name = updateLeadDto.name
    if (updateLeadDto.email) updateData.email = updateLeadDto.email
    if (updateLeadDto.phone !== undefined) updateData.phone = updateLeadDto.phone
    if (updateLeadDto.company !== undefined) {
      updateData.companyData = updateLeadDto.company ? { company: updateLeadDto.company } : null
    }

    const updatedLead = await this.prisma.user.update({
      where: { id },
      data: updateData,
    })

    return updatedLead
  }

  async remove(id: string) {
    const lead = await this.findOne(id)

    await this.prisma.user.delete({
      where: { id },
    })

    return {
      message: 'Lead removido com sucesso',
    }
  }

  async convertToUser(id: string) {
    const lead = await this.findOne(id)

    return {
      message: 'Lead já é um usuário',
      lead,
    }
  }

  async getStatsByOrigin() {
    return []
  }

  async getStatsByStatus() {
    return []
  }

  private mapUtmParamsToCustomFields(utmParams: {
    utm_source?: string
    utm_medium?: string
    utm_campaign?: string
    utm_term?: string
    utm_content?: string
    gclid?: string
    fbclid?: string
  }): Array<{ field: string; value: string }> {
    const utmMapping: Record<string, string> = {
      utm_source: 'D8t4V6FkQRrPRxUSxdlA',
      utm_medium: 'uWu1S8Ag7HAwsy1uB5E3',
      utm_campaign: 'fZg6vuLueyqYL44D58Jv',
      utm_term: 'vbtNeAeVldpYg4hEx9xr',
      utm_content: 'UzNYOKiH9gD5S2EmJoV1',
      gclid: 'kitJnT7qyuoWIW3uBj5w',
      fbclid: '2T1YLuAR83UQ5KMrAC7v',
    }

    const customFields: Array<{ field: string; value: string }> = []

    for (const [key, value] of Object.entries(utmParams)) {
      if (value && utmMapping[key]) {
        customFields.push({
          field: utmMapping[key],
          value: String(value),
        })
      }
    }

    return customFields
  }

  async createOrUpdateContactWithTag(
    contactData: {
      firstName: string
      email: string
      phone: string
    },
    tag: string,
    utmParams?: {
      utm_source?: string
      utm_medium?: string
      utm_campaign?: string
      utm_term?: string
      utm_content?: string
      gclid?: string
      fbclid?: string
    },
  ) {
    const customFields = utmParams ? this.mapUtmParamsToCustomFields(utmParams) : undefined

    const result = await this.goHighLevelService.createOrUpdateContact({
      firstName: contactData.firstName,
      email: contactData.email.toLowerCase().trim(),
      phone: contactData.phone,
      tags: [tag],
      customFields,
      source: new Date().toISOString(),
    })

    return result
  }

  async storeLandingEkonomi(landingEkonomiDto: LandingEkonomiDto, clientIp?: string) {
    try {
      this.logger.log(`📥 Landing eKonomi lead received: ${landingEkonomiDto.email}`)

      const contactData = {
        firstName: landingEkonomiDto.nome,
        email: landingEkonomiDto.email,
        phone: landingEkonomiDto.telefone,
      }

      const utmParams = {
        utm_source: landingEkonomiDto.utm_source,
        utm_medium: landingEkonomiDto.utm_medium,
        utm_campaign: landingEkonomiDto.utm_campaign,
        utm_term: landingEkonomiDto.utm_term,
        utm_content: landingEkonomiDto.utm_content,
        gclid: landingEkonomiDto.gclid,
        fbclid: landingEkonomiDto.fbclid,
      }

      const result = await this.createOrUpdateContactWithTag(
        contactData,
        'lead-lp-ekonomi',
        utmParams,
      )

      if (result.success) {
        this.logger.log(`✅ Landing eKonomi lead processed: ${result.contact_id}`)
        return {
          success: true,
          message: 'Lead processado com sucesso',
          contact_id: result.contact_id,
        }
      } else {
        this.logger.error(`❌ Failed to process landing eKonomi lead: ${result.error}`)
        return {
          success: false,
          message: result.error || 'Erro ao processar lead no GoHighLevel',
        }
      }
    } catch (error: any) {
      this.logger.error(`❌ Landing eKonomi error: ${error.message}`)
      throw error
    }
  }
}


