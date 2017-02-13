$("body")
  .append($('<link href="https://cdnjs.cloudflare.com/ajax/libs/c3/0.4.11/c3.min.css" rel="stylesheet" type="text/css">'))
  .append($('<script src="https://cdnjs.cloudflare.com/ajax/libs/c3/0.4.11/c3.min.js"></script>'))
  .append($('<script src="https://cdn.datatables.net/1.10.13/js/jquery.dataTables.min.js"></script>'))
  .append($('<script src="https://cdn.rawgit.com/anvaka/panzoom/v1.2.1/dist/panzoom.min.js"></script>'))
  .append($('<link href="https://cdn.datatables.net/1.10.13/css/jquery.dataTables.min.css" rel="stylesheet" type="text/css">'))
;

function augmentFrame() {
$(".outer").each(function() {
   var frame=$(this);

   function toggleChart(type) {
	  var chart = frame.data().chart
	  if (chart) {
      	  frame.find(".c3-chart").show();
          chart.transform(type.toLowerCase());
      }
   }

   function createChart() {
      var $tables = frame.find("neo-table table.table.data").not(".datatable");
      if (frame.find(".c3-chart").length > 0 || !$tables.length) return null;
      var data = $tables.map(function() { 
           var isText = function() { return this.nodeType == 3; }
           var text = function() { return $(this).text(); }
           var ctext = function() { return $(this).find("*").andSelf().contents().filter(isText).map(text).toArray().join(" "); }
           var texts = function (x) { return x.map(ctext).toArray() };
           var $table=$(this); 
           return { 
              header: texts($table.find("thead tr th")), 
              data: $table.children("tbody").children("tr").map(
                 function() { return [texts($(this).children("td"))]; }).toArray()
           }
        }).get(0);
        var columns = d3.transpose(data.data)
        data.header.forEach(function(x,i) { columns[i].unshift(x); })
      
      var $chart = $('<div class="c3-chart"><div class="container"></div></div>').hide()
      .css({'z-index':1,position:'relative','background-color':'white'})
      .append($('<a class="sl button sl-delete">').css({position:"absolute",right:5,top:5,'z-index':2,display:'block'}).click(function() {$chart.hide();}))
      .prependTo(frame.find(".view-result-table"));
      return c3.generate({ bindto: $chart.find('.container').get(0),
        data: { x: columns[0][0],  columns: columns /*labels: true,*/ , type: 'line'}, 
        axis: { x: { type: columns[0][1].match(/[^0-9-+.,]/)  ? 'category' : 'indexed'  } } });
   }

   var chart = createChart();
   if (chart) {
      frame.data({chart: chart});
   
      var $actions=frame.find(".code-bar ul.actions")
      if (!$actions.find(".sl-business-chart").length) {
         var $dropdown = $(`
         <li dropdown="dropdown" class="dropdown"> \
           <a dropdown-toggle="dropdown-toggle" tooltip-placement="bottom" tooltip="Render table as chart" class="button sl sl-business-chart dropdown-toggle" aria-haspopup="true" aria-expanded="true" onClick="$(this).siblings('.dropdown-menu').show()"></a> \
           <ul class="dropdown-menu"> \ 
             <li></li> \
           </ul> \
         </li>`);
   	  var $dropdownMenu = $dropdown.find("ul.dropdown-menu");
         var types=["Line","Spline","Step","Area","Area-Spline","Area-Step","Bar","Scatter","Pie","Donut","Gauge"];
         var $charts=types.map(function(t) { return $('<a>').text(t).click(function() { toggleChart(t); $dropdownMenu.hide(); })});
   
         $dropdownMenu.find("li").append($charts);
   
         $actions.prepend($dropdown);
      }
      frame.find("neo-table table.table.data").not(".datatable").addClass("datatable").css({padding:10}).DataTable();
   }
   frame.find(".graph > g,.query-plan > g").not("[panzoom]").attr("panzoom","panzoom")
        .each(function() { panzoom($(this).get(0), { beforeWheel: function(e) { return !e.altKey; }}); });
})};

setInterval(augmentFrame,1000);
