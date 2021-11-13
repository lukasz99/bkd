console.log("bkd-report-jq: common");

BKDrep = {
    srcAnchor: null,
    tgtAnchor: null,
    valAnchor: null,
    
    fxList: null,
    frList: null,

    ns: null,
    ac: null,
    query: null,
    qmode: null,

    init: function( data, srcAnchor, tgtAnchor, valAnchor, mode){
        $( "#report" ).hide();
        BKDrep.view( data, srcAnchor, tgtAnchor, valAnchor, mode);
    },
    
    view: function(data, srcAnchor, tgtAnchor, valAnchor, mode){
        $( "#report" ).hide();    
        this.srcAnchor=srcAnchor;
        this.tgtAnchor=tgtAnchor;
        this.valAnchor=valAnchor;
        
        if(data == null ){
            BKDrep.search( data, this.srcAnchor );
            $( tgtAnchor ).hide();
            BKDrep.valEdit(data, this.valAnchor);
        } else if(data.qmode !== undefined && data.query !== undefined){

           this.qmode =data.qmode;
           this.query =data.query;

           BKDrep.search( data, this.srcAnchor );
           $( tgtAnchor ).hide();           
           //BKDrep.valEdit(data, this.valAnchor);
           $( valAnchor ).hide();
        } else {            
            BKDrep.tgtView( data, this.tgtAnchor, mode );
            if( mode == 'edit'){
                BKDrep.valEdit( data, this.valAnchor );
            } else {
                BKDrep.valView( data, this.valAnchor );
            }
        }
    },

    search: function( data, tgtAnchor ){        
    
        if( data  !==  undefined && data != null ){
           if( "node" == data.qmode ){
             $("input[name='report_smodenode'][value='node']").prop('checked', true);
           }
           if( "report" == data.qmode ){
             $("input[name='report_smodereport'][value='report']").prop('checked', true);
           }
           formData = {
                    query: data.query,
                    ns: "",
                    ac: "",
                    qmode: data.qmode,
                    ret: "data"
                };
                        
            $.ajax({
                type: "POST",             
                url: "search",
                data: formData,
                dataType: "json",
                encode: true,}).done(function (data) {
                    
                    if( data.rdata != null && data.rdata.length > 0){
                        BKDrep.searchView( data.rdata, BKDrep.srcAnchor, "edit" );                       
                    }else if(data.record !== null){
                        BKDrep.searchView( data.rdata, BKDrep.srcAnchor, "edit" );
                        BKDrep.tgtView( data.record, BKDrep.tgtAnchor, "edit" );
                        BKDrep.valEdit( data.record, BKDrep.valAnchor );
                    } else {
                           //alert(BKDrep.query + "::" +BKDrep.qmode);
                          
                           formData = {
                           query: BKDrep.query,
                           ns: "",
                           ac: "",
                           qmode: "node",
                           ret: "data"
                           };
                                                
                           $.ajax({
                             type: "POST",             
                             url: "search",
                             data: formData,
                             dataType: "json",
                             encode: true,}).done(function (data) {
                                //alert(JSON.stringify(data));
                               if( data.rdata != null && data.rdata.length > 0){
                                  BKDrep.searchView( data.rdata, BKDrep.srcAnchor, "edit" );                       
                               }else if(data.record !== null){
                                  BKDrep.searchView( data.rdata, BKDrep.srcAnchor, "edit" );
                                  BKDrep.tgtView( data.record, BKDrep.tgtAnchor, "edit" );
                                  BKDrep.valEdit( data.record, BKDrep.valAnchor );
                               }
                           });

                    }
                });
            
       } else {

        $(tgtAnchor + " form").submit( function (event) {
            
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
            } else{
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
                //url: "report",
                url: "search",
                data: formData,
                dataType: "json",
                encode: true,}).done(function (data) {
                    
                    if( data.rdata != null && data.rdata.length > 0){
                        BKDrep.searchView( data.rdata, BKDrep.srcAnchor, "edit" );                       
                    }else if(data.record !== null){
                        BKDrep.searchView( data.rdata, BKDrep.srcAnchor, "edit" );                                       
                        BKDrep.tgtView( data.record, BKDrep.tgtAnchor, "edit" );
                        BKDrep.valEdit( data.record, BKDrep.valAnchor );
                    }
                });
            
            event.preventDefault();
        });
      } 
    },
    
    searchView: function(data, srcAnchor, mode ){
          
        var tid="bkd-search-table";
        $('#bkd-search-result').remove();
        $(srcAnchor).append( "<div id='bkd-search-result'><hr/><table id='"
                             + tid
                             + "' cellspacing='0' cellpadding='0' class='bkd-search-table'></table></div>");
                             
        $('#' + tid).append("<tr class='bkd-rep-fld bkd-search-table-header'>"+
        
                            "<th width='5%' align='center'>Report&nbsp;ID</th>"+
                            "<th width='10%' align='center'>Gene/Protein</th>"+
                            "<th >Full Name</th>"+
                            
                            "<th width='15% 'align='center'>Feature Type</th>"+
                            "<th width='15%'>Feature Name</th>"+
                            
                            "<th width='10%' align='center'>Report Type</th>"+
                            "<th width='5%'>&nbsp;</th>"+
                            "</tr>");
        for(var i=0; i<data.length; i++){
            var cdata = data[i];

            console.log("CDATA:"+ JSON.stringify(cdata));

            if( cdata.feature !== undefined){

            var rid = cdata.ac +'_Edit';
            var crow = "<td align='center'>" + cdata.ac + "</td>" +
                "<td align='center'>" + cdata.feature.node.label + "</td>" + 
                "<td>" + cdata.feature.node.name + "</td>" +
                
                "<td align='center'>" + cdata.feature.cvType.name + "</td>" +                               
                "<td align='center'>" + cdata.feature.label + "</td>" +
                
                "<td align='center'>" + cdata.cvType.name + "</td>" +
                
                "<td align='center'><input type='button' id='"+rid+"' value='Edit Report'/></td>";
            
            $('#' + tid).append("<tr> class='bkd-rep-fld'>"+crow+"</tr>");
            
            $( "#" + rid ).on( 'click', function(event){
                var prefix= event.currentTarget.id.replace('_Edit','');
                var elink="report?ns=cvdb&ac="+prefix+"&mode=edit";
                location.href = elink;
                
            });
            }
            
        }
        $('#' + tid).append("<tr class='bkd-rep-fld bkd-search-table-footer'>" +
                            " <td colspan='1'>&nbsp;</td>\n" +
                            " <td colspan='1' align='center'>\n"+
                            "  <select id='bkd_report_new_target'>\n"+
                            "  </select>\n"+  
                            " </td>\n" +
                            " <td colspan='3'>&nbsp;</td>\n" +
                            " <td colspan='1' align='center'>\n"+
                            "  <select id='bkd_report_new_type'>\n"+
                            "  </select>\n"+  
                            " </td>\n" +

                            " <td><input type='button' id='bkd_report_new' value='New Report'/></td>\n"+
                            "</tr>\n");
        var reports = BKDconf.report.feature;                    
        for(var r in reports ){
            console.log(r);
            if( reports[r].active ){
              $("#" + "bkd_report_new_type")
                  .append( $('<option>',{ val:reports[r].cvType.ac,
                                          text:reports[r].label}));
            }
        }
        
        console.log("DATA: "+ data);
        for(var i =0; i< data.length; i++){
            if(data[i].feature !== undefined){
              console.log(data[i].feature.node.ac);
              $("#" + "bkd_report_new_target")
                  .append( $('<option>',{ val:data[i].feature.node.ac,
                                          text:data[i].feature.node.label}));
            } 
            if(data[i].cvType !== undefined && data[i].cvType.name=="protein"){
              // console.log(data[i].label);
              $("#" + "bkd_report_new_target")
                  .append( $('<option>',{ val:data[i].ac,
                                          text:data[i].label}));
            }         
        }
        //$("#" + "bkd_report_new_target")
        //        .append( $('<option>',{ val:"CVDB-4P",
        //                                text:"KCNK1_HUMAN"}));

        $( "#" + "bkd_report_new" ).on( 'click', function(event){
            console.log( "Target: " + $("#" + "bkd_report_new_target").val() );
            console.log( "RType: " + $("#" + "bkd_report_new_type").val() );
            
            var tgt = $("#" + "bkd_report_new_target").val();
            var rtp = $("#" + "bkd_report_new_type").val();

            //alert(tgt + " || " + rtp);

            //Bkdconf.report.feature            

            /// report?ns=cvdb&ac=CVDB2R&op=new&rtype=dxf:0096&mode=edit
            var report = "report?ns=CVDB&ac="+tgt+"&rtype="+rtp+"&op=new&mode=edit";
            location.href = report;
           /*
            try{
                $.ajax({
                    type: "POST",               
                    url: report
                }).done(function (data) {
                    if( data.record != null ){
                       
                       var nrep = data.record;

                       // clear ns/ac 
                       nrep.ns = null;
                       nrep.ac = null;
                       
                       // set report type
                       var tpac = $("#" + "bkd_report_new_type").val();            
                       
                       var reports = BKDconf.report.feature;
                       for(var r in reports ){
                          if(reports[r].cvType.ac == tpac){
                             nrep.cvType = reports[r].cvType;
                             break;
                          }
                       }

                       console.log( "NEW Report:" + JSON.stringify(nrep.cvType) );                     
                       
                       //BKDrep.searchView( data.rdata, BKDrep.srcAnchor, "edit" );                   
                    
                        $(BKDrep.srcAnchor).hide();
                        BKDrep.tgtView( {report:nrep}, BKDrep.tgtAnchor, "edit" );
                        BKDrep.valEdit( {report:nrep}, BKDrep.valAnchor, "edit" );
                        $(BKDrep.tgtAnchor).show();
                        $(BKDrep.valAnchor).show();

                    } else if(data.record !== null){
                        //BKDrep.tgtView( data.record, BKDrep.tgtAnchor, "edit" );
                        //BKDrep.valEdit( data.record, BKDrep.valAnchor );
                    }
                });
              
              
                console.log("done...");
            } catch(ex){
                console.log( "error..");
            }
             */   
        });
        
    },

    tgtView: function(data, tgtAnchor, mode ){
        
        if( data == null ){
          $( tgtAnchor ).hide();
        } else {
          $( tgtAnchor ).show();
        }

        console.log("DATA:" + JSON.stringify(data));
        console.log(" CVTYPE:" + data.report.cvType.name);
        
        var flist = BKDconf["report"]["feature"][data.report.cvType.name].target;
        console.log(" CVTYPE:" + JSON.stringify(data.report.cvType.name));
        console.log(" FLIST:" + JSON.stringify(flist));
        
        // report accession
        //-----------------
        
        var rac = BKDconf["report"]["feature"][data.report.cvType.name]["ac"];
        var racval ="";
        var racpath = rac["vpath"];
        var cval = data.report;        
          
        console.log("PATH:" + JSON.stringify(racpath));

        for(var j=0; j<racpath.length; j++){
          console.log("CVAL: " + racpath[j] + " : " + cval[ racpath[j]] );
          cval = cval[ racpath[j] ];
        }
        
        $(tgtAnchor).append( "<input id='" + rac["id"] + "'" +
                                     "class='bkd-report' />");

        cel = $("#" + rac["id"] )
        cel.val(cval);
        cel.attr('type','hidden'); 
         
        // go over configuration
        //----------------------
        
        for( var i = 0; i < flist.length; i++){

          var fname = flist[i].name;
          console.log( "NAME: " + fname + " : list:" + flist[i].list +
                       " css: " + flist[i]["css-class"] + " value:" + flist[i].value);
          
          if( flist[i].list ){   // config field is a list            
            
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

                if( flist[i]["css-class"] !== undefined ){
                  cclass="bkd-rep-fld " + flist[i]["css-class"]; 
                } else {
                  cclass="bkd-rep-fld"
                }

                // header/body for value list

                $(tgtAnchor).append("<div class='bkd-rep-fld'>\n"+
                                    " <div class='" + cclass + "' id='"+flist[i].id+"_head'>"+fname+" [<a class='bkd-act'>show/hide</a>]  </div>\n"+
                                    " <div class='bkd-rep-fld' id='"+flist[i].id+"_body'/>\n"+
                                    "</div>");

                $( "#" + flist[i].id + "_head").on('click',function(event){
                   $( "#"+event.currentTarget.id.replace('_head','_body')).toggle();
                   //$( "#"+event.currentTarget.id).toggle();
                   event.stopPropagation();
                   
                });

                if( flist[i].collapse ){
                   $("#" + flist[i].id + "_body").hide();
                }

                for(var v = 0; v <fvlist.length; v ++){

                  // one line for each list value

                  var cval = fvlist[v];                   
                  if(flist[i].type == "xref"){
                  
                     var cel = BKDlink.xrefType(cval);  
                     
                     $( "#" + flist[i].id + "_body" )
                       .append(" <div class='bkd-rep-fld'> "+cel+"</div>\n");

                  } else {
                     $( "#" + flist[i].id + "_body" )
                       .append(" <div class='bkd-rep-fld'> "+cval.ns +": "+cval.ac+"</div>\n");
                  }                 
                }
              }  
            // done: vpath present -  show as list 
            } else if( flist[i].value ){  // no vpath: list of complex values (ie feature)

              var fname = flist[i].name;
              console.log(" feature: " + fname);
              // list header

              if( flist[i]["css-class"] !== undefined ){
                cclass="bkd-rep-fld " + flist[i]["css-class"]; 
              } else {
                cclass="bkd-rep-fld"
              }

              $(tgtAnchor).append("<div class='bkd-rep-fld'>\n"+
                                  " <div  class='" + cclass + "'>" + fname + "</div>\n"+
                                  "</div>");

              for( var k=0; k < flist[i].value.length; k++ ){  // go over fields
               
                // go over complex fields

                var cname = flist[i].value[k].name;
                var cvpath = flist[i].value[k].vpath;
                var cvedit = flist[i].value[k].edit;
                var cvid = flist[i].value[k].id;
               
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
              
                if( flist[i].value[k].list ){  // feature: list of values


                  if( flist[i].value[k]["css-class"] !== undefined ){
                    cclass="bkd-rep-fld " + flist[i].value[k]["css-class"]; 
                  } else {
                    cclass="bkd-rep-fld"
                  }
                                    
                  if( cval !== null ||
                    (flist[i].value[k].edit && mode == 'edit') ){  //edit 

                    $( tgtAnchor + " >div:last")   
                       .append(" <div class='bkd-rep-fld' id='"+flist[i].value[k].id+"'>\n" +
                               "   <div class='" + cclass + "'>" + cname + "</div>\n" +
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
                        
                } else {  // feature: simple value (eg feature parameters)

                  console.log("  feature: simple value here...");          
                  if(cvedit && mode == 'edit'){  // set up edit field

                    if( flist[i].value[k].type =="cvterm" ){

                      // build cvterm  menu
                      var cvtsel ="<select id='"+flist[i].value[k].id+"_ac' class='bkd-report'>";
                      for(var n = 0; n< flist[i].value[k]["cvt-list"].length; n++){
                       cvtsel = cvtsel +"<option value='" +
                           flist[i].value[k]["cvt-list"][n].ac+"'>" +
                           flist[i].value[k]["cvt-list"][n].label+"</option>";
                      }
                      cvtsel = cvtsel + "</select>";

                      $( tgtAnchor + " > div:last-child ")   
                          .append(" <div class='bkd-rep-fld'>" + cname +": " + 
                                  cvtsel + 
                                  " </div>\n");

                      if( cval !== null){ 
                        var cvtvalue = cval.ac; 
                        var cvtname = cval.name;

                        $( "#" + flist[i].value[k].id +"_ac  option[value='"+cvtvalue+"']" ).attr("selected",true);
                        $( "#" + flist[i].value[k].id +"_ac" ).val(cvtvalue);
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


             if( flist[i]["css-class"] !== undefined ){
                cclass="bkd-rep-fld " + flist[i]["css-class"]; 
              } else {
                cclass="bkd-rep-fld"
              }

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
                   $(tgtAnchor).append("<div class='" + cclass + "'>"+fname+ ":"+ fval +"</div>");
                 }else if( flist[i].type == 'hidden'){
                   console.log("AC");
                   $(tgtAnchor).append( "<input type='hidden' class='bkd-rep-fld bkd-report' id='"+flist[i].id+"'/>");
                   $("#" + flist[i].id).val(fval);
                 }
               } else {  // string value                 
                 if( flist[i].edit && mode == 'edit' ){
                   $(tgtAnchor).append("<input type='text' size='32' maxlength='64' class='bkd-rep-fld'>"+fval+"</input>");   
                 } else {
                   $(tgtAnchor).append("<div class='" + cclass +"'>"+fname+ ": "+fval+"</div>");
                 }
               }
             }
          } 
        }
      },
      
      valView: function(data,valAnchor ){
      
        if( data == null ){
            $( valAnchor).hide();
        } else {
            $( valAnchor ).show();
        }

        var flist = BKDconf["report"]["feature"]["protein"]["value"];
        for( var i = 0; i < flist.length; i++){
          var fname = flist[i].name;
          if( data['report-value'][flist[i].value] ){
                     
              fval = data['report-value'][flist[i].value]['value'];
              $(valAnchor).append("<div class='bkd-rep-fld'>\n"+
                                  " <div class='name'>"+ fname+"</div>\n"+
                                  " <div class='value'>"+fval+"</div>\n"+
                                  "</div>\n");
          }
        }
      },

      valEdit: function( data, valAnchor ){
      
        if( data == null ){   
            $( valAnchor).hide();
        } else {
            $( valAnchor ).empty();
            $( valAnchor ).show();            
        }

        $(valAnchor).append("<form id='rep-val' name='report'" +
                    " action='report.action' method='post'>"); 
        
        var flist = [];
        if( data != null && data.report != null ){
          var repTp = data.report.cvType;          
          $( valAnchor +" > form" )
                .append( "<input id='report_type_ns' class='bkd-report' type='hidden'/>" );
          $("#report_type_ns" ).val(repTp.ns);

          $( valAnchor +" > form" )
                .append( "<input id='report_type_ac' class='bkd-report' type='hidden'/>" );
          $("#report_type_ac" ).val(repTp.ac);

          $( valAnchor +" > form" )
                .append( "<input id='report_type_name' class='bkd-report' type='hidden'/>" );
          $("#report_type_name" ).val(repTp.name);

          var reports = BKDconf.report.feature;
          for(var r in reports ){           
            if( reports[r].cvType.name == repTp.name){
                console.log("r: format found !!!");
              flist = reports[r].value;
              break;
            }
          }
        }

        for( var i = 0; i < flist.length; i++){
          
          var flabel = flist[i].name;         
          var fname = flist[i].value;
          var fid = flist[i].id;
          var fdata = '';
          
          if( data!== null && data['report-value'] != null &&
              data['report-value'][flist[i].value] !=null ){
              fdata = data['report-value'][flist[i].value]['value'];
          }              

          if( flist[i].type == "label"){

            $( valAnchor +" > form " ).append( "<div class='bkd-rep-fld'>\n"+
                                               " <div class='name'>"+ flist[i].label+"</div>\n"+
                                               "</div>" );          

            $( valAnchor +" > form > div:last" )
                 .append( "<input id='" + fid + "' class='bkd-report' type='hidden'/>" );
            $("#" + fid ).val(flist[i].value);
          } else if(flist[i].type =="text" ){

            $( valAnchor +" > form " ).append( "<div class='bkd-rep-fld'>\n"+
                                               " <div class='name'>"+ flabel+"</div>\n"+
                                               "</div>" );          

            $( valAnchor +" > form > div:last" )
               .append( "<textarea name='" + fname +"'" +
                            " ns='" + flist[i].ns + "' ac='" + flist[i].ac + "' " +
                            " cols='128' rows='4'" +
                            " value='' id='" + fid  +"' class='bkd-report'/>" );
          }
          
          if( data == null){
            $( valAnchor +" > form #" + fid )
               .attr('disabled','disabled');
          } else {
            if( data != null && fdata.length > 0){
              $( valAnchor +" > form #" + fid )
                 .val(fdata);
            }
          }
        }

        $( valAnchor +" > form > div:last" )
           .append("<div><input type='button' id='" + "report_submit" + "'/></div>\n");
        $( "#"+"report_submit").attr('value', 'Submit Report');
        $( "#" + "report_submit" ).on( 'click', function(event){
            
            BKDrep.postData = { "report_type": repTp } ; 
            
            $( ".bkd-report").each( function( index, el ){
                try{              
                  BKDrep.postData[el.id] = el.value;

                  if( el.getAttribute("ns") ) BKDrep.postData[el.id +"_ns"] = el.getAttribute("ns"); 
                  if( el.getAttribute("ac") ) BKDrep.postData[el.id +"_ac"] = el.getAttribute("ac"); 

                }catch(err){
                  console.log( "ERR:" + el.id + " : " + el );
                }
             });
             
             $.ajax({
                type: "POST",
                url: "report",
                data: {reportJson: JSON.stringify(BKDrep.postData),
                       op:"update",
                       mode:"json"},                    
                dataType: "json",
                encode: true}).done( function(data){});

             setTimeout(function() {
               window.location.href = 'report?qmode=report&query='+BKDrep.postData.report_target_ac;
             }, 250);  
             
          });
                                           
      },
      
      rangeEdit:  function( cel, cvid, cval ){
        
        var apos = " <div id='bkd_rpos' class='bkd-hcomp'>Position: <input type='text' id='" + cvid + "_pos'/></div>\n";
 
        var arng = " <div id='bkd_rrng' class='bkd-hcomp'>From: <input type='text' id='" + cvid + "_from'/>" +
                   " To: <input type='text' id='" + cvid +  "_to'/></div>\n";
        
        var aseq = " <div class='bkd-hcomp'> Sequence(if modified): <input type='text' id='" + cvid +  "_sequence'/></div>\n";
       
        var arad = "<div class='bkd-hcomp'> <input type='radio' id='bkd_psel' name='bkd-prsel' value='pos' checked>" +
                     " <label for='bkd-psel'>position</label>\n" +
                     "<input type='radio' id='bkd_rsel' name='bkd-prsel' value='rng'>" +
                     " <label for='bkd-rsel'>range</label></div>\n";                     

        var divAdd = "<div class='bkd-rep-fld bkd-hcont'>" +
                     apos +
                     arng +
                     "<div class='bkd-hcomp'> || </div>" + arad +                     
                     "<div class='bkd-hcomp'> || </div>" + aseq +
                     "<div class='bkd-hcomp'> <input type='button' id='" + cvid + "_add'/></div>" +
                     "</div>";  

       console.log(divAdd);
       $( "#" + cel.id ).append( divAdd );
       $('#bkd_rrng').hide();
       
       $('#bkd_psel').on( 'click',
                           function () {           
                             $('#bkd_rpos').show();
                             $('#bkd_rrng').hide();
                                                   
                            }
                        );

       $('#bkd_rsel').on( 'click',
                          function () {
                            $('#bkd_rpos').hide();
                            $('#bkd_rrng').show();                    
                          }
                        );
        
       $( "#" + cel.id + "_add" ).attr('value', 'Add' );       

       $( "#" + cel.id + "_add" ).on( 'click',
                                       function (event) { 
                                          var prefix= event.currentTarget.id.replace('_add','_');

                                          var sfr = $("#"+event.currentTarget.id.replace('_add','_from')).val();
                                          var sto = $("#"+event.currentTarget.id.replace('_add','_to')).val();
                                          var sps = $("#"+event.currentTarget.id.replace('_add','_pos')).val();
                                          var seq = $("#"+event.currentTarget.id.replace('_add','_sequence')).val();

                                          var ifr = Number( sfr.replace( '.', '' ) );
                                          var ito = Number( sto.replace( '.', '' ) );
                                          var ips = Number( sps.replace( '.', '' ) );

                                          var rsh = true;
                                          if( $("#bkd_rrng").is(":hidden") ) {
                                             rsh = false;
                                             ifr = ips;
                                             ito = ips;
                                             $("#"+event.currentTarget.id.replace('_add','_from')).val("");
                                             $("#"+event.currentTarget.id.replace('_add','_to')).val("");
                                             sfr = "";
                                             sto = "";

                                          }
                                          var psh = true;                                         
                                          if( $("#bkd_rpos").is(":hidden") ) {
                                             psh = false;
                                             $("#"+event.currentTarget.id.replace('_add','_pos')).val("");
                                             sps= "";
                                          }

                                          //alert(rsh + " : " + psh);

                                          BKDrep.frlist = []

                                          $(".bkd-range").each( function( index, elem){
                                                                  BKDrep.frlist.push( elem.id );                                 
                                                                });

                                          var fmax = 0;

                                          for(var x=0; x < BKDrep.frlist.length; x++ ){                              
                                             var icur = Number( BKDrep.frlist[x].replace( prefix, '' ) ); 
                                             if(  icur > fmax ){
                                               fmax = icur;
                                             }
                                          }

                                          fmax = fmax + 1;
                                          var cid = prefix + fmax;
                                          
                                          var crange = "";

                                          if(ifr != ito){
                                             crange = " From: " + ifr + " To: " + ito + " || Seq: "+ seq;  
                                          } else {
                                             crange = " Position: " + ifr + " ||  Seq: "+ seq;  
                                          }
                                          var chid ="<input type='hidden' id='"+prefix+fmax+"_from'/>"+
                                          "<input type='hidden' id='"+prefix+fmax+"_to'/>"+
                                          "<input type='hidden' id='"+prefix+fmax+"_sequence'/>";

                                          $( "#" + event.currentTarget.id.replace('_add','') )
                                              .append( " <div class='bkd-rep-fld bkd-range' id='" + cid + "'>"+ crange + chid +
                                                       "  <input type='button' id='"+cid+"_drop'/>"+
                                                       " </div>\n");
                                          $('#'+prefix+fmax+'_from').val(ifr).addClass("bkd-report");
                                          $('#'+prefix+fmax+'_to').val(ito).addClass("bkd-report");
                                          $('#'+prefix+fmax+'_sequence').val(seq).addClass("bkd-report");                                 

                                          $("#"+cid+"_drop").attr('value', 'Drop');
                                          $("#"+cid+"_drop").on( 'click', function (event) {
                                                var idDrop = event.currentTarget.id.replace("_drop","");
                                                $("#" + idDrop ).remove();
                                       });
      
                                      });
       
         // add already existing
        for( var r = 0; r < cval.length; r++){ 
          
          var ctx ="";
          var cid= cel.id +"_" + r;

          if( cval[r].start != cval[r].stop ){
             ctx = "From: " + cval[r].start + " To: "+ cval[r].stop;  // + " Seq: " +  cval[r].sequence;
          } else {
             ctx = "Position: " + cval[r].start; // " Seq: "+ cval[r].sequence;
          }

          if( cval[r].sequence.length > 0){
             ctx += " || Seq: " + cval[r].sequence;
          }
          
          $( "#" + cel.id ).append( "<div id='" + cid + "' class='bkd-rep-fld bkd-range'>" + ctx +
                                    "\n<input type='button' id='" + cid + "_drop'/></div>\n</div>" );
          
          $("#"+ cid).append("<input type='hidden' id='" + cid + "_from' class='bkd-report' />" );
          $("#" + cid + "_from").val(cval[r].start);
          
          $("#"+ cid).append("<input type='hidden' id='" + cid + "_to' class='bkd-report' />" );
          $("#" + cid + "_to").val(cval[r].stop);
          
          $("#"+ cid).append( "<input type='hidden' id='" + cid + "_sequence' class='bkd-report' />"); 
          $("#" + cid + "_sequence" ).val( cval[r].sequence );
          
          $("#"+cid+"_drop").attr('value', 'Drop');
          $("#"+cid+"_drop").on( 'click', function (event) {
              var idDrop = event.currentTarget.id.replace("_drop","");
              $("#" + idDrop ).remove();
           });
        }              
      },
 
     rangeHidden: function( cel, cvid, clist, m ){
        
       // cel=flist[i].value[k]
       
       var cid = cvid + "_" + m;
       var crange = " From: " + clist[m].start +
                    " To: " + clist[m].stop +
                    " Seq: " + clist[m].sequence;  
        
       $( tgtAnchor + " > div:last-child > div:last-child")
         .append(" <div class='bkd-rep-fld bkd-range' id='"+cid+"'>"+ crange + " <input type='button' id='"+cid+"_drop'/></div>\n");
       $("#"+ cid).append("<input type='hidden' id='"+cid+"_start' class='bkd-report' />");
       $("#" + cid + "_start").val(clist[m].start); 
       $("#"+ cid).append("<input type='hidden' id='"+cid+"_stop' class='bkd-report' />");
       $("#" + cid + "_stop").val(clist[m].stop);
       $("#"+ cid).append("<input type='hidden' id='"+cid+"_sequence' class='bkd-report' />"); 
       $("#" + cid + "_sequence").val(clist[m].start);
       
       $("#"+cid+"_drop").attr('value', 'Drop Range');
       $("#"+cid+"_drop").on( 'click', function (event) {
           var idDrop = event.currentTarget.id.replace("_drop","");
           $("#" + idDrop ).remove();
         });                                   
      },

      xrefEdit:  function( cel, cvid, cval ){

         // build xref-ns menu
         var xnsel = "<select id='"+cel.id+"_ns'>";
         for(var n = 0; n< cel["xref-ns"].length; n++){
            xnsel = xnsel + "<option value='"+cel["xref-ns"][n]["ns"]+"'>"+cel["xref-ns"][n].label+"</option>";
         }
         xnsel = xnsel + "</select>";

         // build xref-type menu                            
         var xtsel ="<select id='" + cel.id+"_type'>";
         for(var n = 0; n< cel["xref-type"].length; n++){
            xtsel = xtsel +"<option value='"+cel["xref-type"][n].ac+"'>"+
                     cel["xref-type"][n].label+"</option>";
         }
         xtsel = xtsel + "</select>";

         var divAdd = " <div class='bkd-rep-fld'>" + 
                      xtsel + " " + xnsel + 
                      "  <input type='text' id='" + cel.id+"_ac'/> " + 
                       
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
            var xtlbl =""; 
            for(t=0; t< cel["xref-type"].length;t++){
              console.log(t+" : " +cel["xref-type"][t]);
              if(cel["xref-type"][t].ac == xtac){
                 xtns = cel["xref-type"][t]["ns"];
                 xtnm = cel["xref-type"][t]["name"];
                 xtlbl = cel["xref-type"][t]["label"];
              }
            }

            BKDrep.fxlist = [];

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
                         xtlbl + ": " + cval + chid +
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
          console.log("XLNK:" + xlnk + "CVT:" + JSON.stringify( cval[x].cvType ) );           
          console.log("CVTLST:");

          var xtac = cval[x].cvType.ac;
          var xtlbl ="";
          for(t=0; t< cel["xref-type"].length;t++){
            console.log(t+" : " + cel["xref-type"][t]);
            if(cel["xref-type"][t].ac == xtac){
               xtns = cel["xref-type"][t]["ns"];
               xtnm = cel["xref-type"][t]["name"];
               xtlbl = cel["xref-type"][t]["label"] +": ";
            }
          }

          $( "#" + cel.id ).append( "<div id='" + cid + "' class='bkd-rep-fld bkd-range'>" + xtlbl + xlnk +
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
        
        var cval = BKDlink.xrefType( clist[m] );
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
     }
};
