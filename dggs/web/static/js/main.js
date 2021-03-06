

      function applyMargins() {
        var leftToggler = $(".mini-submenu-left");
        if (leftToggler.is(":visible")) {
          $("#map .ol-zoom")
            .css("margin-left", 0)
            .removeClass("zoom-top-opened-sidebar")
            .addClass("zoom-top-collapsed");
        } else {
          $("#map .ol-zoom")
            .css("margin-left", $(".sidebar-left").width())
            .removeClass("zoom-top-opened-sidebar")
            .removeClass("zoom-top-collapsed");
        }
      }

      function isConstrained() {
        return $(".sidebar").width() == $(window).width();
      }

      function applyInitialUIState() {
        if (isConstrained()) {
          $(".sidebar-left .sidebar-body").fadeOut('slide');
          $('.mini-submenu-left').fadeIn();
        }
      }

      $(function(){
        $('.sidebar-left .slide-submenu').on('click',function() {
          var thisEl = $(this);
          thisEl.closest('.sidebar-body').fadeOut('slide',function(){
            $('.mini-submenu-left').fadeIn();
            applyMargins();
          });
        });

        $('.mini-submenu-left').on('click',function() {
          var thisEl = $(this);
          $('.sidebar-left .sidebar-body').toggle('slide');
          thisEl.hide();
          applyMargins();
        });

        $(window).on("resize", applyMargins);




<!---->

      console.log("here")
//      var cells = "{{ grid|safe }}";

var cells = MyGlobal.var_1;

      var raster = new ol.layer.Tile({
        source: new ol.source.OSM()
      });

      vectorSource = new ol.source.Vector({
        features: (new ol.format.GeoJSON()).readFeatures(cells, {dataProjection: 'EPSG:4326',featureProjection: 'EPSG:4326'})
      });

      vectorLayer = new ol.layer.Vector({
        source: vectorSource
      });

      var map = new ol.Map({
        target: 'map',
        layers: [raster, vectorLayer],
        view: new ol.View({
        center: [0, 0],
        zoom: 2,
        projection: 'EPSG:4326'
        })
      });

<!---->



        applyInitialUIState();
        applyMargins();
      });