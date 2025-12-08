import { Client } from '@prisma/client'
import { DateHelper, CurrencyHelper } from "../../../common/helpers";

export class PlanResource {
  constructor(private readonly plan: Client) {}

  toArray(): Record<string, any> {
    const data: Record<string, any> = {
      NOME: this.plan.name,
      PREÇO: CurrencyHelper.formatBRWithSymbol(Number(this.plan.price)),
      "BUSCAS POR FORNECEDORES": this.plan.supplierSearch || 0,
      "ESTUDOS DE VIABILIDADE": this.plan.viabilityStudy || 0,
      STATUS: this.plan.deletedAt ? "Desativado" : "Ativo",
      "CADASTRADO EM": this.plan.createdAt ? DateHelper.formatBRWithTime(this.plan.createdAt) : "",
    };

    return data;
  }
}

