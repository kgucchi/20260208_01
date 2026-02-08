import type { MysteryShopperReport, ReportSummary } from './types.js';

/**
 * 覆面調査レポート生成クラス
 */
export class ReportGenerator {
  private reports: MysteryShopperReport[] = [];

  /**
   * 新規レポートを作成
   */
  createReport(data: Omit<MysteryShopperReport, 'id' | 'createdAt' | 'updatedAt'>): MysteryShopperReport {
    const report: MysteryShopperReport = {
      ...data,
      id: this.generateId(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.reports.push(report);
    console.log(`✅ レポート作成完了: ${report.shopName} (${report.id})`);

    return report;
  }

  /**
   * レポートサマリーを生成
   */
  generateSummary(): ReportSummary {
    if (this.reports.length === 0) {
      return {
        averageRating: 0,
        totalReports: 0,
        repeatRate: 0,
        topStrengths: [],
        topImprovements: [],
      };
    }

    const totalRating = this.reports.reduce((sum, report) => {
      const ratings = report.ratings;
      const avg = (ratings.serviceQuality + ratings.cleanliness +
                   ratings.staffAttitude + ratings.productQuality +
                   ratings.atmosphere) / 5;
      return sum + avg;
    }, 0);

    const highRepeatCount = this.reports.filter(r => r.repeatIntention === 'high').length;

    return {
      averageRating: totalRating / this.reports.length,
      totalReports: this.reports.length,
      repeatRate: (highRepeatCount / this.reports.length) * 100,
      topStrengths: this.extractTopItems('strengths'),
      topImprovements: this.extractTopItems('improvements'),
    };
  }

  /**
   * HTMLレポートを生成
   */
  generateHTMLReport(report: MysteryShopperReport): string {
    return `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <title>覆面調査レポート - ${report.shopName}</title>
  <style>
    body { font-family: 'Hiragino Sans', sans-serif; max-width: 800px; margin: 40px auto; }
    h1 { color: #333; border-bottom: 3px solid #4CAF50; }
    .rating { display: flex; gap: 10px; margin: 10px 0; }
    .star { color: #FFD700; }
    .section { margin: 20px 0; padding: 15px; background: #f5f5f5; border-radius: 8px; }
  </style>
</head>
<body>
  <h1>覆面調査レポート</h1>
  <div class="section">
    <h2>基本情報</h2>
    <p><strong>店舗名:</strong> ${report.shopName}</p>
    <p><strong>調査日:</strong> ${report.visitDate.toLocaleDateString('ja-JP')}</p>
    <p><strong>調査員:</strong> ${report.inspector}</p>
  </div>

  <div class="section">
    <h2>評価</h2>
    <div class="rating">
      <span>サービス品質:</span>
      <span>${'★'.repeat(report.ratings.serviceQuality)}</span>
    </div>
    <div class="rating">
      <span>清潔感:</span>
      <span>${'★'.repeat(report.ratings.cleanliness)}</span>
    </div>
    <div class="rating">
      <span>スタッフ対応:</span>
      <span>${'★'.repeat(report.ratings.staffAttitude)}</span>
    </div>
  </div>

  <div class="section">
    <h2>改善提案</h2>
    <ul>
      ${report.recommendations.map(r => `<li>${r}</li>`).join('')}
    </ul>
  </div>
</body>
</html>`;
  }

  private generateId(): string {
    return `REPORT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private extractTopItems(type: 'strengths' | 'improvements'): string[] {
    const items = this.reports.flatMap(r => r.comments[type]);
    const frequency = items.reduce((acc, item) => {
      acc[item] = (acc[item] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(frequency)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([item]) => item);
  }
}