import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  ListToolsRequestSchema,
  CallToolRequestSchema,
  ErrorCode,
  McpError,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import axios from "axios";
import dotenv from "dotenv";
import { run } from "node:test";
import { IssueResponse, ListIssueResponse, ProjectResponse } from "./sentry.js";
import { url } from "node:inspector";
import { text } from "node:stream/consumers";
import {
  listSentryFindProjectIssues,
  ListSentryFindProjectIssuesInputSchema,
  listSentryFindProjects,
  readSentryIssue,
  ReadSentryIssueInputSchema,
} from "./type.js";

dotenv.config();

const AUTH_TOKEN = process.env.SENTRY_AUTH_TOKEN;
const ORGANIZATION_ID_OR_SLUG = process.env.ORGANIZATION_ID_OR_SLUG;
if (!AUTH_TOKEN) {
  throw new Error("SENTRY_AUTH_TOKEN environment variable is required");
}
if (!ORGANIZATION_ID_OR_SLUG) {
  throw new Error("ORGANIZATION_ID_OR_SLUG environment variable is required");
}

const API_CONFIG = {
  BASE_URL: "http://sentry.io",
  ENDPOINTS: {
    PROJECTS: `/api/0/organizations/${ORGANIZATION_ID_OR_SLUG}/projects/`,
    ISSUES: `/api/0/projects/${ORGANIZATION_ID_OR_SLUG}/{project_id_or_slug}/issues/`,
    ISSUE: `api/0/organizations/${ORGANIZATION_ID_OR_SLUG}/issues/{issue_id}/hashes/`,
  },
} as const;

class SentryServer {
  private server: Server;
  private axiosInstance;

  constructor() {
    this.server = new Server(
      {
        name: "mcp-sentry-issue-server",
        version: "0.1.0",
      },
      {
        capabilities: {
          tools: {},
          resources: {},
        },
      }
    );

    // Configure axios with defaults
    this.axiosInstance = axios.create({
      baseURL: API_CONFIG.BASE_URL,
      headers: {
        Authorization: `Bearer ${AUTH_TOKEN}`,
      },
      timeout: 10000,
    });

    this.setupHandlers();
    this.setupErrorHandling();
  }

  private setupErrorHandling(): void {
    this.server.onerror = (error) => {
      console.error("[MCP Error]", error);
    };

    process.on("SIGINT", async () => {
      await this.server.close();
      process.exit(0);
    });
  }

  private setupHandlers(): void {
    this.setupResourceHandlers();
    this.setupToolHandlers();
  }

  private setupResourceHandlers(): void {
    this.server.setRequestHandler(ListResourcesRequestSchema, async () => ({
      resources: [listSentryFindProjects],
    }));

    this.server.setRequestHandler(
      ReadResourceRequestSchema,
      async (request) => {
        if (request.params.uri === "sentry://project") {
          try {
            const { data: projects } =
              await this.axiosInstance.get<ProjectResponse>(
                API_CONFIG.ENDPOINTS.PROJECTS
              );

            return {
              contents: [
                {
                  uri: request.params.uri,
                  mimeType: "application/json",
                  text: JSON.stringify(
                    projects.map((project) => ({
                      project_id: project.id,
                      project_name: project.name,
                      project_slug: project.slug,
                    })),
                    null,
                    2
                  ),
                },
              ],
            };
          } catch (error) {
            if (axios.isAxiosError(error)) {
              throw new McpError(
                ErrorCode.InternalError,
                `Sentry API error: ${
                  error.response?.data.detail ?? error.message
                }`
              );
            }
            throw error;
          }
        }

        throw new McpError(
          ErrorCode.MethodNotFound,
          `Unknown tool: ${request.params.name}`
        );
      }
    );
  }

  private setupToolHandlers(): void {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [listSentryFindProjectIssues, readSentryIssue],
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      if (request.params.name == "sentry_find_project_issues") {
        const args = ListSentryFindProjectIssuesInputSchema.parse(
          request.params.arguments
        );
        if (!args.project) {
          throw new McpError(
            ErrorCode.InvalidParams,
            "Invalid project issues arguments"
          );
        }

        try {
          const url = API_CONFIG.ENDPOINTS.ISSUES.replace(
            "{project_id_or_slug}",
            args.project
          );
          const query: string[] = [];
          if (args.search_word) {
            query.push(args.search_word);
          }
          if (args.user_id) {
            query.push(`user.id:${args.user_id}`);
          }
          if (args.url) {
            query.push(`http.url:${args.url}`);
          }
          if (args.resolved) {
            query.push("is:resolved");
          } else {
            query.push("is:unresolved");
          }
          if (args.priority) {
            query.push(`issue.priority:[${args.priority}]`);
          }

          const { data: issues } =
            await this.axiosInstance.get<ListIssueResponse>(url, {
              params: {
                query: query.join(" "),
                ...(args.cursor ? { cursor: args.cursor } : {}),
              },
            });

          return {
            content: issues.map((issue) => {
              return {
                type: "text",
                text: JSON.stringify(
                  {
                    title: issue.title,
                    id: issue.id,
                    project: issue.project,
                    status: issue.status,
                    status_details: issue.statusDetails,
                    url: issue.permalink,
                    lastSeen: issue.lastSeen,
                  },
                  null,
                  2
                ),
              };
            }),
          };
        } catch (error) {
          if (axios.isAxiosError(error)) {
            return {
              content: [
                {
                  type: "text",
                  text: `Sentry API error: ${
                    error.response?.data.detail ?? error.message
                  }`,
                },
              ],
              isError: true,
            };
          }
          throw error;
        }
      }
      if (request.params.name === "sentry_read_issue") {
        try {
          const args = ReadSentryIssueInputSchema.parse(
            request.params.arguments
          );
          if (!args.issue_id) {
            throw new McpError(
              ErrorCode.InvalidParams,
              "Invalid project issues arguments"
            );
          }
          const url = API_CONFIG.ENDPOINTS.ISSUE.replace(
            "{issue_id}",
            args.issue_id
          );
          const { data: issue } = await this.axiosInstance.get<IssueResponse>(
            url
          );

          return {
            content: issue.map((issue) => ({
              type: "text",
              text: JSON.stringify(issue, null, 2),
            })),
          };
        } catch (error) {
          if (axios.isAxiosError(error)) {
            throw new McpError(
              ErrorCode.InternalError,
              `Sentry API error: ${
                error.response?.data.detail ?? error.message
              }`
            );
          }
          throw error;
        }
      }

      throw new McpError(
        ErrorCode.MethodNotFound,
        `Unknown tool: ${request.params.name}`
      );
    });
  }

  async run(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);

    // Although this is just an informative message, we must log to stderr,
    // to avoid interfering with MCP communication that happens on stdout
    console.error("Weather MCP server running on stdio");
  }
}

const server = new SentryServer();
server.run().catch((error) => {
  console.error("Fatal error in server():", error);
  process.exit(1);
});
