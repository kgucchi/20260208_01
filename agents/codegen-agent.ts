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
  private anthropic: Anthropic;

  constructor(apiKey: string) {
    this.anthropic = new Anthropic({ apiKey });
  }

  async generate(analysis: IssueAnalysis): Promise<GeneratedCode> {
    console.log(`💻 Generating code for: ${analysis.title}...`);

    const prompt = this.buildPrompt(analysis);

    const message = await this.anthropic.messages.create({
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
