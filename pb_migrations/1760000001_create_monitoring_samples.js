/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const existing = (() => {
    try {
      return app.findCollectionByNameOrId("monitoring_samples");
    } catch (_) {
      return null;
    }
  })();
  if (existing) {
    return;
  }

  const collection = new Collection({
    name: "monitoring_samples",
    type: "base",
    listRule: '@request.auth.id != ""',
    viewRule: '@request.auth.id != ""',
    createRule: null,
    updateRule: null,
    deleteRule: null,
    fields: [
      {
        name: "device_id",
        type: "text",
        required: true,
        min: 1,
        max: 120
      },
      {
        name: "device_name",
        type: "text",
        required: true,
        min: 1,
        max: 200
      },
      {
        name: "kind",
        type: "text",
        required: false,
        max: 64
      },
      {
        name: "status",
        type: "select",
        required: true,
        maxSelect: 1,
        values: ["online", "offline"]
      },
      {
        name: "latency_ms",
        type: "number",
        required: false,
        min: 0
      },
      {
        name: "utilization",
        type: "number",
        required: false,
        min: 0,
        max: 100
      },
      {
        name: "checked_at",
        type: "date",
        required: true
      },
      {
        name: "created",
        type: "autodate",
        onCreate: true,
        onUpdate: false
      },
      {
        name: "updated",
        type: "autodate",
        onCreate: true,
        onUpdate: true
      }
    ],
    indexes: [
      "CREATE INDEX idx_monitoring_samples_device_checked ON monitoring_samples (device_id, checked_at)",
      "CREATE INDEX idx_monitoring_samples_status_checked ON monitoring_samples (status, checked_at)"
    ]
  });

  return app.save(collection);
}, (app) => {
  try {
    const collection = app.findCollectionByNameOrId("monitoring_samples");
    return app.delete(collection);
  } catch (_) {}
});
