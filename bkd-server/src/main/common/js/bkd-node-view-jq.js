console.log("bkd-node-jq: common");
    
BKDnodeView = {
    myurl: "",
    nodeAnchor: null,
    srcAnchor: null,
    flist: null,
    fldet: null,
    flport: null,
    igvbrowse:null,
    flview: "#swmod",
    paneon: null,
    data: null,
    cpos37: "",
    cpos38: "",
    slist: [],
 
    init: function( ns, ac , srcAnchor, srcViewAnchor, nodeAnchor, flist, mode ){
        console.log( "bkd-node-view-jq: BKDnodeView.init" );
        this.ns = ns;
        this.ac = ac;

        this.srcAnchor=srcAnchor;
        this.srcViewAnchor=srcViewAnchor;
        this.nodeAnchor=nodeAnchor;
        
        if( ns.length > 0 && ac.length >0 ){     // show node
            this.myurl ="node?ns="+ns+"&ac="+ac+"&ret=data&format=json";          
            $.ajax( { url: this.myurl} )
                .done( function(data, textStatus, jqXHR){                  
                    BKDnodeView.view( data.node, BKDconf["node"], mode) } );
        }               
    },

    view: function( data, flist, mode ){
        console.log( "bkd-node-view-jq: BKDnodeView.view" );
        this.data = data;
        
        if(data == null ){
            $( this.nodeAnchor ).hide();            
            BKDnodeSearch.search( data, node.srcAnchor );
            $( this.srcAnchor ).show();            
        }else{
            BKDnodeView.data = data;
            $( this.srcAnchor ).hide();            
            $( this.srcViewAnchor ).hide();            
            BKDnodeView.node( data, this.srcAnchor, this.srcViewAnchor,
                              this.nodeAnchor, flist, mode );
            $( this.nodeAnchor ).show();
        }
    },
    
    node: function(data, srcAnchor, srcViewAnchor, nodeViewAnchor, fmt, mode ){
        
        $(nodeViewAnchor).empty();
        $(nodeViewAnchor).append( "<div id='bkd-hv-field'></div>"
                                  +"<div id='bkd-nv-field'></div>" );
    
        // view type
        //----------

        var tvpath = fmt.type.vpath;
        var vformat = data;
        //console.log(fmt.type.vpath);
        console.log(data);
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
    
        if( format.field != null){
            for( var f = 0; f<format.field.length; f++){
                var cfield = format.field[f];
                //console.log("FIELD: " + cfield.name + ": " + cfield.type);
                
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
                    BKDnodeFeatures.init( "#bkd-hv-field", cfield, this.data, this.myurl );    
                    break;
                    
                default:
                    //console.log("Unknown format: " + cfield.type);
                }         
            }
        }

        // panels/sidebar
        //---------------

        if( format.pane != null && format.pane.length > 0){  

            BKDnodeView.paneon = format.defpane;

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
                    //if(event.currentTarget.id == BKDnodeView.paneon ){
                    //  $(event.currentTarget).removeClass("bkd-sb-entry-on");
                    //} else {
                    //  $(event.currentTarget).removeClass("bkd-sb-entry-off");
                    //}
                });
        
                $("#bkd-sb-"+cid).mouseout( function(event){
                    //if(event.currentTarget.id == BKDnodeView.paneon ){
                    //  $(event.currentTarget).addClass("bkd-sb-entry-on");
                    //} else {
                    //  $(event.currentTarget).addClass("bkd-sb-entry-off");
                    //}
                    $(event.currentTarget).removeClass("bkd-sb-entry-over");
                    
                });
                
                $("#bkd-sb-"+cid).click( function(event){
                    $("#bkd-nv-" + BKDnodeView.paneon).hide();
                    $("#bkd-sb-" + BKDnodeView.paneon).addClass("bkd-sb-entry-off");
                    $("#bkd-sb-" + BKDnodeView.paneon).removeClass("bkd-sb-entry-on");
                    BKDnodeView.paneon = event.currentTarget.id.replace("bkd-sb-","");
                    $("#bkd-nv-" + BKDnodeView.paneon).show();
                    $("#bkd-sb-" + BKDnodeView.paneon).addClass("bkd-sb-entry-on");
                    $("#bkd-sb-" + BKDnodeView.paneon).removeClass("bkd-sb-entry-off");                 
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
                            BKDnodeFeatures.init( "#bkd-nv-"+cid, cfield, data );    
                            break;
                        case "xref":
                            this.showXref( "#bkd-nv-"+cid, cfield, data );    
                            break;
  
                        }
                    }
                }
                
                // select default pane
                //--------------------
                if( cid == BKDnodeView.paneon ){  // select default pane
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
         
         var value = this.getVal2( data, format.vpath);   // values @ vpath
         //console.log("VAL:", JSON.stringify(value));
         if( (value == null || value.length == 0 ) && format.miss == "%DROP%") return;       
         if( value == null || value.length == 0 || value[0].length == 0){
             if( format.miss == "%DROP%") return;
             
             $( tgt ).append( "<div>\n"+ format.name+ ": " +
                              " " + format.miss + "\n"+
                              "</div>\n");
             return;
         }
         
         if( format.condition == null){   // single value
             
             var url = format.url.replace("%%VAL%%", value);
             $( tgt ).append( "<div>\n"+ format.name+ ": " +
                              "<a target='_blank' href='" + url + "'> [" + value + "</a>]\n"+
                              "</div>\n");
             return;                 
         }
         
         // assumes value is a list, condition is present
        
         var fvlist =[];
         for( var i =0; i < value.length; i ++){                     
             
             for( var j = 0; j < format.condition.length; j++ ){     
                                  
                 cond = format.condition[j];
                 
                 var cval = this.getVal2( value[i], cond.test );  // value: tested attribute                 
                 if( typeof cond.equal  === 'string') {
                     if( cond.equal != null && cond.equal == cval ){
                         var fval = this.getVal2( value[i], format.value );

                         if( cond.equal == 'MIM') {
                             //console.log("MIM: " + JSON.stringify(value[i]));
                             //console.log("MIM format: " + JSON.stringify(format));
                             if( value[i]["type-name"] == 'has-phenotype') fval = null;
                         }
                         
                         if( format.name == 'Canonical protein/transcript') {
                             //console.log("Canon: " + JSON.stringify(value[i]));
                             if( value[i].ns != 'upr') fval = null;
                                 
                         }
                         if( fval != null ){
                             fvlist = fvlist.concat(fval);
                         }    
                     }
                 }
                 
                 if( typeof cond.equal  === 'object' ){
                     var tval = this.getVal2( data, cond.equal);
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
         
         var fval = "";   
         for( var i=0; i <fvlist.length; i++){
             
             var url = format.url.replace("%%VAL%%", fvlist[i]);    
             fval += "<a target='_blank' href='" + url + "'>" + fvlist[i] + "</a>,";
        }
         
         $( tgt ).append( "<div>"+format.name+ ": [" + fval.slice(0,-1) + "]</div>" );

         
     },
     
     showTaxon: function( tgt, format, data ){
       var value = this.getVal( data, format.vpath);
       var sname = value.sciName;

       if(value.comName != null && value.comName.length >0)
            sname += "("+value.comName+")";

       var href = "<a target='_blank' href='" + format.url.replace("%%VAL%%", value.taxid) +"'>"+
                 value.taxid+"</>";
       sname += " ["+ href + "]";       
       $( tgt ).append( "<div>"+format.name+ ": " + sname + "</div>" );
     },

    showSequence: function( tgt, format, data ){
       
        var seq = this.getVal( data, format.vpath);
        console.log("SHOWSEQUENCE: START:", seq);
        
        $( tgt ).append( "<div id='seq-viewer-1' style='width:1640px;'></div>" );
       
        var myurl =this.myurl + "&detail=FEATS";          
        $.ajax( { url: myurl} )
            .done( function(data, textStatus, jqXHR){                  
                
                var anchor = "#seq-viewer-1";
                var msaConfig = {
                    "width": 1620,
                    "height":350,
                    "taxname": {'9606': 'Human' }
                }

                var dtrak = [];
                var cyto = [];
                var membrane = [];
                var extra = [];
                var topology = [];
                var structure = [];
                var ipro = [];  // one track per ipro domain
                
                console.log("DATA:", data.node);
                if( data.node.feature != undefined ){
                    var flst= data.node.feature; 
                    for(var f in flst){
                        console.log("feature", flst[f]);
                        console.log("feature->type:", flst[f]['type-name']);
                        if( flst[f]['type-name'].includes("membra") ){
                            var cdom = {beg:flst[f].range[0].start,
                                        end:flst[f].range[0].stop,
                                        name:'helix',
                                        link: null,
                                        color:"#40FFFF"};
                            membrane.push(cdom);
                        }

                        if( flst[f]['type-name'] == "structure-feature" ){
                            var dname ='';
                            //console.log("feature attr", flst[f].attrs);
                            if( flst[f].attrs != undefined && flst[f].attrs != null){
                                for( var a in flst[f].attrs){
                                    console.log("  attr", a, flst[f].attrs[a]);
                                    var attr = flst[f].attrs[a];
                                    if( attr.name == "description"){
                                        dname = attr.value;
                                    }
                                }
                            }
                            var cdom = {beg: flst[f].range[0].start,
                                        end: flst[f].range[0].stop,
                                        name: dname,
                                        link: null,
                                        color: "#FF4040"};
                            //console.log("cdom", cdom);
                            structure.push(cdom);
                        }

                        if( flst[f]['type-name'] == "topology-feature" ){
                            
                            var dname = '';
                            var dcol = '#808080';
                            if( flst[f].attr != undefined && flst[f].attr != null){
                                //console.log("feature attr", flst[f].attr);
                                for( var a in flst[f].attr){
                                    var attr = flst[f].attr[a];
                                    if( attr.name == "description"){
                                        dname = attr.value;
                                        if( dname == 'Cytoplasmic' ){
                                            dcol = '#40FF40';
                                        }
                                        if( dname == 'Extracellular' ){
                                            dcol = '#4040FF';
                                        }
                                    }
                                }
                            }
                            var cdom = {beg: flst[f].range[0].start,
                                        end: flst[f].range[0].stop,
                                        name: dname,
                                        link: null,
                                        color: dcol};
                            topology.push(cdom);
                            if(dname == 'Cytoplasmic' ){
                                cyto.push(cdom);                                
                            }if(dname == 'Extracellular' ){
                                extra.push(cdom);                                
                            }
                        }

                        if( flst[f]['type-name'] == "domain"){
                            console.log("DOMAIN:",flst[f]);
                            var cf = flst[f];
                            var ipname = "";
                            var cupr = "";
                            var clabel = cf.label;
                            var cname= cf.name;
                            for( var x in cf.xref ){
                                console.log("X:", cf.xref[x])
                                if(cf.xref[x].ns =="ipro"){
                                    ipname = cf.xref[x].ac;
                                    cname = cf.name;
                                } else {
                                    if(cf.xref[x].ns !="upr"){
                                        // pass for now
                                    } else {
                                        cupr = cf.xref[x].ac;
                                    }
                                }
                            }
                            console.log(" IPNAME:",ipname);
                            if( ipname.length > 0 ){  // interpro domain here
                                cipro = { name: ipname, segs:[],
                                          url: "https://www.ebi.ac.uk/interpro/entry/InterPro/"+ipname,
                                          //url: "https://www.ebi.ac.uk/interpro/protein/UniProt/" + cupr + "/#pv-manager"
                                        };
                                cdom = [];
                                for( var r in flst[f].range ){
                                    var cr = flst[f].range[r];
                                    var cdom = {beg: cr.start,
                                                end: cr.stop,
                                                name: clabel + ":" + cname,
                                                link: null,
                                                color: "#408080"};
                                    
                                    cipro.segs.push(cdom);
                                }
                                ipro.push(cipro);
                            }
                        }
                    }
                }
                
                //if(topology.length > 0){
                //    dtrak.push({name: "Topology",
                //                link: null,
                //                dpos: topology});
                //}

                if(extra.length > 0){
                    dtrak.push({name: "Exracellular",
                                link: null,
                                dpos: extra});
                }

                if(membrane.length > 0){
                    dtrak.push({name: "Membrane",
                                link: null,
                                dpos: membrane});
                }
                
                if(cyto.length > 0){
                    dtrak.push({name: "Cytoplasmic",
                                link: null,
                                dpos: cyto});
                }

                console.log("IPRO:",ipro);
                if(ipro.length > 0){
                    for(var i =0; i < ipro.length; i++){
                        dtrak.push( { name: ipro[i].name,
                                      link: ipro[i].url,
                                      dpos: ipro[i].segs } );
                    }
                }

                               
                var msaurl =  "msa-iso/" + BKDnodeView.data.ac + ".fasta";
                BKDnodeView.mymsa = new BkdMSA( msaConfig );

                console.log("DTRAK:", dtrak);
                
                BKDnodeView.mymsa.initialize( { "anchor": anchor,  // '#'+msaid,
                                                "url": msaurl,
                                                "dtrak": dtrak} );
                
                console.log( "SHOWSEQUENCE: DONE" );                
                
            });  
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
     
     getVal: function( data, path ){
       var cval = data;
       for(var j=0; j<path.length; j++){
           //console.log("CVAL: " + path[j] + " :: " + JSON.stringify(cval[ path[j]]) );
           cval = cval[ path[j] ];
       }
       return cval;            
    },

    getVal2: function( data, path ){
        var cval = []; 
        if( Array.isArray( data ) ){
            cval = data;
        } else {
            cval = [data];
        }
        var rval = [];
        for( var k =0; k < cval.length; k ++ ){
            if( cval[k][path[0]] == undefined ){
                return null;
            }
            rval = rval.concat( cval[k][path[0]]);
        }
        
        if( path.length == 1 ){ // end of path: return values
            return rval;
        } else {
            return this.getVal2( rval, path.slice(1) );
        }            
    }

};
