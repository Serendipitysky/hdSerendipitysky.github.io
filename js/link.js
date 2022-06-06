require([
	"esri/config",
	"esri/Map",
	"esri/views/MapView",
	"esri/layers/FeatureLayer",
	"esri/Graphic",
	"esri/layers/GeoJSONLayer",
	"esri/geometry/geometryEngine",
	"esri/core/watchUtils",
    "esri/widgets/LayerList",
	"esri/widgets/Expand",
	"esri/widgets/Legend",
	"esri/layers/GraphicsLayer"
	], 
	function (esriConfig, Map, MapView, FL, Graphic, GeoJSONLayer,geometryEngine,watchUtils, LayerList,Expand,Legend,GraphicsLayer) {

		esriConfig.apiKey = "AAPK56e3ac027f044c4089d8ceec232fc05dYaOuzVRzm8tMRqvzOvDvIEevbqJ85yppn9PacU6cy4duurJrVK9wo_8BcWO8i8bi";
		
		//基础底图
		var map = new Map({
					basemap: "osm" // Basemap layer service
				});
				//主视图
		var view = new MapView({
			map: map,
			center: [-96.8715637, 38.3202978], // Longitude, latitude
			zoom: 4, // Zoom level
			container: "viewDiv" // Div element
		});	
		var map2 = new Map({
			basemap: "dark-gray"
		});
		//附图（左）
		var view2 = new MapView({
			map: map2,
			center: [-96.8715637, 38.3202978], // Longitude, latitude
			zoom: 4, // Zoom level
			container: "viewDiv2",
		});
		
//1.可以同时出现两幅地图，对其中任意一幅地图做浏览操作（平移缩放)，另外一幅地图都会响应并保持一致。
		//该功能见5

				
//2.切换底图
		//四种basemap类型
		document.getElementById("osm").addEventListener("click", function () {
		    map.basemap = "osm";
		});	
		document.getElementById("streets").addEventListener("click", function () {
		    map.basemap = "streets";
		});	
		document.getElementById("oceans").addEventListener("click", function () {
		    map.basemap = "oceans";
		});	
		document.getElementById("hybrid").addEventListener("click", function () {
		    map.basemap = "hybrid";
		});			
		
//3.能够动态加载专题图层。可以显示图层的数量，控制图层的显示与关闭。能够删除图层。
		//引用图层url
		var layer_Resilience = new FL({//野火恢复情况
			url: "https://services8.arcgis.com/O5dJJKQg5b6RjO3d/arcgis/rest/services/Wildfire_Resiliency_Census_Tract_View/FeatureServer",
			
		});
		
		var layer_Wildfires = new FL({//野火发生地点
			url: "https://services9.arcgis.com/RHVPKKiFTONKtxq3/arcgis/rest/services/USA_Wildfires_v1/FeatureServer",
			
		});
		
		var layer_Climate = new FL({//气温
			url: "https://services8.arcgis.com/O5dJJKQg5b6RjO3d/arcgis/rest/services/LOCA_MultiScale_Hexbins_view/FeatureServer",
			
		});
		
		var layer_Forest = new FL({//森林
			url: "https://services.arcgis.com/P3ePLMYs2RVChkJx/arcgis/rest/services/USA_Forest_Service_Lands/FeatureServer",
			
		});

	
		//创建图例
		var legend = new Legend({
		  view: view,
		  layerInfos: [
			{
			  layer: layer_Wildfires
			},
			{
			  layer: layer_Climate
			},
			{
			  layer: layer_Forest
			}
		  ]
		});
		


		//图例可隐藏
		var legendExpand = new Expand({
		  expandTooltip: "Show Legend",
		  expanded: false,
		  view: view,
		  content: legend
		});
        view.ui.add(legendExpand, "bottom-left");
		
		//添加图层
		document.getElementById("Add_layer1").addEventListener("click", function () {
			map.add(layer_Resilience);
		});
		
		document.getElementById("Add_layer2").addEventListener("click", function () {
			map.add(layer_Wildfires);
		});

		document.getElementById("Add_layer3").addEventListener("click", function () {
			map.add(layer_Climate);
		});

		document.getElementById("Add_layer4").addEventListener("click", function () {
			map.add(layer_Forest);
		});

		//删除图层
		document.getElementById("Remove_layer1").addEventListener("click", function () {
			view.map.remove(layer_Resilience);
		});
		
		document.getElementById("Remove_layer2").addEventListener("click", function () {
			view.map.remove(layer_Wildfires);
		});

		document.getElementById("Remove_layer3").addEventListener("click", function () {
			view.map.remove(layer_Climate);
		});

		document.getElementById("Remove_layer4").addEventListener("click", function () {
			view.map.remove(layer_Forest);
		});		
		//显示图层数目
	    view.map.allLayers.on("change", function (event) {
			var num = event.target.length - 1;
			document.getElementById("Layers").textContent = "当前图层数： " + num;
		});
		

//4.显示地图比例尺，并能根据地图的缩放调整比例尺的数值。鼠标在地图上移动时，能实时显示坐标。
		
		view.watch(["stationary"], function () {
			showInfo(view.center);
		});
		//添加显示鼠标的坐标点
		view.on(["pointer-move"], function (evt) {
			showInfo(view.toMap({
				x: evt.x,
				y: evt.y
			}));
		});
		view2.on(["pointer-move"], function (evt) {
			showInfo(view.toMap({
				x: evt.x,
				y: evt.y
			}));
		});
		//添加比例尺和实时经纬度坐标
		function showInfo(pt) {
			document.getElementById("scaleDisplay").textContent = "当前比例尺：1:" + Math.round(view.scale);
			//console.log(Math.round(view.scale))
			document.getElementById("coordinateDisplay").textContent = "经度:" + pt.latitude.toFixed(7) + "，" + "  纬度：" + pt.longitude
				.toFixed(7);
		}
		
		//省份图层添加
		
//5.每加载一个图层，生成鹰眼图（缩略图）
		/*
		//基础底图
		var map = new Map({
			basemap: "streets" // Basemap layer service
		});
		//主视图
		var view = new MapView({
			map: map,
			center: [119, 35.027], // Longitude, latitude
			zoom: 3, // Zoom level
			container: "viewDiv" // Div element
		});	
		*/
		//创建缩略底图
		
		//创建缩略图容器
		var mapView = new MapView({
		  container: "overviewDiv",
		  map: map,
		  constraints: {
			rotationEnabled: false
		  }
		});
		
		view.on(["pointer-down", "pointer-move"], function (evt) {
			mapView.scale = view.scale * 2 *
                    Math.max(
                      view.width / mapView.width,
                      view.height / mapView.height
                    );
			mapView.center = view.center;
			view2.zoom = view.zoom;
			view2.center = view.center;
		});
		mapView.on(["pointer-down", "pointer-move"], function (evt) {
			view.scale = mapView.scale * 0.5 *
		            Math.max(
		              mapView.width / view.width,
		              mapView.height / view.height
		            );
			view.center = mapView.center;
			view2.zoom = view.zoom;
			view2.center = view.center;
			
		});
		view2.on(["pointer-down", "pointer-move"], function (evt) {
			mapView.scale = view.scale * 2 *
		            Math.max(
		              view2.width / mapView.width,
		              view2.height / mapView.height
		            );
			mapView.center = view2.center;
			view.zoom = view2.zoom;
			view.center = view2.center;
		});

		
				

		//除去额外控件
		mapView.ui.components = [];

		mapView.when(() => {
		  view.when(() => {
			setup();
		  });
		});
		
		
		//定义遮罩的样式和属性
		function setup() {
		  const extent3Dgraphic = new Graphic({
			geometry: null,
			symbol: {
			  type: "simple-fill",
			  color: [0, 0, 0, 0.5],
			  outline: null
			}
		  });
		  mapView.graphics.add(extent3Dgraphic);
		
		  watchUtils.init(view, "extent", (extent) => {
		
			extent3Dgraphic.geometry = extent;
		
		  });
		}
//高亮查询
		

	});