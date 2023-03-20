console.log("bkd-node-jq: common");
    
BKDnode = {
  siteurl: "",
  nodeAnchor: null,
  srcAnchor: null,
  query: "",
  qmode: "",
  qtotal: 0,
  srcFirstNode: 0,
  srcMaxNode: 10,
  flist: null,
  fldet: null,
  flport: null,
  igvbrowse:null,
  flview: "#swmod",
  paneon: null,
  data: null,
  cpos37: "",
  cpos38: "",
  init: function( data, srcAnchor, nodeAnchor, flist, mode){
    BKDnode.view( data, srcAnchor, nodeAnchor, flist, mode);
  },

  view: function(data, srcAnchor, srcViewAnchor, nodeAnchor, flist, mode){
         
    this.srcAnchor=srcAnchor;
    this.srcViewAnchor=srcViewAnchor;
    this.nodeAnchor=nodeAnchor;
    
    
    if(data == null ){
      $( nodeAnchor ).hide();            
      BKDnode.search( data, node.srcAnchor );
      $( srcAnchor ).show();            
    }else{
      BKDnode.data = data;
      $( srcAnchor ).hide();            
      $( srcViewAnchor ).hide();            
      BKDnode.nodeView( data, this.srcAnchor, this.srcViewAnchor,
                        this.nodeAnchor, flist, mode );
      $( nodeAnchor ).show();
    }
  },

  doSearch: function(){
      var squery = $("#bkd-squery").val();
      BKDnode.query=squery;
      var qmode =  $("#bkd-qmode").val();  
      BKDnode.qmode=qmode;

      BKDnode.srcFirstNode = 0; // reset page
      
      console.log(qmode + ":" + squery + "first:" + BKDnode.srcFirstNode + "  max: " + BKDnode.srcMaxNode);
      
      myurl ="search?qmode="+qmode+"&first="+BKDnode.srcFirstNode+"&max="+BKDnode.srcMaxNode+"&query="+squery;
      $("#bkd-search-table").hide();   
      $("#bkd-node-spinner").show();
      $.ajax( { url: myurl} )
          .done( function(data, textStatus, jqXHR){
            console.log( JSON.stringify(textStatus)
                         + " || data.length: "  + JSON.stringify(data).length); 
             $("#bkd-node-spinner").hide();
             $("#bkd-search-table").show();
             BKDnode.searchView( data.rdata,
                                 data.rstats,
                                 "#bkd-search", "#bkd-search-view", 
                                 "#bkd-node-view",
                                 BKDconf["node"], qmode) } );
  },

  doHeadSearch: function(){
      var squery = $("#bkd-head-squery").val();
      var qmode =  $("#bkd-head-qmode").val();  

      console.log( "HeadSearch: " + qmode + ":" + squery);
      
      myurl ="search?query="+squery+"&qmode="+qmode;          
      $.ajax( { url: myurl} )
          .done( function(data, textStatus, jqXHR){
            console.log( JSON.stringify(textStatus)
                         + " || data.length: "  + JSON.stringify(data).length); 

             BKDnode.searchView( data.rdata,
                                 data.rstats,  
                                 "#bkd-search", "#bkd-search-view",
                                 "#bkd-node-view",
                                 BKDconf["node"], qmode) } );
  },
  
  search: function( data, srcAnchor ){

    $(srcAnchor + " form").submit(
      function (event) {
        var radioValue = $("input[name='smode']:checked").val();
        if(radioValue){
              //alert("Your are a - " + radioValue);
        } else {
              radioValue = 'protein';
        }

        var q = $("#bkdQuery").val();
        var ns = "";
        var ac = "";
        var formData = {};
        if(q.startsWith("upr:") ){
          ns="upr";
          ac=q.replace("upr:","");

          formData = {
            query: q,
            ns: ns,
            ac: ac,
            qmode: radioValue,
            ret: "data"
          };
        }else{
          formData = {
            query: q,
            ns: ns,
            ac: ac,
            qmode: radioValue,
            ret: "data"
          };
        }
          
        $.ajax({
           type: "POST",            
           url: "search",
           data: formData,
           dataType: "json",
           encode: true,}).done(
             function (data) {
               if( data.rdata != null && data.rdata.length > 0){
                 BKDnode.searchView( data.rdata, data.rstats, BKDrep.srcAnchor, "view" );  
               }else if(data.record !== null){
                 BKDrep.nodeView( data.record, BKDrep.nodeAnchor, "view" );               
               }
             });

        event.preventDefault();
      });
  },

  searchPage: function(){
      // run query      
      myurl ="search?qmode="+BKDnode.qmode+"&first="+BKDnode.srcFirstNode+"&max="+BKDnode.srcMaxNode+"&query="+BKDnode.query;
      $("#bkd-search-table").hide();   
      $("#bkd-node-spinner").show();
      $.ajax( { url: myurl} )
          .done( function(data, textStatus, jqXHR){
            console.log( JSON.stringify(textStatus)
                         + " || data.length: "  + JSON.stringify(data).length); 
             $("#bkd-node-spinner").hide();
             $("#bkd-search-table").show();
             BKDnode.searchView( data.rdata,
                                 data.rstats,
                                 "#bkd-search", "#bkd-search-view", 
                                 "#bkd-node-view",
                                 BKDconf["node"], BKDnode.qmode) } );

  },


  bkdTablePager: function( anchor ){   // data == BKDnode

     $( anchor ).empty();
     $( anchor ).append( "<tr>" +
                         "<td>Total Records: " + String(BKDnode.qtotal+1) + " | </td>" +
                         "<td><input id='bkd-page-first' type='button' value='&lt;&lt;first' /></td>"+
                         "<td><input id='bkd-page-prev' type='button' value='&lt;prev' /></td>" +
                         "<td id='bkd-page-current'></td>" +
                         "<td><input id='bkd-page-next' type='button' value='next&gt;' /></td>" +
                         "<td><input id='bkd-page-last' type='button' value='last&gt;&gt;' /></td>"+
                         "<td> | Page size: <select id='bkd-page-size'>"+
                         "<option value='5'>5</option>"+
                         "<option value='10'>10</option>"+
                         "<option value='25'>25</option>"+
                         "</select></td>"+
                         "</tr>" );

     $( "#bkd-page-size" ).val(BKDnode.srcMaxNode);

     $('#bkd-page-size').on( 'change', function(event){     
            BKDnode.srcMaxNode = $( "#bkd-page-size" ).val();
            var fpos = (BKDnode.srcFirstNode+1)/BKDnode.srcMaxNode;
            BKDnode.srcFirstNode = Math.floor( fpos ) * BKDnode.srcMaxNode;
            BKDnode.searchPage();
        });

     
     $('#bkd-page-first').on( 'click', function(event){                        
                        BKDnode.srcFirstNode = 0;
                        BKDnode.searchPage();
                  });
    
     $('#bkd-page-prev').on( 'click', function(event){                       
                         BKDnode.srcFirstNode -= BKDnode.srcMaxNode;
                         if( BKDnode.srcFirstNode < 0){
                            BKDnode.srcFirstNode = 0;                           
                         }
                         BKDnode.searchPage();                        
                   });
     
     var cpg = Math.floor( (BKDnode.srcFirstNode+1)/BKDnode.srcMaxNode) +1;  // current page
     var mpg = Math.floor( (BKDnode.qtotal+1)/BKDnode.srcMaxNode ) +1; // max page

     var spgr = (cpg - 2) < 1 ? 1 : cpg - 2; // start pager
     var epgr = (spgr + 5) < mpg ? (spgr + 5) : mpg;  // end pager
     spgr = epgr - 5 < 1 ? 1 : epgr - 5;  

     for(var p = spgr; p < epgr; p++ ){
        if( p == cpg ){
             $('#bkd-page-current').append( " <b>" + p + "</b> ");
       } else {
            $('#bkd-page-current').append( " <a href='' class='bkd-pager-"+p+" bkd-pager-current'> " + p + "</a> ");
            $('#bkd-page-current .bkd-pager-'+p).on( 'click', p, function(event){
               BKDnode.srcFirstNode = BKDnode.srcMaxNode*(event.data - 1);               
               BKDnode.searchPage();
               return false;
            });
            
       }
    }

                  
    $('#bkd-page-next').on( 'click', function(event){                                             
                         if( BKDnode.srcFirstNode + BKDnode.srcMaxNode < BKDnode.qtotal){
                             BKDnode.srcFirstNode += BKDnode.srcMaxNode;
                         }
                         BKDnode.searchPage();
                   });

    $('#bkd-page-last').on( 'click', function(event){
                         BKDnode.srcFirstNode = BKDnode.qtotal - BKDnode.qtotal % BKDnode.srcMaxNode; 
                         BKDnode.searchPage();
                   });
                   
  },

  searchView: function(data, stats, srcAnchor, srcViewAnchor, nodeViewAnchor, mode ){
  
    var tid="bkd-search-table";
    var pid="bkd-search-pager";
    
    $(srcViewAnchor).hide();
    $(nodeViewAnchor).hide();
    
    BKDnode.qtotal = stats.total;

    $(srcViewAnchor).empty();    
    $(srcViewAnchor).append( "<hr/>"
                         + "<table id='" + pid + "'></table>"
                         + "<table id='" + tid
                         + "' border='0' cellspacing='0' cellpadding='0' class='bkd-search-table'>"
                         + "</table>");

    BKDnode.bkdTablePager( '#' + pid );   

    $('#' + tid).append("<tr class='bkd-rep-fld bkd-search-table-header'>"+
                                  "<th align='center' width='5%'>ID</th>"+                                  
                                  "<th align='center' width='10%'>Short Name</th>"+
                                  "<th align='center'>Full Name</th>"+
                                  "<th align='center' width='10%'>Species</th>"+
                                  "<th align='center' width='10%'>UniprotKB</th>"+
                                  "<th align='center' width='10%'>Type</th>"+
                                  "<th align='center' width='5%' colspan='2'>&nbsp;</th>"+
                                "</tr>");
    for(var i=0; i<data.length; i++){
               var cdata = data[i];
               var rid = cdata.ac;

               var modalDivID = cdata.ac + "-modal"; 
               var modalAct = cdata.ac + "-act"; 

               var crow = "<td>" + cdata.ac + "</td>" +
                          "<td align='center'>" + cdata.label + "</td>" +
                          "<td>" + cdata.name + "</td>" +
                          "<td align='center'>" + cdata.taxon.sciName + "</td>" +
                          "<td align='center' id='" +modalAct + "'><a href='https://www.uniprot.org/uniprot/"+cdata.upr + "' target='_bkd'>"+cdata.upr+"</a></td>" + 
                          "<td align='center'>" + cdata.cvType.name + "</td>" + 
                          "<td align='center'>" +
                          "<input type='button' id='"+rid+"_view' value='Details'/>"+
                          "</td>" +                          
                          "<td align='center'>" +
                          "<input type='button' id='"+rid+"_report_view' value='CVUS Reports'/>"+
                          "</td>";
                          
               $('#' + tid).append("<tr> class='bkd-rep-fld'>"+crow+"</tr>");

               //var modalDiv = "<div id='" + modalDivID + "' class='bkd-mode-anchor'></div>";
               //$('#modals').append(modalDiv);
                   //BKDmodal.init("#" + modalDivID, "#" + modalAct, 'https://beta.uniprot.org/uniprot/' + cdata.upr);

               $( "#" + rid +"_view").on( 'click', function(event){
                    var prefix= event.currentTarget.id.replace('_view','');
                    var elink="node?ns=" + BKDsite.prefix + "&ac="+prefix+"&mode=view";
                    location.href = elink;                    
                  });

               $( "#" + rid +"_report_view").on( 'click', function(event){
                    var prefix= event.currentTarget.id.replace('_report_view','');

                    var elink="report?query=" + prefix + "&qmode=report";
                    location.href = elink;                    
                  });
    }
    $(srcAnchor).show();
    $(srcViewAnchor).show();
  },

  nodeView: function(data, srcAnchor, srcViewAnchor, nodeViewAnchor, fmt, mode ){
    
      $(nodeViewAnchor).empty();
      $(nodeViewAnchor).append( "<div id='bkd-hv-field'></div>"
                                +"<div id='bkd-nv-field'></div>" );
    
      // view type
      //----------

      var tvpath = fmt.type.vpath;
      var vformat = data;
 
      for( var t = 0; t <tvpath.length; t++){
          vformat = vformat[tvpath[t]]; 
      }

      //console.log( "FORMAT: " + JSON.stringify(vformat) );

      var format = fmt.type.view[vformat];

      //console.log( "NA: " + nodeViewAnchor );
      //console.log( "FL: " + JSON.stringify(format) );
    
      // node type & accession
      //----------------------
        
      var rac = format["ac"];
      var racval ="";
      var racpath = rac["vpath"];
      var cval = data;        
                
      for(var j=0; j<racpath.length; j++){
          //console.log("CVAL: " + racpath[j] + " : " + cval[ racpath[j]] );
          cval = cval[ racpath[j] ];
      }
    
      if( rac["id"] != null){           
          $("#bkd-hv-field").append( "<input id='" + rac["id"] + "'" +
                                     "class='bkd-report' />");
          
          cel = $("#" + rac["id"] )
          cel.val(cval);
          cel.attr('type','hidden');
          
          $("#bkd-main-name").append(format.type.label + cval);          
      }

      // fields (if present)
      //--------------------
      alert("node");
      
      if( format.field != null){
          for( var f = 0; f<format.field.length; f++){
              var cfield = format.field[f];
              //console.log("FIELd: " + cfield.name + ": " + cfield.type);

              switch( cfield.type ){
              case "text":
                  this.showTextx( "#bkd-hv-field", cfield, data );    
                  break;
           
              case "link":
                  this.showLink( "#bkd-hv-field", cfield, data );    
                  break;
           
              case "xref":
                  this.showXref( "#bkd-hv-field", cfield, data );    
                  break;
                  
              case "taxon":
                  this.showTaxon( "#bkd-hv-field", cfield, data );    
                  break;
                  
              case "sequence":
                  this.showSequence( "#bkd-hv-field", cfield, data );    
                  break;
              case "feature":             
                  this.showFeature( "#bkd-hv-field", cfield, data );    
                  break;
                  
              default:
                  console.log("Unknown format: " + cfield.type);
              }         
          }
      }
      
      // panels/sidebar
      //---------------

    if( format.pane != null && format.pane.length > 0){  

       BKDnode.paneon = format.defpane;

       //add pane/sidebar entries
       //------------------------
       
       for(var i=0; i< format.pane.length; i++ ){
          var cid = format.pane[i].id;
          var clbl = format.pane[i].label;

          $("#bkd-sidebar").append("<div id='bkd-sb-"+cid+"' class='sidebar-entry'>"+
                                       clbl+"</div>\n"); 
                                       
          $("#bkd-nv-field").append("<div id='bkd-nv-"+cid+"' class='nv-field'></div>\n");
          
          if( format.pane[i].header){
            $( "#bkd-nv-" + cid ).append(" <div id='bkd-nv-" + cid + "_head'>"+clbl+"</div>")
          }


          // events
          //-------

          $("#bkd-sb-"+cid).mouseover( function(event){
                 $(event.currentTarget).addClass("bkd-sb-entry-over");
                 //if(event.currentTarget.id == BKDnode.paneon ){
                 //  $(event.currentTarget).removeClass("bkd-sb-entry-on");
                 //} else {
                 //  $(event.currentTarget).removeClass("bkd-sb-entry-off");
                 //}
               });
        
          $("#bkd-sb-"+cid).mouseout( function(event){
                 //if(event.currentTarget.id == BKDnode.paneon ){
                 //  $(event.currentTarget).addClass("bkd-sb-entry-on");
                 //} else {
                 //  $(event.currentTarget).addClass("bkd-sb-entry-off");
                 //}
                 $(event.currentTarget).removeClass("bkd-sb-entry-over");
                 
               });
                 
          $("#bkd-sb-"+cid).click( function(event){
                 $("#bkd-nv-" + BKDnode.paneon).hide();
                 $("#bkd-sb-" + BKDnode.paneon).addClass("bkd-sb-entry-off");
                 $("#bkd-sb-" + BKDnode.paneon).removeClass("bkd-sb-entry-on");
                 BKDnode.paneon = event.currentTarget.id.replace("bkd-sb-","");
                 $("#bkd-nv-" + BKDnode.paneon).show();
                 $("#bkd-sb-" + BKDnode.paneon).addClass("bkd-sb-entry-on");
                 $("#bkd-sb-" + BKDnode.paneon).removeClass("bkd-sb-entry-off");                 
               });
       
          // build pane contents
          //--------------------
         
          var pformat = format.pane[i].field;
                    
          if( pformat != null ){
            for( var f = 0; f < pformat.length; f++){
              var cfield = pformat[f];
              //console.log("PFIELD: " + cfield.name + " :: " + cfield.type);
              switch( cfield.type ){
                case "text":
                  this.showText( "#bkd-nv-"+cid, cfield, data );    
                break;
              case "sequence":
                this.showSequence( "#bkd-nv-"+cid, cfield, data );    
                break;
              case "feature":
                this.showFeature( "#bkd-nv-"+cid, cfield, data );    
                break;
              case "xref":
                this.showXref( "#bkd-nv-"+cid, cfield, data );    
                break;
  
              }
            }
          }

          // select default pane
          //--------------------
          if( cid == BKDnode.paneon ){  // select default pane
             $( "#bkd-nv-" + cid ).show();
             $( "#bkd-sb-" + cid ).addClass("bkd-sb-entry-on");   
          } else{
             $( "#bkd-nv-" + cid ).hide();
             $( "#bkd-sb-" + cid ).addClass("bkd-sb-entry-off");
          }
       }

       

    } else {
       // no panels: hide sidepanel

    }

    var flist = []

    // go over configuration

    for( var i = 0; i < flist.length; i++){
 
          var fname = flist[i].name;
          //console.log("NAME: " + fname + " : list:" + flist[i].list +
          //            " value:" + flist[i].value);
          
          if( flist[i].list ){   // config field is list            
            
            if( flist[i].vpath ){    // vpath present; list of values @ vpath
              //console.log(" VPATH: present");
              var vpath = flist[i].vpath;           
              var fvlist = null; 
              if(vpath.length >0){
                fvlist = data['report'][vpath[0]];
                for(var j=1; j<vpath.length; j++){
                  if( fvlist[vpath[j]] ){
                    fvlist = fvlist[vpath[j]];
                  } else {
                    fvlist = null;
                    break;
                  }                  
                }
              }
            
              if( fvlist != null && fvlist.length > 0){  // values present: show 

                // header/body for value list

                $("#bkd-hv-field").append("<div class='bkd-rep-fld'>\n"+
                                    " <div class='bkd-rep-fld' id='"+flist[i].id+"_head'>"+fname+"</div>\n"+
                                    " <div class='bkd-rep-fld' id='"+flist[i].id+"_body'/>\n"+
                                    "</div>");

                $( "#" + flist[i].id + "_head").on('click',function(event){
                   $( "#"+event.currentTarget.id.replace('_head','_body')).toggle(); 
                });

                for(var v = 0; v <fvlist.length; v ++){

                  // one line for each list value

                  var cval = fvlist[v];                   
                  if(flist[i].type == "xref"){
                  
                     var cel = BKDlink.xref(cval);  
                     
                     $( "#" + flist[i].id + "_body" )
                       .append(" <div class='bkd-rep-fld'> "+cel+"</div>\n");

                  } else {
                     $( "#" + flist[i].id + "_body" )
                       .append(" <div class='bkd-rep-fld'> "+cval.ns +": "+cval.ac+"</div>\n");
                  }                 
                }
              }
              // done: vpath present
          }else if( flist[i].value ){  // no vpath: list of complex values (ie feature)

              var fname = flist[i].name;
              //console.log(" feature: " + fname);
              // list header
                
              $("#bkd-hv-field").append("<div class='bkd-rep-fld'>\n"+
                                  " <div class='bkd-rep-fld'>" + fname + "</div>\n"+
                                  "</div>");

              for( var k=0; k < flist[i].value.length; k++ ){  // go over fields

                // go over complex fields

                var cname = flist[i].value[k].name;
                var cvpath = flist[i].value[k].vpath;
                var cvedit = flist[i].value[k].edit;
                var cvid = flist[i].value[k].id;
                //console.log(" feature: c val name " + cname);

                var cval = null;   

                if(cvpath.length >0){
                  cval = data['report'][cvpath[0]];
                  for(var l=1; l<cvpath.length; l++){
                    if( cval[cvpath[l]] ){
                      cval = cval[cvpath[l]];
                    } else {
                      cval = null;
                       break;
                    }                        
                  }
                }


                if( flist[i].value[k].list ){  // list of values
                                      
                  if( cval !== null ||
                    (flist[i].value[k].edit && mode == 'edit') ){  //edit 

                    $( "#bkd-hv-field >div:last")   
                       .append(" <div class='bkd-rep-fld' id='"+flist[i].value[k].id+"'>\n" +
                               "   <div class='bkd-rep-fld'>" + cname + "</div>\n" +
                               " </div>\n");
                  
                      
                    if( flist[i].value[k].edit && mode == 'edit' ){ 
                      //console.log(" show editables...");
                      //build add fields for editable lists

                      if( flist[i].value[k].type == "xref") {
                        BKDrep.xrefEdit( flist[i].value[k], cvid, cval );
                      } 

                      if( flist[i].value[k].type == "range" ){
                        //console.log("RANGES....");
                        BKDrep.rangeEdit( flist[i].value[k], cvid, cval );
                      }                        
                      
                        // edit line: end
                    }
                   
                  } else {  // build a list of values
                        
                    if( cval.length>0 ){

                      var clist = cval; 
                      for(var m=0; m <clist.length;m++){

                        if(flist[i].value[k].type){

                          if( flist[i].value[k].type == "xref" ){
                            BKDrep.xrefHidden( flist[i].value[k], clist, m );                                  
                          }

                          if(flist[i].value[k].type == "range"){
                            BKDrep.rangeHidden( flist[i].value[k], cvid,clist, m );

                          }
                        }else{                             
                          $( "#bkd-hv-field > div:last-child > div:last-child")   
                              .append(" <div class='bkd-rep-fld'>"+clist[m] +"</div>\n");
                        } 
                      }
                    }
                  }
                        
                } else {  // simple value (eg feature parameters)

                  //console.log("  feature: simple value here...");          
                  if(cvedit && mode == 'edit'){  // set up edit field

                    if( flist[i].value[k].type =="cvterm" ){

                      // build cvterm  menu
                      var cvtsel ="<select id='"+flist[i].value[k].id+"_cvt' class='bkd-report'>";
                      for(var n = 0; n< flist[i].value[k]["cvt-list"].length; n++){
                       cvtsel = cvtsel +"<option value='" +
                           flist[i].value[k]["cvt-list"][n].value+"'>" +
                           flist[i].value[k]["cvt-list"][n].name+"</option>";
                      }
                      cvtsel = cvtsel + "</select>";

                      $( "#bkd-hv-field > div:last-child ")   
                          .append(" <div class='bkd-rep-fld'>" + cname +": " + 
                                  cvtsel + 
                                  " </div>\n");

                      if( cval !== null){ 
                        var cvtvalue = cval.ac; 
                        var cvtname = cval.name;

                        $( "#" + flist[i].value[k].id +"_cvt  option[value='"+cvtvalue+"']" ).attr("selected",true);
                        $( "#" + flist[i].value[k].id +"_cvt" ).val(cvtvalue);
                      }
                    } else {
                      $( "#bkd-hv-field >div:last")
                        .append(" <div class='bkd-rep-fld'>" + cname + ": <input type='text' id='"+cvid+"' class='bkd-report'/></div>\n");
                      $( '#' + cvid ).val(cval);

                    }
                  } else {                         
                    $( "#bkd-hv-field >div:last")
                      .append(" <div class='bkd-rep-fld'>"+cname +": "+cval+"</div>\n");
                  }
                }
              
                if( flist[i].value[k].hidden ){

                      $("#bkd-hv-field").append( "<input type='hidden' " +
                                                  "class='bkd-rep-fld bkd-report' " + 
                                                  "id='"+flist[i].value[k].id+"'/>");
                      $("#" + flist[i].value[k].id).val(cval);
                 }
               }
            }
          } else {  // config field is a single value
             
             var vpath = [];
             if( flist[i].vpath){
               vpath =flist[i].vpath;
             }
             var fval = null; 
             if(vpath.length >0){
               fval = data['report'][vpath[0]];
               for(var j=1; j<vpath.length; j++){
                 if( fval[vpath[j]] ){
                   fval = fval[vpath[j]];
                 } else {
                   fval = null;
                   break;
                 }                 
               }
             }
            
             if( fval !== null ){
               //console.log("fval: ok " + flist[i].type);
               if( flist[i].type ){
                 if(flist[i].type == 'taxon'){
                   var fval = BKDlink.taxid( fval );
                   $("#bkd-hv-field").append("<div class='bkd-rep-fld'>"+fname+ ":"+ fval +"</div>");                 
                 }else if( flist[i].type == 'hidden'){
                   //console.log("AC");
                   $("#bkd-hv-field").append( "<input type='hidden' class='bkd-rep-fld bkd-report' id='"+flist[i].id+"'/>");
                   $("#" + flist[i].id).val(fval);
                 }
               } else {  // string value                 
                 if( flist[i].edit && mode == 'edit' ){
                   $("#bkd-hv-field").append("<input type='text' size='32' maxlength='64' class='bkd-rep-fld'>"+fval+"</input>");   
                 } else {
                   $("#bkd-hv-field").append("<div class='bkd-rep-fld'>"+fname+ ": "+fval+"</div>");
                 }
               }
             }
          } 
        }
      },
      
      xrefEdit:  function( cel, cvid, cval ){

         // cel = flist[i].value[k];
         
         // build xref-ns menu
         var xnsel = "<select id='"+cel.id+"_ns'>";
         for(var n = 0; n< cel["xref-ns"].length; n++){
            xnsel = xnsel + "<option value='"+cel["xref-ns"][n]["ns"]+"'>"+cel["xref-ns"][n].label+"</option>";
         }
         xnsel = xnsel + "</select>";

         // build xref-type menu                            
         var xtsel ="<select id='" + cel.id+"_type'>";
         for(var n = 0; n< cel["xref-type"].length; n++){
            xtsel = xtsel +"<option value='"+cel["xref-type"][n].value+"'>"+cel["xref-type"][n].label+"</option>";
         }
         xtsel = xtsel + "</select>";

         var divAdd = " <div class='bkd-rep-fld'>" + 
                      xnsel + 
                      "  <input type='text' id='" + cel.id+"_ac'/> " + 
                      xtsel + 
                      "  <input type='button' id='" + cel.id+"_add'/>"+
                      " </div>";

         $( "#" + cel.id ).append( divAdd );
         $( "#" + cel.id + "_add" ).attr('value', 'Add Xref');
         $( "#" + cel.id + "_add" ).on( 'click', function (event) {

            var prefix= event.currentTarget.id.replace('_add','_');
            
            var xns = $("#"+event.currentTarget.id.replace('_add','_ns')).val();
            var xac = $("#"+event.currentTarget.id.replace('_add','_ac')).val();
            var xtac = $("#"+event.currentTarget.id.replace('_add','_type')).val();

            //console.log("XREFADD: " + xns + " : " + xac + " : " + xtac );
            var xtns ="";
            var xtnm ="";
            
            for(t=0; t< BKDconf["xref-type"].length;t++){
              //console.log(t+" : " +BKDconf["xref-type"][t]);
              if(BKDconf["xref-type"][t].ac == xtac){
                 xtns = BKDconf["xref-type"][t]["ns"];
                 xtnm = BKDconf["xref-type"][t]["name"];
              }
            }

            BKDrep.fxlist = []

            $(".bkd-xref").each( function( index, elem){
                 BKDrep.fxlist.push( elem.id );                                 
            });

            var xmax = 0;

            for(var x=0; x < BKDrep.fxlist.length; x++ ){                              
               var icur = Number( BKDrep.fxlist[x].replace( prefix, '' ) ); 
               if(  icur > xmax ){
                 xmax = icur;
               }
            }
            
            //console.log( xns +" : " + xac + ":" + xtns + " : " + xtac);
            xmax=xmax+1;

            var cval = BKDlink.xref({ns:xns, ac: xac,
                                     cvType:{ ns:xtns, ac:xtac, name:xtnm } } );

            var cid = prefix + xmax;
            
            var chid ="<input type='hidden' id='"+cid+"_ns'/>\n"+
                      "<input type='hidden' id='"+cid+"_ac'/>\n"+
                      "<input type='hidden' id='"+cid+"_tns'/>\n"+
                      "<input type='hidden' id='"+cid+"_tac'/>\n"+
                      "<input type='hidden' id='"+cid+"_tname'/>\n";

            $( "#" + event.currentTarget.id.replace('_add','') )
                .append( " <div class='bkd-rep-fld bkd-xref' id='"+cid+"'>" +
                         cval + chid +
                         "  <input type='button' id='"+cid+"_drop'/>"+
                         " </div>\n");

            $('#'+cid+"_ns").val(xns).addClass("bkd-report");
            $('#'+cid+"_ac").val(xac).addClass("bkd-report");
            $('#'+cid+"_tns").val(xtns).addClass("bkd-report");                                 
            $('#'+cid+"_tac").val(xtac).addClass("bkd-report");                                 
            $('#'+cid+"_tname").val(xtnm).addClass("bkd-report");                                 

            $("#"+cid+"_drop").attr( 'value', 'Drop Xref' );
            $("#"+cid+"_drop").on( 'click', function (event) {                                 
                var idDrop = event.currentTarget.id.replace("_drop","");
                $("#" + idDrop ).remove();
              }); 
         });

        // add already existing
        for( var x = 0; x < cval.length; x++){ 
          
          var ctx ="";
          var cid= cel.id +"_" + x;

          //console.log("CVAL " + JSON.stringify(cval[x]));

          var xlnk = BKDlink.xref(cval[x]);  
          //console.log(xlnk);           
          $( "#" + cel.id ).append( "<div id='" + cid + "' class='bkd-rep-fld bkd-range'>" + xlnk +
                                    "\n<input type='button' id='" + cid + "_drop'/></div>\n</div>" );
          
          $("#"+ cid).append("<input type='hidden' id='" + cid + "_ns' class='bkd-report' />" );
          $("#" + cid + "_ns").val(cval[x].ns);
          
          $("#"+ cid).append("<input type='hidden' id='" + cid + "_ac' class='bkd-report' />" );
          $("#" + cid + "_ac").val(cval[x].ac);
          
          $("#"+ cid).append( "<input type='hidden' id='" + cid + "_tns' class='bkd-report' />"); 
          $("#" + cid + "_tns" ).val( cval[x].cvType.ns );
          
          $("#"+ cid).append( "<input type='hidden' id='" + cid + "_tac' class='bkd-report' />"); 
          $("#" + cid + "_tac" ).val( cval[x].cvType.ac );
          
          $("#"+ cid).append( "<input type='hidden' id='" + cid + "_tname' class='bkd-report' />"); 
          $("#" + cid + "_tname" ).val( cval[x].cvType.name );
          
          $("#"+cid+"_drop").attr('value', 'Drop Xref');
          $("#"+cid+"_drop").on( 'click', function (event) {
              var idDrop = event.currentTarget.id.replace("_drop","");
              $("#" + idDrop ).remove();
           });
        }   
      },
      
      xrefHidden:  function( cel, cvid, clist, m ){
        
        //BKDrep.xrefHidden( flist[i].value[k], cvid, clist, m );
        
        var cval = BKDlink.xref( clist[m] );
        var cid = cvid + "_" + m;
        $( tgtAnchor + " > div:last-child > div:last-child")
          .append(" <div class='bkd-rep-fld  bkd-xref' id='"+cid+"'>" + cval +" <input type='button' id='"+cid+"_drop'/></div>\n");
        $("#"+ cid).append("<input type='hidden' id='"+cid+"_ns' class='bkd-report' />");
        $("#" + cid + "_ns").val(clist[m].ns);
        $("#"+ cid).append("<input type='hidden' id='"+cid+"_ac' class='bkd-report' />");
        $("#" + cid + "_ac").val(clist[m].ac);
        $("#"+ cid).append("<input type='hidden' id='"+cid+"_tns' class='bkd-report' />");
        $("#" + cid + "_tns").val(clist[m].cvType.ns);
        $("#"+ cid).append("<input type='hidden' id='"+cid+"_tac' class='bkd-report' />");
        $("#" + cid + "_tac").val(clist[m].cvType.ac);
        $("#"+cid+"_drop").attr('value', 'Drop Xref');
        $("#"+cid+"_drop").on( 'click', function (event) {
            var idDrop = event.currentTarget.id.replace("_drop","");
            $("#" + idDrop ).remove();
          });
     },

    showText: function( tgt, format, data ){

        var value = this.getVal2( data, format.vpath);   // values @ vpath

        if( value == null && format.miss == "%DROP%") return;       
        if( value == null || value.length == 0 ) value = format.miss;
        if( value == null || value.length == 0 ) value = "N/A";
        
        if( format.condition == null){          
            $( tgt ).append( "<div>"+format.name+ ": " + value + "</div>" );
            return;
        }
        
        // assumes value is a list, condition is present
        
        var fvlist =[];
        for( var i =0; i < value.length; i ++){                     
            //console.log("  cval: ", value[i], " :::", JSON.stringify(value[i])) ;
            
            for( var j = 0; j < format.condition.length; j++ ){     
                
                //console.log("\n----------\nCONDITION: "+format.name+"\n----------\n");
                
                cond = format.condition[j];
                //console.log("cond equal: " + JSON.stringify(cond.equal));
                //console.log("cond type: " + typeof cond.equal);
                
                var cval = this.getVal2( value[i], cond.test );  // value: tested attribute
                //console.log("cond tested val: " + JSON.stringify( cval ) );
                
                if( typeof cond.equal  === 'string') {
                    //console.log(" equal: string");
                    if( cond.equal != null && cond.equal == cval ){
                        //console.log(" showText: got match!!!");       
                        var fval = this.getVal2( value[i], format.value );
                        if( fval != null ){
                            fvlist = fvlist.concat(fval);
                        }    
                    }
                }
                
                if( typeof cond.equal  === 'object' ){
                    //console.log(" equal: list");
                    //console.log("data: " + JSON.stringify(data));
                    var tval = this.getVal2( data, cond.equal);
                    //console.log("TVAL: " + JSON.stringify(tval));
                    
                    //var test = his.getVal( value[i], cond.test );
                    //console.log( "cond: list" );
                    //if( format.condition.equal != null && format.condition.equal == cval ){
                    //  console.log(" showText: got match!!!");       
                    //  var fval = this.getVal( value[i], format.value );
                    //  if( fval != null ){
                    //     fvlist.push(fval);
                    //  }    
                    //}                                   
                }
            }
        }
       
        //console.log(" showText: fvlist: ", JSON.stringify(fvlist));
        if( format.list ){
            if( format.header ){
                $( tgt ).append( "<div><div>" + format.name + " [<em>show/hide</em>]</div><div></div></div>" );

                //console.log("HIDE:" + format.hide);

                if( format.hide ){
                    //console.log("HIDE: " + tgt);
                    //console.log("HIDE: " + tgt + " > *:last > *:last");
                    $( tgt + " > *:last > *:last" ).hide();
                }

                $( tgt + " >*:last >*:first").on('click',function(event){              
                    $(event.currentTarget).next().toggle();
                });

                tgt +=" > *:last > *:last";


            }

            for( var i =0; i <fvlist.length; i ++ ){             
                if( header ){
                    $( tgt ).append( "<div>" + fvlist[i]+ "</div>" );
                }else{
                    $( tgt ).append( "<div>" + format.name + ": " + fvlist[i] + "</div>" );  
                }
            }
        
            return;
        }

        if( fvlist.length == 0 ){
            if( format.miss == "%DROP%" ) return;
            if( format.miss != null ){
                $( tgt ).append( "<div>"+format.name+ ": " + format.miss + "</div>" );              
            }else{
                $( tgt ).append( "<div>"+format.name+ ": N/A</div>" );
            }
            return;
        }

        var fval = fvlist[0];   
        for( var i=1; i <fvlist.length; i++){
            fval+= "; " + fvlist[i];
        }
        $( tgt ).append( "<div>"+format.name+ ": " + fval + "</div>" );

     },

    showLink: function( tgt, format, data ){
        //console.log("showLink:", format);
        /*
        var value = this.getVal( data, format.vpath);

        if(value != null && value.length > 0){
            var url = format.url.replace("%%VAL%%", value);
            $( tgt ).append( "<div>\n"+ format.name+ ": " +
                             "<a href='" + url + "'>" + value + "</a>\n"+
                             "</div>\n");
            return;                 
        }
        if( value == null && format.miss == "%DROP%") return;
        
        if( value == null || value.length == 0) value = format.miss;
        if( value == null || value.length == 0) value = "N/A";
        
        $( tgt ).append( "<div>"+format.name+ ": " + value + "</div>" );
        
        */

       //  new version

        var value = this.getVal2( data, format.vpath);   // values @ vpath

        if( value == null && format.miss == "%DROP%") return;       
        if( value == null || value.length == 0 ) value = format.miss;
        if( value == null || value.length == 0 ) value = "N/A";
        
        if( format.condition == null){   // single value

            var url = format.url.replace("%%VAL%%", value);
            $( tgt ).append( "<div>\n"+ format.name+ ": " +
                             "<a href='" + url + "'>" + value + "</a>\n"+
                             "</div>\n");
            return;                 
        }
        
        // assumes value is a list, condition is present
        
        var fvlist =[];
        for( var i =0; i < value.length; i ++){                     
            //console.log("  cval: ", value[i], " :::", JSON.stringify(value[i])) ;
            
            for( var j = 0; j < format.condition.length; j++ ){     
                
                //console.log("\n----------\nCONDITION: "+format.name+"\n----------\n");
                
                cond = format.condition[j];
                //console.log("cond equal: " + JSON.stringify(cond.equal));
                //console.log("cond type: " + typeof cond.equal);
                
                var cval = this.getVal2( value[i], cond.test );  // value: tested attribute
                //console.log("cond tested val: " + JSON.stringify( cval ) );
                
                if( typeof cond.equal  === 'string') {
                    //console.log(" equal: string");
                    if( cond.equal != null && cond.equal == cval ){
                        //console.log(" showText: got match!!!");       
                        var fval = this.getVal2( value[i], format.value );
                        if( fval != null ){
                            fvlist = fvlist.concat(fval);
                        }    
                    }
                }
                
                if( typeof cond.equal  === 'object' ){
                    //console.log(" equal: list");
                    //console.log("data: " + JSON.stringify(data));
                    var tval = this.getVal2( data, cond.equal);
                    //console.log("TVAL: " + JSON.stringify(tval));
                    
                    //var test = his.getVal( value[i], cond.test );
                    //console.log( "cond: list" );
                    //if( format.condition.equal != null && format.condition.equal == cval ){
                    //  console.log(" showText: got match!!!");       
                    //  var fval = this.getVal( value[i], format.value );
                    //  if( fval != null ){
                    //     fvlist.push(fval);
                    //  }    
                    //}                                   
                }
            }
        }

        // fvlist  contains values

        if( fvlist.length == 0 ){
            if( format.miss == "%DROP%" ) return;
            if( format.miss != null ){
                $( tgt ).append( "<div>"+format.name+ ": " + format.miss + "</div>" );              
            }else{
                $( tgt ).append( "<div>"+format.name+ ": N/A</div>" );
            }
            return;
        }
        
        var fval = fvlist[0];   
        for( var i=1; i <fvlist.length; i++){
            fval+= "; " + fvlist[i];
        }
        $( tgt ).append( "<div>"+format.name+ ": " + fval + "</div>" );
        
     },
     
    showTaxon: function( tgt, format, data ){
        var value = this.getVal( data, format.vpath);
        var sname = value.sciName;

        if(value.comName != null && value.comName.length >0)
            sname += "("+value.comName+")";

        var href = "<a href='" + format.url.replace("%%VAL%%", value.taxid) +"'>"+
            value.taxid+"</>";
        sname += " ["+ href + "]";       
        $( tgt ).append( "<div>"+format.name+ ": " + sname + "</div>" );
    },

    showSequence: function( tgt, format, data ){
       
        var seq = this.getVal( data, format.vpath);
        //console.log( "SHOWSEQUENCE: START");
        $( tgt ).append( "<div><div id='seq-viewer'></div>" );
        
        //var seqview = new Sequence( seq );
        //seqview.render( '#seq-viewer',
        //                { 'showLineNumbers': true,
        //                  'wrapAminoAcids': true,
        //                  'charsPerLine': 80,
        //                  'toolbar': true,
        //                  //'search': true,
        //                  //'title' : "Your title",
        //                  'sequenceMaxHeight': "300px",
        //                  'badge': false
        //                });
        alert("SHOWSEQUENCE");
        console.log("SHOWSEQUENCE: DONE");
        
    },

    showXref: function( tgt, format, data ){
       var cval = this.getVal( data, format.vpath);
       //console.log("XREF: cval=" + cval);
       if( cval == null || cval == undefined || cval.length == 0){
          if( format.miss == "%DROP%") return;
       }
       if( header ){
          $( tgt ).append( "<div><div>" + format.name + "</div><div></div></div>" );

          $( tgt + " >*:last >*:first").on('click',function(event){              
              $(event.currentTarget).next().toggle();
           });

          tgt +=" > *:last > *:last";
       }
       if( format.list ){
         if( cval.length > 0){
           for( var i =0; i <cval.length; i ++){
             //console.log( "XREF:" +  JSON.stringify(cval[i]) );
             var cxref = BKDlink.xref(cval[i]);             

             if( header ){
               $( tgt ).append( "<div>" + cxref + "</div>" );
             } else {
               $( tgt ).append( "<div>" + format.name + ": " + cxref + "</div>" );  
             }
           }
         }
       } else {
          var cxref = BKDlink.xref(cval[i]);
          if( header ){
            $( tgt ).append( "<div>" + cxref + "</div>" );
          } else {
            $( tgt ).append( "<div>" + format.name + ": " + cxref + "</div>" );  
          }
       }
     },

     showFeature: function( tgt, format, data ){
       var value = this.getVal( data, format.vpath);
       //console.log("DATA:"+JSON.stringify(data))

       $( tgt ).append( "<table border='1' width='100%'>" +
                        " <tr>"+
                        "  <td id='flist' width='1024' colspan='1' rowspan='1' valign='top'>"+
                        "   <div id='flist-lolipop'></div>"+
                        "   <div id='flist-details'></div>"+
                        "  </td>"+                                            
                        "  <td valign='top' align='center'>"+
                        "   <table>"+
                        "    <tr>"+
                        "     <td id='track-tab'><b>Genome&nbsp;Viewer</b></td>"+
                        "     <td id='homo-tab'>Homology</td>"+
                        "     <td id='topo-tab'><b>Membrane&nbsp;Topology</b></td>"+
                        "     <td id='swmod-tab'><b>Swissmodel</b></td>"+
                        "     <td id='struc-tab'>Structure</td>"+
                        "    </tr>"+
                        "    <tr>"+
                        "     <td id='flist-view' valign='top' colspan='5'></td>"+
                        "    </tr>"+
                        "   </table>"+
                        "  </td>"+
                        " </tr>"+
                        "</table>" );


       $( '#flist-view' ).append("<div id='track-port' style='width:600px; height:625px;'></div>");
       $( '#track-port').hide();
       $( '#track-tab').on('click',BKDnode.flviewToggle);

       $( '#flist-view' ).append("<div id='homo-port' style='width:600px; height:625px;'></div>");       
       $( '#homo-port').hide();
       $( '#homo-tab').on('click',BKDnode.flviewToggle);


       $( '#flist-view' ).append("<div id='topo-port' style='width:600px; height:625px;'></div>");
       $( '#topo-port').hide();
       $( '#topo-tab').on('click',BKDnode.flviewToggle);


       $( '#flist-view' ).append("<div id='swmod-port' style='width:600px; height:625px;'></div>");
       $( '#swmod-port').show();
       $( '#swmod-tab').on('click',BKDnode.flviewToggle);


       $( '#flist-view' ).append("<div id='struc-port' style='width:600px; height:625px;'></div>");
       $( '#struc-port').hide();
       $( '#struc-tab').on('click',BKDnode.flviewToggle);
   
       // sequence
       //---------
       
       var fdata = [];
       var seq = data.sequence;
       
       for( var i = 0; i < value.length; i ++){ 
          //console.log("F: " + value[i].ranges[0].start + ":" +
          //                    value[i].ranges[0].stop + ":" +
          //                    value[i].ranges[0].sequence );

          if( value[i].ranges[0].start ==  value[i].ranges[0].stop){

             var posaa = seq[ parseInt(value[i].ranges[0].start) - 1 ] +
                         value[i].ranges[0].start;
                         
             var short = 'p.' + seq[ parseInt(value[i].ranges[0].start) - 1 ] 
                              + value[i].ranges[0].start 
                              + value[i].ranges[0].sequence;

             var cvlink = "N/A";
             var pos37 = "";
             var pos38 = "";
             //console.log(i,"value",JSON.stringify(value[i]));
             for( var j = 0; j < value[i].xrefs.length; j ++){
               //console.log(value[i].xrefs[j].ns);          
               if( "dbSNP" == value[i].xrefs[j].ns ){
                  var cvlink = "https://www.ncbi.nlm.nih.gov/snp/"+value[i].xrefs[j].ac;
                  cvlink = "<a href='"+cvlink+"'>"+value[i].xrefs[j].ac+"</a>";                 
               }
               if( "GRCh37" == value[i].xrefs[j].ns ){
                  pos37 = value[i].xrefs[j].ac;                 
               }
               if( "GRCh37.p13" == value[i].xrefs[j].ns ){
                  pos37 = value[i].xrefs[j].ac;                 
               }
               if( "GRCh38" == value[i].xrefs[j].ns ){
                  pos38 = value[i].xrefs[j].ac;
               }              
               if( "GRCh38.p13" == value[i].xrefs[j].ns ){
                  pos38 = value[i].xrefs[j].ac;
               }              

             }             

             var mdta = {"Hugo_Symbol": "PIK3CA",
                         "Mutation Type": "Missense",
                         "HGVSp_Short": short,
                         "PosAA": posaa,
                         "Pos37": pos37,
                         "Pos38": pos38,
                         "Mutation_Class": value[i].ranges[0].sequence,
                         "AA_Position": parseInt(value[i].ranges[0].start),
                         "dbSNP":cvlink}
             fdata.push(mdta);
             //console.log("mdta:", JSON.stringify( mdta ) );
          }
          
       }

        var mutation_data_default_settings = {
          x: "AA_Position", // mutation position
          y: "PosAA",       // amino-acid changes
          factor: "Mutation Type", // classify mutations by certain factor (optional)
        };
       
       //console.log( JSON.stringify (fdata ) );

       mutation_data = fdata;
       
        var pfam_data = {  
           "hgnc_symbol":"TP53",
           "protein_name":"tumor protein p53",
           "uniprot_id":"P04637",
           "length":seq.length,
           "pfam":[  
              {  
                 "pfam_ac":"PF08563",
                 "pfam_start":1,
                 "pfam_end":seq.length,
                 "pfam_id":"my protein"
              }
           ]
        }; 
 
        var pfam_data_default_settings = {
           domainType: "pfam",       // key to the domain annotation entries
           length: "length",         // protein length
           details: {
               start: "pfam_start",  // protein domain start position
               end: "pfam_end",      // protein domain end position
               name: "pfam_id",      // protein domain name
           },
       };

       var lollipop = g3.Lollipop('flist-lolipop');

       var popa = function(state,data){
            alert("click: " + state + JSON.stringify(data) );
            if( state ){
               BKD.buildFDets("#flist-details", data.values);
               $("#flist-details").show();
            } else {
               $("flist-details").hide();
            }
       };  


       lollipop.options.chartMargin = {
           "left": 40, "right": 40, "top": 30, "bottom": 25
       };
       lollipop.options.titleFont = "normal 20px Sans";
       lollipop.options.titleColor = "steelblue";
       lollipop.options.titleAlignment = "middle";
       lollipop.options.titleDy = "0.3em";
       lollipop.options.chartWidth = 1024;
       lollipop.options.chartHeight= 200;
       lollipop.options.lollipopHook = { action: BKDnode.buildFDets,
                                         options: { anchor: "#flist-details",
                                                    cols:["Mutation Type",
                                                          "HGVSp_Short",
                                                          "Mutation_Class","dbSNP"]}
                                       };

      // add mutation data
      lollipop.data.snvData = mutation_data;
      // mutation data format settings
      lollipop.format.snvData = mutation_data_default_settings;

      // Pfam domain data
      lollipop.data.domainData = pfam_data;
      // Pfam data format settings
      lollipop.format.domainData = pfam_data_default_settings;
 
      lollipop.draw();


      // structure
      //----------

      var colorScheme = NGL.ColormakerRegistry.addSelectionScheme([
          ["atomindex", "*"]]);

      var ngl = new NGL.Stage("swmod-port");
      
      url = BKDnode.siteurl;
      id = BKDnode.data.ac;
      //console.log("PDB:" + url+"swissmodel/"+id+"-1_swm.pdb");
      ngl.loadFile(url+"swissmodel/"+id+"-1_swm.pdb").then( function(o){      
         BKDnode.nglsc = o;
         o.setSelection("all");       
         BKDnode.nglrep = o.addRepresentation("cartoon",{color: colorScheme});  
         o.autoView("all");
      });
      
     //topology
     //--------
     
      purl = url+"protter/"+ id +".svg";
      console.log("PROTTER:" + purl);      

      $("#topo-port").load( purl, function(){
                  
         //console.log( "TOPO: width= " + $( "#topo-port > svg").width() );
         //console.log( "TOPO: height=" +  $( "#topo-port > svg").height() );
         //console.log( "TOPO: bb=" +  $( "#topo-port > svg") );

         var svgw = $( "#topo-port > svg").width();
         var svgh = $( "#topo-port > svg").height();

         var scl = 580.0 / svgh;
         var trX = svgw/2.0*(scl-1); 
         var trY = svgh/2.0*(scl-1);   
      
         $("#topo-port > svg" ).attr('transform','translate('+trX+','+trY+') scale('+scl+')');     

      });

      // genome
      //-------

      //console.log( JSON.stringify(data) );

      gname=data["label"];
      for( a in data.alias){
          //console.log("A: "+ JSON.stringify(data.alias[a]) );
          if( data.alias[a]["cvType"]["name"] == "gene-name" ){
              gname=data.alias[a]["alias"]
          }
      }         
      
      //console.log("Gene Name: ", gname );

      var igvDiv = document.getElementById("track-port");
      var options = {
                   genome: "hg19",
            locus: gname,
            tracks: [
                //{
                //    "name": "HG00103",
                //    "url": "https://s3.amazonaws.com/1000genomes/data/HG00103/alignment/HG00103.alt_bwamem_GRCh38DH.20150718.GBR.low_coverage.cram",
                //    "indexURL": "https://s3.amazonaws.com/1000genomes/data/HG00103/alignment/HG00103.alt_bwamem_GRCh38DH.20150718.GBR.low_coverage.cram.crai",
                //    "format": "cram"
                //}
            ]
        };

        igv.createBrowser(igvDiv, options)
                .then( function (browser) {
                    //console.log("Created IGV browser");
                    BKDnode.igvbrowse = browser;

                    browser.loadROI([
                        {
                            name: 'ROI test01',
                            url: BKDnode.siteurl+"roi_test_01.html",
                            indexed: false,
                            color: "rgba(68, 134, 247, 0.25)"
                        }])

                })

     },

     setNGLSelScheme: function(pos, show ){

       if(show=='on'){
         var colorScheme = NGL.ColormakerRegistry.addSelectionScheme([
                     ["yellow", pos.toString() ],["green","*"]]);
         var newrep = BKDnode.nglsc.addRepresentation("cartoon",{color: colorScheme});
         if( BKDnode.nglrep !== undefined){
           BKDnode.nglsc.removeRepresentation(BKDnode.nglrep);
           BKDnode.nglrep = newrep;
         }
       }
       if(show=='off'){
         var colorScheme = NGL.ColormakerRegistry.addSelectionScheme([
                     ["atomindex","*"]]);
         var newrep = BKDnode.nglsc.addRepresentation("cartoon",{color: colorScheme});
         if( BKDnode.nglrep !== undefined){
           BKDnode.nglsc.removeRepresentation(BKDnode.nglrep);
           BKDnode.nglrep = newrep;
         }
       }
       BKDnode.nglsc.autoView("all");
     },

     setIGVSelScheme: function(pos37,pos38, show ){
       //console.log("setIGVSelScheme",pos37,pos38, show)
       if(show=='on'){
         //console.log("setIGVSelScheme:ON");
         BKDnode.igvbrowse.loadROI([{
                            name: 'Feature xxx',
                            url: BKDnode.siteurl+"roi?pos="+pos37,
                            indexed: false,
                            color: "rgba(68, 134, 247, 0.25)"
                                    }]);


       }
       if(show=='off'){       
            //console.log("setIGVSelScheme: OFF");
            //BKDnode.igvbrowse.clearROIs();
            BKDnode.igvbrowse.removeROI();
            //console.log("setIGVSelScheme: OFF done...");
       }       
     },

     

     getVal: function( data, path ){
       var cval = data;
       for(var j=0; j<path.length; j++){
           console.log("CVAL: " + path[j] + " :: " + JSON.stringify(cval[ path[j]]) );
           cval = cval[ path[j] ];
       }
       return cval; 
           
    },

    getVal2b: function( data, path ){
       //console.log("\n\nCV2 called");
       //console.log("CV2: path=" + JSON.stringify(path));
       var cval = []; 
       if( Array.isArray(data) ){
          cval = data;
       } else {
          cval = [data];
       }
       //console.log("CV2: cval: " + JSON.stringify(cval));
       var rval = [];
       for( var k =0; k < cval.length; k ++ ){
          //console.log("CV2:  going over cval element # " + k ); 
          //console.log( "XXX " + path[0] + " ::: " + JSON.stringify(cval[k][path[0]]));
          rval = rval.concat( cval[k][path[0]]);
          //console.log("rval.length=" + rval.length);
       }
       
       if( path.length == 1 ){ // end of path: return values
          //console.log("LAST PASS: " + JSON.stringify(rval)); 
          return rval;
       } else {
          //console.log("NEXT LEVEL: " + JSON.stringify(rval));
          return this.getVal2( rval, path.slice(1) );
       }            
    },
    
    getVal2: function( data, path ){
        var cval = []; 
       if( Array.isArray(data) ){
          cval = data;
       } else {
          cval = [data];
       }
        var rval = [];
       for( var k =0; k < cval.length; k ++ ){
           rval = rval.concat( cval[k][path[0]]);
        }
       
       if( path.length == 1 ){ // end of path: return values
           return rval;
       } else {
           return this.getVal2( rval, path.slice(1) );
       }            
    },

     buildFDets: function( show, data, options ){

       //console.log("FD(options):" + JSON.stringify(options));
       //console.log("FD:" + JSON.stringify(data));

       if( show ){
         $(options.anchor).hide();
         $(options.anchor + " #fdet-table").remove();
         $(options.anchor).append( "<table id='fdet-table' width='100%' border='1'>"
                                   +"</table>");
         var head ="";
         for(var h = 0; h < options.cols.length; h++){
            head += "<th>"+options.cols[h]+"</th>";
         }
         $("#fdet-table").append("<tr>"+head+"</tr>");
         //console.log("data.values.length: " + data.values.length);
         var pos37 ="";            
         var pos38 ="";            
         for( var r = 0; r < data.values.length; r++){
            //console.log(r + " : " + JSON.stringify(data.values[r]) );
            pos37 = data.values[r]["Pos37"];
            pos38 = data.values[r]["Pos38"];
            var row =""; 
            for(var c =0; c < options.cols.length; c++ ){
              row += "<td>" + data.values[r][options.cols[c]] + "</td>";
            }
            $("#fdet-table").append( "<tr>"+row+"</tr>");
         }

         $(options.anchor ).show();

         BKDnode.setNGLSelScheme(data.position, 'on');

         
         BKDnode.setIGVSelScheme(BKDnode.cpos37,BKDnode.cpos38, 'off');
         BKDnode.setIGVSelScheme(pos37,pos38, 'on');
         BKDnode.cpos37 = pos37;
         BKDnode.cpos38 = pos38;
        
       } else{
         BKDnode.setNGLSelScheme(data.position, 'off');
         BKDnode.setIGVSelScheme(pos37,pos38, 'off');
         // $(options.anchor).hide();
         $(" #fdet-table").remove();
       }
    },

    flviewToggle:   function(event){
                        var nview = "#" + event.currentTarget.id.replace('-tab','');
                        //console.log("Toggle: "+ BKDnode.flview +"->" + nview);
                        $( BKDnode.flview + "-port" ).hide();
                        BKDnode.flview = nview;
                        $( nview + "-port" ).show()
                        //console.log("Toggle: BKDnode.igvbrowse "+BKDnode.igvbrowse) ;
                        if( BKDnode.igvbrowse !== null){
                           BKDnode.igvbrowse.visibilityChange();
                        }
    }

};
