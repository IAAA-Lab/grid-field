const $ = window.$;
const YSERVER_URL = 'ws://localhost:1234';
const Y_ROOM = 'dggs-room';

$(function () {
  console.log("jQuery ready inside module!");
});

// -------------------------------
// Main map & sidebar logic
// -------------------------------
$(function () {
  // -------------------------------
  // Sidebar toggle
  // -------------------------------
  const sidebar = $(".sidebar-left");
  const toggleBtn = $(".sidebar-toggle");

  function updatePositions() {
    const sidebarWidth = sidebar.outerWidth();
    if (sidebar.hasClass("collapsed")) {
      toggleBtn.css("left", "10px");
      toggleBtn.find("i").removeClass("fa-chevron-left").addClass("fa-chevron-right");
    } else {
      toggleBtn.css("left", sidebarWidth + 10 + "px");
      toggleBtn.find("i").removeClass("fa-chevron-right").addClass("fa-chevron-left");
    }
  }

  toggleBtn.on("click", () => {
    sidebar.toggleClass("collapsed");
    updatePositions();
  });

  $(window).on("resize", updatePositions);
  updatePositions();

  // -------------------------------
  // OpenLayers
  // -------------------------------
  let sourceLevel = 'dggsgrid:res8';
  let oldsourcelevel = null;

  const defaultStyle = new ol.style.Style({
    fill: new ol.style.Fill({ color: 'rgba(255,255,255,0.0)' }),
    stroke: new ol.style.Stroke({ color: 'rgba(120,120,120,0.3)', width: 1 })
  });

  const selectedStyle = new ol.style.Style({
    fill: new ol.style.Fill({ color: '#ffff' }),
    stroke: new ol.style.Stroke({ color: 'rgba(200, 155, 55, 0.9)', width: 2 })
  });

  function SourceFunc(extent, sourcelevel) {
    $.ajax('http://localhost:8600/geoserver/dggsgrid/ows', {
      type: 'GET',
      data: {
        service: 'WFS',
        version: '1.0.0',
        request: 'GetFeature',
        typename: sourcelevel,
        srsname: 'EPSG:3857',
        outputFormat: 'application/json',
        bbox: extent.join(',') + ',EPSG:3857'
      }
    })
      .done(response => {
        console.log('WFS features loaded:', response && response.features ? response.features.length : 0);

        if (oldsourcelevel !== sourcelevel) {
          sourceWFS.clear();
          selectSingleClick.getFeatures().clear();
        }

        const far = new ol.format.GeoJSON();
        const features = far.readFeatures(response || {});
        sourceWFS.addFeatures(features);

        features.forEach(f => {
          const id = f.getId && f.getId();
          if (!id) return;
          if (window.ySelections && window.ySelections.has(id)) {
            applyDataToFeature(id, window.ySelections.get(id));
          } else {
            f.setStyle(defaultStyle);
          }
        });

        oldsourcelevel = sourcelevel;
      })
      .fail(err => console.error("WFS request failed", err));
  }

  const sourceWFS = new ol.source.Vector({
    loader: extent => SourceFunc(extent, sourceLevel),
    strategy: ol.loadingstrategy.bbox
  });

  const rasterBaseMapOSM = new ol.layer.Tile({ source: new ol.source.OSM() });

  const vector = new ol.layer.Vector({
    source: sourceWFS,
    opacity: 0.5,
    style: feature => {
      const tagColor = feature.get('tag_color');
      if (tagColor) {
        return new ol.style.Style({
          fill: new ol.style.Fill({ color: tagColor }),
          stroke: new ol.style.Stroke({ color: 'rgba(200,155,55,0.95)', width: 2 })
        });
      }
      return defaultStyle;
    }
  });

  const map = new ol.Map({
    target: 'map',
    layers: [rasterBaseMapOSM, vector],
    moveTolerance: 10,
    view: new ol.View({
      center: [-245585.50354746426, 5032271.8306932505],
      zoom: 7
    })
  });

  // -------------------------------
  // Zoom,pan and handling
  // -------------------------------
  map.on('moveend', () => {
    const zoom = map.getView().getZoom();
    let visible = true;

    if (zoom >= 11 && zoom < 13) sourceLevel = 'dggsgrid:res8';  // for now level changing like this, maybe some better way later to change
    else if (zoom >= 13 && zoom < 15) sourceLevel = 'dggsgrid:res9';
    else if (zoom >= 15 && zoom < 17) sourceLevel = 'dggsgrid:res10';
    else visible = false;

    vector.setVisible(visible);

    if (visible) {
      SourceFunc(map.getView().calculateExtent(), sourceLevel);
    }
  });

  // -------------------------------
  // selection interaction
  // -------------------------------
  const selectSingleClick = new ol.interaction.Select({
    style: null,
    condition: ol.events.condition.click,
    toggleCondition: ol.events.condition.click
  });

  map.addInteraction(selectSingleClick);

  const selectedFeatures = selectSingleClick.getFeatures();
  const selectedCountEl = $("#selected-count");
  const selectedTagsEl = $("#selected-tags");

  function refreshSelectedUI() {
    const count = selectedFeatures.getLength();
    selectedCountEl.text(count);

    const tags = [];
    selectedFeatures.forEach(f => {
      const tag = f.get('tag') || 'untagged';
      tags.push(`<span class="feature-tag-badge" style="background:#666">${tag}</span>`);
    });
    selectedTagsEl.html(tags.join(' '));
  }

  selectedFeatures.on('add', refreshSelectedUI);
  selectedFeatures.on('remove', refreshSelectedUI);

  // -------------------------------
  // Pending Yjs updates
  // -------------------------------
  const pendingYUpdates = new Map();

  sourceWFS.on('addfeature', evt => {
    const f = evt.feature;
    const id = f.getId && f.getId();
    if (!id) return;

    const payload = window.ySelections ? window.ySelections.get(id) : null;

    if (payload) {
      applyDataToFeature(id, payload);
      pendingYUpdates.delete(id);
    } else if (pendingYUpdates.has(id)) {
      applyDataToFeature(id, pendingYUpdates.get(id));
      pendingYUpdates.delete(id);
    } else {
      f.setStyle(defaultStyle);
    }
  });

  // -------------------------------
  // Yjs integration
  // -------------------------------
  if (!Y) {
    console.error("Yjs not loaded yet");
  } else {
    console.log("Yjs in default.js", Y);

    const ydoc = new window.Y.Doc();
    const ySelections = ydoc.getMap('selections');
    const yprovider = new window.WebsocketProvider(YSERVER_URL, Y_ROOM, ydoc);

    window.ydoc = ydoc;
    window.ySelections = ySelections;
    window.yprovider = yprovider;

    if (yprovider && yprovider.on) {
      yprovider.on('status', evt => console.log('Y provider status:', evt.status));
    }

    selectSingleClick.on('select', evt => {
      evt.selected.forEach(f => {
        const id = f.getId && f.getId();
        if (!id) return;

        f.setStyle(selectedStyle);

        const existing = ySelections.get(id) || {};
        const merged = {
          ...existing,
          selected: true
        };

        if (f.get('tag_color') && !merged.color) merged.color = f.get('tag_color');
        if (f.get('tag') && !merged.tag) merged.tag = f.get('tag');

        try {
          ySelections.set(id, merged);
        } catch (err) {
          console.error('ySelections.set failed on select', err);
        }
      });

      evt.deselected.forEach(f => {
        const id = f.getId && f.getId();
        if (!id) return;

        const existing = ySelections.get(id) || {};
        const merged = { ...existing, selected: false };

        try {
          ySelections.set(id, merged);
        } catch (err) {
          console.error('ySelections failed on deselect', err);
        }

        if (merged.tag && merged.color) {
          f.setStyle(new ol.style.Style({
            fill: new ol.style.Fill({ color: merged.color }),
            stroke: new ol.style.Stroke({ color: 'rgba(200,155,55,0.95)', width: 2 })
          }));
        } else {
          f.setStyle(defaultStyle);
        }
      });
    });

    ySelections.observe(event => {
      event.changes.keys.forEach((change, key) => {
        const payload = ySelections.get(key);
        const f = sourceWFS.getFeatureById(key);

        if (!f) {
          if (payload) pendingYUpdates.set(key, payload);
          else pendingYUpdates.delete(key);
          return;
        }

        if (!payload) {
          f.set('tag', null);
          f.set('tag_color', null);
          f.setStyle(defaultStyle);
          if (selectedFeatures.getArray().includes(f)) selectedFeatures.remove(f);
          return;
        }

        if (payload.tag) f.set('tag', payload.tag);
        else f.set('tag', f.get('tag') || null);

        if (payload.color) f.set('tag_color', payload.color);
        else f.set('tag_color', f.get('tag_color') || null);

        if (payload.selected === true) {
          if (!selectedFeatures.getArray().includes(f)) {
            selectedFeatures.push(f);
          }
          f.setStyle(selectedStyle);
        } else {
          if (payload.color || f.get('tag_color')) {
            const c = payload.color || f.get('tag_color');
            f.setStyle(new ol.style.Style({
              fill: new ol.style.Fill({ color: c }),
              stroke: new ol.style.Stroke({ color: 'rgba(200,155,55,0.95)', width: 2 })
            }));
          } else {
            f.setStyle(defaultStyle);
          }
          if (selectedFeatures.getArray().includes(f)) selectedFeatures.remove(f);
        }
      });

      try {
        refreshSelectedUI();
        selectedFeatures.changed();
      } catch (err) {
        console.log(err);
      }
    });

    ySelections.forEach((val, key) => {
      const f = sourceWFS.getFeatureById(key);
      if (f) applyDataToFeature(key, val);
      else pendingYUpdates.set(key, val);
    });

    console.log('Yjs client initialised, room:', Y_ROOM);
  }

  // -------------------------------
  // Apply data to feature
  // -------------------------------
  function applyDataToFeature(id, payload) {
    const f = sourceWFS.getFeatureById(id);
    if (!f) return;

    if (payload.tag) f.set('tag', payload.tag);
    else f.set('tag', f.get('tag') || null);

    if (payload.color) f.set('tag_color', payload.color);
    else f.set('tag_color', f.get('tag_color') || null);

    if (payload.user) f.set('tag_user', payload.user);
    if (payload.ts) f.set('tag_ts', payload.ts);

    if (payload.color) {
      f.setStyle(new ol.style.Style({
        fill: new ol.style.Fill({ color: payload.color }),
        stroke: new ol.style.Stroke({ color: 'rgba(200,155,55,0.95)', width: 2 })
      }));
    } else if (payload.selected) {
      f.setStyle(selectedStyle);
    } else {
      f.setStyle(defaultStyle);
    }

    if (typeof payload.selected === 'boolean') {
      const arr = selectedFeatures.getArray();
      if (payload.selected && !arr.includes(f)) selectedFeatures.push(f);
      if (!payload.selected && arr.includes(f)) selectedFeatures.remove(f);
    }
  }

  // -------------------------------
  // Add button to write tags to Yjs
  // -------------------------------
  $("#btn_submit_data").on("click", () => {
    const chosenTagVal = $("#emotionSelectOptn").val();
    const chosenTag = Array.isArray(chosenTagVal) ? chosenTagVal[0] : chosenTagVal;
    const comment = $("#modaltextcomment").val() || '';

    if (!chosenTag) { alert('Please select a tag.'); return; }

    const userLabel = window.USERNAME || 'anonymous';
    const color = tagColor(chosenTag);

    const featuresToTag = selectedFeatures.getArray().slice();

    if (featuresToTag.length === 0) { alert('Select at least one grid cell on the map first.'); return; }

    featuresToTag.forEach(f => {
      const id = f.getId && f.getId();
      if (!id) return;

      const payload = {
        tag: chosenTag,
        comment,
        color,
        user: userLabel,
        ts: Date.now(),
        selected: false
      };

      try {
        if (window.ySelections) window.ySelections.set(id, payload);
      } catch (err) {
        console.error('Failed to set ySelections on add', err);
        applyDataToFeature(id, payload);
      }
    });

    const modalEl = document.getElementById('modalCommentForm');
    const modal = bootstrap.Modal.getInstance(modalEl);
    if (modal) modal.hide();

    selectedFeatures.clear();
    refreshSelectedUI();
  });

  function tagColor(tag) {
    switch (tag) {
      case 'ripe': return 'rgba(34,139,34,0.45)';
      case 'harvesting': return 'rgba(255,165,0,0.45)';
      case 'grass': return 'rgba(124,252,0,0.45)';
      case 'pathway': return 'rgba(255,105,180,0.45)';
      case 'dryland': return 'rgba(165,42,42,0.45)';
      default: return 'rgba(238,238,206,0.45)';
    }
  }

  window.clearTag = featureId => {
    if (window.ySelections) window.ySelections.delete(featureId);
  };

  console.log('default.js initialised');
});
