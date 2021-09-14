BKDnode = {
  nodeAnchor: null,
  srcAnchor: null,
  flist: null,

  init: function( data, srcAnchor, nodeAnchor, flist, mode){
    BKDnode.view( data, srcAnchor, nodeAnchor, flist, mode);
  },

  view: function(data, srcAnchor, nodeAnchor, flist, mode){
         
    this.srcAnchor=srcAnchor;
    this.nodeAnchor=nodeAnchor;
            
    if(data == null ){
      $( nodeAnchor ).hide();            
      BKDnode.search( data, node.srcAnchor );
      $( srcAnchor ).show();            
    }else{
      $( srcAnchor ).hide();            
      BKDnode.nodeView( data, this.nodeAnchor, flist, mode );
      $( nodeAnchor ).show();
    }
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

  searchView: function(data, srcAnchor, mode ){
  
    var tid="bkd-search-table";
    $('#' + tid).remove();
    $(srcAnchor).append( "<div class='bkd-search'><hr/><table id='" + tid + "' class='bkd-search-table'></table></div>");
    $('#' + tid).append("<tr> class='bkd-rep-fld'>"+
                                  "<th width='5%'>ID</th>"+
                                  "<th width='10%'>Type</th>"+
                                  "<th width='10%'>Accession</th>"+
                                  "<th width='10%'>Species</th>"+
                                  "<th width='10%'>Name</th>"+
                                  "<th >Description</th>"+
                                  "<th width='5%'>&nbsp;</th>"+
                                "</tr>");
    for(var i=0; i<data.length; i++){
               var cdata = data[i];
               var rid = cdata.ac +'_View';
               var crow = "<td>" + cdata.ac + "</td>" +
                          "<td>" + cdata.cvType.name + "</td>" + 
                          "<td align='center'>" + cdata.ac + "</td>" +
                          "<td align='center'>" + cdata.label + "</td>" +
                          "<td align='center'>" + cdata.name + "</td>" +
                          "<td align='center'>" + cdata.label + "</td>" +
                          "<td align='center'>" +
                          "<input type='button' id='"+rid+"' value='View'/>"+
                          "</td>";
                          
               $('#' + tid).append("<tr> class='bkd-rep-fld'>"+crow+"</tr>");

               $( "#" + rid ).on( 'click', function(event){
                    var prefix= event.currentTarget.id.replace('_View','');
                    var elink="node?ns=cvdb&ac="+prefix+"&mode=view";
                    location.href = elink;                    
                  });

    }
  },

  nodeView: function(data, nodeAnchor, format, mode ){
    
    console.log( "NA: " + nodeAnchor );
    console.log( "FL: " + JSON.stringify(format) );

    // node accession
    //---------------
        
    var rac = format["ac"];
    var racval ="";
    var racpath = rac["vpath"];
    var cval = data;        
                
    for(var j=0; j<racpath.length; j++){
      console.log("CVAL: " + racpath[j] + " : " + cval[ racpath[j]] );
      cval = cval[ racpath[j] ];
    }
    
    if( rac["id"] != null){           
      $(nodeAnchor).append( "<input id='" + rac["id"] + "'" +
                            "class='bkd-report' />");
    
      cel = $("#" + rac["id"] )
      cel.val(cval);
      cel.attr('type','hidden');
    }

    // fields (if present)

    if( format.field != null){
       for( var f = 0; f<format.field.length; f++){
         var cfield = format.field[f];
         console.log("FIELD: " + cfield.name + " :: " + cfield.type);

         switch( cfield.type ){
           case "text":
             this.showText( nodeAnchor, cfield, data );    
             break;
           
           case "link":
             this.showLink( nodeAnchor, cfield, data );    
             break;
           
           case "xref":
             this.showXref( nodeAnchor, cfield, data );    
             break;
           
           case "taxon":
             this.showTaxon( nodeAnchor, cfield, data );    
             break;

           case "sequence":
             this.showSequence( nodeAnchor, cfield, data );    
             break;
           case "feature":
             this.showFeature( nodeAnchor, cfield, data );    
             break;
           
           default:
             console.log("Unknown format: " + cfield.type);
        }         
      }
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

                $(tgtAnchor).append("<div class='bkd-rep-fld'>\n"+
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
                
              $(tgtAnchor).append("<div class='bkd-rep-fld'>\n"+
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

                    $( tgtAnchor + " >div:last")   
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
                          $( tgtAnchor + " > div:last-child > div:last-child")   
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

                      $( tgtAnchor + " > div:last-child ")   
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
                      $( tgtAnchor + " >div:last")
                        .append(" <div class='bkd-rep-fld'>" + cname + ": <input type='text' id='"+cvid+"' class='bkd-report'/></div>\n");
                      $( '#' + cvid ).val(cval);

                    }
                  } else {                         
                    $( tgtAnchor + " >div:last")
                      .append(" <div class='bkd-rep-fld'>"+cname +": "+cval+"</div>\n");
                  }
                }
              
                if( flist[i].value[k].hidden ){

                      $(tgtAnchor).append( "<input type='hidden' " +
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
                   $(tgtAnchor).append("<div class='bkd-rep-fld'>"+fname+ ":"+ fval +"</div>");                 
                 }else if( flist[i].type == 'hidden'){
                   console.log("AC");
                   $(tgtAnchor).append( "<input type='hidden' class='bkd-rep-fld bkd-report' id='"+flist[i].id+"'/>");
                   $("#" + flist[i].id).val(fval);
                 }
               } else {  // string value                 
                 if( flist[i].edit && mode == 'edit' ){
                   $(tgtAnchor).append("<input type='text' size='32' maxlength='64' class='bkd-rep-fld'>"+fval+"</input>");   
                 } else {
                   $(tgtAnchor).append("<div class='bkd-rep-fld'>"+fname+ ": "+fval+"</div>");
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

       var value = this.getVal( data, format.vpath);
       if( value == null && format.miss == "%DROP%") return;
       
       if( value == null || value.length == 0 ) value = format.miss;
       if( value == null || value.length == 0 ) value = "N/A";

       $( tgt ).append( "<div>"+format.name+ ": " + value + "</div>" );    
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
       
       var value = "";
       for(var i = 0; i*80 < seq.length; i++){
          value += seq.substring(i*80,(i+1)*80) + "<br/>\n";
       }
       $( tgt ).append( "<div><div>"+format.name + "</div><div>" + value + "</div>" );
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
           console.log("CVAL: " + path[j] + " :: " + cval[ path[j]] );
           cval = cval[ path[j] ];
       }
       return cval; 
           
    }


};
