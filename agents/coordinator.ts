/**
 * Coordinator Agent
 * タスク統括・並列実行制御
 */

import { IssueAgent } from './issue-agent.js';
import { CodeGenAgent } from './codegen-agent.js';
import { PRAgent } from './pr-agent.js';

export interface CoordinatorConfig {
  githubToken: string;
  anthropicApiKey: string;
  repository: string;
  issueNumber: number;
}

export class CoordinatorAgent {
  private issueAgent: IssueAgent;
  private codegenAgent: CodeGenAgent;
  private prAgent: PRAgent;
  private issueNumber: number;

  constructor(config: CoordinatorConfig) {
    this.issueNumber = config.issueNumber;
    this.issueAgent = new IssueAgent(config.githubToken, config.repository);
    this.codegenAgent = new CodeGenAgent(config.anthropicApiKey);
    this.prAgent = new PRAgent(config.githubToken, config.repository);
  }

  async execute(): Promise<void> {
    console.log(`🚀 Starting autonomous execution for issue #${this.issueNumber}`);
    console.log('=====================================');

    try {
      // Step 1: Issue分析
      console.log('\n📋 Step 1/3: Analyzing issue...');
      const analysis = await this.issueAgent.analyze(this.issueNumber);
      console.log(`✅ Issue analyzed: ${analysis.title}`);

      // Step 2: コード生成
      console.log('\n💻 Step 2/3: Generating code...');
      const generatedCode = await this.codegenAgent.generate(analysis);
      console.log(`✅ Generated ${generatedCode.files.length} files`);

      if (generatedCode.files.length === 0) {
        console.log('⚠️  No files generated. Skipping PR creation.');
        return;
      }

      // Step 3: PR作成
      console.log('\n📤 Step 3/3: Creating pull request...');
      const prUrl = await this.prAgent.createPR(
        this.issueNumber,
        generatedCode,
        analysis.title
      );
      console.log(`✅ Pull request created: ${prUrl}`);

      console.log('\n🎉 Autonomous execution completed successfully!');
    } catch (error) {
      console.error('❌ Execution failed:', error);
      throw error;
    }
  }
}
