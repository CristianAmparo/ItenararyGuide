# Itinerary JSON format

Import an itinerary from **Settings → Import itinerary**. The app validates the file and shows a clear error if something is missing.

## Minimal example

```json
{
  "id": "tokyo-2027",
  "title": "Tokyo Weekend",
  "destination": "Tokyo",
  "startDate": "2027-03-10",
  "endDate": "2027-03-11",
  "days": [
    {
      "id": "day-1",
      "date": "2027-03-10",
      "title": "Shibuya",
      "steps": [
        { "id": "shibuya-crossing", "title": "Shibuya Crossing", "type": "activity" }
      ]
    }
  ]
}
```

## Required fields

| Field | Where | Notes |
| --- | --- | --- |
| `title` | trip | Trip name |
| `days` | trip | Non-empty list |
| `date` | day | ISO date, `YYYY-MM-DD` |
| `title` | step | What to do |

Everything else is optional. Sections without data are hidden in the app.

## IDs (recommended)

`id` on the trip, days, steps and checklist items links your progress to the content.

- **Provide your own IDs** (e.g. `"d1-airport"`). You can then edit text, reorder steps or re-import an updated file, and your progress stays attached to the right steps.
- If an ID is missing, one is generated from its position (`day-1`, `day-1-step-2`, `day-1-step-2-item-1`). Reordering or inserting items in a later import will then shift progress to the wrong steps.
- IDs must be unique within a trip. Checklist item IDs only need to be unique within their step.

Re-importing a file with the **same trip `id`** replaces the trip content and keeps progress. A **different** `id` adds a new trip and makes it active.

## Trip

| Field | Type | Description |
| --- | --- | --- |
| `id` | string | Stable trip ID |
| `title` | string | **Required** |
| `destination` | string | |
| `startDate` / `endDate` | `YYYY-MM-DD` | Default to the first and last day |
| `description` | string | Short summary on the home screen |
| `days` | Day[] | **Required** |
| `quickInfo` | QuickInfoSection[] | Shown on the Info tab |

## Day

| Field | Type | Description |
| --- | --- | --- |
| `id` | string | Stable day ID |
| `date` | `YYYY-MM-DD` | **Required** |
| `title` | string | Defaults to "Day N" |
| `description` | string | |
| `steps` | Step[] | In the order they should be done |

## Step

| Field | Type | Description |
| --- | --- | --- |
| `id` | string | Stable step ID |
| `title` | string | **Required** |
| `type` | `transport` · `activity` · `accommodation` · `food` · `airport` · `shopping` · `other` | Defaults to `other` |
| `description` | string | Main text |
| `scheduledTime` | string | e.g. `"07:30"` |
| `estimatedDuration` | string | e.g. `"45 min"` |
| `location` | `{ name, address?, mapsUrl? }` | `mapsUrl` opens Google Maps (needs internet) |
| `instructions` | string[] | Numbered list |
| `checklist` | `{ id, label }[]` or string[] | Plain strings get generated IDs |
| `transportation` | string | How to get there |
| `notes` | string[] | Important notes |
| `bookingDetails` | `{ "Label": "value" }` | Each value can be copied |
| `links` | `{ label, url }[]` | External websites (need internet) |
| `image` | string | Path inside the app, such as `/images/peak.jpg` (put the file in `public/images/`), or a `data:` URL. Remote image URLs won't show offline. |

## Quick info section

```json
{
  "id": "hotel",
  "title": "Hotel",
  "category": "accommodation",
  "items": [
    { "label": "Address", "value": "20 Nathan Road", "href": "https://maps.google.com/?q=20+Nathan+Road" },
    { "label": "Front desk", "value": "+852 1234 5678", "href": "tel:+85212345678" }
  ]
}
```

`category` is one of `accommodation`, `flight`, `booking`, `emergency`, `documents`, `transport`, `other` and sets the icon.

## Wrapped and backup files

- **Export itinerary** saves `{ "format": "itinerary-guide/trip", "version": 1, "trip": { … } }`. Import accepts this format or a bare trip object.
- **Back up all data** saves `{ "format": "itinerary-guide/backup", "version": 1, "activeTripId", "trips": [ … ], "progress": [ … ] }`. Restoring it replaces all trips and progress on the device.

The full sample trip lives in [`src/data/sample-itinerary.ts`](../src/data/sample-itinerary.ts).
