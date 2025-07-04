import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HabitService } from '../../services/habit.service';
import { Observable, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';

interface DashboardStats {
  todayCompleted: number;
  todayTotal: number;
  weeklyProgress: number;
  currentStreak: number;
  perfectDays: number;
  completionRate: number;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="dashboard" *ngIf="stats$ | async as stats">
      <div class="dashboard-header">
        <h2>Today's Overview</h2>
        <div class="date-info">
          <span class="current-date">{{ today | date:'EEEE, MMMM d' }}</span>
          <div class="weather-widget">
            <span class="weather-icon">☀️</span>
            <span class="weather-text">Perfect day for habits!</span>
          </div>
        </div>
      </div>

      <div class="stats-overview">
        <div class="primary-stat">
          <div class="stat-circle" [style.--progress]="getProgressPercentage(stats.todayCompleted, stats.todayTotal)">
            <div class="stat-content">
              <span class="stat-number">{{ stats.todayCompleted }}</span>
              <span class="stat-divider">/</span>
              <span class="stat-total">{{ stats.todayTotal }}</span>
              <span class="stat-label">Today</span>
            </div>
          </div>
          <div class="progress-text">
            <span class="progress-percentage">{{ getProgressPercentage(stats.todayCompleted, stats.todayTotal) }}%</span>
            <span class="progress-label">Complete</span>
          </div>
        </div>

        <div class="secondary-stats">
          <div class="mini-stat">
            <div class="mini-stat-icon streak">🔥</div>
            <div class="mini-stat-content">
              <span class="mini-stat-number">{{ stats.currentStreak }}</span>
              <span class="mini-stat-label">Day Streak</span>
            </div>
          </div>
          
          <div class="mini-stat">
            <div class="mini-stat-icon weekly">📈</div>
            <div class="mini-stat-content">
              <span class="mini-stat-number">{{ stats.weeklyProgress }}%</span>
              <span class="mini-stat-label">This Week</span>
            </div>
          </div>
          
          <div class="mini-stat">
            <div class="mini-stat-icon perfect">💎</div>
            <div class="mini-stat-content">
              <span class="mini-stat-number">{{ stats.perfectDays }}</span>
              <span class="mini-stat-label">Perfect Days</span>
            </div>
          </div>
        </div>
      </div>

      <div class="quick-insights">
        <div class="insight-card" *ngIf="stats.todayCompleted === stats.todayTotal && stats.todayTotal > 0">
          <div class="insight-icon">🎉</div>
          <div class="insight-content">
            <h4>Perfect Day!</h4>
            <p>You've completed all your habits today. Amazing work!</p>
          </div>
        </div>
        
        <div class="insight-card" *ngIf="stats.currentStreak >= 7">
          <div class="insight-icon">🔥</div>
          <div class="insight-content">
            <h4>On Fire!</h4>
            <p>{{ stats.currentStreak }} days streak! You're building momentum.</p>
          </div>
        </div>
        
        <div class="insight-card" *ngIf="stats.completionRate >= 80">
          <div class="insight-icon">⭐</div>
          <div class="insight-content">
            <h4>High Performer</h4>
            <p>{{ stats.completionRate | number:'1.0-0' }}% completion rate. Keep it up!</p>
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  today = new Date();
  stats$: Observable<DashboardStats> = new Observable();

  constructor(private habitService: HabitService) {}

  ngOnInit(): void {
    this.stats$ = combineLatest([
      this.habitService.getHabits(),
      this.habitService.getProgress()
    ]).pipe(
      map(([habits, progress]) => {
        const activeHabits = habits.filter(h => h.isActive);
        const todayString = this.today.toISOString().split('T')[0];
        
        const todayProgress = progress.filter(p => p.date === todayString);
        const todayCompleted = todayProgress.filter(p => p.completed).length;
        const todayTotal = activeHabits.length;
        
        // Calculate weekly progress
        const weekStart = new Date(this.today);
        weekStart.setDate(this.today.getDate() - this.today.getDay());
        const weekDays = Array.from({ length: 7 }, (_, i) => {
          const date = new Date(weekStart);
          date.setDate(weekStart.getDate() + i);
          return date.toISOString().split('T')[0];
        });
        
        const weeklyTotal = weekDays.length * activeHabits.length;
        const weeklyCompleted = weekDays.reduce((sum, date) => {
          const dayProgress = progress.filter(p => p.date === date);
          return sum + dayProgress.filter(p => p.completed).length;
        }, 0);
        
        const weeklyProgress = weeklyTotal > 0 ? Math.round((weeklyCompleted / weeklyTotal) * 100) : 0;
        
        // Calculate current streak and perfect days
        let currentStreak = 0;
        let perfectDays = 0;
        const dates = [...new Set(progress.map(p => p.date))].sort().reverse();
        
        for (const date of dates) {
          const dayProgress = progress.filter(p => p.date === date);
          const completedCount = dayProgress.filter(p => p.completed).length;
          
          if (completedCount === activeHabits.length && activeHabits.length > 0) {
            perfectDays++;
            if (date === todayString || currentStreak > 0) {
              currentStreak++;
            }
          } else if (date === todayString || currentStreak === 0) {
            break;
          }
        }
        
        // Calculate overall completion rate
        const totalProgress = progress.length;
        const totalCompleted = progress.filter(p => p.completed).length;
        const completionRate = totalProgress > 0 ? (totalCompleted / totalProgress) * 100 : 0;
        
        return {
          todayCompleted,
          todayTotal,
          weeklyProgress,
          currentStreak,
          perfectDays,
          completionRate
        };
      })
    );
  }

  getProgressPercentage(completed: number, total: number): number {
    return total > 0 ? Math.round((completed / total) * 100) : 0;
  }
}