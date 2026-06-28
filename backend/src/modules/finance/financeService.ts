import { FinanceRepository, FinanceFilters } from "./financeRepository";

const generateFinanceId = () => {
  const date = new Date();
  const yearMonth = `${date.getFullYear()}${(date.getMonth() + 1).toString().padStart(2, "0")}`;
  const random = Math.floor(1000 + Math.random() * 9000); // 4 digits
  return `LT-FIN-${yearMonth}-${random}`; // e.g. LT-FIN-202310-1234
};

export class FinanceService {
  private repository: FinanceRepository;

  constructor() {
    this.repository = new FinanceRepository();
  }

  async createApplication(data: any) {
    if (!data.financeId) {
      data.financeId = generateFinanceId();
    }
    const application = await this.repository.createApplication(data);

    await this.repository.addTimeline({
      financeApplicationId: application.id,
      statusBefore: "NEW",
      statusAfter: application.status || "INITIATED",
      comment: "Finance Application Initiated",
      performedBy: "SYSTEM",
    });

    return application;
  }

  async getApplication(id: string) {
    return this.repository.getApplicationById(id);
  }

  async updateApplication(id: string, data: any, performedBy: string = "SYSTEM") {
    const existing = await this.repository.getApplicationById(id);
    if (!existing) {
      throw new Error("Application not found");
    }

    const updated = await this.repository.updateApplication(id, data);

    if (data.status && data.status !== existing.status) {
      await this.repository.addTimeline({
        financeApplicationId: id,
        statusBefore: existing.status,
        statusAfter: data.status,
        comment: `Status updated to ${data.status}`,
        performedBy,
      });
    }

    return updated;
  }

  async listApplications(filters: FinanceFilters) {
    return this.repository.listApplications(filters);
  }

  async addDocument(financeApplicationId: string, data: any) {
    return this.repository.addDocument({
      ...data,
      financeApplicationId,
    });
  }

  async getDocumentById(id: string) {
    return this.repository.getDocumentById(id);
  }

  async deleteApplication(id: string) {
    const existing = await this.repository.getApplicationById(id);
    if (!existing) {
      throw new Error("Application not found");
    }
    return this.repository.deleteApplication(id);
  }
}
