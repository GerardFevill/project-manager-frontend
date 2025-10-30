/**
 * Issue Types - Jira Style
 *
 * EPIC: Large body of work (can have multiple stories)
 * STORY: User story or feature request
 * TASK: Generic task to be done
 * BUG: Bug or defect
 * SUBTASK: Sub-task of another issue
 */
export enum IssueType {
  EPIC = 'epic',
  STORY = 'story',
  TASK = 'task',
  BUG = 'bug',
  SUBTASK = 'subtask',
}
