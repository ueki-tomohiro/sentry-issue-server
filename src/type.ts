import { Resource, Tool } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";
export const listSentryFindProjects: Resource = {
  name: "sentry_find_projects",
  uri: "sentry://project",
  description: "list projects in sentry organization",
};

export const ListSentryFindProjectIssuesInputSchema = z.object({
  project: z.string().describe("project_id or slug"),
  search_word: z
    .string()
    .nullable()
    .default(null)
    .describe("search word in issue"),
  user_id: z
    .string()
    .nullable()
    .default(null)
    .describe("search issues by user id"),
  url: z.string().nullable().default(null).describe("search issues in url"),
  resolved: z
    .boolean()
    .default(false)
    .describe("search resolved issues (default: false)"),
  cursor: z
    .string()
    .nullable()
    .default(null)
    .describe(
      "A pointer to the last object fetched and its sort order; used to retrieve the next or previous results."
    ),
  priority: z
    .string()
    .default("high,medium")
    .describe("search issues by priority(default: high or medium)"),
});

export const listSentryFindProjectIssues: Tool = {
  name: "sentry_find_project_issues",
  description:
    "search issues in project.you need to provide project_id or slug",
  inputSchema: zodToJsonSchema(
    ListSentryFindProjectIssuesInputSchema
  ) as Tool["inputSchema"],
};

export const ReadSentryIssueInputSchema = z.object({
  issue_id: z.string().describe("The ID of the issue to retrieve."),
  full: z
    .enum(["true", "false"])
    .nullable()
    .describe(
      "If this is set to true, the event payload will include the full event body, including the stacktrace. Set to 1 to enable."
    ),
  cursor: z
    .string()
    .nullable()
    .default(null)
    .describe(
      "A pointer to the last object fetched and its sort order; used to retrieve the next or previous results."
    ),
});

export const readSentryIssue: Tool = {
  name: "sentry_read_issue",
  mimeType: "application/json",
  description: "fetch issue in sentry. you need to provide issue_id",
  inputSchema: zodToJsonSchema(
    ReadSentryIssueInputSchema
  ) as Tool["inputSchema"],
};
