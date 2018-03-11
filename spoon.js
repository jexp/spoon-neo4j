$("body")
  .append($('<link href="https://cdnjs.cloudflare.com/ajax/libs/c3/0.4.11/c3.min.css" rel="stylesheet" type="text/css">'))
  .append($('<script src="https://cdnjs.cloudflare.com/ajax/libs/c3/0.4.11/c3.min.js"></script>'))
  .append($('<script src="https://cdn.datatables.net/1.10.16/js/jquery.dataTables.min.js"></script>'))
  .append($('<script src="https://cdn.rawgit.com/anvaka/panzoom/v1.2.1/dist/panzoom.min.js"></script>'))
  .append($('<link href="https://cdn.datatables.net/1.10.16/css/dataTables.semanticui.min.css" rel="stylesheet" type="text/css">'))
;

/*
  .append($('<script src="https://cdn.datatables.net/1.10.16/js/dataTables.semanticui.min.js"></script>'))

https://cdn.datatables.net/buttons/1.5.1/css/buttons.semanticui.min.css
https://cdn.datatables.net/buttons/1.5.1/js/dataTables.buttons.min.js
https://cdn.datatables.net/buttons/1.5.1/js/buttons.semanticui.min.js

https://cdn.datatables.net/buttons/1.5.1/js/buttons.colVis.min.js
https://cdn.datatables.net/buttons/1.5.1/js/buttons.html5.min.js
https://cdn.datatables.net/buttons/1.5.1/js/buttons.print.min.js

https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.35/pdfmake.min.js
https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.35/vfs_fonts.js



https://cdn.datatables.net/fixedheader/3.1.3/css/fixedHeader.semanticui.min.css
https://cdn.datatables.net/fixedheader/3.1.3/js/dataTables.fixedHeader.min.js


https://cdn.datatables.net/responsive/2.2.1/css/responsive.semanticui.min.css
https://cdn.datatables.net/responsive/2.2.1/js/dataTables.responsive.min.js
https://cdn.datatables.net/responsive/2.2.1/js/responsive.semanticui.min.js


https://cdn.datatables.net/rowgroup/1.0.2/css/rowGroup.semanticui.min.css
https://cdn.datatables.net/rowgroup/1.0.2/js/dataTables.rowGroup.min.js

*/

function augmentFrame() {
$("article[data-test-id=frame]").each(function() {
   var frame=$(this);

   function toggleChart(type) {
	  var chart = frame.data().chart;
	  if (chart) {
      	  frame.find(".c3-chart").show();
          chart.transform(type.toLowerCase());
      }
   }

   function createChart() {
      var $tables = frame.find("table[class^=DataTables_]").not(".datatable");
      console.log("tables",$tables.get(),"charts",frame.find(".c3-chart").get().length > 0, "table-count",$tables.get().length);
      if (frame.find(".c3-chart").get().length > 0 || $tables.get().length == 0 ) return null;
      var data = $tables.map(function() { 
           var isText = function() { return this.nodeType == 3; }
           var text = function() { return $(this).text(); }
           var ctext = function() { return $(this).find("*").addBack().contents().filter(isText).map(text).toArray().join(" "); }
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
      var $container = frame.find("div[class^=styled__StyledFrameContents-]"); // frame.find(".view-result-table");
      var $chart = $('<div class="c3-chart"><div class="container"></div></div>').hide()
      .css({'z-index':1,position:'relative','background-color':'white'})
      .append($('<a class="sl button sl-delete">').css({position:"absolute",right:5,top:5,'z-index':2,display:'block'}).click(function() {$chart.hide();}))
      .prependTo($container);
      return c3.generate({ bindto: $chart.find('.container').get(0),
        data: { x: columns[0][0],  columns: columns /*labels: true,*/ , type: 'line'}, 
        axis: { x: { type: columns[0][1].match(/\d\d-\d\d/) ? 'timeseries' : (columns[0][1].match(/^[+-]?[0-9.,]+$/)  ? 'indexed' : 'category')  } } });
   }

   var chart = createChart();
   if (chart) {
//      console.log("chart",chart);
      var dt = frame.find("table[class^=DataTables_]").not(".datatable").addClass("datatable").css({}).DataTable({order:[],paging:false, "dom": '<"toolbar">frtip', buttons: ['copy', 'excel', 'csv','pdf']});
      var $toolbar = $(dt).find(".toolbar").html('<strong>Test</strong>');

      frame.data({chart: chart});
/*
<li class="styled__DropdownButton-fOPewU czWaQf"><i class=" sl-download-drive"></i><ul class="styled__DropdownList-jSMIUB iGGLEa"><li class="styled__DropdownContent-dIlyku gXbjWO"><span><a class="styled__DropdownItem-fYNfOP FLRWQ">Export PNG</a><a class="styled__DropdownItem-fYNfOP FLRWQ">Export SVG</a></span></li></ul></li>
*/   
      function otherStyles($start, select) {
	      return $start.find("[class^="+select+"]").map(function() { return $(this).attr('class').split(' ').filter(function(t) { return !t.match(select) }).join(" ") }).get(0);
      }
      // var $actions=$toolbar; // 
      var $actions=frame.find("ul[class^=styled__FrameTitlebarButtonSection]");
//      console.log("buttons",$actions);
      if (!$actions.find(".sl-business-chart").get().length) {
         var $dropdown = $(`
         <li dropdown="dropdown" class="dropdown ${otherStyles($actions, 'styled__DropdownButton-')}"> \
           <a dropdown-toggle="dropdown-toggle" tooltip-placement="bottom" tooltip="Render table as chart" class="button sl sl-business-chart dropdown-toggle" aria-haspopup="true" aria-expanded="true" onClick="$(this).siblings('.dropdown-menu').show()"></a> \
           <ul class="dropdown-menu ${otherStyles($actions, 'styled__DropdownList-')}"> \ 
             <li class="${otherStyles($actions, 'styled__DropdownContent-')}" style="z-index:2;"></li> \
           </ul> \
         </li>`);
         var $dropdownMenu = $dropdown.find("ul.dropdown-menu");
         var types=["Line","Spline","Step","Area","Area-Spline","Area-Step","Bar","Scatter","Pie","Donut","Gauge"];
         var $charts=types.map(function(t) { return $('<a>').attr('class',otherStyles($actions, 'styled__DropdownItem-')).text(t).click(function() { toggleChart(t); $dropdownMenu.hide(); })});
   
         $dropdownMenu.find("li").append($charts);
   
//         $toolbar.append($charts);
         $actions.prepend($dropdown);
      }
   }
   frame.find(".neod3viz > g,g.layer.links,g.layer.operators").not("[panzoom]").attr("panzoom","panzoom")
        .each(function() { panzoom($(this).get(0), { beforeWheel: function(e) { return !e.altKey; }}); });
})};

setInterval(augmentFrame,1000);
