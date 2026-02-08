/**
 * Coordinator Agent
 * タスク統括・並列実行制御
 */

export class CoordinatorAgent {
  constructor(private issueNumber: number) {}

  async analyze(): Promise<void> {
    console.log(`Analyzing issue #${this.issueNumber}`);
  }

  async execute(): Promise<void> {
    console.log(`Executing tasks for issue #${this.issueNumber}`);
  }
}
