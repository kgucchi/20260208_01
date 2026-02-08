/**
 * Issue Agent
 * GitHub Issueを分析し、要件を抽出する
 */

import { Octokit } from '@octokit/rest';

export interface IssueAnalysis {
  issueNumber: number;
  title: string;
  body: string;
  requirements: string[];
  priority: string;
}

export class IssueAgent {
  private octokit: Octokit;
  private owner: string;
  private repo: string;

  constructor(token: string, repository: string) {
    this.octokit = new Octokit({ auth: token });
    const [owner, repo] = repository.split('/');
    this.owner = owner;
    this.repo = repo;
  }

  async analyze(issueNumber: number): Promise<IssueAnalysis> {
    console.log(`📋 Analyzing issue #${issueNumber}...`);

    const { data: issue } = await this.octokit.issues.get({
      owner: this.owner,
      repo: this.repo,
      issue_number: issueNumber,
    });

    return {
      issueNumber,
      title: issue.title,
      body: issue.body || '',
      requirements: this.extractRequirements(issue.body || ''),
      priority: this.extractPriority(issue.labels),
    };
  }

  private extractRequirements(body: string): string[] {
    // 簡易的な要件抽出
    const lines = body.split('\n').filter(line => line.trim());
    return lines;
  }

  private extractPriority(labels: any[]): string {
    const priorityLabel = labels.find(l =>
      typeof l === 'object' && l.name && l.name.includes('priority')
    );
    return priorityLabel ? priorityLabel.name : 'P2-Medium';
  }
}
