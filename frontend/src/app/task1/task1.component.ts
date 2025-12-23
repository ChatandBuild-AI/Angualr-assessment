import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MessageService, Message } from '../services/message.service';
import { WorkspaceService } from '../services/workspace.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-task1',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="task1-container">
      <h2>Task 1: Workspace Chat Messages Display</h2>
      <p class="task-description">
        Fetch and display workspace chat messages from the API. 
        Show messages in a simple list with author name, content, timestamp, and message type.
      </p>
      
      <div *ngIf="loading" class="loading-state">
        <div class="spinner"></div>
        <p>Loading messages...</p>
      </div>

      <div *ngIf="error && !loading" class="error-state">
        <p class="error-message">{{ error }}</p>
        <button (click)="loadMessages()" class="retry-button">Retry</button>
      </div>

      <div *ngIf="!loading && !error && messages.length > 0" class="messages-info">
        <h3>All Messages</h3>
        <p class="messages-count">
          Showing {{ (currentPage - 1) * itemsPerPage + 1 }} - {{ getEndIndex() }} of {{ messages.length }} message{{ messages.length !== 1 ? 's' : '' }}
        </p>
      </div>

      <div *ngIf="!loading && !error" class="messages-container">
        <div *ngIf="messages.length === 0 && !loading" class="empty-state">
          <p>No messages found.</p>
        </div>
        
        <div *ngIf="messages.length > 0" class="messages-list">
          <div *ngFor="let message of paginatedMessages" class="message-item" [class.system]="message.type === 'system'" [class.file]="message.type === 'file'">
            <div class="message-header">
              <span class="author-name">{{ message.author.name }}</span>
              <span class="message-type-badge" [class.type-text]="message.type === 'text'" 
                    [class.type-file]="message.type === 'file'" 
                    [class.type-system]="message.type === 'system'">
                {{ message.type }}
              </span>
             
              <span class="timestamp">{{ formatTimestamp(message.createdAt) }}</span>
              <span *ngIf="message.isEdited" class="edited-badge">(edited)</span>
            </div>
            <div class="message-content">{{ message.content }}</div>
          </div>
        </div>

        <div *ngIf="messages.length > 0 && totalPages > 1" class="pagination">
          <button 
            (click)="goToPage(currentPage - 1)" 
            [disabled]="currentPage === 1"
            class="pagination-button"
            [class.disabled]="currentPage === 1"
          >
            Previous
          </button>
          
          <div class="page-numbers">
            <span 
              *ngFor="let page of getPageNumbers()" 
              (click)="handlePageClick(page)"
              class="page-number"
              [class.active]="page === currentPage"
              [class.ellipsis]="page === '...'"
            >
              {{ page }}
            </span>
          </div>
          
          <button 
            (click)="goToPage(currentPage + 1)" 
            [disabled]="currentPage === totalPages"
            class="pagination-button"
            [class.disabled]="currentPage === totalPages"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./task1.component.css']
})
export class Task1Component implements OnInit {
  messages: Message[] = [];
  paginatedMessages: Message[] = [];
  loading: boolean = false;
  error: string | null = null;
  currentPage: number = 1;
  itemsPerPage: number = 3;
  totalPages: number = 0;

  constructor(
    private messageService: MessageService,
    private workspaceService: WorkspaceService
  ) { }

  ngOnInit() {
    this.loadMessages();
  }

  loadMessages() {
    this.loading = true;
    this.error = null;
    this.workspaceService.getAllWorkspaces({ page: 1, limit: 1000 }).subscribe({
      next: (workspaceResponse) => {
        if (workspaceResponse.success && workspaceResponse.data.length > 0) {
          const workspaces = workspaceResponse.data;
          
          const messageRequests = workspaces.map(workspace => 
            this.messageService.getWorkspaceMessages(workspace._id, { limit: 1000 })
          );

          forkJoin(messageRequests).subscribe({
            next: (messageResponses) => {
              this.loading = false;
              
              const allMessages: Message[] = [];
              messageResponses.forEach(response => {
                if (response.success && response.data) {
                  allMessages.push(...response.data);
                }
              });

                this.messages = allMessages.sort((a, b) => {
                  const dateA = new Date(a.createdAt).getTime();
                  const dateB = new Date(b.createdAt).getTime();
                  return dateA - dateB;
                });
                
                this.updatePagination();
            },
            error: (err) => {
              this.loading = false;
              this.error = err.error?.error || 'Failed to load messages. Please try again.';
              console.error('Error loading messages:', err);
            }
          });
        } else {
          this.loading = false;
          this.error = 'No workspaces found.';
        }
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error?.error || 'Failed to load workspaces. Please check your connection.';
        console.error('Error loading workspaces:', err);
      }
    });
  }

  updatePagination(): void {
    this.totalPages = Math.ceil(this.messages.length / this.itemsPerPage);
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedMessages = this.messages.slice(startIndex, endIndex);
  }

  handlePageClick(page: number | string): void {
    if (typeof page === 'number') {
      this.goToPage(page);
    }
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePagination();
      const messagesContainer = document.querySelector('.messages-container');
      if (messagesContainer) {
        messagesContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }

  getPageNumbers(): (number | string)[] {
    const pages: (number | string)[] = [];
    const maxVisible = 5;
    
    if (this.totalPages <= maxVisible) {
      for (let i = 1; i <= this.totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      
      if (this.currentPage > 3) {
        pages.push('...');
      }
      const start = Math.max(2, this.currentPage - 1);
      const end = Math.min(this.totalPages - 1, this.currentPage + 1);
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      
      if (this.currentPage < this.totalPages - 2) {
        pages.push('...');
      }
      
      pages.push(this.totalPages);
    }
    
    return pages;
  }

  getEndIndex(): number {
    const end = this.currentPage * this.itemsPerPage;
    return end > this.messages.length ? this.messages.length : end;
  }

  formatTimestamp(timestamp: string): string {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) {
      return 'Just now';
    } else if (diffMins < 60) {
      return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    } else if (diffDays < 7) {
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    } else {
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  }
}
