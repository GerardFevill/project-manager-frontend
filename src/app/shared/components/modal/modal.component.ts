import {
  Component,
  Input,
  Output,
  EventEmitter,
  signal,
  HostListener,
  OnInit,
  OnDestroy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'jira-modal',
  standalone: true,
  imports: [CommonModule, IconComponent],
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss'],
})
export class ModalComponent implements OnInit, OnDestroy {
  @Input() isOpen = signal(false);
  @Input() title: string = '';
  @Input() size: 'small' | 'medium' | 'large' | 'xlarge' = 'medium';
  @Input() showCloseButton: boolean = true;
  @Input() closeOnBackdropClick: boolean = true;
  @Input() closeOnEscape: boolean = true;

  @Output() closed = new EventEmitter<void>();

  constructor() {}

  ngOnInit(): void {
    // Prevent body scroll when modal is open
    if (this.isOpen()) {
      document.body.style.overflow = 'hidden';
    }
  }

  ngOnDestroy(): void {
    // Restore body scroll
    document.body.style.overflow = '';
  }

  close(): void {
    this.isOpen.set(false);
    document.body.style.overflow = '';
    this.closed.emit();
  }

  onBackdropClick(): void {
    if (this.closeOnBackdropClick) {
      this.close();
    }
  }

  onModalClick(event: MouseEvent): void {
    // Prevent backdrop click from propagating
    event.stopPropagation();
  }

  @HostListener('document:keydown.escape')
  onEscapePress(): void {
    if (this.closeOnEscape && this.isOpen()) {
      this.close();
    }
  }
}
