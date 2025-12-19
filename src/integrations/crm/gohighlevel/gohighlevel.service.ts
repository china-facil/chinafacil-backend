import { HttpService } from '@nestjs/axios'
import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { firstValueFrom } from 'rxjs'
import { AxiosRequestConfig } from "axios";

export interface ContactData {
  firstName?: string;
  email?: string;
  phone?: string;
  locationId?: string;
  tags?: string[];
  customFields?: Array<{ field: string; value: string }>;
  source?: string;
}

export interface CreateOrUpdateContactResult {
  success: boolean;
  contact_id?: string;
  action?: "created" | "updated";
  data?: any;
  error?: string;
}

@Injectable()
export class GoHighLevelService {
  private readonly logger = new Logger(GoHighLevelService.name);
  private readonly apiToken: string;
  private readonly locationId: string;
  private readonly baseUrl: string;
  private readonly apiVersion: string = "2021-07-28";
  private readonly timeout: number = 30000;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService
  ) {
    this.apiToken = this.configService.get("GHL_TOKEN") || "";
    this.locationId = this.configService.get("GHL_LOCATION_ID") || "";
    this.baseUrl = this.configService.get("GHL_BASE_URL") || "https://services.leadconnectorhq.com";

    if (!this.apiToken || !this.locationId) {
      this.logger.warn("⚠️ GoHighLevel credentials not configured. GHL_TOKEN and GHL_LOCATION_ID are required.");
    }
  }

  private getHeaders(): Record<string, string> {
    return {
      Authorization: `Bearer ${this.apiToken}`,
      Version: this.apiVersion,
      Accept: "application/json",
      "Content-Type": "application/json",
    };
  }

  private getRequestConfig(): AxiosRequestConfig {
    return {
      headers: this.getHeaders(),
      timeout: this.timeout,
    };
  }

  private validateCredentials(): void {
    if (!this.apiToken || !this.locationId) {
      throw new Error(
        "GoHighLevel credentials not configured. Please set GHL_TOKEN and GHL_LOCATION_ID environment variables."
      );
    }
  }

  private normalizePhone(phone: string): string {
    if (!phone) return "";

    let normalized = phone.replace(/\D/g, "");

    if (!normalized.startsWith("55")) {
      normalized = "55" + normalized;
    }

    if (normalized.length === 12) {
      const ddd = normalized.substring(2, 4);
      const rest = normalized.substring(4);
      normalized = `55${ddd}9${rest}`;
    }

    return normalized;
  }

  private formatCurrency(value: string | number): string {
    if (!value) return "";

    const numericValue =
      typeof value === "string" ? parseFloat(value.replace(/[^\d,.-]/g, "").replace(",", ".")) : value;

    if (isNaN(numericValue)) return "";

    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(numericValue);
  }

  mapCustomFields(customFields?: Record<string, any>): Array<{ field: string; value: string }> {
    if (!customFields) return [];

    const fieldMapping: Record<string, string> = {
      company_name: "company_name_id",
      products_interest: "products_interest_id",
      monthly_revenue: "monthly_revenue_id",
      investment_available: "investment_available_id",
      contact_preference: "contact_preference_id",
    };

    const mapped: Array<{ field: string; value: string }> = [];

    for (const [key, value] of Object.entries(customFields)) {
      if (value && fieldMapping[key]) {
        mapped.push({
          field: fieldMapping[key],
          value: String(value),
        });
      }
    }

    return mapped;
  }

  private removeEmptyFields(data: any): any {
    const cleaned: any = {};
    for (const [key, value] of Object.entries(data)) {
      if (value !== null && value !== undefined && value !== "") {
        if (Array.isArray(value) && value.length > 0) {
          cleaned[key] = value;
        } else if (typeof value === "object" && !Array.isArray(value)) {
          const cleanedObj = this.removeEmptyFields(value);
          if (Object.keys(cleanedObj).length > 0) {
            cleaned[key] = cleanedObj;
          }
        } else if (!Array.isArray(value)) {
          cleaned[key] = value;
        }
      }
    }
    return cleaned;
  }

  async createOrUpdateContact(contactData: ContactData): Promise<CreateOrUpdateContactResult> {
    try {
      this.validateCredentials();

      const normalizedData: any = {
        firstName: contactData.firstName,
        email: contactData.email,
        phone: contactData.phone ? this.normalizePhone(contactData.phone) : undefined,
        locationId: contactData.locationId || this.locationId,
        tags: contactData.tags || ["lead-importação-typeform"],
      };

      if (contactData.customFields) {
        normalizedData.customFields = contactData.customFields;
      }

      const cleanedData = this.removeEmptyFields(normalizedData);

      this.logger.log(`📤 Creating/updating contact: ${contactData.email || contactData.phone}`);

      const response = await firstValueFrom(
        this.httpService.post(`${this.baseUrl}/contacts/upsert`, cleanedData, this.getRequestConfig())
      );

      const contactId = response.data?.contact?.id || response.data?.id;

      this.logger.log(`✅ Contact created/updated: ${contactId}`);

      return {
        success: true,
        contact_id: contactId,
        data: response.data,
      };
    } catch (error: any) {
      this.logger.error(`❌ GoHighLevel create/update contact error: ${error.message}`);
      if (error.response) {
        this.logger.error(`Response data: ${JSON.stringify(error.response.data)}`);
      }
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async findContact(phone?: string, email?: string): Promise<any | null> {
    try {
      this.validateCredentials();

      if (!phone && !email) {
        return null;
      }

      const params: any = {
        locationId: this.locationId,
        limit: 1,
      };

      if (phone) {
        params.phone = this.normalizePhone(phone);
      }

      if (email) {
        params.email = email;
      }

      this.logger.log(`🔍 Searching contact: ${email || phone}`);

      const response = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}/contacts/search`, {
          ...this.getRequestConfig(),
          params,
        })
      );

      const contacts = response.data?.contacts || [];
      const contact = contacts.length > 0 ? contacts[0] : null;

      if (contact) {
        this.logger.log(`📥 Contact found: ${contact.id}`);
      } else {
        this.logger.log(`📭 Contact not found`);
      }

      return contact;
    } catch (error: any) {
      this.logger.error(`❌ GoHighLevel find contact error: ${error.message}`);
      return null;
    }
  }

  async processSiteLead(leadData: {
    firstName?: string;
    email?: string;
    phone?: string;
    monthly_revenue?: string | number;
  }): Promise<CreateOrUpdateContactResult> {
    try {
      this.validateCredentials();

      const normalizedPhone = leadData.phone ? this.normalizePhone(leadData.phone) : undefined;
      const normalizedEmail = leadData.email?.toLowerCase().trim();

      this.logger.log(`🔍 Processing site lead: ${normalizedEmail || normalizedPhone}`);

      const existingContact = await this.findContact(normalizedPhone, normalizedEmail);

      if (existingContact) {
        this.logger.log(`📊 Updating existing contact: ${existingContact.id}`);
        return await this.updateExistingContact(existingContact.id, leadData.monthly_revenue);
      } else {
        this.logger.log(`➕ Creating new site contact`);
        return await this.createNewSiteContact({
          firstName: leadData.firstName,
          email: normalizedEmail,
          phone: normalizedPhone,
          monthly_revenue: leadData.monthly_revenue,
        });
      }
    } catch (error: any) {
      this.logger.error(`❌ GoHighLevel process site lead error: ${error.message}`);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  private async updateExistingContact(
    contactId: string,
    monthlyRevenue?: string | number
  ): Promise<CreateOrUpdateContactResult> {
    try {
      const updateData: any = {
        tags: ["lead-site"],
      };

      if (monthlyRevenue) {
        updateData.customFields = [
          {
            field: "EZ0p5y9FLCkGLwoCh1Y6",
            value: this.formatCurrency(monthlyRevenue),
          },
        ];
      }

      this.logger.log(`📤 Updating contact ${contactId} with tag lead-site`);

      const response = await firstValueFrom(
        this.httpService.put(`${this.baseUrl}/contacts/${contactId}`, updateData, this.getRequestConfig())
      );

      this.logger.log(`✅ Contact updated: ${contactId}`);

      return {
        success: true,
        contact_id: contactId,
        action: "updated",
        data: response.data,
      };
    } catch (error: any) {
      this.logger.error(`❌ GoHighLevel update contact error: ${error.message}`);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  private async createNewSiteContact(contactData: {
    firstName?: string;
    email?: string;
    phone?: string;
    monthly_revenue?: string | number;
  }): Promise<CreateOrUpdateContactResult> {
    try {
      if (!contactData.firstName && !contactData.email && !contactData.phone) {
        throw new Error("At least one of firstName, email, or phone is required");
      }

      const upsertData: any = {
        locationId: this.locationId,
        tags: ["lead-site"],
      };

      if (contactData.firstName) {
        upsertData.firstName = contactData.firstName;
      }

      if (contactData.email) {
        upsertData.email = contactData.email;
      }

      if (contactData.phone) {
        upsertData.phone = contactData.phone;
      }

      if (contactData.monthly_revenue) {
        upsertData.customFields = [
          {
            field: "EZ0p5y9FLCkGLwoCh1Y6",
            value: this.formatCurrency(contactData.monthly_revenue),
          },
        ];
      }

      const cleanedData = this.removeEmptyFields(upsertData);

      this.logger.log(`📤 Creating new site contact`);

      const response = await firstValueFrom(
        this.httpService.post(`${this.baseUrl}/contacts/upsert`, cleanedData, this.getRequestConfig())
      );

      const contactId = response.data?.contact?.id || response.data?.id;

      this.logger.log(`✅ New site contact created: ${contactId}`);

      return {
        success: true,
        contact_id: contactId,
        action: "created",
        data: response.data,
      };
    } catch (error: any) {
      this.logger.error(`❌ GoHighLevel create site contact error: ${error.message}`);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async listCustomFields(): Promise<any[]> {
    try {
      this.validateCredentials();

      const response = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}/locations/${this.locationId}/customFields`, this.getRequestConfig())
      );

      return response.data?.customFields || [];
    } catch (error: any) {
      this.logger.error(`❌ GoHighLevel list custom fields error: ${error.message}`);
      return [];
    }
  }

  async findCustomFieldIdByName(fieldName: string): Promise<string | null> {
    try {
      const customFields = await this.listCustomFields();
      const field = customFields.find((f: any) => f.name?.toLowerCase() === fieldName.toLowerCase());
      return field?.id || null;
    } catch (error: any) {
      this.logger.error(`❌ GoHighLevel find custom field error: ${error.message}`);
      return null;
    }
  }

  async addTag(contactId: string, tags: string[]): Promise<any> {
    try {
      this.validateCredentials();

      const response = await firstValueFrom(
        this.httpService.post(`${this.baseUrl}/contacts/${contactId}/tags`, { tags }, this.getRequestConfig())
      );

      this.logger.log(`✅ Tags added to contact: ${contactId}`);

      return response.data;
    } catch (error: any) {
      this.logger.error(`❌ GoHighLevel add tag error: ${error.message}`);
      throw error;
    }
  }

  async removeTag(contactId: string, tags: string[]): Promise<any> {
    try {
      this.validateCredentials();

      const response = await firstValueFrom(
        this.httpService.delete(`${this.baseUrl}/contacts/${contactId}/tags`, {
          ...this.getRequestConfig(),
          data: { tags },
        })
      );

      this.logger.log(`✅ Tags removed from contact: ${contactId}`);

      return response.data;
    } catch (error: any) {
      this.logger.error(`❌ GoHighLevel remove tag error: ${error.message}`);
      throw error;
    }
  }

  async getContact(contactId: string): Promise<any> {
    try {
      this.validateCredentials();

      const response = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}/contacts/${contactId}`, this.getRequestConfig())
      );

      return response.data;
    } catch (error: any) {
      this.logger.error(`❌ GoHighLevel get contact error: ${error.message}`);
      throw error;
    }
  }
}
