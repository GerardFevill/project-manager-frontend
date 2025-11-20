import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faGrip,
  faColumns,
  faClipboardList,
  faBolt,
  faListUl,
  faChartBar,
  faCog,
  faSearch,
  faBell,
  faUser,
  faPlus,
  faChevronDown,
  faChevronUp,
  faChevronLeft,
  faChevronRight,
  faTimes,
  faBars,
  faEdit,
  faTrash,
  faEllipsisH,
  faFilter,
  faCalendar,
  faClock,
  faCheck,
  faStar,
  faPaperclip,
  faComment,
  faLink,
  faArrowUp,
  faArrowDown,
  faInfoCircle,
  faExclamationTriangle,
  faTimesCircle,
  faCheckCircle,
  faSun,
  faMoon,
} from '@fortawesome/free-solid-svg-icons';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';

export type IconName =
  | 'dashboard' | 'kanban' | 'issues' | 'sprint' | 'backlog' | 'reports'
  | 'settings' | 'search' | 'notifications' | 'user' | 'plus' | 'chevron-down'
  | 'chevron-up' | 'chevron-left' | 'chevron-right' | 'close' | 'menu'
  | 'edit' | 'delete' | 'more' | 'filter' | 'calendar' | 'clock'
  | 'check' | 'star' | 'attachment' | 'comment' | 'link' | 'arrow-up'
  | 'arrow-down' | 'info' | 'warning' | 'error' | 'success' | 'sun' | 'moon';

@Component({
  selector: 'jira-icon',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule],
  template: `
    <fa-icon
      [icon]="iconMap[name]"
      [style.font-size.px]="size"
      [style.color]="color"
    ></fa-icon>
  `,
  styles: [`
    :host {
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }
  `]
})
export class IconComponent {
  @Input() name: IconName = 'dashboard';
  @Input() size: number = 20;
  @Input() color?: string;

  iconMap: Record<IconName, IconDefinition> = {
    'dashboard': faGrip,
    'kanban': faColumns,
    'issues': faClipboardList,
    'sprint': faBolt,
    'backlog': faListUl,
    'reports': faChartBar,
    'settings': faCog,
    'search': faSearch,
    'notifications': faBell,
    'user': faUser,
    'plus': faPlus,
    'chevron-down': faChevronDown,
    'chevron-up': faChevronUp,
    'chevron-left': faChevronLeft,
    'chevron-right': faChevronRight,
    'close': faTimes,
    'menu': faBars,
    'edit': faEdit,
    'delete': faTrash,
    'more': faEllipsisH,
    'filter': faFilter,
    'calendar': faCalendar,
    'clock': faClock,
    'check': faCheck,
    'star': faStar,
    'attachment': faPaperclip,
    'comment': faComment,
    'link': faLink,
    'arrow-up': faArrowUp,
    'arrow-down': faArrowDown,
    'info': faInfoCircle,
    'warning': faExclamationTriangle,
    'error': faTimesCircle,
    'success': faCheckCircle,
    'sun': faSun,
    'moon': faMoon,
  };
}
