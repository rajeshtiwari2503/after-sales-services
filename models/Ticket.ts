// import mongoose, {
//   Schema,
//   models,
// } from "mongoose";

// const TicketSchema = new Schema(
//   {
//     title: String,
//     description: String,

//     status: {
//       type: String,
//       default: "OPEN",
//     },

//     priority: {
//       type: String,
//       enum: ["LOW", "MEDIUM", "HIGH"],
//       default: "MEDIUM",
//     },

//     customer: {
//       type: Schema.Types.ObjectId,
//       ref: "User",
//     },

//     technician: {
//       type: Schema.Types.ObjectId,
//       ref: "User",
//     },
//   },
//   {
//     timestamps: true,
//   }
// );

// const Ticket =
//   models.Ticket ||
//   mongoose.model("Ticket", TicketSchema);

// export default Ticket;


import mongoose, {
  Schema,
  model,
  models,
} from "mongoose";

const ticketSchema = new Schema(
  {
    ticketId: {
      type: String,
      unique: true,
    },

    title: {
      type: String,
      required: true,
    },

    description: {
      type: String,
      required: true,
    },

    customerName: {
      type: String,
      required: true,
    },

    customerEmail: {
      type: String,
    },

    customerPhone: {
      type: String,
    },

    priority: {
      type: String,
      enum: [
        "LOW",
        "MEDIUM",
        "HIGH",
        "URGENT",
      ],
      default: "MEDIUM",
    },

    status: {
      type: String,
      enum: [
        "OPEN",
        "IN_PROGRESS",
        "ASSIGNED",
        "RESOLVED",
        "CLOSED",
      ],
      default: "OPEN",
    },

    category: {
      type: String,
    },

    assignedTechnician: {
      type: String,
    },
    assignedTechnicianId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    dueDate: Date,

    resolvedAt: Date,

    closedAt: Date,

    slaStatus: {
      type: String,
      enum: [
        "ON_TIME",
        "WARNING",
        "BREACHED",
      ],
      default: "ON_TIME",
    },

    attachments: [
      {
        url: String,
        fileName: String,
      },
    ],

    internalNotes: [
      {
        note: String,
        createdBy: String,
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    resolutionSummary: String,

    resolvedBy: String,

    resolutionTime: Number,

    workflowLogs: [
      {
        action: String,

        oldValue: String,

        newValue: String,

        performedBy: String,

        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    serviceCenter: {
      type: String,
    },

    slaDeadline: Date,

    timeline: [
      {
        action: String,
        performedBy: String,
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },

  {
    timestamps: true,
  }
);

ticketSchema.pre(
  "save",
  function (next) {
    if (!this.ticketId) {
      this.ticketId =
        "TKT-" +
        Date.now();
    }

    next();
  }
);

const Ticket =
  models.Ticket ||
  model(
    "Ticket",
    ticketSchema
  );

export default Ticket;