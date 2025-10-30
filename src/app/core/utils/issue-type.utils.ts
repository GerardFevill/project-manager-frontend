import { IssueType } from '../models';

/**
 * Jira-style Issue Type Configuration
 * Provides icons, colors, and labels for each issue type
 */

export interface IssueTypeConfig {
  icon: string;
  color: string;
  backgroundColor: string;
  label: string;
}

export const ISSUE_TYPE_CONFIG: Record<IssueType, IssueTypeConfig> = {
  [IssueType.EPIC]: {
    icon: 'bolt',
    color: '#6554C0',
    backgroundColor: '#EAE6FF',
    label: 'Epic',
  },
  [IssueType.STORY]: {
    icon: 'bookmark',
    color: '#00875A',
    backgroundColor: '#E3FCEF',
    label: 'Story',
  },
  [IssueType.TASK]: {
    icon: 'check_box',
    color: '#0052CC',
    backgroundColor: '#DEEBFF',
    label: 'Task',
  },
  [IssueType.BUG]: {
    icon: 'bug_report',
    color: '#DE350B',
    backgroundColor: '#FFEBE6',
    label: 'Bug',
  },
  [IssueType.SUBTASK]: {
    icon: 'subdirectory_arrow_right',
    color: '#5E6C84',
    backgroundColor: '#F4F5F7',
    label: 'Sub-task',
  },
};

/**
 * Get issue type configuration
 */
export function getIssueTypeConfig(issueType: IssueType): IssueTypeConfig {
  return ISSUE_TYPE_CONFIG[issueType] || ISSUE_TYPE_CONFIG[IssueType.TASK];
}

/**
 * Get issue type icon name
 */
export function getIssueTypeIcon(issueType: IssueType): string {
  return getIssueTypeConfig(issueType).icon;
}

/**
 * Get issue type color
 */
export function getIssueTypeColor(issueType: IssueType): string {
  return getIssueTypeConfig(issueType).color;
}

/**
 * Get issue type background color
 */
export function getIssueTypeBackgroundColor(issueType: IssueType): string {
  return getIssueTypeConfig(issueType).backgroundColor;
}

/**
 * Get issue type label
 */
export function getIssueTypeLabel(issueType: IssueType): string {
  return getIssueTypeConfig(issueType).label;
}
