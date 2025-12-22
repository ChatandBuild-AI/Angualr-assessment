import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import {
  MessageListResponse,
  MessageService,
} from "../services/message.service";
import { Observable } from "rxjs";

@Component({
  selector: "app-task1",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "task1.component.html",
  styleUrl: "task1.component.scss",
})
export class Task1Component implements OnInit {
  constructor(private messageService: MessageService) {}
  protected workspaces$!: Observable<MessageListResponse>;
  ngOnInit(): void {
    this.workspaces$ = this.messageService.getWorkspaceMessages(
      "6949985496e024410dce8e35",
      {},
    );
  }
}
