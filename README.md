# Knoxville Coffee Crawl

An interactive [StoryMapJS](https://storymap.knightlab.com/) project on the history of coffee in Knoxville and the coffee shops that shape the city's culture today. It has two historic stops (JFG Coffee and Old City Java) and eight present-day shops near UT and downtown. A text-only version of the tour is in `tour.html`.

## Editing
- Slide text, locations, and zoom live in `storymap.json`.
- To add a photo, put it in `images/` and set that slide's `media.url` (e.g. `"images/capybara.jpg"`), plus `media.credit`, `media.caption`, and `media.alt` (alt text for screen readers).
- Dashed "Draft research notes" boxes are temporary. Rewrite them into the slide text, then delete each `<div class="draft-notes">…</div>`.

Map data &copy; OpenStreetMap contributors.
