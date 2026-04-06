import { execSync } from 'node:child_process';

export async function generateReleaseTag(): Promise<string> {
  const today = new Date().toISOString().split('T')[0];

  // Get all existing tags
  const tagsOutput = execSync('git tag --list', { encoding: 'utf-8' });
  const tags = tagsOutput.split('\n').filter(Boolean);

  // Find tags matching today's date pattern (YYYY-MM-DD.N)
  const todayTags = tags
    .filter((tag) => tag.match(/^\d{4}-\d{2}-\d{2}\.\d+$/))
    .filter((tag) => tag.startsWith(today))
    .map((tag) => parseInt(tag.split('.')[1], 10))
    .filter((n) => !Number.isNaN(n));

  const nextSequence = todayTags.length + 1;

  return `${today}.${nextSequence}`;
}
