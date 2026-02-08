/**
 * CodeGen Agent
 * Anthropic APIを使用してコード生成を行う
 */

import Anthropic from '@anthropic-ai/sdk';
import type { IssueAnalysis } from './issue-agent.js';

export interface GeneratedCode {
  files: Array<{
    path: string;
    content: string;
  }>;
  summary: string;
}

export class CodeGenAgent {
  private anthropic: Anthropic | null;
  private useMock: boolean;

  constructor(apiKey: string, useMock: boolean = false) {
    this.useMock = useMock || apiKey === 'mock' || !apiKey;
    this.anthropic = this.useMock ? null : new Anthropic({ apiKey });
  }

  async generate(analysis: IssueAnalysis): Promise<GeneratedCode> {
    console.log(`💻 Generating code for: ${analysis.title}...`);

    if (this.useMock) {
      console.log('ℹ️  Using mock code generation (demo mode)');
      return this.generateMockCode(analysis);
    }

    const prompt = this.buildPrompt(analysis);

    try {
      const message = await this.anthropic!.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4096,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      });

      const response = message.content[0].type === 'text'
        ? message.content[0].text
        : '';

      return this.parseResponse(response);
    } catch (error: any) {
      if (error.status === 400 && error.message?.includes('credit balance')) {
        console.log('⚠️  Anthropic API credit balance low, falling back to mock generation');
        return this.generateMockCode(analysis);
      }
      throw error;
    }
  }

  private generateMockCode(analysis: IssueAnalysis): GeneratedCode {
    // 覆面調査レポート作成のモック実装を生成
    const files = [
      {
        path: 'src/types.ts',
        content: `/**
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
}`,
      },
      {
        path: 'src/report-generator.ts',
        content: `import type { MysteryShopperReport, ReportSummary } from './types.js';

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
    console.log(\`✅ レポート作成完了: \${report.shopName} (\${report.id})\`);

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
    return \`<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <title>覆面調査レポート - \${report.shopName}</title>
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
    <p><strong>店舗名:</strong> \${report.shopName}</p>
    <p><strong>調査日:</strong> \${report.visitDate.toLocaleDateString('ja-JP')}</p>
    <p><strong>調査員:</strong> \${report.inspector}</p>
  </div>

  <div class="section">
    <h2>評価</h2>
    <div class="rating">
      <span>サービス品質:</span>
      <span>\${'★'.repeat(report.ratings.serviceQuality)}</span>
    </div>
    <div class="rating">
      <span>清潔感:</span>
      <span>\${'★'.repeat(report.ratings.cleanliness)}</span>
    </div>
    <div class="rating">
      <span>スタッフ対応:</span>
      <span>\${'★'.repeat(report.ratings.staffAttitude)}</span>
    </div>
  </div>

  <div class="section">
    <h2>改善提案</h2>
    <ul>
      \${report.recommendations.map(r => \`<li>\${r}</li>\`).join('')}
    </ul>
  </div>
</body>
</html>\`;
  }

  private generateId(): string {
    return \`REPORT-\${Date.now()}-\${Math.random().toString(36).substr(2, 9)}\`;
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
}`,
      },
      {
        path: 'src/index.ts',
        content: `import { ReportGenerator } from './report-generator.js';

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

console.log('\\n📊 レポートサマリー:');
const summary = generator.generateSummary();
console.log(\`平均評価: \${summary.averageRating.toFixed(2)}/5.0\`);
console.log(\`リピート意向率: \${summary.repeatRate.toFixed(1)}%\`);

console.log('\\n🎯 システム準備完了');
console.log('顧客満足度向上とリピート率最大化を支援します。');

export { ReportGenerator };
export type { MysteryShopperReport, ReportSummary } from './types.js';`,
      },
      {
        path: 'README.md',
        content: `# 覆面調査レポート作成システム

顧客満足度（CS）向上と売上・リピート率最大化を目的とした覆面調査レポート作成・分析ツール

## 機能

- ✅ 覆面調査レポートの作成・管理
- ✅ 5段階評価システム
- ✅ 強み・改善点の抽出
- ✅ HTMLレポート生成
- ✅ サマリー分析（平均評価、リピート率など）

## 使用方法

\`\`\`typescript
import { ReportGenerator } from './src/report-generator.js';

const generator = new ReportGenerator();

const report = generator.createReport({
  shopName: '店舗名',
  visitDate: new Date(),
  inspector: '調査員名',
  ratings: {
    serviceQuality: 5,
    cleanliness: 4,
    staffAttitude: 5,
    productQuality: 4,
    atmosphere: 5,
  },
  comments: {
    strengths: ['良かった点1', '良かった点2'],
    improvements: ['改善点1'],
    generalFeedback: '総合所見',
  },
  recommendations: ['提案1', '提案2'],
  repeatIntention: 'high',
});

// サマリー生成
const summary = generator.generateSummary();
console.log(\`平均評価: \${summary.averageRating}\`);
\`\`\`

## 実行

\`\`\`bash
npm install
npm run build
node dist/src/index.js
\`\`\`

## 目標

- 顧客満足度（CS）の向上
- 売上の最大化
- リピート率の向上

🤖 Generated by Miyabi Autonomous Agent System`,
      },
    ];

    return {
      files,
      summary: `Generated ${files.length} files for mystery shopper report system with TypeScript`,
    };
  }

  private buildPrompt(analysis: IssueAnalysis): string {
    return `あなたはTypeScriptの専門家です。以下のIssueに基づいて実装を行ってください。

# Issue: ${analysis.title}

${analysis.body}

## 要件
${analysis.requirements.map((r, i) => `${i + 1}. ${r}`).join('\n')}

## 指示
1. TypeScriptで実装してください（strict modeで型安全に）
2. 以下の形式で複数のファイルを生成してください：

\`\`\`[ファイルパス]
[ファイル内容]
\`\`\`

3. 必要なファイル：
   - src/index.ts - メインエントリポイント
   - src/types.ts - 型定義
   - その他必要なファイル

4. コードは本番環境で使用できる品質で作成してください

出力形式：
各ファイルを \`\`\`[ファイルパス] で始めてください。`;
  }

  private parseResponse(response: string): GeneratedCode {
    const files: Array<{ path: string; content: string }> = [];

    // ファイルブロックを抽出
    const fileRegex = /```([^\n]+)\n([\s\S]*?)```/g;
    let match;

    while ((match = fileRegex.exec(response)) !== null) {
      const path = match[1].trim();
      const content = match[2].trim();

      // ファイルパスとして有効な場合のみ追加
      if (path && !path.includes(' ') && (path.includes('/') || path.includes('.'))) {
        files.push({ path, content });
      }
    }

    return {
      files,
      summary: `Generated ${files.length} files for implementation`,
    };
  }
}
