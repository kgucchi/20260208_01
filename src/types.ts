/**
 * 覆面調査レポート関連の型定義
 */

export interface MysteryShopperReport {
  id: string;
  shopName: string;
  visitDate: Date;
  inspector: string;

  // 評価項目
  ratings: {
    serviceQuality: number;      // サービス品質 (1-5)
    cleanliness: number;         // 清潔感 (1-5)
    staffAttitude: number;       // スタッフ対応 (1-5)
    productQuality: number;      // 商品品質 (1-5)
    atmosphere: number;          // 雰囲気 (1-5)
  };

  // 詳細コメント
  comments: {
    strengths: string[];         // 良かった点
    improvements: string[];      // 改善点
    generalFeedback: string;     // 総合所見
  };

  // 顧客満足度向上のための提案
  recommendations: string[];

  // リピート意向
  repeatIntention: 'high' | 'medium' | 'low';

  createdAt: Date;
  updatedAt: Date;
}

export interface ReportSummary {
  averageRating: number;
  totalReports: number;
  repeatRate: number;
  topStrengths: string[];
  topImprovements: string[];
}