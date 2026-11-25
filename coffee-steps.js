// A little coffee cup walks to each new stop, leaving coffee-bean footprints.
// Skipped for visitors whose device is set to reduce motion.
function addCoffeeSteps(storymap, slides) {
  var map = storymap._map && storymap._map._map;
  if (!map || !map.getPanes || !window.L) return;
  var calm = window.matchMedia('(prefers-reduced-motion: reduce)');

  var STRIDE = 22;      // pixels between footprints
  var STEP_MS = 150;    // time per step
  var MAX_WALK = 320;   // longest walk, in pixels
  var MAP_SETTLE = 1100; // wait for the map to finish sliding over

  var CUP = '<svg viewBox="0 0 48 56" width="48" height="56">' +
    '<path class="steam" d="M18 12c-3-4 3-5 0-9M27 12c-3-4 3-5 0-9" fill="none" stroke="#f8ebd9" stroke-width="2" stroke-linecap="round"/>' +
    '<g stroke="#f8ebd9" stroke-width="3" stroke-linecap="round" fill="none">' +
    '<path class="leg leg-a" d="M18 42v9h-3"/><path class="leg leg-b" d="M27 42v9h3"/></g>' +
    '<path d="M36 22h3a6 6 0 0 1 0 12h-4" fill="none" stroke="#d3924f" stroke-width="3"/>' +
    '<path d="M8 16h29v15a12 12 0 0 1-12 12h-5A12 12 0 0 1 8 31Z" fill="#fffaf2" stroke="#4a3124" stroke-width="2.5" stroke-linejoin="round"/>' +
    '<path d="M10 18h25v3H10Z" fill="#8c4521"/>' +
    '<circle cx="18" cy="28" r="2" fill="#2e1c13"/><circle cx="27" cy="28" r="2" fill="#2e1c13"/>' +
    '<path d="M19.5 32.5q3 3 6 0" fill="none" stroke="#2e1c13" stroke-width="1.8" stroke-linecap="round"/>' +
    '<circle cx="14.5" cy="32" r="2" fill="#e3a58a"/><circle cx="30.5" cy="32" r="2" fill="#e3a58a"/></svg>';
  var BEAN = '<svg viewBox="0 0 12 16" width="12" height="16"><ellipse cx="6" cy="8" rx="5" ry="7" fill="#9a5a2c" stroke="#fffaf2"/>' +
    '<path d="M6 2q-3 3 0 6t0 6" fill="none" stroke="#e8d6bf" stroke-width="1.4"/></svg>';

  var timers = [], pieces = [], previous = storymap.options.start_at_slide || storymap.current_slide || 0;

  function later(fn, ms) { timers.push(setTimeout(fn, ms)); }
  function clear() {
    timers.forEach(clearTimeout); timers = [];
    pieces.forEach(function (el) { el.remove(); }); pieces = [];
  }
  function place(el, p) { el.style.left = p.x + 'px'; el.style.top = p.y + 'px'; }
  function add(cls, html, p) {
    var el = document.createElement('div');
    el.className = cls; el.innerHTML = html; el.setAttribute('aria-hidden', 'true');
    place(el, p);
    map.getPanes().markerPane.appendChild(el);
    pieces.push(el);
    return el;
  }
  function spot(i) {
    var l = slides[i] && slides[i].location;
    return l && typeof l.lat === 'number' ? L.latLng(l.lat, l.lon) : null;
  }
  // Part of the map not covered by the text panel
  function visibleBox() {
    var m = map.getContainer().getBoundingClientRect();
    var s = document.querySelector('.vco-storyslider').getBoundingClientRect();
    var side = s.left - m.left > 100;
    return {
      right: side ? s.left - m.left - 20 : m.width,
      bottom: side ? m.height : Math.min(m.height, s.top - m.top)
    };
  }

  function walk(fromLL, toLL) {
    var end = map.latLngToLayerPoint(toLL);
    var start = fromLL ? map.latLngToLayerPoint(fromLL) : L.point(end.x - 200, end.y + 60);
    var dx = start.x - end.x, dy = start.y - end.y;
    var dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < STRIDE) return;
    var ux = dx / dist, uy = dy / dist, box = visibleBox();

    // Work back from the new stop until the trail would leave the visible map.
    var path = [];
    for (var d = 0; d <= Math.min(dist, MAX_WALK); d += STRIDE) {
      var p = L.point(end.x + ux * d, end.y + uy * d), c = map.layerPointToContainerPoint(p);
      if (c.x < 10 || c.y < 10 || c.x > box.right || c.y > box.bottom) break;
      path.unshift(p);
    }
    if (path.length < 2) return;

    var angle = Math.atan2(-uy, -ux) * 180 / Math.PI + 90;
    var cup = add('coffee-cup walking', CUP, path[0]);
    path.forEach(function (p, i) {
      later(function () {
        place(cup, p);
        if (i === path.length - 1) return;
        var side = i % 2 ? 6 : -6;
        var bean = add('coffee-print', BEAN, L.point(p.x - uy * side, p.y + ux * side));
        bean.firstChild.style.transform = 'rotate(' + angle + 'deg)';
      }, 60 + i * STEP_MS);
    });
    var done = 60 + path.length * STEP_MS;
    later(function () { cup.className = 'coffee-cup arrived'; }, done);
    later(function () { pieces.forEach(function (el) { el.classList.add('fading'); }); }, done + 1300);
    later(clear, done + 2200);
  }

  storymap.on('change', function () {
    var now = storymap.current_slide, from = spot(previous), to = spot(now);
    if (now === previous) return;
    previous = now;
    clear();
    if (!to || calm.matches) return;
    later(function () { walk(from, to); }, MAP_SETTLE);
  });
  map.on('zoomstart', function () { if (pieces.length) clear(); });
}
