import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-floating-action-button',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fab-container">
      <button class="fab-main" 
              [class.active]="isOpen"
              (click)="toggleMenu()"
              aria-label="Quick actions">
        <span class="fab-icon">{{ isOpen ? '×' : '+' }}</span>
      </button>
      
      <div class="fab-menu" [class.open]="isOpen">
        <button class="fab-item add-habit" 
                (click)="onAddHabit()"
                title="Add new habit">
          <span class="fab-item-icon">🎯</span>
          <span class="fab-item-label">Add Habit</span>
        </button>
        
        <button class="fab-item view-calendar" 
                (click)="onViewCalendar()"
                title="View calendar">
          <span class="fab-item-icon">📅</span>
          <span class="fab-item-label">Calendar</span>
        </button>
        
        <button class="fab-item view-stats" 
                (click)="onViewStats()"
                title="View statistics">
          <span class="fab-item-icon">📊</span>
          <span class="fab-item-label">Statistics</span>
        </button>
      </div>
      
      <div class="fab-backdrop" 
           [class.visible]="isOpen"
           (click)="closeMenu()">
      </div>
    </div>
  `,
  styleUrls: ['./floating-action-button.component.scss']
})
export class FloatingActionButtonComponent {
  @Output() addHabit = new EventEmitter<void>();
  @Output() viewCalendar = new EventEmitter<void>();
  @Output() viewStats = new EventEmitter<void>();
  
  isOpen = false;

  toggleMenu(): void {
    this.isOpen = !this.isOpen;
  }

  closeMenu(): void {
    this.isOpen = false;
  }

  onAddHabit(): void {
    this.addHabit.emit();
    this.closeMenu();
  }

  onViewCalendar(): void {
    this.viewCalendar.emit();
    this.closeMenu();
  }

  onViewStats(): void {
    this.viewStats.emit();
    this.closeMenu();
  }
}