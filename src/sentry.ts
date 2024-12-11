import { z } from "zod";

const AssignedToSchema = z.object({
  // Define properties as needed
});

const MetadataFilenameSchema = z.object({
  filename: z.string(),
  type: z.string(),
  value: z.string(),
});

const MetadataTitleSchema = z.object({
  title: z.string(),
});

const MetadataSchema = z.union([MetadataFilenameSchema, MetadataTitleSchema]);

const ProjectSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
});

const StatsSchema = z.object({
  "24h": z.array(z.array(z.number())),
});

const SubscriptionDetailsSchema = z.object({
  // Define properties as needed
});

const StatusDetailsSchema = z.object({
  // Define properties as needed
});

const IssueItemSchema = z.object({
  lastSeen: z.string(),
  numComments: z.number(),
  userCount: z.number(),
  culprit: z.string(),
  title: z.string(),
  id: z.string(),
  assignedTo: AssignedToSchema.nullable(),
  logger: z.string().nullable(),
  stats: StatsSchema,
  type: z.string(),
  annotations: z.array(z.string()),
  metadata: MetadataSchema,
  status: z.enum(["resolved", "unresolved", "ignored"]),
  subscriptionDetails: SubscriptionDetailsSchema.nullable(),
  isPublic: z.boolean(),
  hasSeen: z.boolean(),
  shortId: z.string(),
  shareId: z.string().nullable(),
  firstSeen: z.string(),
  count: z.string(),
  permalink: z.string(),
  level: z.string(),
  isSubscribed: z.boolean(),
  isBookmarked: z.boolean(),
  project: ProjectSchema,
  statusDetails: StatusDetailsSchema,
});

const ListIssueResponseSchema = z.array(IssueItemSchema);
export type ListIssueResponse = z.infer<typeof ListIssueResponseSchema>;

const LatestDeploysSchema = z.record(z.record(z.string()));

const TeamSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
});

const EventProcessingSchema = z.object({
  symbolicationDegraded: z.boolean(),
});

const LatestReleaseSchema = z.object({
  version: z.string(),
});

const ProjectItemSchema = z.object({
  latestDeploys: LatestDeploysSchema.nullable().optional(),
  stats: z.any().optional(),
  transactionStats: z.any().optional(),
  sessionStats: z.any().optional(),
  id: z.string(),
  slug: z.string(),
  name: z.string(),
  platform: z.string().nullable().optional(),
  dateCreated: z.string(),
  isBookmarked: z.boolean(),
  isMember: z.boolean(),
  features: z.array(z.string()),
  firstEvent: z.string().nullable().optional(),
  firstTransactionEvent: z.boolean(),
  access: z.array(z.string()),
  hasAccess: z.boolean(),
  hasCustomMetrics: z.boolean(),
  hasFeedbacks: z.boolean(),
  hasMinifiedStackTrace: z.boolean(),
  hasMonitors: z.boolean(),
  hasNewFeedbacks: z.boolean(),
  hasProfiles: z.boolean(),
  hasReplays: z.boolean(),
  hasSessions: z.boolean(),
  hasInsightsHttp: z.boolean(),
  hasInsightsDb: z.boolean(),
  hasInsightsAssets: z.boolean(),
  hasInsightsAppStart: z.boolean(),
  hasInsightsScreenLoad: z.boolean(),
  hasInsightsVitals: z.boolean(),
  hasInsightsCaches: z.boolean(),
  hasInsightsQueues: z.boolean(),
  hasInsightsLlmMonitoring: z.boolean(),
  team: TeamSchema.nullable().optional(),
  teams: z.array(TeamSchema),
  eventProcessing: EventProcessingSchema,
  platforms: z.array(z.string()),
  hasUserReports: z.boolean(),
  environments: z.array(z.string()),
  latestRelease: LatestReleaseSchema.nullable().optional(),
});

const ProjectResponseSchema = z.array(ProjectItemSchema);
export type ProjectResponse = z.infer<typeof ProjectResponseSchema>;

const ErrorSchema = z.object({
  message: z.string(),
  type: z.string(),
  data: z
    .object({
      column: z.number(),
      source: z.string(),
      row: z.number(),
    })
    .optional(),
});

const IssueMetadataSchema = z.union([
  z.object({
    type: z.string(),
    value: z.string(),
  }),
  z.object({
    title: z.string(),
  }),
]);

const UserSchema = z
  .object({
    username: z.string().nullable(),
    name: z.string().nullable(),
    ip_address: z.string().nullable(),
    email: z.string().nullable(),
    data: z
      .object({
        isStaff: z.boolean(),
      })
      .nullable(),
    id: z.string(),
  })
  .nullable();

const EntrySchema = z.union([
  z.object({
    type: z.string(),
    data: z.object({
      values: z.array(
        z.object({
          category: z.string(),
          level: z.string(),
          event_id: z.string().nullable(),
          timestamp: z.string().datetime(),
          data: z.object({}).nullable(),
          message: z.string().nullable(),
          type: z.string(),
        })
      ),
    }),
  }),
  z.object({
    type: z.string(),
    data: z.object({
      fragment: z.string().nullable(),
      cookies: z.array(z.array(z.string())).nullable(),
      inferredContentType: z.string().nullable(),
      env: z
        .object({
          ENV: z.string(),
        })
        .nullable(),
      headers: z.array(z.array(z.string())),
      url: z.string(),
      query: z.array(z.array(z.string())),
      data: z.object({}).nullable(),
      method: z.string().nullable(),
    }),
  }),
  z.object({
    type: z.string(),
    data: z.object({
      formatted: z.string(),
    }),
  }),
  z.object({
    type: z.string(),
    data: z.object({
      excOmitted: z.array(z.number()).nullable(),
      hasSystemFrames: z.boolean(),
      values: z.array(
        z.object({
          stacktrace: z
            .object({
              frames: z.array(
                z.object({
                  function: z.string(),
                  errors: z.string().nullable(),
                  colNo: z.number().nullable(),
                  vars: z.object({}).nullable(),
                  package: z.string().nullable(),
                  absPath: z.string().nullable(),
                  inApp: z.boolean(),
                  lineNo: z.number(),
                  module: z.string(),
                  filename: z.string(),
                  platform: z.string().nullable(),
                  instructionAddr: z.string().nullable(),
                  context: z.array(z.array(z.union([z.number(), z.string()]))),
                  symbolAddr: z.string().nullable(),
                  trust: z.string().nullable(),
                  symbol: z.string().nullable(),
                })
              ),
              framesOmitted: z.string().nullable(),
              registers: z.string().nullable(),
              hasSystemFrames: z.boolean(),
            })
            .nullable(),
          module: z.string().nullable(),
          rawStacktrace: z.object({}).nullable(),
          mechanism: z
            .object({
              type: z.string(),
              handled: z.boolean(),
            })
            .nullable(),
          threadId: z.string().nullable(),
          value: z.string(),
          type: z.string(),
        })
      ),
    }),
  }),
]);

const LatestEventSchema = z.object({
  eventID: z.string(),
  dist: z.string().nullable(),
  message: z.string(),
  id: z.string(),
  size: z.number(),
  errors: z.array(ErrorSchema),
  platform: z.string(),
  type: z.string(),
  metadata: IssueMetadataSchema,
  tags: z.array(
    z.object({
      value: z.string(),
      key: z.string(),
      _meta: z.string().nullable(),
    })
  ),
  dateCreated: z.string(),
  dateReceived: z.string(),
  user: UserSchema,
  entries: z.array(EntrySchema),
  packages: z.object({}),
  sdk: z.object({
    version: z.string(),
    name: z.string(),
  }),
  _meta: z.object({
    user: z.string().nullable(),
    context: z.string().nullable(),
    entries: z.object({}),
    contexts: z.string().nullable(),
    message: z.string().nullable(),
    packages: z.string().nullable(),
    tags: z.object({}),
    sdk: z.string().nullable(),
  }),
  contexts: z.object({
    ForbiddenError: z.object({
      status: z.number(),
      statusText: z.string(),
      responseJSON: z.object({
        detail: z.string(),
      }),
      type: z.string(),
    }),
    browser: z.object({
      version: z.string(),
      type: z.string(),
      name: z.string(),
    }),
    os: z.object({
      version: z.string(),
      type: z.string(),
      name: z.string(),
    }),
    trace: z.object({
      span_id: z.string(),
      type: z.string(),
      trace_id: z.string(),
      op: z.string(),
    }),
    organization: z.object({
      type: z.string(),
      id: z.string(),
      slug: z.string(),
    }),
  }),
  fingerprints: z.array(z.string()),
  context: z.object({
    resp: z.object({
      status: z.number(),
      responseJSON: z.object({
        detail: z.string(),
      }),
      name: z.string(),
      statusText: z.string(),
      message: z.string(),
      stack: z.string(),
    }),
    session: z.object({
      foo: z.string(),
    }),
    unauthorized: z.boolean(),
    url: z.string(),
  }),
  groupID: z.string(),
  title: z.string(),
});

const IssueSchema = z.array(
  z.object({
    latestEvent: LatestEventSchema,
    id: z.string(),
  })
);
export type IssueResponse = z.infer<typeof IssueSchema>;
