console.log("bkd-node-jq: common");
    
BKDnode = {
  nodeAnchor: null,
  srcAnchor: null,
  flist: null,
  paneon: null,

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
      $( srcAnchor ).hide();            
      $( srcViewAnchor ).hide();            
      BKDnode.nodeView( data, this.srcAnchor, this.srcViewAnchor,
                        this.nodeAnchor, flist, mode );
      $( nodeAnchor ).show();
    }
  },

  doSearch: function(){
      var squery = $("#bkd-squery").val();
      var qmode =  $("#bkd-qmode").val();  

      console.log(qmode + ":" + squery);
      
      myurl ="search?query="+squery+"&qmode="+qmode;          
      $.ajax( { url: myurl} )
          .done( function(data, textStatus, jqXHR){
            console.log( JSON.stringify(textStatus)
                         + " || data.length: "  + JSON.stringify(data).length); 

             BKDnode.searchView( data.rdata,
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
                 BKDnode.searchView( data.rdata, BKDrep.srcAnchor, "view" );  
               }else if(data.record !== null){
                 BKDrep.nodeView( data.record, BKDrep.nodeAnchor, "view" );               
               }
             });

        event.preventDefault();
      });
  },

  searchView: function(data, srcAnchor, srcViewAnchor, nodeViewAnchor, mode ){
  
    var tid="bkd-search-table";
    //$(srcAnchor).hide();
    $(srcViewAnchor).hide();
    $(nodeViewAnchor).hide();

    $(srcViewAnchor).empty();    
    $(srcViewAnchor).append( "<hr/>"
                         + "<table id='" + tid
                         + "' border='0' cellspacing='0' cellpadding='0' class='bkd-search-table'>"
                         + "</table>");
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
               var crow = "<td>" + cdata.ac + "</td>" +
                          "<td align='center'>" + cdata.label + "</td>" +
                          "<td>" + cdata.name + "</td>" +
                          "<td align='center'>" + cdata.taxon.sciName + "</td>" +
                          "<td align='center'>" + cdata.upr + "</td>" + 
                          "<td align='center'>" + cdata.cvType.name + "</td>" + 
                          "<td align='center'>" +
                          "<input type='button' id='"+rid+"_view' value='Details'/>"+
                          "</td>" +                          
                          "<td align='center'>" +
                          "<input type='button' id='"+rid+"_report_view' value='CVUS Reports'/>"+
                          "</td>";
                          
               $('#' + tid).append("<tr> class='bkd-rep-fld'>"+crow+"</tr>");

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
                              +"<div id='bkd-nv-field'></div>"
                              +"<div id='bkd-fv-field'></div>" );
    // view type
    //----------

    var tvpath = fmt.type.vpath;
    var vformat = data;
 
    for( var t = 0; t <tvpath.length; t++){
      vformat = vformat[tvpath[t]]; 
    }

    console.log( "FORMAT: " + JSON.stringify(vformat) );

    var format = fmt.type.view[vformat];

    console.log( "NA: " + nodeViewAnchor );
    console.log( "FL: " + JSON.stringify(format) );
    
    // node type & accession
    //----------------------
        
    var rac = format["ac"];
    var racval ="";
    var racpath = rac["vpath"];
    var cval = data;        
                
    for(var j=0; j<racpath.length; j++){
      console.log("CVAL: " + racpath[j] + " : " + cval[ racpath[j]] );
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
    
    if( format.field != null){
       for( var f = 0; f<format.field.length; f++){
         var cfield = format.field[f];
         console.log("FIELD: " + cfield.name + " :: " + cfield.type);

         switch( cfield.type ){
           case "text":
             this.showText( "#bkd-hv-field", cfield, data );    
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
              console.log("PFIELD: " + cfield.name + " :: " + cfield.type);
              switch( cfield.type ){
                case "text":
                  this.showText( "#bkd-nv-"+cid, cfield, data );    
                break;
              case "sequence":
                this.showSequence( "#bkd-nv-"+cid, cfield, data );    
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
          console.log("NAME: " + fname + " : list:" + flist[i].list +
                      " value:" + flist[i].value);
          
          if( flist[i].list ){   // config field is list            
            
            if( flist[i].vpath ){    // vpath present; list of values @ vpath
              console.log(" VPATH: present");
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
              console.log(" feature: " + fname);
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
                console.log(" feature: c val name " + cname);

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
                      console.log(" show editables...");
                      //build add fields for editable lists

                      if( flist[i].value[k].type == "xref") {
                        BKDrep.xrefEdit( flist[i].value[k], cvid, cval );
                      } 

                      if( flist[i].value[k].type == "range" ){
                        console.log("RANGES....");
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

                  console.log("  feature: simple value here...");          
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
               console.log("fval: ok " + flist[i].type);
               if( flist[i].type ){
                 if(flist[i].type == 'taxon'){
                   var fval = BKDlink.taxid( fval );
                   $("#bkd-hv-field").append("<div class='bkd-rep-fld'>"+fname+ ":"+ fval +"</div>");                 
                 }else if( flist[i].type == 'hidden'){
                   console.log("AC");
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

            console.log("XREFADD: " + xns + " : " + xac + " : " + xtac );
            var xtns ="";
            var xtnm ="";
            
            for(t=0; t< BKDconf["xref-type"].length;t++){
              console.log(t+" : " +BKDconf["xref-type"][t]);
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
            
            console.log( xns +" : " + xac + ":" + xtns + " : " + xtac);
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

          console.log("CVAL " + JSON.stringify(cval[x]));

          var xlnk = BKDlink.xref(cval[x]);  
          console.log(xlnk);           
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
          console.log("  cval: ", value[i], " :::", JSON.stringify(value[i])) ;

          for( var j = 0; j < format.condition.length; j++ ){     

             console.log("\n----------\nCONDITION: "+format.name+"\n----------\n");

             cond = format.condition[j];
             console.log("cond equal: " + JSON.stringify(cond.equal));
             console.log("cond type: " + typeof cond.equal);

             var cval = this.getVal2( value[i], cond.test );  // value: tested attribute
             console.log("cond tested val: " + JSON.stringify( cval ) );

             if( typeof cond.equal  === 'string') {
               console.log(" equal: string");
               if( cond.equal != null && cond.equal == cval ){
                 console.log(" showText: got match!!!");       
                 var fval = this.getVal2( value[i], format.value );
                 if( fval != null ){
                    fvlist = fvlist.concat(fval);
                 }    
               }
             }

             if( typeof cond.equal  === 'object' ){
                  console.log(" equal: list");
                  console.log("data: " + JSON.stringify(data));
                  var tval = this.getVal2( data, cond.equal);
                  console.log("TVAL: " + JSON.stringify(tval));
                  
                  //var test = his.getVal( value[i], cond.test );
                  console.log( "cond: list" );
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
       
       console.log(" showText: fvlist: ", JSON.stringify(fvlist));
       if( format.list ){
         if( format.header ){
           $( tgt ).append( "<div><div>" + format.name + " [<em>show/hide</em>]</div><div></div></div>" );

           console.log("HIDE:" + format.hide);

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
       console.log(seq);
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

       var lollipop = g3.Lollipop("seq-viewer");

var mutation_data = [
    {
        "Hugo_Symbol": "PIK3CA",
        "Variant_Classification": "Silent",
        "HGVSp_Short": "p.F70F",
        "Mutation_Class": "Inframe",
        "Protein_Change":"F70F",
        "AA_Position": 70
    }, {
        "Hugo_Symbol": "PIK3CB",
        "Variant_Classification": "Missense_Mutation",
        "HGVSp_Short": "p.E81F",
        "Mutation_Class": "Missense",
        "Protein_Change":"E81F",
        "AA_Position": 81
    }, {
        "Hugo_Symbol": "PIK3CA",
        "Variant_Classification": "Missense_Mutation",
        "HGVSp_Short": "p.E81K",
        "Protein_Change":"E81K",
        "Mutation_Class": "Inframe",
        "AA_Position": 81
    }, {
        "Hugo_Symbol": "PIK3CA",
        "Variant_Classification": "Missense_Mutation",
        "HGVSp_Short": "p.F83S",
        "Protein_Change":"F83S",
        "Mutation_Class": "Missense",
        "AA_Position": 83
    }, {
        "Hugo_Symbol": "PIK3CA",
        "Variant_Classification": "Missense_Mutation",
        "HGVSp_Short": "p.R88Q",
        "Protein_Change":"R88Q",
        "Mutation_Class": "Missense",
        "AA_Position": 88
    }
];

var mutation_data_default_settings = {
    x: "AA_Position",         // mutation position
    y: "Protein_Change",      // amino-acid changes
    factor: "Mutation_Class", // classify mutations by certain factor (optional)
};

var pfam_data = {  
   "hgnc_symbol":"TP53",
   "protein_name":"tumor protein p53",
   "uniprot_id":"P04637",
   "length":393,
   "pfam":[  
      {  
         "pfam_ac":"PF08563",
         "pfam_start":6,
         "pfam_end":29,
         "pfam_id":"P53_TAD"
      },
      {  
         "pfam_ac":"PF00870",
         "pfam_start":95,
         "pfam_end":288,
         "pfam_id":"P53"
      },
      {  
         "pfam_ac":"PF07710",
         "pfam_start":318,
         "pfam_end":358,
         "pfam_id":"P53_tetramer"
      }
   ]
}


var pfam_data_default_settings = {
    domainType: "pfam",       // key to the domain annotation entries
    length: "length",         // protein length
    details: {
        start: "pfam_start",  // protein domain start position
        end: "pfam_end",      // protein domain end position
        name: "pfam_id",      // protein domain name
    },
};



       // add mutation data
       lollipop.data.snvData = mutation_data;
       // mutation data format settings
       lollipop.format.snvData = mutation_data_default_settings;

       // Pfam domain data
       lollipop.data.domainData = pfam_data;
       // Pfam data format settings
       lollipop.format.domainData = pfam_data_default_settings;

       // set up more chart options ...


       lollipop.options.chartType = "circle";




       // draw lollipop
       //lollipop.draw();

        console.log("SHOWSEQUENCE: DONE");
        
     },

     showXref: function( tgt, format, data ){
       var cval = this.getVal( data, format.vpath);
       console.log("XREF: cval=" + cval);
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
             console.log( "XREF:" +  JSON.stringify(cval[i]) );
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
       $( tgt ).append( "<div>"+format.name+ ": " + format.type + "</div>" );
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
       console.log("\n\nCV2 called");
       console.log("CV2: path=" + JSON.stringify(path));
       var cval = []; 
       if( Array.isArray(data) ){
          cval = data;
       } else {
          cval = [data];
       }
       console.log("CV2: cval: " + JSON.stringify(cval));
       var rval = [];
       for( var k =0; k < cval.length; k ++ ){
          console.log("CV2:  going over cval element # " + k ); 
          console.log( "XXX " + path[0] + " ::: " + JSON.stringify(cval[k][path[0]]));
          rval = rval.concat( cval[k][path[0]]);
          console.log("rval.length=" + rval.length);
       }
       
       if( path.length == 1 ){ // end of path: return values
          console.log("LAST PASS: " + JSON.stringify(rval)); 
          return rval;
       } else {
          console.log("NEXT LEVEL: " + JSON.stringify(rval));
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
    }

};
