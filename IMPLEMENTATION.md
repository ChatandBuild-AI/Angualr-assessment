Created a component that fetches and displays all chat messages from all workspaces. The messages are shown with pagination, displaying 3 messages per page.

implementation (task 1)

Fetches all workspaces from the API
Fetches messages for each workspace in parallel using forkJoin
Combines all messages into a single list
Sorts messages by createdAt (oldest first)
Displays messages from all workspaces (no filtering)

implementation (task 2)

Built a form where users can create a workspace and then send messages to it. The form has proper validation.after creating the workspace,the usee can send messages which is stored in the messaes collection.