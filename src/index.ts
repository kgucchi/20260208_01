import { ReportGenerator } from './report-generator.js';

/**
 * 覆面調査レポート作成システム
 *
 * 顧客満足度（CS）向上と売上・リピート率最大化を目的とした
 * 覆面調査レポート作成・分析ツール
 */

const generator = new ReportGenerator();

// サンプルレポート作成
const sampleReport = generator.createReport({
  shopName: 'カフェ・ドゥ・パリ 渋谷店',
  visitDate: new Date('2026-02-08'),
  inspector: '調査員A',
  ratings: {
    serviceQuality: 5,
    cleanliness: 4,
    staffAttitude: 5,
    productQuality: 4,
    atmosphere: 5,
  },
  comments: {
    strengths: [
      'スタッフの笑顔と丁寧な接客',
      '店内の清潔感が素晴らしい',
      '商品提供が迅速',
    ],
    improvements: [
      'メニューの説明がもう少し詳しくあると良い',
      'Wi-Fi速度の改善',
    ],
    generalFeedback: '総合的に非常に満足度の高い店舗。リピート確実。',
  },
  recommendations: [
    'スタッフ教育プログラムを他店舗に展開',
    'メニュー説明カードの導入を検討',
    'ロイヤルティプログラムの強化でリピート率向上',
  ],
  repeatIntention: 'high',
});

console.log('\n📊 レポートサマリー:');
const summary = generator.generateSummary();
console.log(`平均評価: ${summary.averageRating.toFixed(2)}/5.0`);
console.log(`リピート意向率: ${summary.repeatRate.toFixed(1)}%`);

console.log('\n🎯 システム準備完了');
console.log('顧客満足度向上とリピート率最大化を支援します。');

export { ReportGenerator };
export type { MysteryShopperReport, ReportSummary } from './types.js';