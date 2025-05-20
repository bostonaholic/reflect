import { GitHubPr } from "./types.js";

export async function generateReviewCommentsDocument(items: GitHubPr[]): Promise<string> {
  const repos = new Set(items.map(item => item.repository));
  const prs = items.filter(item => item.type === 'pr').length;
  const commentsCount = items.reduce((acc, item) => acc + item.comments.length, 0);
  const reviewCommentsCount = items.reduce((acc, item) => {
    return acc + item.reviews.reduce((acc, review) => acc + review.comments.length, 0);
  }, 0);

  let markdownContent = '# GitHub PR comments Report\n\n';
  markdownContent += `## Statistics\n`;
  markdownContent += `- Total Repositories: ${repos.size}\n`;
  markdownContent += `- Total PR reviews: ${prs}\n`;
  markdownContent += `- Total PR comments: ${commentsCount + reviewCommentsCount}\n`;
  markdownContent += `## Repositories\n`;
  markdownContent += Array.from(repos).map(repo => `- ${repo}`).join('\n');
  markdownContent += '\n\n';

  items.sort((a, b) => new Date(b.closedAt).getTime() - new Date(a.closedAt).getTime())
    .forEach((item) => {
      markdownContent += `## ${item.title}\n`;
      markdownContent += `Link: ${item.permalink}\n`;
      markdownContent += `Type: ${item.type === 'pr' ? 'Pull Request' : 'Issue'}\n`;
      markdownContent += `Repository: ${item.repository}\n`;
      markdownContent += `Comments:\n`;
      item.comments.forEach(comment => {
          markdownContent += ` - ${comment.body}\n`;
        });
      markdownContent += `Reviews:\n`;
      item.reviews.forEach(review => {
        markdownContent += ` - ${review.state}: ${review.body}\n`;
        review.comments.forEach(comment => {
          markdownContent += ` - ${comment.body}\n`;
        });
     });
      markdownContent += "---\n\n";
    });

  return markdownContent;
}